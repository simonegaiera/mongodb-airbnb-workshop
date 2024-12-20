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
}
