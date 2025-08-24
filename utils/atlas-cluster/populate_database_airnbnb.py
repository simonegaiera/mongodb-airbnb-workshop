import sys
import time
import requests
from requests.auth import HTTPDigestAuth
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from pymongo.operations import SearchIndexModel
import certifi
from parse_users import get_all_users
from datetime import datetime, timezone
import json
import os

def get_params():
    if len(sys.argv) != 11:
        print("Usage: python3 populate_database_airnbnb.py MONGO_CONNECTION_STRING MONGO_DATABASE_NAME PUBLIC_KEY PRIVATE_KEY PROJECT_ID CLUSTER_NAME CSV_FILE COMMON_DATABASE ADDITIONAL_USERS_COUNT CREATE_INDEXES", file=sys.stderr)
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
        'ADDITIONAL_USERS_COUNT': int(sys.argv[9]),
        'CREATE_INDEXES': sys.argv[10].lower() == 'true'
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
                    '$ifNull': [
                        {
                            '$arrayElemAt': [
                                '$participants_info.name', 0
                            ]
                        },
                        '$_id'
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
    """Ensure compound indexes exist on results collection."""
    # Existing compound index
    index_spec_1 = [("timestamp", 1), ("section", 1), ("name", 1)]
    indexes = db["results"].index_information()
    
    # Check for existing timestamp, section, name index
    index_1_exists = False
    for idx in indexes.values():
        if idx.get("key") == index_spec_1:
            index_1_exists = True
            break
    
    if not index_1_exists:
        db["results"].create_index(index_spec_1)
        print("Created compound index on results: timestamp, section, name.", flush=True)
    else:
        print("Compound index on results (timestamp, section, name) already exists.", flush=True)
    
    # New compound index for name and username
    index_spec_2 = [("name", 1), ("username", 1)]
    
    # Refresh indexes information after potential creation of first index
    indexes = db["results"].index_information()
    
    # Check for existing name, username index
    index_2_exists = False
    for idx in indexes.values():
        if idx.get("key") == index_spec_2:
            index_2_exists = True
            break
    
    if not index_2_exists:
        db["results"].create_index(index_spec_2)
        print("Created compound index on results: name, username.", flush=True)
    else:
        print("Compound index on results (name, username) already exists.", flush=True)

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

def create_results_health_collection(db):
    """Create results_health collection with TTL index."""
    collection_name = "results_health"
    
    # Check if collection already exists
    existing_collections = db.list_collection_names()
    if collection_name not in existing_collections:
        # Explicitly create the collection
        db.create_collection(collection_name)
        print(f"Created collection '{collection_name}'.", flush=True)
    else:
        print(f"Collection '{collection_name}' already exists.", flush=True)
    
    collection = db[collection_name]
    
    # Create TTL index on timestamp field (2 days = 172800 seconds)
    ttl_seconds = 2 * 24 * 60 * 60  # 2 days in seconds
    
    # Check if TTL index already exists
    indexes = collection.index_information()
    ttl_index_exists = False
    for idx_name, idx_info in indexes.items():
        if idx_info.get("key") == [("timestamp", 1)] and "expireAfterSeconds" in idx_info:
            ttl_index_exists = True
            print(f"TTL index on timestamp already exists.", flush=True)
            break
    
    if not ttl_index_exists:
        collection.create_index("timestamp", expireAfterSeconds=ttl_seconds)
        print(f"Created TTL index on timestamp field with 2 days expiration for results_health collection.", flush=True)

def load_index_definitions():
    """Load index definitions from JSON files in the indexes folder."""
    indexes_dir = os.path.join(os.path.dirname(__file__), 'indexes')
    index_definitions = {}
    
    # Map folder names to index types
    folder_type_mapping = {
        'crud': 'crud',
        'search': 'search', 
        'vector-search': 'vectorSearch'
    }
    
    try:
        # Scan each folder in the indexes directory
        for folder_name in os.listdir(indexes_dir):
            folder_path = os.path.join(indexes_dir, folder_name)
            
            # Skip if not a directory
            if not os.path.isdir(folder_path):
                continue
                
            # Determine index type based on folder name
            index_type = folder_type_mapping.get(folder_name)
            if not index_type:
                print(f"Warning: Unknown index folder type '{folder_name}', skipping...", flush=True)
                continue
            
            # Load all JSON files in this folder
            for file_name in os.listdir(folder_path):
                if file_name.endswith('.json'):
                    file_path = os.path.join(folder_path, file_name)
                    # Use filename without extension as index name
                    index_name = os.path.splitext(file_name)[0]
                    
                    try:
                        with open(file_path, 'r') as f:
                            definition = json.load(f)
                            index_definitions[index_name] = {
                                'definition': definition,
                                'type': index_type
                            }
                        print(f"Loaded index '{index_name}' (type: {index_type}) from {folder_name}/{file_name}", flush=True)
                    except json.JSONDecodeError as e:
                        print(f"Error parsing JSON in {file_path}: {e}", flush=True)
                    except Exception as e:
                        print(f"Error loading {file_path}: {e}", flush=True)
                        
    except FileNotFoundError:
        print(f"Warning: Indexes directory not found: {indexes_dir}", flush=True)
    except Exception as e:
        print(f"Error scanning indexes directory: {e}", flush=True)
    
    return index_definitions

def create_user_indexes(client, db_name, index_definitions):
    """Create indexes for a user database."""
    if not index_definitions:
        return
    
    db = client[db_name]
    collection = db['listingsAndReviews']
    
    # Iterate through all loaded index definitions
    for index_name, index_info in index_definitions.items():
        index_type = index_info['type']
        index_definition = index_info['definition']
        
        if index_type == 'crud':
            create_regular_index(collection, index_name, index_definition)
        elif index_type == 'search':
            create_search_index(collection, index_name, index_definition)
        elif index_type == 'vectorSearch':
            create_vector_search_index(collection, index_name, index_definition)
        else:
            print(f"Warning: Unknown index type '{index_type}' for index '{index_name}', skipping...", flush=True)

def create_regular_index(collection, index_name, index_definition):
    """Create a regular MongoDB index."""
    try:
        # Check if index already exists
        existing_indexes = collection.index_information()
        if index_name in existing_indexes:
            print(f"Regular index '{index_name}' already exists in {collection.database.name}.{collection.name}", flush=True)
            return
        
        # Create the index
        collection.create_index(list(index_definition.items()), name=index_name)
        print(f"Created regular index '{index_name}' in {collection.database.name}.{collection.name}", flush=True)
        
    except Exception as e:
        print(f"Error creating regular index '{index_name}' in {collection.database.name}.{collection.name}: {e}", flush=True)

def create_search_index(collection, index_name, index_definition):
    """Create a search index using PyMongo's create_search_index method."""
    try:
        # Check if search index already exists
        try:
            existing_indexes = list(collection.list_search_indexes())
            for idx in existing_indexes:
                if idx.get('name') == index_name:
                    print(f"Search index '{index_name}' already exists in {collection.database.name}.{collection.name}", flush=True)
                    return
        except Exception:
            # If list_search_indexes fails, continue to create the index
            pass
        
        # Create the search index using the correct PyMongo syntax
        index = {
            "definition": index_definition,
            "name": index_name,
        }
        collection.create_search_index(index)
        print(f"Created search index '{index_name}' in {collection.database.name}.{collection.name}", flush=True)
        
    except Exception as e:
        print(f"Error creating search index '{index_name}' in {collection.database.name}.{collection.name}: {e}", flush=True)

def create_vector_search_index(collection, index_name, index_definition):
    """Create a vector search index using PyMongo's SearchIndexModel."""
    try:
        # Check if vector search index already exists
        try:
            existing_indexes = list(collection.list_search_indexes())
            for idx in existing_indexes:
                if idx.get('name') == index_name and idx.get('type') == 'vectorSearch':
                    print(f"Vector search index '{index_name}' already exists in {collection.database.name}.{collection.name}", flush=True)
                    return
        except Exception:
            # If list_search_indexes fails, continue to create the index
            pass
        
        # Create the vector search index using SearchIndexModel
        search_index_model = SearchIndexModel(
            definition=index_definition,
            name=index_name,
            type="vectorSearch",
        )
        collection.create_search_index(model=search_index_model)
        print(f"Created vector search index '{index_name}' in {collection.database.name}.{collection.name}", flush=True)
        
    except Exception as e:
        print(f"Error creating vector search index '{index_name}' in {collection.database.name}.{collection.name}: {e}", flush=True)

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
    
    # Create results_health collection with TTL
    create_results_health_collection(client[params['COMMON_DATABASE']])
    
    # Create views
    create_views(client, params['COMMON_DATABASE'])
    
    # Load index definitions if CREATE_INDEXES is True
    index_definitions = {}
    if params['CREATE_INDEXES']:
        print("CREATE_INDEXES is True, loading index definitions...", flush=True)
        index_definitions = load_index_definitions()
    else:
        print("create_indexes is False, skipping index creation.", flush=True)
    
    for database in users:
        if database in databases:
            print(f"Database '{database}' exists.", flush=True)
        else:
            print(f"Database '{database}' does not exist. Creating.", flush=True)
            create_user_collection(database, client, common_database, collections_list)
        
        # Create indexes for this user database if CREATE_INDEXES is True
        if params['CREATE_INDEXES'] and index_definitions:
            print(f"Creating indexes for user database '{database}'...", flush=True)
            create_user_indexes(client, database, index_definitions)

if __name__ == "__main__":
    main()
