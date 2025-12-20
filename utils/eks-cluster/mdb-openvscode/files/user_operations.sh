#!/bin/bash

# Exit immediately if any command fails
set -e
set -o pipefail

# Function to handle errors
handle_error() {
    local exit_code=$1
    local line_number=$2
    local command="$3"
    echo_with_timestamp "ERROR: Command '$command' failed with exit code $exit_code at line $line_number"
    echo_with_timestamp "FATAL: User operations script failed - pod should be restarted"
    exit $exit_code
}

# Set error trap
trap 'handle_error $? $LINENO "$BASH_COMMAND"' ERR

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

echo_with_timestamp "Reading enhanced scenario configuration"
# Check if the enhanced scenario config file exists and read it
if [ -f "/home/workspace/scenario-config/enhanced-scenario-config.json" ]; then
    echo_with_timestamp "Enhanced scenario config found, reading configuration..."
    
    # Read the JSON file and extract values using jq
    SCENARIO_CONFIG=$(cat /home/workspace/scenario-config/enhanced-scenario-config.json)

    echo_with_timestamp "Enhanced scenario configuration loaded successfully"
    
    # Extract values from enhanced scenario config
    URL=$(echo "$SCENARIO_CONFIG" | jq -r '.aws_route53_record_name // ""')
    ATLAS_SRV=$(echo "$SCENARIO_CONFIG" | jq -r '.atlas_standard_srv // ""')
    ATLAS_PWD=$(echo "$SCENARIO_CONFIG" | jq -r '.atlas_user_password // ""')
    BACKEND_TYPE=$(echo "$SCENARIO_CONFIG" | jq -r '.backend // ""')
    REPOSITORY=$(echo "$SCENARIO_CONFIG" | jq -r '.repository // "https://github.com/simonegaiera/mongodb-airbnb-workshop"')
    BRANCH=$(echo "$SCENARIO_CONFIG" | jq -r '.branch // "main"')
    FRONTEND_TYPE=$(echo "$SCENARIO_CONFIG" | jq -r '.frontend // ""')
    # Add LLM proxy configuration variables
    # LLM_MODEL=$(echo "$SCENARIO_CONFIG" | jq -r '.llm.model // ""')
    # LLM_REGION=$(echo "$SCENARIO_CONFIG" | jq -r '.llm.region // ""')
    # LLM_PROXY_ENABLED=$(echo "$SCENARIO_CONFIG" | jq -r '.llm.proxy.enabled // false')
    # LLM_PROXY_TYPE=$(echo "$SCENARIO_CONFIG" | jq -r '.llm.proxy.type // ""')
    # LLM_PROXY_SERVICE=$(echo "$SCENARIO_CONFIG" | jq -r '.llm.proxy."service-name" // ""')
    # LLM_PROXY_PORT=$(echo "$SCENARIO_CONFIG" | jq -r '.llm.proxy.port // ""')
    # LLM_BEDROCK=$(echo "$SCENARIO_CONFIG" | jq -r '.llm.bedrock // false')

else
    echo_with_timestamp "Warning: Enhanced scenario config file not found at /home/workspace/scenario-config/enhanced-scenario-config.json"
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
    cd "$REPO_PATH"
    
    # Validate we are in a git repository before attempting git operations
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo_with_timestamp "FATAL: Directory exists but is not a valid git repository: $REPO_PATH"
        exit 1
    fi
    
    # Attempt to pull changes - fail if unsuccessful
    if ! git pull; then
        echo_with_timestamp "FATAL: Failed to pull latest changes from repository"
        exit 1
    fi
