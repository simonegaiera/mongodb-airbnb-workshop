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
    public TestResult execute() {
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
                String errorMessage = String.format("HTTP request failed with status %d - expected 201 for POST request, check if your crudInsert endpoint is implemented correctly", response.statusCode());
                logger.warn("CRUD-5 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Parse response as JSON object (insert result)
            JSONObject result;
            try {
                result = parseJsonResponse(response.body());
            } catch (Exception e) {
                String errorMessage = String.format("Failed to parse API response as JSON object - expected insert result object but got: %s", response.body());
                logger.warn("CRUD-5 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Validate the insert result
            if (result == null || result.length() == 0) {
                String errorMessage = "API returned empty response - check if your crudInsert function returns the MongoDB insert result";
                logger.warn("CRUD-5 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Check if the result indicates successful insertion
            if (!result.has("acknowledged") || !result.getBoolean("acknowledged")) {
                String errorMessage = "Insert operation not acknowledged - check if your crudInsert function properly inserts the document and returns the result";
                logger.warn("CRUD-5 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Check if insertedId is present
            if (!result.has("insertedId")) {
                String errorMessage = "Insert result missing 'insertedId' field - check if your crudInsert function returns the complete MongoDB insert result";
                logger.warn("CRUD-5 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            String insertedId = result.getString("insertedId");
            if (insertedId == null || insertedId.isEmpty()) {
                String errorMessage = "Insert result contains empty 'insertedId' - check if the document was properly inserted and ID returned";
                logger.warn("CRUD-5 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }

            MongoCollection<Document> collection = getListingsAndReviewsCollection();
            collection.deleteOne(new Document("_id", insertedId));
            
            logger.info("CRUD-5 test passed: Successfully inserted document with _id '{}'", insertedId);
            return TestResult.success();
            
        } catch (Exception e) {
            String errorMessage = String.format("Test execution failed with exception: %s - check your crudInsert function implementation and database connection", e.getMessage());
            logger.error("CRUD-5 test failed: {}", errorMessage);
            return TestResult.failure(errorMessage);
        }
    }
}
