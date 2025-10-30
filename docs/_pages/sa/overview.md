---
title: "Getting Started"
permalink: /sa/
layout: single
classes: wide
---

Welcome to the MongoDB AI Arena environment setup guide for Solutions Architects! This guide will walk you through setting up a complete workshop environment for your customers.

---

> 💬 **Need Help?** Join the **[#ai-arena](https://mongodb.enterprise.slack.com/archives/C08JJKV3T0A)** Slack channel for real-time support, questions, and collaboration with the team!

---

## 📝 TL;DR

**Quick Summary:**
1. Install prerequisites (Python, Terraform, AWS CLI)
2. Configure your environment (edit `config.yaml` with customer details and MongoDB credentials)
3. Deploy using Terragrunt (initialize, plan, apply)

**Time Required:** 30-45 minutes (excluding AWS infrastructure provisioning time)

---

## 🚀 The 3 Main Steps

### Step 1: Setup Prerequisites
Before you begin, you'll need to install and configure the necessary tools on your local machine:

- **Python 3** - For running deployment scripts
- **Terraform & Terragrunt** - Infrastructure as Code tools for deploying the environment
- **AWS CLI** - For AWS authentication and resource management
- **AWS SSO Access** - Configured access to the MongoDB Solutions Architects AWS account

👉 [Go to Setup: Prerequisites](/sa/setup/)

---

### Step 2: Environment Configuration
Configure your workshop environment by editing a central configuration file:

- **Customer Details** - Set customer name and AWS settings
- **MongoDB Atlas** - Configure cluster settings, region, instance size, and API keys
- **Workshop Scenario** - Choose database options, LLM provider, and leaderboard type
- **User Management** - Add participant emails and set passwords

All configuration is centralized in a single `config.yaml` file, making it easy to customize the workshop for your customer's needs.

👉 [Go to Environment: Configuration](/sa/config/)

---

### Step 3: Deploy and Run
Deploy the complete infrastructure using Terragrunt:

- **Initialize** - Set up Terragrunt modules and dependencies
- **Plan** - Review the infrastructure changes before applying
- **Apply** - Deploy MongoDB Atlas cluster, EKS cluster (optional), and workshop environment
- **Manage** - Learn how to destroy resources when the workshop is complete

The deployment process is automated and typically takes 15-20 minutes for the MongoDB Atlas cluster and 30-40 minutes for the full EKS environment.

👉 [Go to Deployment: Deploy and Run](/sa/deployment/)

---

## 🎯 What Gets Deployed?

When you complete the setup, you'll have:

- **MongoDB Atlas Cluster** - Fully configured with sample data and indexes
- **User Accounts** - Individual credentials for each workshop participant
- **Workshop Portal** (Optional) - Web-based IDE and workshop interface via EKS
- **Automated Testing** - Built-in validation for participant exercises
- **Leaderboard** - Real-time tracking of participant progress

---

## 💡 Deployment Options

- **Fully Managed** - Complete environment with online VSCode IDE (requires EKS)
- **Hybrid** - MongoDB Atlas only, participants use their own IDE (no EKS needed)

Choose the option that best fits your workshop format!

---

## 🆘 Need Help?

If you encounter any issues during setup:
1. Check the detailed instructions on each step page
2. Verify your AWS SSO credentials are current
3. Ensure all prerequisites are properly installed
4. Review Terragrunt error messages for specific guidance
5. **Join the Slack channel** - Ask questions and get support from the team

💬 **Slack Support:** Join the **[#ai-arena](https://mongodb.enterprise.slack.com/archives/C08JJKV3T0A)** Slack channel for real-time assistance and to connect with other SAs setting up workshop environments.

Ready to get started? Head to [Setup: Prerequisites](/sa/setup/) to begin!
