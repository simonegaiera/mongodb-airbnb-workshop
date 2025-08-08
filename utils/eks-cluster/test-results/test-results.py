import os
import requests
from pymongo import MongoClient
from dotenv import load_dotenv
import logging
import json

# Load environment variables
load_dotenv()

# Configure logging
log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
logging.basicConfig(level=getattr(logging, log_level), format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def connect_to_mongodb():
    """Connect to MongoDB using the URI from environment variables"""
    try:
        uri = os.getenv('MONGODB_URI')
        if not uri:
            raise ValueError("MONGODB_URI not found in environment variables")
        
        client = MongoClient(uri)
        # Test the connection
        client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")
        return client
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise

def get_participants(client):
    """Get list of participants from the database"""
    try:
        db_name = os.getenv('DB_NAME')
        collection_name = os.getenv('PARTICIPANTS')
        
        if not db_name:
            raise ValueError("DB_NAME not found in environment variables")
        if not collection_name:
            raise ValueError("PARTICIPANTS not found in environment variables")
        
        db = client[db_name]
        participants_collection = db[collection_name]
        
        participants = list(participants_collection.find({}, {"_id": 1}))
        logger.info(f"Found {len(participants)} participants")
        return [participant['_id'] for participant in participants]
    except Exception as e:
        logger.error(f"Failed to get participants: {e}")
        raise

def create_service_urls(participant_names):
    """Create service URLs for each participant"""
    # Get environment (default to 'prod')
    environment = os.getenv('ENVIRONMENT', 'prod').lower()
    
    # Get the appropriate service template based on environment
    if environment == 'test':
        service_template = os.getenv('TEST_SERVICE_NAME')
        url_scheme = 'https'
    else:
        service_template = os.getenv('PROD_SERVICE_NAME')
        url_scheme = 'http'
    
    if not service_template:
        raise ValueError(f"Service template not found for environment '{environment}'")
    
    services = []
    for participant_name in participant_names:
        service_name = service_template.replace('{{PARTICIPANT_NAME}}', str(participant_name))
        
        # For test environment, the service_name already includes the full URL path
        if environment == 'test':
            service_url = f"{url_scheme}://{service_name}api/results/whoami"
        else:
            service_url = f"{url_scheme}://{service_name}/api/results/whoami"
        
        service_obj = {
            'participant': participant_name,
            'service_name': service_name,
            'url': service_url,
            'environment': environment
        }
        services.append(service_obj)
        
        # Debug logging for each service object with pretty print
        logger.debug(f"Created service object:\n{json.dumps(service_obj, indent=2)}")
    
    logger.info(f"Created {len(services)} service URLs for {environment} environment using {url_scheme}")
    logger.debug(f"All services:\n{json.dumps(services, indent=2)}")
    return services

def check_service_health(services):
    """Check if services are alive by calling /whoami endpoint"""
    alive_services = []
    dead_services = []
    
    for service in services:
        try:
            response = requests.get(service['url'], timeout=2)
            if response.status_code == 200:
                logger.info(f"Service {service['service_name']} is alive")
                alive_services.append(service)
            else:
                logger.warning(f"Service {service['service_name']} returned status {response.status_code}")
                dead_services.append(service)
        except requests.exceptions.RequestException as e:
            logger.warning(f"Service {service['service_name']} is not reachable: {e}")
            dead_services.append(service)
    
    logger.info(f"Alive services: {len(alive_services)}, Dead services: {len(dead_services)}")
    return alive_services, dead_services

def main():
    """Main function to orchestrate the process"""
    try:
        # Connect to MongoDB
        client = connect_to_mongodb()
        
        # Get participants
        participant_names = get_participants(client)
        
        # Create service URLs
        services = create_service_urls(participant_names)
        
        # Check service health
        alive_services, dead_services = check_service_health(services)
        
        # Print results
        print(f"\n=== Results ===")
        print(f"Total participants: {len(participant_names)}")
        print(f"Alive services: {len(alive_services)}")
        print(f"Dead services: {len(dead_services)}")
        
        if alive_services:
            print("\nAlive services:")
            for service in alive_services:
                print(f"  - {service['participant']}: {service['service_name']}")
        
        if dead_services:
            print("\nDead services:")
            for service in dead_services:
                print(f"  - {service['participant']}: {service['service_name']}")
        
        # Close MongoDB connection
        client.close()
        
        return alive_services, dead_services
        
    except Exception as e:
        logger.error(f"Script failed: {e}")
        raise

if __name__ == "__main__":
    main()