package com.mongodb.workshop.tests;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import java.net.http.HttpResponse;

import org.bson.Document;
import org.json.JSONObject;
import java.util.Map;

/**
 * Test for: crud-7 (CRUD Exercise 7)
 * Tests the crudAddToArray function implementation
 * Expected: Function should add review to array and increment number_of_reviews
 */
public class Crud7Test extends BaseTest {
    
    public Crud7Test(MongoDatabase database, String serviceName, String endpoint) {
        super(database, serviceName, endpoint);
    }
    
    @Override
    public String getTestName() {
        return "crud-7";
    }
    
    @Override
    public TestResult execute() {
        logger.info("Executing CRUD-7 test - Testing crudAddToArray function");
        
        try {
            MongoCollection<Document> collection = getListingsAndReviewsCollection();

            // Perform the query
            Document query = new Document();
            Document item = collection.find(query).first();
            String itemId = item.get("_id").toString();

            // Concatenate itemId and "reviews" to the endpoint URL
            String itemEndpoint = endpoint.endsWith("/") ? endpoint + itemId + "/reviews" : endpoint + "/" + itemId + "/reviews";

            // Create a test review object
            Map<String, Object> testReview = createRequestBody();
            testReview.put("reviewer_name", "Test Reviewer");
            testReview.put("date", "2024-01-01");
            testReview.put("listing_id", "10006546");
            testReview.put("reviewer_id", "test_reviewer_" + System.currentTimeMillis());
            testReview.put("comments", "This is a test review for CRUD-7");
            
            // Test the crud-7 endpoint
            Map<String, Object> requestBody = createRequestBody();
            requestBody.put("review", testReview);

            HttpResponse<String> response = makeLabRequest(itemEndpoint, requestBody);
            
            if (response.statusCode() != 201) {
                String errorMessage = String.format("HTTP request failed with status %d - expected 201 for PATCH request, check if your crudAddToArray endpoint is implemented correctly", response.statusCode());
                logger.warn("CRUD-7 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Parse response as JSON object (update result)
            JSONObject result;
            try {
                result = parseJsonResponse(response.body());
            } catch (Exception e) {
                String errorMessage = String.format("Failed to parse API response as JSON object - expected update result object but got: %s", response.body());
                logger.warn("CRUD-7 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Validate the update result
            if (result == null || result.length() == 0) {
                String errorMessage = "API returned empty response - check if your crudAddToArray function returns the MongoDB update result";
                logger.warn("CRUD-7 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Check if the result indicates successful update
            if (!result.has("acknowledged") || !result.getBoolean("acknowledged")) {
                String errorMessage = "Update operation not acknowledged - check if your crudAddToArray function properly updates the document and returns the result";
                logger.warn("CRUD-7 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Check if matchedCount is present and > 0
            if (!result.has("matchedCount") || result.getInt("matchedCount") == 0) {
                String errorMessage = "No documents matched for update - check if your crudAddToArray function uses the correct document ID in the update query";
                logger.warn("CRUD-7 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Check if modifiedCount is present and > 0
            if (!result.has("modifiedCount") || result.getInt("modifiedCount") == 0) {
                String errorMessage = "No documents were modified - check if your crudAddToArray function properly applies the $push operation to add reviews";
                logger.warn("CRUD-7 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            logger.info("CRUD-7 test passed: Successfully added review and updated {} document(s)", result.getInt("modifiedCount"));
            return TestResult.success();
            
        } catch (Exception e) {
            String errorMessage = String.format("Test execution failed with exception: %s - check your crudAddToArray function implementation and database connection", e.getMessage());
            logger.error("CRUD-7 test failed: {}", errorMessage);
            return TestResult.failure(errorMessage);
        }
    }
}
