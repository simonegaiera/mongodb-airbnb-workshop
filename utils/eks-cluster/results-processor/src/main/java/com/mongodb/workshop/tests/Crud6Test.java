package com.mongodb.workshop.tests;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import java.net.http.HttpResponse;

import org.bson.Document;
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
            MongoCollection<Document> collection = getListingsAndReviewsCollection();

            // Perform the query
            Document query = new Document();
            Document item = collection.find(query).first();
            String itemId = item.get("_id").toString();

            // Concatenate itemId to the endpoint URL
            String itemEndpoint = endpoint.endsWith("/") ? endpoint + itemId : endpoint + "/" + itemId;

            // Test the crud-6 endpoint with update parameters
            Map<String, Object> requestBody = createRequestBody();
            requestBody.put("key", "accommodates");
            requestBody.put("value", 9);

            HttpResponse<String> response = makeLabRequest(itemEndpoint, requestBody, "PATCH");
            
            if (response.statusCode() != 201) {
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

            Document checkQuery = new Document("_id", itemId);
            Document updatedItem = collection.find(checkQuery).first();

            if (updatedItem == null) {
                logger.warn("CRUD-6 test failed: Updated document not found");
                return false;
            }

            // Verify the updated field
            if (!updatedItem.containsKey("accommodates") || updatedItem.getInteger("accommodates") != 9) {
                logger.warn("CRUD-6 test failed: Document field not updated correctly");
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
