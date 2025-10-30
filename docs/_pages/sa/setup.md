---
title: "Setup: Prerequisites"
permalink: /sa/setup/
layout: single
classes: wide
---

## 🐍 Python

1. **Verify Python 3 Installation**  
   Make sure Python 3 is installed on your machine.

2. **Create a Virtual Environment**  
   Use a virtual environment to keep dependencies isolated:
   ```bash
   python3 -m venv venv
   source venv/bin/activate   # macOS/Linux
   venv\Scripts\activate      # Windows
   ```

## 🏗️ Terraform

1. **Install Terraform**  
   ```bash
   brew tap hashicorp/tap
   brew install hashicorp/tap/terraform
   terraform --version
   ```
   To upgrade:
   ```bash
   brew upgrade hashicorp/tap/terraform
   ```

2. **Install Terragrunt**  
   ```bash
   brew install terragrunt
   terragrunt --version
   ```
   To upgrade:
   ```bash
   brew upgrade terragrunt
   ```

## ☁️ AWS

### AWS CLI

AWS CLI is required for AWS SSO authentication and managing AWS resources.

1. **Install AWS CLI**  
   
   **macOS:**
   ```bash
   brew install awscli
   ```
   
   **Linux:**
   ```bash
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install
   ```
   
   **Windows:**
   Download and run the AWS CLI MSI installer from [https://aws.amazon.com/cli/](https://aws.amazon.com/cli/)

2. **Verify Installation**  
   ```bash
   aws --version
   ```

3. **Upgrade AWS CLI** (if needed)  
   
   **macOS:**
   ```bash
   brew upgrade awscli
   ```
   
   **Linux/Windows:**
   Follow the same installation steps above to upgrade to the latest version.

### AWS SSO Access

Follow the documentation [here](https://wiki.corp.mongodb.com/pages/viewpage.action?pageId=109642642&spaceKey=10GEN&title=SA%2BAWS%2BAccess%2B-%2BUpdated%2BNov%2B2020) for detailed steps on setting up AWS SSO access.

> 💡 **Note:** You will need to configure an AWS profile that matches the `aws.profile` value in your `config.yaml` file (default: `"Solution-Architects.User-979559056307"`).

## Initial File Setup

1. **Copy Files**  
   - Duplicate the `airbnb` folder and rename it with your `customer` name.
   - For a fully managed solution, keep all folders.  
   - For a hybrid approach, which doesn't include VSCode Online, remove the `eks-cluster` folder.
