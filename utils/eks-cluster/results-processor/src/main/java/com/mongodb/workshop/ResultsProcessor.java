package com.mongodb.workshop;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.workshop.tests.*;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

import com.mongodb.client.model.Filters;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.time.Duration;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.security.cert.X509Certificate;

/**
 * MongoDB Results Processor
 * 
 * This application connects to MongoDB and processes results from the airbnb_arena database.
 * It executes test methods for each exercise based on environment configuration.
 */
public class ResultsProcessor {
    
    private static final Logger logger = LoggerFactory.getLogger(ResultsProcessor.class);
    
    // Database and collection constants
    private static final String DB_NAME = "airbnb_arena";
    private static final String RESULTS_COLLECTION = "results";
    private static final String HEALTH_COLLECTION = "results_health";
    
    // Exercise test identifiers
    private static final List<String> EXERCISE_TESTS = Arrays.asList(
        "index",                      // CRUD: Indexes
        "crud-1", "crud-2", "crud-3", "crud-4",  // CRUD Exercises 1-4
        "crud-5", "crud-6", "crud-7", "crud-8",  // CRUD Exercises 5-8
        "pipeline-1",                 // Aggregation Exercise 1
        "search-index",               // Search: Indexes
        "search-1", "search-2",       // Search Exercises 1-2
        "vector-search-index",        // Vector Search: Indexes
        "vector-search-1"             // Vector Search Exercise 1
    );
    
    private MongoClient mongoClient;
    private MongoDatabase database;
    
    public ResultsProcessor() {
        // Initialize MongoDB connection
        String mongoUri = getEnvironmentVariable("MONGODB_URI");
        if (mongoUri == null || mongoUri.isEmpty()) {
            throw new RuntimeException("MONGODB_URI environment variable is required");
        }
        
        try {
            this.mongoClient = MongoClients.create(mongoUri);
            this.database = mongoClient.getDatabase(DB_NAME);
            logger.info("Connected to MongoDB database: {}", DB_NAME);
        } catch (Exception e) {
            logger.error("Failed to connect to MongoDB", e);
            throw new RuntimeException("MongoDB connection failed", e);
        }
    }
    
    /**
     * Main entry point of the application
     */
    public static void main(String[] args) {
        logger.info("Starting Results Processor application...");
        
        try {
            ResultsProcessor processor = new ResultsProcessor();
            processor.run();
        } catch (Exception e) {
            logger.error("Application failed to run", e);
            System.exit(1);
        }
        
        logger.info("Results Processor application completed successfully");
    }
    
    /**
     * Main execution method
     */
    public void run() {
        try {
            // Log health information
            logHealthInformation();
            
            // Execute all exercise tests
            executeExerciseTests();

        } catch (Exception e) {
            logger.error("Error during processing", e);
            throw e;
        } finally {
            // Close MongoDB connection
            if (mongoClient != null) {
                mongoClient.close();
                logger.info("MongoDB connection closed");
            }
        }
    }
    
