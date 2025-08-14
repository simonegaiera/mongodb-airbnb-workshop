import csv
import json
import sys
import re
from collections import OrderedDict

def get_user_id_from_email(email):
    """Convert email to sanitized user ID"""
    email_prefix = email.strip().split('@')[0]
    return re.sub(r'[^a-zA-Z0-9]', '-', email_prefix).lower()

def parse_csv(filename):
    """Parse CSV file and return users with both name and email"""
    users = OrderedDict()
    with open(filename, mode='r') as csvfile:
        reader = csv.DictReader(csvfile, skipinitialspace=True)
        for row in reader:
            user_id = get_user_id_from_email(row['email'])
            users[user_id] = {
                'name': f"{row['name'].strip()} {row['surname'].strip()}",
                'email': row['email'].strip()
            }
    return users

def add_additional_users(users, count):
    """Add additional numbered users (user1, user2, etc.)"""
    for i in range(1, count + 1):
        user_id = f"user{i}"
        users[user_id] = {
            'name': f"User {i}",
            'email': None
        }
    return users

def get_all_users(filename, additional_count=0):
    """Get all users (from CSV + additional) in unified format"""
    users = parse_csv(filename)
    users = add_additional_users(users, additional_count)
    return users

def get_user_ids(filename, additional_count=0):
    """Get just the user IDs (for Terraform compatibility)"""
    users = get_all_users(filename, additional_count)
    return list(users.keys())

def get_user_emails(filename, additional_count=0):
    """Get user ID to email mapping (for Terraform compatibility)"""
    users = get_all_users(filename, additional_count)
    # Return format expected by Terraform external data source
    return {user_id: user_data['email'] for user_id, user_data in users.items()}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 parse_users.py <csv_file> [output_format] [additional_count]", file=sys.stderr)
        sys.exit(1)
    
    filename = sys.argv[1]
    output_format = sys.argv[2] if len(sys.argv) > 2 else 'email'
    additional_count = int(sys.argv[3]) if len(sys.argv) > 3 else 0
    
    if output_format == 'email':
        # For Terraform external data source - returns {user_id: email}
        result = get_user_emails(filename, additional_count)
    elif output_format == 'ids':
        # Returns list of user IDs
        result = get_user_ids(filename, additional_count)
    else:
        # Full user data - returns {user_id: {name, email}}
        result = get_all_users(filename, additional_count)
    
    print(json.dumps(result))
