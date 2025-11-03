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

# Global verbose flag - read from environment variable
VERBOSE = os.environ.get('VERBOSE', 'false').lower() == 'true'

def get_params():
    if len(sys.argv) != 12:
        print("Usage: python3 populate_database_airnbnb.py MONGO_CONNECTION_STRING MONGO_DATABASE_NAME PUBLIC_KEY PRIVATE_KEY PROJECT_ID CLUSTER_NAME CSV_FILE COMMON_DATABASE ADDITIONAL_USERS_COUNT CREATE_INDEXES USER_START_INDEX", file=sys.stderr)
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
        'CREATE_INDEXES': sys.argv[10].lower() == 'true',
        'USER_START_INDEX': int(sys.argv[11])
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

def delete_user_databases(user_ids, client):
    """Delete databases for decommissioned users."""
    deleted_databases = []
    errors = []
    
    for user_id in user_ids:
        try:
            # Check if database exists
            databases = client.list_database_names()
            if user_id in databases:
                # Delete the database
                client.drop_database(user_id)
                deleted_databases.append(user_id)
                print(f"Successfully deleted database for user: {user_id}", flush=True)
            else:
                if VERBOSE:
                    print(f"Database for user {user_id} does not exist, skipping deletion.", flush=True)
        except Exception as e:
            error_msg = f"Error deleting database for user {user_id}: {e}"
            errors.append(error_msg)
            print(error_msg, flush=True)
    
    if deleted_databases:
        print(f"Successfully deleted {len(deleted_databases)} user databases: {sorted(deleted_databases)}", flush=True)
    
    if errors:
        print(f"Encountered {len(errors)} errors during database deletion.", flush=True)
        for error in errors:
            print(f"  - {error}", flush=True)
    
    return deleted_databases, errors

def decommission_unwanted_users(users_map, client, common_database):
    """Decommission any existing participants that are not in the current wanted list."""
    participants_collection = client[common_database]['participants']
    
    # Get all existing participant IDs
    existing_participants = list(participants_collection.find({}, {'_id': 1}))
    existing_ids = {doc['_id'] for doc in existing_participants}
    
    # Get current wanted user IDs
    wanted_ids = set(users_map.keys())
    
    # Find participants that exist but are not wanted anymore
    to_decommission = existing_ids - wanted_ids
    
    if to_decommission:
        # Mark unwanted users as decommissioned
        result = participants_collection.update_many(
            {'_id': {'$in': list(to_decommission)}},
            {
                '$set': {
                    'decommissioned': True,
                    'decommissioned_timestamp': datetime.now(timezone.utc)
                }
            }
        )
        print(f"Decommissioned {result.modified_count} users that are no longer in the wanted list: {sorted(to_decommission)}", flush=True)
        
        # Delete the databases for decommissioned users
        if result.modified_count > 0:
            print("Proceeding to delete databases for decommissioned users...", flush=True)
            deleted_databases, deletion_errors = delete_user_databases(list(to_decommission), client)
            
            if deletion_errors:
                print("WARNING: Some user databases could not be deleted. Check the errors above.", flush=True)
            
        return result.modified_count
    else:
        print("No users need to be decommissioned.", flush=True)
        return 0

