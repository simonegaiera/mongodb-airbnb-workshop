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
   - Open `terraform.tfvars` and update the settings to meet your specific needs. Ensure your AWS credentials are accessible programmatically or through the AWS CLI:

   ```bash
   export AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY_ID"
   export AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_ACCESS_KEY"
   export AWS_SESSION_TOKEN="YOUR_AWS_SESSION_TOKEN"
   ```
  
   - **Note**: The default cluster expiration is set to one week from the creation date. Please plan accordingly or adjust the expiration parameter in your settings if needed.  

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

---

### Known Issue: Kubernetes Config Not Updated  

Sometimes, there is a known issue where the Kubernetes configuration does not get updated correctly. If you encounter this issue, follow these steps to resolve it:

1. **Login to AWS SSO**:  
   Run the following command to log in via AWS SSO:  
   ```bash
   aws sso login --profile Solution-Architects.User-979559056307
   ```

2. **Update the Kubernetes Config**:  
   Update the Kubernetes configuration to ensure it uses the correct EKS cluster:  
   ```bash
   aws eks update-kubeconfig --region us-east-2 --name airbnb-workshop-eks --profile Solution-Architects.User-979559056307
   ```

3. **Update Terraform Provider Configuration**:

   To ensure proper Kubernetes and Helm integration with the updated configuration, include the following in your `terraform.tf` file:

   ```hcl
   provider "kubernetes" {
   config_path = "~/.kube/config"
   }

   provider "helm" {
   kubernetes {
      config_path = "~/.kube/config"
   }
   }
   ```

### Known Issue: Autoscaler Not Configured Yet

Currently, the Kubernetes Cluster Autoscaler is not configured in the provided GameDay environment setup. This feature is planned for future releases. At present, scaling must be handled in Terraform.

We are actively working on integrating the Cluster Autoscaler into the environment, so stay tuned for updates in future releases!

---

Following these steps will help ensure a smooth setup for your GameDay environment. Good luck, and enjoy your GameDay experience!
