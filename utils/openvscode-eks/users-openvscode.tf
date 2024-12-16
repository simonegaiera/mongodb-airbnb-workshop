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

  depends_on = [ aws_eks_node_group.node_group ]
}


data "kubernetes_service" "openvscode_services" {
  count = length(local.user_ids)
  metadata {
    name      = "airbnb-workshop-openvscode-${local.user_ids[count.index]}-service"
    namespace = helm_release.user_openvscode[count.index].namespace
  }

  depends_on = [helm_release.user_openvscode]
}

# output "cluster_ips" {
#   value = [for i in range(length(local.user_ids)) : data.kubernetes_service.openvscode_services[i].spec[0].cluster_ip]
# }

output "user_cluster_map" {
  value = jsonencode(
    merge(
      {
        for i in range(length(local.user_ids)) :
        "${local.user_ids[i]}.${var.aws_route53_record_name}" => data.kubernetes_service.openvscode_services[i].spec[0].cluster_ip
      },
      {
        "mongodb.${var.aws_route53_record_name}" = data.kubernetes_service.openvscode_service.spec[0].cluster_ip
      }
    )
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

  # Create single-item list for MongoDB configuration
  nginx_mongodb_config = [
    templatefile("${path.module}/airbnb-customer-nginx-ssl.conf.tpl", {
      server_name = "mongodb.${var.aws_route53_record_name}",
      proxy_pass  = lookup(data.kubernetes_service.openvscode_service.spec[0], "cluster_ip", "default-ip")
    })
  ]

  # Combine the base config with user configs and MongoDB config
  combined_nginx_config = join("\n\n", concat(
    [local.base_nginx_config],
    local.nginx_user_configs,
    local.nginx_mongodb_config
  ))
}

# output "combined_nginx_output" {
#   value = local.combined_nginx_config
# }
