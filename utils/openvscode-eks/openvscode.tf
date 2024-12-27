provider "helm" {
  kubernetes {
    host                   = aws_eks_cluster.eks_cluster.endpoint
    cluster_ca_certificate = base64decode(aws_eks_cluster.eks_cluster.certificate_authority[0].data)
    token                  = data.aws_eks_cluster_auth.eks_token.token
  }
}

data "aws_eks_cluster_auth" "eks_token" {
  name = var.cluster_name
}

data "external" "user_data" {
  program = ["python3", "${path.module}/parse_users.py", "${path.module}/user_list.csv"]
}

locals {
  user_ids = keys(data.external.user_data.result)
}

resource "kubernetes_pod" "efs_initializer" {
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
  # Define your EFS address variable
  efs="${aws_efs_file_system.efs.id}.efs.${var.aws_region}.amazonaws.com"
  # Echo the EFS address
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

  # Create user directories
  echo "Creating user directories..."
  for user_id in $(echo " ${join(" ", local.user_ids)} "); do
    echo "Creating directory for user ID: $user_id"
    mkdir -p /mnt/efs/airbnb-workshop-openvscode-$user_id
    if [ $? -eq 0 ]; then
      echo "Directory /mnt/efs/airbnb-workshop-openvscode-$user_id created successfully."
    else
      echo "Failed to create directory /mnt/efs/airbnb-workshop-openvscode-$user_id."
    fi
  done

  echo "Script execution completed."
EOT
      ]

      security_context {
        privileged = true
      }
    }

    restart_policy = "Never"
  }

  depends_on = [ 
    aws_efs_mount_target.efs_mt,
    aws_eks_node_group.node_group
  ]
}

resource "null_resource" "wait_for_efs_folders" {
  provisioner "local-exec" {
    command = "sleep 120"
  }

  # triggers = {
  #   always_run = "${timestamp()}"
  # }

  depends_on = [ 
    kubernetes_pod.efs_initializer 
  ]
}

resource "helm_release" "user_openvscode" {
  count      = length(local.user_ids)
  name       = "airbnb-workshop-openvscode-${local.user_ids[count.index]}"
  repository = "local"
  chart      = "./airbnb-workshop-openvscode"
  version    = "0.1.0"

  values = [
    file("${path.module}/airbnb-workshop-openvscode/values.yaml")
  ]

  set {
    name  = "openvscode.user"
    value = local.user_ids[count.index]
  }

  set {
    name  = "openvscode.aws_route53_record_name"
    value = var.aws_route53_record_name
  }

  set {
    name  = "nfsServer"
    value = "${aws_efs_file_system.efs.id}.efs.${var.aws_region}.amazonaws.com"
  }

  # Set the Persistent Volume Claim
  set {
    name  = "volumes[0].name"
    value = "openvscode-volume-${local.user_ids[count.index]}"
  }

  set {
    name  = "volumes[0].persistentVolumeClaim.claimName"
    value = "airbnb-workshop-openvscode-${local.user_ids[count.index]}-pvc"
  }
  
  set {
    name  = "volumeMounts[0].name"
    value = "openvscode-volume-${local.user_ids[count.index]}"
  }

  set {
    name  = "volumeMounts[0].mountPath"
    value = "/home/workspace/mongodb-airbnb-workshop"
  }

  set {
    name  = "volumeMounts[0].readOnly"
    value = "false"
  }

  # Set the configmap
    set {
    name  = "volumes[1].name"
    value = "openvscode-configmap-${local.user_ids[count.index]}"
  }

  set {
    name  = "volumes[1].configMap.name"
    value = "airbnb-workshop-openvscode-${local.user_ids[count.index]}-configmap"
  }
  
  set {
    name  = "volumeMounts[1].name"
    value = "openvscode-configmap-${local.user_ids[count.index]}"
  }

  set {
    name  = "volumeMounts[1].mountPath"
    value = "/home/workspace/utils"
  }

  depends_on = [ 
    aws_eks_node_group.node_group,
    aws_efs_mount_target.efs_mt,
    null_resource.wait_for_efs_folders
  ]
}

data "kubernetes_service" "openvscode_services" {
  count = length(local.user_ids)
  metadata {
    name      = "airbnb-workshop-openvscode-${local.user_ids[count.index]}-service"
    namespace = helm_release.user_openvscode[count.index].namespace
  }

  depends_on = [
    helm_release.user_openvscode
  ]
}

# output "cluster_ips" {
#   value = [for i in range(length(local.user_ids)) : data.kubernetes_service.openvscode_services[i].spec[0].cluster_ip]
# }

output "user_cluster_map" {
  value = jsonencode(
      {
        for i in range(length(local.user_ids)) :
        "${local.user_ids[i]}.${var.aws_route53_record_name}" => data.kubernetes_service.openvscode_services[i].spec[0].cluster_ip
      }
  )
}

locals {
  # Base Nginx configuration
  base_nginx_config = templatefile("${path.module}/airbnb-customer-nginx.conf.tpl", {
    server_name = var.aws_route53_record_name
  })

  # Generate a list of Nginx configuration blocks for each user ID
  nginx_user_configs = [
    for i in range(length(local.user_ids)) : templatefile("${path.module}/airbnb-customer-nginx-ssl.conf.tpl", {
      server_name = "${local.user_ids[i]}.${var.aws_route53_record_name}",
      proxy_pass  = lookup(data.kubernetes_service.openvscode_services[i].spec[0], "cluster_ip", "default-ip")
    })
  ]


  # Combine the base config with user configs and MongoDB config
  combined_nginx_config = join("\n\n", concat(
    [local.base_nginx_config],
    local.nginx_user_configs
  ))
}

# output "combined_nginx_output" {
#   value = local.combined_nginx_config
# }
