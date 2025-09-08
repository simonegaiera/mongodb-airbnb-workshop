package com.mongodb.workshop.tests;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import org.bson.Document;

/**
 * Test for: index (Index Test)
 * Tests general index creation/management functionality
 * Expected: Function should handle index operations successfully
 */
public class IndexTest extends BaseTest {
    
    public IndexTest(MongoDatabase database, String serviceName, String endpoint) {
        super(database, serviceName, endpoint);
    }
    
    @Override
    public String getTestName() {
        return "crud-index";
    }
    
    @Override
    public TestResult execute() {
        logger.info("Executing Index test - Testing index operations");
        
        try {
            MongoCollection<Document> collection = getListingsAndReviewsCollection();

            boolean found = false;
            for (Document index : collection.listIndexes()) {
                String indexName = index.getString("name");
                if ("beds_1_price_1".equals(indexName)) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                String errorMessage = "Required index 'beds_1_price_1' not found on listingsAndReviews collection - please create this compound index on beds and price fields";
                logger.warn("Index test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }

            logger.info("Index 'beds_1_price_1' exists");
            return TestResult.success();
            
        } catch (Exception e) {
            String errorMessage = String.format("Index validation failed with exception: %s - check database connection and collection access", e.getMessage());
            logger.error("Index test failed: {}", errorMessage);
            return TestResult.failure(errorMessage);
        }
    }
}
