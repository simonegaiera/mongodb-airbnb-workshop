package com.mongodb.workshop.tests;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import java.net.http.HttpResponse;

import org.bson.Document;
import org.json.JSONObject;
import java.util.Map;

/**
 * Test for: crud-5 (CRUD Exercise 5)
 * Tests the crudCreateItem function implementation
 * Expected: Function should insert a new document and return insert result
 */
public class Crud5Test extends BaseTest {
    
    public Crud5Test(MongoDatabase database, String serviceName, String endpoint) {
        super(database, serviceName, endpoint);
    }
    
    @Override
    public String getTestName() {
        return "crud-5";
    }
    
    @Override
    public boolean execute() {
        logger.info("Executing CRUD-5 test - Testing crudCreateItem function");
        
        try {
            // Create a test item to insert
            Map<String, Object> testItem = createRequestBody();
            testItem.put("_id", "test-crud-5-" + System.currentTimeMillis());
            testItem.put("name", "Test Property for CRUD-5");
            testItem.put("property_type", "Apartment");
            testItem.put("bedrooms", 2);
            testItem.put("beds", 2);
            testItem.put("bathrooms", 1);
            testItem.put("amenities", new String[]{"WiFi", "Kitchen"});
            
            Map<String, Object> requestBody = createRequestBody();
            requestBody.put("item", testItem);
            
            HttpResponse<String> response = makeLabRequest(endpoint, requestBody);
            
            if (response.statusCode() != 201) {
                logger.warn("CRUD-5 test failed: HTTP status {}", response.statusCode());
                return false;
            }
            
            // Parse response as JSON object (insert result)
            JSONObject result = parseJsonResponse(response.body());
            
            // Validate the insert result
            if (result == null || result.length() == 0) {
                logger.warn("CRUD-5 test failed: No insert result returned");
                return false;
            }
            
            // Check if the result indicates successful insertion
            if (!result.has("acknowledged") || !result.getBoolean("acknowledged")) {
                logger.warn("CRUD-5 test failed: Insert not acknowledged");
                return false;
            }
            
            // Check if insertedId is present
            if (!result.has("insertedId")) {
                logger.warn("CRUD-5 test failed: No insertedId in result");
                return false;
            }
            
            String insertedId = result.getString("insertedId");
            if (insertedId == null || insertedId.isEmpty()) {
                logger.warn("CRUD-5 test failed: Empty insertedId");
                return false;
            }

            MongoCollection<Document> collection = getListingsAndReviewsCollection();
            collection.deleteOne(new Document("_id", insertedId));
            
            logger.info("CRUD-5 test passed: Successfully inserted document with _id '{}'", insertedId);
            return true;
            
        } catch (Exception e) {
            logger.error("CRUD-5 test failed with exception: {}", e.getMessage());
            return false;
        }
    }
}
