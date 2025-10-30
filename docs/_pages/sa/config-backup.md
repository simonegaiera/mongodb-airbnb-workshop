---
title: "Config Backup Module"
permalink: /sa/config-backup/
layout: single
classes: wide
---

## Overview

The `config-backup` module is a lightweight Terraform module that serves two important purposes:

1. **Configuration Backup**: Automatically backs up your `config.yaml` to S3 for disaster recovery and audit purposes
2. **Usage Tracking**: Logs who is deploying arena-terragrunt environments and when

This module runs as part of the standard `terragrunt apply` workflow and requires no manual intervention.

## What Gets Backed Up

When you run `terragrunt apply`, the config-backup module automatically:

- Uploads your customer's `config.yaml` to S3
- Stores it at: `s3://mongodb-arena/terragrunt/<customer-name>/config.yaml`
- Updates the backup whenever the config file changes (based on MD5 hash)

## Usage Tracking

The module also automatically tracks usage by logging:

- **Customer Name**: Which customer environment is being deployed
- **AWS User**: Full ARN and user ID of who ran the deployment
- **Timestamp**: When the deployment was initiated
- **Config Hash**: MD5 hash of the configuration file
- **Additional Users Count**: Number of additional users from config
- **Project Name**: MongoDB Atlas project name
- **Cluster Name**: MongoDB cluster name

### Log Storage

Usage logs are stored as JSON files in S3:
```
s3://mongodb-arena/usage-logs/<customer-name>/<timestamp>.json
```

Each deployment creates a new timestamped log entry, making it easy to track arena-terragrunt usage across your organization.

### Viewing Usage Logs

To view all usage logs across all customers, run from your customer folder:

```bash
./config-backup/view_usage_logs.sh
```

To view logs for a specific customer only:

```bash
./config-backup/view_usage_logs.sh customer-name
```

The script will:
- Download all usage logs from S3
- Parse the JSON files
- Deduplicate entries (same date + customer + user = one entry)
- Generate a CSV file with all tracked information

**CSV Output Format:**
```csv
timestamp,customer,user,additional_users_count,project_name,cluster_name
2025-10-30,airbnb,john.doe,5,airbnb-project,arena-cluster
```

**Fields included:**
- `timestamp` - Date when the configuration was deployed (YYYY-MM-DD)
- `customer` - Customer folder name
- `user` - AWS username (extracted from ARN)
- `additional_users_count` - Number of additional users configured
- `project_name` - MongoDB Atlas project name
- `cluster_name` - MongoDB cluster name

**Deduplication Logic:**
The script automatically deduplicates entries based on:
- Same **date** (not exact timestamp)
- Same **customer** 
- Same **user**

If the same user deploys the same customer environment multiple times on the same day, only the LAST deployment for that day is included in the CSV. This ensures you see the most recent configuration and deployment information for each date, providing a cleaner view of daily deployment activity.

## Module Structure

```
config-backup/
├── main.tf              # Terraform configuration
├── terragrunt.hcl       # Terragrunt configuration
└── view_usage_logs.sh   # Helper script to view logs
```

## Implementation Details

### Terraform Resources

The `main.tf` file contains:

1. **AWS Provider Configuration**: Uses the AWS profile from your `config.yaml`
2. **Caller Identity Data Source**: Retrieves current AWS user information
3. **Config Backup Resource**: `aws_s3_object.config_backup` - Backs up config.yaml
4. **Usage Log Resource**: `aws_s3_object.usage_log` - Creates timestamped usage logs

### Terragrunt Configuration

The `terragrunt.hcl` file:
- References the root configuration to inherit common settings
- Passes customer name, AWS profile, and config file path as inputs
- Uses Terragrunt's built-in functions to locate the config file

## Why This Module Exists

### Configuration Backup Benefits
- **Disaster Recovery**: Restore configurations if local files are lost
- **Audit Trail**: Track changes to configuration over time
- **Central Repository**: All customer configs in one S3 bucket
- **Versioning**: S3 versioning can be enabled for complete history

### Usage Tracking Benefits
- **Visibility**: Know who is deploying what and when
- **Accountability**: Track resource usage across your organization
- **Planning**: Understand deployment patterns and frequency
- **Audit Compliance**: Maintain logs of infrastructure changes

## Running the Module

The config-backup module runs automatically when you deploy:

```bash
# Deploys ALL modules including config-backup
terragrunt apply --all
```

Or you can run it independently:

```bash
# Run just the config-backup module
terragrunt apply --working-dir=config-backup
```

## S3 Bucket Structure

After deployment, your S3 bucket will have this structure:

```
s3://mongodb-arena/
├── terragrunt/
│   ├── customer-1/
│   │   ├── config.yaml
│   │   └── atlas-cluster/terraform.tfstate
│   └── customer-2/
│       └── config.yaml
└── usage-logs/
    ├── customer-1/
    │   ├── 2025-10-30_143052.json
    │   └── 2025-10-30_150234.json
    └── customer-2/
        └── 2025-10-30_145621.json
```

## Troubleshooting

### Permission Issues

If you encounter permission errors, ensure your AWS profile has these S3 permissions for the `mongodb-arena` bucket:
- `s3:PutObject`
- `s3:GetObject`
- `s3:ListBucket`

### Viewing Logs Fails

If the `view_usage_logs.sh` script fails:
1. Verify you're using the correct AWS profile
2. Check that you have read access to the S3 bucket
3. Ensure `jq` is installed for JSON parsing: `brew install jq` (macOS)

### Module Not Running

The config-backup module only runs when explicitly called:
- With `terragrunt apply --all` (recommended)
- Or with `terragrunt apply --working-dir=config-backup`

It does NOT run when applying individual modules like `atlas-cluster` or `eks-cluster`.

---

> 💡 **Pro Tip**: The config-backup module is designed to be non-intrusive. If it fails for any reason, it won't block your main infrastructure deployment.

