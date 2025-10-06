variable "aws_profile" {
  description = "SA AWS Profile"
  type        = string
  default     = "Solution-Architects.User-979559056307"
}

variable "customer_name" {
  description = "The name of the Customer"
  type        = string
  default     = "customer"
}

variable "aws_region" {
  description = "The zone of the EKS cluster, closest to you Customer (limitations might apply)"
  type        = string
  default     = "us-east-2"
}

variable "aws_route53_hosted_zone" {
  description = "The name of the Hosted Zone for the specific customer"
  type        = string
  default     = "mongoarena.com."
}

variable "domain_email" {
  description = "The SA email for certbot (to request certificate)"
  type        = string
  default     = "youremail@mongodb.com"

  validation {
    condition     = length(regexall("^[^@]+@[^@]+$", var.domain_email)) > 0
    error_message = "domain_email must be in the format something@something (e.g. user@domain.com)"
  }
}

variable "atlas_standard_srv" {
  description = "The Atlas standard connection string output from the atlas cluster"
  type        = string
}

variable "atlas_user_list" {
  description = "The list of Atlas users output from the atlas cluster"
  type        = list(string)
  default     = []
  validation {
    condition     = length(var.atlas_user_list) > 0
    error_message = "atlas_user_list cannot be empty. Aborting deployment."
  }
}

variable "atlas_user_password" {
  description = "The Atlas user password output from the atlas cluster"
  type        = string
}

variable "atlas_admin_user" {
  description = "The Atlas admin user output from the atlas cluster"
  type        = string
}

variable "atlas_admin_password" {
  description = "The Atlas admin password output from the atlas cluster"
  type        = string
}

variable "anthropic_api_key" {
  description = "Anthropic API key for LiteLLM (optional - will fallback to AWS Secrets Manager if null)"
  type        = string
  sensitive   = true
  default     = null
}

variable "azure_openai_api_key" {
  description = "Azure OpenAI API key for LiteLLM (optional - will fallback to AWS Secrets Manager if null)"
  type        = string
  sensitive   = true
  default     = null
}

variable "scenario_config" {
  description = "Scenario configuration"
  type        = any
  default     = {}
}
