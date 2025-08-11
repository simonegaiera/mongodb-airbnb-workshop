#!/bin/bash

# MongoDB Results Processor - Run Script
# This script loads environment variables and runs the Java application

set -e

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Error: .env file not found. Please copy .env.template to .env and configure it."
    exit 1
fi

# Load environment variables from .env file
set -a
source .env
set +a

# Ensure logs directory exists
mkdir -p logs

echo "Starting MongoDB Results Processor..."
echo "Database: airbnb_arena"
echo "Environment: $ENVIRONMENT"
echo "Log Level: $LOG_LEVEL"
echo ""

# Run the application with Maven
mvn exec:java -Dexec.mainClass="com.mongodb.workshop.ResultsProcessor" -q

echo ""
echo "Application completed."
