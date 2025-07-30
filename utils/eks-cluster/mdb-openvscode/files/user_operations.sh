#!/bin/bash

# Function to echo with timestamp for long operations
echo_with_timestamp() {
    local message="$1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $message"
}

# Check if the repository exists and update or clone accordingly
if [ -d /home/workspace/mongodb-airbnb-workshop/.git ]; then
    echo_with_timestamp "Repository exists. Pulling latest changes..."
    git config --global --add safe.directory /home/workspace/mongodb-airbnb-workshop
    cd /home/workspace/mongodb-airbnb-workshop && git pull || echo_with_timestamp "Failed to pull latest changes"
else
    echo_with_timestamp "Repository does not exist. Cloning..."
    git clone https://github.com/simonegaiera/mongodb-airbnb-workshop /home/workspace/mongodb-airbnb-workshop || echo_with_timestamp "Failed to clone repository"
fi

# Get the values from settings.json
echo_with_timestamp "Reading configuration from settings.json"
USERNAME=$(jq -r '.user' /home/workspace/utils/settings.json)
URL=$(jq -r '.aws_route53_record_name' /home/workspace/utils/settings.json)
ATLAS_SRV=$(jq -r '.atlas_standard_srv' /home/workspace/utils/settings.json)
ATLAS_PWD=$(jq -r '.atlas_user_password' /home/workspace/utils/settings.json)
LLM_MODEL=$(jq -r '.llm_model' /home/workspace/utils/settings.json)
LLM_REGION=$(jq -r '.llm_region' /home/workspace/utils/settings.json)

ATLAS_HOST=${ATLAS_SRV#mongodb+srv://}

echo_with_timestamp "Creating server directory and .env file"
mkdir -p /home/workspace/mongodb-airbnb-workshop/server

cat <<EOL > /home/workspace/mongodb-airbnb-workshop/server/.env
PORT=5000
MONGODB_URI=mongodb+srv://${USERNAME}:${ATLAS_PWD}@${ATLAS_HOST}/?retryWrites=true&w=majority
LLM_MODEL=${LLM_MODEL}
AWS_REGION=${LLM_REGION}
EOL

echo_with_timestamp "Creating backend directory and .env file"
mkdir -p /home/workspace/mongodb-airbnb-workshop/backend

cat <<EOL > /home/workspace/mongodb-airbnb-workshop/backend/.env
PORT=5000
MONGODB_URI=mongodb+srv://${USERNAME}:${ATLAS_PWD}@${ATLAS_HOST}/?retryWrites=true&w=majority
LLM_MODEL=${LLM_MODEL}
AWS_REGION=${LLM_REGION}
DATABASE_NAME=${USERNAME}
EOL

echo_with_timestamp "Copying swagger.json to backend folder"
cp /home/workspace/mongodb-airbnb-workshop/docs/assets/files/swagger.json /home/workspace/mongodb-airbnb-workshop/backend/ || echo_with_timestamp "Failed to copy swagger.json"

echo_with_timestamp "Copying rest-lab folder to backend folder"
cp -r /home/workspace/mongodb-airbnb-workshop/server/src/lab/rest-lab /home/workspace/mongodb-airbnb-workshop/backend/ || echo_with_timestamp "Failed to copy rest-lab folder"

echo_with_timestamp "Creating app directory and .env file"
mkdir -p /home/workspace/mongodb-airbnb-workshop/app

cat <<EOL > /home/workspace/mongodb-airbnb-workshop/app/.env
WORKSHOP_USER=/app
BACKEND_URL=https://${USERNAME}.${URL}/backend
EOL

echo_with_timestamp "Installing and building the app"
cd /home/workspace/mongodb-airbnb-workshop/app
echo_with_timestamp "Installing app dependencies..."
npm install --legacy-peer-deps > /dev/null 2>&1 || echo_with_timestamp "npm install failed in app"
echo_with_timestamp "Building the app..."
npm run build > /dev/null 2>&1 || echo_with_timestamp "npm build failed in app"

echo_with_timestamp "Installing server dependencies"
cd /home/workspace/mongodb-airbnb-workshop/server
npm install --legacy-peer-deps > /dev/null 2>&1 || echo_with_timestamp "npm install failed in server"

echo_with_timestamp "Downloading and installing mongosh"
wget -q -P /tmp https://downloads.mongodb.com/compass/mongodb-mongosh_2.4.2_amd64.deb || echo_with_timestamp "Failed to download mongosh"
sudo dpkg -i /tmp/mongodb-mongosh_2.4.2_amd64.deb > /dev/null 2>&1 || echo_with_timestamp "Failed to install mongosh"
sudo apt-get install -f > /dev/null 2>&1 || echo_with_timestamp "Failed to fix dependencies"

echo_with_timestamp "Adding workspace to git safe directory"
git config --global --add safe.directory /home/workspace/mongodb-airbnb-workshop

echo_with_timestamp "User operations script completed successfully."
