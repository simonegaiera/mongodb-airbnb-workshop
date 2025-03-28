# Users Configuration

By default, this module configures VSCode Online users for the EKS cluster using outputs from the Atlas deployment. 
Thise section is useful when the cluster is provisioned separately from Atlas.

## How It Works

- **Customization:**  
  While the default configuration uses Atlas outputs, you can override these settings to use alternative user configurations when needed.

   ```bash
   data "external" "user_data" {
   program = ["python3", "${path.module}/users/parse_users.py", "${path.module}/users/user_list.csv"]
   }

   locals {
   atlas_user_list = keys(data.external.user_data.result)
   }
   ```