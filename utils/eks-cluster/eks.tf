provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}

locals {
  atlas_standard_srv  = try(var.atlas_standard_srv, "")
  atlas_user_list     = var.atlas_user_list
  atlas_user_password = try(var.atlas_user_password, "")
  atlas_admin_password = try(var.atlas_admin_password, "")

  cluster_name = "${var.customer_name}-gameday-eks"
  aws_route53_record_name = "${var.customer_name}.${trimsuffix(var.aws_route53_hosted_zone, ".")}"
  current_timestamp = timestamp()
  expire_timestamp  = formatdate("YYYY-MM-DD", timeadd(local.current_timestamp, "168h"))
  domain_user = split("@", var.domain_email)[0]
}

output "aws_route53_record_name" {
  value = local.aws_route53_record_name
}

data "aws_availability_zones" "available" {
  state = "available"

  dynamic "filter" {
    for_each = var.aws_region == "us-west-2" ? [1] : []
    content {
      name   = "zone-name"
      values = ["us-west-2a", "us-west-2b", "us-west-2c", "us-west-2d"]
    }
  }
}

# VPC Configuration
resource "aws_vpc" "eks_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${local.cluster_name}-eks-vpc"
  }

}

resource "aws_subnet" "eks_subnet" {
  count                   = 2
  vpc_id                  = aws_vpc.eks_vpc.id
  cidr_block              = element(["10.0.1.0/24", "10.0.2.0/24"], count.index)
  availability_zone       = element(data.aws_availability_zones.available.names, count.index)
  map_public_ip_on_launch = true

  tags = {
    Name = "${local.cluster_name}-eks-subnet-${count.index}"
    "kubernetes.io/role/elb" = "1"
  }

  depends_on = [ 
    aws_vpc.eks_vpc 
  ]
}

resource "aws_internet_gateway" "eks_igw" {
  vpc_id = aws_vpc.eks_vpc.id

  tags = {
    Name = "${local.cluster_name}-eks-igw"
  }

  depends_on = [ 
    aws_vpc.eks_vpc 
  ]
}

resource "aws_route_table" "rt" {
  vpc_id = aws_vpc.eks_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.eks_igw.id
  }

  tags = {
    Name = "${local.cluster_name}-eks-public-rt"
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
    Name = "${local.cluster_name}-eks-sg"
  }

  depends_on = [ 
    aws_vpc.eks_vpc 
  ]
}

# IAM Role for EKS Node
resource "aws_iam_role" "node" {
  name ="${local.cluster_name}-eks-node-role"
  assume_role_policy = file("${path.module}/aws_policies/node_policy.json")
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
  name   = "${local.cluster_name}-efs-csi-node-policy"
  policy = file("${path.module}/aws_policies/efs_csi_node_policy.json")
}

resource "aws_iam_role_policy_attachment" "node_efs_csi_attachment" {
  role       = aws_iam_role.node.name
  policy_arn = aws_iam_policy.efs_csi_node_policy.arn
}

# Add Bedrock policy for the node role - only if LLM is enabled
resource "aws_iam_policy" "bedrock_policy" {
  count       = try(var.scenario_config.llm.enabled, false) ? 1 : 0
  name        = "${local.cluster_name}-bedrock-policy"
  description = "Policy for Bedrock access"
  policy      = file("${path.module}/aws_policies/bedrock.json")
}

resource "aws_iam_role_policy_attachment" "node_bedrock_policy" {
  count      = try(var.scenario_config.llm.enabled, false) ? 1 : 0
  policy_arn = aws_iam_policy.bedrock_policy[0].arn
  role       = aws_iam_role.node.name
}

# IAM Role for EKS Cluster
resource "aws_iam_role" "cluster" {
  name ="${local.cluster_name}-eks-cluster-role"
  assume_role_policy = file("${path.module}/aws_policies/cluster_policy.json")
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
  name     = local.cluster_name
  role_arn = aws_iam_role.cluster.arn

  timeouts {
    create = "60m"
    delete = "120m"
  }

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
    node_pools    = ["general-purpose", "system"]
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
    Name        = local.cluster_name
    "expire-on" = local.expire_timestamp
    "owner"     = local.domain_user
    "purpose"   = "gameday"
  }

  depends_on = [
    aws_subnet.eks_subnet,
    aws_route_table_association.rt_assoc,
    aws_security_group.eks_sg,
    aws_iam_role.node,
    aws_iam_role.cluster,
    aws_iam_role_policy_attachment.CloudWatchAgentServerPolicy,
    aws_iam_role_policy_attachment.node_AmazonEKSWorkerNodeMinimalPolicy,
    aws_iam_role_policy_attachment.node_AmazonEC2ContainerRegistryPullOnly,
    aws_iam_role_policy_attachment.node_AmazonEFSClientReadWriteAccess,
    aws_iam_role_policy_attachment.node_efs_csi_attachment,
    aws_iam_role_policy_attachment.cluster_AmazonEKSClusterPolicy,
    aws_iam_role_policy_attachment.cluster_AmazonEKSComputePolicy,
    aws_iam_role_policy_attachment.cluster_AmazonEKSBlockStoragePolicy,
    aws_iam_role_policy_attachment.cluster_AmazonEKSLoadBalancingPolicy,
    aws_iam_role_policy_attachment.cluster_AmazonEKSNetworkingPolicy
  ]
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
  depends_on = [
    aws_eks_cluster.eks_cluster
  ]
}

