#!/usr/bin/env python3
"""
MongoDB Scenario Configuration Script
Handles only MongoDB operations for storing scenario configuration.
"""

import json
import os
import sys
import yaml
import re
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from kubernetes import client, config
from kubernetes.client.rest import ApiException

def read_config_from_configmap():
    """Read scenario configuration from the mounted ConfigMap or local file."""
    try:
        # Try different config paths for flexibility (container vs local testing)
        config_paths = [
            "/etc/scenario-config/scenario-config.json",  # Container path
            "./test-scenario-config.json",                # Local test file
            os.getenv("SCENARIO_CONFIG_PATH", ""),        # Environment variable override
        ]
        
        config_path = None
        for path in config_paths:
            if path and os.path.exists(path):
                config_path = path
                break
        
        if not config_path:
            print(f"Error: Configuration file not found. Tried paths: {config_paths}")
            return None
            
        with open(config_path, 'r') as f:
            config = json.load(f)
            print(f"Successfully loaded configuration from {config_path}")
            return config
    except Exception as e:
        print(f"Error reading configuration: {e}")
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

def filter_navigation_based_on_sections(nav_content, config):
    """Filter navigation based on sections configuration from scenario config."""
    try:
        sections_config = config.get('instructions', {}).get('sections', [])
        
        # If no sections specified, keep everything
        if not sections_config:
            print("No sections filtering - keeping all navigation items")
            return nav_content
        
        print(f"Filtering navigation based on {len(sections_config)} sections")
        
        # Create a lookup for sections to keep
        sections_to_keep = {}
        for section in sections_config:
            title = section.get('title')
            content = section.get('content', [])
            sections_to_keep[title] = content
        
        # Filter the docs navigation
        if nav_content and 'docs' in nav_content:
            filtered_docs = []
            
            for section in nav_content['docs']:
                section_title = section.get('title')
                
                if section_title in sections_to_keep:
                    content_filter = sections_to_keep[section_title]
                    
                    # If content is empty or not specified, keep entire section
                    if not content_filter:
                        filtered_docs.append(section)
                        print(f"Keeping entire section: {section_title}")
                    else:
                        # Filter children based on content URLs
                        filtered_section = {
                            'title': section_title,
                            'children': []
                        }
                        
                        if 'children' in section:
                            for child in section['children']:
                                child_url = child.get('url', '')
                                
                                # Keep if URL matches or if it's a hint for a matching URL
                                should_keep = False
                                for content_url in content_filter:
                                    if child_url == content_url:
                                        should_keep = True
                                        break
                                    # Check if this is a hint for the content URL
                                    if child_url == content_url + 'hint/':
                                        should_keep = True
                                        break
                                
                                # Also keep the main section URL (e.g., /crud/ for CRUD Operations)
                                if not should_keep:
                                    # Extract section URL pattern from any content URL
                                    if content_filter:
                                        # Get the base section URL from the first content URL
                                        first_content_url = content_filter[0]
                                        section_base_url = first_content_url.split('/')[1]  # e.g., 'crud' from '/crud/2/'
                                        section_url = f'/{section_base_url}/'  # e.g., '/crud/'
                                        
                                        if child_url == section_url:
                                            should_keep = True
                                
                                if should_keep:
                                    filtered_section['children'].append(child)
                                    print(f"Keeping: {child.get('title')} ({child_url})")
                        
                        if filtered_section['children']:
                            filtered_docs.append(filtered_section)
                            print(f"Keeping filtered section: {section_title}")
                else:
                    print(f"Removing section: {section_title}")
            
            nav_content['docs'] = filtered_docs
            print("Navigation filtering completed")
        
        return nav_content
        
    except Exception as e:
        print(f"Error filtering navigation: {e}")
        return nav_content

def extract_exercises_from_navigation(nav_content):
    """Extract exercise identifiers from navigation content."""
    exercises = set()
    
    if not nav_content or 'docs' not in nav_content:
        return exercises
    
    # Navigate through the structure to find exercises
    for section in nav_content.get('docs', []):
        if 'children' in section:
            for child in section['children']:
                url = child.get('url', '')
                # Extract exercise patterns from URLs
                # Examples: /crud/1/, /pipeline/1/, /search/2/, /vector-search/1/
                match = re.search(r'/([^/]+)/(\d+)/', url)
                if match:
                    category = match.group(1)
                    number = match.group(2)
                    # Convert URL pattern to file pattern
                    if category == 'pipeline':
                        exercises.add(f'pipeline-{number}')
                    elif category == 'vector-search':
                        exercises.add(f'vector-search-{number}')
                    else:
                        exercises.add(f'{category}-{number}')
    
    return exercises

