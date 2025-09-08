

# Deploy Scenario Definition using Helm chart
resource "helm_release" "scenario_definition" {

  name       = "scenario-definition"
  chart      = "./scenario-definition"
  namespace  = "default"
  version    = "0.1.7"
  
  wait          = true
  wait_for_jobs = true
  timeout       = 300

  # Configure values including the scenario configuration data
  values = [
    yamlencode({
      podAnnotations = {
        "scenario-config-checksum" = sha256(jsonencode(var.scenario_config))
      },
      scenario = {
        config = merge(var.scenario_config, {
          aws_route53_record_name = local.aws_route53_record_name
          atlas_standard_srv      = local.atlas_standard_srv
          atlas_user_password     = local.atlas_user_password
        })
      },
      env = [
        {
          name  = "MONGODB_URI"
          value = "mongodb+srv://${local.atlas_admin_user}:${local.atlas_admin_password}@${replace(local.atlas_standard_srv, "mongodb+srv://", "")}/?retryWrites=true&w=majority"
        },
        {
          name  = "DB_NAME"
          value = "airbnb_arena"
        },
        {
          name  = "COLLECTION_NAME"
          value = "scenario_config"
        }
      ],
      volumeMounts = [
        {
          name      = "script"
          mountPath = "/scripts"
          readOnly  = true
        },
        {
          name      = "config"
          mountPath = "/etc/scenario-config"
          readOnly  = true
        },
        {
          name      = "config"
          mountPath = "/usr/share/nginx/html/scenario-config.json"
          subPath   = "scenario-config.json"
          readOnly  = true
        }
      ],
      volumes = [
        {
          name = "config"
          configMap = {
            name = "scenario-definition-config"
          }
        },
        {
          name = "script"
          configMap = {
            name        = "scenario-definition-script"
            defaultMode = 493
          }
        }
      ]
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
