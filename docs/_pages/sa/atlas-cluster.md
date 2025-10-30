---
title: "Reference: Atlas Cluster Module"
permalink: /sa/atlas-cluster/
layout: single
classes: wide
---

> ⚠️ **Disclaimer:** This documentation was AI-generated ("vibe coded") and has not been fully verified yet. Please review carefully and report any inaccuracies.

The `atlas-cluster` module uses Terraform to automate the complete deployment and configuration of your MongoDB Atlas infrastructure for the workshop environment.

## 🔧 How Terraform Automates the Deployment

The Terraform code in this module automates everything from cluster creation to user provisioning. Here's what happens when you run `terragrunt apply`:

### 1. **Atlas Project Setup** (`main.tf` lines 23-25)
Terraform connects to an existing Atlas project using the MongoDB Atlas provider:
```hcl
data "mongodbatlas_project" "project" {
  name = var.project_name
}
```
> Note: You can uncomment the `mongodbatlas_project` resource if you want Terraform to create a new project instead.

### 2. **MongoDB Cluster Creation** (`main.tf` lines 40-80)
Creates a production-ready MongoDB cluster with:
- **3-node replica set** for high availability
- **Auto-scaling enabled** (compute and storage)
- **Backup enabled** with point-in-time recovery
- Scales from M30 up to M60 based on workload

### 3. **Backup Configuration** (`main.tf` lines 82-106)
Sets up automated backup schedules:
- **Hourly snapshots** - Retained for 2 days
- **Daily snapshots** - Retained for 5 days
- **Restore window** - 1 day

### 4. **Network Access** (`main.tf` lines 129-137)
Configures IP access lists:
- Cloudflare IP range (104.30.164.0/28) for CDN access
- Can be extended to include EKS cluster IPs or 0.0.0.0/0 for open access

### 5. **Database Users** (`main.tf`)

#### Admin User (lines 139-158)
- Username: `{cluster_name}-admin`
- Role: `atlasAdmin`
- Full administrative access to the cluster

#### Custom Role for Workshop (lines 171-249)
Creates a specialized role `{cluster_name}-arena-role` with permissions to:
- **Read** from shared collections (participants, results, leaderboards)
- **Insert** test results
- **Create** indexes and collections
- **List** collections and indexes

#### Participant Users (lines 252-284)
For each user in `user_list.csv` + additional users, Terraform creates:
- **Individual database account** (username from email or `clustername{N}`)
- **Read/Write access** to their personal database
- **Read-only access** to the arena shared database
- **Same password** for all participants (configurable)

### 6. **User Processing** (`parse_users.py`)

This Python script is called by Terraform's `external` data source to process the user list:

**Purpose:** Convert CSV file into Terraform-compatible user data

**How it works:**
1. **Reads CSV File** (`user_list.csv`)
   - Parses email addresses from the CSV
   - Extracts name and surname if provided
   
2. **Sanitizes Usernames**
   - Takes email prefix (before @)
   - Removes special characters
   - Converts to lowercase
   - Example: `john.doe@example.com` → `john-doe`

3. **Generates Additional Users**
   - Creates numbered users based on `additional_users_count`
   - Format: `{cluster_name}{index}` (e.g., `arena0`, `arena1`, `arena2`)
   - Uses `user_start_index` to control starting number
   - Example: If `start_index=10`, creates `arena10`, `arena11`, etc.

4. **Returns JSON to Terraform**
   - Output format: `{"username": "email@example.com", ...}`
   - Terraform uses this to create `mongodbatlas_database_user` resources
   - Additional users have `null` email (no invitation sent)

**Script Arguments:**
```bash
parse_users.py <csv_file> <output_format> <additional_count> <cluster_name> <start_index>
```

- `csv_file`: Path to user_list.csv (or "null" if none)
- `output_format`: "email" (default), "ids", or "all"
- `additional_count`: Number of extra users to create
- `cluster_name`: Prefix for numbered users
- `start_index`: Starting index for numbered users

### 7. **Database Population** (`populate_database_airnbnb.py`)

This comprehensive Python script orchestrates the complete database setup after cluster deployment.

**Purpose:** Automate all database, collection, and index setup for the workshop

**Script Arguments:**
```bash
populate_database_airnbnb.py <connection_string> <database_name> <public_key> 
  <private_key> <project_id> <cluster_name> <csv_file> <common_database> 
  <additional_users_count> <create_indexes> <user_start_index>
```

