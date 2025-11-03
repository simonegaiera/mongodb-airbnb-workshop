from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timezone
import os
from dotenv import load_dotenv
import logging
import csv
from io import StringIO
import math

# Load environment variables
load_dotenv()

# Initialize Flask app (remove static folder configuration)
app = Flask(__name__)

# Configure CORS to allow requests from your React frontend
# Expose Content-Disposition header so frontend can read filenames
CORS(app, origins=['*'], expose_headers=['Content-Disposition'])  # In production, specify your React app's domain

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB configuration
MONGODB_URI = os.getenv('MONGODB_URI')
DB_NAME = os.getenv('DB_NAME')
PARTICIPANTS_COLLECTION = os.getenv('PARTICIPANTS')
USER_DETAILS_COLLECTION = os.getenv('USER_DETAILS', 'user_details')
ARENA_SHARED_DB = os.getenv('ARENA_SHARED_DB', 'arena_shared')
SCENARIO_CONFIG_COLLECTION = os.getenv('SCENARIO_CONFIG_COLLECTION', 'scenario_config')

# MongoDB client
client = MongoClient(MONGODB_URI)
db = client[DB_NAME]
participants_collection = db[PARTICIPANTS_COLLECTION]
user_details_collection = db[USER_DETAILS_COLLECTION]

# Arena shared database for scenario_config
arena_shared_db = client[ARENA_SHARED_DB]
scenario_config_collection = arena_shared_db[SCENARIO_CONFIG_COLLECTION]

# Helper function to format milliseconds to human-readable duration
def format_time(milliseconds):
    """
    Convert milliseconds to hours and minutes format like the frontend.
    Examples: "25m", "1h 30m", "45s"
    """
    if milliseconds == 0:
        return '0m'
    
    seconds = math.floor(milliseconds / 1000)
    hours = math.floor(seconds / 3600)
    minutes = math.floor((seconds % 3600) / 60)
    remaining_seconds = seconds % 60
    
    result = ''
    if hours > 0:
        result += f'{hours}h '
    if minutes > 0:
        result += f'{minutes}m'
    elif hours == 0 and remaining_seconds > 0:
        result += f'{remaining_seconds}s'
    
    return result.strip()

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    try:
        # Test MongoDB connection
        client.admin.command('ping')
        return jsonify({'status': 'healthy', 'database': 'connected'}), 200
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

