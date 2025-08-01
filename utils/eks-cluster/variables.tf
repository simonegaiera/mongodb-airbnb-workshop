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
  default     = "mongogameday.com."
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

variable "llm_enabled" {
  description = "Enable or disable the LLM integration"
  type        = bool
  default     = true
}

variable "llm_model" {
  description = "The LLM model to use"
  type        = string
  default     = "us.anthropic.claude-3-haiku-20240307-v1:0"
}

variable "llm_region" {
  description = "The AWS region for the LLM model"
  type        = string
  default     = "us-east-2"
}

variable "scenario" {
  description = "The workshop scenario to deploy"
  type        = string
  default     = "vibe"
  
  validation {
    condition     = contains(["vibe", "guided", "guided-vector"], var.scenario)
    error_message = "the selected scenario is invalid."
  }
}
