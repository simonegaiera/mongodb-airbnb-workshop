
provider "aws" {
  region  = var.aws_zone
  # profile = "Solution-Architects.User-979559056307"
}

# Create a VPC
resource "aws_vpc" "eks_vpc" {
  cidr_block = "10.0.0.0/16"

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
}

# Create an Internet Gateway
resource "aws_internet_gateway" "eks_igw" {
  vpc_id = aws_vpc.eks_vpc.id

  tags = {
    Name = "${var.cluster_name}-eks-igw"
  }
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
}

# Associate the subnets with the route table
resource "aws_route_table_association" "eks_subnet_assoc" {
  count = 2
  subnet_id      = element(aws_subnet.eks_subnet.*.id, count.index)
  route_table_id = aws_route_table.eks_route_table.id
}

# Create security groups
resource "aws_security_group" "eks_sg" {
  vpc_id = aws_vpc.eks_vpc.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["104.30.134.189/32"]
  }

  # Add ingress rules for additional ports
  ingress {
    from_port   = 30001
    to_port     = 30001
    protocol    = "tcp"
    cidr_blocks = ["104.30.134.189/32"]
  }

  ingress {
    from_port   = 30002
    to_port     = 30002
    protocol    = "tcp"
    cidr_blocks = ["104.30.134.189/32"]
  }

  ingress {
    from_port   = 30003
    to_port     = 30003
    protocol    = "tcp"
    cidr_blocks = ["104.30.134.189/32"]
  }

  ingress {
    from_port   = 30004
    to_port     = 30004
    protocol    = "tcp"
    cidr_blocks = ["104.30.134.189/32"]
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
}

# IAM Role for EKS Cluster
resource "aws_iam_role" "eks_role" {
  name = "eks-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.cluster_name}-eks-role"
  }
}

# Attach EKS Policy to the Cluster Role
resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  role       = aws_iam_role.eks_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

resource "aws_iam_role_policy_attachment" "eks_vpc_resource_controller" {
  role       = aws_iam_role.eks_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSVPCResourceController"
}

# Create the EKS Cluster
resource "aws_eks_cluster" "eks_cluster" {
  name     = var.cluster_name
  role_arn = aws_iam_role.eks_role.arn

  vpc_config {
    security_group_ids = [aws_security_group.eks_sg.id]
    subnet_ids         = aws_subnet.eks_subnet[*].id
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
    aws_iam_role_policy_attachment.eks_vpc_resource_controller
  ]

  tags = {
    Name       = var.cluster_name
    "expire-on" = "2025-01-01"
    "owner"     = "simone.gaiera"
    "purpose"   = "training"
  }
}

# aws_iam_openid_connect_provider
# provider "tls" {}

# data "tls_certificate" "oidc" {
#   url = aws_eks_cluster.eks_cluster.identity[0].oidc[0].issuer
# }

# resource "aws_iam_openid_connect_provider" "eks" {
#   url             = aws_eks_cluster.eks_cluster.identity.0.oidc.0.issuer
#   client_id_list  = ["sts.amazonaws.com"]
#   thumbprint_list = [data.tls_certificate.oidc.certificates[0].sha1_fingerprint]
# }

# data "aws_iam_policy_document" "ebs_csi_driver_assume_role" {
#   statement {
#     effect = "Allow"

#     principals {
#       type        = "Federated"
#       identifiers = [aws_iam_openid_connect_provider.eks.arn]
#     }

#     actions = [
#       "sts:AssumeRoleWithWebIdentity",
#     ]

#     condition {
#       test     = "StringEquals"
#       variable = "${aws_iam_openid_connect_provider.eks.url}:aud"
#       values   = ["sts.amazonaws.com"]
#     }

#     condition {
#       test     = "StringEquals"
#       variable = "${aws_iam_openid_connect_provider.eks.url}:sub"
#       values   = ["system:serviceaccount:kube-system:ebs-csi-controller-sa"]
#     }

#   }
# }

# resource "aws_iam_role" "ebs_csi_driver" {
#   name               = "ebs-csi-driver"
#   assume_role_policy = data.aws_iam_policy_document.ebs_csi_driver_assume_role.json
# }

# resource "aws_iam_role_policy_attachment" "AmazonEBSCSIDriverPolicy" {
#   policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
#   role       = aws_iam_role.ebs_csi_driver.name
# }

# resource "aws_eks_addon" "ebs_csi_driver" {
#   cluster_name             = aws_eks_cluster.eks_cluster.name
#   addon_name               = "aws-ebs-csi-driver"
#   addon_version            = "v1.29.1-eksbuild.1"
#   service_account_role_arn = aws_iam_role.ebs_csi_driver.arn
# }


# IAM Role for EKS Node Group
resource "aws_iam_role" "node_role" {
  name = "eks-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = ["sts:AssumeRole"]
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
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_role_policy_attachment" "ebs_csid_policy" {
  role       = aws_iam_role.node_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
}

# Create EKS Node Group
resource "aws_eks_node_group" "node_group" {
  cluster_name    = var.cluster_name
  node_group_name = "${var.cluster_name}-node-group"
  node_role_arn   = aws_iam_role.node_role.arn
  subnet_ids      = aws_subnet.eks_subnet[*].id

  scaling_config {
    desired_size = 4
    max_size     = 10
    min_size     = 1
  }

  instance_types = ["t3.large"]

  tags = {
    Name       = "${var.cluster_name}-node-group"
    "expire-on" = "2025-01-01"
    "owner"     = "simone.gaiera"
    "purpose"   = "training"
  }

  depends_on = [
    aws_eks_cluster.eks_cluster,
    aws_iam_role_policy_attachment.eks_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_registry_policy,
    aws_iam_role_policy_attachment.ebs_csid_policy,
  ]
}

# output "cluster_endpoint" {
#   value = aws_eks_cluster.eks_cluster.endpoint
# }

# output "cluster_certificate_authority_data" {
#   value = aws_eks_cluster.eks_cluster.certificate_authority[0].data
# }

# resource "helm_release" "aws_ebs_csi_driver" {
#   name       = "aws-ebs-csi-driver"
#   namespace  = "kube-system"
#   repository = "https://kubernetes-sigs.github.io/aws-ebs-csi-driver"
#   chart      = "aws-ebs-csi-driver"
#   version    = "2.38.1"

#   set {
#     name  = "controller.serviceAccount.create"
#     value = "true"
#   }

#   set {
#     name  = "controller.serviceAccount.annotations.eks\\.amazonaws\\.com/role-arn"
#     value = aws_iam_role.node_role.arn
#   }

#   depends_on = [
#     aws_eks_cluster.eks_cluster,
#     aws_eks_node_group.node_group
#   ]
# }
