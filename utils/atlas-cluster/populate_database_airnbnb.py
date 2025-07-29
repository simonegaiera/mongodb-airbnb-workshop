import os
import sys
import csv
import time
import requests
from requests.auth import HTTPDigestAuth
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import certifi
from parse_users import parse_csv

def get_params():
    if len(sys.argv) != 9:
        print("Usage: python3 populate_database_airnbnb.py MONGO_CONNECTION_STRING MONGO_DATABASE_NAME PUBLIC_KEY PRIVATE_KEY PROJECT_ID CLUSTER_NAME CSV_FILE", file=sys.stderr)
        sys.exit(1)
    return {
        'MONGO_CONNECTION_STRING': sys.argv[1],
        'MONGO_DATABASE_NAME': sys.argv[2],
        'PUBLIC_KEY': sys.argv[3],
        'PRIVATE_KEY': sys.argv[4],
        'PROJECT_ID': sys.argv[5],
        'CLUSTER_NAME': sys.argv[6],
        'CSV_FILE': sys.argv[7],
        'COMMON_DATABASE': sys.argv[8]
    }

def get_client(params):
    client = MongoClient(params['MONGO_CONNECTION_STRING'], server_api=ServerApi('1'), tlsCAFile=certifi.where())
    try:
        client.admin.command('ping')
        print("Pinged your deployment. You successfully connected to MongoDB!", flush=True)
        return client
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}", file=sys.stderr)
        sys.exit(1)

def load_sample_dataset(params):
    atlas_auth = HTTPDigestAuth(params['PUBLIC_KEY'], params['PRIVATE_KEY'])
    atlas_v2_headers = {
        "Accept": "application/vnd.atlas.2023-02-01+json",
        "Content-Type": "application/json"
    }
    load_url = f'https://cloud.mongodb.com/api/atlas/v2/groups/{params["PROJECT_ID"]}/sampleDatasetLoad/{params["CLUSTER_NAME"]}'
    response = requests.post(load_url, headers=atlas_v2_headers, auth=atlas_auth)
    if response.status_code == 201:
        print('Sample data loading initiated...', flush=True)
        dataset_id = response.json().get('_id')
        wait_for_loading(atlas_auth, atlas_v2_headers, dataset_id, params)
    else:
        handle_error(response)

def wait_for_loading(auth, headers, dataset_id, params):
    loading = True
    while loading:
        status_url = f'https://cloud.mongodb.com/api/atlas/v2/groups/{params["PROJECT_ID"]}/sampleDatasetLoad/{dataset_id}'
        loaded_response = requests.get(status_url, headers=headers, auth=auth)
        if loaded_response.status_code != 200:
            handle_error(loaded_response)
        state = loaded_response.json().get('state')
        if state != 'WORKING':
            loading = False
            print('Sample data loaded successfully!', flush=True)
        else:
            print("Loading dataset still running...", flush=True)
            time.sleep(30)

def handle_error(response):
    print(f'ERROR {response.status_code}! {response.json()}', file=sys.stderr)
    sys.exit(1)

def create_user_collection(db_name, client, common_database, collections_list):
    for collection in collections_list:
        client[common_database][collection].aggregate([{'$out': {'db': db_name, 'coll': collection}}])

def upsert_users(users_map, client, common_database):
    collection = client[common_database]['participants']
    for user_id, user_data in users_map.items():
        collection.update_one(
            {'_id': user_id},
            {'$set': {'name': user_data}},
            upsert=True
        )
        print(f"Upserted user with _id: {user_id}", flush=True)

def main():
    params = get_params()
    common_database = params['MONGO_DATABASE_NAME']
    client = get_client(params)
    databases = client.list_database_names()
    if common_database in databases:
        print(f"Database '{common_database}' exists.", flush=True)
    else:
        print(f"Database '{common_database}' does not exist. Creating.", flush=True)
        load_sample_dataset(params)
    # Now, use parse_csv to get the user identifiers from the provided CSV file (first argument after the required 6 parameters is used in our original call)
    # For example, if you want to continue passing the CSV file as a parameter, adjust accordingly.
    # In this example, we assume the CSV file path is provided as an extra parameter:
    csv_file = params['CSV_FILE']

    option = 'name'
    users_map = parse_csv(csv_file, option)
    upsert_users(users_map, client, params['COMMON_DATABASE'])
    users = list(users_map.keys())
    collections_list = client[common_database].list_collection_names()
    print(f"Existing collections in '{common_database}': {collections_list}", flush=True)
    for database in users:
        if database in databases:
            print(f"Database '{database}' exists.", flush=True)
        else:
            print(f"Database '{database}' does not exist. Creating.", flush=True)
            create_user_collection(database, client, common_database, collections_list)

if __name__ == "__main__":
    main()
