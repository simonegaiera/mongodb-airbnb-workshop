terraform {
  backend "s3" {}
}

provider "aws" {
  region  = "us-east-1"
  profile = var.aws_profile
}

variable "customer_name" {
  description = "Customer name for S3 path"
  type        = string
}

variable "aws_profile" {
  description = "AWS profile for authentication"
  type        = string
}

variable "config_file_path" {
  description = "Path to the config.yaml file"
  type        = string
}

variable "additional_users_count" {
  description = "Number of additional users from config"
  type        = number
}

variable "project_name" {
  description = "MongoDB project name from config"
  type        = string
}

variable "cluster_name" {
  description = "MongoDB cluster name from config"
  type        = string
}

# Get current AWS user information for tracking
data "aws_caller_identity" "current" {}

# Backup config.yaml to S3
resource "aws_s3_object" "config_backup" {
  bucket = "mongodb-arena"
  key    = "terragrunt/${var.customer_name}/config.yaml"
  source = var.config_file_path
  etag   = filemd5(var.config_file_path)
}

# Track usage: log who is using arena-terragrunt and when
# Uses config file hash so one log per unique configuration
resource "aws_s3_object" "usage_log" {
  bucket  = "mongodb-arena"
  key     = "usage-logs/${var.customer_name}/${filemd5(var.config_file_path)}.json"
  content = jsonencode({
    customer               = var.customer_name
    user                   = data.aws_caller_identity.current.arn
    timestamp              = timestamp()
    config_hash            = filemd5(var.config_file_path)
    additional_users_count = var.additional_users_count
    project_name           = var.project_name
    cluster_name           = var.cluster_name
  })
  content_type = "application/json"
  # etag based only on config hash - so it doesn't change unless config changes
  etag         = filemd5(var.config_file_path)
  
  lifecycle {
    ignore_changes = [content]
  }
}