def upsert_users(users_map, client, common_database):
    participants_collection = client[common_database]['participants']
    # Create a new collection for user details including email (not accessible to users)
    user_details_collection = client[common_database]['user_details']
    
    # First, decommission any unwanted users
    decommission_unwanted_users(users_map, client, common_database)
    
    for user_id, user_data in users_map.items():
        # Prepare the document data for participants collection (no email)
        participants_document = {}
        if user_data.get('name'):
            participants_document['name'] = user_data['name']
        
        # Prepare the document data for user_details collection (name, email, timestamp)
        user_details_document = {}
        if user_data.get('name'):
            user_details_document['name'] = user_data['name']
        if user_data.get('email'):
            user_details_document['email'] = user_data['email']
        user_details_document['timestamp'] = datetime.now(timezone.utc)
        
        if user_data.get('email') is None:
            # For generated users (no email), only set data on insert and include 'taken' field
            participants_document['taken'] = False
            
            # Check if user already exists
            existing_user = participants_collection.find_one({'_id': user_id})
            if existing_user:
                # User exists - remove decommissioned flags if present
                participants_collection.update_one(
                    {'_id': user_id},
                    {'$unset': {'decommissioned': "", 'decommissioned_timestamp': ""}}
                )
            else:
                # New user - insert with decommissioned: false
                participants_document['decommissioned'] = False
                participants_collection.update_one(
                    {'_id': user_id},
                    {'$setOnInsert': participants_document},
                    upsert=True
                )
            # For generated users, still add to user_details collection but without email
            user_details_collection.update_one(
                {'_id': user_id},
                {'$setOnInsert': user_details_document},
                upsert=True
            )
        else:
            # For CSV users, set name in participants collection
            # Check if user already exists
            existing_user = participants_collection.find_one({'_id': user_id})
            if existing_user:
                # User exists - update name and remove decommissioned flags if present
                participants_collection.update_one(
                    {'_id': user_id},
                    {
                        '$set': {'name': user_data['name']},
                        '$unset': {'decommissioned': "", 'decommissioned_timestamp': ""}
                    }
                )
            else:
                # New user - insert with name and timestamp
                participants_collection.update_one(
                    {'_id': user_id},
                    {
                        '$setOnInsert': {
                            'name': user_data['name'],
                            'insert_timestamp': datetime.now(timezone.utc)
                        }
                    },
                    upsert=True
                )
            # For CSV users, set name, email, and timestamp in user_details collection
            user_details_collection.update_one(
                {'_id': user_id},
                {'$set': user_details_document},
                upsert=True
            )
        print(f"Upserted user with _id: {user_id}", flush=True)

