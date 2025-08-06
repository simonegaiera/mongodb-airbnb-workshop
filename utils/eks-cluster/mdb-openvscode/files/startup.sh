#!/bin/bash

# Set debconf to non-interactive mode to avoid prompts
export DEBIAN_FRONTEND=noninteractive

# Function to echo with timestamp for long operations
echo_with_timestamp() {
    local message="$1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $message"
}

# Function to check if feature is enabled
is_enabled() {
    local feature="$1"
    local default="${2:-false}"
    
    if [ -f "/home/workspace/scenario-config/scenario-config.json" ]; then
        echo "$SCENARIO_CONFIG" | jq -r "$feature // $default"
    else
        echo "false"
    fi
}

# Function to extract repository name from URL
get_repo_name() {
    local repo_url="$1"
    basename "$repo_url" .git
}

echo_with_timestamp "Updating system packages"
apt-get update > /dev/null && \
apt-get install -y apt-utils > /dev/null

echo_with_timestamp "Installing required packages"
apt-get update > /dev/null && \
apt-get install -y git curl less vim net-tools lsof jq unzip software-properties-common > /dev/null && \
apt-get clean && rm -rf /var/lib/apt/lists/*

echo_with_timestamp "Reading scenario configuration"
# Check if the scenario config file exists and read it
if [ -f "/home/workspace/scenario-config/scenario-config.json" ]; then
    echo_with_timestamp "Scenario config found, reading configuration..."
    
    # Read the JSON file and extract values using jq
    SCENARIO_CONFIG=$(cat /home/workspace/scenario-config/scenario-config.json)

    echo_with_timestamp "Scenario configuration loaded successfully"
    
    # Extract repository URL to determine folder name
    REPOSITORY=$(echo "$SCENARIO_CONFIG" | jq -r '.repository // "https://github.com/simonegaiera/mongodb-airbnb-workshop"')
    REPO_NAME=$(get_repo_name "$REPOSITORY")
else
    echo_with_timestamp "Warning: Scenario config file not found at /home/workspace/scenario-config/scenario-config.json"
    SCENARIO_CONFIG="{}"
    # Default repository if config not found
    REPO_NAME="mongodb-airbnb-workshop"
fi

# Install PostgreSQL client only if enabled in scenario config
if [ "$(is_enabled '.database.postgres')" = "true" ]; then
    echo_with_timestamp "Installing PostgreSQL client"
    apt-get update > /dev/null && \
    apt-get install -y postgresql-client > /dev/null && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
else
    echo_with_timestamp "PostgreSQL client installation skipped (not enabled in scenario config)"
fi

# Install Python 3.12 only if enabled in scenario config
if [ "$(is_enabled '.language.python')" = "true" ]; then
    echo_with_timestamp "Installing Python 3.12"
    apt-get update > /dev/null && \
    add-apt-repository ppa:deadsnakes/ppa -y > /dev/null && \
    apt-get update > /dev/null && \
    apt-get install -y python3.12-full > /dev/null && \
    python3.12 -m ensurepip --upgrade && \
    update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.12 1 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
else
    echo_with_timestamp "Python 3.12 installation skipped (not enabled in scenario config)"
fi

# Install Node.js 20 only if enabled in scenario config
if [ "$(is_enabled '.language.node')" = "true" ]; then
    echo_with_timestamp "Installing Node.js 20"
    apt-get update > /dev/null && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs > /dev/null && \
    npm install -g npm@latest && \
    npm install -g mongodb-mcp-server && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
else
    echo_with_timestamp "Node.js 20 installation skipped (not enabled in scenario config)"
fi

# Install OpenJDK 21 only if enabled in scenario config
if [ "$(is_enabled '.language.java')" = "true" ]; then
    echo_with_timestamp "Installing OpenJDK 21"
    apt-get update > /dev/null && \
    apt-get install -y openjdk-21-jdk maven > /dev/null && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
    
    # Set JAVA_HOME environment variable
    echo_with_timestamp "Setting JAVA_HOME environment variable"
    export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
    echo 'export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64' >> /etc/environment
    echo 'export PATH=$PATH:$JAVA_HOME/bin' >> /etc/environment
else
    echo_with_timestamp "OpenJDK 21 installation skipped (not enabled in scenario config)"
fi

# Install uv and create virtual environment only if both PostgreSQL and MCP are enabled
if [ "$(is_enabled '.database.postgres')" = "true" ] && [ "$(is_enabled '.llm.mcp')" = "true" ]; then
    echo_with_timestamp "Installing uv"
    sudo -u openvscode-server bash -c 'curl -LsSf https://astral.sh/uv/install.sh | sh'

    # Create virtual environment and install packages with uv
    echo_with_timestamp "Creating virtual environment and installing packages with uv"
    sudo -u openvscode-server bash -c '/home/openvscode-server/.local/bin/uv venv'
    sudo -u openvscode-server bash -c '/home/openvscode-server/.local/bin/uv pip install postgres-mcp'
else
    echo_with_timestamp "uv installation skipped (PostgreSQL and MCP not both enabled in scenario config)"
fi

# Download and install AWS CLI v2 only if LLM is enabled
if [ "$(is_enabled '.llm.enabled')" = "true" ]; then
    echo_with_timestamp "Downloading and installing AWS CLI v2"
    cd /tmp
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip -q awscliv2.zip
    sudo ./aws/install > /dev/null
    rm -rf awscliv2.zip aws
    echo_with_timestamp "AWS CLI v2 installed successfully"
    export PATH=$PATH:/usr/local/bin/aws
    chmod +x /usr/local/bin/aws
else
    echo_with_timestamp "AWS CLI v2 installation skipped (LLM not enabled in scenario config)"
fi

# Create a user-specific operations script
echo_with_timestamp "Changing npm directory ownership"
find /home/openvscode-server/.npm -type f -exec chown openvscode-server:openvscode-server {} + 2>/dev/null || true
find /home/openvscode-server/.npm -type d -exec chown openvscode-server:openvscode-server {} + 2>/dev/null || true

echo_with_timestamp "Checking if directory /home/workspace/$REPO_NAME is empty"
if [ -z "$(ls -A /home/workspace/$REPO_NAME)" ]; then
    echo_with_timestamp "Directory is empty. Changing ownership."
    chown -R openvscode-server:openvscode-server /home/workspace/$REPO_NAME
else
    echo_with_timestamp "Directory is not empty. Ownership not changed."
fi

echo_with_timestamp "Executing user-specific operations script"
sudo -u openvscode-server bash /tmp/user_operations.sh

echo_with_timestamp "Script executed successfully"
