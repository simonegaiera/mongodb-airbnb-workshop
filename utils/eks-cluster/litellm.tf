# LiteLLM Configuration for EKS Cluster

locals {
  # LLM configuration with defaults
  llm_config = merge({
    enabled = false
    proxy = {
      enabled = false
      service-name = "litellm-service"
      port = 4000
    }
  }, try(var.scenario_config.llm, {}))
}

# Kubernetes Secret for LiteLLM API keys
resource "kubernetes_secret" "litellm_secrets" {
  count = local.llm_config.enabled && local.llm_config.proxy.enabled ? 1 : 0
  
  metadata {
    name      = "litellm-secrets"
    namespace = "default"
  }

  data = {
    anthropic-api-key = var.anthropic_api_key
    # litellm-master-key = "we-love-mongo"
  }

  type = "Opaque"

  depends_on = [
    aws_eks_cluster.eks_cluster
  ]
}

# ConfigMap for LiteLLM configuration
resource "kubernetes_config_map" "litellm_config" {
  count = local.llm_config.enabled && local.llm_config.proxy.enabled ? 1 : 0
  
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
            model   = "anthropic/claude-sonnet-4-20250514"
            api_key = "os.environ/ANTHROPIC_API_KEY"
            max_tokens = 4096
            temperature = 0.7
          }
        }
      ]
      general_settings = {
        disable_spend_logs = false
        disable_master_key_return = true
        max_input_tokens = 32000
        max_output_tokens = 4096
        default_max_tokens = 4096
        enforce_max_tokens = true
      }
      litellm_settings = {
        set_verbose = false
        json_logs = true
        cache = false
        disable_prompt_caching = false
        disable_extended_thinking = true
        disable_image_generation = true
        disable_vision = true
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
  count = local.llm_config.enabled && local.llm_config.proxy.enabled ? 1 : 0
  
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
            container_port = local.llm_config.proxy.port
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

          env {
            name  = "PORT"
            value = tostring(local.llm_config.proxy.port)
          }

          env {
            name  = "LITELLM_LOG"
            value = "INFO"
          }

          args = [
            "--config",
            "/app/config.yaml"
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
              memory = "512Mi"
            }
            limits = {
              cpu    = "500m"
              memory = "1Gi"
            }
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
  count = local.llm_config.enabled && local.llm_config.proxy.enabled ? 1 : 0
  
  metadata {
    name      = local.llm_config.proxy["service-name"]
    namespace = "default"
    labels = {
      app = "litellm-proxy"
    }
  }

  spec {
    selector = {
      app = "litellm-proxy"
    }

    port {
      name        = "http"
      port        = local.llm_config.proxy.port
      target_port = local.llm_config.proxy.port
      protocol    = "TCP"
    }

    type = "ClusterIP"
  }

  depends_on = [
    kubernetes_deployment.litellm
  ]
}

# HorizontalPodAutoscaler for LiteLLM
resource "kubernetes_horizontal_pod_autoscaler_v2" "litellm" {
  count = local.llm_config.enabled && local.llm_config.proxy.enabled ? 1 : 0
  
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
          type = "Utilization"
          average_utilization = 70
        }
      }
    }

    metric {
      type = "Resource"
      resource {
        name = "memory"
        target {
          type = "Utilization"
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
  value = local.llm_config.enabled && local.llm_config.proxy.enabled ? "http://${local.llm_config.proxy["service-name"]}:${local.llm_config.proxy.port}" : "LiteLLM not enabled"
  description = "LiteLLM simple internal endpoint (shortest form, same namespace only)"
}
