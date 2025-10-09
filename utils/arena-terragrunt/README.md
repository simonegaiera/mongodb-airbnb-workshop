# MongoDB AI Arena Environment Setup Guide

💡 **Tip:** Reminder that this process is automating the creating of a number of cloud resources and so clusters will be cleaned up after one week by default; please remember to destroy this (details below) when your work is complete!

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
   - Navigate to `utils/arena-terragrunt`
   - Duplicate the `airbinb` directory and rename it with your `customer` name.
      > Do not use capital letters or special characters in the customer name

      > For a fully managed solution, keep all directories.  
      
      > For a hybrid approach, which doesn't include VSCode Online, remove the `eks-cluster` directory.
   - Within the new `customer` directory:
      - Open the `config.yaml` and update the values, ensuring the customer name matches the directory created above.
         > 💡 **Tip:** Now is a good time to make sure both the database and the API key allow access from the Kubernetes external IP address and 0.0.0.0 to support access from the Kubernetes cluster and the eventual end users.
      - Update `atlas-cluster/user_list.csv` to define attendees
      - Create a `scenario.json` file in the `eks-cluster` directory
         > Example templates include `"vibe-coding"` and `"guided-exercises"`, which can be copied to `scenario.json` as a starter
      
         > If you do not remove the core airbnb folder, make sure to create a `scenario.json` file there, too!
         
         > For any scenario, you can leave the `sections` in the `instructions` field as empty arrays (`[]`) if you do not want to include specific content for those sections.

         > The leaderboard can be either `"timed"` (default) or `"score"` based; set this in your scenario configuration as needed.


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
   ```bash
   terragrunt apply --all
   ```
   > It is common that this process errors partway through due to the timing of resource creation, if this happens, just re-run the command and it will continue properly.

   > Even after this process completes, it may take a few minutes for the arena website to become available.

   - **NOTE:** In most cases, you only need to run the default apply command below to deploy all modules.  The following commands are for advanced or specific scenarios.

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
     > 💡 **Tip:** If destroying fails, you may need to re-authenticate to AWS via step 1 above.

**Destroy resources only when they are no longer needed.**

## Additional Notes

- **Advanced Configuration**
   Advanced configuration can be done directly in the related `hcl` files, effectively bypassing the `config.yaml`.  Feel free to review `<customer>/root.hcl`, `<customer>/atlas-cluster/terragrunt.hcl`, and `<customer>/eks-cluster/terragrunt.hcl` to review additional configuration options.

- **SSL Verification:**  
  SSL configuration has already been ensured and the environment is rated **A+**.
  - You can verify your domain with [SSL Labs SSL Test](https://www.ssllabs.com/ssltest/analyze.html).
  - You can also check with [Zscaler Zulu URL Risk Analyzer](https://zulu.zscaler.com/).
  - Additional reputation and security checks can be performed using:
    - [Talos Intelligence Reputation Center](https://talosintelligence.com/reputation_center/)  
    - [FortiGuard Web Filter](https://www.fortiguard.com/webfilter)  
    - [Broadcom Bluecoat Site Review](https://sitereview.bluecoat.com/)
    - [Palo Alto Networks URL Filtering](https://urlfiltering.paloaltonetworks.com/)
