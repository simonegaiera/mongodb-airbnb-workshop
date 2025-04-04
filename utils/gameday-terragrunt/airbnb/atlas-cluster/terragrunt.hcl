include {
  path = find_in_parent_folders("root.hcl")
}

terraform {
    source = "../../../atlas-cluster"
}

locals {
    user_list_path = "${get_terragrunt_dir()}/user_list.csv"
}

inputs = {
    public_key                              = "wnhxcpsp"
    private_key                             = "e26eb9d7-c4f6-40a8-bbd1-4a0e1aabfd95"
    project_name                            = "gameday-customer"
    cluster_name                            = "mongodb-airbnb"
    sample_database_name                    = "sample_airbnb"
    cluster_region                          = "US_EAST_2"
    cluster_type                            = "REPLICASET"
    atlas_provider_name                     = "AWS"
    atlas_provider_instance_size_name       = "M10"
    auto_scaling_disk_gb_enabled            = true
    mongo_db_major_version                  = "8.0"
    mongodb_atlas_database_username         = "admin"
    mongodb_atlas_database_user_password    = "MongoGameDay123"
    customer_user_password                  = "MongoGameDay123"
    user_list_path                          = local.user_list_path
}

