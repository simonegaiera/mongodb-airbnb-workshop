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

resource "helm_release" "airbnb_workshop_openvscode" {
  name       = "airbnb-workshop-openvscode"
  repository = "local"
  chart      = "./airbnb-workshop-openvscode"
  version    = "0.1.0"

  values = [
    file("${path.module}/airbnb-workshop-openvscode/values.yaml")
  ]
}

# output "openvscode_service_name" {
#   value = helm_release.airbnb_workshop_openvscode.name
# }

# output "openvscode_service_namespace" {
#   value = helm_release.airbnb_workshop_openvscode.namespace
# }

data "kubernetes_service" "openvscode_service" {
  metadata {
    name      = "${helm_release.airbnb_workshop_openvscode.name}-service"
    namespace = helm_release.airbnb_workshop_openvscode.namespace
  }

  depends_on = [helm_release.airbnb_workshop_openvscode]
}

# output "openvscode_service_external_ip" {
#   value = data.kubernetes_service.openvscode_service.spec[0].cluster_ip
# }
