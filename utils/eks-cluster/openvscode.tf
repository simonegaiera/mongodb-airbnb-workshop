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

data "external" "user_data" {
  program = ["python3", "${path.module}/parse_users.py", "${path.module}/user_list.csv"]
}

locals {
  user_ids = keys(data.external.user_data.result)
}

resource "helm_release" "user_openvscode" {
  for_each = tomap({ for id in local.user_ids : id => id })

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
    name  = "openvscode.aws_route53_record_name"
    value = var.aws_route53_record_name
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

  depends_on = [
    aws_efs_mount_target.efs_mt,
    kubernetes_storage_class.efs
  ]
}


data "kubernetes_service" "openvscode_services" {
  for_each = tomap({ for id in local.user_ids : id => id })

  metadata {
    name      = "${substr("vscode-${each.value}", 0, 53)}-svc"
    namespace = helm_release.user_openvscode[each.key].namespace
  }

  depends_on = [
    helm_release.user_openvscode
  ]
}

output "user_cluster_map" {
  value = jsonencode({
    for user_id in local.user_ids :
    "${user_id}.${var.aws_route53_record_name}" => lookup(data.kubernetes_service.openvscode_services[user_id].metadata[0], "name", "default-ip")
  })
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
<<-EOT
# Confirm current user
echo "Running as user: $(whoami)"

# Install NFS tools
echo "Installing nfs-utils..."
if yum install -y nfs-utils; then
  echo "nfs-utils installed successfully."
else
  echo "Failed to install nfs-utils."
  exit 1
fi

# Prepare for EFS mount
echo "Creating directory /mnt/efs..."
mkdir -p /mnt/efs

# Check and mount the EFS
echo "Checking mountpoint for EFS..."
efs="${aws_efs_file_system.efs.id}.efs.${var.aws_region}.amazonaws.com"
echo "EFS Address: $efs"
if ! grep -qs '/mnt/efs ' /proc/mounts; then
    echo "Mounting EFS..."
    mount -t nfs4 -o nfsvers=4.1 "$efs:/" /mnt/efs
    if [ $? -eq 0 ]; then
        echo "EFS mounted successfully."
    else
        echo "Failed to mount EFS."
        exit 1
    fi
else
    echo "EFS is already mounted."
fi

# Keep the container running
echo "Keeping the container running..."
tail -f /dev/null
EOT
      ]

      security_context {
        privileged = true
      }
    }
  }

  depends_on = [
    aws_efs_mount_target.efs_mt,
    kubernetes_storage_class.efs
  ]
}