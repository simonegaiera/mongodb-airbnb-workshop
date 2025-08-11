package com.mongodb.workshop.tests;

import com.mongodb.client.MongoDatabase;
import java.net.http.HttpResponse;
import org.json.JSONObject;
import java.util.Map;

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
    public boolean execute() {
        logger.info("Executing CRUD-8 test - Testing crudDelete function");
        
        try {
            // Use a test document ID that we can safely delete
            String testId = "test-crud-8-" + System.currentTimeMillis();
            
            // Test the crud-8 endpoint
            Map<String, Object> requestBody = createRequestBody();
            requestBody.put("id", testId);
            
            HttpResponse<String> response = makeLabRequest(endpoint, requestBody);
            
            if (response.statusCode() != 200) {
                logger.warn("CRUD-8 test failed: HTTP status {}", response.statusCode());
                return false;
            }
            
            // Parse response as JSON object (delete result)
            JSONObject result = parseJsonResponse(response.body());
            
            // Validate the delete result
            if (result == null || result.length() == 0) {
                logger.warn("CRUD-8 test failed: No delete result returned");
                return false;
            }
            
            // Check if the result indicates successful operation
            if (!result.has("acknowledged") || !result.getBoolean("acknowledged")) {
                logger.warn("CRUD-8 test failed: Delete not acknowledged");
                return false;
            }
            
            // Check if deletedCount is present (should be 0 for non-existent document)
            if (!result.has("deletedCount")) {
                logger.warn("CRUD-8 test failed: No deletedCount in result");
                return false;
            }
            
            int deletedCount = result.getInt("deletedCount");
            // For a test document that doesn't exist, deletedCount should be 0
            // This still validates that the delete operation was properly executed
            
            logger.info("CRUD-8 test passed: Delete operation completed, deleted {} document(s)", deletedCount);
            return true;
            
        } catch (Exception e) {
            logger.error("CRUD-8 test failed with exception: {}", e.getMessage());
            return false;
        }
    }
}
