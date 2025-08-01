# Kubernetes Job to build Jekyll docs

resource "helm_release" "instructions_nginx" {
  name       = "docs-nginx"
  repository = "local"
  chart      = "./docs-nginx"
  version    = "0.1.0"

  values = [
    file("${path.module}/docs-nginx/values.yaml"),
    yamlencode({
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
          name      = "docs-nginx-volume",
          mountPath = "/usr/share/nginx/html"
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
          name = "docs-nginx-volume",
          persistentVolumeClaim = {
            claimName = "docs-nginx-pvc"
          }
        }
      ]
    })
  ]

  set = [
    {
      name  = "nginx.config"
      value = templatefile("${path.module}/docs-nginx/files/airbnb-customer-nginx.conf.tpl", {
                server_name = "instructions.${local.aws_route53_record_name}",
              })
    },
    {
      name: "nginx.scenario"
      value: var.scenario
    }
  ]

  depends_on = [
    kubernetes_secret.nginx_tls_secret
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

output "instructions_nginx_lb_dns_name" {
  value = data.aws_lb.instructions_nginx_lb.dns_name
}

resource "kubernetes_job_v1" "docs_builder_job" {
  metadata {
    name = "docs-builder-job"
    labels = {
      app = "backup-restore"
    }
  }

  spec {    
    template {
      metadata {
        labels = {
          app = "backup-restore"
        }
      }
      spec {
        restart_policy = "Never"
        
        container {
          name  = "docs-builder"
          image = "ruby:3.1-alpine"
          
          command = ["/bin/sh"]
          args = [
            "-c",
            <<-EOT
              set -e
              echo "Installing dependencies..."
              apk add --no-cache git build-base
              
              echo "Installing Jekyll and Bundler..."
              gem install jekyll bundler
              
              echo "Cloning repository..."
              cd /tmp
              git clone https://github.com/simonegaiera/mongodb-airbnb-workshop.git
              cd mongodb-airbnb-workshop/docs
              
              echo "Current _config.yml content:"
              cat _config.yml
              
              echo "Modifying _config.yml..."
              # Update the nav to use scenario variable and url to use route53 record
              # Keep nav as "docs" but copy the correct navigation file based on scenario
              sed -i 's|url: "https://mongogameday.com"|url: "https://instructions.${local.aws_route53_record_name}"|g' _config.yml
              
              echo "Copying correct navigation file based on scenario..."
              cp _data/navigation-${var.scenario}.yml _data/navigation.yml
              
              echo "Modified _config.yml content:"
              cat _config.yml
              
              echo "Creating Gemfile..."
              cat > Gemfile << 'EOF'
source "https://rubygems.org"

gem "jekyll", "~> 4.3"
gem "minimal-mistakes-jekyll"

group :jekyll_plugins do
  gem "jekyll-include-cache"
  gem "jekyll-feed"
  gem "jekyll-sitemap"
  gem "jekyll-gist"
  gem "jekyll-paginate"
end
EOF
              
              echo "Installing Jekyll dependencies..."
              bundle install
              
              echo "Updating _config.yml to use gem-based theme..."
              # Replace remote_theme with theme for proper gem installation
              sed -i 's|remote_theme: mmistakes/minimal-mistakes@master|theme: minimal-mistakes-jekyll|g' _config.yml
              
              echo "Final _config.yml content:"
              cat _config.yml
              
              echo "Building Jekyll site..."
              bundle exec jekyll build --destination /build/_site --verbose
              
              echo "Copying built site to nginx volume..."
              cp -r /build/_site/* /usr/share/nginx/html/
              
              echo "Setting proper permissions..."
              chmod -R 755 /usr/share/nginx/html/
              
              echo "Build completed successfully!"
              ls -la /usr/share/nginx/html/
            EOT
          ]
          
          volume_mount {
            name       = "build-storage"
            mount_path = "/build"
          }
          
          volume_mount {
            name       = "docs-nginx-volume"
            mount_path = "/usr/share/nginx/html"
          }
          
          resources {
            requests = {
              memory = "512Mi"
              cpu    = "250m"
            }
            limits = {
              memory = "1Gi"
              cpu    = "500m"
            }
          }
        }
        
        volume {
          name = "build-storage"
          empty_dir {}
        }
        
        volume {
          name = "docs-nginx-volume"
          persistent_volume_claim {
            claim_name = "docs-nginx-pvc"
          }
        }
      }
    }
    
    backoff_limit = 3
  }

  timeouts {
    create = "10m"
    update = "10m"
    delete = "5m"
  }

  depends_on = [
    helm_release.instructions_nginx
  ]
}
