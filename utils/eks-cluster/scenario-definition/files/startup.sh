#!/bin/sh
set -e

echo "Starting scenario definition setup..."

#########################################
# Install Dependencies
#########################################
echo "Installing dependencies..."
apk add --no-cache git build-base python3 python3-dev py3-pip jq

# Install Python dependencies
echo "Installing Python packages..."
pip3 install --no-cache-dir -r /scripts/requirements.txt

#########################################
# Read Configuration from Scenario Config JSON
#########################################
echo "Reading configuration from scenario config JSON..."

# Verify scenario config file exists
if [ ! -f "/etc/scenario-config/scenario-config.json" ]; then
    echo "ERROR: scenario-config.json not found in ConfigMap mount at /etc/scenario-config/"
    exit 1
fi
echo "Scenario config file found at /etc/scenario-config/scenario-config.json"

# Extract values from scenario config JSON
REPOSITORY=$(jq -r '.repository // "https://github.com/simonegaiera/mongodb-airbnb-workshop.git"' /etc/scenario-config/scenario-config.json)
BRANCH=$(jq -r '.branch // "main"' /etc/scenario-config/scenario-config.json)
NAVIGATION_BASE=$(jq -r '.instructions.base // "navigation.yml"' /etc/scenario-config/scenario-config.json)

echo "Repository (from config): $REPOSITORY"
echo "Branch (from config): $BRANCH"
echo "Navigation Base (from config): $NAVIGATION_BASE"

# Validate extracted values
if [ "$REPOSITORY" = "null" ] || [ -z "$REPOSITORY" ]; then
    echo "WARNING: Repository not found in config, using default"
    REPOSITORY="https://github.com/simonegaiera/mongodb-airbnb-workshop.git"
fi

if [ "$BRANCH" = "null" ] || [ -z "$BRANCH" ]; then
    echo "WARNING: Branch not found in config, using default"
    BRANCH="main"
fi

if [ "$NAVIGATION_BASE" = "null" ] || [ -z "$NAVIGATION_BASE" ]; then
    echo "WARNING: Navigation base not found in config, using default"
    NAVIGATION_BASE="navigation.yml"
fi

#########################################
# Clone and Prepare Repository
#########################################
echo "Cloning repository..."
cd /tmp
git clone -b $BRANCH $REPOSITORY

# Extract repository name from URL (removes .git suffix if present)
REPO_NAME=$(basename "$REPOSITORY" .git)
echo "Repository name: $REPO_NAME"

# Export REPO_NAME for use by Python script
export REPO_NAME

# Set answers path for Python script
export ANSWERS_PATH="/tmp/$REPO_NAME/utils/answers"
echo "Answers path set to: $ANSWERS_PATH"

# Set scenario config path for Python script
export SCENARIO_CONFIG_PATH="/etc/scenario-config/scenario-config.json"
echo "Scenario config path set to: $SCENARIO_CONFIG_PATH"

# Set lab path for Python script
export LAB_PATH="/tmp/$REPO_NAME/server/src/lab"
echo "Lab path set to: $LAB_PATH"

# Navigate to docs directory
DOCS_PATH="/tmp/$REPO_NAME/docs"
if [ ! -d "$DOCS_PATH" ]; then
    echo "ERROR: docs directory not found at $DOCS_PATH"
    exit 1
fi

echo "Found docs directory: $DOCS_PATH"

# Check for navigation file and copy if exists
NAVIGATION_SOURCE="$DOCS_PATH/_data/$NAVIGATION_BASE"
NAVIGATION_TARGET="/shared/navigation.yml"

if [ -f "$NAVIGATION_SOURCE" ]; then
    echo "Copying $NAVIGATION_BASE to /shared/navigation.yml"
    mkdir -p /shared
    cp "$NAVIGATION_SOURCE" "$NAVIGATION_TARGET"
    echo "Navigation file copied successfully!"
else
    echo "WARNING: $NAVIGATION_BASE not found in _data/, using default navigation.yml"
    # Copy default navigation.yml if it exists
    DEFAULT_NAV="$DOCS_PATH/_data/navigation.yml"
    if [ -f "$DEFAULT_NAV" ]; then
        mkdir -p /shared
        cp "$DEFAULT_NAV" "$NAVIGATION_TARGET"
        echo "Default navigation.yml copied"
    else
        echo "ERROR: No navigation file found"
        exit 1
    fi
fi

#########################################
# Run MongoDB Operations
#########################################
echo "Running MongoDB operations..."
python3 /scripts/define-scenario.py "$NAVIGATION_TARGET"

# Clean up repository after Python script completes
rm -rf "/tmp/$REPO_NAME"
echo "Repository cleanup completed"

echo "Scenario definition setup completed successfully!"
