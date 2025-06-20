#!/bin/bash

echo "Updating and installing packages"
apt-get update && \
apt-get install -y git curl nginx less vim net-tools lsof jq unzip && \
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
apt-get install -y nodejs && \
npm install -g npm@latest && \
apt-get clean && rm -rf /var/lib/apt/lists/*

# Download and install AWS CLI v2
echo "Downloading and installing AWS CLI v2"
mkdir -p /tmp
cd /tmp
if [ -f "awscliv2.zip" ]; then
    echo "awscliv2.zip already exists. Skipping download."
else
    echo "awscliv2.zip not found. Downloading..."
fi
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
# Clean up the downloaded files
rm -rf /tmp/awscliv2.zip /tmp/aws
echo "AWS CLI v2 installed successfully"
# Add AWS CLI to PATH
export PATH=$PATH:/usr/local/bin/aws
# Ensure the AWS CLI is executable by the openvscode-server user
chmod +x /usr/local/bin/aws

# Create a user-specific operations script
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