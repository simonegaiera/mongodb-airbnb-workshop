# LiteLLM Helm Chart Configuration for EKS Cluster

locals {
  # LLM configuration with defaults
  llm_config = merge({
    enabled = false
    provider = "anthropic"  # Default to anthropic, can be "openai" or "anthropic"
    proxy = {
      enabled = false
      service-name = "litellm-service"
      port = 4000
    }
  }, try(var.scenario_config.llm, {}))
}

# Deploy LiteLLM using Helm chart
resource "helm_release" "litellm" {
  count = local.llm_config.enabled && local.llm_config.proxy.enabled ? 1 : 0

  name       = "litellm"
  chart      = "./litellm"
  namespace  = "default"
  version    = "0.1.8"
  
  wait          = true
  wait_for_jobs = true
  timeout       = 300

  # Only override necessary values
  values = [
    yamlencode({
      service = {
        name = local.llm_config.proxy["service-name"]
        port = local.llm_config.proxy.port
      }
      
      litellm = merge({
        # Environment variables for Redis connection
        env = merge({
          PORT = "4000"
          LITELLM_LOG = "INFO"
        }, local.redis_config.enabled ? {
          REDIS_HOST = local.redis_config.service.name
          REDIS_PORT = tostring(local.redis_config.service.port)
        } : {})
        
        secrets = merge(
          local.llm_config.provider == "anthropic" ? {
            anthropicApiKey = var.anthropic_api_key
          } : {},
          local.llm_config.provider == "openai" ? {
            azureOpenaiApiKey = var.azure_openai_api_key
          } : {}
        )
      }, {
        config = {
          model_list = local.llm_config.provider == "openai" ? [
            {
              model_name = "gpt-5-mini"
              litellm_params = {
                model = "azure/gpt-5-mini"
                api_key = "os.environ/AZURE_OPENAI_API_KEY"
                api_base = "https://solutionsconsultingopenai.openai.azure.com"
                api_version = "2025-04-01-preview"
                max_tokens = 4096
                temperature = 0.7
                cache_control_injection_points = [
                  {
                    location = "message"
                    role = "system"
                  }
                ]
              }
            },
            {
              model_name = "gpt-5-chat"
              litellm_params = {
                model = "azure/gpt-5-chat"
                api_key = "os.environ/AZURE_OPENAI_API_KEY"
                api_base = "https://solutionsconsultingopenai.openai.azure.com"
                api_version = "2025-04-01-preview"
                max_tokens = 4096
                temperature = 0.7
                cache_control_injection_points = [
                  {
                    location = "message"
                    role = "system"
                  }
                ]
              }
            }
          ] : [
            {
              model_name = "claude-3-haiku"
              litellm_params = {
                model = "anthropic/claude-3-haiku-20240307"
                api_key = "os.environ/ANTHROPIC_API_KEY"
                api_base = null
                api_version = null
                max_tokens = 4096
                temperature = 0.7
                cache_control_injection_points = [
                  {
                    location = "message"
                    role = "system"
                  }
                ]
              }
            },
            {
              model_name = "claude-4-sonnet"
              litellm_params = {
                model = "anthropic/claude-sonnet-4-20250514"
                api_key = "os.environ/ANTHROPIC_API_KEY"
                api_base = null
                api_version = null
                max_tokens = 4096
                temperature = 0.7
                cache_control_injection_points = [
                  {
                    location = "message"
                    role = "system"
                  }
                ]
              }
            }
          ]
          
          litellm_settings = merge({
            cache = local.redis_config.enabled
          }, local.redis_config.enabled ? {
            cache_params = {
              type = "redis"
              ttl = 3600
              namespace = "litellm.cline.cache"
              supported_call_types = ["completion", "acompletion", "embedding", "aembedding"]
            }
          } : {})
        }
      })
    })
  ]

  depends_on = [
    aws_eks_cluster.eks_cluster,
    helm_release.user_openvscode,
    helm_release.redis
  ]
}

# Output the LiteLLM endpoints
output "litellm_endpoint_simple" {
  value = local.llm_config.enabled && local.llm_config.proxy.enabled ? "http://${local.llm_config.proxy["service-name"]}:${local.llm_config.proxy.port}" : "LiteLLM not enabled"
  description = "LiteLLM simple internal endpoint (shortest form, same namespace only)"
}
