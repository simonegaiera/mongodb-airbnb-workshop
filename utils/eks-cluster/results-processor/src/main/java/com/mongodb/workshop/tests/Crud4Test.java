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
    public boolean execute() {
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
                logger.warn("CRUD-4 test failed: HTTP status {}", response.statusCode());
                return false;
            }
            
            // Parse response as JSON array
            JSONArray results = parseJsonArrayResponse(response.body());
            
            // Validate the response
            if (results.length() == 0) {
                logger.warn("CRUD-4 test failed: No results returned");
                return false;
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
                logger.warn("Mismatch in number of results: DB={}, API={}", itemList.size(), results.length());
                return false;
            }

            // Compare first _id between DB and API results
            Object dbFirstId = itemList.get(0).get("_id");
            Object apiFirstId = results.getJSONObject(0).get("_id");

            if (!dbFirstId.equals(apiFirstId)) {
                logger.warn("First _id mismatch: DB={}, API={}", dbFirstId, apiFirstId);
                return false;
            }

            logger.info("CRUD-4 test passed: Found {} filtered results", results.length());
            return true;
            
        } catch (Exception e) {
            logger.error("CRUD-4 test failed with exception: {}", e.getMessage());
            return false;
        }
    }
}
