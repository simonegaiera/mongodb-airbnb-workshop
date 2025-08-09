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
apk add --no-cache jq

# Extract configuration values
SCENARIO=$(jq -r '.scenario // "guided"' /etc/scenario-config/scenario-config.json)
AWS_ROUTE53_RECORD_NAME=$(jq -r '.aws_route53_record_name // "localhost"' /etc/scenario-config/scenario-config.json)
REPOSITORY=$(jq -r '.repository // "https://github.com/simonegaiera/mongodb-airbnb-workshop.git"' /etc/scenario-config/scenario-config.json)
BRANCH=$(jq -r '.branch // "main"' /etc/scenario-config/scenario-config.json)
NAVIGATION_BASE=$(jq -r '.instructions.base // "navigation.yml"' /etc/scenario-config/scenario-config.json)
