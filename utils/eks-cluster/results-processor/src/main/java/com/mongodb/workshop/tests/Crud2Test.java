package com.mongodb.workshop.tests;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import java.net.http.HttpResponse;

import org.bson.Document;
import org.json.JSONObject;

/**
 * Test for: crud-2 (CRUD Exercise 2)
 * Tests the crudOneDocument function implementation
 * Expected: Function should find a single document by _id
 */
public class Crud2Test extends BaseTest {
    
    public Crud2Test(MongoDatabase database, String serviceName, String endpoint) {
        super(database, serviceName, endpoint);
    }
    
    @Override
    public String getTestName() {
        return "crud-2";
    }
    
    @Override
    public boolean execute() {
        logger.info("Executing CRUD-2 test - Testing crudOneDocument function");
        
        try {
            MongoCollection<Document> collection = getListingsAndReviewsCollection();

            // Perform the query
            Document query = new Document();
            Document item = collection.find(query).first();

            if (item == null || !item.containsKey("_id")) {
                logger.warn("No document found or missing _id");
                return false;
            }

            String itemId = item.get("_id").toString();
            String urlWithId = String.format("%s/%s", endpoint, itemId);

            HttpResponse<String> response = makeLabRequest(urlWithId);
            
            if (response.statusCode() != 200) {
                logger.warn("CRUD-2 test failed: HTTP status {}", response.statusCode());
                return false;
            }
            
            // Parse response as JSON object
            JSONObject result = parseJsonResponse(response.body());
            
            // Validate the response
            if (result == null || result.length() == 0) {
                logger.warn("CRUD-2 test failed: No document returned");
                return false;
            }
            
            // Check if the returned document has the correct _id
            if (!result.has("_id")) {
                logger.warn("CRUD-2 test failed: Returned document missing _id field");
                return false;
            }
            
            String returnedId = result.getString("_id");
            if (!itemId.equals(returnedId)) {
                logger.warn("CRUD-2 test failed: Expected _id '{}', got '{}'", itemId, returnedId);
                return false;
            }
            
            // Verify it's a complete document with expected fields
            if (!result.has("name") || !result.has("property_type")) {
                logger.warn("CRUD-2 test failed: Returned document missing expected fields");
                return false;
            }
            
            logger.info("CRUD-2 test passed: Found document with _id '{}'", returnedId);
            return true;
            
        } catch (Exception e) {
            logger.error("CRUD-2 test failed with exception: {}", e.getMessage());
            return false;
        }
    }
}
