#!/usr/bin/env python3
"""
Validate config.yaml structure and required fields before Terragrunt deployment.
This ensures the configuration file is properly formatted and contains all required settings.
"""

import sys
import yaml
from pathlib import Path

# ANSI color codes for terminal output
RED = '\033[0;31m'
GREEN = '\033[0;32m'
YELLOW = '\033[1;33m'
NC = '\033[0m'  # No Color

def print_error(message):
    print(f"{RED}❌ ERROR: {message}{NC}")

def print_warning(message):
    print(f"{YELLOW}⚠️  WARNING: {message}{NC}")

def print_success(message):
    print(f"{GREEN}✅ {message}{NC}")

def validate_config(config_path):
    """Validate the config.yaml file structure and required fields."""
    
    errors = []
    warnings = []
    
    # Check if file exists
    if not config_path.exists():
        print_error(f"Config file not found: {config_path}")
        return False
    
    # Try to parse YAML
    try:
        with open(config_path, 'r') as f:
            config = yaml.safe_load(f)
    except yaml.YAMLError as e:
        print_error(f"Invalid YAML syntax in {config_path}")
        print(f"  {e}")
        return False
    
    if not isinstance(config, dict):
        print_error("Config file must contain a YAML dictionary")
        return False
    
    # Define required structure
    required_fields = {
        'customer': {
            'required': ['name'],
            'defaults': {}
        },
        'mongodb': {
            'required': ['public_key', 'private_key', 'project_name', 'cluster_name', 'cluster_region'],
            'defaults': {
                'public_key': ['PUBLIC_KEY', 'public_key'],
                'private_key': ['PRIVATE_KEY', 'private_key'],
                'project_name': ['PROJECT_NAME', 'arena-customer'],
                'cluster_name': ['arena-cluster'],
                'database_admin_password': ['MongoArenaAdminDummy', 'Mongo123/Admin'],
                'customer_user_password': ['MongoArenaDummy', 'Mongo123']
            }
        },
        'aws': {
            'required': ['region', 'profile'],
            'defaults': {}
        },
        'domain': {
            'required': ['email'],
            'defaults': {
                'email': ['youremail@mongodb.com']
            }
        },
        'scenario': {
            'required': ['repository', 'branch', 'leaderboard', 'instructions'],
            'defaults': {}
        }
    }
    
    # Check top-level sections
    for section, rules in required_fields.items():
        if section not in config:
            errors.append(f"Missing required section: '{section}'")
            continue
        
        if not isinstance(config[section], dict):
            errors.append(f"Section '{section}' must be a dictionary")
            continue
        
        # Check required fields in section
        for field in rules['required']:
            if field not in config[section]:
                errors.append(f"Missing required field: '{section}.{field}'")
            elif config[section][field] is None or config[section][field] == '':
                errors.append(f"Field '{section}.{field}' cannot be empty")
        
        # Check for default/placeholder values
        for field, default_values in rules['defaults'].items():
            if field in config[section]:
                value = config[section][field]
                if value in default_values:
                    errors.append(f"Field '{section}.{field}' still has placeholder value: '{value}'. Please update with actual value.")
    
    # Additional MongoDB-specific validations
    if 'mongodb' in config:
        mongodb = config['mongodb']

        # Check instance size is valid
        if 'instance_size' in mongodb:
            valid_sizes = ['M10', 'M20', 'M30', 'M40', 'M50', 'M60', 'M80', 'M140', 'M200', 'M300',
                          'R40', 'R50', 'R60', 'R80', 'R200', 'R400', 'R700']
            if mongodb['instance_size'] not in valid_sizes:
                warnings.append(f"mongodb.instance_size '{mongodb['instance_size']}' may not be valid. Valid sizes: {', '.join(valid_sizes)}")

        # Check region format
        if 'cluster_region' in mongodb:
            region = mongodb['cluster_region']
            if not region.isupper() or '_' not in region:
                warnings.append(f"mongodb.cluster_region '{region}' should be in format like 'US_EAST_2'")

    # Validate scenario.instructions structure
    if 'scenario' in config and 'instructions' in config['scenario']:
        instructions = config['scenario']['instructions']

        if not isinstance(instructions, dict):
            errors.append("scenario.instructions must be a dictionary")
        else:
            # Check for required fields in instructions
            if 'base' not in instructions:
                errors.append("Missing required field: 'scenario.instructions.base'")
            elif not instructions['base']:
                errors.append("Field 'scenario.instructions.base' cannot be empty")

            if 'sections' not in instructions:
                errors.append("Missing required field: 'scenario.instructions.sections'")
            elif not isinstance(instructions['sections'], list):
                errors.append("Field 'scenario.instructions.sections' must be a list")
            elif len(instructions['sections']) == 0:
                warnings.append("scenario.instructions.sections is empty - no workshop sections defined")

    # Validate scenario.leaderboard structure
    if 'scenario' in config and 'leaderboard' in config['scenario']:
        leaderboard = config['scenario']['leaderboard']

        if not isinstance(leaderboard, dict):
            errors.append("scenario.leaderboard must be a dictionary")
        else:
            # Check for required fields in leaderboard
            if 'type' not in leaderboard:
                errors.append("Missing required field: 'scenario.leaderboard.type'")
            elif leaderboard['type'] not in ['timed', 'untimed']:
                warnings.append(f"scenario.leaderboard.type '{leaderboard['type']}' should be 'timed' or 'untimed'")
    
    # Print results
    print("\n" + "="*60)
    print("CONFIG VALIDATION RESULTS")
    print("="*60 + "\n")
    
    if errors:
        print_error(f"Found {len(errors)} error(s):\n")
        for i, error in enumerate(errors, 1):
            print(f"  {i}. {error}")
        print()
    
    if warnings:
        print_warning(f"Found {len(warnings)} warning(s):\n")
        for i, warning in enumerate(warnings, 1):
            print(f"  {i}. {warning}")
        print()
    
    if not errors and not warnings:
        print_success("Configuration file is valid!")
        print()
        return True
    elif not errors:
        print_success("Configuration file is valid (with warnings)")
        print()
        return True
    else:
        print_error("Configuration validation failed. Please fix the errors above.")
        print()
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 validate_config.py <path_to_config.yaml>")
        sys.exit(1)
    
    config_path = Path(sys.argv[1])
    success = validate_config(config_path)
    sys.exit(0 if success else 1)

