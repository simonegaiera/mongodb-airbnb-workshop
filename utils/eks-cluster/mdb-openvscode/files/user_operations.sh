#!/bin/bash

# Function to echo with timestamp for long operations
echo_with_timestamp() {
    local message="$1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $message"
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
    BACKEND_TYPE=$(echo "$SCENARIO_CONFIG" | jq -r '.backend // ""')
    REPOSITORY=$(echo "$SCENARIO_CONFIG" | jq -r '.repository // "https://github.com/simonegaiera/mongodb-airbnb-workshop"')
    BRANCH=$(echo "$SCENARIO_CONFIG" | jq -r '.branch // "main"')
    FRONTEND_TYPE=$(echo "$SCENARIO_CONFIG" | jq -r '.frontend // ""')
else
    echo_with_timestamp "Warning: Scenario config file not found at /home/workspace/scenario-config/scenario-config.json"
    # Set defaults if config file not found
    REPOSITORY="https://github.com/simonegaiera/mongodb-airbnb-workshop"
    BRANCH="main"
    FRONTEND_TYPE="app"
fi

# Check if the repository exists and update or clone accordingly
if [ -d /home/workspace/mongodb-airbnb-workshop/.git ]; then
    echo_with_timestamp "Repository exists. Pulling latest changes..."
    git config --global --add safe.directory /home/workspace/mongodb-airbnb-workshop
    cd /home/workspace/mongodb-airbnb-workshop && git pull || echo_with_timestamp "Failed to pull latest changes"
else
    echo_with_timestamp "Repository does not exist. Cloning..."
    git clone -b "$BRANCH" "$REPOSITORY" /home/workspace/mongodb-airbnb-workshop || echo_with_timestamp "Failed to clone repository"
fi

# Get the values from settings.json
echo_with_timestamp "Reading configuration from user.json"
USERNAME=$(jq -r '.user' /home/workspace/utils/user.json)

ATLAS_HOST=${ATLAS_SRV#mongodb+srv://}

# Create backend directory and .env based on backend type
if [ "$BACKEND_TYPE" != "" ]; then
    echo_with_timestamp "Creating $BACKEND_TYPE directory and .env file"
    mkdir -p /home/workspace/mongodb-airbnb-workshop/$BACKEND_TYPE

    cat <<EOL > /home/workspace/mongodb-airbnb-workshop/$BACKEND_TYPE/.env
PORT=5000
MONGODB_URI=mongodb+srv://${USERNAME}:${ATLAS_PWD}@${ATLAS_HOST}/?retryWrites=true&w=majority
LLM_MODEL=${LLM_MODEL}
AWS_REGION=${LLM_REGION}
DATABASE_NAME=${USERNAME}
EOL

    # Copy files only for backend type
    if [ "$BACKEND_TYPE" = "backend" ]; then
        echo_with_timestamp "Copying files to backend folder"
        cp /home/workspace/mongodb-airbnb-workshop/docs/assets/files/swagger.json /home/workspace/mongodb-airbnb-workshop/backend/ || echo_with_timestamp "Failed to copy swagger.json"
        cp -r /home/workspace/mongodb-airbnb-workshop/server/src/lab/rest-lab /home/workspace/mongodb-airbnb-workshop/backend/ || echo_with_timestamp "Failed to copy rest-lab folder"
    fi

    # Install dependencies only for server
    if [ "$BACKEND_TYPE" = "server" ]; then
        echo_with_timestamp "Installing server dependencies"
        cd /home/workspace/mongodb-airbnb-workshop/$BACKEND_TYPE
        npm install --legacy-peer-deps > /dev/null 2>&1 || echo_with_timestamp "npm install failed in $BACKEND_TYPE"
    fi
fi

echo_with_timestamp "Creating $FRONTEND_TYPE directory and .env file"
mkdir -p /home/workspace/mongodb-airbnb-workshop/$FRONTEND_TYPE

cat <<EOL > /home/workspace/mongodb-airbnb-workshop/$FRONTEND_TYPE/.env
WORKSHOP_USER=/app
BACKEND_URL=https://${USERNAME}.${URL}/backend
EOL

echo_with_timestamp "Installing and building the app"
cd /home/workspace/mongodb-airbnb-workshop/$FRONTEND_TYPE
echo_with_timestamp "Installing app dependencies..."
npm install --legacy-peer-deps > /dev/null 2>&1 || echo_with_timestamp "npm install failed in $FRONTEND_TYPE"
echo_with_timestamp "Building the app..."
npm run build > /dev/null 2>&1 || echo_with_timestamp "npm build failed in $FRONTEND_TYPE"

echo_with_timestamp "Downloading and installing mongosh"
wget -q -P /tmp https://downloads.mongodb.com/compass/mongodb-mongosh_2.4.2_amd64.deb || echo_with_timestamp "Failed to download mongosh"
sudo dpkg -i /tmp/mongodb-mongosh_2.4.2_amd64.deb > /dev/null 2>&1 || echo_with_timestamp "Failed to install mongosh"
sudo apt-get install -f > /dev/null 2>&1 || echo_with_timestamp "Failed to fix dependencies"

echo_with_timestamp "User operations script completed successfully."
