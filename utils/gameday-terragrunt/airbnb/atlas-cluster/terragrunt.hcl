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
    public_key                              = "public_key"
    private_key                             = "private_key"
    project_name                            = "arena-customer"
    cluster_name                            = "mongodb-airbnb"
    sample_database_name                    = "sample_airbnb"
    common_database_name                    = "airbnb_arena"
    cluster_region                          = "US_EAST_2"
    cluster_type                            = "REPLICASET"
    atlas_provider_name                     = "AWS"
    atlas_provider_instance_size_name       = "M30"
    auto_scaling_disk_gb_enabled            = true
    mongo_db_major_version                  = "8.0"
    database_admin_password                 = "MongoArenaAdminDummy"
    customer_user_password                  = "MongoArenaDummy"
    # Set user_list_path to null if you only want to have unassigned users (no CSV file will be used)
    user_list_path                          = local.user_list_path
    user_start_index                        = 0
    additional_users_count                  = 0
    create_indexes                          = false
}
