terraform {
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
resource "mongodbatlas_cluster" "create-cluster" {
  project_id   = mongodbatlas_project.project.id
  name         = var.cluster_name
  cluster_type = var.cluster_type

  replication_specs {
    num_shards = 1
    regions_config {
      region_name     = var.cluster_region
      electable_nodes = 3
      priority        = 7
      read_only_nodes = 0
    }
  }
  cloud_backup = true
  pit_enabled = true

  auto_scaling_disk_gb_enabled = var.auto_scaling_disk_gb_enabled
  mongo_db_major_version       = var.mongo_db_major_version
  provider_name               = var.atlas_provider_name
  provider_instance_size_name = var.atlas_provider_instance_size_name
  
  depends_on = [ mongodbatlas_project.project ]
}

# output "connection_strings" {
#   value = ["${mongodbatlas_cluster.create-cluster.connection_strings}"]
# }

resource "mongodbatlas_project_ip_access_list" "all" {
  project_id = mongodbatlas_project.project.id
  cidr_block = "0.0.0.0/0"
  comment    = "accept all"

  depends_on = [ mongodbatlas_project.project ]
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

  depends_on = [ mongodbatlas_project.project ]
}


data "external" "user_data" {
  program = ["python3", "${path.module}/parse_users.py", "${path.module}/user_list.csv"]
}

locals {
  user_ids = keys(data.external.user_data.result)
}

resource "mongodbatlas_database_user" "users" {
    count              = length(local.user_ids)
    username           = "${local.user_ids[count.index]}"
    password           = "MongoGameDay123"
    project_id         = mongodbatlas_project.project.id
    auth_database_name = "admin"
    
    roles {
        database_name = "${local.user_ids[count.index]}"
        role_name     = "readWrite"
    }

    roles {
        database_name = "airbnb_workshop"
        role_name     = "readWrite"
    }

    roles {
        database_name = "${var.sample_database_name}"
        role_name     = "read"
    }

    depends_on = [ mongodbatlas_project.project ]
}

resource "local_file" "env_file" {
  filename = ".env"
  content  = <<EOF
# AIRBNB
MONGO_CONNECTION_STRING = "mongodb+srv://${var.mongodb_atlas_database_username}:${var.mongodb_atlas_database_user_password}@${replace(mongodbatlas_cluster.create-cluster.connection_strings[0].standard_srv, "mongodb+srv://", "")}?retryWrites=true&w=majority"
MONGO_DATABASE_NAME=${var.sample_database_name}

# PUBLIC KEYS AND SECRETS
PUBLIC_KEY=${var.public_key}
PRIVATE_KEY=${var.private_key}
PROJECT_ID=${mongodbatlas_project.project.id}
CLUSTER_NAME=${var.cluster_name}
EOF

  depends_on = [
    mongodbatlas_project.project,
    mongodbatlas_database_user.user-main,
    mongodbatlas_project_ip_access_list.all
  ]
}

# Define a null resource to install the requirements
resource "null_resource" "install_requirements" {
  provisioner "local-exec" {
    command = "python3 -m pip install -r ${path.module}/requirements.txt"
  }
}

# Define another null resource to execute the Python script
resource "null_resource" "run_script" {
  provisioner "local-exec" {
    command = "python3 ${path.module}/populate_database_airnbnb.py ${path.module}/user_list.csv 2>&1"
  }

  triggers = {
    always_run = "${timestamp()}"
  }

  # Ensure that this script runs after the requirements are installed
  depends_on = [
    null_resource.install_requirements,
    mongodbatlas_project.project,
    mongodbatlas_database_user.user-main,
    mongodbatlas_database_user.users,
    mongodbatlas_project_ip_access_list.all
  ]
}
