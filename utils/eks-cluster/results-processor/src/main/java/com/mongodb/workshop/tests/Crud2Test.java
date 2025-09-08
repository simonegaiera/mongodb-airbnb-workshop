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
    public TestResult execute() {
        logger.info("Executing CRUD-2 test - Testing crudOneDocument function");
        
        try {
            MongoCollection<Document> collection = getListingsAndReviewsCollection();

            // Get a random document using aggregation with $sample
            Document item = collection.aggregate(java.util.Arrays.asList(new Document("$sample", new Document("size", 1)))).first();

            if (item == null || !item.containsKey("_id")) {
                String errorMessage = "No documents found in listingsAndReviews collection or documents missing _id field - check if collection has data";
                logger.warn("CRUD-2 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }

            String itemId = item.get("_id").toString();
            String urlWithId = String.format("%s/%s", endpoint, itemId);

            HttpResponse<String> response = makeLabRequest(urlWithId);
            
            if (response.statusCode() != 200) {
                String errorMessage = String.format("HTTP request failed with status %d - check if your crudOneDocument endpoint is implemented and accessible", response.statusCode());
                logger.warn("CRUD-2 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Parse response as JSON object
            JSONObject result;
            try {
                result = parseJsonResponse(response.body());
            } catch (Exception e) {
                String errorMessage = String.format("Failed to parse API response as JSON object - expected object format but got: %s", response.body());
                logger.warn("CRUD-2 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Validate the response
            if (result == null || result.length() == 0) {
                String errorMessage = "API returned empty response - check if your crudOneDocument function properly queries and returns the document";
                logger.warn("CRUD-2 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Check if the returned document has the correct _id
            if (!result.has("_id")) {
                String errorMessage = "Returned document missing '_id' field - check if your crudOneDocument function includes all document fields";
                logger.warn("CRUD-2 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            String returnedId = result.getString("_id");
            if (!itemId.equals(returnedId)) {
                String errorMessage = String.format("Document ID mismatch - requested ID '%s' but API returned ID '%s' - check your findOne query logic", itemId, returnedId);
                logger.warn("CRUD-2 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Verify it's a complete document with expected fields
            if (!result.has("name") || !result.has("property_type")) {
                String errorMessage = "Returned document missing essential fields 'name' or 'property_type' - check if your query returns complete documents";
                logger.warn("CRUD-2 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            logger.info("CRUD-2 test passed: Found document with _id '{}'", returnedId);
            return TestResult.success();
            
        } catch (Exception e) {
            String errorMessage = String.format("Test execution failed with exception: %s - check your crudOneDocument function implementation and database connection", e.getMessage());
            logger.error("CRUD-2 test failed: {}", errorMessage);
            return TestResult.failure(errorMessage);
        }
    }
}
