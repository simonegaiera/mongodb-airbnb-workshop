# MongoDB to PostgreSQL Migration Task

## Objective
Migrate data from a MongoDB collection to a normalized PostgreSQL database structure, ensuring proper relational database design following normal forms.

## Source Database Details
- **MongoDB Database**: `simone-gaiera`
- **Collection**: `listingandreviews`
- **Connection**: Use MongoDB MCP server to analyze the existing data structure

## Target Database Requirements
- **PostgreSQL Database**: `simone-gaiera` (to be created)
- **Normalization**: Design tables following database normal forms (1NF, 2NF, 3NF)
- **Connection**: Use PostgreSQL MCP server for database operations

## Task Steps

### Phase 1: Data Analysis
1. Connect to the MongoDB database using MCP tools
2. Analyze the `listingandreviews` collection structure:
   - Examine document schema and field types
   - Identify nested objects and arrays
   - Understand data relationships and patterns
   - Sample a few documents to understand the data structure

### Phase 2: Database Design
1. Design a normalized PostgreSQL schema based on the MongoDB data:
   - Identify distinct entities (likely: listings, reviews, hosts, locations, amenities, etc.)
   - Create separate tables for each entity
   - Define primary keys, foreign keys, and relationships
   - Ensure compliance with normal forms:
     - 1NF: Eliminate repeating groups
     - 2NF: Remove partial dependencies
     - 3NF: Remove transitive dependencies

### Phase 3: PostgreSQL Implementation
1. Create Python scripts to:
   - Create the PostgreSQL database `simone-gaiera`
   - Create all necessary tables with proper:
     - Data types
     - Constraints
     - Indexes
     - Foreign key relationships

### Phase 4: Data Migration
1. Develop Python scripts to:
   - Extract data from MongoDB collection using pymongo
   - Transform data to fit the normalized PostgreSQL structure
   - Load data into the appropriate PostgreSQL tables using psycopg2
   - Verify data integrity and relationships

## Expected Deliverables
- Normalized PostgreSQL database schema
- Python scripts for database creation and table setup
- Python scripts for data migration from MongoDB to PostgreSQL
- All necessary tables created with proper relationships
- Data successfully migrated and verified
- Documentation of the schema design decisions

## Tools to Use
- **MongoDB MCP server**: ONLY for analyzing and understanding the source data structure (read-only operations)
- **PostgreSQL MCP server**: ONLY for analyzing and understanding the target database structure (read-only operations)
- **Python scripts**: For ALL data migration, database creation, and modification operations
- Ensure proper error handling and data validation throughout the process

## Important Note
**MCP servers should be used exclusively for understanding database structures and schemas. All actual changes, data migration, table creation, and database modifications must be performed through Python scripts using appropriate database drivers (pymongo for MongoDB, psycopg2 for PostgreSQL).**

## Success Criteria
- All data from MongoDB collection is successfully migrated
- PostgreSQL database follows proper normalization principles
- Data integrity is maintained
- Relationships between entities are properly established
