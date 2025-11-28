# LiteLLM Helm Chart Configuration for EKS Cluster

# Retrieve API keys from AWS Secrets Manager
data "aws_secretsmanager_secret" "arena_secrets" {
  region = "us-east-2"
  name = "arena/secrets"
}

data "aws_secretsmanager_secret_version" "arena_secrets" {
  secret_id = data.aws_secretsmanager_secret.arena_secrets.id
}

locals {
  # Parse the secret JSON to extract individual keys
  arena_secrets = jsondecode(data.aws_secretsmanager_secret_version.arena_secrets.secret_string)

  # LLM configuration with defaults
  llm_config = merge({
    enabled = false
    provider = "openai"  # Default to openai, can be "openai" or "anthropic"
    proxy = {
      enabled = false
      cache = true
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
  version    = "0.1.14"
  
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
            anthropicApiKey = coalesce(
              var.anthropic_api_key,
              try(local.arena_secrets.anthropic_api_key, null)
            )
          } : {},
          local.llm_config.provider == "openai" ? {
            azureOpenaiApiKey = coalesce(
              var.azure_openai_api_key,
              try(local.arena_secrets.azure_openai_api_key, null)
            )
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
                base_model = "gpt-5-mini"
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
                base_model = "gpt-5"
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
                base_model = "claude-3-haiku-20240307"
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
                base_model = "claude-sonnet-4-20250514"
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
            cache = local.llm_config.proxy.cache
          }, local.redis_config.enabled ? {
            cache_params = {
              type = "redis"
              ttl = 1800
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
