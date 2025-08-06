# Create DB subnet group
resource "aws_db_subnet_group" "aurora_subnet_group" {
  count      = try(var.scenario_config.database.postgres, false) ? 1 : 0
  name       = "${local.cluster_name}-aurora-subnet-group"
  subnet_ids = aws_subnet.eks_subnet[*].id

  tags = {
    Name        = "${local.cluster_name}-aurora-subnet-group"
    "expire-on" = local.expire_timestamp
    "owner"     = local.domain_user
    "purpose"   = "gameday"
  }

  depends_on = [aws_subnet.eks_subnet]
}

# Security group for Aurora cluster
resource "aws_security_group" "aurora_sg" {
  count       = try(var.scenario_config.database.postgres, false) ? 1 : 0
  name_prefix = "${local.cluster_name}-aurora-sg"
  vpc_id      = aws_vpc.eks_vpc.id

  # Allow PostgreSQL access from EKS cluster
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_sg.id]
  }

  # Allow PostgreSQL access from the entire VPC
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  # Allow PostgreSQL access from specific subnet
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["104.30.164.0/28"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${local.cluster_name}-aurora-sg"
    "owner"     = local.domain_user
    "purpose"   = "gameday"
  }

  depends_on = [aws_vpc.eks_vpc, aws_security_group.eks_sg]
}

# Aurora Serverless v2 cluster
resource "aws_rds_cluster" "aurora_cluster" {
  count              = try(var.scenario_config.database.postgres, false) ? 1 : 0
  cluster_identifier = "${local.cluster_name}-aurora-cluster"
  engine             = "aurora-postgresql"
  engine_mode        = "provisioned"
  engine_version     = "17.5"
  database_name      = "sample_airbnb"
  master_username    = "postgres"
  master_password    = local.atlas_user_password
  
  serverlessv2_scaling_configuration {
    max_capacity = 1.0
    min_capacity = 0.5
  }

  db_subnet_group_name   = aws_db_subnet_group.aurora_subnet_group[0].name
  vpc_security_group_ids = [aws_security_group.aurora_sg[0].id]
  
  skip_final_snapshot       = true
  backup_retention_period   = 1
  preferred_backup_window   = "07:00-09:00"
  preferred_maintenance_window = "sun:09:00-sun:11:00"

  tags = {
    Name        = "${local.cluster_name}-aurora-cluster"
    "expire-on" = local.expire_timestamp
    "owner"     = local.domain_user
    "purpose"   = "gameday"
  }

  depends_on = [
    aws_db_subnet_group.aurora_subnet_group,
    aws_security_group.aurora_sg
  ]
}

# Aurora Serverless v2 instance
resource "aws_rds_cluster_instance" "aurora_instance" {
  count              = try(var.scenario_config.database.postgres, false) ? 1 : 0
  identifier         = "${local.cluster_name}-aurora-instance"
  cluster_identifier = aws_rds_cluster.aurora_cluster[0].id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.aurora_cluster[0].engine
  engine_version     = aws_rds_cluster.aurora_cluster[0].engine_version
  publicly_accessible = true

  tags = {
    Name        = "${local.cluster_name}-aurora-instance"
    "owner"     = local.domain_user
    "purpose"   = "gameday"
  }

  depends_on = [aws_rds_cluster.aurora_cluster]
}

# Simplified approach to enable pgvector
resource "null_resource" "enable_pgvector" {
  count = try(var.scenario_config.database.postgres, false) ? 1 : 0
  provisioner "local-exec" {
    command = <<-EOT
      # Install PostgreSQL client if not available
      if ! command -v psql &> /dev/null; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
          brew install libpq
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
          sudo apt-get update && sudo apt-get install -y postgresql-client
        fi
      fi
            
      # Try to enable pgvector extension (Aurora PostgreSQL 17 should have it built-in)
      PGPASSWORD='${local.atlas_user_password}' psql \
        -h ${aws_rds_cluster.aurora_cluster[0].endpoint} \
        -U postgres \
        -d sample_airbnb \
        -c "CREATE EXTENSION IF NOT EXISTS vector;"
    EOT
  }

  depends_on = [
    aws_rds_cluster_instance.aurora_instance
  ]

  triggers = {
    cluster_endpoint = aws_rds_cluster.aurora_cluster[0].endpoint
  }
}

