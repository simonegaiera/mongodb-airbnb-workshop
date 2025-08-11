package com.mongodb.workshop.tests;

import com.mongodb.client.MongoDatabase;
import java.net.http.HttpResponse;
import org.json.JSONObject;
import java.util.Map;

/**
 * Test for: crud-6 (CRUD Exercise 6)
 * Tests the crudUpdateElement function implementation
 * Expected: Function should update a document field using $set operator
 */
public class Crud6Test extends BaseTest {
    
    public Crud6Test(MongoDatabase database, String serviceName, String endpoint) {
        super(database, serviceName, endpoint);
    }
    
    @Override
    public String getTestName() {
        return "crud-6";
    }
    
    @Override
    public boolean execute() {
        logger.info("Executing CRUD-6 test - Testing crudUpdateElement function");
        
        try {
            // Test the crud-6 endpoint with update parameters
            Map<String, Object> requestBody = createRequestBody();
            requestBody.put("id", "10006546"); // Known document ID
            requestBody.put("key", "test_field");
            requestBody.put("value", "test_value_" + System.currentTimeMillis());
            
            HttpResponse<String> response = makeLabRequest(endpoint, requestBody);
            
            if (response.statusCode() != 200) {
                logger.warn("CRUD-6 test failed: HTTP status {}", response.statusCode());
                return false;
            }
            
            // Parse response as JSON object (update result)
            JSONObject result = parseJsonResponse(response.body());
            
            // Validate the update result
            if (result == null || result.length() == 0) {
                logger.warn("CRUD-6 test failed: No update result returned");
                return false;
            }
            
            // Check if the result indicates successful update
            if (!result.has("acknowledged") || !result.getBoolean("acknowledged")) {
                logger.warn("CRUD-6 test failed: Update not acknowledged");
                return false;
            }
            
            // Check if matchedCount is present and > 0
            if (!result.has("matchedCount") || result.getInt("matchedCount") == 0) {
                logger.warn("CRUD-6 test failed: No documents matched for update");
                return false;
            }
            
            // Check if modifiedCount is present and > 0
            if (!result.has("modifiedCount") || result.getInt("modifiedCount") == 0) {
                logger.warn("CRUD-6 test failed: No documents were modified");
                return false;
            }
            
            logger.info("CRUD-6 test passed: Successfully updated {} document(s)", result.getInt("modifiedCount"));
            return true;
            
        } catch (Exception e) {
            logger.error("CRUD-6 test failed with exception: {}", e.getMessage());
            return false;
        }
    }
}
