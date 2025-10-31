---
title: "Environment: Configuration"
permalink: /sa/config/
layout: single
classes: wide
---

## Setup Your Customer Folder

Before configuring, you need to create your customer-specific deployment folder:

1. **Navigate to the arena-terragrunt directory:**
   ```bash
   cd ./utils/arena-terragrunt/
   ```

2. **Copy the airbnb folder:**
   ```bash
   cp -r airbnb your-customer-name
   ```
   Replace `your-customer-name` with your actual customer name (e.g., `acme-corp`, `demo-2024`).

3. **Navigate to your new customer folder:**
   ```bash
   cd your-customer-name
   ```

> 💡 **Note:** For a hybrid approach (without VSCode Online/EKS), remove the `eks-cluster` folder from your customer directory after copying.

All subsequent configuration and deployment commands will be run from this customer folder.

## Configuration Overview

All configuration is centralized in the `config.yaml` file in your customer folder. This single file controls all aspects of your deployment including MongoDB Atlas, AWS/EKS, and workshop scenario settings.

> 💡 **Note:** The HCL files (`root.hcl`, `terragrunt.hcl`, `atlas-cluster/terragrunt.hcl`, `eks-cluster/terragrunt.hcl`) automatically read from this central configuration file, so you don't need to edit them individually.

> 📦 **Config Backup:** Every time you run `terragrunt apply` from the customer directory, your `config.yaml` file is automatically backed up to S3 at `s3://mongodb-arena/terragrunt/<customer-name>/config.yaml`.

## Required Configuration

Open `config.yaml` in your customer folder and update these **required** values:

### Customer & Domain
- **`customer.name`**: Replace `"customer"` with your customer name.
- **`domain.email`**: Replace `"arena@mongodb.com"` with your domain contact email.

### MongoDB Atlas (Required)
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

### AWS Configuration (Required)
- **`aws.profile`**: AWS profile to use for authentication (default: `"Solution-Architects.User-979559056307"`).
- **`aws.region`**: AWS region for EKS cluster (default: `"us-east-2"`).

### Workshop Scenario Configuration (for EKS deployments)
The `scenario` section in `config.yaml` controls your workshop setup:
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

> **Note:** For hybrid deployments (without EKS/VSCode Online), skip the scenario configuration section.


## Additional Atlas Configuration (Optional)

If you need more granular control over Atlas settings:

- Navigate to `customer/atlas-cluster`.
- Update `user_list.csv` with SA names for testing the environment (not for workshop attendees).
- Modify variables in `terragrunt.hcl` if necessary (e.g., MongoDB version, auto-scaling settings).
- By default, a new Atlas Project is created. To use an existing project instead, the project must be imported before applying.
- If you need to invite users, uncomment `mongodbatlas_project_invitation` in the Terraform files. By default, no invitations are sent.

> 🕐 **Note:** The EKS cluster expires after one week by default.

## Scenario Instructions Examples

### Example 1: Full Instructions Configuration
This includes all workshop sections with empty content arrays, allowing flexibility to add specific content:

```yaml
instructions:
  base: "navigation-guided.yml"
  sections:
    - title: "Workshop Introduction"
      content: []
    - title: "Workshop Onboarding"
      content:
        - "/guided/"
        - "/guided/vscode/"
        - "/guided/collection/"
        - "/guided/leaderboard/"
    - title: "CRUD Operations"
      content: []
    - title: "Aggregations"
      content: []
    - title: "Search"
      content: []
    - title: "Vector Search"
      content: []
```

### Example 2: Targeted Instructions Configuration
This includes specific workshop content paths for a curated experience:

> ⚠️ **Important:** If your workshop includes Search or Vector Search sections (like this example), you **must** enable index creation in your `config.yaml`:
> ```yaml
> mongodb:
>   create_indexes: true
> ```
> This ensures that the necessary search indexes and vector search indexes are created during deployment.

```yaml
instructions:
  base: "navigation-guided.yml"
  sections:
    - title: "Workshop Introduction"
      content:
        - "/"
    - title: "Workshop Onboarding"
      content:
        - "/guided/vscode-nop/"
        - "/guided/collection/"
    - title: "CRUD Operations"
      content:
        - "/crud/1/"
        - "/crud/2/"
        - "/crud/4/"
        - "/crud/6/"
        - "/crud/7/"
    - title: "Aggregations"
      content:
        - "/pipeline/2/"
    - title: "Search"
      content:
        - "/search/1/"
    - title: "Vector Search"
      content:
        - "/vector-search/1/"
```

> 💡 **Key Differences:**
> - **Full version** has empty content arrays (`[]`) for sections, giving you flexibility to customize all sections
> - **Targeted version** specifies exact workshop exercises for a focused, curated workshop experience

---

✅ **Configuration complete?** Head to [Deployment: Deploy and Run](/sa/deployment/) to deploy your environment!
