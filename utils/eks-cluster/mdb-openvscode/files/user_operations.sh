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

ATLAS_HOST=${ATLAS_SRV#mongodb+srv://}

mkdir -p /home/workspace/mongodb-airbnb-workshop/server

cat <<EOL > /home/workspace/mongodb-airbnb-workshop/server/.env
PORT=5000
MONGODB_URI=mongodb+srv://${USERNAME}:${ATLAS_PWD}@${ATLAS_HOST}/?retryWrites=true&w=majority
EOL

mkdir -p /home/workspace/mongodb-airbnb-workshop/app

cat <<EOL > /home/workspace/mongodb-airbnb-workshop/app/.env
WORKSHOP_USER=/frontend
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
