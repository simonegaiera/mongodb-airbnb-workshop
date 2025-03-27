terraform {
  required_providers {
    acme = {
      source  = "vancluever/acme"
      version = "~> 2.0"
    }
  }
}

provider "acme" {
  # let's encrypt staging
  # server_url = "https://acme-staging-v02.api.letsencrypt.org/directory"

  # let's encrypt production
  server_url = "https://acme-v02.api.letsencrypt.org/directory"
}

resource "tls_private_key" "acme_account_key" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

resource "acme_registration" "account" {
  account_key_pem = tls_private_key.acme_account_key.private_key_pem
  email_address   = var.domain_email
}

resource "tls_private_key" "request_key" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

resource "tls_cert_request" "prod_request" {
  private_key_pem = tls_private_key.request_key.private_key_pem
  subject {
    common_name = "*.${local.aws_route53_record_name}"
  }
  dns_names = [
    "${local.aws_route53_record_name}",
    "*.${local.aws_route53_record_name}"
  ]
}

resource "acme_certificate" "mongosa_cert" {
  account_key_pem         = acme_registration.account.account_key_pem
  certificate_request_pem = tls_cert_request.prod_request.cert_request_pem

  dns_challenge {
    provider = "route53"

    config = {
      AWS_DEFAULT_REGION = "us-east-1"
      AWS_PROFILE = var.aws_profile
    }
  }

  depends_on = [
    acme_registration.account,
    tls_cert_request.prod_request
  ]
}


data "aws_route53_zone" "hosted_zone" {
  name         = var.aws_route53_hosted_zone
  private_zone = false
}

output "route53_hosted_zone" {
  value = data.aws_route53_zone.hosted_zone.zone_id
}


resource "aws_route53_record" "nginx-record" {
  zone_id = data.aws_route53_zone.hosted_zone.zone_id
  name    = local.aws_route53_record_name
  type    = "A"

  alias {
    name                   = data.kubernetes_service.nginx_service.status[0].load_balancer[0].ingress[0].hostname
    zone_id                = data.aws_lb.nginx_lb.zone_id
    evaluate_target_health = true
  }

  depends_on = [
    data.kubernetes_service.nginx_service,
    data.aws_route53_zone.hosted_zone,
    data.aws_lb.nginx_lb
  ]
}

resource "aws_route53_record" "nginx-record-wildcard" {
  zone_id = data.aws_route53_zone.hosted_zone.zone_id
  name    = "*.${local.aws_route53_record_name}"
  type    = "A"

  alias {
    name                   = data.kubernetes_service.nginx_service.status[0].load_balancer[0].ingress[0].hostname
    zone_id                = data.aws_lb.nginx_lb.zone_id
    evaluate_target_health = true
  }

  depends_on = [
    data.kubernetes_service.nginx_service,
    data.aws_route53_zone.hosted_zone,
    data.aws_lb.nginx_lb
  ]
}
