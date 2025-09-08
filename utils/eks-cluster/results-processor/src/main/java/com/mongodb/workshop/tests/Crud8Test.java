package com.mongodb.workshop.tests;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import java.net.http.HttpResponse;

import org.bson.Document;
import org.json.JSONObject;

/**
 * Test for: crud-8 (CRUD Exercise 8)
 * Tests the crudDelete function implementation
 * Expected: Function should delete a document by _id
 */
public class Crud8Test extends BaseTest {
    
    public Crud8Test(MongoDatabase database, String serviceName, String endpoint) {
        super(database, serviceName, endpoint);
    }
    
    @Override
    public String getTestName() {
        return "crud-8";
    }
    
    @Override
    public TestResult execute() {
        logger.info("Executing CRUD-8 test - Testing crudDelete function");
        
        String testId = "test-crud-8-" + System.currentTimeMillis();
        MongoCollection<Document> collection = getListingsAndReviewsCollection();
        
        try {
            // Step 1: Create a dummy listing directly in MongoDB
            logger.info("Creating dummy listing with ID: {}", testId);
            Document dummyListing = createDummyListing(testId);
            collection.insertOne(dummyListing);
            logger.info("Dummy listing created successfully");
            
            // Verify the document was created
            Document createdDoc = collection.find(new Document("_id", testId)).first();
            if (createdDoc == null) {
                String errorMessage = "Failed to create test document in MongoDB - check database connection and write permissions";
                logger.error("CRUD-8 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Step 2: Test the delete API endpoint
            logger.info("Testing delete API endpoint for ID: {}", testId);
            String deleteEndpoint = endpoint.endsWith("/") ? endpoint + testId : endpoint + "/" + testId;
            
            HttpResponse<String> response = makeLabRequest(deleteEndpoint, null, "DELETE");
            
            if (response.statusCode() != 202) {
                String errorMessage = String.format("HTTP request failed with status %d - expected 202 for DELETE request, check if your crudDelete endpoint is implemented correctly", response.statusCode());
                logger.warn("CRUD-8 test failed: {}", errorMessage);
                logger.warn("Response body: {}", response.body());
                
                // Clean up: ensure the test document is deleted
                cleanupTestDocument(collection, testId);
                return TestResult.failure(errorMessage);
            }
            
            // Parse response as JSON object (delete result)
            JSONObject result;
            try {
                result = parseJsonResponse(response.body());
                logger.debug("Delete API response: {}", result.toString());
            } catch (Exception e) {
                String errorMessage = String.format("Failed to parse API response as JSON object - expected delete result object but got: %s", response.body());
                logger.warn("CRUD-8 test failed: {}", errorMessage);
                cleanupTestDocument(collection, testId);
                return TestResult.failure(errorMessage);
            }
            
            // Validate the delete result
            if (result == null || result.length() == 0) {
                String errorMessage = "API returned empty response - check if your crudDelete function returns the MongoDB delete result";
                logger.warn("CRUD-8 test failed: {}", errorMessage);
                cleanupTestDocument(collection, testId);
                return TestResult.failure(errorMessage);
            }
            
            // Check if the result indicates successful operation
            if (!result.has("acknowledged") || !result.getBoolean("acknowledged")) {
                String errorMessage = "Delete operation not acknowledged - check if your crudDelete function properly deletes the document and returns the result";
                logger.warn("CRUD-8 test failed: {}", errorMessage);
                cleanupTestDocument(collection, testId);
                return TestResult.failure(errorMessage);
            }
            
            // Check if deletedCount is present
            if (!result.has("deletedCount")) {
                String errorMessage = "Delete result missing 'deletedCount' field - check if your crudDelete function returns the complete MongoDB delete result";
                logger.warn("CRUD-8 test failed: {}", errorMessage);
                cleanupTestDocument(collection, testId);
                return TestResult.failure(errorMessage);
            }
            
            int deletedCount = result.getInt("deletedCount");
            
            // For our test document that exists, deletedCount should be 1
            if (deletedCount != 1) {
                String errorMessage = String.format("Expected exactly 1 document to be deleted but got deletedCount=%d - check if your crudDelete function targets the correct document", deletedCount);
                logger.warn("CRUD-8 test failed: {}", errorMessage);
                cleanupTestDocument(collection, testId);
                return TestResult.failure(errorMessage);
            }
            
            // Step 3: Verify the document was actually deleted from MongoDB
            Document deletedDoc = collection.find(new Document("_id", testId)).first();
            if (deletedDoc != null) {
                String errorMessage = "Document still exists in database after delete operation - check if your crudDelete function properly removes the document from the collection";
                logger.warn("CRUD-8 test failed: {}", errorMessage);
                cleanupTestDocument(collection, testId);
                return TestResult.failure(errorMessage);
            }
            
            logger.info("CRUD-8 test passed: Delete operation completed successfully, deleted {} document(s)", deletedCount);
            return TestResult.success();
            
        } catch (Exception e) {
            String errorMessage = String.format("Test execution failed with exception: %s - check your crudDelete function implementation and database connection", e.getMessage());
            logger.error("CRUD-8 test failed: {}", errorMessage);
            // Clean up: ensure the test document is deleted
            cleanupTestDocument(collection, testId);
            return TestResult.failure(errorMessage);
        }
    }
    
    /**
     * Creates a dummy listing document for testing
     */
    private Document createDummyListing(String testId) {
        Document listing = new Document();
        listing.put("_id", testId);
        listing.put("name", "Test Listing for CRUD-8");
        listing.put("description", "This is a test listing created for CRUD-8 delete testing");
        listing.put("property_type", "Apartment");
        listing.put("room_type", "Entire home/apt");
        listing.put("accommodates", 2);
        listing.put("bedrooms", 1);
        listing.put("beds", 1);
        listing.put("bathrooms", 1.0);
        listing.put("price", 100.0);
        listing.put("minimum_nights", 1);
        listing.put("maximum_nights", 30);
        listing.put("availability_365", 365);
        
        return listing;
    }
    
    /**
     * Cleanup method to ensure test document is deleted
     */
    private void cleanupTestDocument(MongoCollection<Document> collection, String testId) {
        try {
            logger.info("Cleaning up test document with ID: {}", testId);
            collection.deleteOne(new Document("_id", testId));
            logger.info("Test document cleanup completed");
        } catch (Exception e) {
            logger.error("Failed to cleanup test document: {}", e.getMessage());
        }
    }
}
