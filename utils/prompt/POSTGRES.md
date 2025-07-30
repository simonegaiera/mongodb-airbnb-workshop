# PostgreSQL Database Backup and Restore to S3

This document outlines the process for backing up and restoring PostgreSQL databases from Aurora to S3.

## Configuration Details

- **Database**: `jdbc:postgresql://mongoai-gameday-eks-aurora-cluster.cluster-c2fwyhwvkqkf.us-east-2.rds.amazonaws.com:5432/simone-gaiera`
- **S3 Bucket**: `mongodb-gameday`
- **S3 Region**: `us-east-1`
- **AWS Profile**: `Solution-Architects.User-979559056307`

## Prerequisites

### 1. Install PostgreSQL Client
```bash
# macOS
brew install libpq
export PATH="/opt/homebrew/opt/libpq/bin:$PATH"
```

### 2. Configure AWS CLI
```bash
# Set AWS profile
export AWS_PROFILE="Solution-Architects.User-979559056307"

# Verify configuration
aws configure list --profile "Solution-Architects.User-979559056307"
aws s3 ls s3://mongodb-gameday --profile "Solution-Architects.User-979559056307"
```

## Backup Process

### One-Shot Backup Command

```bash
# Set environment variables
export PGPASSWORD="your_database_password"
export AWS_PROFILE="Solution-Architects.User-979559056307"
export S3_BUCKET="mongodb-gameday"
export BACKUP_NAME="airbnb-backup"
export DATABASE_NAME="simone-gaiera"

# Backup database to S3 (without comments, which includes extension comments)
pg_dump \
  -h mongoai-gameday-eks-aurora-cluster.cluster-c2fwyhwvkqkf.us-east-2.rds.amazonaws.com \
  -U postgres \
  -d $DATABASE_NAME \
  --verbose --no-owner --no-privileges --no-comments \
  --exclude-table-data=pg_stat_statements \
  | gzip | aws s3 cp - "s3://$S3_BUCKET/postgres-backups/$BACKUP_NAME.sql.gz" \
        --profile "$AWS_PROFILE"
```
