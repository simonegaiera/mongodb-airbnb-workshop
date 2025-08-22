# LiteLLM Helm Chart Configuration for EKS Cluster

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

# Deploy LiteLLM using Helm chart
resource "helm_release" "litellm" {
  count = local.llm_config.enabled && local.llm_config.proxy.enabled ? 1 : 0

  name       = "litellm"
  chart      = "./litellm"
  namespace  = "default"
  
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
      
      litellm = {
        secrets = {
          anthropicApiKey = var.anthropic_api_key
        }
      }
    })
  ]

  depends_on = [
    aws_eks_cluster.eks_cluster,
    helm_release.user_openvscode
  ]
}

# Output the LiteLLM endpoints
output "litellm_endpoint_simple" {
  value = local.llm_config.enabled && local.llm_config.proxy.enabled ? "http://${local.llm_config.proxy["service-name"]}:${local.llm_config.proxy.port}" : "LiteLLM not enabled"
  description = "LiteLLM simple internal endpoint (shortest form, same namespace only)"
}
