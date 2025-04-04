include {
  path = find_in_parent_folders("root.hcl")
}

dependency "atlas" {
    config_path = "../atlas-cluster"
}

terraform {
  source = "../../../eks-cluster" 
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
