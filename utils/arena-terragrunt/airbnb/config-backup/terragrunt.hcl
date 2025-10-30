include "root" {
  path = find_in_parent_folders("root.hcl")
  expose = true
}

terraform {
  source = "."
}

locals {
  config = include.root.locals.config
}

inputs = {
  customer_name           = local.config.customer.name
  aws_profile             = local.config.aws.profile
  config_file_path        = "${get_terragrunt_dir()}/../config.yaml"
  additional_users_count  = local.config.mongodb.additional_users_count
  project_name            = local.config.mongodb.project_name
  cluster_name            = local.config.mongodb.cluster_name
}

