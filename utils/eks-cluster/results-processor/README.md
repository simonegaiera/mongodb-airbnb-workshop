# MongoDB Results Processor

A Java application that connects to MongoDB and processes results from the `arena_shared` database. The application reads environment variables for configuration and logs health information on each run.

## Features

- Connects to MongoDB using the `MONGODB_URI` environment variable
- Uses the `arena_shared` database with collections:
  - `automated_results` - for processing results data
  - `health` - for logging application health information
- Logs health information every time the application runs
- Configurable logging through environment variables

## Prerequisites

- Java 11 or higher
- Maven 3.6 or higher
- MongoDB cluster with access credentials

## Configuration

Copy the `.env.template` file to `.env` and configure the following environment variables.

## Building the Application

```bash
mvn clean compile
mvn clean package
```

## Running the Application

### With Maven:
```bash
mvn exec:java -Dexec.mainClass="com.mongodb.workshop.ResultsProcessor"
```

### With the compiled JAR:
```bash
mvn clean package
export $(grep -v '^#' .env | xargs)
java -jar target/results-processor-1.0.0.jar
```

## Application Behavior

1. **Startup**: The application reads the `MONGODB_URI` environment variable and connects to MongoDB
2. **Health Logging**: Creates a health document in the `health` collection with:
   - Timestamp of execution
   - Application name and status
   - Database and collections information
   - Environment configuration details
3. **Results Processing**: Counts documents in the `automated_results` collection (placeholder for future implementation)
4. **Cleanup**: Closes the MongoDB connection

## Logging

The application uses Logback for logging with the following features:
- Console output with structured formatting
- Rolling file logs in the `logs/` directory
- Configurable log level through the `LOG_LEVEL` environment variable
- Reduced MongoDB driver verbosity

## Database Schema

### Health Collection Document:
```json
{
  "timestamp": "2025-01-11T11:42:00.123",
  "application": "results-processor",
  "status": "running",
  "database": "arena_shared",
  "collections_accessed": ["automated_results", "health"],
  "environment_info": {
    "environment": "test",
    "log_level": "INFO",
    "prod_service_name": "vscode-participant-svc",
    "test_service_name": "participant.mongoai.mongoarena.com/backend/"
  }
}
```

## Error Handling

- Missing `MONGODB_URI` environment variable will cause the application to exit with an error
- MongoDB connection failures are logged and will terminate the application
- All exceptions during processing are logged with full stack traces
