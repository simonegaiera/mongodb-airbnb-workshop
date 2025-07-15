# GameDay Environment Setup Guide

## Prerequisites

### Python 3
1. **Verify Python 3 Installation**  
   Make sure Python 3 is installed on your machine.

2. **Create a Virtual Environment**  
   Use a virtual environment to keep dependencies isolated:
   ```bash
   python3 -m venv venv
   source venv/bin/activate   # macOS/Linux
   venv\Scripts\activate      # Windows
   ```

### Terraform and Terragrunt
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

## Environment Configuration

1. **Copy Files**  
   - Duplicate the `airbinb` folder and rename it with your `customer` name.
   - For a fully managed solution, keep all folders.  
   - For a hybrid approach, which doesn't include VSCode Online, remove the `eks-cluster` folder.
   - Open the `root.hcl` and change `customer` with your customer name in `config.key`.

2. **MongoDB Atlas Configuration**  
   - Navigate to `customer/atlas-cluster`.  
   - Update `user_list.csv` with the list of attendees.  
   - In `terragrunt.hcl`, replace placeholders `public_key` and `private_key` with your MongoDB Atlas API keys (requires `Organization Project Creator` privileges).
   - Modify the `project_name` with your customer name.
   - Modify the other variables, if necessary.
   - By default, a new Atlas Project is created. To use an existing project instead, the project must be imported before applying. Alternatively, the code to use a `data` instead of a `resource` is available in terraform.
   - If you need to invite users, uncomment `mongodbatlas_project_invitation`. By default, no invitations are sent.

3. **EKS Configuration (Skip for Hybrid)**  
   - In the `eks-cluster` folder, update `terragrunt.hcl` with your `customer` name, `aws_region`, and `domain_email`.  
   - Note that the cluster expires after one week by default.

## Deployment and Management

1. **Login to AWS SSO**  
   ```bash
   aws sso login --profile Solution-Architects.User-979559056307
   ```

2. **Initialize**  
   ```bash
   terragrunt init --all --upgrade
   ```

3. **Plan**  
   ```bash
   terragrunt plan --all
   ```

   If you want to use an existing Atlas project (instead of creating a new one), import it before applying:
   ```bash
   terragrunt import --working-dir=atlas-cluster mongodbatlas_project.project <project_id>
   ```

4. **Apply**  
   Before you run the apply step, make sure your Python virtual environment is active.

   - **To deploy all modules at once (default):**
     ```bash
     terragrunt apply --all
     ```

   In most cases, you only need to run the default apply command below to deploy all modules.  
   The following commands are for advanced or specific scenarios.

   - **To apply a specific module:**  
     Replace `<module-directory>` with the desired module folder:
     ```bash
     terragrunt apply --working-dir=<module-directory>
     ```

   - **To taint (mark for recreation) a specific resource in the EKS module:**
     ```bash
     terragrunt run --working-dir=eks-cluster -- taint resource.name
     ```

   > 💡 **Tip:** Always run `terragrunt plan --all` before applying to review the changes that will be made.

5. **Destroy**  
   ```bash
   terragrunt destroy --all
   ```

Always review any plan before applying changes. Destroy resources only when they are no longer needed.
