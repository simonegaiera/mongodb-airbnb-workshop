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

variable "aws_route53_record_name" {
  description = "The name of the Domain for the specific customer."
  type        = string
  default     = "airbnb-customer.mongosa.com"
}

variable "domain_email" {
  description = "The name of the email for the specific customer."
  type        = string
  default     = "simone.gaiera@mongodb.com"
}
