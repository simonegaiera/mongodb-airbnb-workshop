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
  default     = "arena"
}

variable "sample_database_name" {
  description = "Name of the sample database"
  type        = string
  default     = "sample_airbnb"
}

variable "common_database_name" {
  description = "Name of the sample database"
  type        = string
  default     = "arena_shared"
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

variable "database_admin_password" {
  description = "MongoDB Atlas DB password"
  type        = string
  default     = "Mongo123/Admin"
}

variable "customer_user_password" {
  description = "MongoDB Customer DB password"
  type        = string
  default     = "Mongo123"
}

variable "user_list_path" {
  description = "Path to the User List CSV file"
  type        = string
  default     = "./user_list.csv"
  nullable    = true
}

variable "user_start_index" {
  description = "Starting index for additional database users (e.g., 1 means users start from clustername1, 10 means users start from clustername10)"
  type        = number
  default     = 0
}

variable "additional_users_count" {
  description = "Number of additional database users to create beyond those in the CSV file"
  type        = number
  default     = 0
}

variable "create_indexes" {
  description = "Whether to create indexes"
  type        = bool
  default     = false
}
