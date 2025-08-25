
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
    helm_release.scenario_definition
  ]
}

resource "aws_eks_addon" "observability" {
  cluster_name = aws_eks_cluster.eks_cluster.name
  addon_name   = "amazon-cloudwatch-observability"
  resolve_conflicts_on_update = "OVERWRITE"

  depends_on = [ 
    aws_eks_cluster.eks_cluster,
    helm_release.scenario_definition
  ]
}

resource "aws_eks_addon" "efs_csi_driver" {
  cluster_name               = aws_eks_cluster.eks_cluster.name
  addon_name                 = "aws-efs-csi-driver"
  resolve_conflicts_on_update = "OVERWRITE"

  depends_on = [
    aws_eks_cluster.eks_cluster,
    helm_release.scenario_definition
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
