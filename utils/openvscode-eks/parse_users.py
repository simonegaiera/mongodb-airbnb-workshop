import csv
import json
import sys
import re  # Import the regex module

filename = sys.argv[1]

def parse_csv(filename):
    users_map = {}
    with open(filename, mode='r') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            email_prefix = row['email'].split('@')[0]
            # Remove non-alphanumeric characters
            sanitized_email_prefix = re.sub(r'[^a-zA-Z0-9]', '-', email_prefix)
            users_map[sanitized_email_prefix] = "user"

    return users_map

if __name__ == "__main__":
    users_map = parse_csv(filename)
    print(json.dumps(users_map))