**Execution Flow:**

#### Step 1: Load Sample Airbnb Dataset
```python
# Uses MongoDB Atlas Admin API
POST /api/atlas/v2/groups/{project_id}/sampleDatasetLoad/{cluster_name}
```
- Triggers Atlas to load the official `sample_airbnb` dataset
- **Contains 5,555 property listings** with real-world data
- Polls every 30 seconds until `state != "WORKING"`
- Typical load time: 2-5 minutes

#### Step 2: Create Shared Database (`arena_shared`)

**Collections Created:**
- **`participants`** - User profile and registration data
  - Stores: username, email, name, registration timestamp
  - One document per workshop participant
  
- **`results`** - Exercise validation results
  - Stores: user, exercise, score, timestamp, validation details
  - Updated by results processor when users submit exercises
  
- **`results_health`** - System health monitoring
  - Tracks results processor status and health checks

- **`scenario_config`** - Workshop configuration
  - Stores scenario settings from Terragrunt config
  - Used by portal to configure workshop behavior

**Views Created:**
- **`timed_leaderboard`** - Aggregation view for time-based rankings
  - Sorts by completion time (fastest first)
  - Shows progress percentage
  
- **`score_leaderboard`** - Aggregation view for score-based rankings
  - Sorts by total score (highest first)
  - Weighted scoring per exercise

#### Step 3: Create Per-User Databases

For each user from `parse_users.py`:

1. **Create Personal Database** (named after username)
   ```python
   client[user_id].create_collection('listingsAndReviews')
   ```

2. **Clone Sample Data**
   ```python
   # Uses $out aggregation to clone collection
   client['sample_airbnb']['listingsAndReviews'].aggregate([
     {'$out': {'db': user_id, 'coll': 'listingsAndReviews'}}
   ])
   ```
   - Each user gets their own copy of 5,555 listings
   - Enables safe experimentation without affecting others

3. **Create Results Collection**
   ```python
   client[user_id].create_collection('results')
   ```
   - Empty collection for test result submissions
   - Users write here, results processor reads and validates

#### Step 4: Create Search Indexes (Optional)

Only runs if `CREATE_INDEXES=true`:

**Standard Index** (`indexes/crud/beds_1_price_1.json`)
```json
{
  "keys": {"beds": 1, "price": 1},
  "name": "beds_1_price_1"
}
```
- Performance optimization for common queries
- Applied to each user's database

**Atlas Search Index** (`indexes/search/search_index.json`)
```json
{
  "analyzer": "lucene.english",
  "searchAnalyzer": "lucene.english",
  "mappings": {
    "dynamic": false,
    "fields": {
      "amenities": [
        { "type": "stringFacet" },
        { "type": "token" }
      ],
      "beds": [
        { "type": "numberFacet" },
        { "type": "number" }
      ],
      "name": {
        "type": "autocomplete",
        "minGrams": 3,
        "maxGrams": 7
      },
      "property_type": [
        { "type": "stringFacet" },
        { "type": "token" }
      ]
    }
  }
}
```
- English language text analysis with autocomplete on property names
- Faceted search on amenities, beds, and property_type
- Applied to `sample_airbnb.listingsAndReviews`

**Vector Search Index** (`indexes/vector-search/vector_index.json`)
```json
{
  "fields": [
    {
      "type": "text",
      "path": "description",
      "model": "voyage-3-large"
    },
    {
      "type": "filter",
      "path": "property_type"
    }
  ]
}
```
- Semantic search using Voyage AI's voyage-3-large embedding model
- Embeddings generated from property description field
- Filterable by property_type for refined search
- Applied to `sample_airbnb.listingsAndReviews`

**Index Creation Process:**
```python
# Uses MongoDB Atlas Admin API
POST /api/atlas/v2/groups/{project_id}/clusters/{cluster_name}/search/indexes
```
- Indexes build asynchronously
- Can take 5-15 minutes depending on cluster size
- Status checked via API polling

#### Step 5: Database Cleanup (Optional)

If users are removed from CSV between deployments:
```python
def delete_user_databases(user_ids, client):
    for user_id in user_ids:
        client.drop_database(user_id)
```
- Compares current user list with previous
- Removes databases for decommissioned users
- Frees up storage space

**Error Handling:**
- Retries on connection failures
- Continues on non-critical errors
- Logs all operations for troubleshooting
- Returns detailed status to Terraform

