terraform {
  backend "s3" {}
  
  required_providers {
    mongodbatlas = {
      source = "mongodb/mongodbatlas"
      version = "~> 2.0"
    }
    time = {
      source = "hashicorp/time"
      version = "~> 0.13.1"
    }
  }
}

provider "mongodbatlas" {
  public_key  = var.public_key
  private_key = var.private_key
}

data "mongodbatlas_roles_org_id" "org" {}

data "mongodbatlas_project" "project" {
  name   = var.project_name
}

# resource "mongodbatlas_project" "project" {
#   name   = var.project_name
#   org_id = data.mongodbatlas_roles_org_id.org.org_id

#   limits {
#     name = "atlas.project.security.databaseAccess.users"
#     value = 250
#   }
# }

#
# Create a Shared Tier Cluster
#
resource "mongodbatlas_advanced_cluster" "cluster" {
  project_id   = data.mongodbatlas_project.project.id
  name         = var.cluster_name
  cluster_type = var.cluster_type
  paused = false
  backup_enabled = true
  pit_enabled = true
  mongo_db_major_version = var.mongo_db_major_version
  
  replication_specs = [
    {
      region_configs = [
        {
          provider_name = var.atlas_provider_name
          priority      = 7
          region_name   = var.cluster_region

          electable_specs = {
            instance_size = var.atlas_provider_instance_size_name
            node_count    = 3
            # disk_size_gb = var.disk_size_gb
          }

          auto_scaling = {
            disk_gb_enabled = true
            compute_enabled = true
            compute_scale_down_enabled = true
            compute_min_instance_size = var.atlas_provider_instance_size_name
            compute_max_instance_size = "M60"
          }
        }
      ]
    }
  ]

  advanced_configuration = {
    oplog_min_retention_hours = 6
  }

  depends_on = [ data.mongodbatlas_project.project ]
}

# Wait 30 seconds after cluster creation before running the script
resource "time_sleep" "wait_30_seconds" {
  depends_on = [mongodbatlas_advanced_cluster.cluster]
  create_duration = "30s"
}

resource "mongodbatlas_cloud_backup_schedule" "test" {
  project_id   = mongodbatlas_advanced_cluster.cluster.project_id
  cluster_name = mongodbatlas_advanced_cluster.cluster.name

  reference_hour_of_day    = 3
  reference_minute_of_hour = 45
  restore_window_days      = 1


  // This will now add the desired policy items to the existing mongodbatlas_cloud_backup_schedule resource
  policy_item_hourly {
    frequency_interval = 1
    retention_unit     = "days"
    retention_value    = 2
  }
  policy_item_daily {
    frequency_interval = 1
    retention_unit     = "days"
    retention_value    = 5
  }

  depends_on = [ 
    mongodbatlas_advanced_cluster.cluster
  ]
}

# resource "mongodbatlas_maintenance_window" "maintenance" {
#   project_id  = data.mongodbatlas_project.project.id
#   day_of_week = 1
#   hour_of_day = 4

#   protected_hours {
#     start_hour_of_day = 10
#     end_hour_of_day   = 20
#   }
# }

# resource "mongodbatlas_project_ip_access_list" "all" {
#   project_id = data.mongodbatlas_project.project.id
#   cidr_block = "0.0.0.0/0"
#   comment    = "accept all"

#   depends_on = [ 
#     data.mongodbatlas_project.project 
#   ]
# }

resource "mongodbatlas_project_ip_access_list" "cloudflare" {
  project_id = data.mongodbatlas_project.project.id
  cidr_block = "104.30.164.0/28"
  comment    = "accept all"

  depends_on = [ 
    data.mongodbatlas_project.project 
  ]
}

resource "mongodbatlas_database_user" "user-main" {
  username           = local.mongodb_atlas_database_username
  password           = var.database_admin_password
  project_id         = data.mongodbatlas_project.project.id
  auth_database_name = "admin"

  roles {
    role_name     = "atlasAdmin"
    database_name = "admin"
  }

  scopes {
    name   = mongodbatlas_advanced_cluster.cluster.name
    type = "CLUSTER"
  }

  depends_on = [ 
    data.mongodbatlas_project.project 
  ]
}


data "external" "user_data" {
  program = ["python3", "${path.module}/parse_users.py", var.user_list_path != null ? var.user_list_path : "null", "email", tostring(var.additional_users_count), var.cluster_name, tostring(var.user_start_index)]
}

locals {
  user_ids = keys(data.external.user_data.result)
  user_emails = [for email in values(data.external.user_data.result) : email if email != null]
  mongodb_atlas_database_username = "${var.cluster_name}-admin"
}

