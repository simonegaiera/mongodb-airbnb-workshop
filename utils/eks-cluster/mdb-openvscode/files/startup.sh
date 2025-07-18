#!/bin/bash

echo "Updating system packages"
apt-get update && \
apt-get install -y git curl nginx less vim net-tools lsof jq unzip postgresql-client software-properties-common && \
apt-get clean && rm -rf /var/lib/apt/lists/*

# Install General Tools
echo "Installing Python 3.13"
apt-get update && \
add-apt-repository ppa:deadsnakes/ppa -y && \
apt-get update && \
apt-get install -y python3.13-full && \
python3.13 -m ensurepip --upgrade && \
update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.13 1 && \
apt-get clean && rm -rf /var/lib/apt/lists/*

echo "Installing Node.js 20"
apt-get update && \
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
apt-get install -y nodejs && \
npm install -g npm@latest && \
npm install -g mongodb-mcp-server && \
apt-get clean && rm -rf /var/lib/apt/lists/*

# Install OpenJDK 21
echo "Installing OpenJDK 21"
apt-get update && \
apt-get install -y openjdk-21-jdk && \
apt-get clean && rm -rf /var/lib/apt/lists/*

# Install uv
echo "Installing uv"
curl -LsSf https://astral.sh/uv/install.sh | sh
sudo -u openvscode-server bash -c 'export PATH="$HOME/.local/bin:$PATH"'
sudo -u openvscode-server bash -c 'uv venv'
sudo -u openvscode-server bash -c 'uv pip install postgres-mcp'

# Set JAVA_HOME environment variable
echo "Setting JAVA_HOME environment variable"
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
echo 'export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64' >> /etc/environment
echo 'export PATH=$PATH:$JAVA_HOME/bin' >> /etc/environment

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
