# AI Arena Environment Setup Guide

Welcome to the AI Arena preparation guide! Follow these steps to ensure a smooth setup process for your environment.

## Preparation Steps

### Step 1: Collect the User List

1. **Create a CSV File**: 
   - Name your file `user_list.csv` and use the provided template as a guide.
   - Ensure the file includes all users relevant to your project.
   - The `email` field is mandatory and must be filled in for each user.

### Step 2: Python3 Setup

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

## Generate Terraform Configuration

### Step 3: Configure Terraform for MongoDB Atlas

1. **Create a Custom Variable File**:
   - Create a file `terraform.tfvars` that will hold your specific configuration values.

2. **Update the Variable File**:
   - Open your newly created `terraform.tfvars` file.
   - Modify the file to include your specific settings, such as your MongoDB Atlas API keys.
   - Ensure these API keys have the necessary permissions, including `Organization Project Creator`, to allow Terraform to manage your resources.

3. **Modify the Main Configuration**:
   - Open the `main.tf` file, which contains the core declarations for your Terraform setup.
   - Customize the settings in `main.tf` to suit your deployment needs.
   - By default, the configuration will instruct Terraform to create a new MongoDB Atlas Project.
     - If you prefer to use an existing Atlas project instead, adjust the configuration:
       - Comment out the `resource` `mongodbatlas_project` that creates a new project.
       - Uncomment the `mongodbatlas_project` `data` to reference an existing project.
       - Update all references from `mongodbatlas_project.project.id` to `data.mongodbatlas_project.project.id` to ensure consistency in the configuration.
   - By dafault, Terraform is configured to avoid inviting the users to the Project. Remove the comments to the `mongodbatlas_project_invitation` resource to disable this functionality.

### Step 4: Initialize and Apply Terraform

1. **Run Terraform Commands**:
   - Execute the following commands in your terminal to initialize and apply your Terraform configuration successfully:

   ```bash
   # Initialize the Terraform working directory
   terraform init -upgrade

   # Generate and display an execution plan
   terraform plan

   # Apply the changes required to reach the desired state
   terraform apply
   ```

Following these steps will help ensure a smooth setup for your Atlas GameDay environment.