@app.route('/api/participants', methods=['GET'])
def get_participants():
    """Get participants that are taken or don't have a taken field"""
    try:
        # Retrieve participants that are either taken=true or don't have taken field
        filter_query = {"$or": [{"taken": True}, {"taken": {"$exists": False}}]}
        participants = list(participants_collection.find(
            filter_query, 
            {'_id': 1, 'name': 1, 'taken': 1, 'decommissioned': 1, 'decommissioned_timestamp': 1}
        ).sort([("taken_timestamp", -1), ("name", 1)]))
        
        logger.info(f"Retrieved {len(participants)} participants matching filter")
        return jsonify({
            'success': True,
            'data': participants,
            'count': len(participants)
        }), 200
        
    except Exception as e:
        logger.error(f"Error retrieving participants: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/participants/available', methods=['GET'])
def get_available_participants_count():
    """Get available and active participant counts"""
    try:
        # Available = users with taken: false and not decommissioned
        available_count = participants_collection.count_documents({
            "$and": [
                {"taken": False},
                {"$or": [{"decommissioned": {"$ne": True}}, {"decommissioned": {"$exists": False}}]}
            ]
        })
        
        # Active (non-decommissioned) = all users that are not decommissioned
        active_count = participants_collection.count_documents({
            "$or": [{"decommissioned": {"$ne": True}}, {"decommissioned": {"$exists": False}}]
        })
        
        # Total participants (including decommissioned)
        total_count = participants_collection.count_documents({})
        
        logger.info(f"Available: {available_count}, Active: {active_count}, Total: {total_count}")
        return jsonify({
            'success': True,
            'available_count': available_count,
            'active_count': active_count,
            'total_count': total_count,
            'message': f'{available_count} available, {active_count} active, {total_count} total'
        }), 200
        
    except Exception as e:
        logger.error(f"Error counting participants: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/participants/take', methods=['POST'])
def take_participant():
    """
    Find an available participant and mark as taken
    Expected JSON payload:
    {
        "name": "participant_name", 
        "email": "participant_email"
    }
    """
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No JSON data provided'
            }), 400
            
        # Validate required fields
        required_fields = ['name', 'email']
        missing_fields = [field for field in required_fields if field not in data or not data[field]]
        
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
            
        name = data['name']
        email = data['email']
        
        # Create update document for participants collection (no email)
        participant_update_data = {
            'name': name,
            'taken': True,
            'taken_timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        # Use findOneAndUpdate with atomic operation to prevent race conditions
        updated_participant = participants_collection.find_one_and_update(
            {'taken': False},
            {'$set': participant_update_data},
            return_document=True,
            projection={'_id': 1, 'name': 1, 'taken': 1, 'taken_timestamp': 1}
        )
        
        if not updated_participant:
            return jsonify({
                'success': False,
                'error': 'No available participants found'
            }), 404
        
        # Store email and other details in user_details collection
        participant_id = updated_participant['_id']
        user_details_data = {
            'name': name,
            'email': email,
            'timestamp': datetime.now(timezone.utc)
        }
        
        user_details_collection.update_one(
            {'_id': participant_id},
            {'$set': user_details_data},
            upsert=True
        )
        
        # Return response without email for security
        response_data = {
            '_id': updated_participant['_id'],
            'name': updated_participant['name'],
            'taken': updated_participant['taken'],
            'taken_timestamp': updated_participant['taken_timestamp']
        }
            
        logger.info(f"Successfully assigned participant {participant_id} to {name}")
        return jsonify({
            'success': True,
            'message': f'Participant successfully assigned to {name}',
            'data': response_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error taking participant: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/results', methods=['GET'])
def get_results():
    """
    Return leaderboard results based on LEADERBOARD env variable.
    If LEADERBOARD == 'score', return score_leaderboard view with aggregated points.
    If LEADERBOARD == 'timed', return timed_leaderboard view.
    Supports ?format=csv query parameter to download as CSV.
    """
    try:
        leaderboard = os.getenv('LEADERBOARD', 'timed')
        format_type = request.args.get('format', 'json').strip().lower()
        logger.info(f"[getResults] Request received with format={format_type}, leaderboard={leaderboard}")
        
        # Use different views based on leaderboard type
        view_name = 'score_leaderboard' if leaderboard == 'score' else 'timed_leaderboard'
        leaderboard_collection = db[view_name]
        
        # For timed leaderboard, include _id (it's the username/user_id)
        # For score leaderboard, exclude _id (not needed for aggregation)
        projection = {'_id': 0} if leaderboard == 'score' else {}
        data = list(leaderboard_collection.find({}, projection))
        

        if leaderboard == 'score':
            # Aggregate points by username for score leaderboard
            points_by_username = {}
            for item in data:
                users = item.get('users', [])
                for user in users:
                    display_name = user.get('user') or user.get('username')
                    points = user.get('points', 0)
                    
                    if display_name in points_by_username:
                        points_by_username[display_name] += points
                    else:
                        points_by_username[display_name] = points
            
            # Convert to sorted array (sorted by points descending)
            sorted_points_array = sorted(points_by_username.items(), key=lambda x: x[1], reverse=True)
            
            if format_type == 'csv':
                # Return CSV format
                output = StringIO()
                fieldnames = ['rank', 'name', 'total_points']
                writer = csv.DictWriter(output, fieldnames=fieldnames)
                writer.writeheader()
                
                for rank, (name, points) in enumerate(sorted_points_array, start=1):
                    writer.writerow({
                        'rank': rank,
                        'name': name,
                        'total_points': points
                    })
                
                output.seek(0)
                timestamp = datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')
                filename = f'competition_results_{timestamp}.csv'
                
                logger.info(f"[getResults] SUCCESS: score leaderboard CSV with {len(sorted_points_array)} results")
                
                return Response(
                    output.getvalue(),
                    mimetype='text/csv',
                    headers={'Content-Disposition': f'attachment; filename={filename}'}
                )
            else:
                # Return JSON format
                sorted_points_by_username = dict(sorted_points_array)
                items = {
                    'results': sorted_points_by_username,
                    'data': data,
                    'leaderboardType': 'score'
                }
        else:
            # For timed leaderboard
            if format_type == 'csv':
                # Return CSV format
                output = StringIO()
                fieldnames = ['rank', 'user_id', 'username', 'name', 'exercises_completed', 'duration', 'duration_ms', 'first_timestamp', 'last_timestamp']
                writer = csv.DictWriter(output, fieldnames=fieldnames)
                writer.writeheader()
                
                for rank, item in enumerate(data, start=1):
                    delta_ms = item.get('delta', 0)
                    user_id = item.get('_id', '')
                    writer.writerow({
                        'rank': rank,
                        'user_id': user_id,
                        'username': user_id,  # _id is the username in timed_leaderboard view
                        'name': item.get('name', user_id),
                        'exercises_completed': item.get('count', 0),
                        'duration': format_time(delta_ms),
                        'duration_ms': delta_ms,
                        'first_timestamp': item.get('firstTimestamp', ''),
                        'last_timestamp': item.get('lastTimestamp', '')
                    })
                
                output.seek(0)
                timestamp = datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')
                filename = f'competition_results_{timestamp}.csv'
                
                logger.info(f"[getResults] SUCCESS: timed leaderboard CSV with {len(data)} results")
                
                return Response(
                    output.getvalue(),
                    mimetype='text/csv',
                    headers={'Content-Disposition': f'attachment; filename={filename}'}
                )
            else:
                # Return JSON format
                items = {
                    'results': data,
                    'leaderboardType': 'timed'
                }
        
        # Calculate result count for logging
        result_count = len(items['results']) if isinstance(items['results'], list) else len(items['results'])
        logger.info(f"[getResults] SUCCESS: {items['leaderboardType']} leaderboard response sent with {result_count} results")
        
        return jsonify(items), 200
        
    except Exception as e:
        logger.error(f"[getResults] ERROR: Failed to process {os.getenv('LEADERBOARD', 'timed')} leaderboard request: {str(e)}")
        return jsonify({'message': str(e)}), 500

@app.route('/api/admin/leaderboard/download', methods=['GET'])
def download_user_leaderboard_csv():
    """
    Download user_leaderboard view as CSV.
    Simple export of the user_leaderboard view data.
    """
    try:
        # Get data from user_leaderboard view
        user_leaderboard_collection = db['user_leaderboard']
        user_data = list(user_leaderboard_collection.find({}))
        
        # Create CSV in memory
        output = StringIO()
        
        # Define CSV headers based on user_leaderboard view structure
        fieldnames = ['user_id', 'name', 'email', 'exercises_solved']
        
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        
        # Write user data
        for user in user_data:
            row = {
                'user_id': user.get('_id', ''),
                'name': user.get('name', ''),
                'email': user.get('email', ''),
                'exercises_solved': user.get('exercisesSolved', 0)
            }
            writer.writerow(row)
        
        # Prepare the response
        output.seek(0)
        timestamp = datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')
        filename = f'user_list_{timestamp}.csv'
        
        logger.info(f"Generating user list CSV with {len(user_data)} users")
        
        return Response(
            output.getvalue(),
            mimetype='text/csv',
            headers={'Content-Disposition': f'attachment; filename={filename}'}
        )
        
    except Exception as e:
        logger.error(f"Error generating user_leaderboard CSV: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/admin/leaderboard/exclude', methods=['POST'])
def exclude_from_leaderboard():
    """
    Exclude or include a participant from/to the leaderboard.
    Expected JSON payload:
    {
        "identifier": "user_id or name",
        "exclude": true/false  # true to exclude (leaderboard: false), false to include (remove leaderboard field or set to true)
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No JSON data provided'
            }), 400
        
        identifier = data.get('identifier', '').strip()
        exclude = data.get('exclude', True)
        
        if not identifier:
            return jsonify({
                'success': False,
                'error': 'Identifier (user ID or name) is required'
            }), 400
        
        # Try to find participant by _id first, then by name
        participant = participants_collection.find_one({'_id': identifier})
        
        if not participant:
            # Try to find by name (case-insensitive)
            participant = participants_collection.find_one({'name': {'$regex': f'^{identifier}$', '$options': 'i'}})
        
        if not participant:
            return jsonify({
                'success': False,
                'error': f'No participant found with identifier: {identifier}'
            }), 404
        
        participant_id = participant['_id']
        participant_name = participant.get('name', participant_id)
        
        # Update the leaderboard field
        if exclude:
            # Set leaderboard: false to exclude from leaderboard
            update_result = participants_collection.update_one(
                {'_id': participant_id},
                {'$set': {'leaderboard': False}}
            )
            action = 'excluded from'
        else:
            # Remove leaderboard field or set to true to include in leaderboard
            update_result = participants_collection.update_one(
                {'_id': participant_id},
                {'$unset': {'leaderboard': ''}}
            )
            action = 'included in'
        
        if update_result.modified_count > 0:
            logger.info(f"Participant {participant_id} ({participant_name}) {action} leaderboard")
            return jsonify({
                'success': True,
                'message': f'Participant "{participant_name}" (ID: {participant_id}) has been {action} the leaderboard',
                'participant': {
                    '_id': participant_id,
                    'name': participant_name,
                    'leaderboard': not exclude
                }
            }), 200
        else:
            # No modification means the field was already in the desired state
            return jsonify({
                'success': True,
                'message': f'Participant "{participant_name}" (ID: {participant_id}) is already {action} the leaderboard',
                'participant': {
                    '_id': participant_id,
                    'name': participant_name,
                    'leaderboard': not exclude
                }
            }), 200
        
    except Exception as e:
        logger.error(f"Error updating leaderboard exclusion: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/admin/leaderboard/status', methods=['GET'])
def get_leaderboard_status():
    """
    Get all participants and their leaderboard status.
    Returns list of participants with their current leaderboard inclusion status.
    """
    try:
        # Get all participants (including decommissioned ones for admin management)
        participants = list(participants_collection.find(
            {},
            {'_id': 1, 'name': 1, 'leaderboard': 1, 'taken': 1, 'decommissioned': 1}
        ).sort('name', 1))
        
        # Process participants to determine leaderboard status
        result = []
        for participant in participants:
            # If leaderboard field is explicitly False, participant is excluded
            # Otherwise, participant is included (default behavior)
            is_excluded = participant.get('leaderboard') == False
            
            result.append({
                '_id': participant['_id'],
                'name': participant.get('name', participant['_id']),
                'excluded': is_excluded,
                'taken': participant.get('taken'),  # Don't default to False - None means CSV user
                'decommissioned': participant.get('decommissioned', False)
            })
        
        logger.info(f"Retrieved leaderboard status for {len(result)} participants")
        return jsonify({
            'success': True,
            'data': result,
            'count': len(result)
        }), 200
        
    except Exception as e:
        logger.error(f"Error retrieving leaderboard status: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/admin/prizes/close-date', methods=['GET'])
def get_prize_close_date():
    """
    Get the current prize close date from scenario_config.
    Returns the close_on field from prizes if it exists.
    MongoDB stores close_on as ISODate (UTC), we convert it to ISO string for JSON.
    """
    try:
        # Find the scenario config document
        config = scenario_config_collection.find_one({})
        
        if not config:
            return jsonify({
                'success': False,
                'error': 'No scenario config found'
            }), 404
        
        prizes = config.get('prizes', {})
        close_on_date = prizes.get('close_on')
        
        # Convert MongoDB Date object to ISO string if it exists
        close_on_iso = None
        if close_on_date:
            if isinstance(close_on_date, datetime):
                # MongoDB Date object - convert to ISO string
                close_on_iso = close_on_date.isoformat() + 'Z' if close_on_date.tzinfo is None else close_on_date.isoformat()
            else:
                # Already a string (for backwards compatibility)
                close_on_iso = close_on_date
        
        logger.info(f"Retrieved prize close date: {close_on_iso}")
        return jsonify({
            'success': True,
            'close_on': close_on_iso
        }), 200
        
    except Exception as e:
        logger.error(f"Error retrieving prize close date: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/admin/prizes/close-date', methods=['POST'])
def set_prize_close_date():
    """
    Set or update the prize close date in scenario_config.
    Expected JSON payload:
    {
        "close_on": "ISO 8601 datetime string"
    }
    The timezone parameter is accepted but not stored (used only for conversion to UTC).
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No JSON data provided'
            }), 400
        
        close_on = data.get('close_on')
        
        if not close_on:
            return jsonify({
                'success': False,
                'error': 'close_on field is required'
            }), 400
        
        # Validate and parse the date format
        try:
            # Parse ISO string to Python datetime (UTC)
            close_date = datetime.fromisoformat(close_on.replace('Z', '+00:00'))
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'Invalid date format. Use ISO 8601 format.'
            }), 400
        
        # Update the scenario config with the new close_on date as MongoDB Date object
        # MongoDB will automatically store the datetime as ISODate (UTC)
        update_result = scenario_config_collection.update_one(
            {},
            {'$set': {
                'prizes.close_on': close_date  # Store as MongoDB ISODate (UTC)
            }},
            upsert=False
        )
        
        if update_result.matched_count == 0:
            return jsonify({
                'success': False,
                'error': 'No scenario config found to update'
            }), 404
        
        logger.info(f"Updated prize close date to: {close_date.isoformat()}")
        return jsonify({
            'success': True,
            'message': f'Prize close date updated successfully',
            'close_on': close_date.isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating prize close date: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    logger.info(f"Starting Flask application on port {port}")
    logger.info(f"MongoDB URI: {MONGODB_URI}")
    logger.info(f"Database: {DB_NAME}")
    logger.info(f"Collection: {PARTICIPANTS_COLLECTION}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
