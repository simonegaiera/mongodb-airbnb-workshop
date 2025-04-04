# GameDay Environment Setup Guide

Below is a clearer version of the setup instructions.

## Prerequisites

### Python 3

1. **Check Python 3**  
   Make sure Python 3 is installed.
2. **Set Up Virtual Environment**  
   It's often best to keep code isolated in a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate   # macOS/Linux
   venv\Scripts\activate      # Windows
   ```

### Terraform

1. **Install Terraform**  
   ```bash
   brew tap hashicorp/tap
   brew install hashicorp/tap/terraform
   terraform --version
   ```
   If you need to upgrade:
   ```bash
   brew upgrade hashicorp/tap/terraform
   ```
2. **Install Terragrunt**  
   ```bash
   brew install terragrunt
   terragrunt --version
   ```
3. **Login to AWS SSO**  
   ```bash
   aws sso login --profile Solution-Architects.User-979559056307
   ```

## Environment Configuration

1. **Copy Files**  
   - Copy the `airbinb` folder to a new `customer` folder.
   - For a fully managed setup, keep everything.
   - For a hybrid setup, remove the `eks-cluster` folder.

2. **Atlas Environment**  
   - Go to `customer/atlas-cluster`.
   - Update `user_list.csv` as needed.
   - Edit `terragrunt.hcl` with your MongoDB Atlas API keys (must have `Organization Project Creator`).
   - For existing Atlas projects:
     - Comment out the `mongodbatlas_project` resource.
     - Uncomment the relevant `data` statement.
     - Update references to `mongodbatlas_project.project.id` with `data.mongodbatlas_project.project.id`.
     - Uncomment `mongodbatlas_project_invitation` if you need to invite users.

3. **EKS Environment (Ignore for Hybrid)**  
   - Adjust `terragrunt.hcl` for your `customer`, `aws_region`, and `domain_email`.
   - By default, clusters expire after one week. Change if needed.

## Deploy and Manage

1. **Init**
   ```bash
   terragrunt run-all init
   ```
2. **Plan**
   ```bash
   terragrunt run-all plan
   ```
3. **Apply**
   ```bash
   terragrunt run-all apply -auto-approve
   ```
4. **Destroy**
   ```bash
   terragrunt run-all destroy
   ```

Review the plan before applying changes, and destroy only when you’re done with the resources.
