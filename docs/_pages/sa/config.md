---
title: "Configuration"
permalink: /sa/config/
layout: single
classes: wide
---

## Central Configuration File

- Open `config.yaml` in your customer folder and update the following values:
  - **`customer.name`**: Replace `"customer"` with your customer name.
  - **`mongodb.public_key`**: Replace `"PUBLIC_KEY"` with your MongoDB Atlas public API key.
  - **`mongodb.private_key`**: Replace `"PRIVATE_KEY"` with your MongoDB Atlas private API key (requires `Organization Project Creator` privileges).
  - **`mongodb.project_name`**: Replace `"PROJECT_NAME"` with your desired Atlas project name.
  - **`mongodb.cluster_name`**: Modify if needed (default: `"arena-cluster"`).
  - **`mongodb.cluster_region`**: Modify if needed (default: `"US_EAST_2"`).
  - **`mongodb.instance_size`**: Modify if needed (default: `"M30"`).
  - **`mongodb.additional_users_count`**: Number of additional unassigned users to create beyond those in `user_list.csv` (default: `0`).
  - **`mongodb.create_indexes`**: Set to `true` to create indexes during deployment, or `false` to skip index creation (default: `false`).
  - **`mongodb.database_admin_password`**: Password for the database admin user (default: `"MongoArenaAdminDummy"`).
  - **`mongodb.customer_user_password`**: Password for customer users (default: `"MongoArenaDummy"`).
  - **`aws.region`**: AWS region for EKS cluster (default: `"us-east-2"`).
  - **`aws.profile`**: AWS profile to use for authentication (default: `"Solution-Architects.User-979559056307"`).
  - **`domain.email`**: Replace `"arena@mongodb.com"` with your domain contact email.
  - **`scenario`**: Workshop scenario configuration including repository, branch, database settings, LLM configuration, leaderboard type, and workshop instructions sections.

> 💡 **Note:** The HCL files (`root.hcl`, `terragrunt.hcl`, `atlas-cluster/terragrunt.hcl`, `eks-cluster/terragrunt.hcl`) automatically read from this central configuration file, so you don't need to edit them individually.

> 📦 **Config Backup:** Every time you run `terragrunt apply` from the customer directory, your `config.yaml` file is automatically backed up to S3 at `s3://mongodb-arena/terragrunt/<customer-name>/config.yaml` for tracking your running configuration.

## MongoDB Atlas Configuration

- Navigate to `customer/atlas-cluster`.  
- Update `user_list.csv` with the list of attendees.  
- Modify other variables in `terragrunt.hcl` if necessary (e.g., MongoDB version, auto-scaling settings).
- Index creation is controlled by the `mongodb.create_indexes` setting in `config.yaml` (set to `true` to create indexes, `false` to skip).
- By default, a new Atlas Project is created. To use an existing project instead, the project must be imported before applying. Alternatively, the code to use a `data` instead of a `resource` is available in terraform.
- If you need to invite users, uncomment `mongodbatlas_project_invitation`. By default, no invitations are sent.

## EKS Configuration (Skip for Hybrid)

### Workshop Scenario Configuration

The scenario configuration is now part of the central `config.yaml` file under the `scenario` section.

Customize the workshop by editing the `scenario` section in `config.yaml`:
- **`repository`** and **`branch`**: GitHub repository and branch to use for the workshop
- **`database`**: Enable MongoDB and/or PostgreSQL
- **`llm`**: LLM configuration including provider, model, and proxy settings
  - **`provider`**: Options are `"anthropic"` or `"openai"` (default: `"openai"`)
  - **`model`**: Options are `"claude-3-haiku"` or `"gpt-5-chat"` (default: `"gpt-5-chat"`)
- **`leaderboard`**: Set to `"timed"` or `"score"` based
- **`prizes`**: Configure prizes promotions for the workshop
  - **`enabled`**: Set to `true` to enable prizes features
  - **`where`**: Location or context for the prizes (e.g., `"Happy Hour"`)
  - **`when`**: Time for the prizes (e.g., `"4:30 PM"`)
- **`instructions.sections`**: Define workshop sections with titles and content paths

> **Note:** You can leave the `content` arrays empty (`[]`) for sections if you don't want to include specific content.

Note that the cluster expires after one week by default.
