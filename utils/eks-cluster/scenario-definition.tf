

# Deploy Scenario Definition using Helm chart
resource "helm_release" "scenario_definition" {

  name       = "scenario-definition"
  chart      = "./scenario-definition"
  namespace  = "default"
  
  wait          = true
  wait_for_jobs = true
  timeout       = 300

  # Configure values including the scenario configuration data
  values = [
    yamlencode({
      scenario = {
        config = merge(var.scenario_config, {
          aws_route53_record_name = local.aws_route53_record_name
          atlas_standard_srv      = local.atlas_standard_srv
          atlas_user_password     = local.atlas_user_password
        })
      }
    })
  ]

  depends_on = [
    aws_eks_cluster.eks_cluster,
    aws_eks_addon.vpc_cni
  ]
}

# Output the Scenario Definition endpoints
output "scenario_definition_endpoint_simple" {
  value = "http://scenario-definition-service:80/scenario-config.json"
  description = "Scenario Definition internal endpoint for accessing the configuration JSON"
}
