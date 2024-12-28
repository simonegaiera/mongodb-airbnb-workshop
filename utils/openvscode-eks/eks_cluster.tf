
provider "aws" {
  region  = var.aws_region
  profile = "Solution-Architects.User-979559056307"
}

# Create a VPC
resource "aws_vpc" "eks_vpc" {
  cidr_block = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${var.cluster_name}-eks-vpc"
  }
}

# Get availability zones
data "aws_availability_zones" "available" {}

# Create subnets
resource "aws_subnet" "eks_subnet" {
  count                   = 2
  vpc_id                  = aws_vpc.eks_vpc.id
  cidr_block              = element(["10.0.1.0/24", "10.0.2.0/24"], count.index)
  availability_zone       = element(data.aws_availability_zones.available.names, count.index)
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.cluster_name}-eks-subnet-${count.index}"
  }

  depends_on = [ aws_vpc.eks_vpc ]
}

# Create an Internet Gateway
resource "aws_internet_gateway" "eks_igw" {
  vpc_id = aws_vpc.eks_vpc.id

  tags = {
    Name = "${var.cluster_name}-eks-igw"
  }

  depends_on = [ aws_vpc.eks_vpc ]
}

# Create a route table
resource "aws_route_table" "eks_route_table" {
  vpc_id = aws_vpc.eks_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.eks_igw.id
  }

  tags = {
    Name = "${var.cluster_name}-eks-route-table"
  }

  depends_on = [ 
    aws_internet_gateway.eks_igw,
    aws_vpc.eks_vpc
  ]
}

# Associate the subnets with the route table
resource "aws_route_table_association" "eks_subnet_assoc" {
  count = 2
  subnet_id      = element(aws_subnet.eks_subnet.*.id, count.index)
  route_table_id = aws_route_table.eks_route_table.id

  depends_on = [ 
    aws_route_table.eks_route_table,
    aws_subnet.eks_subnet
  ]
}

# Create security groups
resource "aws_security_group" "eks_sg" {
  vpc_id = aws_vpc.eks_vpc.id

  egress {
    from_port   = 53
    to_port     = 53
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 53
    to_port     = 53
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.cluster_name}-eks-sg"
  }

  depends_on = [ aws_vpc.eks_vpc ]
}

# IAM Role for EKS Cluster
resource "aws_iam_role" "cluster" {
  name = "${var.cluster_name}-eks-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = ["sts:AssumeRole", "sts:TagSession"]
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.cluster_name}-eks-cluster-role"
  }
}

# Attach EKS Policy to the Cluster Role
resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  role       = aws_iam_role.cluster.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

resource "aws_iam_role_policy_attachment" "eks_vpc_resource_controller" {
  role       = aws_iam_role.cluster.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSVPCResourceController"
}

# IAM Role for EKS Node Group
resource "aws_iam_role" "node_role" {
  name ="${var.cluster_name}-eks-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = ["sts:AssumeRole", "sts:TagSession"]
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.cluster_name}-eks-node-role"
  }
}

# Attach EKS Policies to the Node Role
resource "aws_iam_role_policy_attachment" "eks_node_policy" {
  role       = aws_iam_role.node_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
}

resource "aws_iam_role_policy_attachment" "eks_cni_policy" {
  role       = aws_iam_role.node_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
}

resource "aws_iam_role_policy_attachment" "eks_registry_policy" {
  role       = aws_iam_role.node_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess"
}

resource "aws_iam_role_policy_attachment" "efs_client_policy" {
  role       = aws_iam_role.node_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonElasticFileSystemClientReadWriteAccess"
}

resource "aws_iam_role_policy_attachment" "node_autoscaler_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AutoScalingFullAccess"
  role       = aws_iam_role.node_role.name
}

