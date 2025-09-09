# Redis Helm Chart Configuration for EKS Cluster

locals {
  # Redis configuration with defaults (nested under llm.proxy.redis)
  redis_config = merge({
    enabled = false
    service = {
      name = "redis-service"
      port = 6379
    }
  }, try(var.scenario_config.llm.proxy.redis, {}))
}

# Deploy Redis using local Helm chart
resource "helm_release" "redis" {
  count = local.llm_config.enabled && local.llm_config.proxy.enabled && local.redis_config.enabled ? 1 : 0

  name       = "redis"
  chart      = "./redis"
  namespace  = "default"
  version    = "0.1.1"
  
  wait          = true
  wait_for_jobs = true
  timeout       = 600

  values = [
    yamlencode({
      service = {
        name = local.redis_config.service.name
        port = local.redis_config.service.port
      }
    })
  ]

  depends_on = [
    aws_eks_cluster.eks_cluster,
    helm_release.scenario_definition
  ]
}

# Create a Kubernetes secret for Redis credentials
resource "kubernetes_secret" "redis_credentials" {
  count = local.llm_config.enabled && local.llm_config.proxy.enabled && local.redis_config.enabled ? 1 : 0

  metadata {
    name      = "redis-credentials"
    namespace = "default"
  }

  data = {
    REDIS_HOST     = local.redis_config.service.name
    REDIS_PORT     = tostring(local.redis_config.service.port)
    REDIS_URL      = "redis://${local.redis_config.service.name}:${local.redis_config.service.port}"
  }

  type = "Opaque"

  depends_on = [
    helm_release.redis
  ]
}

# Output Redis connection information
output "redis_endpoint" {
  value = local.llm_config.enabled && local.llm_config.proxy.enabled && local.redis_config.enabled ? "${local.redis_config.service.name}:${local.redis_config.service.port}" : "Redis not enabled"
  description = "Redis internal endpoint"
}

output "redis_connection_string" {
  value = local.llm_config.enabled && local.llm_config.proxy.enabled && local.redis_config.enabled ? "redis://${local.redis_config.service.name}:${local.redis_config.service.port}" : "Redis not enabled"
  description = "Redis connection string"
  sensitive = true
}
