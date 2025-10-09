locals {
  config = yamldecode(file("./config.yaml"))
}

remote_state {
  backend = "s3"
  config = {
    bucket  = "mongodb-arena"
    key     = "terragrunt/${local.config.customer.name}/${path_relative_to_include()}/terraform.tfstate"
    region  = "us-east-1"
    profile = "Solution-Architects.User-979559056307"
    encrypt = true
  }
}
