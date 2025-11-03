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

# MongoDB client
client = MongoClient(MONGODB_URI)
db = client[DB_NAME]
participants_collection = db[PARTICIPANTS_COLLECTION]
user_details_collection = db[USER_DETAILS_COLLECTION]

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

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    logger.info(f"Starting Flask application on port {port}")
    logger.info(f"MongoDB URI: {MONGODB_URI}")
    logger.info(f"Database: {DB_NAME}")
    logger.info(f"Collection: {PARTICIPANTS_COLLECTION}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
