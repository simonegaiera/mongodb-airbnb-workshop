---
title: "Reference: EKS Cluster Module"
permalink: /sa/eks-cluster/
layout: single
classes: wide
---

> ⚠️ **Disclaimer:** This documentation was AI-generated ("vibe coded") and has not been fully verified yet. Please review carefully and report any inaccuracies.

The `eks-cluster` module deploys a complete Kubernetes-based workshop environment on AWS, providing participants with browser-based VSCode instances and a full workshop portal.

## 📦 What Gets Deployed

When you run the eks-cluster module, it creates and configures:

### AWS EKS Cluster
- **Kubernetes Cluster** - Managed EKS cluster
- **Worker Nodes** - EC2 instances for workload execution
- **Auto-scaling** - Automatic scaling based on demand
- **Networking** - VPC, subnets, and security groups

### Workshop Portal Infrastructure
- **Nginx Ingress** - Load balancing and routing
- **SSL/TLS Certificates** - Automatic certificate management via Let's Encrypt
- **DNS Configuration** - Route53 domain setup
- **EFS Storage** - Persistent file storage for user workspaces

### VSCode Online Instances
- **Per-User Environments** - Individual VSCode instances for each participant
- **Pre-configured Workspace** - Workshop repository cloned and ready
- **MongoDB Extensions** - MongoDB for VS Code pre-installed
- **Isolated Resources** - Separate namespaces per user

### Workshop Components
- **Frontend Portal** - Next.js application with workshop interface
- **Backend API Server** - Node.js Express server
- **Results Processor** - Automated exercise validation
- **Leaderboard Service** - Real-time progress tracking
- **Scenario Definition** - Workshop content and instructions

### LLM Integration (Optional)
- **LiteLLM Proxy** - Unified API for multiple LLM providers
- **OpenAI Support** - GPT models
- **Anthropic Support** - Claude models
- **AI Chatbot** - Interactive AI assistance for participants

### Monitoring & Management
- **Redis Cache** - Session management and caching
- **PostgreSQL Database** - Arena portal data (optional)
- **Logging** - Centralized application logs
- **Health Checks** - Automated service monitoring

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

## 🌐 Domain & DNS

The EKS module automatically configures:
- **Domain Registration** - Arena domain for the workshop
- **SSL Certificates** - A+ rated SSL configuration
- **DNS Records** - Route53 automatic updates
- **Subdomains** - Per-user VSCode access URLs

## ⏱️ Deployment Time

- **Initial deployment**: 30-40 minutes (EKS cluster + infrastructure)
- **VSCode instances**: Provisioned on-demand per user (~7 minutes per 10 users)
- **DNS propagation**: 5-10 minutes additional
- **Total workshop ready**: ~45-55 minutes for typical workshop setup

## 🔒 Security Features

### Network Security
- **Private Subnets** - Worker nodes in private network
- **Security Groups** - Fine-grained access control
- **IAM Roles** - Least privilege access policies

### Application Security
- **TLS Encryption** - All traffic encrypted (A+ rating)
- **Namespace Isolation** - Kubernetes namespaces per user
- **Resource Quotas** - Prevent resource exhaustion
- **Network Policies** - Pod-to-pod communication controls