# Outputs - only create if postgres is enabled
output "aurora_cluster_endpoint" {
  description = "Aurora cluster endpoint"
  value       = try(var.scenario_config.database.postgres, false) ? aws_rds_cluster.aurora_cluster[0].endpoint : null
  sensitive   = false
}

output "aurora_cluster_reader_endpoint" {
  description = "Aurora cluster reader endpoint"
  value       = try(var.scenario_config.database.postgres, false) ? aws_rds_cluster.aurora_cluster[0].reader_endpoint : null
  sensitive   = false
}

output "aurora_database_name" {
  description = "Aurora database name"
  value       = try(var.scenario_config.database.postgres, false) ? aws_rds_cluster.aurora_cluster[0].database_name : null
  sensitive   = false
}

output "aurora_master_username" {
  description = "Aurora master username"
  value       = try(var.scenario_config.database.postgres, false) ? aws_rds_cluster.aurora_cluster[0].master_username : null
  sensitive   = false
}

output "aurora_connection_string" {
  description = "PostgreSQL connection string"
  value       = try(var.scenario_config.database.postgres, false) ? "postgresql://${aws_rds_cluster.aurora_cluster[0].master_username}:${local.atlas_user_password}@${aws_rds_cluster.aurora_cluster[0].endpoint}:5432/${aws_rds_cluster.aurora_cluster[0].database_name}" : null
  sensitive   = true
}

output "aurora_jdbc_url" {
  description = "JDBC connection URL"
  value       = try(var.scenario_config.database.postgres, false) ? "jdbc:postgresql://${aws_rds_cluster.aurora_cluster[0].endpoint}:5432/${aws_rds_cluster.aurora_cluster[0].database_name}" : null
  sensitive   = false
}

# PostgreSQL provider configuration - only if postgres is enabled
provider "postgresql" {
  host      = aws_rds_cluster.aurora_cluster[0].endpoint
  port      = 5432
  database  = aws_rds_cluster.aurora_cluster[0].database_name
  username  = aws_rds_cluster.aurora_cluster[0].master_username
  password  = local.atlas_user_password
  sslmode   = "require"
  superuser = false
}

# Create PostgreSQL users for each Atlas user first
resource "postgresql_role" "atlas_users" {
  for_each = try(var.scenario_config.database.postgres, false) ? { for user in local.atlas_user_list : user => user } : {}
  provider = postgresql
  name     = each.value
  login    = true
  password = local.atlas_user_password
  
  # Grant permissions to create databases so they can own their database
  create_database = true
  create_role     = false
  
  # Don't grant superuser - Aurora master user can't create superuser roles
  superuser = false
  
  depends_on = [
    null_resource.enable_pgvector,
    aws_rds_cluster_instance.aurora_instance
  ]
  
  lifecycle {
    create_before_destroy = false
  }
}

# Create a database for each user with the user as owner
resource "postgresql_database" "user_databases" {
  for_each = try(var.scenario_config.database.postgres, false) ? { for user in local.atlas_user_list : user => user } : {}
  provider = postgresql
  name     = each.value
  owner    = postgresql_role.atlas_users[each.key].name
  
  depends_on = [
    postgresql_role.atlas_users
  ]
  
  lifecycle {
    create_before_destroy = false
  }
}

# Output connection strings for each user's database
output "user_connection_strings" {
  description = "PostgreSQL connection strings for each user's database"
  value = try(var.scenario_config.database.postgres, false) ? {
    for user in local.atlas_user_list : user => "postgresql://${user}:${local.atlas_user_password}@${aws_rds_cluster.aurora_cluster[0].endpoint}:5432/${user}"
  } : {}
  sensitive = true
}

# Output JDBC URLs for each user's database
output "user_jdbc_urls" {
  description = "JDBC connection URLs for each user's database"
  value = try(var.scenario_config.database.postgres, false) ? {
    for user in local.atlas_user_list : user => "jdbc:postgresql://${aws_rds_cluster.aurora_cluster[0].endpoint}:5432/${user}"
  } : {}
  sensitive = false
}

