#!/bin/bash

# Exit on any error
set -e

#########################################
# Read Configuration from ConfigMap
#########################################
echo "Reading scenario configuration..."
if [ ! -f "/etc/scenario-config/scenario-config.json" ]; then
    echo "ERROR: scenario-config.json not found in ConfigMap mount"
    exit 1
fi

# Parse JSON configuration using jq (install if not available)
# Install required packages for Alpine Linux
echo "Installing required packages..."
if command -v apk >/dev/null 2>&1; then
    apk update
    apk add jq git
elif command -v apt-get >/dev/null 2>&1; then
    apt-get update
    apt-get install -y jq git
else
    echo "ERROR: No supported package manager found (apk or apt-get)"
    exit 1
fi

# Extract configuration values
SCENARIO=$(jq -r '.scenario // "guided"' /etc/scenario-config/scenario-config.json)
AWS_ROUTE53_RECORD_NAME=$(jq -r '.aws_route53_record_name // "localhost"' /etc/scenario-config/scenario-config.json)
REPOSITORY=$(jq -r '.repository // "https://github.com/simonegaiera/mongodb-airbnb-workshop.git"' /etc/scenario-config/scenario-config.json)
BRANCH=$(jq -r '.branch // "main"' /etc/scenario-config/scenario-config.json)
NAVIGATION_BASE=$(jq -r '.instructions.base // "navigation.yml"' /etc/scenario-config/scenario-config.json)

echo "Scenario: $SCENARIO"
echo "Route53 Record Name: $AWS_ROUTE53_RECORD_NAME"
echo "Repository: $REPOSITORY"
echo "Branch: $BRANCH"
echo "Navigation Base: $NAVIGATION_BASE"

#########################################
# Clone and Prepare Repository
#########################################
echo "Cloning repository..."
cd /tmp
git clone -b $BRANCH $REPOSITORY

# Extract repository name from URL (removes .git suffix if present)
REPO_NAME=$(basename "$REPOSITORY" .git)
echo "Repository name: $REPO_NAME"

# Install Python requirements
echo "Installing Python requirements..."
pip install --no-cache-dir -r /tmp/$REPO_NAME/utils/eks-cluster/mongodb-arena-portal/server/requirements.txt

# Set working directory to the Flask app location
cd /tmp/$REPO_NAME/utils/eks-cluster/mongodb-arena-portal/server

# Run Flask app directly with Python
echo "Starting Flask application..."
python app.py
