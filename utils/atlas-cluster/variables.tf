variable "public_key" {
  description = "The public API key for MongoDB Atlas"
  type        = string
  default     = "public_key"
}

variable "private_key" {
  description = "The private API key for MongoDB Atlas"
  type        = string
  default     = "private_key"
}

variable "project_name" {
  description = "The Atlas Project ID used to create the cluster"
  type        = string
  default     = "arena-customer"
}

variable "cluster_name" {
  description = "The Atlas Project cluster name"
  type        = string
  default     = "airbnb-arena"
}

variable "sample_database_name" {
  description = "Name of the sample database"
  type        = string
  default     = "sample_airbnb"
}

variable "common_database_name" {
  description = "Name of the sample database"
  type        = string
  default     = "airbnb_arena"
}


variable "cluster_region" {
  description = "The Atlas Project cluster region"
  type        = string
  default     = "US_EAST_2"
}

variable "cluster_type" {
  description = "The Atlas Project cluster type"
  type        = string
  default     = "REPLICASET"
}

variable "atlas_provider_name" {
  description = "The Atlas cloud provider name"
  type        = string
  default     = "AWS"
}

variable "atlas_provider_instance_size_name" {
  description = "The Atlas provider instance size name"
  type        = string
  default     = "M30"
}

variable "auto_scaling_disk_gb_enabled" {
  description = "auto scaling option"
  type        = bool
  default     = true
}

variable "mongo_db_major_version" {
  description = "the MongoDB Version"
  type        = string
  default     = "8.0"
}

variable "mongodb_atlas_database_username" {
  description = "MongoDB Atlas DB username"
  type        = string
  default     = "admin"
}

variable "mongodb_atlas_database_user_password" {
  description = "MongoDB Atlas DB password"
  type        = string
  default     = "MongoGameDay123"
}

variable "customer_user_password" {
  description = "MongoDB Customer DB password"
  type        = string
  default     = "MongoGameDay123"
}

variable "user_list_path" {
  description = "Path to the User List CSV file"
  type        = string
  default     = "./user_list.csv"
}
