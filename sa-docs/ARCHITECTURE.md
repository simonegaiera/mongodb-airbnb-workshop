# MongoDB AI Arena - Architecture Diagrams

This document provides comprehensive architecture diagrams for the MongoDB AI Arena training platform, showing how all components work together to deliver a hands-on MongoDB learning experience.

## 1. High-Level System Architecture

This diagram shows the overall system architecture with all major components and their relationships.

```mermaid
graph TB
    subgraph "External Services"
        DNS[Route53 DNS]
        SSL[SSL Certificates]
        LLM[LLM Providers<br/>Claude/GPT]
    end

    subgraph "AWS Cloud"
        subgraph "EKS Cluster"
            subgraph "Core Services"
                NGINX[Nginx<br/>Reverse Proxy]
                PORTAL[Arena Portal<br/>Next.js + Flask]
                DOCS[Documentation<br/>Jekyll Site]
            end
            
            subgraph "Development Environment"
                VSCODE[VSCode Online<br/>OpenVSCode Server]
                APP[Sample App<br/>Next.js Frontend]
                SERVER[API Server<br/>Node.js/Express]
            end
            
            subgraph "AI & Processing"
                LITELLM[LiteLLM Proxy]
                REDIS[Redis Cache]
                RESULTS[Results Processor<br/>Java/Spring Boot]
            end
        end
        
        subgraph "MongoDB Atlas"
            ATLAS[MongoDB Cluster<br/>M30+ Tier]
            USERS[User Database<br/>Participants]
            SAMPLE[Sample Data<br/>Airbnb Dataset]
        end
    end

    subgraph "Participants"
        P1[Participant 1]
        P2[Participant 2]
        PN[Participant N]
    end

    subgraph "MongoDB SAs"
        SA[MongoDB Solution<br/>Architects]
    end

    %% External Access
    DNS --> NGINX
    SSL --> NGINX
    
    %% Participant Access
    P1 --> PORTAL
    P2 --> PORTAL
    PN --> PORTAL
    
    P1 --> VSCODE
    P2 --> VSCODE
    PN --> VSCODE
    
    %% SA Access
    SA --> ATLAS
    SA --> EKS
    
    %% Internal Routing
    NGINX --> PORTAL
    NGINX --> DOCS
    NGINX --> VSCODE
    
    %% VSCode Environment
    VSCODE --> APP
    VSCODE --> SERVER
    APP --> SERVER
    
    %% Database Connections
    SERVER --> ATLAS
    PORTAL --> ATLAS
    RESULTS --> ATLAS
    LITELLM --> REDIS
    
    %% AI Integration
    SERVER --> LITELLM
    LITELLM --> LLM
    
    %% Exercise Validation
    SERVER --> RESULTS
    RESULTS --> ATLAS
    
    %% Documentation
    DOCS --> VSCODE
    
    style ATLAS fill:#13aa52
    style EKS fill:#ff9900
    style PORTAL fill:#61dafb
    style VSCODE fill:#007acc
    style APP fill:#000000
    style SERVER fill:#68d391
```

## 2. Infrastructure Deployment Flow

This diagram shows the sequential deployment process using Terragrunt and Terraform.

```mermaid
flowchart TD
    START([SA runs terragrunt apply]) --> INIT[Initialize Terragrunt]
    
    INIT --> ATLAS_CONFIG[Configure Atlas Cluster]
    ATLAS_CONFIG --> ATLAS_CREATE[Create MongoDB Atlas Cluster]
    ATLAS_CREATE --> ATLAS_USERS[Create Database Users]
    ATLAS_USERS --> ATLAS_DATA[Load Sample Dataset]
    ATLAS_DATA --> ATLAS_INDEXES[Create Indexes]
    
    ATLAS_INDEXES --> EKS_CONFIG[Configure EKS Cluster]
    EKS_CONFIG --> EKS_CREATE[Create EKS Cluster]
    EKS_CREATE --> EKS_NODES[Create Worker Nodes]
    EKS_NODES --> EKS_NETWORK[Setup Networking]
    
    EKS_NETWORK --> HELM_INSTALL[Install Helm Charts]
    HELM_INSTALL --> NGINX_DEPLOY[Deploy Nginx]
    NGINX_DEPLOY --> PORTAL_DEPLOY[Deploy Arena Portal]
    PORTAL_DEPLOY --> DOCS_DEPLOY[Deploy Documentation]
    DOCS_DEPLOY --> VSCODE_DEPLOY[Deploy VSCode Online]
    VSCODE_DEPLOY --> LITELLM_DEPLOY[Deploy LiteLLM]
    LITELLM_DEPLOY --> REDIS_DEPLOY[Deploy Redis]
    REDIS_DEPLOY --> RESULTS_DEPLOY[Deploy Results Processor]
    
    RESULTS_DEPLOY --> DNS_CONFIG[Configure Route53]
    DNS_CONFIG --> SSL_CONFIG[Configure SSL Certificates]
    SSL_CONFIG --> COMPLETE([Deployment Complete])
    
    %% Styling
    style START fill:#e1f5fe
    style COMPLETE fill:#c8e6c9
    style ATLAS_CREATE fill:#13aa52
    style EKS_CREATE fill:#ff9900
    style HELM_INSTALL fill:#9c27b0
```

