import os  
import sys  
import csv  
import time  
import requests  
from requests.auth import HTTPDigestAuth  
from pymongo.mongo_client import MongoClient  
from pymongo.server_api import ServerApi  
from dotenv import load_dotenv  
import certifi  
from parse_users import parse_csv

def load_env_variables():  
    """Load environment variables from .env file."""  
    dotenv_path = '.env'  
    if not os.path.exists(dotenv_path):  
        print(f"Error: .env file not found at path {dotenv_path}", file=sys.stderr)
        sys.exit(1)  
  
    load_dotenv(dotenv_path)  
  
    required_variables = [  
        'MONGO_CONNECTION_STRING',  
        'MONGO_DATABASE_NAME',
        'PUBLIC_KEY',
        'PRIVATE_KEY',
        'PROJECT_ID',
        'CLUSTER_NAME'
    ]  
  
    missing_variables = [var for var in required_variables if os.getenv(var) is None]  
    if missing_variables:  
        print(f"Error: Missing required environment variables: {', '.join(missing_variables)}", file=sys.stderr)  
        sys.exit(1)  
  
def get_client():  
    """Create and return a MongoDB client."""  
    client = MongoClient(os.getenv('MONGO_CONNECTION_STRING'), server_api=ServerApi('1'), tlsCAFile=certifi.where())
    try:  
        client.admin.command('ping')  
        print("Pinged your deployment. You successfully connected to MongoDB!", flush=True)
        return client  
    except Exception as e:  
        print(f"Error connecting to MongoDB: {e}", file=sys.stderr)
        sys.exit(1)  
  
def load_sample_dataset():  
    """Load a sample dataset into MongoDB Atlas."""  
    atlas_auth = HTTPDigestAuth(os.getenv('PUBLIC_KEY'), os.getenv('PRIVATE_KEY'))  
    atlas_v2_headers = {  
        "Accept": "application/vnd.atlas.2023-02-01+json",  
        "Content-Type": "application/json"
    }  
  
    load_url = f'https://cloud.mongodb.com/api/atlas/v2/groups/{os.getenv("PROJECT_ID")}/sampleDatasetLoad/{os.getenv("CLUSTER_NAME")}'  
    response = requests.post(load_url, headers=atlas_v2_headers, auth=atlas_auth)  
  
    if response.status_code == 201:  
        print('Sample data loading initiated...', flush=True)
        dataset_id = response.json().get('_id')  
        wait_for_loading(atlas_auth, atlas_v2_headers, dataset_id)  
    else:  
        handle_error(response)  
  
def wait_for_loading(auth, headers, dataset_id):  
    """Poll the loading status of the sample dataset."""  
    loading = True  
    while loading:  
        status_url = f'https://cloud.mongodb.com/api/atlas/v2/groups/{os.getenv("PROJECT_ID")}/sampleDatasetLoad/{dataset_id}'  
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
    """Handle errors from API responses."""  
    print(f'ERROR {response.status_code}! {response.json()}', file=sys.stderr)
    sys.exit(1)  
  
def create_user_collection(db_name, client, common_database, collections_list):  
    """Create user collections in the specified database."""  
    for collection in collections_list:  
        client[common_database][collection].aggregate([{'$out': {'db': db_name, 'coll': collection}}])  
  
def main():  
    load_env_variables()  
    common_database = os.getenv('MONGO_DATABASE_NAME')  
  
    client = get_client()  
    databases = client.list_database_names()  
  
    if common_database in databases:  
        print(f"Database '{common_database}' exists.", flush=True)  
    else:  
        print(f"Database '{common_database}' does not exist. Creating.", flush=True)  
        load_sample_dataset()  
  
    # Use parse_csv to get the user identifiers
    filename = sys.argv[1]
    users_map = parse_csv(filename)

    # Since parse_csv returns a dictionary, get the keys to form a list of users
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
