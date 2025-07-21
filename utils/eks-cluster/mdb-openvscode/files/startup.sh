#!/bin/bash

# Function to echo with timestamp for long operations
echo_with_timestamp() {
    local message="$1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $message"
}

echo_with_timestamp "Updating system packages"
apt-get update > /dev/null && \
apt-get install -y apt-utils > /dev/null && \
apt-get install -y git curl less vim net-tools lsof jq unzip software-properties-common > /dev/null && \
apt-get install -y postgresql-client > /dev/null && \
apt-get clean && rm -rf /var/lib/apt/lists/*

# Install General Tools
echo_with_timestamp "Installing Python 3.12"
apt-get update > /dev/null && \
add-apt-repository ppa:deadsnakes/ppa -y > /dev/null && \
apt-get update > /dev/null && \
apt-get install -y python3.12-full > /dev/null && \
python3.12 -m ensurepip --upgrade && \
update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.12 1 && \
apt-get clean && rm -rf /var/lib/apt/lists/*
python3 -m pip install --upgrade pip

echo_with_timestamp "Installing Node.js 20"
apt-get update > /dev/null && \
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
apt-get install -y nodejs > /dev/null && \
npm install -g npm@latest && \
npm install -g mongodb-mcp-server && \
apt-get clean && rm -rf /var/lib/apt/lists/*

# Install OpenJDK 21
echo_with_timestamp "Installing OpenJDK 21"
apt-get update > /dev/null && \
apt-get install -y openjdk-21-jdk maven > /dev/null && \
apt-get clean && rm -rf /var/lib/apt/lists/*

# Install uv
echo_with_timestamp "Installing uv"
curl -LsSf https://astral.sh/uv/install.sh | sh
sudo -u openvscode-server bash -c 'curl -LsSf https://astral.sh/uv/install.sh | sh'
sudo -u openvscode-server bash -c 'cd /home/openvscode-server && export PATH="$HOME/.local/bin:$PATH" && uv venv'
sudo -u openvscode-server bash -c 'export PATH="$HOME/.local/bin:$PATH" && uv pip install postgres-mcp'

# Set JAVA_HOME environment variable
echo_with_timestamp "Setting JAVA_HOME environment variable"
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
echo 'export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64' >> /etc/environment
echo 'export PATH=$PATH:$JAVA_HOME/bin' >> /etc/environment

# Download and install AWS CLI v2
echo_with_timestamp "Downloading and installing AWS CLI v2"
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
echo_with_timestamp "AWS CLI v2 installed successfully"
# Add AWS CLI to PATH
export PATH=$PATH:/usr/local/bin/aws
# Ensure the AWS CLI is executable by the openvscode-server user
chmod +x /usr/local/bin/aws

# Create a user-specific operations script
echo_with_timestamp "Changing npm directory ownership"
chown -R openvscode-server:openvscode-server /home/workspace/.npm

echo_with_timestamp "Checking if directory /home/workspace/mongodb-airbnb-workshop is empty"
# Check if directory is empty and change ownership if it is
if [ -z "$(ls -A /home/workspace/mongodb-airbnb-workshop)" ]; then
    echo_with_timestamp "Directory is empty. Changing ownership."
    chown -R openvscode-server:openvscode-server /home/workspace/mongodb-airbnb-workshop
else
    echo_with_timestamp "Directory is not empty. Ownership not changed."
fi

echo_with_timestamp "Executing user-specific operations script"
# Execute the user-specific operations script as the desired user
sudo -u openvscode-server bash /tmp/user_operations.sh

echo_with_timestamp "Script executed successfully"
