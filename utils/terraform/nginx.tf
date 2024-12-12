
provider kubernetes {
  host                   = aws_eks_cluster.eks_cluster.endpoint
  cluster_ca_certificate = base64decode(aws_eks_cluster.eks_cluster.certificate_authority[0].data)
  token                  = data.aws_eks_cluster_auth.eks_token.token
}

locals {
  nginx_config = templatefile("${path.module}/airbnb-customer-nginx.conf.tpl", {
    server_name = var.aws_route53_record_name
    proxy_pass  = data.kubernetes_service.openvscode_service.spec[0].cluster_ip
  })

  depends_on = [data.kubernetes_service.openvscode_service]
}

resource "helm_release" "airbnb_workshop_nginx" {
  name       = "airbnb-workshop-nginx"
  repository = "local"
  chart      = "./airbnb-workshop-nginx"
  version    = "0.1.0"

  values = [
    file("${path.module}/airbnb-workshop-nginx/values.yaml")
  ]

  set {
    name  = "nginx.config"
    value = local.nginx_config
  }
}

output "nginx_service_name" {
  value = helm_release.airbnb_workshop_nginx.name
}

output "nginx_service_namespace" {
  value = helm_release.airbnb_workshop_nginx.namespace
}

data "kubernetes_service" "nginx_service" {
  metadata {
    name      = helm_release.airbnb_workshop_nginx.name
    namespace = helm_release.airbnb_workshop_nginx.namespace
  }

  depends_on = [helm_release.airbnb_workshop_nginx]
}

output "service_details" {
  value = data.kubernetes_service.nginx_service.status[0].load_balancer[0].ingress[0].hostname
}

resource "aws_route53_record" "nginx-mongosa" {
  zone_id = "Z07965531RSVTIG98HSJW"
  name    = var.aws_route53_record_name
  type    = "A"

  alias {
    name                   = data.kubernetes_service.nginx_service.status[0].load_balancer[0].ingress[0].hostname
    zone_id                = "Z3AADJGX6KTTL2"
    evaluate_target_health = true
  }

  depends_on = [data.kubernetes_service.nginx_service]
}

terraform {
  required_providers {
    acme = {
      source  = "vancluever/acme"
      version = "~> 2.0"
    }
  }
}

provider "acme" {
  server_url = "https://acme-staging-v02.api.letsencrypt.org/directory"
}

resource "acme_registration" "reg" {
  email_address = var.domain_email
}

resource "tls_private_key" "cert_private_key" {
  algorithm = "RSA"
}

resource "tls_cert_request" "req" {
  private_key_pem = tls_private_key.cert_private_key.private_key_pem

  subject {
    common_name = var.aws_route53_record_name
  }
}

resource "acme_certificate" "mongosa_cert" {
  account_key_pem         = acme_registration.reg.account_key_pem
  certificate_request_pem = tls_cert_request.req.cert_request_pem

  dns_challenge {
    provider = "route53"

    config = {
      AWS_ACCESS_KEY_ID     = var.aws_access_key
      AWS_SECRET_ACCESS_KEY = var.aws_secret_key
      AWS_SESSION_TOKEN     = var.aws_security_token
      AWS_DEFAULT_REGION    = "us-east-1"
    }
  }

  depends_on = [aws_route53_record.nginx-mongosa]
}

output "certificate_pem" {
  value = acme_certificate.mongosa_cert.certificate_pem
}

output "private_key_pem" {
  value = tls_private_key.cert_private_key.private_key_pem
  sensitive = true
}