    /**
     * Logs health information to the health collection
     */
    private void logHealthInformation() {
        try {
            MongoCollection<Document> healthCollection = database.getCollection(HEALTH_COLLECTION);
            
            // Create health document
            Document healthDoc = new Document();
            healthDoc.append("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            healthDoc.append("application", "results-processor");
            healthDoc.append("status", "running");
            healthDoc.append("database", DB_NAME);
            healthDoc.append("collections_accessed", Arrays.asList(RESULTS_COLLECTION, HEALTH_COLLECTION));
            
            // Add environment information
            Map<String, String> envInfo = new HashMap<>();
            envInfo.put("environment", getEnvironmentVariable("ENVIRONMENT"));
            envInfo.put("log_level", getEnvironmentVariable("LOG_LEVEL"));
            envInfo.put("service_name", getEnvironmentVariable("SERVICE_NAME"));
            healthDoc.append("environment_info", envInfo);
            
            // Insert health document
            healthCollection.insertOne(healthDoc);
            logger.info("Health information logged to {} collection", HEALTH_COLLECTION);
            
        } catch (Exception e) {
            logger.error("Failed to log health information", e);
            throw e;
        }
    }
    
    /**
     * Executes all exercise tests based on ENVIRONMENT variable
     */
    private void executeExerciseTests() {
        logger.info("Starting test execution for {} exercise tests", EXERCISE_TESTS.size());
        
        // Get service name and environment
        String environment = getEnvironmentVariable("ENVIRONMENT");
        String serviceName = getEnvironmentVariable("SERVICE_NAME");
        String currentUser = extractUsernameFromMongoUri();
        
        if (serviceName == null || serviceName.isEmpty()) {
            logger.error("SERVICE_NAME environment variable not configured. Cannot proceed with testing.");
            return;
        }
        
        // Check if service is available before running tests
        if (!checkServiceAvailability(serviceName)) {
            logger.error("Service {} is not available. Cannot proceed with testing.", serviceName);
            return;
        }
        
        logger.info("Executing tests for {} environment with service: {}", environment, serviceName);
        List<Document> testResults = executeTestsForEnvironment(serviceName, environment, currentUser);
        
        // Store results in MongoDB
        storeResults(testResults, currentUser);
        
        logger.info("Test execution completed. Executed {} tests for {} environment", 
            EXERCISE_TESTS.size(), environment);
    }
    
    /**
     * Executes all exercise tests for a specific environment using Java test methods
     */
    private List<Document> executeTestsForEnvironment(String serviceName, String environment, String user) {
        List<Document> testResults = new ArrayList<>();
        
        // Get existing results to check what's already passed
        Set<String> completedTests = getCompletedTests(user);
        
        for (String testName : EXERCISE_TESTS) {
            // Skip tests that have already been completed
            if (completedTests.contains(testName)) {
                logger.info("Test {} already completed for user {}, skipping", testName, user);
                continue;
            }
            
            Document testResult = executeTest(testName, serviceName, environment, user);
            
            // Only add successful test results
            if (testResult != null) {
                testResults.add(testResult);
            }
            
            // Small delay between tests
            try {
                Thread.sleep(500); // 500ms delay
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                logger.warn("Thread interrupted during test execution delay");
                break; // Exit if interrupted
            }
        }
        
        return testResults;
    }
    
    /**
     * Executes a single test using Java test methods
     */
    private Document executeTest(String testName, String serviceName, String environment, String user) {
        try {
            logger.info("Executing test: {}", testName);
            
            // Execute the specific test method based on test name
            boolean testSuccess = executeSpecificTest(testName, user);
            
            logger.info("Test {} {}", testName, testSuccess ? "passed" : "failed");
            
            // Only create result document if test passes (first time)
            if (testSuccess) {
                Document result = new Document();
                result.append("name", testName);
                result.append("username", user);
                result.append("timestamp", new Date());
                return result;
            }
            
        } catch (Exception e) {
            // Ignore errors as requested, but log them
            logger.warn("Failed to execute test {} (ignoring error): {}", testName, e.getMessage());
        }
        
        // Return null if test failed or had error - will be filtered out
        return null;
    }
    
    /**
     * Executes the specific test based on test name using separate test classes
     */
    private boolean executeSpecificTest(String testName, String user) {
        try {
            BaseTest test = createTest(testName, user);
            if (test != null) {
                return test.execute();
            } else {
                logger.warn("Unknown test: {}", testName);
                return false;
            }
        } catch (Exception e) {
            logger.warn("Test {} failed: {}", testName, e.getMessage());
            return false;
        }
    }
    
    /**
     * Creates the appropriate test instance based on test name
     */
    private BaseTest createTest(String testName, String user) {
        String serviceName = getEnvironmentVariable("SERVICE_NAME");
        MongoDatabase database = mongoClient.getDatabase(user);
        String endpoint = "api/listingsAndReviews";

        switch (testName) {
            case "index":
                return new IndexTest(database, serviceName, endpoint);
            case "crud-1":
                return new Crud1Test(database, serviceName, endpoint);
            case "crud-2":
                return new Crud2Test(database, serviceName, endpoint);
            case "crud-3":
                return new Crud3Test(database, serviceName, String.format("%s/distinct", endpoint));
            case "crud-4":
                return new Crud4Test(database, serviceName, String.format("%s/filter", endpoint));
            // case "crud-5":
            //     return new Crud5Test(database, serviceName, endpoint);
            // case "crud-6":
            //     return new Crud6Test(database, serviceName, endpoint);
            // case "crud-7":
            //     return new Crud7Test(database, serviceName, endpoint);
            // case "crud-8":
            //     return new Crud8Test(database, serviceName, endpoint);
            // case "pipeline-1":
            //     return new Pipeline1Test(database, serviceName, String.format("%s/statistics", endpoint));
            case "search-index":
                return new SearchIndexTest(database, serviceName, endpoint);
            // case "search-1":
            //     return new Search1Test(database, serviceName, String.format("%s/autocomplete", endpoint));
            // case "search-2":
            //     return new Search2Test(database, serviceName, String.format("%s/facet", endpoint));
            case "vector-search-index":
                return new VectorSearchIndexTest(database, serviceName, endpoint);
            // case "vector-search-1":
            //     return new VectorSearch1Test(database, serviceName, String.format("%s/vectorsearch", endpoint));
            default:
                return null;
        }
    }
    
    /**
     * Checks if the service is available by calling the whoami endpoint
     */
    private boolean checkServiceAvailability(String serviceName) {
        try {
            // Build the whoami endpoint URL - support both http and https
            String baseUrl;
            if (serviceName.startsWith("http://") || serviceName.startsWith("https://")) {
                baseUrl = serviceName;
            } else {
                // Default to https if no protocol specified
                baseUrl = "https://" + serviceName;
            }
            
            if (!baseUrl.endsWith("/")) {
                baseUrl += "/";
            }
            String whoamiUrl = baseUrl + "api/results/whoami";
            
            logger.info("Checking service availability at: {}", whoamiUrl);
            
            HttpClient.Builder clientBuilder = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10));
            
            // Only set SSL context for HTTPS URLs
            if (whoamiUrl.startsWith("https://")) {
                // Create trust-all SSL context to ignore certificate issues
                SSLContext sslContext = SSLContext.getInstance("TLS");
                sslContext.init(null, new TrustManager[] {
                    new X509TrustManager() {
                        public void checkClientTrusted(X509Certificate[] chain, String authType) {}
                        public void checkServerTrusted(X509Certificate[] chain, String authType) {}
                        public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[0]; }
                    }
                }, null);
                clientBuilder.sslContext(sslContext);
            }
            
