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
    public boolean execute() {
        logger.info("Executing CRUD-1 test - Testing crudFind function");

        try {
            // Build query parameters for the URL
            String queryJson = "{}";
            String encodedQuery = URLEncoder.encode(queryJson, StandardCharsets.UTF_8);
            String url = String.format("%s?query=%s&skip=0&limit=5", endpoint, encodedQuery);

            HttpResponse<String> response = makeLabRequest(url);

            if (response.statusCode() != 200) {
                logger.warn("CRUD-1 test failed: HTTP status {}", response.statusCode());
                return false;
            }

            // Parse response as JSON array
            JSONArray results = parseJsonArrayResponse(response.body());

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

            logger.info("CRUD-1 test passed: Found {} properly filtered and sorted results", results.length());
            return true;
            
        } catch (Exception e) {
            logger.error("CRUD-1 test failed with exception: {}", e.getMessage());
            return false;
        }
    }
}
