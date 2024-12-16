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

output "combined_cluster_ips" {
  value = concat(
    [for i in range(length(local.user_ids)) : data.kubernetes_service.openvscode_services[i].spec[0].cluster_ip],
    [data.kubernetes_service.openvscode_service.spec[0].cluster_ip]
  )
}

