package com.mongodb.workshop.tests;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.FindIterable;
import java.net.http.HttpResponse;
import org.json.JSONArray;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.bson.Document;

import java.util.ArrayList;
import java.util.List;

/**
 * Test for: crud-1 (CRUD Exercise 1)
 * Tests the crudFind function implementation
 * Expected: Function should find documents with query, sort by _id, skip and limit
 */
public class Crud1Test extends BaseTest {
    
    public Crud1Test(MongoDatabase database, String serviceName, String endpoint) {
        super(database, serviceName, endpoint);
    }
    
    @Override
    public String getTestName() {
        return "crud-1";
    }
    
    @Override
    public TestResult execute() {
        logger.info("Executing CRUD-1 test - Testing crudFind function");

        try {
            // Build query parameters for the URL
            String queryJson = "{}";
            String encodedQuery = URLEncoder.encode(queryJson, StandardCharsets.UTF_8);
            String url = String.format("%s?query=%s&skip=0&limit=5", endpoint, encodedQuery);

            HttpResponse<String> response = makeLabRequest(url);

            if (response.statusCode() != 200) {
                String errorMessage = String.format("HTTP request failed with status %d - check if the lab endpoint is running and accessible", response.statusCode());
                logger.warn("CRUD-1 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }

            // Parse response as JSON array
            JSONArray results;
            try {
                results = parseJsonArrayResponse(response.body());
            } catch (Exception e) {
                String errorMessage = String.format("Failed to parse API response as JSON array - expected array format but got: %s", response.body());
                logger.warn("CRUD-1 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }

            // Get results from MongoDB
            MongoCollection<Document> collection = getListingsAndReviewsCollection();

            Document query = new Document();
            int skip = 0;
            int limit = 5;

            // Perform the query
            FindIterable<Document> items = collection
                .find(query)
                .sort(new Document("_id", 1))
                .skip(skip)
                .limit(limit);

            // Convert FindIterable<Document> to List<Document>
            List<Document> itemList = new ArrayList<>();
            for (Document doc : items) {
                itemList.add(doc);
            }

            // Compare size first
            if (itemList.size() != results.length()) {
                String errorMessage = String.format("Result count mismatch - database returned %d documents but API returned %d - check your find operation implementation", itemList.size(), results.length());
                logger.warn("CRUD-1 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }

            if (itemList.isEmpty()) {
                String errorMessage = "No results returned from either database or API - check if listingsAndReviews collection has data and your find operation works";
                logger.warn("CRUD-1 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }

            // Compare first _id between DB and API results
            Object dbFirstId = itemList.get(0).get("_id");
            Object apiFirstId = results.getJSONObject(0).get("_id");

            if (!dbFirstId.equals(apiFirstId)) {
                String errorMessage = String.format("Document order mismatch - first document _id should be '%s' but API returned '%s' - check your sort implementation (should sort by _id ascending)", dbFirstId, apiFirstId);
                logger.warn("CRUD-1 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }

            logger.info("CRUD-1 test passed: Found {} properly filtered and sorted results", results.length());
            return TestResult.success();
            
        } catch (Exception e) {
            String errorMessage = String.format("Test execution failed with exception: %s - check your crudFind function implementation and database connection", e.getMessage());
            logger.error("CRUD-1 test failed: {}", errorMessage);
            return TestResult.failure(errorMessage);
        }
    }
}