def get_available_answer_files():
    """Get list of available answer files."""
    answer_files = set()
    
    # Try different answer folder paths for flexibility
    answer_paths = [
        "/workspace/utils/answers",  # Container path
        "../../../../utils/answers",  # Local relative path
        os.getenv("ANSWERS_PATH", ""),  # Environment variable override
    ]
    
    answers_dir = None
    for path in answer_paths:
        if path and os.path.exists(path):
            answers_dir = path
            break
    
    if answers_dir and os.path.exists(answers_dir):
        for file in os.listdir(answers_dir):
            if file.endswith('.lab.js'):
                # Remove .lab.js extension to get base name
                base_name = file.replace('.lab.js', '')
                answer_files.add(base_name)
        print(f"Found {len(answer_files)} answer files in {answers_dir}")
    else:
        print(f"Answer directory not found. Tried paths: {[p for p in answer_paths if p]}")
    
    return answer_files

def get_available_lab_files():
    """Get list of available lab files."""
    lab_files = set()
    
    # Try different lab folder paths for flexibility
    lab_paths = [
        "/workspace/server/src/lab",  # Container path
        "../../../../server/src/lab",  # Local relative path
        os.getenv("LAB_PATH", ""),  # Environment variable override
    ]
    
    lab_dir = None
    for path in lab_paths:
        if path and os.path.exists(path):
            lab_dir = path
            break
    
    if lab_dir and os.path.exists(lab_dir):
        for file in os.listdir(lab_dir):
            if file.endswith('.lab.js'):
                # Remove .lab.js extension to get base name
                base_name = file.replace('.lab.js', '')
                lab_files.add(base_name)
        print(f"Found {len(lab_files)} lab files in {lab_dir}")
    else:
        print(f"Lab directory not found. Tried paths: {[p for p in lab_paths if p]}")
    
    return lab_files

def identify_needed_answer_files(nav_content):
    """Identify which answer files are needed based on navigation content."""
    try:
        # Get exercises listed in navigation
        listed_exercises = extract_exercises_from_navigation(nav_content)
        print(f"Found {len(listed_exercises)} exercises listed in navigation")
        
        # Get available files
        available_answers = get_available_answer_files()
        available_labs = get_available_lab_files()
        
        # Find answer files needed (those NOT in navigation but have answer files)
        needed_answers = available_answers - listed_exercises
        
        # Create analysis result
        analysis = {
            "listed_exercises": sorted(list(listed_exercises)),
            "available_answer_files": sorted(list(available_answers)),
            "available_lab_files": sorted(list(available_labs)),
            "needed_answer_files": sorted(list(needed_answers)),
            "not_needed_answer_files": sorted(list(available_answers & listed_exercises))
        }
        
        summary = {
            "total_exercises_listed": len(listed_exercises),
            "total_answer_files_available": len(available_answers),
            "total_answer_files_needed": len(needed_answers),
            "files_needed_for_unlisted_exercises": [f"{answer}.lab.js" for answer in sorted(needed_answers)]
        }
        
        print(f"Analysis complete: {len(needed_answers)} answer files needed for unlisted exercises")
        
        return {
            "analysis": analysis,
            "summary": summary
        }
        
    except Exception as e:
        print(f"Error identifying needed answer files: {e}")
        return {
            "analysis": {},
            "summary": {},
            "error": str(e)
        }

def get_navigation_from_config(config):
    """Extract navigation file path from scenario config and read it."""
    try:
        # Check if config has instructions with base navigation file
        instructions = config.get('instructions', {})
        base_navigation = instructions.get('base')
        
        if base_navigation:
            # Try different navigation file paths for flexibility
            navigation_paths = [
                f"/workspace/docs/_data/{base_navigation}",  # Container path
                f"../../../../docs/_data/{base_navigation}",  # Local relative path
                os.getenv("NAVIGATION_BASE_PATH", "") + f"/{base_navigation}" if os.getenv("NAVIGATION_BASE_PATH") else "",
            ]
            
            print(f"Found base navigation file in config: {base_navigation}")
            
            navigation_path = None
            for path in navigation_paths:
                if path and os.path.exists(path):
                    navigation_path = path
                    break
            
            if not navigation_path:
                print(f"Navigation file not found. Tried paths: {[p for p in navigation_paths if p]}")
                return None
                
            print(f"Using navigation file at: {navigation_path}")
            nav_content = read_navigation_file(navigation_path)
            
            # Apply section filtering if navigation content was loaded
            if nav_content:
                nav_content = filter_navigation_based_on_sections(nav_content, config)
            
            return nav_content
        else:
            print("No base navigation file specified in config")
            return None
            
    except Exception as e:
        print(f"Error extracting navigation from config: {e}")
        return None

