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
  kubernetes {
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

  set {
    name  = "openvscode.user"
    value = each.value
  }

  set {
    name  = "openvscode.atlas_standard_srv"
    value = local.atlas_standard_srv
  }

  set {
    name  = "openvscode.atlas_user_password"
    value = local.atlas_user_password
  }

  set {
    name  = "openvscode.aws_route53_record_name"
    value = local.aws_route53_record_name
  }

  set {
    name  = "persistence.fileSystemId"
    value = aws_efs_file_system.efs.id
  }

  set {
    name  = "persistence.storageClass"
    value = kubernetes_storage_class.efs.metadata[0].name
  }

  # Set the Persistent Volume Claim volume (index 0)
  set {
    name  = "volumes[0].name"
    value = "openvscode-volume-${each.value}"
  }

  set {
    name  = "volumes[0].persistentVolumeClaim.claimName"
    value = "${substr("vscode-${each.value}", 0, 53)}-pvc"
  }
  
  # Add volume mount for the PVC (index 0)
  set {
    name  = "volumeMounts[0].name"
    value = "openvscode-volume-${each.value}"
  }

  set {
    name  = "volumeMounts[0].mountPath"
    value = "/home/workspace"
  }
  
  # Set the configmap volume (index 1)
  set {
    name  = "volumes[1].name"
    value = "openvscode-configmap-${each.value}"
  }

  set {
    name  = "volumes[1].configMap.name"
    value = "${substr("vscode-${each.value}", 0, 53)}-cm"
  }
  
  set {
    name  = "volumeMounts[1].name"
    value = "openvscode-configmap-${each.value}"
  }

  set {
    name  = "volumeMounts[1].mountPath"
    value = "/home/workspace/utils"
  }


   # Set the configmap volume (index 2 - config)
   set {
     name  = "volumes[2].name"
     value = "openvscode-configmap-${each.value}-vscode"
   }
 
   set {
     name  = "volumes[2].configMap.name"
     value = "${substr("vscode-${each.value}", 0, 53)}-vscode-cm"
   }
   
   set {
     name  = "volumeMounts[2].name"
     value = "openvscode-configmap-${each.value}-vscode"
   }
 
   set {
     name  = "volumeMounts[2].mountPath"
     value = "/home/workspace/.openvscode-server/data/Machine"
   }

  depends_on = [
    aws_efs_mount_target.efs_mt,
    kubernetes_storage_class.efs
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
