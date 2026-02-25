---
title: "Deployment: Deploy and Run"
permalink: /sa/deployment/
layout: single
classes: wide
---

## Deployment Steps

### 1. Login to AWS SSO

Use the following command to login (replace with the profile configured in your `config.yaml`):
```bash
aws sso login --profile Solution-Architects.User-979559056307
```

> 💡 **Note:** The AWS profile used here should match the `aws.profile` value in your `config.yaml` file.

### 2. Initialize

To initialize Terragrunt, run the following command in your `customer` folder inside `arena-terragrunt`. This ensures all modules and dependencies are set up correctly for your environment:

```bash
cd ./utils/arena-terragrunt/your-customer
terragrunt init --all --upgrade
```

Replace `your-customer` with the actual name of your customer folder. Running `terragrunt init --all --upgrade` here helps avoid issues with module references and ensures a clean environment for deployment.

### 3. Plan

```bash
terragrunt plan --all
```

### 4. Apply

Before you run the apply step, make sure your Python virtual environment is active.

> **Note:** Keep your laptop unlocked while running terraform. Locking your laptop may interrupt the terraform process.

- **To deploy all modules at once (default):**
  ```bash
  terragrunt apply --all
  ```
  
- **To backup config.yaml to S3:**
  The config file is automatically backed up when you run `terragrunt apply` from the customer directory:
  ```bash
  terragrunt apply
  ```
  This uploads your `config.yaml` to S3 at `s3://mongodb-arena/terragrunt/<customer-name>/config.yaml`.

In most cases, you only need to run the default apply command above to deploy all modules.  
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

### 5. Destroy

> **Important:** Before destroying, download the content of the view `user_leaderboard` in the `arena_shared` database to obtain participants' names and emails.

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

### SSL Verification
SSL configuration has already been ensured and the environment is rated **A+**.
- You can verify your domain with [SSL Labs SSL Test](https://www.ssllabs.com/ssltest/analyze.html).
- You can also check with [Zscaler Zulu URL Risk Analyzer](https://zulu.zscaler.com/).
- Additional reputation and security checks can be performed using:
  - [Talos Intelligence Reputation Center](https://talosintelligence.com/reputation_center/)  
  - [FortiGuard Web Filter](https://www.fortiguard.com/webfilter)  
  - [Broadcom Bluecoat Site Review](https://sitereview.bluecoat.com/)
  - [Palo Alto Networks URL Filtering](https://urlfiltering.paloaltonetworks.com/)

---

✅ **Deployment complete!** You're all set!

{% include simple_next_nav.html %}
