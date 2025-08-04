# LiteLLM Configuration for EKS Cluster

# Kubernetes Secret for LiteLLM API keys
resource "kubernetes_secret" "litellm_secrets" {
  count = var.litellm_enabled ? 1 : 0
  
  metadata {
    name      = "litellm-secrets"
    namespace = "default"
  }

  data = {
    anthropic-api-key = var.anthropic_api_key
    # Master key removed - authentication disabled
  }

  type = "Opaque"

  depends_on = [
    aws_eks_cluster.eks_cluster
  ]
}

# ConfigMap for LiteLLM configuration
resource "kubernetes_config_map" "litellm_config" {
  count = var.litellm_enabled ? 1 : 0
  
  metadata {
    name      = "litellm-config"
    namespace = "default"
  }

  data = {
    "config.yaml" = yamlencode({
      model_list = [
        {
          model_name = "claude-3-haiku"
          litellm_params = {
            model   = "anthropic/claude-3-haiku-20240307"
            api_key = "os.environ/ANTHROPIC_API_KEY"
            max_tokens = 4096
            temperature = 0.7
          }
        },
        {
          model_name = "claude-4-sonnet"
          litellm_params = {
            model   = "anthropic/claude-4-sonnet-20241022"
            api_key = "os.environ/ANTHROPIC_API_KEY"
            max_tokens = 4096
            temperature = 0.7
          }
        },
        {
          model_name = "claude-3-5-haiku"
          litellm_params = {
            model   = "anthropic/claude-3-5-haiku-20241022"
            api_key = "os.environ/ANTHROPIC_API_KEY"
            max_tokens = 4096
            temperature = 0.7
          }
        },
      ]
      general_settings = {
        # Remove database configuration to use default in-memory
        # database_url = "sqlite:///tmp/litellm.db"
        # store_model_in_db = true
        # Enable usage tracking
        success_callback = ["langfuse"]
        failure_callback = ["langfuse"]
        # Disable authentication
        disable_spend_logs = false
        disable_master_key_return = true
        # Limit context window and output tokens for cost control
        max_input_tokens = 32000
        max_output_tokens = 4096
        default_max_tokens = 4096
        enforce_max_tokens = true
      }
      litellm_settings = {
        # Enable detailed logging
        set_verbose = false
        # Enable JSON logs for better parsing
        json_logs = true
        # Disable caching to prevent prompt caching
        cache = false
        # Rate limiting
        rpm_limit = 1000
        tpm_limit = 1000000
        # Disable extended thinking and prompt caching
        disable_prompt_caching = true
        disable_extended_thinking = true
        # Disable image support to prevent vision model usage
        disable_image_generation = true
        disable_vision = true
        # Force disable any caching headers and image-related parameters
        drop_params = ["cache_control", "extra_headers", "images", "image_url", "image_data"]
      }
    })
  }

  depends_on = [
    aws_eks_cluster.eks_cluster
  ]
}

# LiteLLM Deployment
resource "kubernetes_deployment" "litellm" {
  count = var.litellm_enabled ? 1 : 0
  
  metadata {
    name      = "litellm-proxy"
    namespace = "default"
    labels = {
      app = "litellm-proxy"
    }
  }

  spec {
    replicas = 2

    selector {
      match_labels = {
        app = "litellm-proxy"
      }
    }

    template {
      metadata {
        labels = {
          app = "litellm-proxy"
        }
      }

      spec {
        container {
          image = "ghcr.io/berriai/litellm:main-latest"
          name  = "litellm"

          port {
            container_port = 4000
            name          = "http"
          }

          env {
            name = "ANTHROPIC_API_KEY"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.litellm_secrets[0].metadata[0].name
                key  = "anthropic-api-key"
              }
            }
          }

          # Master key disabled for simplified access
          # env {
          #   name = "LITELLM_MASTER_KEY"
          #   value_from {
          #     secret_key_ref {
          #       name = kubernetes_secret.litellm_secrets[0].metadata[0].name
          #       key  = "litellm-master-key"
          #     }
          #   }
          # }

          env {
            name  = "PORT"
            value = "4000"
          }

          env {
            name  = "LITELLM_LOG"
            value = "INFO"
          }

          args = [
            "--config",
            "/app/config.yaml",
            "--port",
            "4000",
            "--num_workers",
            "1"
          ]

          volume_mount {
            name       = "config"
            mount_path = "/app/config.yaml"
            sub_path   = "config.yaml"
            read_only  = true
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "512Mi"  # ← Increase from 256Mi to 512Mi
            }
            limits = {
              cpu    = "500m"
              memory = "1Gi"    # ← Increase from 512Mi to 1Gi
            }
          }

          liveness_probe {
            http_get {
              path = "/health"
              port = 4000
            }
            initial_delay_seconds = 30
            period_seconds        = 10
          }

          readiness_probe {
            http_get {
              path = "/health"
              port = 4000
            }
            initial_delay_seconds = 5
            period_seconds        = 5
          }
        }

        volume {
          name = "config"
          config_map {
            name = kubernetes_config_map.litellm_config[0].metadata[0].name
          }
        }

        restart_policy = "Always"
      }
    }
  }

  depends_on = [
    kubernetes_secret.litellm_secrets,
    kubernetes_config_map.litellm_config,
    helm_release.user_openvscode
  ]
}

# LiteLLM Service - Using ClusterIP for internal access
resource "kubernetes_service" "litellm" {
  count = var.litellm_enabled ? 1 : 0
  
  metadata {
    name      = "litellm-service"
    namespace = "default"
    labels = {
      app = "litellm-proxy"
    }
    annotations = {
      # Remove any AWS load balancer annotations if present
    }
  }

  spec {
    selector = {
      app = "litellm-proxy"
    }

    port {
      name        = "http"
      port        = 4000
      target_port = 4000
      protocol    = "TCP"
    }

    type = "ClusterIP"  # Changed from LoadBalancer
  }

  depends_on = [
    kubernetes_deployment.litellm
  ]
}

# HorizontalPodAutoscaler for LiteLLM
resource "kubernetes_horizontal_pod_autoscaler_v2" "litellm" {
  count = var.litellm_enabled ? 1 : 0
  
  metadata {
    name      = "litellm-hpa"
    namespace = "default"
  }

  spec {
    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = kubernetes_deployment.litellm[0].metadata[0].name
    }

    min_replicas = 2
    max_replicas = 10

    metric {
      type = "Resource"
      resource {
        name = "cpu"
        target {
          type                = "Utilization"
          average_utilization = 70
        }
      }
    }

    metric {
      type = "Resource"
      resource {
        name = "memory"
        target {
          type                = "Utilization"
          average_utilization = 85
        }
      }
    }
  }

  depends_on = [
    kubernetes_deployment.litellm,
    aws_eks_addon.metrics_server
  ]
}

# Output the LiteLLM endpoints
output "litellm_endpoint_simple" {
  value = var.litellm_enabled ? "http://litellm-service:4000" : "LiteLLM not enabled"
  description = "LiteLLM simple internal endpoint (shortest form, same namespace only)"
}