            HttpClient client = clientBuilder.build();
                
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(whoamiUrl))
                .timeout(Duration.ofSeconds(30))
                .GET()
                .build();
                
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() == 200) {
                logger.info("Service is available. Response: {}", response.body());
                return true;
            } else {
                logger.warn("Service check failed with status code: {}", response.statusCode());
                return false;
            }
            
        } catch (Exception e) {
            logger.error("Failed to check service availability at {}: {}", serviceName, e.getMessage());
            return false;
        }
    }

    /**
     * Gets the set of test names that have already been completed for a user
     */
    private Set<String> getCompletedTests(String user) {
        Set<String> completedTests = new HashSet<>();
        
        try {
            MongoCollection<Document> resultsCollection = database.getCollection(RESULTS_COLLECTION);
            
            // Query for all results for this user
            for (Document result : resultsCollection.find(Filters.eq("username", user))) {
                String testName = result.getString("name");
                if (testName != null) {
                    completedTests.add(testName);
                }
            }
            
            logger.info("Found {} completed tests for user {}: {}", 
                completedTests.size(), user, completedTests);
            
        } catch (Exception e) {
            logger.error("Failed to get completed tests for user {}", user, e);
            // Return empty set on error - will run all tests
        }
        
        return completedTests;
    }

    /**
     * Stores results directly in the results collection
     */
    private void storeResults(List<Document> testResults, String user) {
        try {
            MongoCollection<Document> resultsCollection = database.getCollection(RESULTS_COLLECTION);
            
            // Store each result individually in the results collection
            for (Document result : testResults) {
                resultsCollection.insertOne(result);
            }
            
            logger.info("Stored {} new test results for user {}", testResults.size(), user);
            
        } catch (Exception e) {
            logger.error("Failed to store results", e);
            // Don't throw - we want to continue even if storage fails
        }
    }
    
    /**
     * Extracts the username from the MongoDB URI
     * @return the username from the URI, or "unknown" if parsing fails
     */
    private String extractUsernameFromMongoUri() {
        try {
            String mongoUri = System.getenv("MONGODB_URI");
            if (mongoUri == null || mongoUri.isEmpty()) {
                return "unknown";
            }
            
            // Parse the MongoDB URI
            // Format: mongodb+srv://username:password@cluster...
            if (mongoUri.startsWith("mongodb+srv://") || mongoUri.startsWith("mongodb://")) {
                // Find the start of credentials
                int credentialsStart = mongoUri.indexOf("://") + 3;
                int credentialsEnd = mongoUri.indexOf("@");
                
                if (credentialsStart > 2 && credentialsEnd > credentialsStart) {
                    String credentials = mongoUri.substring(credentialsStart, credentialsEnd);
                    
                    // Extract username (everything before the first colon)
                    int colonIndex = credentials.indexOf(":");
                    if (colonIndex > 0) {
                        return credentials.substring(0, colonIndex);
                    } else {
                        // No password, entire credentials string is username
                        return credentials;
                    }
                }
            }
            
            logger.warn("Could not extract username from MongoDB URI format");
            return "unknown";
            
        } catch (Exception e) {
            logger.error("Failed to extract username from MongoDB URI", e);
            return "unknown";
        }
    }
    
    /**
     * Helper method to get environment variables with participant name replacement
     */
    private String getEnvironmentVariable(String name) {
        String value = System.getenv(name);
        if (value == null || value.isEmpty()) {
            logger.warn("Environment variable {} is not set or empty", name);
            return value;
        }
        
        // Replace PARTICIPANT_NAME placeholder with actual username from MongoDB URI
        if (value.contains("PARTICIPANT_NAME")) {
            String username = extractUsernameFromMongoUri();
            value = value.replace("PARTICIPANT_NAME", username);
            logger.info("Replaced PARTICIPANT_NAME with '{}' in environment variable {}", username, name);
        }
        
        return value;
    }
}
