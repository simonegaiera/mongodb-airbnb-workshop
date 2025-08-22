import sys
import time
import requests
from requests.auth import HTTPDigestAuth
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import certifi
from parse_users import get_all_users
from datetime import datetime, timezone

def get_params():
    if len(sys.argv) != 10:
        print("Usage: python3 populate_database_airnbnb.py MONGO_CONNECTION_STRING MONGO_DATABASE_NAME PUBLIC_KEY PRIVATE_KEY PROJECT_ID CLUSTER_NAME CSV_FILE COMMON_DATABASE ADDITIONAL_USERS_COUNT", file=sys.stderr)
        sys.exit(1)
    return {
        'MONGO_CONNECTION_STRING': sys.argv[1],
        'MONGO_DATABASE_NAME': sys.argv[2],
        'PUBLIC_KEY': sys.argv[3],
        'PRIVATE_KEY': sys.argv[4],
        'PROJECT_ID': sys.argv[5],
        'CLUSTER_NAME': sys.argv[6],
        'CSV_FILE': sys.argv[7],
        'COMMON_DATABASE': sys.argv[8],
        'ADDITIONAL_USERS_COUNT': int(sys.argv[9])
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
        # Prepare the document data
        document_data = {}
        if user_data.get('name'):
            document_data['name'] = user_data['name']
        if user_data.get('email'):
            document_data['email'] = user_data['email']
        
        if user_data.get('email') is None:
            # For generated users (no email), only set data on insert and include 'taken' field
            document_data['taken'] = False
            collection.update_one(
                {'_id': user_id},
                {'$setOnInsert': document_data},
                upsert=True
            )
        else:
            # For CSV users, set name/email and add timestamp on insert
            collection.update_one(
                {'_id': user_id},
                {
                    '$set': document_data,
                    '$setOnInsert': {'insert_timestamp': datetime.now(timezone.utc)}
                },
                upsert=True
            )
        print(f"Upserted user with _id: {user_id}", flush=True)

def create_views(client, common_database):
    """Create the required views in the common database"""
    db = client[common_database]
    
    # Pipeline for score_leaderboard view
    score_leaderboard_pipeline = [
        {
            '$sort': { 'timestamp': 1 }
        },
        {
            '$group': {
                '_id': {
                    'section': '$section',
                    'name': '$name'
                },
                'users': {
                    '$push': {
                        'username': '$username',
                        'timestamp': '$timestamp'
                    }
                }
            }
        },
        {
            '$addFields': {
                'users': {
                    '$map': {
                        'input': { '$range': [0, { '$size': '$users' }] },
                        'as': 'index',
                        'in': {
                            'username': { '$arrayElemAt': [ '$users.username', '$$index' ] },
                            'points': {
                                '$subtract': [
                                    100,
                                    {
                                        '$cond': {
                                            'if': { '$lte': ['$$index', 10] },
                                            'then': { '$multiply': ['$$index', 5] },
                                            'else': 50
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        },
        # Unwind the users array to perform lookup for each user separately
        {
            '$unwind': '$users'
        },
        # Lookup participant info using the username field inside users
        {
            '$lookup': {
                'from': 'participants',
                'localField': 'users.username',
                'foreignField': '_id',
                'as': 'participants_info'
            }
        },
        # Add the participant name as the field "user" on the users object
        {
            '$addFields': {
                'users.user': { '$arrayElemAt': [ '$participants_info.name', 0 ] }
            }
        },
        # Remove participants_info and regroup the users back into an array
        {
            '$project': { 'participants_info': 0 }
        },
        {
            '$group': {
                '_id': '$_id',
                'users': { '$push': '$users' }
            }
        },
        {
            '$sort': { '_id.section': 1, '_id.name': 1 }
        }
    ]
    
    # Pipeline for timed_leaderboard view
    timed_leaderboard_pipeline = [
        {
            '$group': {
                '_id': '$username', 
                'firstTimestamp': {
                    '$first': '$timestamp'
                }, 
                'lastTimestamp': {
                    '$last': '$timestamp'
                }, 
                'count': {
                    '$count': {}
                }
            }
        }, {
            '$lookup': {
                'from': 'participants', 
                'localField': '_id', 
                'foreignField': '_id', 
                'as': 'participants_info'
            }
        }, {
            '$addFields': {
                'delta': {
                    '$subtract': [
                        {
                            '$toLong': '$lastTimestamp'
                        }, {
                            '$toLong': '$firstTimestamp'
                        }
                    ]
                }, 
                'name': {
                    '$arrayElemAt': [
                        '$participants_info.name', 0
                    ]
                }
            }
        }, {
            '$sort': {
                'count': -1, 
                'delta': 1
            }
        }
    ]
    
    try:
        # Create the score_leaderboard view
        db.create_collection('score_leaderboard', viewOn='results', pipeline=score_leaderboard_pipeline)
        print("Created score_leaderboard view successfully!", flush=True)
    except Exception as e:
        if "already exists" in str(e):
            print("score_leaderboard view already exists, skipping creation.", flush=True)
        else:
            print(f"Error creating score_leaderboard view: {e}", flush=True)

    try:
        # Create the timed_leaderboard view
        db.create_collection('timed_leaderboard', viewOn='results', pipeline=timed_leaderboard_pipeline)
        print("Created timed_leaderboard view successfully!", flush=True)
    except Exception as e:
        if "already exists" in str(e):
            print("timed_leaderboard view already exists, skipping creation.", flush=True)
        else:
            print(f"Error creating timed_leaderboard view: {e}", flush=True)

def ensure_results_index(db):
    """Ensure compound index exists on results collection."""
    index_spec = [("timestamp", 1), ("section", 1), ("name", 1)]
    indexes = db["results"].index_information()
    for idx in indexes.values():
        if idx.get("key") == index_spec:
            print("Compound index on results already exists.", flush=True)
            return
    db["results"].create_index(index_spec)
    print("Created compound index on results: section, name, timestamp.", flush=True)

def ensure_participants_indexes(db):
    """Ensure indexes exist on participants collection for taken and name."""
    participants = db["participants"]
    # Compound index for taken and name
    index_spec = [("taken", 1), ("taken_timestamp", 1), ("name", 1)]
    indexes = participants.index_information()
    for idx in indexes.values():
        if idx.get("key") == index_spec:
            print("Compound index on participants (taken, name) already exists.", flush=True)
            return
    participants.create_index(index_spec)
    print("Created compound index on participants: taken, name.", flush=True)

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

    csv_file = params['CSV_FILE']

    users_map = get_all_users(csv_file, params['ADDITIONAL_USERS_COUNT'], params['CLUSTER_NAME'])
    upsert_users(users_map, client, params['COMMON_DATABASE'])
    users = list(users_map.keys())
    collections_list = client[common_database].list_collection_names()
    print(f"Existing collections in '{common_database}': {collections_list}", flush=True)
    
    # Ensure index exists before creating views
    ensure_results_index(client[params['COMMON_DATABASE']])
    ensure_participants_indexes(client[params['COMMON_DATABASE']])
    
    # Create views
    create_views(client, params['COMMON_DATABASE'])
    
    for database in users:
        if database in databases:
            print(f"Database '{database}' exists.", flush=True)
        else:
            print(f"Database '{database}' does not exist. Creating.", flush=True)
            create_user_collection(database, client, common_database, collections_list)

if __name__ == "__main__":
    main()
