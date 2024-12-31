#!/bin/bash

echo "Updating and installing packages"
apt-get update && \
apt-get install -y git curl nginx less vim net-tools lsof && \
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
apt-get install -y nodejs && \
npm install -g npm@latest && \
apt-get clean && rm -rf /var/lib/apt/lists/*

echo "Changing npm directory ownership"
chown -R openvscode-server:openvscode-server /home/workspace/.npm

echo "Checking if directory /home/workspace/mongodb-airbnb-workshop is empty"
# Check if directory is empty and change ownership if it is
if [ -z "$(ls -A /home/workspace/mongodb-airbnb-workshop)" ]; then
    echo "Directory is empty. Changing ownership."
    chown -R openvscode-server:openvscode-server /home/workspace/mongodb-airbnb-workshop
else
    echo "Directory is not empty. Ownership not changed."
fi

echo "Executing user-specific operations script"
# Execute the user-specific operations script as the desired user
sudo -u openvscode-server bash /tmp/user_operations.sh

echo "Script executed successfully"