## 3. Participant Journey Flow

This diagram shows the complete user experience from first visit to completing exercises.

```mermaid
journey
    title Participant Journey Through MongoDB AI Arena
    
    section Discovery
      Visit Portal: 5: Participant
      View Available Slots: 4: Participant
      Claim Credentials: 5: Participant
      
    section Environment Setup
      Access VSCode Online: 5: Participant
      Explore Pre-loaded Code: 4: Participant
      Open Documentation: 5: Participant
      
    section Learning & Coding
      Read Exercise Instructions: 4: Participant
      Edit Lab Files: 3: Participant
      Test Implementation: 4: Participant
      View Results in Frontend: 5: Participant
      
    section Validation & Scoring
      Run Test Suite: 4: Participant
      Submit Results: 5: Participant
      See Exercise Status: 5: Participant
      Check Leaderboard: 5: Participant
      
    section Advanced Features
      Use AI Chatbot: 5: Participant
      Explore Vector Search: 4: Participant
      Complete All Exercises: 5: Participant
```

## 4. Exercise Validation Flow

This diagram shows how exercises are validated and scored automatically.

```mermaid
sequenceDiagram
    participant P as Participant
    participant VS as VSCode Online
    participant SERVER as API Server
    participant TEST as Mocha Tests
    participant RP as Results Processor
    participant ATLAS as MongoDB Atlas
    participant FRONTEND as Frontend App
    participant LB as Leaderboard

    P->>VS: Edits lab file (e.g., crud-1.lab.js)
    P->>VS: Runs npm test
    VS->>TEST: Executes test suite
    TEST->>SERVER: Tests API endpoints
    SERVER->>ATLAS: Queries MongoDB
    ATLAS-->>SERVER: Returns data
    SERVER-->>TEST: Returns API response
    TEST->>TEST: Validates against expected output
    TEST->>RP: Posts test results
    RP->>ATLAS: Compares with answer key
    ATLAS-->>RP: Returns validation result
    RP->>ATLAS: Updates participant score
    RP->>LB: Updates leaderboard
    LB-->>FRONTEND: Shows updated status
    FRONTEND-->>P: Displays green checkmark
```

## 5. Component Network Architecture

This diagram shows the detailed network architecture and service communication patterns.

```mermaid
graph TB
    subgraph "External Internet"
        USER[Participants]
        SA[Solution Architects]
    end

    subgraph "AWS EKS Cluster"
        subgraph "Load Balancer Layer"
            ALB[Application Load Balancer]
            NGINX[Nginx Ingress Controller]
        end
        
        subgraph "Frontend Services"
            PORTAL_FE[Portal Frontend<br/>Next.js:3000]
            DOCS_SITE[Documentation Site<br/>Jekyll:4000]
            VSCODE_SERVICE[VSCode Service<br/>OpenVSCode:8080]
        end
        
        subgraph "Backend Services"
            PORTAL_BE[Portal Backend<br/>Flask:5000]
            APP_FE[Sample App Frontend<br/>Next.js:3000]
            API_SERVER[API Server<br/>Express:3001]
            LITELLM[LiteLLM Proxy<br/>Port:4000]
            RESULTS[Results Processor<br/>Java:8080]
        end
        
        subgraph "Data Layer"
            REDIS[Redis Cache<br/>Port:6379]
        end
    end

    subgraph "MongoDB Atlas"
        ATLAS_CLUSTER[MongoDB Cluster<br/>M30+ Tier]
        PARTICIPANTS_DB[participants collection]
        SAMPLE_DB[sample_airbnb collection]
        USER_DETAILS_DB[user_details collection]
    end

    subgraph "External AI Services"
        ANTHROPIC[Anthropic Claude]
        OPENAI[OpenAI GPT]
    end

    %% External Access
    USER --> ALB
    SA --> ALB
    ALB --> NGINX

    %% Nginx Routing
    NGINX --> PORTAL_FE
    NGINX --> DOCS_SITE
    NGINX --> VSCODE_SERVICE

    %% VSCode Environment
    VSCODE_SERVICE --> APP_FE
    VSCODE_SERVICE --> API_SERVER
    APP_FE --> API_SERVER

    %% Backend Services
    PORTAL_FE --> PORTAL_BE
    API_SERVER --> LITELLM
    API_SERVER --> RESULTS

    %% Database Connections
    PORTAL_BE --> PARTICIPANTS_DB
    PORTAL_BE --> USER_DETAILS_DB
    API_SERVER --> SAMPLE_DB
    RESULTS --> PARTICIPANTS_DB
    RESULTS --> SAMPLE_DB

    %% AI Integration
    LITELLM --> REDIS
    LITELLM --> ANTHROPIC
    LITELLM --> OPENAI

    %% Internal Service Communication
    RESULTS --> API_SERVER

    %% Styling
    style ATLAS_CLUSTER fill:#13aa52
    style ALB fill:#ff9900
    style NGINX fill:#ff6b6b
    style VSCODE_SERVICE fill:#007acc
    style API_SERVER fill:#68d391
    style LITELLM fill:#9c27b0
    style REDIS fill:#dc382d
```

