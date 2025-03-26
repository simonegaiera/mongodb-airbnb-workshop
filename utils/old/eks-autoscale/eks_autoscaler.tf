provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}

data "aws_availability_zones" "available" {
  state = "available"

  filter {
    name   = "zone-name"
    values = ["us-west-2a", "us-west-2b", "us-west-2c", "us-west-2d"]
  }
}

# VPC Configuration
resource "aws_vpc" "eks_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${var.cluster_name}-eks-vpc"
  }
}

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

resource "aws_internet_gateway" "eks_igw" {
  vpc_id = aws_vpc.eks_vpc.id

  tags = {
    Name = "${var.cluster_name}-eks-igw"
  }

  depends_on = [ aws_vpc.eks_vpc ]
}

resource "aws_route_table" "rt" {
  vpc_id = aws_vpc.eks_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.eks_igw.id
  }

  tags = {
    Name = "${var.cluster_name}-eks-public-rt"
  }

  depends_on = [ 
    aws_vpc.eks_vpc,
    aws_internet_gateway.eks_igw
  ]
}

resource "aws_route_table_association" "rt_assoc" {
  count = 2
  subnet_id      = element(aws_subnet.eks_subnet.*.id, count.index)
  route_table_id = aws_route_table.rt.id

  depends_on = [ 
    aws_route_table.rt,
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

  depends_on = [ 
    aws_vpc.eks_vpc 
  ]
}

# IAM Role for EKS Node
resource "aws_iam_role" "node" {
  name ="${var.cluster_name}-eks-node-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = ["sts:AssumeRole"]
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "node_AmazonEKSWorkerNodeMinimalPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodeMinimalPolicy"
  role       = aws_iam_role.node.name
}

resource "aws_iam_role_policy_attachment" "node_AmazonEC2ContainerRegistryPullOnly" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPullOnly"
  role       = aws_iam_role.node.name
}

resource "aws_iam_role_policy_attachment" "node_AmazonEFSClientReadWriteAccess" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonElasticFileSystemClientReadWriteAccess"
  role       = aws_iam_role.node.name
}

resource "aws_iam_policy" "efs_csi_node_policy" {
  name   = "${var.cluster_name}-efs-csi-node-policy"
  policy = jsonencode({
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowDescribe",
            "Effect": "Allow",
            "Action": [
                "elasticfilesystem:DescribeAccessPoints",
                "elasticfilesystem:DescribeFileSystems",
                "elasticfilesystem:DescribeMountTargets",
                "ec2:DescribeAvailabilityZones"
            ],
            "Resource": "*"
        },
        {
            "Sid": "AllowCreateAccessPoint",
            "Effect": "Allow",
            "Action": [
                "elasticfilesystem:CreateAccessPoint"
            ],
            "Resource": "*",
            "Condition": {
                "Null": {
                    "aws:RequestTag/efs.csi.aws.com/cluster": "false"
                },
                "ForAllValues:StringEquals": {
                    "aws:TagKeys": "efs.csi.aws.com/cluster"
                }
            }
        },
        {
            "Sid": "AllowTagNewAccessPoints",
            "Effect": "Allow",
            "Action": [
                "elasticfilesystem:TagResource"
            ],
            "Resource": "*",
            "Condition": {
                "StringEquals": {
                    "elasticfilesystem:CreateAction": "CreateAccessPoint"
                },
                "Null": {
                    "aws:RequestTag/efs.csi.aws.com/cluster": "false"
                },
                "ForAllValues:StringEquals": {
                    "aws:TagKeys": "efs.csi.aws.com/cluster"
                }
            }
        },
        {
            "Sid": "AllowDeleteAccessPoint",
            "Effect": "Allow",
            "Action": "elasticfilesystem:DeleteAccessPoint",
            "Resource": "*",
            "Condition": {
                "Null": {
                    "aws:ResourceTag/efs.csi.aws.com/cluster": "false"
                }
            }
        }
    ]
})
}

resource "aws_iam_role_policy_attachment" "node_efs_csi_attachment" {
  role       = aws_iam_role.node.name
  policy_arn = aws_iam_policy.efs_csi_node_policy.arn
}

# IAM Role for EKS Cluster
resource "aws_iam_role" "cluster" {
  name ="${var.cluster_name}-eks-cluster-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "sts:AssumeRole",
          "sts:TagSession"
        ]
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "cluster_AmazonEKSClusterPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.cluster.name
}

resource "aws_iam_role_policy_attachment" "cluster_AmazonEKSComputePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSComputePolicy"
  role       = aws_iam_role.cluster.name
}

resource "aws_iam_role_policy_attachment" "cluster_AmazonEKSBlockStoragePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSBlockStoragePolicy"
  role       = aws_iam_role.cluster.name
}

