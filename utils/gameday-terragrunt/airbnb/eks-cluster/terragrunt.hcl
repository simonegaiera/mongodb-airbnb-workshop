include {
  path = find_in_parent_folders("root.hcl")
}

dependency "atlas" {
  config_path = "../atlas-cluster"

  mock_outputs = {
    standard_srv  = "mongodb+srv://mongodb-airbnb.abcdef.mongodb.net"
    user_list     = ["mockUserA","mockUserB"]
    user_password = "superSecret123"
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

  # varibales to change
  aws_profile = "Solution-Architects.User-979559056307"
  customer_name = "airbnb"
  aws_region = "us-west-2"
  domain_email = "simone.gaiera@mongodb.com"
}
