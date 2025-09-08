#!/bin/bash

# MongoDB Results Processor - Run Script
# This script loads environment variables, builds the project, and copies the package

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
echo "Database: arena_shared"
echo "Environment: $ENVIRONMENT"
echo "Log Level: $LOG_LEVEL"
echo ""

# Run the application with Maven
mvn exec:java -Dexec.mainClass="com.mongodb.workshop.ResultsProcessor" -q

echo ""
echo "Application completed."

# echo "Compiling and packaging the application..."
# mvn clean package -q

# JAR_FILE=$(ls target/*.jar | head -n 1)

# if [ -z "$JAR_FILE" ]; then
#     echo "Error: No JAR file found in target directory."
#     exit 2
# fi

# DEST_DIR="../../../server"
# mkdir -p "$DEST_DIR"
# cp "$JAR_FILE" "$DEST_DIR"

# echo "JAR package copied to $DEST_DIR"