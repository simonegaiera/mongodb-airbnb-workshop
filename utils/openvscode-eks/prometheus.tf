data "aws_eks_cluster_auth" "cluster_auth" {
  name = aws_eks_cluster.eks_cluster.name
}

# provider "kubernetes" {
#   host                   = aws_eks_cluster.eks_cluster.endpoint
#   cluster_ca_certificate = base64decode(aws_eks_cluster.eks_cluster.certificate_authority[0].data)
#   token                  = data.aws_eks_cluster_auth.cluster_auth.token
# }

# provider "helm" {
#   kubernetes {
#     host                   = aws_eks_cluster.eks_cluster.endpoint
#     cluster_ca_certificate = base64decode(aws_eks_cluster.eks_cluster.certificate_authority[0].data)
#     token                  = data.aws_eks_cluster_auth.cluster_auth.token
#   }
# }

provider "kubernetes" {
  config_path = "~/.kube/config"
}

provider "helm" {
  kubernetes {
    config_path = "~/.kube/config"
  }
}


resource "helm_release" "prometheus" {
  name       = "prometheus"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  namespace  = "monitoring"
  version    = "67.0.0"

  create_namespace = true

  set {
    name  = "server.retention"
    value = "3d"
  }

  set {
    name  = "alertmanager.enabled"
    value = "false"
  }

  set {
    name  = "grafana.enabled"
    value = "true"
  }
  
  set {
    name  = "prometheus.enabled"
    value = "true"
  }

  set {
    name  = "prometheus.alertmanager.enabled"  
    value = "false"  
  }  

  set {
    name  = "prometheus.server.persistentVolume.enabled"
    value = "false"
  }

  set {
    name  = "grafana.persistence.enabled"    
    value = "false"    
  }

  set {
    name  = "grafana.service.type"
    value = "LoadBalancer"
  }

  set {
    name  = "grafana.adminUser"
    value = "admin"
  }
  
  set {
    name  = "grafana.adminPassword"
    value = "password"
  }

  depends_on = [
    aws_eks_node_group.node_group
  ]
}

data "kubernetes_service" "grafana" {
  metadata {
    name      = "prometheus-grafana"
    namespace = "monitoring"
  }

  depends_on = [ 
    helm_release.prometheus 
  ]
}
