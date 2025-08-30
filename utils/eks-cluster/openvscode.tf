provider "kubernetes" {
  host                   = aws_eks_cluster.eks_cluster.endpoint
  cluster_ca_certificate = base64decode(aws_eks_cluster.eks_cluster.certificate_authority[0].data)
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    args        = [
      "eks", "get-token",
      "--cluster-name", aws_eks_cluster.eks_cluster.name,
      "--region", var.aws_region,
      "--profile", var.aws_profile
    ]
    command = "aws"
  }
}

provider "helm" {
  kubernetes = {
    host                   = aws_eks_cluster.eks_cluster.endpoint
    cluster_ca_certificate = base64decode(aws_eks_cluster.eks_cluster.certificate_authority[0].data)
    exec = {
      api_version = "client.authentication.k8s.io/v1beta1"
      args        = [
        "eks", "get-token",
        "--cluster-name", aws_eks_cluster.eks_cluster.name,
        "--region", var.aws_region,
        "--profile", var.aws_profile
      ]
      command = "aws"
    }
  }
}

resource "null_resource" "update_kubeconfig" {
  triggers = {
    cluster_name = aws_eks_cluster.eks_cluster.name
  }

  provisioner "local-exec" {
    command = "aws eks update-kubeconfig --region ${var.aws_region} --name ${aws_eks_cluster.eks_cluster.name} --profile ${var.aws_profile}"
  }

  depends_on = [
    aws_eks_cluster.eks_cluster
  ]
}

resource "helm_release" "user_openvscode" {
  for_each = tomap({ for id in local.atlas_user_list : id => id })

  name       = substr("vscode-${each.value}", 0, 53)
  repository = "local"
  chart      = "./mdb-openvscode"
  version    = "0.1.2"
  timeout    = 600
  
  values = [
    file("${path.module}/mdb-openvscode/values.yaml"),
    yamlencode(merge({
      env = [
        {
          name  = "MONGODB_URI"
          value = "mongodb+srv://${each.value}:${local.atlas_user_password}@${replace(local.atlas_standard_srv, "mongodb+srv://", "")}/?retryWrites=true&w=majority"
        },
        {
          name  = "ENVIRONMENT"
          value = "prod"
        },
        {
          name  = "LOG_LEVEL"
          value = "INFO"
        },
        {
          name  = "SERVICE_NAME"
          value = "http://localhost:5000"
        },
        {
          name  = "SCENARIO_PATH"
          value = "/home/workspace/mongodb-airbnb-workshop/utils/eks-cluster/results-processor"
        },
        {
          name  = "SIGNAL_FILE_PATH"
          value = "/home/workspace/mongodb-airbnb-workshop/server/signal"
        },
        {
          name  = "LOG_PATH"
          value = "/home/workspace/mongodb-airbnb-workshop/server/results"
        },
        {
          name  = "WORKSHOP_USER"
          value = "/app"
        },
        {
          name  = "LEADERBOARD"
          value = tostring(var.scenario_config.leaderboard)
        },
        {
          name  = "BACKEND_URL"
          value = "https://${each.value}.${local.aws_route53_record_name}/backend"
        },
        {
          name  = "LLM_MODEL"
          value = tostring(try(var.scenario_config.llm.model, false))
        },
        {
          name  = "LLM_PROVIDER"
          value = tostring(try(var.scenario_config.llm.provider, false))
        },
        {
          name  = "AWS_REGION"
          value = tostring(try(var.scenario_config.llm.region, false))
        },
        {
          name  = "DATABASE_NAME"
          value = each.value
        },
        {
          name  = "LLM_PROXY_ENABLED"
          value = tostring(try(var.scenario_config.llm.mcp, false))
        },
        {
          name  = "LLM_PROXY_TYPE"
          value = tostring(try(var.scenario_config.llm.proxy.type, ""))
        },
        {
          name  = "LLM_PROXY_SERVICE"
          value = tostring(try(var.scenario_config.llm.proxy.service, ""))
        },
        {
          name  = "LLM_PROXY_PORT"
          value = tostring(try(var.scenario_config.llm.proxy.port, ""))
        },
        {
          name  = "LLM_BEDROCK"
          value = tostring(try(var.scenario_config.llm.bedrock, false))
        }
      ],
      volumeMounts = [
        {
          name      = "openvscode-volume-${each.value}"
          mountPath = "/home/workspace"
        },
        {
          name      = "openvscode-configmap-${each.value}"
          mountPath = "/home/workspace/utils"
        },
        {
          name      = "openvscode-configmap-${each.value}-vscode"
          mountPath = "/home/workspace/.openvscode-server/data/Machine"
        },
        {
          name      = "openvscode-configmap-${each.value}-cline"
          mountPath = "/home/workspace/.openvscode-server/data/User/globalStorage/saoudrizwan.claude-dev/settings"
        },
        {
          name      = "scenario-config-volume"
          mountPath = "/home/workspace/scenario-config"
        }
      ],
      volumes = [
        {
          name = "openvscode-volume-${each.value}"
          persistentVolumeClaim = {
            claimName = "${substr("vscode-${each.value}", 0, 53)}-pvc"
          }
        },
        {
          name = "openvscode-configmap-${each.value}"
          configMap = {
            name = "${substr("vscode-${each.value}", 0, 53)}-cm"
          }
        },
        {
          name = "openvscode-configmap-${each.value}-vscode"
          configMap = {
            name = "${substr("vscode-${each.value}", 0, 53)}-vscode-cm"
          }
        },
        {
          name = "openvscode-configmap-${each.value}-cline"
          configMap = {
            name = "${substr("vscode-${each.value}", 0, 53)}-cline-cm"
          }
        },
        {
          name = "scenario-config-volume"
          configMap = {
            name = "scenario-definition-enhanced-config"
          }
        }
      ],
      openvscode = {
        user = each.value
      },
      scenarioConfig = {
        database = {
          mongodb = try(var.scenario_config.database.mongodb, false)
          postgres = try(var.scenario_config.database.postgres, false)
        },
        llm = {
          mcp = try(var.scenario_config.llm.mcp, false)
        }
      },
      resultsProcessor = {
        enabled = true
      },
      persistence = {
        fileSystemId = aws_efs_file_system.efs.id
        storageClass = kubernetes_storage_class.efs.metadata[0].name
      },
      extraEnv = concat([
        {
          name = "MDB_MCP_CONNECTION_STRING"
          value = "mongodb+srv://${each.value}:${local.atlas_user_password}@${replace(local.atlas_standard_srv, "mongodb+srv://", "")}/${each.value}"
        }
      ], 
      try(var.scenario_config.database.postgres, false) ? [
        {
          name = "PGSQL_MCP_CONNECTION_STRING"
          value = "postgres://${each.value}:${local.atlas_user_password}@${aws_rds_cluster.aurora_cluster[0].endpoint}:5432/${each.value}?sslmode=require"
        }
      ] : [])
    }))
  ]

  depends_on = [
    aws_efs_mount_target.efs_mt,
    kubernetes_storage_class.efs,
    aws_rds_cluster_instance.aurora_instance,
    helm_release.scenario_definition
  ]
}


data "kubernetes_service" "openvscode_services" {
  for_each = tomap({ for id in local.atlas_user_list : id => id })

  metadata {
    name      = "${substr("vscode-${each.value}", 0, 53)}-svc"
    namespace = helm_release.user_openvscode[each.key].namespace
  }

  depends_on = [
    helm_release.user_openvscode
  ]
}

output "user_cluster_map" {
  value = [
    for user_id in local.atlas_user_list : "${user_id}.${local.aws_route53_record_name}"
  ]
}
