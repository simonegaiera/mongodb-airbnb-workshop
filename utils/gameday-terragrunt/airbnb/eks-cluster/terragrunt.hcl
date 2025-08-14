include {
  path = find_in_parent_folders("root.hcl")
}

dependency "atlas" {
  config_path = "../atlas-cluster"

  mock_outputs = {
    standard_srv  = "mongodb+srv://mongodb-airbnb.abcdef.mongodb.net"
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

inputs = {
  atlas_standard_srv  = dependency.atlas.outputs.standard_srv
  atlas_user_list     = dependency.atlas.outputs.user_list
  atlas_user_password = dependency.atlas.outputs.user_password
  atlas_admin_user = dependency.atlas.outputs.admin_user
  atlas_admin_password = dependency.atlas.outputs.admin_password

  # varibales to change
  scenario_config = jsondecode(file("${get_terragrunt_dir()}/scenario.json"))
  aws_profile = "Solution-Architects.User-979559056307"
  customer_name = "airbnb"
  aws_region = "us-east-2"
  domain_email = "simone.gaiera@mongodb.com"
  anthropic_api_key = "api-key-here"
}
