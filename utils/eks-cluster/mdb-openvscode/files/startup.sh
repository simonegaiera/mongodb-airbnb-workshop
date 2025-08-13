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

# Install uv and create virtual environment only if both PostgreSQL and MCP are enabled
if [ "$(is_enabled '.database.postgres')" = "true" ] && [ "$(is_enabled '.llm.mcp')" = "true" ]; then
    # Create virtual environment and install packages with uv
    echo_with_timestamp "Creating virtual environment and installing packages with uv"
    sudo -u openvscode-server bash -c 'uv venv'
    sudo -u openvscode-server bash -c 'uv pip install postgres-mcp'
else
    echo_with_timestamp "uv installation skipped (PostgreSQL and MCP not both enabled in scenario config)"
fi

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
