# MongoDB AI Arena Environment Setup Guide

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
   - Duplicate the `airbnb` folder and rename it with your `customer` name.
   - For a fully managed solution, keep all folders.  
   - For a hybrid approach, which doesn't include VSCode Online, remove the `eks-cluster` folder.

2. **Central Configuration File**  
   - Open `config.yaml` in your customer folder and update the following values:
     - **`customer.name`**: Replace `"customer"` with your customer name.
     - **`mongodb.public_key`**: Replace `"PUBLIC_KEY"` with your MongoDB Atlas public API key.
     - **`mongodb.private_key`**: Replace `"PRIVATE_KEY"` with your MongoDB Atlas private API key (requires `Organization Project Creator` privileges).
     - **`mongodb.project_name`**: Replace `"PROJECT_NAME"` with your desired Atlas project name.
     - **`mongodb.cluster_name`**: Modify if needed (default: `"arena-cluster"`).
     - **`mongodb.cluster_region`**: Modify if needed (default: `"US_EAST_2"`).
     - **`mongodb.instance_size`**: Modify if needed (default: `"M30"`).
     - **`mongodb.additional_users_count`**: Number of additional unassigned users to create beyond those in `user_list.csv` (default: `0`).
     - **`aws.region`**: AWS region for EKS cluster (default: `"us-east-2"`).
     - **`domain.email`**: Replace `"arena@mongodb.com"` with your domain contact email.
     - **`scenario`**: Workshop scenario configuration including repository, branch, database settings, LLM configuration, leaderboard type, and workshop instructions sections.
   
   > 💡 **Note:** The HCL files (`root.hcl`, `atlas-cluster/terragrunt.hcl`, `eks-cluster/terragrunt.hcl`) automatically read from this central configuration file, so you don't need to edit them individually.

3. **MongoDB Atlas Configuration**  
   - Navigate to `customer/atlas-cluster`.  
   - Update `user_list.csv` with the list of attendees.  
   - Modify other variables in `terragrunt.hcl` if necessary (e.g., MongoDB version, auto-scaling settings).
   - By default, a new Atlas Project is created. To use an existing project instead, the project must be imported before applying. Alternatively, the code to use a `data` instead of a `resource` is available in terraform.
   - If you need to invite users, uncomment `mongodbatlas_project_invitation`. By default, no invitations are sent.

4. **EKS Configuration (Skip for Hybrid)**  
  - **Workshop Scenario Configuration:**  
    - The scenario configuration is now part of the central `config.yaml` file under the `scenario` section.
    - Customize the workshop by editing the `scenario` section in `config.yaml`:
      - **`repository`** and **`branch`**: GitHub repository and branch to use for the workshop
      - **`database`**: Enable MongoDB and/or PostgreSQL
      - **`llm`**: LLM configuration including provider, model, and proxy settings
        - **`provider`**: Options are `"anthropic"` or `"openai"` (default: `"openai"`)
        - **`model`**: Options are `"claude-3-haiku"` or `"gpt-5-chat"` (default: `"gpt-5-chat"`)
      - **`leaderboard`**: Set to `"timed"` or `"score"` based
      - **`prices`**: Configure pricing promotions for the workshop
        - **`enabled`**: Set to `true` to enable pricing features
        - **`where`**: Location or context for the pricing (e.g., `"Happy Hour"`)
        - **`when`**: Time for the pricing (e.g., `"4:30 PM"`)
      - **`instructions.sections`**: Define workshop sections with titles and content paths
    - **Note:** You can leave the `content` arrays empty (`[]`) for sections if you don't want to include specific content.
   - Note that the cluster expires after one week by default.

## Deployment and Management

1. **Login to AWS SSO**  
   Follow the documentation [here](https://wiki.corp.mongodb.com/pages/viewpage.action?pageId=109642642&spaceKey=10GEN&title=SA%2BAWS%2BAccess%2B-%2BUpdated%2BNov%2B2020) for detailed steps on logging into AWS SSO.  
   Once you have completed the steps, use the following command:
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
     terragrunt run --working-dir=eks-cluster -- taint '<resource.name>'
     ```

   > 💡 **Tip:** Always run `terragrunt plan --all` before applying to review the changes that will be made.

   - **To remove a resource from the Terraform state using Terragrunt:**  
     This is useful if you need to "forget" a resource without destroying it.  
     Replace `<module-directory>` with the relevant module folder and `<resource_address>` with the resource to remove:
     ```bash
     terragrunt run --working-dir=<module-directory> -- state rm '<resource_address>'
     ```

5. **Destroy**  
   - **To destroy all modules:**  
     ```bash
     terragrunt destroy --all
     ```
   - **To destroy a specific module:**  
     Replace `<module-directory>` with the desired module folder:
     ```bash
     terragrunt destroy --working-dir=<module-directory>
     ```

Always review any plan before applying changes. Destroy resources only when they are no longer needed.

## Additional Notes

- **Leaderboard Exclusion:**  
      If you do not want a user to appear in the leaderboard, you can manually add the field `leaderboard: false` (as a boolean value) to their document in the participant collection.

- **SSL Verification:**  
   SSL configuration has already been ensured and the environment is rated **A+**.
  - You can verify your domain with [SSL Labs SSL Test](https://www.ssllabs.com/ssltest/analyze.html).
  - You can also check with [Zscaler Zulu URL Risk Analyzer](https://zulu.zscaler.com/).
  - Additional reputation and security checks can be performed using:
    - [Talos Intelligence Reputation Center](https://talosintelligence.com/reputation_center/)  
    - [FortiGuard Web Filter](https://www.fortiguard.com/webfilter)  
    - [Broadcom Bluecoat Site Review](https://sitereview.bluecoat.com/)
    - [Palo Alto Networks URL Filtering](https://urlfiltering.paloaltonetworks.com/)