resource "aws_eks_addon" "metrics_server" {
  cluster_name               = aws_eks_cluster.eks_cluster.name
  addon_name                 = "metrics-server"
  resolve_conflicts_on_update = "OVERWRITE"

  depends_on  = [
    aws_eks_cluster.eks_cluster,
    kubernetes_pod.nfs_pod
  ]
}

resource "aws_eks_addon" "observability" {
  cluster_name = aws_eks_cluster.eks_cluster.name
  addon_name   = "amazon-cloudwatch-observability"
  resolve_conflicts_on_update = "OVERWRITE"

  depends_on = [ 
    aws_eks_cluster.eks_cluster,
    kubernetes_pod.nfs_pod
  ]
}

resource "aws_eks_addon" "efs_csi_driver" {
  cluster_name               = aws_eks_cluster.eks_cluster.name
  addon_name                 = "aws-efs-csi-driver"
  resolve_conflicts_on_update = "OVERWRITE"

  depends_on = [
    aws_eks_cluster.eks_cluster,
    kubernetes_pod.nfs_pod
  ]
}

resource "null_resource" "patch_efs_hostnetwork" {
  provisioner "local-exec" {
    command = "kubectl patch deployment efs-csi-controller -n kube-system -p '{\"spec\": {\"template\": {\"spec\": {\"hostNetwork\": true}}}}'"
  }
  
  depends_on = [
    aws_eks_addon.efs_csi_driver
  ]
}

resource "null_resource" "patch_efs_sa" {
  provisioner "local-exec" {
    command = "kubectl patch serviceaccount efs-csi-controller-sa -n kube-system -p '{\"metadata\": {\"annotations\": {\"eks.amazonaws.com/role-arn\": null}}}'"
  }
  
  depends_on = [
    aws_eks_addon.efs_csi_driver
  ]
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

resource "kubernetes_pod" "nfs_pod" {
  metadata {
    name = "efs-initializer"
  }

  spec {
    container {
      image = "amazonlinux:2"
      name  = "efs-setup"

      command = [
        "sh",
        "-c",
        format("%s && tail -f /dev/null", templatefile("${path.module}/efs_initializer.sh", {
          aws_efs_id = aws_efs_file_system.efs.id,
          aws_region = var.aws_region
        }))
      ]

      security_context {
        privileged = true
      }
    }
  }

  depends_on = [
    aws_efs_mount_target.efs_mt,
    aws_eks_cluster.eks_cluster,
    aws_eks_addon.vpc_cni
  ]
}

# Add S3 policy for the node role to read mongodb-gameday bucket
resource "aws_iam_policy" "s3_mongodb_gameday_policy" {
  name        = "${local.cluster_name}-s3-mongodb-gameday-policy"
  description = "Policy for reading mongodb-gameday S3 bucket"
  policy     = file("${path.module}/aws_policies/s3.json")
}

resource "aws_iam_role_policy_attachment" "node_s3_mongodb_gameday_policy" {
  policy_arn = aws_iam_policy.s3_mongodb_gameday_policy.arn
  role       = aws_iam_role.node.name

  depends_on = [
    aws_iam_role.node,
    aws_iam_policy.s3_mongodb_gameday_policy
  ]
}

# Add this after the existing cluster policies
resource "aws_iam_policy" "eks_auto_mode_policy" {
  name        = "${local.cluster_name}-eks-auto-mode-policy"
  description = "Policy for EKS Auto Mode EC2 tagging operations"
  policy      = file("${path.module}/aws_policies/eks_auto_mode_policy.json")
}

resource "aws_iam_role_policy_attachment" "cluster_eks_auto_mode_policy" {
  policy_arn = aws_iam_policy.eks_auto_mode_policy.arn
  role       = aws_iam_role.cluster.name
}

resource "kubernetes_config_map" "scenario_config" {
  metadata {
    name = "scenario-config-cm"
  }

  data = {
    "scenario-config.json" = jsonencode(merge(var.scenario_config, {
      aws_route53_record_name = local.aws_route53_record_name
      atlas_standard_srv      = local.atlas_standard_srv
      atlas_user_password     = local.atlas_user_password
    }))
  }

  depends_on = [
    aws_eks_cluster.eks_cluster
  ]
}