### SSL Verification
- Tested with [SSL Labs](https://www.ssllabs.com/ssltest/analyze.html) - **A+ rating**

## 💡 Key Features

### Fully Managed Experience
- **Zero Setup for Participants** - Everything pre-configured
- **Browser-Based IDE** - No local installation required
- **Consistent Environment** - Same setup for all participants
- **Real-time Sync** - Changes saved automatically

### Workshop Management
- **Automated Onboarding** - Users created from Atlas user list
- **Progress Tracking** - Real-time leaderboard updates
- **Exercise Validation** - Automated result verification
- **Flexible Scenarios** - Vibe Coding or Guided Workshop modes

### Scalability
- **Auto-scaling Workers** - Handles variable participant load
- **On-demand Resources** - VSCode instances created as needed
- **Efficient Resource Usage** - Namespaces and quotas

## 📁 Module Structure & Components

The eks-cluster module consists of multiple interconnected Terraform files, each managing a specific part of the infrastructure:

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

#### `openvscode.tf` - Per-User VSCode Instances
Deploys isolated browser-based IDEs for each participant:

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

#### `nginx.tf` - User VSCode Reverse Proxy
Routes traffic to individual VSCode instances:

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

#### `arena-portal.tf` - Workshop Portal (Frontend + Backend)
Deploys the main workshop interface:

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

#### `docs-nginx.tf` - Workshop Instructions
Serves workshop documentation:

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

#### `scenario-definition.tf` - Workshop Configuration
Centralizes workshop scenario settings:

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

#### `litellm.tf` - LLM Proxy (Optional)
Provides unified API for multiple LLM providers:

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

#### `redis.tf` - Redis Cache (Optional)
Provides caching for LiteLLM:

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

#### `aurora.tf` - PostgreSQL Database (Optional)
Provides PostgreSQL for multi-database workshops:

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

#### `aws_policies/` - IAM Policy Documents
JSON policy files for granular permissions:
- `node_policy.json` - Node role trust policy
- `cluster_policy.json` - Cluster role trust policy
- `efs_csi_node_policy.json` - EFS CSI driver permissions
- `bedrock.json` - AWS Bedrock LLM access
- `s3.json` - S3 bucket read access (mongodb-arena)
- `secrets.json` - Secrets Manager read access
- `eks_auto_mode_policy.json` - EC2 instance tagging for EKS Auto Mode

#### `nginx-conf-files/` - Nginx Configuration Templates
Templatefiles for dynamic Nginx configs:
- `nginx-base-config.conf.tpl` - Common settings (gzip, caching, timeouts)
- `mdb-nginx-openvscode.conf.tpl` - Per-user VSCode server block
- `doc-nginx-main.conf.tpl` - Documentation server block
- `portal-nginx-server.conf.tpl` - Portal server block
- `nginx.conf` - Main Nginx configuration file

#### `nginx-html-files/` - Static HTML Templates
Templated HTML pages:
- `index.html.tpl` - Landing page with user links
- `404.html.tpl` - Custom 404 error page
- `50x.html.tpl` - Server error page
- `favicon.ico` - Website icon

#### `mdb-openvscode/` - VSCode Helm Chart
Helm chart for VSCode Online instances:
- `Chart.yaml` - Chart metadata (v0.1.3)
- `values.yaml` - Default values
- `templates/` - Kubernetes manifests:
  - `deployment.yaml` - VSCode pod specification
  - `service.yaml` - ClusterIP service
  - `persistent-volume-claim.yaml` - EFS volume claim
  - `configmap.yaml` - User-specific scripts
  - `configmap-vscode.yaml` - VSCode settings.json
  - `configmap-cline.yaml` - Cline extension settings
  - `ingress.yaml` - Optional ingress rules
  - `hpa.yaml` - Horizontal Pod Autoscaler
- `files/` - Startup and utility scripts:
  - `startup.sh` - Initializes workspace, clones repo
  - `setup_lab_exercises.sh` - Prepares exercise files
  - `openvscode_extensions.sh` - Installs VSCode extensions
  - `user_operations.sh` - User management utilities
  - `settings.json` - VSCode configuration

#### `mongodb-arena-portal/` - Portal Application Source
Next.js application for workshop portal:
- `frontend/` - Next.js application:
  - `src/app/` - Next.js pages (App Router)
  - `src/components/` - React components
  - `public/` - Static assets
  - `next.config.mjs` - Next.js configuration
  - `tailwind.config.js` - Tailwind CSS styling
- `server/` - Python Flask backend:
  - `app.py` - Flask application
  - `requirements.txt` - Python dependencies

#### `scenario-definition/` - Scenario Config Helm Chart
Helm chart for deploying scenario configuration:
- `Chart.yaml` - Chart metadata (v0.1.7)
- `templates/` - Kubernetes manifests:
  - `configmap-config.yaml` - Scenario YAML config
  - `configmap-enhanced-config.yaml` - Enhanced with runtime values
  - `configmap-script.yaml` - Python upload script
  - `job.yaml` - Kubernetes job to upload config
- `files/` - Scripts:
  - `define-scenario.py` - Uploads config to MongoDB
  - `startup.sh` - Job initialization
  - `requirements.txt` - Python dependencies
  - `test-scenario-config.json` - Test configuration

#### `results-processor/` - Exercise Validation
Java application for validating workshop exercises:
- **Technology**: Java 21 + MongoDB Java Driver
- **Purpose**: Validates student exercise solutions
- **Structure**:
  - `src/main/java/com/mongodb/` - Java source code
  - `pom.xml` - Maven dependencies
  - `target/` - Compiled JAR file
  - `run.sh` - Execution script
  - `logs/` - Validation results
- **Integration**: Mounted into VSCode containers at `/home/workspace/utils`

#### `litellm/` - LiteLLM Helm Chart
Helm chart for LiteLLM proxy:
- `Chart.yaml` - Chart metadata (v0.1.14)
- `templates/` - Kubernetes manifests:
  - `deployment.yaml` - LiteLLM pod
  - `service.yaml` - ClusterIP service on port 4000
  - `configmap.yaml` - LiteLLM configuration
  - `secret.yaml` - API keys
  - `hpa.yaml` - Horizontal Pod Autoscaler

#### `redis/` - Redis Helm Chart
Helm chart for Redis cache:
- `Chart.yaml` - Chart metadata (v0.1.1)
- `templates/` - Kubernetes manifests:
  - `deployment.yaml` - Redis pod
  - `service.yaml` - ClusterIP service on port 6379
  - `configmap.yaml` - Redis configuration
  - `pvc.yaml` - Optional persistence

#### `portal-server/` - Portal Backend Helm Chart
Helm chart for Flask backend:
- `Chart.yaml` - Chart metadata (v0.1.0)
- `templates/` - Kubernetes manifests
- `files/startup.sh` - Initialization script

#### `portal-nginx/` - Portal Frontend Helm Chart
Helm chart for Next.js frontend:
- `Chart.yaml` - Chart metadata (v0.1.5)
- `templates/` - Kubernetes manifests
- `files/startup.sh` - Builds Next.js app

#### `docs-nginx/` - Documentation Helm Chart
Helm chart for Jekyll documentation:
- `Chart.yaml` - Chart metadata (v0.1.4)
- `templates/` - Kubernetes manifests
- `files/startup.sh` - Builds Jekyll site

## 🔄 Deployment Flow

Understanding how these components deploy in sequence:

1. **Infrastructure Layer** (main.tf, infra.tf, efs.tf):
   - VPC, subnets, security groups
   - EFS file system with mount targets
   - IAM roles and policies

2. **Kubernetes Layer** (eks.tf):
   - EKS cluster creation (30-40 minutes)
   - EKS add-ons (VPC CNI, metrics server, CloudWatch, EFS CSI driver)
   - Storage class configuration

3. **SSL/DNS Layer** (route53.tf):
   - ACME account registration
   - SSL certificate generation via Let's Encrypt
   - DNS validation via Route53
   - Kubernetes TLS secret creation

4. **Configuration Layer** (scenario-definition.tf):
   - ConfigMap creation with scenario config
   - Kubernetes job uploads config to MongoDB
   - Makes config available to all services

5. **Optional Database Layer** (aurora.tf):
   - Aurora PostgreSQL cluster creation (if enabled)
   - pgvector extension installation
   - Per-user database and role creation
   - Data restoration from S3 backup

6. **User Workspaces Layer** (openvscode.tf):
   - Per-user VSCode deployments (parallel)
   - PVC creation for each user
   - ConfigMap with user-specific settings
   - Service exposure

7. **Proxy Layer** (nginx.tf):
   - Nginx deployment with dynamic config
   - Load balancer provisioning
   - Wildcard DNS record creation
   - Routes traffic to user VSCode instances

8. **Portal Layer** (arena-portal.tf, docs-nginx.tf):
   - Backend API server deployment
   - Frontend build and deployment
   - Documentation build and deployment
   - Separate load balancer provisioning
   - DNS records for portal and instructions

9. **LLM Layer** (redis.tf, litellm.tf):
   - Redis cache deployment (if enabled)
   - LiteLLM proxy deployment (if enabled)
   - API key configuration
   - Model configuration

## 🎭 Component Dependencies

```
┌─────────────┐
│   VPC/EFS   │
└─────┬───────┘
      │
      ▼
┌─────────────┐
│ EKS Cluster │
└─────┬───────┘
      │
      ├─────────────────────────────────┐
      │                                 │
      ▼                                 ▼
┌──────────────┐                  ┌────────────┐
│ SSL Cert     │                  │ Scenario   │
│ (Route53)    │                  │ Definition │
└─────┬────────┘                  └─────┬──────┘
      │                                 │
      │         ┌───────────────────────┤
      │         │                       │
      ▼         ▼                       ▼
┌──────────────────┐          ┌─────────────────┐
│ Aurora Postgres  │          │ VSCode          │
│ (optional)       │          │ Instances       │
└──────────────────┘          └────────┬────────┘
                                       │
                              ┌────────┴────────┐
                              │                 │
                              ▼                 ▼
                      ┌───────────┐     ┌────────────┐
                      │ VSCode    │     │ Portal     │
                      │ Nginx     │     │ Components │
                      └───────────┘     └────────────┘
                                              │
                                    ┌─────────┴──────────┐
                                    │                    │
                                    ▼                    ▼
                            ┌────────────┐      ┌─────────────┐
                            │ Redis      │      │ Docs Nginx  │
                            │ (optional) │      └─────────────┘
                            └─────┬──────┘
                                  │
                                  ▼
                            ┌────────────┐
                            │ LiteLLM    │
                            │ (optional) │
                            └────────────┘
```

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

