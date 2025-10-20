include "root" {
  path = find_in_parent_folders("root.hcl")
  expose = true
}

terraform {
    source = "../../../atlas-cluster"
}

locals {
    config = include.root.locals.config
    user_list_path = "${get_terragrunt_dir()}/user_list.csv"
}

inputs = {
    public_key                              = local.config.mongodb.public_key
    private_key                             = local.config.mongodb.private_key
    project_name                            = local.config.mongodb.project_name
    cluster_name                            = local.config.mongodb.cluster_name
    cluster_region                          = local.config.mongodb.cluster_region
    atlas_provider_instance_size_name       = local.config.mongodb.instance_size
    additional_users_count                  = local.config.mongodb.additional_users_count

    sample_database_name                    = "sample_airbnb"
    common_database_name                    = "arena_shared"
    cluster_type                            = "REPLICASET"
    atlas_provider_name                     = "AWS"
    auto_scaling_disk_gb_enabled            = true
    mongo_db_major_version                  = "8.0"
    database_admin_password                 = "MongoArenaAdminDummy"
    customer_user_password                  = "MongoArenaDummy"
    # Set user_list_path to null if you only want to have unassigned users (no CSV file will be used)
    user_list_path                          = local.user_list_path
    user_start_index                        = 0
    create_indexes                          = false
}
