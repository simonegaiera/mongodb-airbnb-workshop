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
        return "index-1";
    }
    
    @Override
    public boolean execute() {
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
                logger.warn("Index 'beds_1_price_1' not found");
                return false;
            }

            logger.info("Index 'beds_1_price_1' exists");
            
            return true;
            
        } catch (Exception e) {
            logger.error("Index test failed with exception: {}", e.getMessage());
            return false;
        }
    }
}