resource "aws_iam_role_policy_attachment" "cluster_AmazonEKSLoadBalancingPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSLoadBalancingPolicy"
  role       = aws_iam_role.cluster.name
}

resource "aws_iam_role_policy_attachment" "cluster_AmazonEKSNetworkingPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSNetworkingPolicy"
  role       = aws_iam_role.cluster.name
}

# EKS Cluster
resource "aws_eks_cluster" "eks_cluster" {
  name     = var.cluster_name
  role_arn = aws_iam_role.cluster.arn

  upgrade_policy {
    support_type = "STANDARD"
  }

  access_config {
    authentication_mode = "API_AND_CONFIG_MAP"
    bootstrap_cluster_creator_admin_permissions = true
  }

  bootstrap_self_managed_addons = false

  compute_config {
    enabled       = true
    node_pools    = ["general-purpose"]
    node_role_arn = aws_iam_role.node.arn
  }

  kubernetes_network_config {
    elastic_load_balancing {
      enabled = true
    }
  }

  storage_config {
    block_storage {
      enabled = true
    }
  }

  vpc_config {
    endpoint_private_access = true
    endpoint_public_access  = true

    security_group_ids = [aws_security_group.eks_sg.id]
    subnet_ids = aws_subnet.eks_subnet[*].id
  }

  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  tags = {
    Name       = var.cluster_name
    "expire-on" = local.expire_timestamp
    "owner"     = var.domain_email
    "purpose"   = "gameday"
  }

  depends_on = [
    aws_subnet.eks_subnet,
    aws_route_table_association.rt_assoc,
    aws_security_group.eks_sg,
    aws_iam_role.node,
    aws_iam_role.cluster
  ]
}

locals {
  current_timestamp = timestamp()
  expire_timestamp  = formatdate("YYYY-MM-DD", timeadd(local.current_timestamp, "168h"))
}

output "cluster_endpoint" {
  value = aws_eks_cluster.eks_cluster.endpoint
}

resource "aws_iam_role_policy_attachment" "CloudWatchAgentServerPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
  role       = aws_iam_role.node.name
}

resource "aws_eks_addon" "vpc_cni" {
  cluster_name               = aws_eks_cluster.eks_cluster.name
  addon_name                 = "vpc-cni"
  resolve_conflicts_on_update = "OVERWRITE"
  depends_on                 = [
    aws_eks_cluster.eks_cluster
  ]
}

resource "aws_eks_addon" "metrics_server" {
  cluster_name               = aws_eks_cluster.eks_cluster.name
  addon_name                 = "metrics-server"
  resolve_conflicts_on_update = "OVERWRITE"

  depends_on                 = [
    aws_eks_cluster.eks_cluster,
    aws_eks_addon.vpc_cni
  ]
}

resource "aws_eks_addon" "observability" {
  cluster_name = aws_eks_cluster.eks_cluster.name
  addon_name   = "amazon-cloudwatch-observability"
  resolve_conflicts_on_update = "OVERWRITE"

  depends_on = [ 
    aws_eks_cluster.eks_cluster,
    aws_eks_addon.efs_csi_driver
  ]
}

resource "aws_eks_addon" "efs_csi_driver" {
  cluster_name               = aws_eks_cluster.eks_cluster.name
  addon_name                 = "aws-efs-csi-driver"
  resolve_conflicts_on_update = "OVERWRITE"

  depends_on = [
    aws_eks_cluster.eks_cluster,
    aws_eks_addon.metrics_server
  ]
}

resource "null_resource" "patch_efs_hostnetwork" {
  provisioner "local-exec" {
    command = "kubectl patch deployment efs-csi-controller -n kube-system -p '{\"spec\": {\"template\": {\"spec\": {\"hostNetwork\": true}}}}'"
  }
  
  depends_on = [aws_eks_addon.efs_csi_driver]
}

resource "null_resource" "patch_efs_sa" {
  provisioner "local-exec" {
    command = "kubectl patch serviceaccount efs-csi-controller-sa -n kube-system -p '{\"metadata\": {\"annotations\": {\"eks.amazonaws.com/role-arn\": null}}}'"
  }
  
  depends_on = [aws_eks_addon.efs_csi_driver]
}

resource "kubernetes_storage_class" "efs" {
  metadata {
    name = "efs-sc"
  }
  storage_provisioner = "efs.csi.aws.com"
  parameters = {
    fileSystemId     = aws_efs_file_system.efs.id
    directoryPerms   = "700"
    provisioningMode = "efs-ap"
  }
  reclaim_policy      = "Delete"
  volume_binding_mode = "Immediate"

  depends_on = [ 
    aws_eks_cluster.eks_cluster,
    aws_eks_addon.efs_csi_driver,
    null_resource.patch_efs_hostnetwork,
    null_resource.patch_efs_sa
  ]
}
