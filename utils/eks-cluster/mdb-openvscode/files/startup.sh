#!/bin/bash

# Set debconf to non-interactive mode to avoid prompts
export DEBIAN_FRONTEND=noninteractive

# Function to echo with timestamp for long operations
echo_with_timestamp() {
    local message="$1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $message"
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
else
    echo_with_timestamp "Warning: Scenario config file not found at /home/workspace/scenario-config/scenario-config.json"
fi

# Install PostgreSQL client only if enabled in scenario config
if [ -f "/home/workspace/scenario-config/scenario-config.json" ]; then
    POSTGRES_ENABLED=$(echo "$SCENARIO_CONFIG" | jq -r '.database.postgres // false')
    if [ "$POSTGRES_ENABLED" = "true" ]; then
        echo_with_timestamp "Installing PostgreSQL client"
        apt-get update > /dev/null && \
        apt-get install -y postgresql-client > /dev/null && \
        apt-get clean && rm -rf /var/lib/apt/lists/*
    else
        echo_with_timestamp "PostgreSQL client installation skipped (not enabled in scenario config)"
    fi
else
    echo_with_timestamp "Skipping PostgreSQL client installation (no scenario config)"
fi

# Install Python 3.12 only if enabled in scenario config
if [ -f "/home/workspace/scenario-config/scenario-config.json" ]; then
    PYTHON_ENABLED=$(echo "$SCENARIO_CONFIG" | jq -r '.language.python // false')
    if [ "$PYTHON_ENABLED" = "true" ]; then
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
else
    echo_with_timestamp "Skipping Python 3.12 installation (no scenario config)"
fi

# Install Node.js 20 only if enabled in scenario config
if [ -f "/home/workspace/scenario-config/scenario-config.json" ]; then
    NODE_ENABLED=$(echo "$SCENARIO_CONFIG" | jq -r '.language.node // false')
    if [ "$NODE_ENABLED" = "true" ]; then
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
else
    echo_with_timestamp "Skipping Node.js 20 installation (no scenario config)"
fi

# Install OpenJDK 21 only if enabled in scenario config
if [ -f "/home/workspace/scenario-config/scenario-config.json" ]; then
    JAVA_ENABLED=$(echo "$SCENARIO_CONFIG" | jq -r '.language.java // false')
    if [ "$JAVA_ENABLED" = "true" ]; then
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
else
    echo_with_timestamp "Skipping OpenJDK 21 installation (no scenario config)"
fi

# Install uv and create virtual environment only if both PostgreSQL and MCP are enabled
if [ -f "/home/workspace/scenario-config/scenario-config.json" ]; then
    POSTGRES_ENABLED=$(echo "$SCENARIO_CONFIG" | jq -r '.database.postgres // false')
    MCP_ENABLED=$(echo "$SCENARIO_CONFIG" | jq -r '.llm.mcp // false')
    if [ "$POSTGRES_ENABLED" = "true" ] && [ "$MCP_ENABLED" = "true" ]; then
        echo_with_timestamp "Installing uv"
        sudo -u openvscode-server bash -c 'curl -LsSf https://astral.sh/uv/install.sh | sh'

        # Create virtual environment and install packages with uv
        echo_with_timestamp "Creating virtual environment and installing packages with uv"
        sudo -u openvscode-server bash -c '/home/openvscode-server/.local/bin/uv venv'
        sudo -u openvscode-server bash -c '/home/openvscode-server/.local/bin/uv pip install postgres-mcp'
    else
        echo_with_timestamp "uv installation skipped (PostgreSQL and MCP not both enabled in scenario config)"
    fi
else
    echo_with_timestamp "Skipping uv installation (no scenario config)"
fi

# Download and install AWS CLI v2 only if LLM is enabled
if [ -f "/home/workspace/scenario-config/scenario-config.json" ]; then
    LLM_ENABLED=$(echo "$SCENARIO_CONFIG" | jq -r '.llm.enabled // false')
    if [ "$LLM_ENABLED" = "true" ]; then
        echo_with_timestamp "Downloading and installing AWS CLI v2"
        mkdir -p /tmp
        cd /tmp
        if [ -f "awscliv2.zip" ]; then
            echo "awscliv2.zip already exists. Skipping download."
        else
            echo "awscliv2.zip not found. Downloading..."
        fi
        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
        unzip -q awscliv2.zip
        sudo ./aws/install > /dev/null
        # Clean up the downloaded files
        rm -rf /tmp/awscliv2.zip /tmp/aws
        echo_with_timestamp "AWS CLI v2 installed successfully"
        # Add AWS CLI to PATH
        export PATH=$PATH:/usr/local/bin/aws
        # Ensure the AWS CLI is executable by the openvscode-server user
        chmod +x /usr/local/bin/aws
    else
        echo_with_timestamp "AWS CLI v2 installation skipped (LLM not enabled in scenario config)"
    fi
else
    echo_with_timestamp "Skipping AWS CLI v2 installation (no scenario config)"
fi

# Create a user-specific operations script
echo_with_timestamp "Changing npm directory ownership"
# chown -R openvscode-server:openvscode-server /home/workspace/.npm
find /home/openvscode-server/.npm -type f -exec chown openvscode-server:openvscode-server {} + 2>/dev/null || true
find /home/openvscode-server/.npm -type d -exec chown openvscode-server:openvscode-server {} + 2>/dev/null || true

echo_with_timestamp "Checking if directory /home/workspace/mongodb-airbnb-workshop is empty"
# Check if directory is empty and change ownership if it is
if [ -z "$(ls -A /home/workspace/mongodb-airbnb-workshop)" ]; then
    echo_with_timestamp "Directory is empty. Changing ownership."
    chown -R openvscode-server:openvscode-server /home/workspace/mongodb-airbnb-workshop
else
    echo_with_timestamp "Directory is not empty. Ownership not changed."
fi

echo_with_timestamp "Executing user-specific operations script"
# Execute the user-specific operations script as the desired user
sudo -u openvscode-server bash /tmp/user_operations.sh

echo_with_timestamp "Script executed successfully"
