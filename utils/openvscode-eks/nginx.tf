
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

data "aws_route53_zone" "mongosa_com" {
  name         = var.aws_route53_hosted_zone
  private_zone = false
}

resource "aws_route53_record" "acme_challenge" {
  zone_id = data.aws_route53_zone.mongosa_com.zone_id
  name    = var.aws_route53_record_name
  type    = "TXT"
  ttl     = 60
  records = [var.aws_route53_record_name]
}

resource "null_resource" "wait_for_dns" {
  provisioner "local-exec" {
    command = "sleep 60"
  }

  depends_on = [aws_route53_record.acme_challenge]
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
    common_name = "*.${var.aws_route53_record_name}"
  }
  dns_names = [
    "${var.aws_route53_record_name}",
    "*.${var.aws_route53_record_name}"
  ]
}

resource "acme_certificate" "mongosa_cert" {
  account_key_pem         = acme_registration.account.account_key_pem
  certificate_request_pem = tls_cert_request.prod_request.cert_request_pem

  dns_challenge {
    provider = "route53"

    config = {
      AWS_DEFAULT_REGION = "us-east-1"
    }
  }

  depends_on = [null_resource.wait_for_dns]
}

resource "helm_release" "airbnb_workshop_nginx" {
  name       = "airbnb-workshop-nginx"
  repository = "local"
  chart      = "./airbnb-workshop-nginx"
  version    = "0.1.5"

  values = [
    file("${path.module}/airbnb-workshop-nginx/values.yaml")
  ]

  set {
    name  = "nginx.config"
    value = local.combined_nginx_config
  }

  set_sensitive {
    name  = "secret.data.tls.crt"
    value = acme_certificate.mongosa_cert.certificate_pem
  }
  set_sensitive {
    name  = "secret.data.tls.key"
    value = tls_private_key.request_key.private_key_pem
  }

  set {
    name  = "volumes[0].name"
    value = "nginx-config-volume"
  }

  set {
    name  = "volumes[0].configMap.name"
    value = "airbnb-workshop-nginx-configmap"
  }

  set {
    name  = "volumes[1].name"
    value = "nginx-tls"
  }

  set {
    name  = "volumes[1].secret.secretName"
    value = "nginx-tls"
  }

  set {
    name  = "volumeMounts[0].name"
    value = "nginx-config-volume"
  }

  set {
    name  = "volumeMounts[0].mountPath"
    value = "/etc/nginx/conf.d"
  }

  set {
    name  = "volumeMounts[1].name"
    value = "nginx-tls"
  }

  set {
    name  = "volumeMounts[1].mountPath"
    value = "/etc/nginx/ssl"
  }

  # Set the Persistent Volume Claim
  set {
    name  = "nfsServer"
    value = "${aws_efs_file_system.efs.id}.efs.${var.aws_region}.amazonaws.com"
  }

  set {
    name  = "volumes[2].name"
    value = "openvscode-workshop-user-data"
  }

  set {
    name  = "volumes[2].persistentVolumeClaim.claimName"
    value = "airbnb-workshop-nginx-pvc"
  }

  set {
    name  = "volumeMounts[2].name"
    value = "openvscode-workshop-user-data"
  }

  set {
    name  = "volumeMounts[2].mountPath"
    value = "/var/www/mongodb-airbnb-workshop"
  }

  set {
    name  = "volumeMounts[2].readOnly"
    value = "true"
  }

  # Set the util configmap
  set {
    name  = "volumes[3].name"
    value = "airbnb-workshop-nginx-utils-configmap"
  }

  set {
    name  = "volumes[3].configMap.name"
    value = "airbnb-workshop-nginx-utils-configmap"
  }
  
  set {
    name  = "volumeMounts[3].name"
    value = "airbnb-workshop-nginx-utils-configmap"
  }

  set {
    name  = "volumeMounts[3].mountPath"
    value = "/var/utils"
  }

  depends_on = [
    acme_certificate.mongosa_cert,
    tls_private_key.request_key
  ]
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
  zone_id = data.aws_route53_zone.mongosa_com.zone_id
  name    = var.aws_route53_record_name
  type    = "A"

  alias {
    name                   = data.kubernetes_service.nginx_service.status[0].load_balancer[0].ingress[0].hostname
    zone_id                = var.aws_elb_hosted_zone_id[var.aws_region]
    evaluate_target_health = true
  }

  depends_on = [data.kubernetes_service.nginx_service]
}

resource "aws_route53_record" "nginx-mongosa-wildcard" {
  zone_id = data.aws_route53_zone.mongosa_com.zone_id
  name    = "*.${var.aws_route53_record_name}"
  type    = "A"

  alias {
    name                   = data.kubernetes_service.nginx_service.status[0].load_balancer[0].ingress[0].hostname
    zone_id                = var.aws_elb_hosted_zone_id[var.aws_region]
    evaluate_target_health = true
  }

  depends_on = [data.kubernetes_service.nginx_service]
}
