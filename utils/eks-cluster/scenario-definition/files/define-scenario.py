#!/usr/bin/env python3
"""
MongoDB Scenario Configuration Script
Handles only MongoDB operations for storing scenario configuration.
"""

import json
import os
import sys
import yaml
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

def read_config_from_configmap():
    """Read scenario configuration from the mounted ConfigMap."""
    try:
        config_path = "/etc/scenario-config/scenario-config.json"
        if not os.path.exists(config_path):
            print(f"Error: Configuration file not found at {config_path}")
            return None
            
        with open(config_path, 'r') as f:
            config = json.load(f)
            print(f"Successfully loaded configuration from ConfigMap")
            return config
    except Exception as e:
        print(f"Error reading configuration from ConfigMap: {e}")
        return None

def read_navigation_file(navigation_path):
    """Read navigation file content and convert YAML to JSON-compatible format."""
    try:
        if not os.path.exists(navigation_path):
            print(f"Warning: Navigation file not found at {navigation_path}")
            return None
            
        with open(navigation_path, 'r') as f:
            navigation_content = yaml.safe_load(f)
            print(f"Successfully loaded navigation file from {navigation_path}")
            
            # Convert to JSON-compatible format and validate structure
            if navigation_content:
                print(f"Navigation content structure: {list(navigation_content.keys()) if isinstance(navigation_content, dict) else 'Not a dictionary'}")
                
            return navigation_content
    except Exception as e:
        print(f"Error reading navigation file: {e}")
        return None

def get_navigation_from_config(config):
    """Extract navigation file path from scenario config and read it."""
    try:
        # Check if config has instructions with base navigation file
        instructions = config.get('instructions', {})
        base_navigation = instructions.get('base')
        
        if base_navigation:
            # Construct the full path to the navigation file
            # Assuming the navigation files are in the docs/_data directory
            navigation_path = f"/workspace/docs/_data/{base_navigation}"
            print(f"Found base navigation file in config: {base_navigation}")
            print(f"Looking for navigation file at: {navigation_path}")
            
            return read_navigation_file(navigation_path)
        else:
            print("No base navigation file specified in config")
            return None
            
    except Exception as e:
        print(f"Error extracting navigation from config: {e}")
        return None

def store_config_in_mongodb(config, navigation_content=None):
    """Store the scenario configuration in MongoDB."""
    try:
        # Get MongoDB connection details from environment variables
        mongodb_uri = os.getenv('MONGODB_URI')
        db_name = os.getenv('DB_NAME', 'airbnb_arena')
        collection_name = os.getenv('COLLECTION_NAME', 'scenario_config')
        
        if not mongodb_uri:
            print("Error: MONGODB_URI environment variable not set")
            return False
            
        print(f"Connecting to MongoDB...")
        print(f"Database: {db_name}")
        print(f"Collection: {collection_name}")
        
        # Connect to MongoDB
        client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=10000)
        
        # Test the connection
        client.admin.command('ping')
        print("Successfully connected to MongoDB")
        
        # Get database and collection
        db = client[db_name]
        collection = db[collection_name]
        
        # Add a timestamp and navigation content to the config
        from datetime import datetime
        config['created_at'] = datetime.utcnow().isoformat()
        config['source'] = 'scenario-definition-init-container'
        
        # Add navigation content if available
        if navigation_content:
            config['navigation'] = navigation_content
            print("Navigation content added to configuration")
        
        # Insert or update the configuration
        # Use upsert to replace existing config with same aws_route53_record_name
        filter_query = {'aws_route53_record_name': config.get('aws_route53_record_name')}
        result = collection.replace_one(filter_query, config, upsert=True)
        
        if result.upserted_id:
            print(f"Configuration inserted with ID: {result.upserted_id}")
        elif result.modified_count > 0:
            print(f"Configuration updated (modified {result.modified_count} document)")
        else:
            print("Configuration already exists and is identical")
            
        client.close()
        return True
        
    except ConnectionFailure as e:
        print(f"MongoDB connection failed: {e}")
        return False
    except ServerSelectionTimeoutError as e:
        print(f"MongoDB server selection timeout: {e}")
        return False
    except Exception as e:
        print(f"Error storing configuration in MongoDB: {e}")
        return False

def main():
    """Main function to handle MongoDB operations."""
    print("Starting MongoDB scenario configuration storage...")
    
    # Read configuration from ConfigMap
    config = read_config_from_configmap()
    if not config:
        print("Failed to read configuration, exiting...")
        sys.exit(1)
    
    # Try to get navigation content from the scenario config first
    navigation_content = get_navigation_from_config(config)
    
    # If no navigation found in config, check if navigation file path is provided as argument
    if not navigation_content and len(sys.argv) > 1:
        navigation_path = sys.argv[1]
        print(f"Navigation file path provided as argument: {navigation_path}")
        navigation_content = read_navigation_file(navigation_path)
    
    # Store configuration and navigation in MongoDB
    success = store_config_in_mongodb(config, navigation_content)
    if not success:
        print("Failed to store configuration in MongoDB, exiting...")
        sys.exit(1)
    
    if navigation_content:
        print("Successfully stored scenario configuration with navigation data in MongoDB!")
    else:
        print("Successfully stored scenario configuration in MongoDB (no navigation data found)!")

if __name__ == "__main__":
    main()
