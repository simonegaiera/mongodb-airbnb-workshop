#!/bin/bash

# Exit immediately if any command fails
set -e
set -o pipefail

# Function to handle errors
handle_error() {
    local exit_code=$1
    local line_number=$2
    local command="$3"
    echo_with_timestamp "ERROR: Command '$command' failed with exit code $exit_code at line $line_number"
    echo_with_timestamp "FATAL: Setup lab exercises script failed"
    exit $exit_code
}

# Set error trap
trap 'handle_error $? $LINENO "$BASH_COMMAND"' ERR

# Function to echo with timestamp for long operations
echo_with_timestamp() {
    local message="$1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $message"
}

setup_lab_exercises() {
    echo_with_timestamp "Setting up lab exercises..."
    
    # Read the enhanced scenario configuration
    if [ -f "/home/workspace/scenario-config/enhanced-scenario-config.json" ]; then
        SCENARIO_CONFIG=$(cat /home/workspace/scenario-config/enhanced-scenario-config.json)
        
        # Extract the files needed for unlisted exercises
        FILES_NEEDED=$(echo "$SCENARIO_CONFIG" | jq -r '.needed_answer_files.summary.files_needed_for_unlisted_exercises[]? // empty')
        
        if [ -z "$FILES_NEEDED" ]; then
            echo_with_timestamp "No answer files need to be copied"
            return 0
        fi
        
        echo_with_timestamp "Found files that need to be copied from answers to lab folder"
        
        # Define source and destination directories
        SOURCE_DIR="$REPO_PATH/utils/answers"
        DEST_DIR="$REPO_PATH/server/src/lab"
        
        # Check if source directory exists
        if [ ! -d "$SOURCE_DIR" ]; then
            echo_with_timestamp "FATAL: Source directory $SOURCE_DIR does not exist"
            exit 1
        fi
        
        # Check if destination directory exists, create if needed
        if [ ! -d "$DEST_DIR" ]; then
            echo_with_timestamp "Creating destination directory $DEST_DIR"
            mkdir -p "$DEST_DIR"
        fi
        
        # Copy each needed file
        echo "$FILES_NEEDED" | while IFS= read -r filename; do
            if [ -n "$filename" ]; then
                source_file="$SOURCE_DIR/$filename"
                dest_file="$DEST_DIR/$filename"
                
                if [ -f "$source_file" ]; then
                    echo_with_timestamp "Copying $filename from answers to lab folder"
                    if ! cp "$source_file" "$dest_file"; then
                        echo_with_timestamp "FATAL: Failed to copy $filename"
                        exit 1
                    fi
                    echo_with_timestamp "Successfully copied $filename"
                else
                    echo_with_timestamp "FATAL: Required source file $source_file does not exist"
                    exit 1
                fi
            fi
        done
        
        echo_with_timestamp "Lab exercises setup completed"
    else
        echo_with_timestamp "FATAL: Enhanced scenario config file not found, cannot setup lab exercises"
        exit 1
    fi
}

# Export the function so it can be called from other scripts
export -f setup_lab_exercises
