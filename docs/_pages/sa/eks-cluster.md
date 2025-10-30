---
title: "Reference: EKS Cluster Module"
permalink: /sa/eks-cluster/
layout: single
classes: wide
---

> ⚠️ **Disclaimer:** This documentation was AI-generated ("vibe coded") and has not been fully verified yet. Please review carefully and report any inaccuracies.

The `eks-cluster` module deploys a complete Kubernetes-based workshop environment on AWS, providing participants with browser-based VSCode instances and a full workshop portal.

## 📦 What Gets Deployed

The eks-cluster module creates a complete workshop environment on AWS EKS:

### Core Infrastructure
- **EKS Cluster** - Managed Kubernetes with auto-scaling nodes
- **Networking** - VPC, subnets, security groups, DNS (Route53)
- **Storage** - EFS for persistent user workspaces
- **Security** - SSL/TLS certificates (Let's Encrypt), IAM roles

### User Environment (Per Participant)
- **VSCode Online** - Browser-based IDE with pre-installed extensions
- **MongoDB Database** - Isolated database per user
- **PostgreSQL Database** - Optional, isolated per user
- **Workspace Files** - Workshop repo cloned and ready

### Workshop Portal
- **Frontend** - Next.js application with leaderboard and instructions
- **Backend API** - Python Flask server for user management
- **Documentation** - Jekyll-built workshop instructions
- **Results Processor** - Automated exercise validation

### Optional Components
- **LiteLLM Proxy** - Unified LLM API (OpenAI/Anthropic) with caching
- **Redis Cache** - LLM response caching to reduce API costs


## ⚙️ Configuration

All configuration is centralized in `config.yaml` at the customer folder level:

### AWS Settings

```yaml
aws:
  region: "us-east-2"
  profile: "Solution-Architects.User-979559056307"
```

### Workshop Scenario Configuration

```yaml
scenario:
  repository: "https://github.com/simonegaiera/mongodb-airbnb-workshop"
  branch: "main"
  
  database:
    mongodb: true
    postgresql: false
  
  llm:
    enabled: true
    provider: "openai"  # or "anthropic"
    model: "gpt-5-chat"  # or "claude-3-haiku"
    proxy_enabled: true
  
  leaderboard:
    type: "timed"  # or "score"
  
  prizes:
    enabled: true
    where: "Happy Hour"
    when: "4:30 PM"
  
  instructions:
    sections:
      - title: "Welcome & Setup"
        content: ["/guided/", "/guided/vscode/"]
      - title: "CRUD Operations"
        content: ["/crud/", "/crud/1/"]
```

## ⏱️ Deployment Time

- **EKS cluster + infrastructure**: 30-40 minutes
- **User environments**: 5-7 minutes (for ~10 users)
- **Total**: ~45-75 minutes depending on configuration

## 💡 Key Features

- **🌐 Domain & DNS** - Automatic Route53 configuration with per-user subdomains and A+ rated SSL
- **🔒 Security** - TLS encryption, IAM roles, namespace isolation, security groups
- **👤 Per-User Isolation** - Dedicated VSCode instance, database, and workspace per participant
- **📊 Progress Tracking** - Real-time leaderboard with automated exercise validation
- **🤖 AI Integration** - Optional LLM support (OpenAI/Anthropic) with response caching
- **⚡ Scalability** - Auto-scaling nodes, on-demand resource provisioning

## 📁 Module Structure & Components

The eks-cluster module is organized by **folders**, where each folder represents a deployable component with its own Helm chart. Each component has a corresponding `.tf` file that orchestrates its deployment.

### 🏗️ Folder-Based Architecture

```
utils/eks-cluster/
├── Core Infrastructure (.tf files)
│   ├── main.tf              # Providers & backend
│   ├── variables.tf         # Input variables
│   ├── infra.tf            # VPC & networking
│   ├── eks.tf              # EKS cluster
│   ├── efs.tf              # Persistent storage
│   └── route53.tf          # DNS & SSL
│
├── Component Folders (Helm Charts)
│   ├── mdb-openvscode/     → openvscode.tf
│   ├── mdb-nginx/          → nginx.tf
│   ├── portal-server/      → arena-portal.tf
│   ├── portal-nginx/       → arena-portal.tf
│   ├── docs-nginx/         → docs-nginx.tf
│   ├── scenario-definition/→ scenario-definition.tf
│   ├── litellm/            → litellm.tf (optional)
│   ├── redis/              → redis.tf (optional)
│   └── results-processor/  (mounted in VSCode)
│
└── Supporting Folders
    ├── aws_policies/       # IAM policy documents
    ├── nginx-conf-files/   # Nginx templates
    ├── nginx-html-files/   # Static HTML pages
    └── mongodb-arena-portal/ # Portal source code
```

### 📦 How It Works: Folder = Deployable Component

**Key Concept**: Each folder with a Helm chart represents one deployable service. The corresponding `.tf` file orchestrates its deployment with environment-specific configuration.

**Example**:
- `mdb-openvscode/` folder contains the complete Helm chart for VSCode
- `openvscode.tf` file deploys it with dynamic configuration (user list, MongoDB URIs, etc.)

**Benefits**:
- ✅ **Self-contained**: Each component has all its manifests, scripts, and config in one place
- ✅ **Reusable**: Helm charts can be versioned and reused across different customers
- ✅ **Clear ownership**: Easy to identify what each folder deploys
- ✅ **Modular**: Add/remove components by adding/removing folders

### 📦 Component Folder Structure

Each component folder contains a complete Helm chart:
```
component-name/
├── Chart.yaml              # Helm chart metadata
├── values.yaml            # Default configuration values
├── templates/             # Kubernetes manifests
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── configmap.yaml
│   └── ...
└── files/                 # Scripts and assets
    ├── startup.sh
    └── ...
```

### Core Infrastructure Files

#### `main.tf` - Foundation & Providers
The backbone of the module, configuring:
- **Terraform Backend**: S3 backend for state management
- **Providers**: AWS (~6.0), ACME (~2.35), PostgreSQL (~1.22), Kubernetes (~2.37), Helm (~3.0)
- **Local Variables**: Atlas connection strings, user lists, cluster naming conventions
- **Expiration Management**: Automatic 7-day (168h) expiration timestamp for resources
- **Domain Configuration**: Customer-specific domain names (e.g., `customer.mongoarena.com`)

#### `variables.tf` - Configuration Inputs
Defines all input variables with validation:
- `aws_profile` - SA AWS profile for authentication
- `aws_region` - EKS cluster location (default: us-east-2)
- `customer_name` - Workshop customer identifier
- `aws_route53_hosted_zone` - DNS zone (mongoarena.com)
- `domain_email` - Email for Let's Encrypt certificates
- `atlas_standard_srv` - MongoDB connection string from atlas-cluster module
- `atlas_user_list` - Participant usernames (validated non-empty)
- `atlas_user_password` - Shared password for participants
- `atlas_admin_user` / `atlas_admin_password` - Admin credentials
- `scenario_config` - Complete workshop configuration from config.yaml
- `anthropic_api_key` / `azure_openai_api_key` - LLM API keys (optional)

### Network & Compute Files

#### `infra.tf` - VPC & Network Infrastructure
Creates the networking foundation:
- **VPC**: 10.0.0.0/16 CIDR block with DNS support enabled
- **Subnets**: 2 public subnets (10.0.0.0/22, 10.0.4.0/22) across availability zones
- **Internet Gateway**: Enables outbound internet access
- **Route Tables**: Routes all traffic (0.0.0.0/0) through IGW
- **Security Groups**: 
  - EKS security group with DNS (53/tcp, 53/udp) and egress rules
  - Kubernetes ELB role tags for load balancer provisioning
- **Availability Zone Selection**: Dynamic selection with us-west-2 filtering

#### `eks.tf` - EKS Cluster & IAM
The heart of the Kubernetes infrastructure:

**IAM Roles & Policies:**
- **Node Role** (`aws_iam_role.node`):
  - `AmazonEKSWorkerNodeMinimalPolicy` - Core worker node permissions
  - `AmazonEC2ContainerRegistryPullOnly` - Pull Docker images
  - `AmazonElasticFileSystemClientReadWriteAccess` - Access EFS volumes
  - Custom EFS CSI policy for persistent storage
  - Bedrock policy (conditional, if LLM enabled)
  - S3 read policy for mongodb-arena bucket
  - Secrets Manager policy for API keys
- **Cluster Role** (`aws_iam_role.cluster`):
  - `AmazonEKSClusterPolicy` - Manage EKS resources
  - `AmazonEKSComputePolicy` - Compute operations
  - `AmazonEKSBlockStoragePolicy` - EBS volumes
  - `AmazonEKSLoadBalancingPolicy` - Load balancers
  - `AmazonEKSNetworkingPolicy` - VPC networking
  - Custom EKS Auto Mode policy for EC2 tagging

**EKS Cluster Configuration:**
- **Compute Config**: Auto Mode with "general-purpose" and "system" node pools
- **Network Config**: Elastic Load Balancing enabled
- **Storage Config**: Block storage enabled
- **Access Config**: API + ConfigMap authentication mode
- **VPC Config**: Public and private API endpoints
- **Logging**: API, audit, authenticator, controller manager, scheduler logs to CloudWatch
- **Tags**: Name, expire-on, owner, purpose for cost tracking

**EKS Add-ons:**
- `vpc-cni` - VPC networking
- `metrics-server` - Resource metrics for HPA
- `amazon-cloudwatch-observability` - Centralized logging
- `aws-efs-csi-driver` - EFS persistent volumes

**Storage Classes:**
- `efs-sc` - EFS storage class for user workspace persistence
  - Provisioning mode: efs-ap (access points)
  - Reclaim policy: Delete
  - Volume binding: Immediate

#### `efs.tf` - Elastic File System
Persistent shared storage for user workspaces:
- **EFS File System**: Encrypted at rest, tagged with expiration
- **Security Group**: Allows NFS traffic (port 2049) from all sources
- **Mount Targets**: One per subnet for high availability
- **Purpose**: Stores user workspace data, ensures persistence across pod restarts
- **Access**: Each user gets isolated access through EFS access points
- **Output**: EFS ID and DNS name for volume mounting

### SSL/TLS & DNS Files

#### `route53.tf` - DNS & SSL Certificates
Manages domain names and HTTPS certificates:

**SSL Certificate Generation (ACME/Let's Encrypt):**
- **ACME Account**: Registered with Let's Encrypt production server
- **Private Keys**: RSA 2048-bit keys for account and certificate
- **Certificate Request**: Wildcard cert for `*.customer.mongoarena.com` and apex domain
- **DNS Challenge**: Route53 DNS-01 challenge with automatic validation
- **Recursive Nameservers**: Google (8.8.8.8) and Cloudflare (1.1.1.1) for fast propagation
- **Result**: A+ rated SSL certificate (validated with SSL Labs)

**Route53 DNS Records:**
- **Main domain** (`customer.mongoarena.com`) → Portal frontend
- **WWW subdomain** (`www.customer.mongoarena.com`) → Portal frontend
- **Wildcard** (`*.customer.mongoarena.com`) → User VSCode instances
- **Instructions** (`instructions.customer.mongoarena.com`) → Workshop documentation
- **Participants** (`participants.customer.mongoarena.com`) → Participant list page
- **Portal** (`portal.customer.mongoarena.com`) → Backend API server

All records use Route53 Alias records pointing to AWS Load Balancers with health checks.

### Application Components

Each application component is deployed from its own folder containing a complete Helm chart. The corresponding `.tf` file orchestrates the deployment with dynamic configuration.

#### 1️⃣ `mdb-openvscode/` → `openvscode.tf`
**Per-User VSCode Instances** - Deploys isolated browser-based IDEs for each participant:

**Helm Chart Deployment** (one per user):
- **Chart**: `./mdb-openvscode` v0.1.3
- **Namespace**: Default (each user gets unique deployment name)
- **Timeout**: 10 minutes to handle slow image pulls

**Environment Variables** (passed to each VSCode instance):
- `MONGODB_URI` - User-specific connection string with credentials
- `ENVIRONMENT` - Set to "prod"
- `SERVICE_NAME` - Backend server URL (http://localhost:5000)
- `SCENARIO_PATH` - Results processor location
- `SIGNAL_FILE_PATH` - Server restart signal location
- `LOG_PATH` - Exercise results directory
- `WORKSHOP_USER` - User home directory (/app)
- `LEADERBOARD` - Leaderboard type (timed/score)
- `BACKEND_URL` - User's backend API URL (https://username.customer.mongoarena.com/backend)
- `LLM_MODEL` - LLM model name if enabled
- `DATABASE_NAME` - User's MongoDB database name
- `LLM_PROXY_ENABLED` - MCP proxy toggle
- `LLM_PROXY_TYPE`, `LLM_PROXY_SERVICE`, `LLM_PROXY_PORT` - Proxy configuration
- `MDB_MCP_CONNECTION_STRING` - MongoDB MCP server connection
- `PGSQL_MCP_CONNECTION_STRING` - PostgreSQL MCP server connection (if enabled)

**Volume Mounts:**
- `/home/workspace` - Persistent EFS volume (user's files)
- `/home/workspace/utils` - Results processor scripts
- `/home/workspace/.openvscode-server/data/Machine` - VSCode settings
- `/home/workspace/.openvscode-server/data/User/globalStorage/saoudrizwan.claude-dev/settings` - Cline extension settings
- `/home/workspace/scenario-config` - Workshop scenario configuration

**Persistence:**
- Each user gets dedicated PVC (PersistentVolumeClaim) backed by EFS
- Storage class: `efs-sc` (from eks.tf)
- Data persists across pod restarts

**Services:**
- Each deployment exposes service: `vscode-{username}-svc`
- Services discovered by Nginx for routing

#### 2️⃣ `mdb-nginx/` → `nginx.tf`
**User VSCode Reverse Proxy** - Routes traffic to individual VSCode instances:

**Dynamic Configuration Generation:**
- **Base Config**: Common Nginx settings (gzip, caching, SSL)
- **Per-User Configs**: For each Atlas user, generates:
  - Server block listening on port 443 (HTTPS)
  - Server name: `{username}.customer.mongoarena.com`
  - Proxy pass to user's VSCode service
  - WebSocket upgrade headers for VSCode
  - SSL certificate from `nginx-tls-secret`

**Nginx Deployment** (`helm_release.airbnb_arena_nginx`):
- **Chart**: `./mdb-nginx` v0.1.2
- **Volume Mounts**:
  - `/etc/nginx/conf.d` - Dynamic user configurations
  - `/etc/nginx/nginx.conf` - Base Nginx config
  - `/usr/share/nginx/html` - Static HTML (landing page)
  - `/mnt/vscode-{user}` - Each user's persistent volume (for file serving)
  - `/etc/nginx/ssl` - TLS certificates
- **Service Type**: LoadBalancer (AWS ELB automatically provisioned)
- **Output**: Load balancer hostname and zone ID for Route53

**Security:**
- TLS 1.2/1.3 only
- Strong cipher suites
- HSTS headers
- A+ SSL Labs rating

#### 3️⃣ `portal-server/` + `portal-nginx/` → `arena-portal.tf`
**Workshop Portal** - Deploys the main workshop interface (frontend + backend):

**Portal Backend Server** (`helm_release.portal_server`):
- **Technology**: Python Flask application
- **Chart**: `./portal-server` v0.1.0
- **Purpose**: REST API for leaderboard, user management, progress tracking
- **Environment Variables**:
  - `MONGODB_URI` - Admin connection to shared database
  - `DB_NAME` - "arena_shared" (shared across all users)
  - `PARTICIPANTS` - Collection name for participant data
  - `USER_DETAILS` - Collection name for user details
  - `LEADERBOARD` - Leaderboard type configuration
- **Volumes**:
  - Scenario config (read-only)
  - Startup script for initialization
- **Service**: ClusterIP service on port 5000
- **Database Collections**:
  - `participants` - User registration and status
  - `user_details` - Extended user information
  - `leaderboard` - Exercise completion times/scores

**Portal Frontend Nginx** (`helm_release.portal_nginx`):
- **Technology**: Next.js static export served by Nginx
- **Chart**: `./portal-nginx` v0.1.5
- **Build Process**: 
  - Startup script clones `mongodb-arena-portal` repo
  - Runs `npm install && npm run build`
  - Exports static files to `/usr/share/nginx/html/portal`
- **Environment Variables** (injected into Next.js build):
  - `NEXT_PUBLIC_API_URL` - Backend API URL
  - `NEXT_PUBLIC_REPO_NAME` - Workshop repository name
  - `NEXT_PUBLIC_SERVER_PATH` - Backend server path
  - `NEXT_PUBLIC_PRIZES_ENABLED`, `PRIZES_WHERE`, `PRIZES_WHEN` - Prize information
- **Routes**:
  - `/` - Main portal landing page
  - `/leaderboard` - Real-time leaderboard
  - `/backend/*` - Proxied to portal-server
- **Nginx Config**:
  - Listens on ports 80 (HTTP) and 443 (HTTPS)
  - SSL termination with wildcard certificate
  - Proxy to backend server for API calls
  - Static file serving for frontend
- **Service**: LoadBalancer (separate from VSCode Nginx)
- **DNS**: Points to `customer.mongoarena.com` and `portal.customer.mongoarena.com`

#### 4️⃣ `docs-nginx/` → `docs-nginx.tf`
**Workshop Instructions** - Serves workshop documentation:

**Documentation Builder**:
- **Technology**: Jekyll static site generator
- **Chart**: `./docs-nginx` v0.1.4
- **Build Process**:
  - Startup script clones workshop repository
  - Navigates to `docs/` directory
  - Runs `bundle install && bundle exec jekyll build`
  - Copies `_site/` output to `/usr/share/nginx/html/instructions`
- **Source**: Workshop repository's `/docs/` folder (Jekyll site)
- **Result**: Static HTML/CSS/JS documentation

**Nginx Server Blocks:**
- **Participants Page** (`participants.customer.mongoarena.com`):
  - Root: `/usr/share/nginx/html/`
  - Shows participant list with VSCode links
- **Instructions Page** (`instructions.customer.mongoarena.com`):
  - Root: `/usr/share/nginx/html/instructions`
  - Serves Jekyll-built documentation

**Configuration:**
- SSL enabled with wildcard certificate
- Gzip compression for faster page loads
- Custom 404 and 50x error pages
- Service: LoadBalancer (shared by both subdomains)

#### 5️⃣ `scenario-definition/` → `scenario-definition.tf`
**Workshop Configuration** - Centralizes workshop scenario settings:

**Kubernetes Job** (`helm_release.scenario_definition`):
- **Chart**: `./scenario-definition` v0.1.7
- **Purpose**: Uploads scenario config to MongoDB for runtime access
- **Execution**: Runs once at deployment, completes when upload succeeds
- **Timeout**: 5 minutes

**ConfigMaps Created:**
- `scenario-definition-config` - Raw YAML scenario config
- `scenario-definition-enhanced-config` - Enhanced with runtime values:
  - `aws_route53_record_name` - Full domain name
  - `atlas_standard_srv` - MongoDB connection string
  - `atlas_user_password` - User credentials

**Python Script** (`define-scenario.py`):
- Reads `/etc/scenario-config/scenario-config.json`
- Connects to MongoDB (arena_shared database)
- Upserts document into `scenario_config` collection
- Makes config accessible to all services

**Configuration Elements**:
- Workshop repository URL and branch
- Database configuration (MongoDB/PostgreSQL)
- LLM settings (provider, model, proxy)
- Leaderboard type (timed/score)
- Prize information
- Workshop instructions structure

**Usage**: Other services mount `scenario-definition-config` to read workshop settings.

### Optional Components

#### 6️⃣ `litellm/` → `litellm.tf` *(Optional)*
**LLM Proxy** - Provides unified API for multiple LLM providers:

**Conditional Deployment**:
- Only deploys if `scenario_config.llm.enabled == true` and `scenario_config.llm.proxy.enabled == true`

**LiteLLM Service** (`helm_release.litellm`):
- **Chart**: `./litellm` v0.1.14
- **Purpose**: Proxy for OpenAI and Anthropic APIs with caching
- **Service**: ClusterIP on port 4000

**API Key Management**:
- **Primary Source**: AWS Secrets Manager (`arena/secrets`)
- **Fallback**: Terraform variables (`anthropic_api_key`, `azure_openai_api_key`)
- **Security**: Stored as Kubernetes secrets, mounted as env vars

**Model Configuration**:
- **If OpenAI Provider**:
  - `gpt-5-mini` - Azure OpenAI endpoint
  - `gpt-5-chat` - Azure OpenAI endpoint
  - API base: `https://solutionsconsultingopenai.openai.azure.com`
  - API version: 2025-04-01-preview
- **If Anthropic Provider**:
  - `claude-3-haiku` - Anthropic API
  - `claude-4-sonnet` - Anthropic API

**Caching** (if Redis enabled):
- **Type**: Redis-backed semantic cache
- **TTL**: 1800 seconds (30 minutes)
- **Namespace**: `litellm.cline.cache`
- **Purpose**: Reduce API costs by caching similar prompts
- **Supported Call Types**: completion, acompletion, embedding, aembedding

**Environment Variables**:
- `PORT` - 4000
- `LITELLM_LOG` - INFO level logging
- `REDIS_HOST`, `REDIS_PORT` - If Redis enabled

**Integration**: VSCode Cline extension connects to `http://litellm-service:4000`

#### 7️⃣ `redis/` → `redis.tf` *(Optional)*
**Redis Cache** - Provides caching for LiteLLM:

**Conditional Deployment**:
- Only deploys if `scenario_config.llm.proxy.redis.enabled == true`

**Redis Instance** (`helm_release.redis`):
- **Chart**: `./redis` v0.1.1
- **Version**: Redis 7.x
- **Persistence**: None (in-memory cache, acceptable for workshop duration)
- **Service**: ClusterIP on port 6379 (default Redis port)

**Kubernetes Secret** (`redis_credentials`):
- `REDIS_HOST` - Service name (e.g., "redis-service")
- `REDIS_PORT` - Port number (6379)
- `REDIS_URL` - Full connection string (redis://redis-service:6379)

**Purpose**:
- Cache LLM responses for identical prompts
- Reduce API costs during workshops
- Faster response times for repeated queries

**Connection String**: `redis://redis-service:6379` (internal cluster DNS)

#### 8️⃣ `aurora.tf` *(Optional, no folder)*
**PostgreSQL Database** - Provides PostgreSQL for multi-database workshops:

**Conditional Deployment**:
- Only deploys if `scenario_config.database.postgres == true`

**Aurora Serverless v2 Cluster** (`aws_rds_cluster.aurora_cluster`):
- **Engine**: aurora-postgresql 17.5
- **Scaling**: 0.5 to 1.0 ACU (Aurora Capacity Units)
- **Database**: sample_airbnb
- **Master User**: postgres
- **Master Password**: Same as Atlas user password
- **Backup**: 1 day retention
- **Security**: 
  - Accessible from EKS cluster security group
  - Accessible from VPC (10.0.0.0/16)
  - Accessible from specific subnet (104.30.164.0/28)
- **Public Access**: Enabled (for external tools)
- **SSL**: Required (sslmode=require)

**pgvector Extension** (`null_resource.enable_pgvector`):
- Installs PostgreSQL client locally (macOS/Linux)
- Connects to Aurora cluster
- Runs: `CREATE EXTENSION IF NOT EXISTS vector;`
- Enables vector similarity search in PostgreSQL

**Per-User Resources**:
For each Atlas user:
- **PostgreSQL Role**: Login user with CREATE DATABASE privilege
- **PostgreSQL Database**: Owned by respective user
- **Connection String**: `postgresql://{user}:{password}@{endpoint}:5432/{user}`

**Data Restoration** (`kubernetes_job_v1.restore_backup_to_users`):
- **Purpose**: Pre-populate user databases with Airbnb dataset
- **Execution**: Kubernetes job (runs once at deployment)
- **Process**:
  1. Downloads backup from S3 (`s3://mongodb-arena/postgres-backups/airbnb-backup.sql.gz`)
  2. Decompresses SQL file
  3. For each user, restores backup to their database
  4. Verifies restoration by checking table count
  5. Skips users already restored
- **Image**: postgres:17
- **Resources**: 1Gi memory, 500m CPU (bursts to 2Gi/1000m)
- **Timeout**: 10 minutes
- **Backoff Limit**: 3 retries

**Output Variables**:
- `aurora_cluster_endpoint` - Writer endpoint
- `aurora_cluster_reader_endpoint` - Reader endpoint
- `aurora_database_name` - "sample_airbnb"
- `aurora_master_username` - "postgres"
- `aurora_connection_string` - Full PostgreSQL connection string
- `user_connection_strings` - Per-user connection strings
- `user_jdbc_urls` - JDBC URLs for each user

**Integration**: VSCode instances receive `PGSQL_MCP_CONNECTION_STRING` environment variable for MCP server.

### Supporting Directories

These folders provide configuration, templates, and utilities used by the component folders:

#### `aws_policies/` 
**IAM Policy Documents** - JSON policy files for granular permissions:
- `node_policy.json` - Node role trust policy
- `cluster_policy.json` - Cluster role trust policy
- `efs_csi_node_policy.json` - EFS CSI driver permissions
- `bedrock.json` - AWS Bedrock LLM access
- `s3.json` - S3 bucket read access (mongodb-arena)
- `secrets.json` - Secrets Manager read access
- `eks_auto_mode_policy.json` - EC2 instance tagging for EKS Auto Mode

Used by: `eks.tf`

#### `nginx-conf-files/` 
**Nginx Configuration Templates** - Templatefiles for dynamic Nginx configs:
- `nginx-base-config.conf.tpl` - Common settings (gzip, caching, timeouts)
- `mdb-nginx-openvscode.conf.tpl` - Per-user VSCode server block
- `doc-nginx-main.conf.tpl` - Documentation server block
- `portal-nginx-server.conf.tpl` - Portal server block
- `nginx.conf` - Main Nginx configuration file

Used by: `nginx.tf`, `docs-nginx.tf`, `arena-portal.tf`

#### `nginx-html-files/` 
**Static HTML Templates** - Templated HTML pages:
- `index.html.tpl` - Landing page with user links
- `404.html.tpl` - Custom 404 error page
- `50x.html.tpl` - Server error page
- `favicon.ico` - Website icon

Used by: `nginx.tf`, `docs-nginx.tf`

#### `mongodb-arena-portal/` 
**Portal Application Source** - Next.js + Flask application source code:
- `frontend/` - Next.js application:
  - `src/app/` - Next.js pages (App Router)
  - `src/components/` - React components
  - `public/` - Static assets
  - `next.config.mjs` - Next.js configuration
  - `tailwind.config.js` - Tailwind CSS styling
- `server/` - Python Flask backend:
  - `app.py` - Flask application
  - `requirements.txt` - Python dependencies

Used by: `arena-portal.tf` (cloned and built during deployment)

#### `results-processor/` 
**Exercise Validation** - Java application for validating workshop exercises:
- **Technology**: Java 21 + MongoDB Java Driver
- **Purpose**: Validates student exercise solutions
- **Structure**:
  - `src/main/java/com/mongodb/` - Java source code
  - `pom.xml` - Maven dependencies
  - `target/` - Compiled JAR file
  - `run.sh` - Execution script
  - `logs/` - Validation results
- **Integration**: Mounted into VSCode containers at `/home/workspace/utils`

Used by: `openvscode.tf` (mounted as volume)

## 🔄 Deployment Flow

Understanding how these components deploy in sequence (aligned with the 5-tier architecture):

### Tier 1: Network Foundation
**Files**: `main.tf`, `infra.tf`
- VPC creation with public subnets
- Internet Gateway and route tables
- Security groups for EKS
- Availability zone configuration
- **Time**: ~2-3 minutes

### Tier 2: Storage & Kubernetes
**Files**: `efs.tf`, `eks.tf`
- **EFS Storage**: File system creation, mount targets, security group
- **EKS Cluster**: Cluster creation, IAM roles, node pools, add-ons
- **Storage Classes**: EFS CSI driver configuration
- **Time**: ~30-40 minutes (EKS cluster is the longest component)

### Tier 3: Supporting Services
**Files**: `route53.tf`, `scenario-definition/`, `aurora.tf`
- **SSL Certificates**: Let's Encrypt certificate via ACME, DNS validation
- **Scenario Config**: Kubernetes job uploads workshop config to MongoDB
- **PostgreSQL** *(optional)*: Aurora Serverless v2, pgvector, per-user databases
- **Time**: ~5-10 minutes (15-20 if Aurora enabled)

### Tier 4: User Workspaces
**Folders**: `mdb-openvscode/`, `redis/`
- **VSCode Instances**: Per-user deployments with PVCs, ConfigMaps, services
- **Redis Cache** *(optional)*: In-memory cache for LiteLLM
- Deployments happen in parallel per user
- **Time**: ~3-5 minutes for 10 users

### Tier 5: User-Facing Services
**Folders**: `mdb-nginx/`, `portal-server/`, `portal-nginx/`, `docs-nginx/`, `litellm/`
- **VSCode Nginx**: Reverse proxy with per-user configs, load balancer
- **Portal Backend**: Flask API server for leaderboard and user management
- **Portal Frontend**: Next.js build and deployment
- **Documentation**: Jekyll site build and deployment
- **LiteLLM Proxy** *(optional)*: Unified LLM API with caching
- **Time**: ~5-10 minutes

### Total Deployment Time
- **Minimum** (no optional components): ~45-55 minutes
- **Full deployment** (with PostgreSQL + LLM): ~60-75 minutes
- **Note**: Most time spent waiting for EKS cluster (Tier 2)

## 🎭 Component Dependencies

This diagram shows the deployment dependencies. Components are deployed in order based on what they depend on:

```
                    ┌─────────────────────┐
                    │  1. infra.tf        │
                    │  VPC + Subnets      │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
        ┌──────────────────┐    ┌─────────────────┐
        │  2. efs.tf       │    │  2. eks.tf      │
        │  EFS Storage     │    │  EKS Cluster    │
        └──────────────────┘    └────────┬────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
        ┌──────────────────┐  ┌────────────────┐  ┌──────────────────┐
        │  3. route53.tf   │  │ 3. scenario-   │  │ 3. aurora.tf     │
        │  SSL/TLS Cert    │  │ definition/    │  │ PostgreSQL       │
        └────────┬─────────┘  └───────┬────────┘  │ (optional)       │
                 │                    │            └──────────────────┘
                 │                    │
         ┌───────┴────────────────────┴───────┐
         │                                    │
         ▼                                    ▼
┌─────────────────┐                  ┌─────────────────┐
│ 4. redis/       │                  │ 4. mdb-         │
│ Redis Cache     │                  │ openvscode/     │
│ (optional)      │                  │ VSCode Users    │
└────────┬────────┘                  └────────┬────────┘
         │                                    │
         │            ┌───────────────────────┼──────────────┐
         │            │                       │              │
         ▼            ▼                       ▼              ▼
┌─────────────┐  ┌──────────┐     ┌─────────────┐  ┌──────────────┐
│ 5. litellm/ │  │ 5. mdb-  │     │ 5. portal-  │  │ 5. docs-     │
│ LLM Proxy   │  │ nginx/   │     │ server/ +   │  │ nginx/       │
│ (optional)  │  │ VSCode   │     │ portal-     │  │ Workshop     │
└─────────────┘  │ Proxy    │     │ nginx/      │  │ Docs         │
                 └──────────┘     │ Portal      │  └──────────────┘
                                  └─────────────┘

Legend:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Tier 1: infra.tf          → Network foundation
  Tier 2: efs.tf, eks.tf    → Storage + Kubernetes
  Tier 3: SSL, Config, DB   → Supporting services
  Tier 4: User workspaces   → Per-user resources
  Tier 5: Proxies & Portal  → User-facing services
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Folder-to-Tier Mapping:
├── Tier 1-3: Core .tf files (no folders)
├── Tier 4-5: Component folders
│   ├── mdb-openvscode/    → openvscode.tf
│   ├── mdb-nginx/         → nginx.tf  
│   ├── portal-server/     → arena-portal.tf
│   ├── portal-nginx/      → arena-portal.tf
│   ├── docs-nginx/        → docs-nginx.tf
│   ├── scenario-definition/→ scenario-definition.tf
│   ├── redis/             → redis.tf (optional)
│   └── litellm/           → litellm.tf (optional)
```

**Key Dependencies**:
- **SSL Certificate** (route53.tf) → Required by all Nginx components for HTTPS
- **Scenario Config** (scenario-definition/) → Required by VSCode and Portal for workshop settings
- **EFS Storage** (efs.tf) → Required by VSCode instances for persistent workspaces
- **Redis** (redis/) → Required by LiteLLM for caching (if enabled)
- **VSCode Instances** (mdb-openvscode/) → Must exist before VSCode Nginx can proxy to them
- **Aurora** (aurora.tf) → Independent, only needs VPC (if PostgreSQL enabled)

## 🔍 Key Design Patterns

### Per-User Isolation
- Each user gets dedicated Kubernetes resources (namespace via naming)
- Separate PVC for file persistence
- Individual ConfigMaps for personalized settings
- Isolated MongoDB databases
- Isolated PostgreSQL databases (if enabled)

### Dynamic Configuration
- Terraform templates generate per-user Nginx configs
- User list from Atlas drives VSCode instance creation
- ConfigMaps populated from scenario_config variable
- DNS records automatically created for each user

### Conditional Deployment
- PostgreSQL only if `database.postgres == true`
- LiteLLM only if `llm.enabled == true` and `llm.proxy.enabled == true`
- Redis only if `llm.proxy.redis.enabled == true`
- Bedrock policies only if `llm.enabled == true`

### High Availability
- Multi-AZ subnets for resilience
- EFS mount targets in each AZ
- Load balancers with health checks
- Auto-scaling node pools (EKS Auto Mode)

### Security Best Practices
- Least privilege IAM roles
- TLS encryption everywhere (A+ rating)
- Secrets stored in AWS Secrets Manager
- Network security groups
- Private subnets for sensitive resources

### Cost Optimization
- EKS Auto Mode for efficient scaling
- Aurora Serverless v2 (scales to zero-ish)
- Redis in-memory only (no persistence)
- 7-day auto-expiration tags
- Shared infrastructure (one EKS cluster for all users)

## 🎯 Deployment Options

### Fully Managed (with EKS)
- Complete browser-based environment
- VSCode Online for all participants
- Centralized management and monitoring
- Best for: Corporate workshops, large groups

### Hybrid (without EKS)
- MongoDB Atlas cluster only
- Participants use local development environment
- Reduced infrastructure costs
- Best for: Technical audiences, smaller groups

> 💡 **Tip:** To deploy hybrid mode, remove the `eks-cluster` folder from your customer directory before running `terragrunt apply --all`

## ⚠️ Important Notes

### Cluster Expiration
- EKS clusters expire after **1 week** by default
- Plan workshop timing accordingly
- Can be extended if needed

### Resource Cleanup
- Always destroy EKS resources after workshop completion
- Download leaderboard data before destruction
- Verify all resources removed to avoid AWS charges

### Prerequisites
- Requires successful deployment of `atlas-cluster` module
- MongoDB connection string passed automatically to EKS
- User credentials synced from Atlas

---

> 💡 **Note:** The EKS cluster module is optional. If you only need MongoDB Atlas for a hybrid workshop where participants use their own IDE, you can skip this module and deploy only the atlas-cluster.

