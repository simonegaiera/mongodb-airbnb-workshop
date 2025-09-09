# Kubernetes Job to build Jekyll docs

locals {
  # Base Nginx configuration
  doc_base_nginx_config = templatefile("${path.module}/nginx-conf-files/nginx-base-config.conf.tpl", {})
  doc_index_nginx_config = templatefile("${path.module}/nginx-conf-files/doc-nginx-main.conf.tpl", {
    server_name = "participants.${local.aws_route53_record_name}",
    index_path = "/usr/share/nginx/html/"
  })
  doc_instructions_nginx_config = templatefile("${path.module}/nginx-conf-files/doc-nginx-main.conf.tpl", {
    server_name = "instructions.${local.aws_route53_record_name}",
    index_path = "/usr/share/nginx/html/instructions"
  })

  doc_combined_nginx_config = join("\n\n", [
    local.doc_base_nginx_config,
    local.doc_index_nginx_config,
    local.doc_instructions_nginx_config
  ])

}

resource "helm_release" "instructions_nginx" {
  name       = "docs-nginx"
  repository = "local"
  chart      = "./docs-nginx"
  version    = "0.1.2"

  values = [
    file("${path.module}/docs-nginx/values.yaml"),
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
          name  = "COLLECTION_NAME"
          value = "scenario_config"
        }
      ],
      volumeMounts = [
        {
          name      = "docs-nginx-config-volume",
          mountPath = "/etc/nginx/conf.d"
        },
        {
          name      = "docs-nginx-tls-secret",
          mountPath = "/etc/nginx/ssl",
          readOnly  = true
        },
        {
          name      = "docs-nginx-html-volume",
          mountPath = "/usr/share/nginx/html"
        },
        {
          name      = "instructions-volume",
          mountPath = "/usr/share/nginx/html/instructions"
        },
        {
          name      = "scenario-config-volume",
          mountPath = "/etc/scenario-config",
          readOnly  = true
        },
        {
          name      = "startup-script",
          mountPath = "/scripts",
          readOnly  = true
        },
        {
          name      = "build-storage",
          mountPath = "/build"
        }
      ],
      volumes = [
        {
          name = "docs-nginx-config-volume",
          configMap = {
            name = "docs-nginx-config-cm"
          }
        },
        {
          name = "docs-nginx-tls-secret",
          secret = {
            secretName = "nginx-tls-secret"
          }
        },
        {
          name = "scenario-config-volume",
          configMap = {
            name = "scenario-definition-enhanced-config"
          }
        },
        {
          name = "docs-nginx-html-volume",
          configMap = {
            name = "docs-nginx-html-cm"
          }
        },
        {
          name = "instructions-volume",
          emptyDir = {}
        },
        {
          name = "startup-script",
          configMap = {
            name = "docs-nginx-startup-script"
          }
        },
        {
          name = "build-storage",
          emptyDir = {}
        }
      ],
      nginx = {
        config = local.doc_combined_nginx_config
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
    helm_release.airbnb_arena_nginx
  ]
}

data "kubernetes_service" "instructions_nginx_service" {
  metadata {
    name      = helm_release.instructions_nginx.name
    namespace = helm_release.instructions_nginx.namespace
  }

  depends_on = [
    helm_release.instructions_nginx
  ]
}

output "instructions_nginx_service_hostname" {
  value = data.kubernetes_service.instructions_nginx_service.status[0].load_balancer[0].ingress[0].hostname
}

locals {
  instructions_hostname_parts = split("-", data.kubernetes_service.instructions_nginx_service.status[0].load_balancer[0].ingress[0].hostname)
  instructions_short_hostname = join("-", slice(local.instructions_hostname_parts, 0, 4))
}

data "aws_lb" "instructions_nginx_lb" {
  name = local.instructions_short_hostname

  depends_on = [ 
    data.kubernetes_service.instructions_nginx_service
  ]
}
