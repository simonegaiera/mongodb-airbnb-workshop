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
    public TestResult execute() {
        logger.info("Executing CRUD-6 test - Testing crudUpdateElement function");
        
        try {
            MongoCollection<Document> collection = getListingsAndReviewsCollection();

            // Perform the query
            Document query = new Document();
            Document item = collection.find(query).first();
            
            if (item == null) {
                String errorMessage = "No documents found in listingsAndReviews collection - check if collection has data";
                logger.warn("CRUD-6 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            String itemId = item.get("_id").toString();

            // Concatenate itemId to the endpoint URL
            String itemEndpoint = endpoint.endsWith("/") ? endpoint + itemId : endpoint + "/" + itemId;

            // Test the crud-6 endpoint with update parameters
            Map<String, Object> requestBody = createRequestBody();
            requestBody.put("key", "accommodates");
            requestBody.put("value", 9);

            HttpResponse<String> response = makeLabRequest(itemEndpoint, requestBody, "PATCH");
            
            if (response.statusCode() != 201) {
                String errorMessage = String.format("HTTP request failed with status %d - expected 201 for PATCH request, check if your crudUpdate endpoint is implemented correctly", response.statusCode());
                logger.warn("CRUD-6 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Parse response as JSON object (update result)
            JSONObject result;
            try {
                result = parseJsonResponse(response.body());
            } catch (Exception e) {
                String errorMessage = String.format("Failed to parse API response as JSON object - expected update result object but got: %s", response.body());
                logger.warn("CRUD-6 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Validate the update result
            if (result == null || result.length() == 0) {
                String errorMessage = "API returned empty response - check if your crudUpdate function returns the MongoDB update result";
                logger.warn("CRUD-6 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Check if the result indicates successful update
            if (!result.has("acknowledged") || !result.getBoolean("acknowledged")) {
                String errorMessage = "Update operation not acknowledged - check if your crudUpdate function properly updates the document and returns the result";
                logger.warn("CRUD-6 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Check if matchedCount is present and > 0
            if (!result.has("matchedCount") || result.getInt("matchedCount") == 0) {
                String errorMessage = "No documents matched for update - check if your crudUpdate function uses the correct document ID in the update query";
                logger.warn("CRUD-6 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Check if modifiedCount is present and > 0
            if (!result.has("modifiedCount") || result.getInt("modifiedCount") == 0) {
                String errorMessage = "No documents were modified - check if your crudUpdate function properly applies the $set operation";
                logger.warn("CRUD-6 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }

            Document checkQuery = new Document("_id", itemId);
            Document updatedItem = collection.find(checkQuery).first();

            if (updatedItem == null) {
                String errorMessage = "Updated document not found in database - this may indicate an issue with the update operation";
                logger.warn("CRUD-6 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }

            // Verify the updated field
            if (!updatedItem.containsKey("accommodates") || updatedItem.getInteger("accommodates") != 9) {
                String errorMessage = "Document field 'accommodates' was not updated correctly - expected value 9, check your $set operation implementation";
                logger.warn("CRUD-6 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }

            logger.info("CRUD-6 test passed: Successfully updated {} document(s)", result.getInt("modifiedCount"));
            return TestResult.success();
            
        } catch (Exception e) {
            String errorMessage = String.format("Test execution failed with exception: %s - check your crudUpdate function implementation and database connection", e.getMessage());
            logger.error("CRUD-6 test failed: {}", errorMessage);
            return TestResult.failure(errorMessage);
        }
    }
}
