provider "kubernetes" {
  host                   = aws_eks_cluster.eks_cluster.endpoint
  cluster_ca_certificate = base64decode(aws_eks_cluster.eks_cluster.certificate_authority[0].data)
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    args        = [
      "eks", "get-token",
      "--cluster-name", aws_eks_cluster.eks_cluster.name,
      "--region", var.aws_region,
      "--profile", var.aws_profile
    ]
    command = "aws"
  }
}

provider "helm" {
  kubernetes = {
    host                   = aws_eks_cluster.eks_cluster.endpoint
    cluster_ca_certificate = base64decode(aws_eks_cluster.eks_cluster.certificate_authority[0].data)
    exec = {
      api_version = "client.authentication.k8s.io/v1beta1"
      args        = [
        "eks", "get-token",
        "--cluster-name", aws_eks_cluster.eks_cluster.name,
        "--region", var.aws_region,
        "--profile", var.aws_profile
      ]
      command = "aws"
    }
  }
}

resource "null_resource" "update_kubeconfig" {
  triggers = {
    cluster_name = aws_eks_cluster.eks_cluster.name
  }

  provisioner "local-exec" {
    command = "aws eks update-kubeconfig --region ${var.aws_region} --name ${aws_eks_cluster.eks_cluster.name} --profile ${var.aws_profile}"
  }

  depends_on = [
    aws_eks_cluster.eks_cluster
  ]
}

resource "helm_release" "user_openvscode" {
  for_each = tomap({ for id in local.atlas_user_list : id => id })

  name       = substr("vscode-${each.value}", 0, 53)
  repository = "local"
  chart      = "./mdb-openvscode"
  version    = "0.1.0"

  values = [
    file("${path.module}/mdb-openvscode/values.yaml")
  ]

  set = [
    {
      name  = "openvscode.user"
      value = each.value
    },
    {
      name  = "openvscode.atlas_standard_srv"
      value = local.atlas_standard_srv
    },
    {
      name  = "openvscode.atlas_user_password"
      value = local.atlas_user_password
    },
    {
      name  = "openvscode.aws_route53_record_name"
      value = local.aws_route53_record_name
    },
    {
      name  = "openvscode.llm_model"
      value = var.llm_model
    },
    {
      name  = "openvscode.llm_region"
      value = var.llm_region
    },
    {
      name  = "persistence.fileSystemId"
      value = aws_efs_file_system.efs.id
    },
    {
      name  = "persistence.storageClass"
      value = kubernetes_storage_class.efs.metadata[0].name
    },
    {
      name  = "volumes[0].name"
      value = "openvscode-volume-${each.value}"
    },
    {
      name  = "volumes[0].persistentVolumeClaim.claimName"
      value = "${substr("vscode-${each.value}", 0, 53)}-pvc"
    },
    {
      name  = "volumeMounts[0].name"
      value = "openvscode-volume-${each.value}"
    },
    {
      name  = "volumeMounts[0].mountPath"
      value = "/home/workspace"
    },
    {
      name  = "volumes[1].name"
      value = "openvscode-configmap-${each.value}"
    },
    {
      name  = "volumes[1].configMap.name"
      value = "${substr("vscode-${each.value}", 0, 53)}-cm"
    },
    {
      name  = "volumeMounts[1].name"
      value = "openvscode-configmap-${each.value}"
    },
    {
      name  = "volumeMounts[1].mountPath"
      value = "/home/workspace/utils"
    },
    {
      name  = "volumes[2].name"
      value = "openvscode-configmap-${each.value}-vscode"
    },
    {
      name  = "volumes[2].configMap.name"
      value = "${substr("vscode-${each.value}", 0, 53)}-vscode-cm"
    },
    {
      name  = "volumeMounts[2].name"
      value = "openvscode-configmap-${each.value}-vscode"
    },
    {
      name  = "volumeMounts[2].mountPath"
      value = "/home/workspace/.openvscode-server/data/Machine"
    },
    {
      name  = "volumes[3].name"
      value = "openvscode-configmap-${each.value}-cline"
    },
    {
      name  = "volumes[3].configMap.name"
      value = "${substr("vscode-${each.value}", 0, 53)}-cline-cm"
    },
    {
      name  = "volumeMounts[3].name"
      value = "openvscode-configmap-${each.value}-cline"
    },
    {
      name  = "volumeMounts[3].mountPath"
      value = "/home/workspace/.openvscode-server/data/User/globalStorage/saoudrizwan.claude-dev/settings"
    },
    {
      name  = "extraEnv[0].name"
      value = "MDB_MCP_CONNECTION_STRING"
    },
    {
      name  = "extraEnv[0].value"
      value = "mongodb+srv://${each.value}:${local.atlas_user_password}@${replace(local.atlas_standard_srv, "mongodb+srv://", "")}/${each.value}"
    },
    {
      name  = "extraEnv[1].name"
      value = "DATABASE_URI"
    },
    {
      name  = "extraEnv[1].value"
      value = "postgres://${each.value}:${local.atlas_user_password}@${aws_rds_cluster.aurora_cluster.endpoint}:5432/sample_airbnb?sslmode=require"
    }
  ]

  depends_on = [
    aws_efs_mount_target.efs_mt,
    kubernetes_storage_class.efs,
    aws_rds_cluster_instance.aurora_instance
  ]
}


data "kubernetes_service" "openvscode_services" {
  for_each = tomap({ for id in local.atlas_user_list : id => id })

  metadata {
    name      = "${substr("vscode-${each.value}", 0, 53)}-svc"
    namespace = helm_release.user_openvscode[each.key].namespace
  }

  depends_on = [
    helm_release.user_openvscode
  ]
}

output "user_cluster_map" {
  value = [
    for user_id in local.atlas_user_list : "${user_id}.${local.aws_route53_record_name}"
  ]
}
