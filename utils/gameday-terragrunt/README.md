# GameDay Environment Setup Guide

Welcome to the GameDay preparation guide! Follow these steps to ensure a smooth setup process for your environment.

## Prerequisites

1. **Install Terraform**  
   ```bash
   brew tap hashicorp/tap
   brew install hashicorp/tap/terraform
   ```
   *Verify your installation:*  
   ```bash
   terraform --version
   ```
   > **Note:** If your Terraform version is older than the latest release, upgrade using:
   > ```bash
   > brew upgrade hashicorp/tap/terraform
   > ```

2. **Install Terragrunt**  
   ```bash
   brew install terragrunt
   ```
   *Verify your installation:*  
   ```bash
   terragrunt --version
   ```

3. **Login to AWS SSO**  
   ```bash
   aws sso login --profile Solution-Architects.User-979559056307
   ```

## Customer Folder Setup

> **Instructions:**  
> This section explains how to set up the customer folder from the airbnb folder.  
> *Add your specifics here...*

## Next Steps

- Configure your Terraform and Terragrunt settings.  
- To initialize all configurations across folders, run:
  ```bash
  terragrunt run-all init
  ```
- Run initial commands to set up your environment.
- Refer to the official [Terragrunt documentation](https://terragrunt.gruntwork.io/) for advanced configuration.

## Next Steps: Deploy and Manage Your Environment

You can follow these commands:

1. **Init**  
   To initialized all configurations:
   ```bash
   terragrunt run-all init
   ```

2. **Plan**  
   To see what changes Terragrunt/Terraform will make:
   ```bash
   terragrunt run-all plan
   ```

3. **Apply**  
   To apply the changes and create/update your infrastructure:
   ```bash
   terragrunt run-all apply -auto-approve
   ```

4. **Destroy**  
   Once you are done and want to clean up your environment:
   ```bash
   terragrunt run-all destroy
   ```

Make sure to review the plan carefully before applying and destroy only when you no longer need the resources.
