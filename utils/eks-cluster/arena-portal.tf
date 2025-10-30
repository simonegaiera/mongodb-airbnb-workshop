# Kubernetes Job to build Jekyll docs

locals {
  # Base Nginx configuration
  portal_base_nginx_config = templatefile("${path.module}/nginx-conf-files/nginx-base-config.conf.tpl", {})
  portal_frontend_nginx_config = templatefile("${path.module}/nginx-conf-files/doc-nginx-main.conf.tpl", {
    server_name = "${local.aws_route53_record_name} www.${local.aws_route53_record_name}",
    index_path = "/usr/share/nginx/html/portal"
  })

  portal_backend_nginx_config = templatefile("${path.module}/nginx-conf-files/portal-nginx-server.conf.tpl", {
    server_name = "portal.${local.aws_route53_record_name}",
    proxy_pass = lookup(data.kubernetes_service.portal_service.metadata[0], "name", "default-ip"),
    index_path = "/usr/share/nginx/html/portal"
  })

  portal_combined_nginx_config = join("\n\n", [
    local.portal_base_nginx_config,
    local.portal_frontend_nginx_config,
    local.portal_backend_nginx_config
  ])
}

resource "helm_release" "portal_server" {
  name       = "portal-server"
  repository = "local"
  chart      = "./portal-server"
  version    = "0.1.0"

  values = [
    file("${path.module}/portal-server/values.yaml"),
    yamlencode({
      env = [
        {
          name  = "MONGODB_URI"
          value = "mongodb+srv://${local.atlas_admin_user}:${local.atlas_admin_password}@${replace(local.atlas_standard_srv, "mongodb+srv://", "")}/?retryWrites=true&w=majority"
        },
        {
          name  = "DB_NAME"
          value = "arena_shared"
        },
        {
          name  = "PARTICIPANTS"
          value = "participants"
        },
        {
          name  = "USER_DETAILS"
          value = "user_details"
        },
        {
          name  = "LEADERBOARD"
          value = tostring(var.scenario_config.leaderboard)
        }
      ],
      volumeMounts = [
        {
          name      = "scenario-config-volume",
          mountPath = "/etc/scenario-config",
          readOnly  = true
        },
        {
          name      = "portal-server-startup-script",
          mountPath = "/startup",
          readOnly  = true
        }
      ],
      volumes = [
        {
          name = "scenario-config-volume",
          configMap = {
            name = "scenario-definition-config"
          }
        },
        {
          name = "portal-server-startup-script",
          configMap = {
            name = "portal-server-startup-script"
          }
        }
      ]
    })
  ]

  depends_on = [
    helm_release.scenario_definition,
    helm_release.airbnb_arena_nginx
  ]
}

data "kubernetes_service" "portal_service" {

  metadata {
    name      = "portal-server"
    namespace = helm_release.portal_server.namespace
  }

  depends_on = [
    helm_release.portal_server
  ]
}


resource "helm_release" "portal_nginx" {
  name       = "portal-nginx"
  repository = "local"
  chart      = "./portal-nginx"
  version    = "0.1.5"

  values = [
    file("${path.module}/portal-nginx/values.yaml"),
    yamlencode({
      env = [
        {
          name  = "NEXT_PUBLIC_API_URL"
          value = "https://portal.${local.aws_route53_record_name}/backend"
        },
        {
          name  = "NEXT_PUBLIC_REPO_NAME"
          value = element(split("/", var.scenario_config.repository), length(split("/", var.scenario_config.repository)) - 1)
        },
        {
          name  = "NEXT_PUBLIC_SERVER_PATH"
          value = tostring(var.scenario_config.backend)
        },
        {
          name  = "NEXT_PUBLIC_ACCESS_PASSWORD"
          value = ""
        },
        {
          name  = "NEXT_PUBLIC_PRIZES_ENABLED"
          value = tostring(try(var.scenario_config.prizes.enabled, false))
        },
        {
          name  = "NEXT_PUBLIC_PRIZES_WHERE"
          value = tostring(try(var.scenario_config.prizes.where, ""))
        },
        {
          name  = "NEXT_PUBLIC_PRIZES_WHEN"
          value = tostring(try(var.scenario_config.prizes.when, ""))
        }
      ],
      volumeMounts = [
        {
          name      = "portal-nginx-config-volume",
          mountPath = "/etc/nginx/conf.d"
        },
        {
          name      = "portal-nginx-tls-secret",
          mountPath = "/etc/nginx/ssl",
          readOnly  = true
        },
        {
          name      = "portal-nginx-html-volume",
          mountPath = "/usr/share/nginx/html"
        },
        {
          name      = "scenario-config-volume",
          mountPath = "/etc/scenario-config",
          readOnly  = true
        },
        {
          name      = "portal-startup-script",
          mountPath = "/scripts",
          readOnly  = true
        },
        {
          name      = "portal-build-storage",
          mountPath = "/build"
        },
        {
          name      = "portal-volume",
          mountPath = "/usr/share/nginx/html/portal"
        }
      ],
      volumes = [
        {
          name = "portal-nginx-config-volume",
          configMap = {
            name = "portal-nginx-config-cm"
          }
        },
        {
          name = "portal-nginx-tls-secret",
          secret = {
            secretName = "nginx-tls-secret"
          }
        },
        {
          name = "scenario-config-volume",
          configMap = {
            name = "scenario-definition-config"
          }
        },
        {
          name = "portal-nginx-html-volume",
          configMap = {
            name = "docs-nginx-html-cm"
          }
        },
        {
          name = "portal-startup-script",
          configMap = {
            name = "portal-nginx-startup-script"
          }
        },
        {
          name = "portal-build-storage",
          emptyDir = {}
        },
        {
          name = "portal-volume",
          emptyDir = {}
        },
      ],
      nginx = {
        config = local.portal_combined_nginx_config
        notfound = local.notfound_nginx_html
        html = local.index_nginx_html
        error = local.error_nginx_html
        favicon = filebase64("${path.module}/nginx-html-files/favicon.ico")
      }
    })
  ]

  depends_on = [
    kubernetes_secret.nginx_tls_secret,
    helm_release.scenario_definition,
    helm_release.portal_server,
    data.kubernetes_service.portal_service
  ]
}

data "kubernetes_service" "portal_nginx_service" {
  metadata {
    name      = helm_release.portal_nginx.name
    namespace = helm_release.portal_nginx.namespace
  }

  depends_on = [
    helm_release.portal_nginx
  ]
}

output "portal_nginx_service_hostname" {
  value = data.kubernetes_service.portal_nginx_service.status[0].load_balancer[0].ingress[0].hostname
}

locals {
  portal_hostname_parts = split("-", data.kubernetes_service.portal_nginx_service.status[0].load_balancer[0].ingress[0].hostname)
  portal_short_hostname = join("-", slice(local.portal_hostname_parts, 0, 4))
}

data "aws_lb" "portal_nginx_lb" {
  name = local.portal_short_hostname

  depends_on = [ 
    data.kubernetes_service.portal_nginx_service
  ]
}