**Python Dependencies** (`requirements.txt`):
```txt
pymongo[srv]>=4.0
requests>=2.28.0
certifi>=2022.0.0
```

## 📊 Terraform Outputs

After successful deployment, Terraform outputs key connection information (`main.tf` lines 286-308):

- **`standard_srv`** - MongoDB connection string for the cluster
- **`admin_user`** - Admin username (e.g., `arena-cluster-admin`)
- **`admin_password`** - URL-encoded admin password
- **`user_password`** - URL-encoded participant password
- **`user_list`** - Array of all participant usernames

These outputs are automatically passed to the EKS module for seamless integration with the workshop portal.

## 📁 Module Structure

The Atlas cluster deployment consists of two parts:

### Terraform Module (`utils/atlas-cluster/`)
```
atlas-cluster/
├── main.tf                          # Core Terraform resources
├── variables.tf                     # Input variables
├── parse_users.py                   # User list processor
├── populate_database_airnbnb.py     # Database setup automation
├── requirements.txt                 # Python dependencies
├── user_list.csv                    # Template user list
├── README.md                        # Module documentation
└── indexes/                         # Index definitions
    ├── crud/
    │   └── beds_1_price_1.json      # Standard index
    ├── search/
    │   └── search_index.json        # Atlas Search index
    └── vector-search/
        └── vector_index.json        # Vector Search index
```

### Customer Configuration (`utils/arena-terragrunt/<customer>/`)
```
<customer>/                          # e.g., airbnb, dallas, dk, sa
├── config.yaml                      # Customer-specific configuration
├── root.hcl                         # Root Terragrunt configuration
├── atlas-cluster/
│   ├── terragrunt.hcl              # Terragrunt wrapper for atlas-cluster
│   └── user_list.csv               # Customer-specific participant list
└── eks-cluster/
    └── terragrunt.hcl              # Terragrunt wrapper for eks-cluster
```

## ⚙️ Configuration

All configuration is centralized in `config.yaml` at the customer folder level:

### Key Settings

```yaml
mongodb:
  public_key: "YOUR_PUBLIC_KEY"
  private_key: "YOUR_PRIVATE_KEY"
  project_name: "workshop-project"
  cluster_name: "arena-cluster"
  cluster_region: "US_EAST_2"
  instance_size: "M30"
  create_indexes: false
  additional_users_count: 0
  database_admin_password: "MongoArenaAdminDummy"
  customer_user_password: "MongoArenaDummy"
```

### User List

Edit `user_list.csv` in your customer folder to add participant information:
```csv
name,surname,email
john,doe,john.doe@example.com
jane,smith,jane.smith@example.com
bob,wilson,bob.wilson@example.com
```

Each user will receive:
- Individual database credentials (username derived from email prefix)
- Personal database with full listingsAndReviews dataset
- Read-only access to the shared arena database
- Entry in the participant tracking system

## ⏱️ Deployment Time

- **Initial deployment**: 10-15 minutes
- **With indexes**: 15-20 minutes
- **Data population**: Included in deployment time

## 🔒 Security Features

- **Network Access** - Configured to allow access from workshop environment
- **Database Authentication** - Individual user credentials
- **Encryption** - At rest and in transit (Atlas default)
- **IP Allowlisting** - Automatically configured

## 💡 Tips & Best Practices

### Before Deployment
1. Verify your Atlas API keys have `Organization Project Creator` permissions
2. Review and update `user_list.csv` with actual participant emails
3. Choose appropriate cluster size based on expected load

### Index Creation
- Set `create_indexes: true` if you need Search/Vector Search indexes automated
- Indexes take additional time to build
- Can be created later if needed

### Existing Projects
- Import existing projects to avoid creating duplicates
- Useful for testing or iterative deployments
- Requires project ID from Atlas UI

### User Invitations
- By default, no email invitations are sent to participants
- Uncomment `mongodbatlas_project_invitation` in code to enable
- Participants receive credentials through the workshop portal

## 📊 Output Information

After successful deployment, the module outputs:
- **Connection String** - MongoDB connection URI
- **Project ID** - Atlas project identifier
- **Cluster Name** - Name of the deployed cluster
- **User Credentials** - Stored securely for distribution

---

> 💡 **Note:** The atlas-cluster module can be deployed independently from the EKS cluster, making it ideal for hybrid workshop setups where participants use their own local development environment.

