locals {
  config = yamldecode(file("./config.yaml"))
}

terraform {
  before_hook "validate_config" {
    commands     = ["apply", "plan", "init"]
    execute      = ["python3", "${get_parent_terragrunt_dir()}/validate_config.py", "${get_parent_terragrunt_dir()}/config.yaml"]
    run_on_error = false
  }
}

remote_state {
  backend = "s3"
  config = {
    bucket  = "mongodb-arena"
    key     = "terragrunt/${local.config.customer.name}/${path_relative_to_include()}/terraform.tfstate"
    region  = "us-east-1"
    profile = local.config.aws.profile
    encrypt = true
  }
}
