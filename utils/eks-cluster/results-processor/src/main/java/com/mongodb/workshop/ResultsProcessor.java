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
import java.nio.file.*;
import java.nio.file.StandardOpenOption;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Sorts;
import com.mongodb.client.model.ReplaceOptions;

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
    private static boolean participantNameLogged = false;
    
    // Database and collection constants
    private static final String DB_NAME = "airbnb_arena";
    private static final String RESULTS_COLLECTION = "results";
    private static final String HEALTH_COLLECTION = "results_health";
    
    // Exercise test identifiers
    private static final List<String> EXERCISE_TESTS = Arrays.asList(
        "crud-index",                      // CRUD: Indexes
        "crud-1", "crud-2", "crud-3", "crud-4",  // CRUD Exercises 1-4
        "crud-5", "crud-6", "crud-7", "crud-8",  // CRUD Exercises 5-8
        "pipeline-1",                 // Aggregation Exercise 1
        "pipeline-2",                 // Aggregation Exercise 2
        "search-index",               // Search: Indexes
        "search-1", "search-2",       // Search Exercises 1-2
        "vector-search-index",        // Vector Search: Indexes
        "vector-search-1"             // Vector Search Exercise 1
    );
    
    private MongoClient mongoClient;
    private MongoDatabase database;
    
    // Signal file constants (will be set from environment variables)
    private final String signalFilePath;
    private final String lastSignalFilePath;
    private final boolean isSignalMode;
    
    // Execution control
    private volatile boolean isExecuting = false;
    private volatile boolean pendingExecution = false;
    private final Object executionLock = new Object();
    
    private static final String SEPARATOR = "============================================================";
    private static final String STEP = "➡️ ";
    private static final String SUCCESS = "✅";
    private static final String FAIL = "❌";
    private static final String INFO = "ℹ️";
    private static final String WARNING = "⚠️";
    private static final String PARTY = "🎉";
    private static final String SIGNAL = "📡";
    
    public ResultsProcessor() {
        // Initialize signal mode configuration
        String signalDir = getEnvironmentVariable("SIGNAL_FILE_PATH");
        if (signalDir != null && !signalDir.isEmpty()) {
            this.signalFilePath = signalDir + "/server_restart_signal.txt";
            this.lastSignalFilePath = signalDir + "/last_processed_signal.txt";
            this.isSignalMode = true;
            logger.info("{} Signal mode enabled - watching for signals at: {}", SIGNAL, this.signalFilePath);
        } else {
            // When SIGNAL_FILE_PATH is empty or null, run in one-shot mode
            this.signalFilePath = null;
            this.lastSignalFilePath = null;
            this.isSignalMode = false;
            logger.info("{} SIGNAL_FILE_PATH is empty or null - running in one-shot mode", INFO);
        }
        
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
        logger.info("\n{}\n{} Starting Results Processor application... {}\n{}", SEPARATOR, PARTY, PARTY, SEPARATOR);
        
        try {
            ResultsProcessor processor = new ResultsProcessor();
            processor.run();
        } catch (Exception e) {
            logger.error("Application failed to run", e);
            System.exit(1);
        }
        
        logger.info("\n{}\n{} Results Processor application completed successfully {}\n{}", SEPARATOR, PARTY, PARTY, SEPARATOR);
    }
    
    /**
     * Main execution method - runs in either one-off or signal mode
     */
    public void run() {
        try {
            // Log health information
            logHealthInformation();
            
            if (isSignalMode) {
                logger.info("{} Running in signal mode - continuous operation with signal watching", SIGNAL);
                runSignalMode();
            } else {
                logger.info("{} Running in one-off mode - single execution", INFO);
                runOneOffMode();
            }

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
     * Runs in one-off mode - executes tests once and exits
     */
    private void runOneOffMode() {
        logger.info("{} Executing one-off test cycle", STEP);
        executeExerciseTests();
        logger.info("{} One-off execution completed", SUCCESS);
    }
    
    /**
     * Runs in signal mode - continuous operation with signal watching
     */
    private void runSignalMode() {
        // Check for immediate signal and run once if signal exists
        if (checkForServerRestartSignal()) {
            logger.info("{} Server restart signal detected - running immediate cycle", SIGNAL);
            handleTriggeredExecution("initial signal", true);
        }
        
        // Continue with hourly polling loop
        logger.info("{} Starting continuous polling mode (1-hour intervals)", INFO);
        runContinuousPolling();
    }
    
    /**
     * Runs continuous file watching with fallback polling
     */
    private void runContinuousPolling() {
        try {
            // Try to use file watching first
            if (watchSignalFile()) {
                return; // File watching worked, exit
            }
        } catch (Exception e) {
            logger.warn("File watching failed, falling back to polling: {}", e.getMessage());
        }
        
        // Fallback to traditional polling if file watching doesn't work
        runTraditionalPolling();
    }
    
    /**
     * Watches the signal file directory for changes using Java WatchService
     */
    private boolean watchSignalFile() {
        if (!isSignalMode || signalFilePath == null) {
            return false;
        }
        
        try {
            Path signalFile = Paths.get(signalFilePath);
            Path signalDir = signalFile.getParent();
            
            // Create directory if it doesn't exist
            if (!Files.exists(signalDir)) {
                Files.createDirectories(signalDir);
            }
            
            // Set up file watcher
            WatchService watchService = FileSystems.getDefault().newWatchService();
            signalDir.register(watchService, StandardWatchEventKinds.ENTRY_CREATE, 
                                          StandardWatchEventKinds.ENTRY_MODIFY);
            
            logger.info("{} Started file watching on directory: {}", SIGNAL, signalDir);
            
            // Initial check for existing signal
            if (checkForServerRestartSignal()) {
                logger.info("{} Found existing signal file on startup", SIGNAL);
                handleTriggeredExecution("startup signal", true);
            }
            
            // Watch for file changes
            while (true) {
                WatchKey key;
                try {
                    // Wait for file system events with timeout (1 hour)
                    key = watchService.poll(3600, TimeUnit.SECONDS);
                    
                    if (key == null) {
                        // Timeout - run regular polling cycle
                        logger.info("Running scheduled polling cycle at {}", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_TIME));
                        handleTriggeredExecution("scheduled timeout");
                        continue;
                    }
                    
                    // Process file system events
                    for (WatchEvent<?> event : key.pollEvents()) {
                        WatchEvent.Kind<?> kind = event.kind();
                        
                        if (kind == StandardWatchEventKinds.OVERFLOW) {
                            continue;
                        }
                        
                        @SuppressWarnings("unchecked")
                        WatchEvent<Path> ev = (WatchEvent<Path>) event;
                        Path filename = ev.context();
                        
                        // Check if this is our signal file
                        if (filename.toString().equals("server_restart_signal.txt")) {
                            logger.info("{} Signal file change detected: {} {}", SIGNAL, kind.name(), filename);
                            
                            // Small delay to ensure file write is complete
                            Thread.sleep(100);
                            
                            if (checkForServerRestartSignal()) {
                                logger.info("{} Server restart signal detected via file watching - triggering execution", SIGNAL);
                                handleTriggeredExecution("file watching", true);
                            }
                        }
                    }
                    
                    // Reset the key
                    boolean valid = key.reset();
                    if (!valid) {
                        logger.warn("Watch key no longer valid, exiting file watcher");
                        break;
                    }
                    
                } catch (InterruptedException e) {
                    logger.warn("File watching interrupted - shutting down gracefully");
                    Thread.currentThread().interrupt();
                    break;
                }
            }
            
            watchService.close();
            return true;
            
        } catch (IOException e) {
            logger.error("Failed to set up file watching: {}", e.getMessage());
            return false;
        } catch (Exception e) {
            logger.error("Unexpected error in file watching: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Traditional polling fallback method
     */
    private void runTraditionalPolling() {
        logger.info("{} Using traditional polling mode (1-hour intervals)", INFO);
        while (true) {
            try {
                // Check for server restart signal first
                if (checkForServerRestartSignal()) {
                    logger.info("{} Server restart signal detected during polling - triggering execution", SIGNAL);
                    handleTriggeredExecution("polling signal", true);
                }
                
                // Wait for 1 hour before next check
                Thread.sleep(3600000);
                
                // Run regular polling cycle
                logger.info("Running scheduled polling cycle at {}", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_TIME));
                handleTriggeredExecution("scheduled polling");
                
            } catch (InterruptedException e) {
                logger.warn("Polling interrupted - shutting down gracefully");
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                logger.error("Error in polling cycle: {}", e.getMessage());
                // Continue polling even if one cycle fails
                try {
                    Thread.sleep(5000); // Short delay before retrying
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
    }
    
    /**
     * Handles execution requests with concurrency control
     */
    private void handleTriggeredExecution(String trigger) {
        handleTriggeredExecution(trigger, false);
    }
    
    /**
     * Handles execution requests with concurrency control
     * @param trigger Description of what triggered this execution
     * @param isNewSignal Whether this execution was triggered by a new signal detection
     */
    private void handleTriggeredExecution(String trigger, boolean isNewSignal) {
        synchronized (executionLock) {
            if (isExecuting) {
                logger.info("{} Tests are currently running (triggered by {}), marking pending execution", WARNING, trigger);
                pendingExecution = true;
                return;
            }
            
            // Reset the last-execution.log file ONLY when processing a new signal
            if (isNewSignal) {
                resetLastExecutionLog();
            }
            
            logger.info("{} Starting test execution (triggered by {})", STEP, trigger);
            isExecuting = true;
        }
        
        try {
            executeExerciseTests();
            
            // Check if another execution was requested while we were running
            synchronized (executionLock) {
                if (pendingExecution) {
                    logger.info("{} Pending execution detected - running additional cycle", SIGNAL);
                    pendingExecution = false;
                    executeExerciseTests();
                }
            }
            
        } finally {
            synchronized (executionLock) {
                isExecuting = false;
                if (pendingExecution) {
                    // If there's still a pending execution, schedule it
                    logger.info("{} Scheduling pending execution", SIGNAL);
                    // Use a separate thread to avoid deep recursion
                    new Thread(() -> handleTriggeredExecution("pending", false)).start();
                }
            }
        }
    }
    
    /**
     * Resets the last-execution.log file by clearing its contents
     */
    private void resetLastExecutionLog() {
        try {
            String logPath = getEnvironmentVariable("LOG_PATH");
            if (logPath == null || logPath.isEmpty()) {
                logPath = "logs";
            }
            
            Path lastExecutionLogPath = Paths.get(logPath, "last-execution.log");
            
            // Create the logs directory if it doesn't exist
            Files.createDirectories(lastExecutionLogPath.getParent());
            
            // Clear the file by writing empty content (this effectively resets it)
            Files.writeString(lastExecutionLogPath, "", StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
            
            logger.info("{} Reset last-execution.log for new signal processing", SIGNAL);
            
        } catch (IOException e) {
            logger.warn("Failed to reset last-execution.log: {}", e.getMessage());
            // Continue execution even if log reset fails
        }
    }
    
    /**
     * Checks for server restart signal and returns true if a new signal is detected
     * Only works in signal mode
     */
    private boolean checkForServerRestartSignal() {
        if (!isSignalMode || signalFilePath == null) {
            return false;
        }
        
        try {
            Path signalFile = Paths.get(signalFilePath);
            
            // Check if signal file exists
            if (!Files.exists(signalFile)) {
                return false;
            }
            
            // Read the signal file
            String signalContent = Files.readString(signalFile);
            
            // Check if we've already processed this signal
            Path lastSignalFile = Paths.get(lastSignalFilePath);
            String lastProcessedSignal = "";
            
            if (Files.exists(lastSignalFile)) {
                lastProcessedSignal = Files.readString(lastSignalFile);
            }
            
            // If the signal content is different from last processed, we have a new signal
            if (!signalContent.equals(lastProcessedSignal)) {
                logger.info("{} New server restart signal detected", SIGNAL);
                logger.debug("Signal content: {}", signalContent);
                
                // Update the last processed signal
                Files.writeString(lastSignalFile, signalContent, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
                
                return true;
            }
            
            return false;
            
        } catch (IOException e) {
            logger.warn("Failed to check server restart signal: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Logs health information to the health collection
     */
    private void logHealthInformation() {
        try {
            String currentUser = extractUsernameFromMongoUri();
            MongoCollection<Document> healthCollection = database.getCollection(HEALTH_COLLECTION);
            
            // Create minimal health document for application startup
            Document healthDoc = new Document();
            healthDoc.append("_id", currentUser);
            
            // Add environment information
            Map<String, String> envInfo = new HashMap<>();
            envInfo.put("environment", getEnvironmentVariable("ENVIRONMENT"));
            envInfo.put("log_level", getEnvironmentVariable("LOG_LEVEL"));
            envInfo.put("service_name", getEnvironmentVariable("SERVICE_NAME"));
            healthDoc.append("environment_info", envInfo);
            
            // Initialize empty exercise results - will be updated after execution
            healthDoc.append("exercise_results", new ArrayList<>());
            healthDoc.append("execution_status", "started");
            
            // Upsert health document (replace if exists, insert if not)
            healthCollection.replaceOne(Filters.eq("_id", currentUser), healthDoc, 
                new ReplaceOptions().upsert(true));
            logger.info("Health information logged to {} collection for user {}", HEALTH_COLLECTION, currentUser);
            
        } catch (Exception e) {
            logger.error("Failed to log health information", e);
            throw e;
        }
    }
    
    /**
     * Updates health information with exercise results and failure reasons
     */
    private void updateHealthWithExerciseResults(Map<String, ExerciseResult> exerciseResults) {
        try {
            String currentUser = extractUsernameFromMongoUri();
            MongoCollection<Document> healthCollection = database.getCollection(HEALTH_COLLECTION);
            
            // Convert exercise results to documents
            List<Document> exerciseResultDocs = new ArrayList<>();
            for (Map.Entry<String, ExerciseResult> entry : exerciseResults.entrySet()) {
                Document resultDoc = new Document();
                resultDoc.append("exercise_name", entry.getKey());
                resultDoc.append("passed", entry.getValue().isPassed());
                if (!entry.getValue().isPassed() && entry.getValue().getFailureReason() != null) {
                    resultDoc.append("failure_reason", entry.getValue().getFailureReason());
                }
                exerciseResultDocs.add(resultDoc);
            }
            
            // Update the health document with exercise results
            Document update = new Document("$set", new Document()
                .append("exercise_results", exerciseResultDocs)
                .append("execution_status", "completed")
                .append("last_updated", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .append("total_exercises", exerciseResults.size())
                .append("passed_exercises", exerciseResults.values().stream().mapToInt(r -> r.isPassed() ? 1 : 0).sum()));
            
            healthCollection.updateOne(Filters.eq("_id", currentUser), update);
            logger.info("Updated health information with exercise results for user {}", currentUser);
            
        } catch (Exception e) {
            logger.error("Failed to update health information with exercise results", e);
            // Don't throw - we want to continue even if health update fails
        }
    }
    
    /**
     * Executes all exercise tests based on scenario configuration from MongoDB
     */
    private void executeExerciseTests() {
        // Get the exercise list from scenario_config collection or fallback to hardcoded list
        List<String> exercisesToTest = getExerciseListFromConfig();
        
        logger.info("\n{}\n{} Starting test execution for {} exercises \n{}", SEPARATOR, STEP, exercisesToTest.size(), SEPARATOR);
        
        // Get service name and environment
        String environment = getEnvironmentVariable("ENVIRONMENT");
        String serviceName = getEnvironmentVariable("SERVICE_NAME");
        String currentUser = extractUsernameFromMongoUri();
        
        if (serviceName == null || serviceName.isEmpty()) {
            logger.error("SERVICE_NAME environment variable not configured. Cannot proceed with testing.");
            // Update health with error status
            Map<String, ExerciseResult> errorResults = new HashMap<>();
            for (String testName : exercisesToTest) {
                errorResults.put(testName, new ExerciseResult(false, "SERVICE_NAME not configured"));
            }
            updateHealthWithExerciseResults(errorResults);
            return;
        }
        
        // Check if service is available before running tests
        if (!checkServiceAvailability(serviceName)) {
            logger.error("Service {} is not available. Cannot proceed with testing.", serviceName);
            // Update health with service unavailable status
            Map<String, ExerciseResult> errorResults = new HashMap<>();
            for (String testName : exercisesToTest) {
                errorResults.put(testName, new ExerciseResult(false, "Service not available: " + serviceName));
            }
            updateHealthWithExerciseResults(errorResults);
            return;
        }
        
        logger.info("Executing tests for {} environment with service: {}", environment, serviceName);
        
        // Execute tests and collect both regular results and exercise results
        Map<String, ExerciseResult> exerciseResults = new HashMap<>();
        List<Document> testResults = executeTestsForEnvironment(exercisesToTest, serviceName, environment, currentUser, exerciseResults);
        
        // Store results in MongoDB
        storeResults(testResults, currentUser);
        
        // Update health collection with exercise results
        updateHealthWithExerciseResults(exerciseResults);

        int totalTests = exercisesToTest.size();
        int passedTests = getCompletedTests(currentUser).size();

        logger.info("{} Summary: Total tests: {}, Passed tests: {}", INFO, totalTests, passedTests);

        if (passedTests == totalTests) {
            logger.info("\n{}\n{} Congratulations! All tests passed! {}\n{}", SEPARATOR, PARTY, PARTY, SEPARATOR);
        } else {
            logger.info("{} Some tests are still pending. Keep going!", WARNING);
        }

        logger.info("{} Test execution completed. Executed {} tests for {} environment", SUCCESS, exercisesToTest.size(), environment);
    }
    
    /**
     * Executes all exercise tests for a specific environment using Java test methods
     */
    private List<Document> executeTestsForEnvironment(List<String> exerciseTests, String serviceName, String environment, String user, Map<String, ExerciseResult> exerciseResults) {
        List<Document> testResults = new ArrayList<>();
        
        // Get existing results to check what's already passed
        Set<String> completedTests = getCompletedTests(user);
        
        for (String testName : exerciseTests) {
            // Check if test was already completed
            if (completedTests.contains(testName)) {
                logger.info("Test {} already completed for user {}, marking as passed", testName, user);
                exerciseResults.put(testName, new ExerciseResult(true, null));
                continue;
            }
            
            Document testResult = executeTest(testName, serviceName, environment, user, exerciseResults);
            
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
     * Gets the exercise list from scenario_config collection or falls back to hardcoded list
     */
    private List<String> getExerciseListFromConfig() {
        try {
            MongoCollection<Document> scenarioCollection = database.getCollection("scenario_config");
            
            // Find the scenario configuration document
            Document scenarioDoc = scenarioCollection.find().first();
            
            if (scenarioDoc != null) {
                Document neededAnswerFiles = scenarioDoc.get("needed_answer_files", Document.class);
                if (neededAnswerFiles != null) {
                    Document analysis = neededAnswerFiles.get("analysis", Document.class);
                    if (analysis != null) {
                        @SuppressWarnings("unchecked")
                        List<String> listedExercises = analysis.get("listed_exercises", List.class);
                        if (listedExercises != null && !listedExercises.isEmpty()) {
                            logger.info("{} Using exercise list from scenario_config: {}", INFO, listedExercises);
                            return new ArrayList<>(listedExercises);
                        }
                    }
                }
            }
            
            logger.info("{} No exercises found in scenario_config, falling back to hardcoded list", WARNING);
            
        } catch (Exception e) {
            logger.warn("{} Failed to fetch exercises from scenario_config, using fallback: {}", WARNING, e.getMessage());
        }
        
        // Fallback to hardcoded exercise list
        logger.info("{} Using fallback hardcoded exercise list: {}", INFO, EXERCISE_TESTS);
        return new ArrayList<>(EXERCISE_TESTS);
    }
    
    /**
     * Executes a single test using Java test methods
     */
    private Document executeTest(String testName, String serviceName, String environment, String user, Map<String, ExerciseResult> exerciseResults) {
        String failureReason = null;
        boolean testSuccess = false;
        
        try {
            logger.info("{} Executing test: {}", STEP, testName);
            
            // Execute the specific test method based on test name
            testSuccess = executeSpecificTest(testName, user);
            
            logger.info("{} Test {} {}", testSuccess ? SUCCESS : FAIL, testName, testSuccess ? "passed" : "failed");
            
            // Record the exercise result
            if (testSuccess) {
                exerciseResults.put(testName, new ExerciseResult(true, null));
                
                // Only create result document if test passes (first time)
                Document result = new Document();
                result.append("name", testName);
                result.append("username", user);
                result.append("timestamp", new Date());
                return result;
            } else {
                failureReason = "Test execution returned false";
                exerciseResults.put(testName, new ExerciseResult(false, failureReason));
            }
            
        } catch (Exception e) {
            // Capture the exception as failure reason
            failureReason = e.getMessage();
            if (failureReason == null || failureReason.isEmpty()) {
                failureReason = e.getClass().getSimpleName();
            }
            
            // Record the exercise result with failure reason
            exerciseResults.put(testName, new ExerciseResult(false, failureReason));
            
            // Log the error
            logger.warn("{} Failed to execute test {} (error): {}", WARNING, testName, failureReason);
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
            case "crud-index":
                return new IndexTest(database, serviceName, endpoint);
            case "crud-1":
                return new Crud1Test(database, serviceName, endpoint);
            case "crud-2":
                return new Crud2Test(database, serviceName, endpoint);
            case "crud-3":
                return new Crud3Test(database, serviceName, String.format("%s/distinct", endpoint));
            case "crud-4":
                return new Crud4Test(database, serviceName, String.format("%s/filter", endpoint));
            case "crud-5":
                return new Crud5Test(database, serviceName, endpoint);
            case "crud-6":
                return new Crud6Test(database, serviceName, endpoint);
            case "crud-7":
                return new Crud7Test(database, serviceName, endpoint);
            case "crud-8":
                return new Crud8Test(database, serviceName, endpoint);
            case "pipeline-1":
                return new Pipeline1Test(database, serviceName, String.format("%s/statistics", endpoint));
            case "pipeline-2":
                return new Pipeline2Test(database, serviceName, String.format("%s/hostAnalytics", endpoint));
            case "search-index":
                return new SearchIndexTest(database, serviceName, endpoint);
            case "search-1":
                return new Search1Test(database, serviceName, String.format("%s/autocomplete", endpoint));
            case "search-2":
                return new Search2Test(database, serviceName, String.format("%s/facet", endpoint));
            case "vector-search-index":
                return new VectorSearchIndexTest(database, serviceName, endpoint);
            case "vector-search-1":
                return new VectorSearch1Test(database, serviceName, String.format("%s/vectorsearch", endpoint));
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
                .header("User-Agent", "ResultsProcessor/1.0.0")
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
        Set<String> completedTests = new LinkedHashSet<>();
        
        try {
            MongoCollection<Document> resultsCollection = database.getCollection(RESULTS_COLLECTION);
            
            // Query for all results for this user
            for (Document result : resultsCollection.find(Filters.eq("username", user)).sort(Sorts.ascending("name"))) {
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
     * Uses sensible defaults if not set.
     */
    private String getEnvironmentVariable(String name) {
        String value = System.getenv(name);

        // Provide sensible defaults if not set
        if (value == null || value.isEmpty()) {
            switch (name) {
                case "SERVICE_NAME":
                    value = "http://localhost:5000";
                    break;
                case "ENVIRONMENT":
                    value = "prod";
                    break;
                case "LOG_LEVEL":
                    value = "INFO";
                    break;
                case "DATABASE_NAME":
                    value = "unknown";
                    break;
                default:
                    logger.warn("Environment variable {} is not set or empty", name);
                    return value;
            }
            logger.info("Using default value for {}: {}", name, value);
        }

        // Replace PARTICIPANT_NAME placeholder with actual username from MongoDB URI
        if (value.contains("PARTICIPANT_NAME")) {
            String username = extractUsernameFromMongoUri();
            value = value.replace("PARTICIPANT_NAME", username);
            if (!participantNameLogged) {
                logger.info("Replaced PARTICIPANT_NAME with '{}' in environment variable SERVICE_NAME", username);
                participantNameLogged = true;
            }
        }

        return value;
    }
    
    /**
     * Helper class to store exercise test results with failure reasons
     */
    private static class ExerciseResult {
        private final boolean passed;
        private final String failureReason;
        
        public ExerciseResult(boolean passed, String failureReason) {
            this.passed = passed;
            this.failureReason = failureReason;
        }
        
        public boolean isPassed() {
            return passed;
        }
        
        public String getFailureReason() {
            return failureReason;
        }
    }
}