# Download S3 backup and restore to all user databases using Kubernetes job
resource "kubernetes_job_v1" "restore_backup_to_users" {
  count = try(var.scenario_config.database.postgres, false) ? 1 : 0
  metadata {
    name = "restore-backup-to-users"
    labels = {
      app = "backup-restore"
    }
  }

  spec {
    template {
      metadata {
        labels = {
          app = "backup-restore"
        }
      }
      
      spec {
        restart_policy = "Never"
        host_network   = true
        
        container {
          name  = "backup-restore"
          image = "postgres:17"
          
          command = [
            "bash",
            "-c",
            <<-EOT
              set -e
              
              echo "Installing AWS CLI..."
              apt-get update && apt-get install -y curl unzip gzip
              curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
              unzip -q awscliv2.zip
              ./aws/install
              
              echo "Creating backup directory..."
              mkdir -p /backup
              
              # Check if backup already exists locally
              if [ ! -f /backup/airbnb-backup.sql ]; then
                echo "Downloading backup from S3..."
                /usr/local/bin/aws s3 cp "s3://mongodb-gameday/postgres-backups/airbnb-backup.sql.gz" /backup/airbnb-backup.sql.gz \
                  --region us-east-1 \
                  --no-cli-pager
                
                if [ $? -ne 0 ]; then
                  echo "Failed to download backup from S3"
                  exit 1
                fi
                
                echo "Decompressing backup..."
                gunzip -f /backup/airbnb-backup.sql.gz
              else
                echo "Backup file already exists, skipping download"
              fi
              
              echo "Starting database restoration for all users..."
              
              # List of users to restore to
              # USERS="${join(" ", local.atlas_user_list)}"
              USERS="${join(" ", [for user in local.atlas_user_list : user if user != "scott-capista"])}"
              
              for USER in $USERS; do
                echo "Processing user: $USER"
                
                # Check if this user's database has already been restored
                RESTORED=$(PGPASSWORD='${local.atlas_user_password}' psql \
                  -h ${aws_rds_cluster.aurora_cluster[0].endpoint} \
                  -U $USER \
                  -d $USER \
                  -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'listings';" 2>/dev/null || echo "0")
                
                RESTORED=$(echo $RESTORED | tr -d ' ')
                
                if [ "$RESTORED" = "1" ]; then
                  echo "Database for user $USER already restored (listings table exists), skipping..."
                  continue
                fi
                
                echo "Restoring backup to database: $USER"
                
                # Restore the backup to the user's database
                PGPASSWORD='${local.atlas_user_password}' psql \
                  -h ${aws_rds_cluster.aurora_cluster[0].endpoint} \
                  -U $USER \
                  -d $USER \
                  -f /backup/airbnb-backup.sql
                
                if [ $? -eq 0 ]; then
                  echo "Successfully restored backup to database: $USER"
                  
                  # Verify the restoration by checking table count
                  TABLE_COUNT=$(PGPASSWORD='${local.atlas_user_password}' psql \
                    -h ${aws_rds_cluster.aurora_cluster[0].endpoint} \
                    -U $USER \
                    -d $USER \
                    -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
                  
                  echo "Database $USER now has $(echo $TABLE_COUNT | tr -d ' ') tables"
                else
                  echo "Failed to restore backup to database: $USER"
                  exit 1
                fi
              done
              
              echo "Backup restoration completed for all users!"
              
            EOT
          ]
          
          env {
            name  = "AWS_DEFAULT_REGION"
            value = var.aws_region
          }
          
          env {
            name  = "AWS_REGION"
            value = var.aws_region
          }
          
          env {
            name  = "PGCONNECT_TIMEOUT"
            value = "10"
          }
          
          volume_mount {
            name       = "backup-storage"
            mount_path = "/backup"
          }
          
          resources {
            requests = {
              memory = "1Gi"
              cpu    = "500m"
            }
            limits = {
              memory = "2Gi"
              cpu    = "1000m"
            }
          }
        }
        
        volume {
          name = "backup-storage"
          empty_dir {
            size_limit = "1Gi"
          }
        }
      }
    }
    
    backoff_limit = 3
  }

  timeouts {
    create = "10m"
    update = "10m"
    delete = "5m"
  }
  
  depends_on = [
    postgresql_database.user_databases,
    postgresql_role.atlas_users,
    aws_eks_cluster.eks_cluster,
    aws_iam_role_policy_attachment.node_s3_mongodb_gameday_policy
  ]
}

# Output the job status
output "backup_restore_job_name" {
  description = "Name of the backup restore job"
  value       = try(var.scenario_config.database.postgres, false) ? kubernetes_job_v1.restore_backup_to_users[0].metadata[0].name : null
}