def create_views(client, common_database):
    """Create the required views in the common database"""
    db = client[common_database]
    
    # Pipeline for score_leaderboard view
    score_leaderboard_pipeline = [
        # Lookup scenario_config to get close_on date
        {
            '$lookup': {
                'from': 'scenario_config',
                'pipeline': [],
                'as': 'scenario_config'
            }
        },
        # Add scenario_config fields to each result document
        {
            '$addFields': {
                'close_on': {
                    '$arrayElemAt': ['$scenario_config.leaderboard.close_on', 0]
                }
            }
        },
        # Filter out results after close_on date (if close_on exists)
        {
            '$match': {
                '$or': [
                    # Include if close_on doesn't exist (no freeze)
                    { 'close_on': { '$exists': False } },
                    # Include if close_on is null (no freeze)
                    { 'close_on': None },
                    # Include if timestamp is before close_on
                    { '$expr': { '$lte': ['$timestamp', '$close_on'] } }
                ]
            }
        },
        # Remove the temporary close_on and scenario_config fields
        {
            '$unset': ['close_on', 'scenario_config']
        },
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
        # Filter out participants with leaderboard: false
        {
            '$match': {
                'participants_info.leaderboard': { '$ne': False }
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
        # Lookup scenario_config to get close_on date
        {
            '$lookup': {
                'from': 'scenario_config',
                'pipeline': [],
                'as': 'scenario_config'
            }
        },
        # Add scenario_config fields to each result document
        {
            '$addFields': {
                'close_on': {
                    '$arrayElemAt': ['$scenario_config.leaderboard.close_on', 0]
                }
            }
        },
        # Filter out results after close_on date (if close_on exists)
        {
            '$match': {
                '$or': [
                    # Include if close_on doesn't exist (no freeze)
                    { 'close_on': { '$exists': False } },
                    # Include if close_on is null (no freeze)
                    { 'close_on': None },
                    # Include if timestamp is before close_on
                    { '$expr': { '$lte': ['$timestamp', '$close_on'] } }
                ]
            }
        },
        # Remove the temporary close_on and scenario_config fields
        {
            '$unset': ['close_on', 'scenario_config']
        },
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
            '$match': {
                'participants_info.leaderboard': { '$ne': False }
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
            '$unset': "participants_info"
        }, {
            '$sort': {
                'count': -1, 
                'delta': 1
            }
        }
    ]
    
    # Drop and recreate score_leaderboard view to ensure it has the latest pipeline
    try:
        if 'score_leaderboard' in db.list_collection_names():
            db.drop_collection('score_leaderboard')
            print("Dropped existing score_leaderboard view.", flush=True)
        db.create_collection('score_leaderboard', viewOn='results', pipeline=score_leaderboard_pipeline)
        print("Created score_leaderboard view successfully!", flush=True)
    except Exception as e:
        print(f"Error creating score_leaderboard view: {e}", flush=True)

    # Drop and recreate timed_leaderboard view to ensure it has the latest pipeline
    try:
        if 'timed_leaderboard' in db.list_collection_names():
            db.drop_collection('timed_leaderboard')
            print("Dropped existing timed_leaderboard view.", flush=True)
        db.create_collection('timed_leaderboard', viewOn='results', pipeline=timed_leaderboard_pipeline)
        print("Created timed_leaderboard view successfully!", flush=True)
    except Exception as e:
        print(f"Error creating timed_leaderboard view: {e}", flush=True)
    
    # Pipeline for user_leaderboard view - combines user_details with exercise counts
    user_leaderboard_pipeline = [
        {
            '$match': {
                'leaderboard': { '$ne': False },
                'email': { '$exists': True }
            }
        },
        {
            '$lookup': {
                'from': 'results',
                'localField': '_id',
                'foreignField': 'username',
                'as': 'results'
            }
        },
        {
            '$addFields': {
                'exercisesSolved': { '$size': '$results' }
            }
        },
        {
            '$project': {
                '_id': 1,
                'name': {
                    '$ifNull': ['$name', '$_id']
                },
                'email': '$email',
                'exercisesSolved': 1
            }
        },
        {
            '$sort': {
                '_id': 1
            }
        }
    ]
    
    # Drop and recreate user_leaderboard view to ensure it has the latest pipeline
    try:
        if 'user_leaderboard' in db.list_collection_names():
            db.drop_collection('user_leaderboard')
            print("Dropped existing user_leaderboard view.", flush=True)
        db.create_collection('user_leaderboard', viewOn='user_details', pipeline=user_leaderboard_pipeline)
        print("Created user_leaderboard view successfully!", flush=True)
    except Exception as e:
        print(f"Error creating user_leaderboard view: {e}", flush=True)

def ensure_results_index(db):
    """Ensure compound indexes exist on results collection."""
    # Compound index for name and username
    index_spec_2 = [("name", 1), ("username", 1)]
    
    # Get indexes information
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
    elif VERBOSE:
        print("Compound index on results (name, username) already exists.", flush=True)

def ensure_participants_indexes(db):
    """Ensure indexes exist on participants collection for taken, decommissioned and name."""
    participants = db["participants"]
    # Compound index for taken, decommissioned and name
    index_spec = [("taken", 1), ("taken_timestamp", 1), ("name", 1)]
    indexes = participants.index_information()
    for idx in indexes.values():
        if idx.get("key") == index_spec:
            if VERBOSE:
                print("Compound index on participants (taken, taken_timestamp, name) already exists.", flush=True)
            return
    participants.create_index(index_spec)
    print("Created compound index on participants: taken, taken_timestamp, name.", flush=True)

def create_results_health_collection(db):
    """Create results_health collection."""
    collection_name = "results_health"
    
    # Check if collection already exists
    existing_collections = db.list_collection_names()
    if collection_name not in existing_collections:
        # Explicitly create the collection
        db.create_collection(collection_name)
        print(f"Created collection '{collection_name}'.", flush=True)
    elif VERBOSE:
        print(f"Collection '{collection_name}' already exists.", flush=True)

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
            if VERBOSE:
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
                    if VERBOSE:
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
                    if VERBOSE:
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
        if VERBOSE:
            print(f"Database '{common_database}' exists.", flush=True)
    else:
        print(f"Database '{common_database}' does not exist. Creating.", flush=True)
        load_sample_dataset(params)

    csv_file = params['CSV_FILE']

    users_map = get_all_users(csv_file, params['ADDITIONAL_USERS_COUNT'], params['CLUSTER_NAME'], params['USER_START_INDEX'])
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
            if VERBOSE:
                print(f"Database '{database}' exists.", flush=True)
        else:
            print(f"Database '{database}' does not exist. Creating.", flush=True)
            create_user_collection(database, client, common_database, collections_list)
        
        # Create indexes for this user database if CREATE_INDEXES is True
        if params['CREATE_INDEXES'] and index_definitions:
            if VERBOSE:
                print(f"Creating indexes for user database '{database}'...", flush=True)
            create_user_indexes(client, database, index_definitions)

if __name__ == "__main__":
    main()