# Create the EKS Cluster
resource "aws_eks_cluster" "eks_cluster" {
  name     = var.cluster_name
  role_arn = aws_iam_role.cluster.arn

  # upgrade_policy {
  #   support_type = "STANDARD"
  # } 

  vpc_config {
    endpoint_private_access = true
    endpoint_public_access  = true

    security_group_ids = [aws_security_group.eks_sg.id]
    subnet_ids         = aws_subnet.eks_subnet[*].id
  }

  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
    aws_iam_role_policy_attachment.eks_vpc_resource_controller,
    aws_iam_role_policy_attachment.eks_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_registry_policy,
    aws_iam_role_policy_attachment.efs_client_policy,
    aws_internet_gateway.eks_igw,
    aws_security_group.eks_sg,
    aws_subnet.eks_subnet
  ]

  tags = {
    Name       = var.cluster_name
    "expire-on" = "2025-01-01"
    "owner"     = "simone.gaiera"
    "purpose"   = "training"
  }
}

# Create EKS Node Group
resource "aws_eks_node_group" "node_group" {
  cluster_name    = var.cluster_name
  node_group_name = "eks-node-group-${var.cluster_name}"
  node_role_arn   = aws_iam_role.node_role.arn
  subnet_ids      = aws_subnet.eks_subnet[*].id

  scaling_config {
    desired_size = 2
    max_size     = 10
    min_size     = 1
  }

  instance_types = ["t3.large"]

  tags = {
    Name        = "eks-node-group-${var.cluster_name}"
    "expire-on" = "2025-01-01"
    "owner"     = "simone.gaiera"
    "purpose"   = "training"
  }

  depends_on = [
    aws_eks_cluster.eks_cluster,
    aws_iam_role_policy_attachment.eks_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_registry_policy,
    aws_iam_role_policy_attachment.efs_client_policy
  ]
}

# output "cluster_endpoint" {
#   value = aws_eks_cluster.eks_cluster.endpoint
# }

# output "cluster_certificate_authority_data" {
#   value = aws_eks_cluster.eks_cluster.certificate_authority[0].data
# }

resource "helm_release" "metrics_server" {
  name       = "metrics-server"
  repository = "https://kubernetes-sigs.github.io/metrics-server/"
  chart      = "metrics-server"
  version    = "3.12.2"
  namespace  = "kube-system"

  set {
    name  = "args[0]"
    value = "--kubelet-preferred-address-types=InternalIP"
  }

  set {
    name  = "args[1]"
    value = "--kubelet-insecure-tls"
  }

  set {
    name  = "args[2]"
    value = "--metric-resolution=30s"
  }

  # Optional settings
  timeout           = 600
  create_namespace  = true

  depends_on = [
    aws_eks_node_group.node_group
  ]
}

# TODO: autoscaler not working
resource "helm_release" "cluster_autoscaler" {
  name       = "cluster-autoscaler"
  repository = "https://kubernetes.github.io/autoscaler"
  chart      = "cluster-autoscaler"
  version    = "9.43.3"
  namespace  = "kube-system"

  # set {
  #   name  = "autoDiscovery.clusterName"
  #   value = "${var.cluster_name}"
  # }

  set {
    name  = "awsRegion"
    value = "${var.aws_region}"
  }

  set {
    name  = "rbac.serviceAccount.create"
    value = "false"
  }

  set {
    name  = "extraArgs.expander"
    value = "least-waste"
  }

  set {
    name  = "extraArgs.skip-nodes-with-local-storage"
    value = "false"
  }

  set {
    name  = "autoscalingGroups[0].name"
    value = "eks-node-group-${var.cluster_name}"
  }

  set {
    name  = "autoscalingGroups[0].minSize"
    value = 1
  }

  set {
    name  = "autoscalingGroups[0].maxSize"
    value = 10
  }

  set {
    name  = "serviceMonitor.enabled"
    value = "true"
  }

  # set {
  #   name  = "extraArgs.v"
  #   value = "8"
  # }

  depends_on = [
    aws_eks_node_group.node_group,
    helm_release.prometheus
  ]
}
