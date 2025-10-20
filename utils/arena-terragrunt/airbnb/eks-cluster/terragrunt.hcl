include "root" {
  path = find_in_parent_folders("root.hcl")
  expose = true
}

dependency "atlas" {
  config_path = "../atlas-cluster"

  mock_outputs = {
    standard_srv  = "mongodb+srv://mongodb-arena.abcdef.mongodb.net"
    user_list     = ["mockUserA","mockUserB"]
    user_password = "superSecret123"
    admin_user = "superSecret123"
    admin_password = "superSecret123"
  }
}

terraform {
  source = "../../../eks-cluster" 
  include_in_copy = [
    "**/.helmignore",
    ".helmignore",
  ]
}

locals {
  config = include.root.locals.config
}

inputs = {
  atlas_standard_srv  = dependency.atlas.outputs.standard_srv
  atlas_user_list     = dependency.atlas.outputs.user_list
  atlas_user_password = dependency.atlas.outputs.user_password
  atlas_admin_user = dependency.atlas.outputs.admin_user
  atlas_admin_password = dependency.atlas.outputs.admin_password

  customer_name = local.config.customer.name
  domain_email = local.config.domain.email
  aws_region = local.config.aws.region
  scenario_config = local.config.scenario

  # varibales to change
  aws_profile = "Solution-Architects.User-979559056307"
  # anthropic_api_key = "api-key-here (Optional)"
  # azure_openai_api_key = "api-key-here (Optional)"
}
