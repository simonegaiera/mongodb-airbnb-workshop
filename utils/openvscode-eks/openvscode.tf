
data "external" "user_data" {
  program = ["python3", "${path.module}/parse_users.py", "${path.module}/user_list.csv"]
}

locals {
  user_ids = keys(data.external.user_data.result)
}

# resource "kubernetes_pod" "efs_initializer" {
#   metadata {
#     name = "efs-initializer"
#   }

#   spec {
#     container {
#       image = "amazonlinux:2"
#       name  = "efs-setup"

#       command = [
#         "sh",
#         "-c",
# <<-EOT
#   # Confirm current user
#   echo "Running as user: $(whoami)"

#   # Install NFS tools
#   echo "Installing nfs-utils..."
#   if yum install -y nfs-utils; then
#     echo "nfs-utils installed successfully."
#   else
#     echo "Failed to install nfs-utils."
#     exit 1
#   fi

#   # Prepare for EFS mount
#   echo "Creating directory /mnt/efs..."
#   mkdir -p /mnt/efs

#   # Check and mount the EFS
#   echo "Checking mountpoint for EFS..."
#   # Define your EFS address variable
#   efs="${aws_efs_file_system.efs.id}.efs.${var.aws_region}.amazonaws.com"
#   # Echo the EFS address
#   echo "EFS Address: $efs"
#   if ! grep -qs '/mnt/efs ' /proc/mounts; then
#       echo "Mounting EFS..."
#       mount -t nfs4 -o nfsvers=4.1 "$efs:/" /mnt/efs
#       if [ $? -eq 0 ]; then
#           echo "EFS mounted successfully."
#       else
#           echo "Failed to mount EFS."
#           exit 1
#       fi
#   else
#       echo "EFS is already mounted."
#   fi

#   # Create user directories
#   echo "Creating user directories..."
#   for user_id in $(echo "${join(" ", local.user_ids)}"); do
#     # Truncate user_id to 53 characters if it's longer
#     truncated_user_id=$(echo "$user_id" | cut -c1-53)
    
#     echo "Creating directory for user ID: $truncated_user_id"
#     mkdir -p /mnt/efs/airbnb-workshop-openvscode-$truncated_user_id
#     if [ $? -eq 0 ]; then
#       echo "Directory /mnt/efs/airbnb-workshop-openvscode-$truncated_user_id created successfully."
#     else
#       echo "Failed to create directory /mnt/efs/airbnb-workshop-openvscode-$truncated_user_id."
#     fi
#   done

#   echo "Script execution completed."
# EOT
#       ]

#       security_context {
#         privileged = true
#       }
#     }

#     restart_policy = "Never"
#   }

#   depends_on = [ 
#     aws_efs_mount_target.efs_mt,
#     helm_release.prometheus
#   ]
# }

resource "kubernetes_job" "efs_initializer" {
  metadata {
    name = "efs-initializer"
  }

  spec {
    template {
      metadata {
        labels = {
          job-name = "efs-initializer"
        }
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

echo "Creating user directories..."
for user_id in $(echo "${join(" ", local.user_ids)}"); do
  truncated_user_id=$(echo "airbnb-workshop-openvscode-$user_id" | cut -c1-53)
  echo "Creating directory for user ID: $truncated_user_id"
  mkdir -p /mnt/efs/$truncated_user_id
  if [ $? -eq 0 ]; then
    echo "Directory /mnt/efs/$truncated_user_id created successfully."
  else
    echo "Failed to create directory /mnt/efs/$truncated_user_id."
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
    }

    backoff_limit = 0
  }

  depends_on = [
    aws_efs_mount_target.efs_mt,
    helm_release.prometheus
  ]
}

# resource "null_resource" "wait_for_efs_folders" {
#   provisioner "local-exec" {
#     command = "sleep 120"
#   }

#   # triggers = {
#   #   always_run = "${timestamp()}"
#   # }

#   depends_on = [ 
#     kubernetes_job.efs_initializer 
#   ]
# }

resource "helm_release" "user_openvscode" {
  for_each = tomap({ for id in local.user_ids : id => id })

  name       = substr("airbnb-workshop-openvscode-${each.value}", 0, 53)
  repository = "local"
  chart      = "./airbnb-workshop-openvscode"
  version    = "0.1.4"

  values = [
    file("${path.module}/airbnb-workshop-openvscode/values.yaml")
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
    name  = "nfsServer"
    value = "${aws_efs_file_system.efs.id}.efs.${var.aws_region}.amazonaws.com"
  }

  # Set the Persistent Volume Claim
  set {
    name  = "volumes[0].name"
    value = "openvscode-volume-${each.value}"
  }

  set {
    name  = "volumes[0].persistentVolumeClaim.claimName"
    value = "${substr("airbnb-workshop-openvscode-${each.value}", 0, 53)}-pvc"
  }
  
  set {
    name  = "volumeMounts[0].name"
    value = "openvscode-volume-${each.value}"
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
    value = "openvscode-configmap-${each.value}"
  }

  set {
    name  = "volumes[1].configMap.name"
    value = "${substr("airbnb-workshop-openvscode-${each.value}", 0, 53)}-configmap"
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
    kubernetes_job.efs_initializer,
    # null_resource.wait_for_efs_folders,
    helm_release.prometheus,
    helm_release.cluster_autoscaler,
    aws_eks_node_group.node_group
  ]
}

data "kubernetes_service" "openvscode_services" {
  for_each = tomap({ for id in local.user_ids : id => id })
  metadata {
    name      = "${substr("airbnb-workshop-openvscode-${each.value}", 0, 53)}-service"
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

locals {
  # Base Nginx configuration
  base_nginx_config = templatefile("${path.module}/airbnb-customer-nginx.conf.tpl", {
    server_name = var.aws_route53_record_name
  })

  monitoring_nginx_config = templatefile("${path.module}/airbnb-customer-nginx-ssl-monitoring.conf.tpl", {
    server_name = "monitoring.${var.aws_route53_record_name}",
    proxy_pass  = lookup(data.kubernetes_service.grafana.spec[0], "cluster_ip", "default-ip")
  })

  # Generate a list of Nginx configuration blocks for each user ID
  nginx_user_configs = [
    for user_id in local.user_ids : templatefile("${path.module}/airbnb-customer-nginx-ssl.conf.tpl", {
      server_name = "${user_id}.${var.aws_route53_record_name}",
      data_username = "${user_id}",
      proxy_pass = lookup(data.kubernetes_service.openvscode_services[user_id].metadata[0], "name", "default-ip")
    })
  ]

  # Combine the base config with user configs and MongoDB config
  combined_nginx_config = join("\n\n", concat(
    [local.base_nginx_config],
    [local.monitoring_nginx_config],
    local.nginx_user_configs
  ))
}
