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

resource "aws_s3_object" "config_backup" {
  bucket = "mongodb-arena"
  key    = "terragrunt/${var.customer_name}/config.yaml"
  source = var.config_file_path
  etag   = filemd5(var.config_file_path)
}
