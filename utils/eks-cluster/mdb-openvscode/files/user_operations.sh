#!/bin/bash

# Check if the repository exists and update or clone accordingly
if [ -d /home/workspace/mongodb-airbnb-workshop/.git ]; then
    echo "Repository exists. Pulling latest changes..."
    cd /home/workspace/mongodb-airbnb-workshop && git pull || echo "Failed to pull latest changes"
else
    echo "Repository does not exist. Cloning..."
    git clone https://github.com/simonegaiera/mongodb-airbnb-workshop /home/workspace/mongodb-airbnb-workshop || echo "Failed to clone repository"
fi

# Get the values from settings.json
USERNAME=$(jq -r '.user' /home/workspace/utils/settings.json)
URL=$(jq -r '.aws_route53_record_name' /home/workspace/utils/settings.json)
ATLAS_SRV=$(jq -r '.atlas_standard_srv' /home/workspace/utils/settings.json)
ATLAS_PWD=$(jq -r '.atlas_user_password' /home/workspace/utils/settings.json)
LLM_MODEL=$(jq -r '.llm_model' /home/workspace/utils/settings.json)
LLM_REGION=$(jq -r '.llm_region' /home/workspace/utils/settings.json)

ATLAS_HOST=${ATLAS_SRV#mongodb+srv://}

mkdir -p /home/workspace/mongodb-airbnb-workshop/server

cat <<EOL > /home/workspace/mongodb-airbnb-workshop/server/.env
PORT=5000
MONGODB_URI=mongodb+srv://${USERNAME}:${ATLAS_PWD}@${ATLAS_HOST}/?retryWrites=true&w=majority
LLM_MODEL=${LLM_MODEL}
AWS_REGION=${LLM_REGION}
EOL

mkdir -p /home/workspace/mongodb-airbnb-workshop/backend

cat <<EOL > /home/workspace/mongodb-airbnb-workshop/backend/.env
PORT=5000
MONGODB_URI=mongodb+srv://${USERNAME}:${ATLAS_PWD}@${ATLAS_HOST}/?retryWrites=true&w=majority
LLM_MODEL=${LLM_MODEL}
AWS_REGION=${LLM_REGION}
EOL

echo "Copying swagger.json to backend folder"
cp /home/workspace/mongodb-airbnb-workshop/docs/assets/files/swagger.json /home/workspace/mongodb-airbnb-workshop/backend/ || echo "Failed to copy swagger.json"

echo "Copying playground folder to backend folder"
cp -r /home/workspace/mongodb-airbnb-workshop/server/src/lab/playground /home/workspace/mongodb-airbnb-workshop/backend/ || echo "Failed to copy playground folder"

echo "Copying rest-lab folder to backend folder"
cp -r /home/workspace/mongodb-airbnb-workshop/server/src/lab/rest-lab /home/workspace/mongodb-airbnb-workshop/backend/ || echo "Failed to copy rest-lab folder"

mkdir -p /home/workspace/mongodb-airbnb-workshop/app

cat <<EOL > /home/workspace/mongodb-airbnb-workshop/app/.env
WORKSHOP_USER=/app
BACKEND_URL=https://${USERNAME}.${URL}/backend
EOL

echo "Installing and building the app"
cd /home/workspace/mongodb-airbnb-workshop/app
echo "Installing the app..."
npm install --legacy-peer-deps || echo "npm install failed in app"
echo "Building the app..."
npm run build || echo "npm build failed in app"

echo "Installing dependencies for the server"
cd /home/workspace/mongodb-airbnb-workshop/server
npm install --legacy-peer-deps || echo "npm install failed in server"

wget -P /tmp https://downloads.mongodb.com/compass/mongodb-mongosh_2.4.2_amd64.deb || echo "Failed to download mongosh"
sudo dpkg -i /tmp/mongodb-mongosh_2.4.2_amd64.deb || echo "Failed to install mongosh"
sudo apt-get install -f || echo "Failed to fix dependencies"

echo "Adding workspace to git safe directory"
git config --global --add safe.directory /home/workspace/mongodb-airbnb-workshop

echo "User operations script completed successfully."
