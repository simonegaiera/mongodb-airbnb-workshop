# GameDay Environment Setup

Welcome to the GameDay preparation guide! Follow these steps to ensure a smooth setup process.

## Preparation Steps

### Step 1: Collect the User List

- Create a file named `user_list.csv` using the provided template.
- Ensure the file includes all users relevant to your project.
- A mandatory field in this file is `email`.

### Step 2: Python3 Setup

- Verify that you have Python 3 installed on your laptop.
- It's recommended to run your scripts within a virtual environment (venv). If not already setup, you can create and activate a virtual environment using the following commands:

  ```bash
  python3 -m venv venv
  source venv/bin/activate   # On macOS/Linux
  venv\Scripts\activate      # On Windows
  ```

## Generate Terraform Configuration

### Step 3: Setup Terraform Variables

1. Duplicate the `terraform.tfvars.template` file and rename the copy to `terraform.tfvars`.
2. Open `terraform.tfvars` and update the settings to fit your specific needs.
   - Ensure that the API Keys included have `Organization Project Creator` permissions.

### Step 4: Initialize and Apply Terraform

- Run the following Terraform commands in sequence to initialize and apply your setup:

  ```bash
  terraform init      # Initializes the Terraform working directory.
  terraform plan      # Prepares an execution plan and shows what Terraform will do.
  terraform apply     # Applies the changes required to reach the desired state.
  ```
