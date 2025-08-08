#!/bin/bash

# Function to echo with timestamp for long operations
echo_with_timestamp() {
    local message="$1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $message"
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
    
    # Extract values from scenario config
    URL=$(echo "$SCENARIO_CONFIG" | jq -r '.aws_route53_record_name // ""')
    ATLAS_SRV=$(echo "$SCENARIO_CONFIG" | jq -r '.atlas_standard_srv // ""')
    ATLAS_PWD=$(echo "$SCENARIO_CONFIG" | jq -r '.atlas_user_password // ""')
    LLM_MODEL=$(echo "$SCENARIO_CONFIG" | jq -r '.llm.model // ""')
    LLM_REGION=$(echo "$SCENARIO_CONFIG" | jq -r '.llm.region // ""')
    LLM_PROVIDER=$(echo "$SCENARIO_CONFIG" | jq -r '.llm.provider // ""')
    BACKEND_TYPE=$(echo "$SCENARIO_CONFIG" | jq -r '.backend // ""')
    REPOSITORY=$(echo "$SCENARIO_CONFIG" | jq -r '.repository // "https://github.com/simonegaiera/mongodb-airbnb-workshop"')
    BRANCH=$(echo "$SCENARIO_CONFIG" | jq -r '.branch // "main"')
    FRONTEND_TYPE=$(echo "$SCENARIO_CONFIG" | jq -r '.frontend // ""')
    # Add LLM proxy configuration variables
    LLM_PROXY_ENABLED=$(echo "$SCENARIO_CONFIG" | jq -r '.llm.proxy.enabled // false')
    LLM_PROXY_TYPE=$(echo "$SCENARIO_CONFIG" | jq -r '.llm.proxy.type // ""')
    LLM_PROXY_SERVICE=$(echo "$SCENARIO_CONFIG" | jq -r '.llm.proxy."service-name" // ""')
    LLM_PROXY_PORT=$(echo "$SCENARIO_CONFIG" | jq -r '.llm.proxy.port // ""')
    LLM_BEDROCK=$(echo "$SCENARIO_CONFIG" | jq -r '.llm.bedrock // false')

else
    echo_with_timestamp "Warning: Scenario config file not found at /home/workspace/scenario-config/scenario-config.json"
    # Set defaults if config file not found
    REPOSITORY="https://github.com/simonegaiera/mongodb-airbnb-workshop"
    BRANCH="main"
    FRONTEND_TYPE="app"
fi

# Extract repository name from URL
REPO_NAME=$(get_repo_name "$REPOSITORY")
REPO_PATH="/home/workspace/$REPO_NAME"

echo_with_timestamp "Repository: $REPOSITORY"
echo_with_timestamp "Repository folder: $REPO_NAME"

# Check if the repository exists and update or clone accordingly
if [ -d "$REPO_PATH/.git" ]; then
    echo_with_timestamp "Repository exists. Pulling latest changes..."
    git config --global --add safe.directory "$REPO_PATH"
    cd "$REPO_PATH" && git pull || echo_with_timestamp "Failed to pull latest changes"
else
    echo_with_timestamp "Repository does not exist. Cloning..."
    git clone -b "$BRANCH" "$REPOSITORY" "$REPO_PATH" || echo_with_timestamp "Failed to clone repository"
fi

# Get the values from settings.json
echo_with_timestamp "Reading configuration from user.json"
USERNAME=$(jq -r '.user' /home/workspace/utils/user.json)

ATLAS_HOST=${ATLAS_SRV#mongodb+srv://}

# Create backend directory and .env based on backend type
if [ "$BACKEND_TYPE" != "" ]; then
    echo_with_timestamp "Creating $BACKEND_TYPE directory and .env file"
    mkdir -p "$REPO_PATH/$BACKEND_TYPE"

    cat <<EOL > "$REPO_PATH/$BACKEND_TYPE/.env"
PORT=5000
MONGODB_URI=mongodb+srv://${USERNAME}:${ATLAS_PWD}@${ATLAS_HOST}/?retryWrites=true&w=majority
LLM_MODEL=${LLM_MODEL}
LLM_PROVIDER=${LLM_PROVIDER}
AWS_REGION=${LLM_REGION}
DATABASE_NAME=${USERNAME}
LLM_PROXY_ENABLED=${LLM_PROXY_ENABLED}
LLM_PROXY_TYPE=${LLM_PROXY_TYPE}
LLM_PROXY_SERVICE=${LLM_PROXY_SERVICE}
LLM_PROXY_PORT=${LLM_PROXY_PORT}
LLM_BEDROCK=${LLM_BEDROCK}
EOL

    # Copy files only for backend type
    if [ "$BACKEND_TYPE" = "backend" ]; then
        echo_with_timestamp "Copying files to backend folder"
        cp "$REPO_PATH/docs/assets/files/swagger.json" "$REPO_PATH/backend/" || echo_with_timestamp "Failed to copy swagger.json"
        cp -r "$REPO_PATH/server/src/lab/rest-lab" "$REPO_PATH/backend/" || echo_with_timestamp "Failed to copy rest-lab folder"
    fi

    # Install dependencies only for server
    if [ "$BACKEND_TYPE" = "server" ]; then
        echo_with_timestamp "Installing server dependencies"
        cd "$REPO_PATH/$BACKEND_TYPE"
        npm install --legacy-peer-deps > /dev/null 2>&1 || echo_with_timestamp "npm install failed in $BACKEND_TYPE"
    fi
fi

echo_with_timestamp "Creating $FRONTEND_TYPE directory and .env file"
mkdir -p "$REPO_PATH/$FRONTEND_TYPE"

cat <<EOL > "$REPO_PATH/$FRONTEND_TYPE/.env"
WORKSHOP_USER=/app
BACKEND_URL=https://${USERNAME}.${URL}/backend
EOL

echo_with_timestamp "Installing and building the app"
cd "$REPO_PATH/$FRONTEND_TYPE"
echo_with_timestamp "Installing app dependencies..."
npm install --legacy-peer-deps > /dev/null 2>&1 || echo_with_timestamp "npm install failed in $FRONTEND_TYPE"
echo_with_timestamp "Building the app..."
npm run build > /dev/null 2>&1 || echo_with_timestamp "npm build failed in $FRONTEND_TYPE"

echo_with_timestamp "Downloading and installing mongosh"
wget -q -P /tmp https://downloads.mongodb.com/compass/mongodb-mongosh_2.4.2_amd64.deb || echo_with_timestamp "Failed to download mongosh"
sudo dpkg -i /tmp/mongodb-mongosh_2.4.2_amd64.deb > /dev/null 2>&1 || echo_with_timestamp "Failed to install mongosh"
sudo apt-get install -f > /dev/null 2>&1 || echo_with_timestamp "Failed to fix dependencies"

# Source and call the lab exercises setup script if backend is server
if [ "$BACKEND_TYPE" = "server" ]; then
    echo_with_timestamp "Setting up lab exercises and navigation for server backend"
    
    # Source the setup script
    source "$(dirname "$0")/setup_lab_exercises.sh"
    
    # Call the main function with required parameters
    main "$REPO_PATH" "$SCENARIO_CONFIG" "$BACKEND_TYPE"
fi

echo_with_timestamp "User operations script completed successfully."