## 6. Data Flow Architecture

This diagram shows how data flows through the system during different operations.

```mermaid
flowchart LR
    subgraph "Data Sources"
        SAMPLE[Sample Airbnb Dataset]
        USERS[Participant List]
        ANSWERS[Answer Keys]
    end

    subgraph "MongoDB Atlas"
        ATLAS[(MongoDB Cluster)]
        COLLECTIONS[Collections:<br/>- sample_airbnb<br/>- participants<br/>- user_details]
    end

    subgraph "Application Layer"
        API[API Server<br/>CRUD Operations]
        PORTAL[Portal Backend<br/>User Management]
        RESULTS[Results Processor<br/>Validation]
    end

    subgraph "Frontend Layer"
        APP[Sample App<br/>Property Search]
        PORTAL_UI[Portal UI<br/>Credential Management]
        VSCODE[VSCode Online<br/>Code Editor]
    end

    subgraph "AI Layer"
        CHAT[Chatbot Interface]
        LITELLM[LiteLLM Proxy]
        VECTOR[Vector Search]
    end

    %% Data Loading
    SAMPLE --> ATLAS
    USERS --> ATLAS
    ANSWERS --> ATLAS

    %% Application Data Access
    API --> COLLECTIONS
    PORTAL --> COLLECTIONS
    RESULTS --> COLLECTIONS

    %% Frontend Data Display
    APP --> API
    PORTAL_UI --> PORTAL
    VSCODE --> API

    %% AI Data Processing
    CHAT --> LITELLM
    LITELLM --> VECTOR
    VECTOR --> COLLECTIONS

    %% Exercise Flow
    VSCODE --> API
    API --> RESULTS
    RESULTS --> COLLECTIONS

    style ATLAS fill:#13aa52
    style API fill:#68d391
    style LITELLM fill:#9c27b0
    style VSCODE fill:#007acc
```

## 7. Security Architecture

This diagram shows the security layers and access controls in the system.

```mermaid
graph TB
    subgraph "External Access"
        INTERNET[Internet]
        PARTICIPANTS[Participants]
        SA[Solution Architects]
    end

    subgraph "AWS Security Layers"
        subgraph "Network Security"
            VPC[VPC with Private Subnets]
            SG[Security Groups]
            NACL[Network ACLs]
        end
        
        subgraph "Application Security"
            WAF[Web Application Firewall]
            SSL[SSL/TLS Termination]
            CORS[CORS Configuration]
        end
        
        subgraph "Identity & Access"
            IAM[IAM Roles & Policies]
            RBAC[Kubernetes RBAC]
        end
    end

    subgraph "MongoDB Atlas Security"
        subgraph "Network Access"
            IP_WHITELIST[IP Whitelist]
            VPC_PEERING[VPC Peering]
        end
        
        subgraph "Database Security"
            DB_USERS[Database Users]
            DB_ROLES[Database Roles]
            ENCRYPTION[Encryption at Rest]
        end
    end

    subgraph "Application Services"
        EKS[EKS Cluster]
        SERVICES[Kubernetes Services]
    end

    %% Security Flow
    INTERNET --> WAF
    WAF --> SSL
    SSL --> VPC
    VPC --> EKS
    EKS --> SERVICES

    %% Access Control
    PARTICIPANTS --> WAF
    SA --> WAF
    SA --> ATLAS

    %% Database Security
    SERVICES --> IP_WHITELIST
    IP_WHITELIST --> DB_USERS
    DB_USERS --> ENCRYPTION

    %% Identity Management
    EKS --> IAM
    EKS --> RBAC
    SERVICES --> DB_ROLES

    style WAF fill:#ff6b6b
    style SSL fill:#4caf50
    style ENCRYPTION fill:#2196f3
    style IAM fill:#ff9800
```

## Key Architectural Principles

### 1. **Multi-Tenancy**
- Each customer gets their own isolated environment
- Separate MongoDB Atlas projects and EKS namespaces
- Configurable via `config.yaml` and `scenario.json`

### 2. **Scalability**
- Kubernetes-based auto-scaling
- MongoDB Atlas auto-scaling enabled
- Stateless application design

### 3. **Security**
- Network isolation with VPC and security groups
- Database access controls and encryption
- SSL/TLS termination at load balancer

### 4. **Observability**
- Centralized logging via Kubernetes
- Health checks and monitoring
- Exercise completion tracking

### 5. **Developer Experience**
- Pre-configured development environment
- Integrated testing and validation
- Real-time feedback and leaderboards

This architecture enables MongoDB Solution Architects to quickly spin up training environments for customers while providing participants with a seamless, hands-on learning experience.
