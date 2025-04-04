remote_state {
  backend = "s3"
  config = {
    bucket  = "mongodb-gameday"
    key     = "terragrunt/${path_relative_to_include()}/terraform.tfstate"
    region  = "us-east-1"
    profile = "Solution-Architects.User-979559056307"
    encrypt = true
  }
}
