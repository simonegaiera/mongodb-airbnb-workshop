variable "cluster_name" {
  description = "The name of the EKS cluster."
  type        = string
  default     = "airbnb-workshop-eks"
}

variable "aws_zone" {
  description = "The zone name of the EKS cluster."
  type        = string
  default     = "us-east-2"
}
