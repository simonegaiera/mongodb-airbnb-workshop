#!/bin/bash

# Check if the repository exists and update or clone accordingly
if [ -d /home/workspace/mongodb-airbnb-workshop/.git ]; then
    echo "Repository exists. Pulling latest changes..."
    cd /home/workspace/mongodb-airbnb-workshop && git pull || echo "Failed to pull latest changes"
else
    echo "Repository does not exist. Cloning..."
    git clone https://github.com/simonegaiera/mongodb-airbnb-workshop /home/workspace/mongodb-airbnb-workshop || echo "Failed to clone repository"
fi

mkdir -p /home/workspace/mongodb-airbnb-workshop/server
echo -e "PORT=5000\nMONGODB_URI=" > /home/workspace/mongodb-airbnb-workshop/server/.env

USERNAME=$(tr -d '[:space:]' < /home/workspace/utils/user.conf)
URL=$(tr -d '[:space:]' < /home/workspace/utils/aws_route53_record_name.conf)

mkdir -p /home/workspace/mongodb-airbnb-workshop/app

cat <<EOL > /home/workspace/mongodb-airbnb-workshop/app/.env
WORKSHOP_USER=/frontend
BACKEND_URL=https://${USERNAME}.${URL}/backend
EOL

echo "Installing and building the app"
cd /home/workspace/mongodb-airbnb-workshop/app
npm install --legacy-peer-deps || echo "npm install failed in app"
npm run build || echo "npm build failed in app"

echo "Installing dependencies for the server"
cd /home/workspace/mongodb-airbnb-workshop/server
npm install --legacy-peer-deps || echo "npm install failed in server"
