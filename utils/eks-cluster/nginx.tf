locals {
  # Base Nginx configuration
  base_nginx_config = templatefile("${path.module}/nginx-conf-files/airbnb-customer-nginx.conf.tpl", {
    server_name = local.aws_route53_record_name
  })

  # Generate a list of Nginx configuration blocks for each user ID
  nginx_user_configs = [
    for user_id in local.atlas_user_list : templatefile("${path.module}/nginx-conf-files/airbnb-customer-nginx-ssl.conf.tpl", {
      server_name = "${user_id}.${local.aws_route53_record_name}",
      data_username = "${user_id}",
      proxy_pass = lookup(data.kubernetes_service.openvscode_services[user_id].metadata[0], "name", "default-ip")
    })
  ]

  # Combine the base config with user configs and MongoDB config
  combined_nginx_config = join("\n\n", concat(
    [local.base_nginx_config],
    local.nginx_user_configs
  ))

  index_nginx_html = templatefile("${path.module}/nginx-html-files/index.html.tpl", {
    customer_name = var.customer_name,
    server_name = local.aws_route53_record_name,
    user_ids = local.atlas_user_list,
    folder = var.scenario == "vibe-coding" ? "/home/workspace/mongodb-airbnb-workshop/backend" : "/home/workspace/mongodb-airbnb-workshop"
  })

  notfound_nginx_html = templatefile("${path.module}/nginx-html-files/404.html.tpl", {
    customer_name = var.customer_name,
    server_name = local.aws_route53_record_name
  })

  error_nginx_html = templatefile("${path.module}/nginx-html-files/50x.html.tpl", {
    customer_name = var.customer_name,
    server_name = local.aws_route53_record_name
  })
}

resource "kubernetes_secret" "nginx_tls_secret" {
  metadata {
    name      = "nginx-tls-secret"
    namespace = "default"
  }

  type = "kubernetes.io/tls"

  data = {
    "tls.crt" = acme_certificate.mongosa_cert.certificate_pem
    "tls.key" = tls_private_key.request_key.private_key_pem
  }

  depends_on = [ 
    acme_certificate.mongosa_cert, 
    tls_private_key.request_key 
  ]
}

resource "helm_release" "airbnb_gameday_nginx" {
  name       = "mdb-nginx"
  repository = "local"
  chart      = "./mdb-nginx"
  version    = "0.1.0"

  values = [
    file("${path.module}/mdb-nginx/values.yaml"),
    yamlencode({
      volumeMounts = concat(
        [
          {
            name      = "nginx-config-volume",
            mountPath = "/etc/nginx/conf.d"
          },
          {
            name      = "custom-nginx-conf",
            mountPath = "/etc/nginx/nginx.conf",
            subPath   = "nginx.conf",
            readOnly  = true
          },
          {
            name      = "nginx-html-volume",
            mountPath = "/usr/share/nginx/html"
          }
        ],
        [
          for uid in local.atlas_user_list : {
            name      = "${substr("vscode-${uid}", 0, 53)}-pvc",
            mountPath = "/mnt/vscode-${uid}"
          }
        ],
        [
          {
            name      = "nginx-tls-secret",
            mountPath = "/etc/nginx/ssl",
            readOnly  = true
          }
        ]
      ),
      volumes = concat(
        [
          {
            name = "nginx-config-volume",
            configMap = {
              name = "mdb-nginx-config-cm"
            }
          },
          {
            name = "custom-nginx-conf",
            configMap = {
              name = "mdb-nginx-cm"
            }
          },
          {
            name = "nginx-html-volume",
            configMap = {
              name = "mdb-nginx-html-cm"
            }
          }
        ],
        [
          for uid in local.atlas_user_list : {
            name = "${substr("vscode-${uid}", 0, 53)}-pvc",
            persistentVolumeClaim = {
              claimName = "${substr("vscode-${uid}", 0, 53)}-pvc"
            }
          }
        ],
        [
          {
            name = "nginx-tls-secret",
            secret = {
              secretName = "nginx-tls-secret"
            }
          }
        ]
      )
    })
  ]

  set = [
    {
      name  = "nginx.config"
      value = local.combined_nginx_config
    },
    {
      name  = "nginx.conf"
      value = file("${path.module}/nginx-conf-files/nginx.conf")
    },
    {
      name  = "nginx.notfound"
      value = local.notfound_nginx_html
    },
    {
      name  = "nginx.html"
      value = local.index_nginx_html
    },
    {
      name  = "nginx.error"
      value = local.error_nginx_html
    },
    {
      name  = "nginx.favicon"
      value = filebase64("${path.module}/nginx-html-files/favicon.ico")
    }
  ]

  depends_on = [
    helm_release.user_openvscode,
    kubernetes_secret.nginx_tls_secret
  ]
}

data "kubernetes_service" "nginx_service" {
  metadata {
    name      = helm_release.airbnb_gameday_nginx.name
    namespace = helm_release.airbnb_gameday_nginx.namespace
  }

  depends_on = [
    helm_release.airbnb_gameday_nginx
  ]
}

output "nginx_service_hostname" {
  value = data.kubernetes_service.nginx_service.status[0].load_balancer[0].ingress[0].hostname
}

locals {
  hostname_parts = split("-", data.kubernetes_service.nginx_service.status[0].load_balancer[0].ingress[0].hostname)
  short_hostname = join("-", slice(local.hostname_parts, 0, 4))
}

data "aws_lb" "nginx_lb" {
  name = local.short_hostname

  depends_on = [ 
    data.kubernetes_service.nginx_service
  ]
}

output "zone_id" {
  value = data.aws_lb.nginx_lb.zone_id
}
