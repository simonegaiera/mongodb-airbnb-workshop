# GameDay Environment Setup Guide (Revised)

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

## Environment Configuration

1. **Copy Files**  
   - Duplicate the `airbinb` folder and rename it with your `customer` name.
   - For a fully managed solution, keep all folders.  
   - For a hybrid approach, remove the `eks-cluster` folder.
   - Open the `root.hcl` and change `customer` with your customer name in `config.key`.

2. **MongoDB Atlas Configuration**  
   - Navigate to `customer/atlas-cluster`.  
   - Update `user_list.csv` if necessary.  
   - In `terragrunt.hcl`, replace placeholders `public_key` and `private_key` with your MongoDB Atlas API keys (requires `Organization Project Creator` privileges).
   - Modify the `project_name` with your customer name.
   - Modify the other variables, if necessary.
   - By default, a new Atlas Project is created. To use an existing project instead:
     - Comment out the `mongodbatlas_project` resource.
     - Uncomment the relevant `data` statement.
     - Update references that use `mongodbatlas_project.project.id` to `data.mongodbatlas_project.project.id`.
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
   terragrunt run-all init
   ```

3. **Plan**  
   ```bash
   terragrunt run-all plan
   ```

4. **Apply**  
   ```bash
   terragrunt run-all apply -auto-approve
   ```

5. **Destroy**  
   ```bash
   terragrunt run-all destroy
   ```

Always review any plan before applying changes. Destroy resources only when they are no longer needed.
