#!/usr/bin/env python3
"""
MongoDB to PostgreSQL Migration Script
Transfers data from MongoDB simone-gaiera.listingsAndReviews to PostgreSQL
Includes environment variable loading from migration.env file
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor, execute_values
from pymongo import MongoClient
from decimal import Decimal

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MongoToPostgresMigrator:
    def __init__(self, mongo_uri: str, postgres_config: Dict[str, str]):
        """
        Initialize the migrator with MongoDB and PostgreSQL connection details
        
        Args:
            mongo_uri: MongoDB connection string
            postgres_config: PostgreSQL connection configuration
        """
        self.mongo_uri = mongo_uri
        self.postgres_config = postgres_config
        self.mongo_client = None
        self.postgres_conn = None
        
    def connect_mongodb(self):
        """Connect to MongoDB"""
        try:
            self.mongo_client = MongoClient(self.mongo_uri)
            # Test connection
            self.mongo_client.admin.command('ping')
            logger.info("Connected to MongoDB successfully")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
            
    def connect_postgresql(self):
        """Connect to PostgreSQL"""
        try:
            self.postgres_conn = psycopg2.connect(**self.postgres_config)
            self.postgres_conn.autocommit = False
            logger.info("Connected to PostgreSQL successfully")
        except Exception as e:
            logger.error(f"Failed to connect to PostgreSQL: {e}")
            raise
            
    def create_postgres_schema(self):
        """Create PostgreSQL schema for Airbnb listings data"""
        
        schema_sql = """
        -- Drop tables if they exist (in correct order due to foreign keys)
        DROP TABLE IF EXISTS reviews CASCADE;
        DROP TABLE IF EXISTS listing_amenities CASCADE;
        DROP TABLE IF EXISTS amenities CASCADE;
        DROP TABLE IF EXISTS host_verifications CASCADE;
        DROP TABLE IF EXISTS listings CASCADE;
        DROP TABLE IF EXISTS hosts CASCADE;
        
        -- Create hosts table
        CREATE TABLE hosts (
            host_id VARCHAR(50) PRIMARY KEY,
            host_url TEXT,
            host_name VARCHAR(255),
            host_location TEXT,
            host_about TEXT,
            host_thumbnail_url TEXT,
            host_picture_url TEXT,
            host_neighbourhood VARCHAR(255),
            host_is_superhost BOOLEAN,
            host_has_profile_pic BOOLEAN,
            host_identity_verified BOOLEAN,
            host_listings_count INTEGER,
            host_total_listings_count INTEGER,
            host_response_time VARCHAR(50),
            host_response_rate INTEGER
        );
        
        -- Create amenities table (distinct amenities)
        CREATE TABLE amenities (
            amenity_id SERIAL PRIMARY KEY,
            amenity_name VARCHAR(255) UNIQUE NOT NULL
        );
        
        -- Create listings table
        CREATE TABLE listings (
            listing_id VARCHAR(50) PRIMARY KEY,
            listing_url TEXT,
            name VARCHAR(500),
            summary TEXT,
            space TEXT,
            description TEXT,
            neighborhood_overview TEXT,
            notes TEXT,
            transit TEXT,
            access_info TEXT,
            interaction TEXT,
            house_rules TEXT,
            property_type VARCHAR(100),
            room_type VARCHAR(100),
            bed_type VARCHAR(100),
            minimum_nights VARCHAR(10),
            maximum_nights VARCHAR(10),
            cancellation_policy VARCHAR(50),
            last_scraped TIMESTAMP,
            calendar_last_scraped TIMESTAMP,
            accommodates INTEGER,
            bedrooms INTEGER,
            beds INTEGER,
            number_of_reviews INTEGER,
            bathrooms DECIMAL(3,1),
            price DECIMAL(10,2),
            weekly_price DECIMAL(10,2),
            monthly_price DECIMAL(10,2),
            cleaning_fee DECIMAL(10,2),
            extra_people DECIMAL(10,2),
            guests_included DECIMAL(3,0),
            security_deposit DECIMAL(10,2),
            
            -- Images
            thumbnail_url TEXT,
            medium_url TEXT,
            picture_url TEXT,
            xl_picture_url TEXT,
            
            -- Address
            street TEXT,
            suburb VARCHAR(255),
            government_area VARCHAR(255),
            market VARCHAR(255),
            country VARCHAR(100),
            country_code VARCHAR(10),
            latitude DECIMAL(10,8),
            longitude DECIMAL(11,8),
            is_location_exact BOOLEAN,
            
            -- Availability as JSON
            availability JSONB,
            
            -- Review scores as JSON
            review_scores JSONB,
            
            -- Dates
            first_review TIMESTAMP,
            last_review TIMESTAMP,
            updated_at TIMESTAMP,
            
            -- Foreign key
            host_id VARCHAR(50) REFERENCES hosts(host_id)
        );
        
        -- Create listing_amenities junction table (normalized with foreign keys)
        CREATE TABLE listing_amenities (
            listing_id VARCHAR(50) REFERENCES listings(listing_id),
            amenity_id INTEGER REFERENCES amenities(amenity_id),
            PRIMARY KEY (listing_id, amenity_id)
        );
        
        -- Create host verifications table (normalized)
        CREATE TABLE host_verifications (
            id SERIAL PRIMARY KEY,
            host_id VARCHAR(50) REFERENCES hosts(host_id),
            verification VARCHAR(100)
        );
        
        -- Create reviews table
        CREATE TABLE reviews (
            review_id VARCHAR(50) PRIMARY KEY,
            listing_id VARCHAR(50) REFERENCES listings(listing_id),
            review_date TIMESTAMP,
            reviewer_id VARCHAR(50),
            reviewer_name VARCHAR(255),
            comments TEXT
        );
        
        -- Create indexes for better performance
        CREATE INDEX idx_listings_host_id ON listings(host_id);
        CREATE INDEX idx_listings_property_type ON listings(property_type);
        CREATE INDEX idx_listings_room_type ON listings(room_type);
        CREATE INDEX idx_listings_price ON listings(price);
        CREATE INDEX idx_listings_location ON listings(latitude, longitude);
        CREATE INDEX idx_listings_availability ON listings USING GIN (availability);
        CREATE INDEX idx_listings_review_scores ON listings USING GIN (review_scores);
        CREATE INDEX idx_reviews_listing_id ON reviews(listing_id);
        CREATE INDEX idx_reviews_date ON reviews(review_date);
        CREATE INDEX idx_amenities_listing_id ON listing_amenities(listing_id);
        CREATE INDEX idx_amenities_amenity_id ON listing_amenities(amenity_id);
        CREATE INDEX idx_amenities_name ON amenities(amenity_name);
        """
        
        try:
            with self.postgres_conn.cursor() as cursor:
                cursor.execute(schema_sql)
                self.postgres_conn.commit()
                logger.info("PostgreSQL schema created successfully")
        except Exception as e:
            self.postgres_conn.rollback()
            logger.error(f"Failed to create PostgreSQL schema: {e}")
            raise
            
    def safe_decimal(self, value) -> Optional[Decimal]:
        """Safely convert MongoDB Decimal128 to Python Decimal"""
        if value is None:
            return None
        if isinstance(value, dict) and '$numberDecimal' in value:
            return Decimal(str(value['$numberDecimal']))
        return Decimal(str(value)) if value is not None else None
        
    def safe_date(self, value) -> Optional[datetime]:
        """Safely convert MongoDB date to Python datetime"""
        if value is None:
            return None
        if isinstance(value, dict) and '$date' in value:
            return datetime.fromisoformat(value['$date'].replace('Z', '+00:00'))
        return value if isinstance(value, datetime) else None
        
    def migrate_hosts(self, listings_data: List[Dict]):
        """Migrate host data to PostgreSQL"""
        hosts_data = {}
        
        # Extract unique hosts
        for listing in listings_data:
            host = listing.get('host', {})
            if host and 'host_id' in host:
                host_id = host['host_id']
                if host_id not in hosts_data:
                    hosts_data[host_id] = {
                        'host_id': host_id,
                        'host_url': host.get('host_url'),
                        'host_name': host.get('host_name'),
                        'host_location': host.get('host_location'),
                        'host_about': host.get('host_about'),
                        'host_thumbnail_url': host.get('host_thumbnail_url'),
                        'host_picture_url': host.get('host_picture_url'),
                        'host_neighbourhood': host.get('host_neighbourhood'),
                        'host_is_superhost': host.get('host_is_superhost'),
                        'host_has_profile_pic': host.get('host_has_profile_pic'),
                        'host_identity_verified': host.get('host_identity_verified'),
                        'host_listings_count': host.get('host_listings_count'),
                        'host_total_listings_count': host.get('host_total_listings_count'),
                        'host_response_time': host.get('host_response_time'),
                        'host_response_rate': host.get('host_response_rate')
                    }
        
        # Insert hosts
        if hosts_data:
            insert_sql = """
                INSERT INTO hosts (
                    host_id, host_url, host_name, host_location, host_about,
                    host_thumbnail_url, host_picture_url, host_neighbourhood,
                    host_is_superhost, host_has_profile_pic, host_identity_verified,
                    host_listings_count, host_total_listings_count,
                    host_response_time, host_response_rate
                ) VALUES %s
                ON CONFLICT (host_id) DO NOTHING
            """
            
            values = [
                (
                    host['host_id'], host['host_url'], host['host_name'],
                    host['host_location'], host['host_about'], host['host_thumbnail_url'],
                    host['host_picture_url'], host['host_neighbourhood'],
                    host['host_is_superhost'], host['host_has_profile_pic'],
                    host['host_identity_verified'], host['host_listings_count'],
                    host['host_total_listings_count'], host['host_response_time'],
                    host['host_response_rate']
                )
                for host in hosts_data.values()
            ]
            
            with self.postgres_conn.cursor() as cursor:
                execute_values(cursor, insert_sql, values)
                
            logger.info(f"Migrated {len(hosts_data)} hosts")
            
        # Migrate host verifications
        verifications_data = []
        for listing in listings_data:
            host = listing.get('host', {})
            if host and 'host_id' in host and 'host_verifications' in host:
                host_id = host['host_id']
                for verification in host.get('host_verifications', []):
                    verifications_data.append((host_id, verification))
        
        if verifications_data:
            insert_sql = "INSERT INTO host_verifications (host_id, verification) VALUES %s"
            with self.postgres_conn.cursor() as cursor:
                execute_values(cursor, insert_sql, verifications_data)
            logger.info(f"Migrated {len(verifications_data)} host verifications")
            
    def migrate_amenities(self, listings_data: List[Dict]):
        """Migrate distinct amenities to PostgreSQL"""
        
        # Collect all unique amenities
        unique_amenities = set()
        for listing in listings_data:
            for amenity in listing.get('amenities', []):
                if amenity:  # Skip empty amenities
                    unique_amenities.add(amenity)
        
        # Insert unique amenities
        if unique_amenities:
            amenities_values = [(amenity,) for amenity in unique_amenities]
            insert_sql = """
                INSERT INTO amenities (amenity_name) 
                VALUES %s 
                ON CONFLICT (amenity_name) DO NOTHING
            """
            with self.postgres_conn.cursor() as cursor:
                execute_values(cursor, insert_sql, amenities_values)
            logger.info(f"Migrated {len(unique_amenities)} distinct amenities")
    
    def migrate_listings(self, listings_data: List[Dict]):
        """Migrate listings data to PostgreSQL"""
        
        listings_values = []
        listing_amenities_data = []
        
        # First, get amenity_id mapping
        with self.postgres_conn.cursor() as cursor:
            cursor.execute("SELECT amenity_id, amenity_name FROM amenities")
            amenity_mapping = {name: id for id, name in cursor.fetchall()}
        
        for listing in listings_data:
            # Extract coordinates
            location = listing.get('address', {}).get('location', {})
            coordinates = location.get('coordinates', [])
            longitude = coordinates[0] if len(coordinates) > 0 else None
            latitude = coordinates[1] if len(coordinates) > 1 else None
            
            # Extract host_id
            host_id = listing.get('host', {}).get('host_id')
            
            # Prepare availability as JSON
            availability_json = json.dumps(listing.get('availability', {})) if listing.get('availability') else None
            
            # Prepare review scores as JSON
            review_scores_json = json.dumps(listing.get('review_scores', {})) if listing.get('review_scores') else None
            
            # Prepare listing data
            listing_data = (
                listing.get('_id'),  # listing_id
                listing.get('listing_url'),
                listing.get('name'),
                listing.get('summary'),
                listing.get('space'),
                listing.get('description'),
                listing.get('neighborhood_overview'),
                listing.get('notes'),
                listing.get('transit'),
                listing.get('access'),
                listing.get('interaction'),
                listing.get('house_rules'),
                listing.get('property_type'),
                listing.get('room_type'),
                listing.get('bed_type'),
                listing.get('minimum_nights'),
                listing.get('maximum_nights'),
                listing.get('cancellation_policy'),
                self.safe_date(listing.get('last_scraped')),
                self.safe_date(listing.get('calendar_last_scraped')),
                listing.get('accommodates'),
                listing.get('bedrooms'),
                listing.get('beds'),
                listing.get('number_of_reviews'),
                self.safe_decimal(listing.get('bathrooms')),
                self.safe_decimal(listing.get('price')),
                self.safe_decimal(listing.get('weekly_price')),
                self.safe_decimal(listing.get('monthly_price')),
                self.safe_decimal(listing.get('cleaning_fee')),
                self.safe_decimal(listing.get('extra_people')),
                self.safe_decimal(listing.get('guests_included')),
                self.safe_decimal(listing.get('security_deposit')),
                
                # Images
                listing.get('images', {}).get('thumbnail_url'),
                listing.get('images', {}).get('medium_url'),
                listing.get('images', {}).get('picture_url'),
                listing.get('images', {}).get('xl_picture_url'),
                
                # Address
                listing.get('address', {}).get('street'),
                listing.get('address', {}).get('suburb'),
                listing.get('address', {}).get('government_area'),
                listing.get('address', {}).get('market'),
                listing.get('address', {}).get('country'),
                listing.get('address', {}).get('country_code'),
                latitude,
                longitude,
                location.get('is_location_exact'),
                
                # Availability as JSON
                availability_json,
                
                # Review scores as JSON
                review_scores_json,
                
                # Dates
                self.safe_date(listing.get('first_review')),
                self.safe_date(listing.get('last_review')),
                self.safe_date(listing.get('updated_at')),
                
                # Foreign key
                host_id
            )
            
            listings_values.append(listing_data)
            
            # Collect listing-amenity relationships
            listing_id = listing.get('_id')
            for amenity in listing.get('amenities', []):
                if amenity and amenity in amenity_mapping:
                    listing_amenities_data.append((listing_id, amenity_mapping[amenity]))
        
        # Insert listings
        insert_sql = """
            INSERT INTO listings (
                listing_id, listing_url, name, summary, space, description,
                neighborhood_overview, notes, transit, access_info, interaction,
                house_rules, property_type, room_type, bed_type, minimum_nights,
                maximum_nights, cancellation_policy, last_scraped, calendar_last_scraped,
                accommodates, bedrooms, beds, number_of_reviews, bathrooms,
                price, weekly_price, monthly_price, cleaning_fee, extra_people,
                guests_included, security_deposit, thumbnail_url, medium_url,
                picture_url, xl_picture_url, street, suburb, government_area,
                market, country, country_code, latitude, longitude, is_location_exact,
                availability, review_scores, first_review, last_review, updated_at, host_id
            ) VALUES %s
        """
        
        with self.postgres_conn.cursor() as cursor:
            execute_values(cursor, insert_sql, listings_values)
            
        logger.info(f"Migrated {len(listings_values)} listings")
        
        # Insert listing-amenity relationships
        if listing_amenities_data:
            insert_sql = "INSERT INTO listing_amenities (listing_id, amenity_id) VALUES %s ON CONFLICT DO NOTHING"
            with self.postgres_conn.cursor() as cursor:
                execute_values(cursor, insert_sql, listing_amenities_data)
            logger.info(f"Migrated {len(listing_amenities_data)} listing-amenity relationships")
            
    def migrate_reviews(self, listings_data: List[Dict]):
        """Migrate reviews data to PostgreSQL"""
        
        reviews_data = []
        
        for listing in listings_data:
            listing_id = listing.get('_id')
            for review in listing.get('reviews', []):
                review_data = (
                    review.get('_id'),
                    listing_id,
                    self.safe_date(review.get('date')),
                    review.get('reviewer_id'),
                    review.get('reviewer_name'),
                    review.get('comments')
                )
                reviews_data.append(review_data)
        
        if reviews_data:
            insert_sql = """
                INSERT INTO reviews (review_id, listing_id, review_date, reviewer_id, reviewer_name, comments)
                VALUES %s
            """
            with self.postgres_conn.cursor() as cursor:
                execute_values(cursor, insert_sql, reviews_data)
            logger.info(f"Migrated {len(reviews_data)} reviews")
        
    def migrate_data(self):
        """Main migration method"""
        try:
            # Connect to databases
            self.connect_mongodb()
            self.connect_postgresql()
            
            # Create PostgreSQL schema
            self.create_postgres_schema()
            
            # Fetch data from MongoDB
            logger.info("Fetching data from MongoDB...")
            db = self.mongo_client['simone-gaiera']
            collection = db['listingsAndReviews']
            
            # Get all documents
            listings_data = list(collection.find())
            logger.info(f"Fetched {len(listings_data)} listings from MongoDB")
            
            # Migrate data in order (respecting foreign key constraints)
            logger.info("Migrating hosts...")
            self.migrate_hosts(listings_data)
            self.postgres_conn.commit()
            
            logger.info("Migrating amenities...")
            self.migrate_amenities(listings_data)
            self.postgres_conn.commit()
            
            logger.info("Migrating listings...")
            self.migrate_listings(listings_data)
            self.postgres_conn.commit()
            
            logger.info("Migrating reviews...")
            self.migrate_reviews(listings_data)
            self.postgres_conn.commit()
            
            logger.info("Migration completed successfully!")
            
        except Exception as e:
            if self.postgres_conn:
                self.postgres_conn.rollback()
            logger.error(f"Migration failed: {e}")
            raise
        finally:
            if self.mongo_client:
                self.mongo_client.close()
            if self.postgres_conn:
                self.postgres_conn.close()
                
    def verify_migration(self):
        """Verify the migration by comparing counts"""
        try:
            self.connect_mongodb()
            self.connect_postgresql()
            
            # MongoDB counts
            db = self.mongo_client['simone-gaiera']
            collection = db['listingsAndReviews']
            mongo_listings_count = collection.count_documents({})
            
            # PostgreSQL counts
            with self.postgres_conn.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM listings")
                pg_listings_count = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM hosts")
                pg_hosts_count = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM reviews")
                pg_reviews_count = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM listing_amenities")
                pg_amenities_count = cursor.fetchone()[0]
            
            logger.info(f"Migration Verification:")
            logger.info(f"MongoDB listings: {mongo_listings_count}")
            logger.info(f"PostgreSQL listings: {pg_listings_count}")
            logger.info(f"PostgreSQL hosts: {pg_hosts_count}")
            logger.info(f"PostgreSQL reviews: {pg_reviews_count}")
            logger.info(f"PostgreSQL amenities: {pg_amenities_count}")
            
            if mongo_listings_count == pg_listings_count:
                logger.info("✅ Listings count matches!")
            else:
                logger.warning("❌ Listings count mismatch!")
                
        except Exception as e:
            logger.error(f"Verification failed: {e}")
        finally:
            if self.mongo_client:
                self.mongo_client.close()
            if self.postgres_conn:
                self.postgres_conn.close()


def load_env_file(env_file_path: str = "migration.env"):
    """Load environment variables from a file"""
    if not os.path.exists(env_file_path):
        logger.warning(f"Environment file {env_file_path} not found, using defaults")
        return False
    
    try:
        with open(env_file_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value
        
        logger.info(f"Loaded environment variables from {env_file_path}")
        return True
    except Exception as e:
        logger.error(f"Failed to load environment file: {e}")
        return False


def main():
    """Main function to run the migration with environment setup"""
    
    print("=" * 60)
    print("MongoDB to PostgreSQL Migration Script")
    print("=" * 60)
    
    # Load environment variables from migration.env
    load_env_file("migration.env")
    
    # Configuration - using actual connection strings
    MONGO_URI = os.getenv('MONGODB_URI', 'mongodb+srv://...')
    
    POSTGRES_CONFIG = {
        'host': os.getenv('POSTGRES_HOST', '...rds.amazonaws.com'),
        'port': os.getenv('POSTGRES_PORT', '5432'),
        'database': os.getenv('POSTGRES_DB', 'simone-gaiera'),
        'user': os.getenv('POSTGRES_USER', 'simone-gaiera'),
        'password': os.getenv('POSTGRES_PASSWORD', 'simone-gaiera'),
        'sslmode': os.getenv('POSTGRES_SSLMODE', 'require')
    }
    
    logger.info("Starting MongoDB to PostgreSQL migration...")
    logger.info(f"MongoDB Database: {MONGO_URI.split('/')[-1].split('?')[0] if '/' in MONGO_URI else 'simone-gaiera'}")
    logger.info(f"PostgreSQL Host: {POSTGRES_CONFIG['host']}")
    logger.info(f"PostgreSQL Database: {POSTGRES_CONFIG['database']}")
    
    # Create migrator instance
    migrator = MongoToPostgresMigrator(MONGO_URI, POSTGRES_CONFIG)
    
    try:
        # Run migration
        migrator.migrate_data()
        
        # Verify migration
        migrator.verify_migration()
        
        print("=" * 60)
        print("✅ Migration completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        logger.error(f"Migration process failed: {e}")
        print("=" * 60)
        print("❌ Migration failed!")
        print("=" * 60)
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())