def create_enhanced_configmap(enhanced_config):
    """Create or update the enhanced ConfigMap with the processed configuration."""
    try:
        print("Creating/updating enhanced ConfigMap...")
        
        # Load the in-cluster Kubernetes configuration
        config.load_incluster_config()
        v1 = client.CoreV1Api()
        
        # Get namespace from environment (default to 'default')
        namespace = os.getenv('KUBERNETES_NAMESPACE', 'default')
        configmap_name = "scenario-definition-enhanced-config"
        
        # Create the ConfigMap object
        configmap = client.V1ConfigMap(
            metadata=client.V1ObjectMeta(
                name=configmap_name,
                namespace=namespace,
                labels={
                    "app": "scenario-definition",
                    "type": "enhanced-config"
                }
            ),
            data={
                "enhanced-scenario-config.json": json.dumps(enhanced_config, indent=2)
            }
        )
        
        try:
            # Try to update existing ConfigMap first
            v1.patch_namespaced_config_map(
                name=configmap_name,
                namespace=namespace,
                body=configmap
            )
            print(f"Successfully updated enhanced ConfigMap '{configmap_name}' in namespace '{namespace}'")
            
        except ApiException as e:
            if e.status == 404:
                # ConfigMap doesn't exist, create it
                v1.create_namespaced_config_map(
                    namespace=namespace,
                    body=configmap
                )
                print(f"Successfully created enhanced ConfigMap '{configmap_name}' in namespace '{namespace}'")
            else:
                print(f"Error updating ConfigMap: {e}")
                return False
        
        return True
        
    except Exception as e:
        print(f"Error creating/updating enhanced ConfigMap: {e}")
        print("Note: This might be expected if running outside of a Kubernetes cluster")
        return False

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
        from datetime import datetime, timezone
        config['created_at'] = datetime.now(timezone.utc).isoformat()
        
        # Remove sensitive fields before storing
        if 'atlas_user_password' in config:
            config.pop('atlas_user_password')
            print("Removed atlas_user_password field for security")
        
        # Add navigation content if available
        if navigation_content:
            config['navigation'] = navigation_content
            print("Navigation content added to configuration")
            
            # Identify needed answer files based on navigation
            answer_files_analysis = identify_needed_answer_files(navigation_content)
            config['needed_answer_files'] = answer_files_analysis
            print("Added needed answer files analysis to configuration")
        
        # Insert or update the configuration
        filter_query = {}
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
    
    # Create enhanced configuration with all processed data
    enhanced_config = config.copy()
    if navigation_content:
        enhanced_config['navigation'] = navigation_content
        # Identify needed answer files based on navigation
        answer_files_analysis = identify_needed_answer_files(navigation_content)
        enhanced_config['needed_answer_files'] = answer_files_analysis
    
    # Add processing timestamp
    from datetime import datetime, timezone
    enhanced_config['processed_at'] = datetime.now(timezone.utc).isoformat()
    
    # Store configuration and navigation in MongoDB
    success = store_config_in_mongodb(enhanced_config, navigation_content)
    if not success:
        print("Failed to store configuration in MongoDB, exiting...")
        sys.exit(1)
    
    # Create/update the enhanced ConfigMap with processed configuration
    configmap_success = create_enhanced_configmap(enhanced_config)
    if configmap_success:
        print("Enhanced ConfigMap created/updated successfully!")
    else:
        print("Warning: Could not create/update enhanced ConfigMap (might be running outside Kubernetes)")
    
    if navigation_content:
        print("Successfully stored scenario configuration with navigation data in MongoDB and ConfigMap!")
    else:
        print("Successfully stored scenario configuration in MongoDB and ConfigMap (no navigation data found)!")

if __name__ == "__main__":
    main()
