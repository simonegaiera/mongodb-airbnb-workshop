from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timezone
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Initialize Flask app (remove static folder configuration)
app = Flask(__name__)

# Configure CORS to allow requests from your React frontend
CORS(app, origins=['*'])  # In production, specify your React app's domain

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB configuration
MONGODB_URI = os.getenv('MONGODB_URI')
DB_NAME = os.getenv('DB_NAME')
PARTICIPANTS_COLLECTION = os.getenv('PARTICIPANTS')

# MongoDB client
client = MongoClient(MONGODB_URI)
db = client[DB_NAME]
participants_collection = db[PARTICIPANTS_COLLECTION]

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
            {'_id': 1, 'name': 1, 'taken': 1}
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
    """Get the count of active participants (taken or no taken field) and total participants"""
    try:
        # Count active participants (taken=true or no taken field)
        active_count = participants_collection.count_documents({"$or": [{"taken": True}, {"taken": {"$exists": False}}]})
        
        # Count total participants
        total_count = participants_collection.count_documents({})
        
        logger.info(f"Found {active_count} active participants out of {total_count} total")
        return jsonify({
            'success': True,
            'active_count': active_count,
            'total_count': total_count,
            'message': f'{active_count}/{total_count} participants active'
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
        
        # Create update document
        update_data = {
            'name': name,
            'email': email,
            'taken': True,
            'taken_timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        # Use findOneAndUpdate with atomic operation to prevent race conditions
        updated_participant = participants_collection.find_one_and_update(
            {'taken': False},
            {'$set': update_data},
            return_document=True,
            projection={'_id': 0}
        )
        
        if not updated_participant:
            return jsonify({
                'success': False,
                'error': 'No available participants found'
            }), 404
            
        logger.info(f"Successfully assigned participant {updated_participant.get('id', 'unknown')} to {name}")
        return jsonify({
            'success': True,
            'message': f'Participant successfully assigned to {name}',
            'data': updated_participant
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
    """
    try:
        leaderboard = os.getenv('LEADERBOARD', 'timed')
        
        # Use different views based on leaderboard type
        view_name = 'score_leaderboard' if leaderboard == 'score' else 'timed_leaderboard'
        leaderboard_collection = db[view_name]
        data = list(leaderboard_collection.find({}, {'_id': 0}))
        

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
            
            # Convert to sorted array and back to dict (sorted by points descending)
            sorted_points_array = sorted(points_by_username.items(), key=lambda x: x[1], reverse=True)
            sorted_points_by_username = dict(sorted_points_array)
            
            items = {
                'results': sorted_points_by_username,
                'data': data,
                'leaderboardType': 'score'
            }
        else:
            # For timed leaderboard, return results as data
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
    
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    logger.info(f"Starting Flask application on port {port}")
    logger.info(f"MongoDB URI: {MONGODB_URI}")
    logger.info(f"Database: {DB_NAME}")
    logger.info(f"Collection: {PARTICIPANTS_COLLECTION}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
