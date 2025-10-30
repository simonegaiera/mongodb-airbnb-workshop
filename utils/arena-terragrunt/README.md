# Arena Terragrunt - MongoDB AI Arena Infrastructure

Terragrunt configurations for deploying MongoDB AI Arena workshop environments.

## 📖 Full Documentation

For complete setup instructions, visit: **[mongoarena.com/sa/overview](https://mongoarena.com/sa/overview/)**

## 💬 Support

Need help? Join **[#ai-arena](https://mongodb.enterprise.slack.com/archives/C08JJKV3T0A)** on Slack

---

## Quick Start

### 1. Setup Your Customer Folder

```bash
# Copy the airbnb folder and rename it with your customer name
cp -r airbnb your-customer-name
cd your-customer-name
```

### 2. Configure

Edit `config.yaml` with your customer details, MongoDB Atlas credentials, and AWS settings.

### 3. Deploy

```bash
# Login to AWS SSO
aws sso login --profile Solution-Architects.User-979559056307

# Navigate to your customer folder
cd ./utils/arena-terragrunt/
cd your-customer-name

# Initialize
terragrunt init --all --upgrade

# Plan (review changes)
terragrunt plan --all

# Apply (deploy)
terragrunt apply --all
```

### 4. Destroy

```bash
# ⚠️ Important: Download user_leaderboard data first!
terragrunt destroy --all
```

## Common Commands

```bash
# Apply specific module
terragrunt apply --working-dir=atlas-cluster

# Import existing Atlas project
terragrunt import --working-dir=atlas-cluster mongodbatlas_project.project <project_id>

# Destroy specific module
terragrunt destroy --working-dir=atlas-cluster
```