resource "mongodbatlas_custom_db_role" "arena_shared_role" {
  project_id = data.mongodbatlas_project.project.id
  role_name  = "${var.cluster_name}-arena-role"

  actions {
    action = "FIND"
    resources {
      collection_name = "participants"
      database_name   = var.common_database_name
    }
    resources {
      collection_name = "results"
      database_name   = var.common_database_name
    }
    resources {
      collection_name = "timed_leaderboard"
      database_name   = var.common_database_name
    }
    resources {
      collection_name = "score_leaderboard"
      database_name   = var.common_database_name
    }
    resources {
      collection_name = "results_health"
      database_name   = var.common_database_name
    }
    resources {
      collection_name = "scenario_config"
      database_name   = var.common_database_name
    }
  }
  actions {
    action = "LIST_COLLECTIONS"
    resources {
      database_name   = var.common_database_name
    }
  }
  actions {
    action = "LIST_INDEXES"
    resources {
      database_name   = var.common_database_name
    }
  }
  actions {
    action = "CREATE_INDEX"
    resources {
      database_name   = var.common_database_name
    }
  }
  actions {
    action = "CREATE_COLLECTION"
    resources {
      collection_name = "results"
      database_name   = var.common_database_name
    }
    resources {
      collection_name = "results_health"
      database_name   = var.common_database_name
    }
  }
  actions {
    action = "INSERT"
    resources {
      collection_name = "results"
      database_name   = var.common_database_name
    }
    resources {
      collection_name = "results_health"
      database_name   = var.common_database_name
    }
  }
  actions {
    action = "UPDATE"
    resources {
      collection_name = "results_health"
      database_name   = var.common_database_name
    }
  }
}

# Create a database user for each user
resource "mongodbatlas_database_user" "users" {
  for_each = tomap({ for id in local.user_ids : id => id })

  username           = "${each.value}"
  password           = var.customer_user_password
  project_id         = data.mongodbatlas_project.project.id
  auth_database_name = "admin"
  
  roles {
      database_name = "${each.value}"
      role_name     = "readWrite"
  }

  roles {
      database_name = "admin"
      role_name     = "${var.cluster_name}-arena-role"
  }

  # roles {
  #     database_name = "${var.sample_database_name}"
  #     role_name     = "read"
  # }

  scopes {
    name   = mongodbatlas_advanced_cluster.cluster.name
    type = "CLUSTER"
  }

  depends_on = [ 
    data.mongodbatlas_project.project,
    mongodbatlas_custom_db_role.arena_shared_role
  ]
}

output "user_list" {
    value = local.user_ids
}

output "additional_users_count" {
    value = var.additional_users_count
}

output "user_password" {
    value = urlencode(var.customer_user_password)
}

output "admin_user" {
    value = local.mongodb_atlas_database_username
}

output "admin_password" {
    value = urlencode(var.database_admin_password)
}

output "standard_srv" {
    value = mongodbatlas_advanced_cluster.cluster.connection_strings.standard_srv
}

# Send email invitations to the users
# resource "mongodbatlas_project_invitation" "invitation-name_surname" {
#   for_each = tomap({ for id in local.user_emails : id => id })

#   username    = "${each.value}"
#   project_id  = mongodbatlas_project.project.id
#   roles       = [ "GROUP_READ_ONLY", "GROUP_DATA_ACCESS_READ_ONLY", "GROUP_SEARCH_INDEX_EDITOR" ]
# }


# Define a null resource to install the requirements
resource "null_resource" "install_requirements" {
  provisioner "local-exec" {
    command = "python3 -m pip install -r ${path.module}/requirements.txt"
  }
}

locals {
  mongodb_atlas_connection_string = "mongodb+srv://${urlencode(local.mongodb_atlas_database_username)}:${urlencode(var.database_admin_password)}@${replace(mongodbatlas_advanced_cluster.cluster.connection_strings.standard_srv, "mongodb+srv://", "")}?retryWrites=true&w=majority"
}

# Define another null resource to execute the Python script
resource "null_resource" "run_script" {
  provisioner "local-exec" {
    command = "python3 ${path.module}/populate_database_airnbnb.py \"${local.mongodb_atlas_connection_string}\" \"${var.sample_database_name}\" \"${var.public_key}\" \"${var.private_key}\" \"${data.mongodbatlas_project.project.id}\" \"${var.cluster_name}\" \"${var.user_list_path != null ? var.user_list_path : "null"}\" \"${var.common_database_name}\" \"${var.additional_users_count}\" \"${var.create_indexes}\" \"${var.user_start_index}\" 2>&1"
  }

  triggers = {
    always_run = timestamp()
  }

  depends_on = [
    mongodbatlas_advanced_cluster.cluster,
    time_sleep.wait_30_seconds,
    null_resource.install_requirements,
    data.mongodbatlas_project.project,
    mongodbatlas_database_user.user-main,
    mongodbatlas_database_user.users,
    # mongodbatlas_project_ip_access_list.all
  ]
}
