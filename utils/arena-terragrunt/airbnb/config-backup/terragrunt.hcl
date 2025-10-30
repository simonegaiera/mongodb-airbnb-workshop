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
  customer_name    = local.config.customer.name
  aws_profile      = local.config.aws.profile
  config_file_path = "${get_terragrunt_dir()}/../config.yaml"
}

