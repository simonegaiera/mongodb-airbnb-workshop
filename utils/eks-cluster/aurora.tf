# Create DB subnet group
resource "aws_db_subnet_group" "aurora_subnet_group" {
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
  cluster_identifier     = "${local.cluster_name}-aurora-cluster"
  engine                 = "aurora-postgresql"
  engine_mode           = "provisioned"
  engine_version        = "17.5"
  database_name         = "sample_airbnb"
  master_username       = "postgres"
  master_password       = "MongoGameDay123"
  
  serverlessv2_scaling_configuration {
    max_capacity = 1.0
    min_capacity = 0.5
  }

  db_subnet_group_name   = aws_db_subnet_group.aurora_subnet_group.name
  vpc_security_group_ids = [aws_security_group.aurora_sg.id]
  
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
  identifier         = "${local.cluster_name}-aurora-instance"
  cluster_identifier = aws_rds_cluster.aurora_cluster.id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.aurora_cluster.engine
  engine_version     = aws_rds_cluster.aurora_cluster.engine_version
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
      PGPASSWORD='MongoGameDay123' psql \
        -h ${aws_rds_cluster.aurora_cluster.endpoint} \
        -U postgres \
        -d sample_airbnb \
        -c "CREATE EXTENSION IF NOT EXISTS vector;"
    EOT
  }

  depends_on = [
    aws_rds_cluster_instance.aurora_instance
  ]

  triggers = {
    cluster_endpoint = aws_rds_cluster.aurora_cluster.endpoint
  }
}

# Outputs
output "aurora_cluster_endpoint" {
  description = "Aurora cluster endpoint"
  value       = aws_rds_cluster.aurora_cluster.endpoint
  sensitive   = false
}

output "aurora_cluster_reader_endpoint" {
  description = "Aurora cluster reader endpoint"
  value       = aws_rds_cluster.aurora_cluster.reader_endpoint
  sensitive   = false
}

output "aurora_database_name" {
  description = "Aurora database name"
  value       = aws_rds_cluster.aurora_cluster.database_name
  sensitive   = false
}

output "aurora_master_username" {
  description = "Aurora master username"
  value       = aws_rds_cluster.aurora_cluster.master_username
  sensitive   = false
}

output "aurora_connection_string" {
  description = "PostgreSQL connection string"
  value       = "postgresql://${aws_rds_cluster.aurora_cluster.master_username}:${local.atlas_user_password}@${aws_rds_cluster.aurora_cluster.endpoint}:5432/${aws_rds_cluster.aurora_cluster.database_name}"
  sensitive   = true
}

output "aurora_jdbc_url" {
  description = "JDBC connection URL"
  value       = "jdbc:postgresql://${aws_rds_cluster.aurora_cluster.endpoint}:5432/${aws_rds_cluster.aurora_cluster.database_name}"
  sensitive   = false
}

# PostgreSQL provider configuration

provider "postgresql" {
  host      = aws_rds_cluster.aurora_cluster.endpoint
  port      = 5432
  database  = aws_rds_cluster.aurora_cluster.database_name
  username  = aws_rds_cluster.aurora_cluster.master_username
  password  = local.atlas_user_password
  sslmode   = "require"
  superuser = false
}

# Create PostgreSQL users for each Atlas user (sequential execution)
resource "postgresql_role" "atlas_users" {
  for_each = toset(local.atlas_user_list)
  name     = each.value
  login    = true
  password = local.atlas_user_password
  
  # Grant permissions to create databases
  create_database = true
  create_role     = false
  
  # Don't grant superuser - Aurora master user can't create superuser roles
  superuser = false
  
  depends_on = [
    null_resource.enable_pgvector
  ]
  
  # Force sequential execution by creating dependencies on previous users
  lifecycle {
    create_before_destroy = false
  }
}

# Grant additional privileges to ensure read/write access on all databases
resource "postgresql_grant" "atlas_users_database_privileges" {
  for_each    = toset(local.atlas_user_list)
  database    = aws_rds_cluster.aurora_cluster.database_name
  role        = postgresql_role.atlas_users[each.value].name
  schema      = "public"
  object_type = "schema"
  privileges  = ["USAGE", "CREATE"]
  
  depends_on = [
    postgresql_role.atlas_users
  ]
  
  # Force sequential execution - wait for all roles to be created first
  lifecycle {
    create_before_destroy = false
  }
}

resource "postgresql_grant" "atlas_users_table_privileges" {
  for_each    = toset(local.atlas_user_list)
  database    = aws_rds_cluster.aurora_cluster.database_name
  role        = postgresql_role.atlas_users[each.value].name
  schema      = "public"
  object_type = "table"
  privileges  = ["SELECT", "INSERT", "UPDATE", "DELETE", "TRUNCATE", "REFERENCES", "TRIGGER"]
  
  depends_on = [
    postgresql_grant.atlas_users_database_privileges
  ]
  
  # Force sequential execution - wait for all database privileges to be granted first
  lifecycle {
    create_before_destroy = false
  }
}

resource "postgresql_grant" "atlas_users_sequence_privileges" {
  for_each    = toset(local.atlas_user_list)
  database    = aws_rds_cluster.aurora_cluster.database_name
  role        = postgresql_role.atlas_users[each.value].name
  schema      = "public"
  object_type = "sequence"
  privileges  = ["SELECT", "UPDATE", "USAGE"]
  
  depends_on = [
    postgresql_grant.atlas_users_table_privileges
  ]
  
  # Force sequential execution - wait for all table privileges to be granted first
  lifecycle {
    create_before_destroy = false
  }
}

# Output the created usernames for reference
output "postgresql_users" {
  description = "List of created PostgreSQL users"
  value       = values(postgresql_role.atlas_users)[*].name
  sensitive   = false
}
