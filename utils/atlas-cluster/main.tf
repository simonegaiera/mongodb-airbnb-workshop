terraform {
  backend "s3" {}
  
  required_providers {
    mongodbatlas = {
      source = "mongodb/mongodbatlas"
    }
  }
}

provider "mongodbatlas" {
  public_key  = var.public_key
  private_key = var.private_key
}

data "mongodbatlas_roles_org_id" "org" {}

# data "mongodbatlas_project" "project" {
#   name   = var.project_name
# }

resource "mongodbatlas_project" "project" {
  name   = var.project_name
  org_id = data.mongodbatlas_roles_org_id.org.org_id

  limits {
    name = "atlas.project.security.databaseAccess.users"
    value = 250
  }
}

#
# Create a Shared Tier Cluster
#
resource "mongodbatlas_advanced_cluster" "cluster" {
  project_id   = mongodbatlas_project.project.id
  name         = var.cluster_name
  cluster_type = var.cluster_type
  paused = false
  backup_enabled = true
  pit_enabled = true
  mongo_db_major_version = var.mongo_db_major_version
  
  replication_specs {
    region_configs {
      provider_name = var.atlas_provider_name
      priority      = 7
      region_name   = var.cluster_region

      electable_specs {
        instance_size = var.atlas_provider_instance_size_name
        node_count    = 3
        # disk_size_gb = var.disk_size_gb
      }

      auto_scaling {
        disk_gb_enabled = true
        compute_enabled = true
        compute_scale_down_enabled = true
        compute_min_instance_size = var.atlas_provider_instance_size_name
        compute_max_instance_size = "M60"
      }
    }
  }

  advanced_configuration {
    oplog_min_retention_hours = 6
  }

  depends_on = [ mongodbatlas_project.project ]
}

resource "mongodbatlas_maintenance_window" "maintenance" {
  project_id  = mongodbatlas_project.project.id
  day_of_week = 1
  hour_of_day = 4

  protected_hours {
    start_hour_of_day = 10
    end_hour_of_day   = 20
  }
}

resource "mongodbatlas_project_ip_access_list" "all" {
  project_id = mongodbatlas_project.project.id
  cidr_block = "0.0.0.0/0"
  comment    = "accept all"

  depends_on = [ 
    mongodbatlas_project.project 
  ]
}

resource "mongodbatlas_database_user" "user-main" {
  username           = var.mongodb_atlas_database_username
  password           = var.mongodb_atlas_database_user_password
  project_id         = mongodbatlas_project.project.id
  auth_database_name = "admin"

  roles {
    role_name     = "atlasAdmin"
    database_name = "admin"
  }

  depends_on = [ 
    mongodbatlas_project.project 
  ]
}


data "external" "user_data" {
  program = ["python3", "${path.module}/parse_users.py", var.user_list_path, "email"]
}

locals {
  user_ids = keys(data.external.user_data.result)
  user_emails = values(data.external.user_data.result)
}

resource "mongodbatlas_custom_db_role" "airbnb_gameday_role" {
  project_id = mongodbatlas_project.project.id
  role_name  = "airbnb_gameday_role"

  actions {
    action = "FIND"
    resources {
      collection_name = "participants"
      database_name   = "airbnb_gameday"
    }
    resources {
      collection_name = "results"
      database_name   = "airbnb_gameday"
    }
  }
  actions {
    action = "LIST_COLLECTIONS"
    resources {
      database_name   = "airbnb_gameday"
    }
  }
  actions {
    action = "LIST_INDEXES"
    resources {
      database_name   = "airbnb_gameday"
    }
  }
  actions {
    action = "CREATE_INDEX"
    resources {
      database_name   = "airbnb_gameday"
    }
  }
  actions {
    action = "CREATE_COLLECTION"
    resources {
      collection_name = "results"
      database_name   = "airbnb_gameday"
    }
  }
  actions {
    action = "INSERT"
    resources {
      collection_name = "results"
      database_name   = "airbnb_gameday"
    }
  }
}

# Create a database user for each user
resource "mongodbatlas_database_user" "users" {
  for_each = tomap({ for id in local.user_ids : id => id })

  username           = "${each.value}"
  password           = var.customer_user_password
  project_id         = mongodbatlas_project.project.id
  auth_database_name = "admin"
  
  roles {
      database_name = "${each.value}"
      role_name     = "readWrite"
  }

  roles {
      database_name = "admin"
      role_name     = "airbnb_gameday_role"
  }

  roles {
      database_name = "${var.sample_database_name}"
      role_name     = "read"
  }

  depends_on = [ 
    mongodbatlas_project.project,
    mongodbatlas_custom_db_role.airbnb_gameday_role
  ]
}

output "user_list" {
    value = local.user_ids
}

output "user_password" {
    value = var.customer_user_password
}

output "standard_srv" {
    value = mongodbatlas_advanced_cluster.cluster.connection_strings[0].standard_srv
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
  mongodb_atlas_connection_string = "mongodb+srv://${var.mongodb_atlas_database_username}:${var.mongodb_atlas_database_user_password}@${replace(mongodbatlas_advanced_cluster.cluster.connection_strings[0].standard_srv, "mongodb+srv://", "")}?retryWrites=true&w=majority"
}

# Define another null resource to execute the Python script
resource "null_resource" "run_script" {
  provisioner "local-exec" {
    command = "python3 ${path.module}/populate_database_airnbnb.py \"${local.mongodb_atlas_connection_string}\" \"${var.sample_database_name}\" \"${var.public_key}\" \"${var.private_key}\" \"${mongodbatlas_project.project.id}\" \"${var.cluster_name}\" \"${var.user_list_path}\" 2>&1"
  }

  triggers = {
    always_run = timestamp()
  }

  # Ensure that this script runs after the requirements are installed
  depends_on = [
    mongodbatlas_advanced_cluster.cluster,
    null_resource.install_requirements,
    mongodbatlas_project.project,
    mongodbatlas_database_user.user-main,
    mongodbatlas_database_user.users,
    mongodbatlas_project_ip_access_list.all
  ]
}
