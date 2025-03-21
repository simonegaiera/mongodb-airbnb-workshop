import csv
import json
import sys
import re
from collections import OrderedDict

filename = sys.argv[1]
option = sys.argv[2] if len(sys.argv) > 2 else 'email'

def parse_csv(filename, option):
    users_map = OrderedDict()
    with open(filename, mode='r') as csvfile:
        reader = csv.DictReader(csvfile, skipinitialspace=True)
        for row in reader:
            email_prefix = row['email'].strip().split('@')[0]
            sanitized_email_prefix = re.sub(r'[^a-zA-Z0-9]', '-', email_prefix)
            if option == 'name':
                users_map[sanitized_email_prefix] = row['name'].strip() + ' ' + row['surname'].strip()
            else:
                users_map[sanitized_email_prefix] = row['email'].strip()

    return users_map

if __name__ == "__main__":
    users_map = parse_csv(filename, option)
    print(json.dumps(users_map))
