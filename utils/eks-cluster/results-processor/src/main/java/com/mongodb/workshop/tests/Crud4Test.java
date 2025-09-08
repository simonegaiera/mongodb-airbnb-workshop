package com.mongodb.workshop.tests;

import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import java.net.http.HttpResponse;

import org.bson.Document;
import org.json.JSONArray;
import java.util.Map;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Test for: crud-4 (CRUD Exercise 4)
 * Tests the crudFilter function implementation
 * Expected: Function should filter documents by amenities, property type, and beds range
 */
public class Crud4Test extends BaseTest {
    
    public Crud4Test(MongoDatabase database, String serviceName, String endpoint) {
        super(database, serviceName, endpoint);
    }
    
    @Override
    public String getTestName() {
        return "crud-4";
    }
    
    @Override
    public TestResult execute() {
        logger.info("Executing CRUD-4 test - Testing crudFilter function");
        
        try {
            int page = 1;
            int limit = 12;
            Map<String, Object> filters = Map.of(
                    "amenities", Arrays.asList("24-hour check-in", "Accessible-height bed"),
                    "propertyType", "Apartment",
                    "beds", "1-2"
                );
            // Build request body as per your prompt
            Map<String, Object> requestBody = Map.of(
                "limit", limit,
                "page", page,
                "filters", filters
            );
            
            HttpResponse<String> response = makeLabRequest(endpoint, requestBody);
            
            if (response.statusCode() != 201) {
                String errorMessage = String.format("HTTP request failed with status %d - expected 201 for POST request, check if your crudFilter endpoint is implemented correctly", response.statusCode());
                logger.warn("CRUD-4 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Parse response as JSON array
            JSONArray results;
            try {
                results = parseJsonArrayResponse(response.body());
            } catch (Exception e) {
                String errorMessage = String.format("Failed to parse API response as JSON array - expected array format but got: %s", response.body());
                logger.warn("CRUD-4 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Validate the response
            if (results.length() == 0) {
                String errorMessage = "No results returned for filter query - check if your crudFilter function properly handles amenities ('24-hour check-in', 'Accessible-height bed'), property_type ('Apartment'), and beds range (1-2)";
                logger.warn("CRUD-4 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }


            // Get results from MongoDB
            MongoCollection<Document> collection = getListingsAndReviewsCollection();

            Document query = new Document();
            query.append("amenities", new Document("$all", Arrays.asList("24-hour check-in", "Accessible-height bed")));
            query.append("property_type", "Apartment");

            // Parse beds range "1-2"
            String bedsRange = (String) filters.get("beds");
            String[] parts = bedsRange.split("-");
            int minBeds = Integer.parseInt(parts[0]);
            int maxBeds = Integer.parseInt(parts[1]);
            query.append("beds", new Document("$gte", minBeds).append("$lte", maxBeds));

            int skip = (page - 1) * limit;

            // Perform the query
            FindIterable<Document> items = collection
                .find(query)
                .skip(skip)
                .limit(limit);

            // Convert FindIterable<Document> to List<Document>
            List<Document> itemList = new ArrayList<>();
            for (Document doc : items) {
                itemList.add(doc);
            }

            // Compare size first
            if (itemList.size() != results.length()) {
                String errorMessage = String.format("Result count mismatch - database returned %d documents but API returned %d - check your filter implementation for amenities, property_type, and beds range", itemList.size(), results.length());
                logger.warn("CRUD-4 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }

            if (itemList.isEmpty()) {
                String errorMessage = "No matching documents found in database for the specified filters - this may indicate a data issue or incorrect filter logic";
                logger.warn("CRUD-4 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }

            // Compare first _id between DB and API results
            Object dbFirstId = itemList.get(0).get("_id");
            Object apiFirstId = results.getJSONObject(0).get("_id");

            if (!dbFirstId.equals(apiFirstId)) {
                String errorMessage = String.format("Document order mismatch - first document _id should be '%s' but API returned '%s' - check your query logic and sorting", dbFirstId, apiFirstId);
                logger.warn("CRUD-4 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }

            logger.info("CRUD-4 test passed: Found {} filtered results", results.length());
            return TestResult.success();
            
        } catch (Exception e) {
            String errorMessage = String.format("Test execution failed with exception: %s - check your crudFilter function implementation and database connection", e.getMessage());
            logger.error("CRUD-4 test failed: {}", errorMessage);
            return TestResult.failure(errorMessage);
        }
    }
}
