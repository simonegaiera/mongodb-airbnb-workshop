# GameDay Environment Setup Guide

Welcome to the GameDay preparation guide! Follow these steps to ensure a smooth setup process for your environment.

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

### Step 3: Setup Terraform Variables

1. **Prepare the Variable File**:
   - Duplicate the `terraform.tfvars.template` file and rename the copy to `terraform.tfvars`.

2. **Configure Your Settings**:
   - Open `terraform.tfvars` and update the settings to fit your specific needs.
   - Ensure that the API Keys included have `Organization Project Creator` permissions.

### Step 4: Initialize and Apply Terraform

1. **Run Terraform Commands**:
   - Execute the following commands in your terminal to initialize and apply your Terraform configuration successfully:

   ```bash
   # Initialize the Terraform working directory
   terraform init

   # Generate and display an execution plan
   terraform plan

   # Apply the changes required to reach the desired state
   terraform apply
   ```

Following these steps will help ensure a smooth setup for your GameDay environment. Good luck, and enjoy your GameDay experience!
