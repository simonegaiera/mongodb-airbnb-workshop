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

  # set {
  #   name  = "volumes[1].configMap.defaultMode"
  #   value = "775"
  # }
  
  set {
    name  = "volumeMounts[1].name"
    value = "openvscode-configmap-${local.user_ids[count.index]}"
  }

  set {
    name  = "volumeMounts[1].mountPath"
    value = "/home/workspace/utils"
  }

  depends_on = [ aws_eks_node_group.node_group ]
}

data "kubernetes_service" "openvscode_services" {
  count = length(local.user_ids)
  metadata {
    name      = "airbnb-workshop-openvscode-${local.user_ids[count.index]}-service"
    namespace = helm_release.user_openvscode[count.index].namespace
  }

  depends_on = [
    aws_eks_cluster.eks_cluster,
    aws_eks_node_group.node_group,
    helm_release.aws_ebs_csi_driver
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
