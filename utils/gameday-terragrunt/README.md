# GameDay Environment Setup Guide

Welcome to the GameDay preparation guide! Follow these steps to ensure a smooth setup process for your environment.

## Prerequisites

### Step 1: Python3 Setup

1. **Verify Python3 Installation**:
   - Make sure Python 3 is installed on your laptop.
   
2. **Set Up a Virtual Environment**:
   - It's recommended to run your scripts within a virtual environment (venv). If not already set up, you can create and activate it with these commands:

   ```bash
   # Create a virtual environment
   python3 -m venv venv

   # Activate the virtual environment (macOS/Linux)
   source venv/bin/activate

   # Activate the virtual environment (Windows)
   venv\Scripts\activate
   ```

### Step 2: Terraform Setup

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

## Environment Configuration

- Copy the `airbinb` folder.
- To run fully managed, keep all folders.
- For a hybrid setup, remove the `eks-cluster` folder in the copied directory.

### Environment: Atlas
- Navigate to the `atlas-cluster` folder.
- Update `user_list.csv` to include required users.
- Edit `terragrunt.hcl` with MongoDB Atlas API keys and other necessary details.
- Ensure your API keys have `Organization Project Creator` permissions.

#### Additional Configurations
- For existing Atlas projects, comment out the `mongodbatlas_project` resource and uncomment the matching `data` statement.
- Replace `mongodbatlas_project.project.id` references with `data.mongodbatlas_project.project.id`.
- Terraform defaults to not inviting users. Uncomment `mongodbatlas_project_invitation` to enable invites.

### Environment: EKS (Skip if running Hybrid setup)
- Adjust `terragrunt.hcl` to fit specific needs, such as `customer`, `aws_region`, and `domain_email`.
- Assign `atlas_terraform` if not using the default path.
- By default, clusters expire one week after creation. Modify expiration settings as needed.

## Deploy and Manage Your Environment

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
