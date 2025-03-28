# GameDay Environment Setup Guide

Welcome to the GameDay preparation guide! Follow these steps to ensure a smooth setup process for your environment.

## Preparation Steps

### Step 1: Create the Atlas Cluster
Instructions available here: [atlas-cluster setup instructions](https://github.com/simonegaiera/mongodb-airbnb-workshop/tree/main/utils/atlas-cluster)

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

### Step 3: Setup Terraform Variables

1. **Prepare the Variable File**:
   - Find the file named `terraform.tfvars.template` in your project directory.
   - Make a copy of this template and rename it to `terraform.tfvars`. This file will hold your specific configuration values.

2. **Configure Your Settings**:
   - Open `terraform.tfvars` and update the settings to meet your specific needs.
   - Modify the `customer` name, `aws_region`, and `domain_email`.
   - Add a `atlas_terraform` if is not in the default location
   - **Note**: The default cluster expiration is set to one week from the creation date. Please plan accordingly or adjust the expiration parameter in your settings if needed.  

### Step 4: Initialize and Apply Terraform

1. **Login to AWS SSO**:  
   Run the following command to log in via AWS SSO:  
   ```bash
   aws sso login --profile Solution-Architects.User-979559056307
   ```

2. **Run Terraform Commands**:
   - Execute the following commands in your terminal to initialize and apply your Terraform configuration successfully:

   ```bash
   # Initialize the Terraform working directory
   terraform init -upgrade

   # Generate and display an execution plan
   terraform plan

   # Apply the changes required to reach the desired state
   terraform apply -auto-approve
   ```

---

Following these steps will help ensure a smooth setup for your GameDay environment. Good luck, and enjoy your GameDay experience!