else
    echo_with_timestamp "Repository does not exist. Cloning..."
    # Attempt to clone - fail if unsuccessful
    if ! git clone -b "$BRANCH" "$REPOSITORY" "$REPO_PATH"; then
        echo_with_timestamp "FATAL: Failed to clone repository $REPOSITORY"
        exit 1
    fi
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
DATABASE_NAME=${USERNAME}
EOL

    # Copy files only for backend type
    if [ "$BACKEND_TYPE" = "backend" ]; then
        echo_with_timestamp "Copying files to backend folder"
        
        # Validate source files exist before copying
        if [ ! -f "$REPO_PATH/docs/assets/files/swagger.json" ]; then
            echo_with_timestamp "FATAL: Required file swagger.json not found at $REPO_PATH/docs/assets/files/"
            exit 1
        fi
        
        if [ ! -d "$REPO_PATH/server/src/lab/rest-lab" ]; then
            echo_with_timestamp "FATAL: Required directory rest-lab not found at $REPO_PATH/server/src/lab/"
            exit 1
        fi
        
        cp "$REPO_PATH/docs/assets/files/swagger.json" "$REPO_PATH/backend/"
        cp -r "$REPO_PATH/server/src/lab/rest-lab" "$REPO_PATH/backend/"
    fi

    # Install dependencies only for server
    if [ "$BACKEND_TYPE" = "server" ]; then
        echo_with_timestamp "Installing server dependencies"
        cd "$REPO_PATH/$BACKEND_TYPE"

        # Validate package.json exists
        if [ ! -f "package.json" ]; then
            echo_with_timestamp "FATAL: package.json not found in $REPO_PATH/$BACKEND_TYPE"
            exit 1
        fi

        # Attempt npm install with retry logic and visible error output
        MAX_RETRIES=3
        RETRY_COUNT=0
        NPM_SUCCESS=false

        while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
            echo_with_timestamp "Attempting npm install (attempt $((RETRY_COUNT + 1))/$MAX_RETRIES)..."

            if npm install --legacy-peer-deps 2>&1 | tee /tmp/npm-install-server.log; then
                NPM_SUCCESS=true
                echo_with_timestamp "npm install succeeded in $BACKEND_TYPE"
                break
            else
                RETRY_COUNT=$((RETRY_COUNT + 1))
                if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
                    echo_with_timestamp "npm install failed, retrying in 5 seconds..."
                    sleep 5
                fi
            fi
        done

        if [ "$NPM_SUCCESS" = false ]; then
            echo_with_timestamp "FATAL: npm install failed in $BACKEND_TYPE after $MAX_RETRIES attempts"
            echo_with_timestamp "Last error output:"
            tail -50 /tmp/npm-install-server.log
            exit 1
        fi
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

# Validate package.json exists for frontend
if [ ! -f "package.json" ]; then
    echo_with_timestamp "FATAL: package.json not found in $REPO_PATH/$FRONTEND_TYPE"
    exit 1
fi

echo_with_timestamp "Installing app dependencies..."
MAX_RETRIES=3
RETRY_COUNT=0
NPM_SUCCESS=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo_with_timestamp "Attempting npm install for $FRONTEND_TYPE (attempt $((RETRY_COUNT + 1))/$MAX_RETRIES)..."

    if npm install --legacy-peer-deps 2>&1 | tee /tmp/npm-install-frontend.log; then
        NPM_SUCCESS=true
        echo_with_timestamp "npm install succeeded in $FRONTEND_TYPE"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo_with_timestamp "npm install failed, retrying in 5 seconds..."
            sleep 5
        fi
    fi
done

if [ "$NPM_SUCCESS" = false ]; then
    echo_with_timestamp "FATAL: npm install failed in $FRONTEND_TYPE after $MAX_RETRIES attempts"
    echo_with_timestamp "Last error output:"
    tail -50 /tmp/npm-install-frontend.log
    exit 1
fi

echo_with_timestamp "Building the app..."
if ! npm run build 2>&1 | tee /tmp/npm-build-frontend.log; then
    echo_with_timestamp "FATAL: npm build failed in $FRONTEND_TYPE"
    echo_with_timestamp "Build error output:"
    tail -50 /tmp/npm-build-frontend.log
    exit 1
fi

# Source and call the lab exercises setup script conditionally
if [ "$BACKEND_TYPE" = "server" ]; then
    echo_with_timestamp "Server backend detected, checking if lab exercises setup is needed"
    
    # Check if enhanced scenario config exists and get total_answer_files_needed
    if [ -f "/home/workspace/scenario-config/enhanced-scenario-config.json" ]; then
        TOTAL_ANSWER_FILES_NEEDED=$(echo "$SCENARIO_CONFIG" | jq -r '.needed_answer_files.summary.total_answer_files_needed // 0')
        
        echo_with_timestamp "Total answer files needed: $TOTAL_ANSWER_FILES_NEEDED"
        
        # Only run setup if total_answer_files_needed is not zero
        if [ "$TOTAL_ANSWER_FILES_NEEDED" -ne 0 ]; then
            echo_with_timestamp "Answer files needed, setting up lab exercises"
            
            # Source the setup script and call the function
            source "$(dirname "$0")/setup_lab_exercises.sh"
            setup_lab_exercises
        else
            echo_with_timestamp "No answer files needed, skipping lab exercises setup"
        fi
    else
        echo_with_timestamp "Enhanced scenario config not found, skipping lab exercises setup"
    fi
fi

echo_with_timestamp "User operations script completed successfully."
