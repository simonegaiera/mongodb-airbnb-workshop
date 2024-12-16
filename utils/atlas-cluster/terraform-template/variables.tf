
# The  public API key for MongoDB Atlas
variable "public_key" {
  description = "The public API key for MongoDB Atlas"
}
# The  public API key for MongoDB Atlas
variable "private_key" {
  description = "The private API key for MongoDB Atlas"
}

#The Atlas Project ID used to create the cluster 
variable "project_name" {
    description = "The Atlas Project ID used to create the cluster "
}

#The Atlas Project ID used to create the cluster 
variable "project_id" {
    description = "The Atlas Project ID used to create the cluster "
}

#The Atlas Project cluster name 
variable "cluster_name" {
    description = "The Atlas Project cluster name"
}

#The Atlas Project cluster region 
variable "cluster_region" {
    description = "The Atlas Project cluster region"
}

#The Atlas Project cluster region 
variable "cluster_type" {
    description = "The Atlas Project cluster type"
}

#The Atlas cloud provider_name
variable "atlas_provider_name" {
    description = "The Atlas cloud provider name"
}

# The Atlas provider instance sizz name
variable "atlas_provider_instance_size_name"{
    description = "The Atlas provider instance size name"
}

#The auto scaling option
variable "auto_scaling_disk_gb_enabled"{
    description = "auto scaling option"
}

# the version of Mongodb 
variable "mongo_db_major_version"{
    description = "the MongoDB Version"
}

variable "mongodb_atlas_database_username"{
    description = "MongoDB Atlas DB username" 
}

variable "mongodb_atlas_database_user_password"{
    description = "MongoDB Atlas DB password" 
}