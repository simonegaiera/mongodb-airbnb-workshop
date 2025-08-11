package com.mongodb.workshop.tests;

import com.mongodb.client.MongoDatabase;
import java.net.http.HttpResponse;
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
    public boolean execute() {
        logger.info("Executing CRUD-7 test - Testing crudAddToArray function");
        
        try {
            // Create a test review object
            Map<String, Object> testReview = createRequestBody();
            testReview.put("reviewer_name", "Test Reviewer");
            testReview.put("date", "2024-01-01");
            testReview.put("listing_id", "10006546");
            testReview.put("reviewer_id", "test_reviewer_" + System.currentTimeMillis());
            testReview.put("comments", "This is a test review for CRUD-7");
            
            // Test the crud-7 endpoint
            Map<String, Object> requestBody = createRequestBody();
            requestBody.put("id", "10006546"); // Known document ID
            requestBody.put("review", testReview);
            
            HttpResponse<String> response = makeLabRequest(endpoint, requestBody);
            
            if (response.statusCode() != 200) {
                logger.warn("CRUD-7 test failed: HTTP status {}", response.statusCode());
                return false;
            }
            
            // Parse response as JSON object (update result)
            JSONObject result = parseJsonResponse(response.body());
            
            // Validate the update result
            if (result == null || result.length() == 0) {
                logger.warn("CRUD-7 test failed: No update result returned");
                return false;
            }
            
            // Check if the result indicates successful update
            if (!result.has("acknowledged") || !result.getBoolean("acknowledged")) {
                logger.warn("CRUD-7 test failed: Update not acknowledged");
                return false;
            }
            
            // Check if matchedCount is present and > 0
            if (!result.has("matchedCount") || result.getInt("matchedCount") == 0) {
                logger.warn("CRUD-7 test failed: No documents matched for update");
                return false;
            }
            
            // Check if modifiedCount is present and > 0
            if (!result.has("modifiedCount") || result.getInt("modifiedCount") == 0) {
                logger.warn("CRUD-7 test failed: No documents were modified");
                return false;
            }
            
            logger.info("CRUD-7 test passed: Successfully added review and updated {} document(s)", result.getInt("modifiedCount"));
            return true;
            
        } catch (Exception e) {
            logger.error("CRUD-7 test failed with exception: {}", e.getMessage());
            return false;
        }
    }
}
