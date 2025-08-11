package com.mongodb.workshop.tests;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import org.bson.Document;

import java.util.List;

/**
 * Test for: vector-search-index (Vector Search Index Test)
 * Tests vector search index creation/management functionality
 * Expected: Function should handle vector search index operations successfully
 */
public class VectorSearchIndexTest extends BaseTest {
    
    public VectorSearchIndexTest(MongoDatabase database, String serviceName, String endpoint) {
        super(database, serviceName, endpoint);
    }
    
    @Override
    public String getTestName() {
        return "vector-search-index";
    }
    
    @Override
    public boolean execute() {
        logger.info("Executing VectorSearchIndex test - Testing vector search index operations");
        
        try {
            // Get results from MongoDB
            MongoCollection<Document> collection = getListingsAndReviewsCollection();
            
            boolean found = false;
            Document vectorIndex = null;
            for (Document index : collection.listSearchIndexes()) {
                String indexName = index.getString("name");
                if ("vector_index".equals(indexName)) {
                    found = true;
                    vectorIndex = index;
                    break;
                }
            }
            
            if (!found) {
                logger.warn("Atlas Search index 'vector_index' not found");
                return false;
            }
            
            // --- Begin field checks ---
            Document latestDefinition = (Document) vectorIndex.get("latestDefinition");
            Object fieldsObj = latestDefinition.get("fields");
            List<Document> fields = null;
            if (fieldsObj instanceof List<?>) {
                fields = ((List<?>) fieldsObj).stream()
                        .filter(item -> item instanceof Document)
                        .map(item -> (Document) item)
                        .toList();
            }
            
            // Check that fields array exists and has 2 elements
            if (fields == null || fields.size() != 2) {
                logger.error("fields array is missing or does not have 2 elements");
                return false;
            }
            
            // Check description field
            Document descriptionField = fields.stream()
                .filter(field -> "description".equals(field.getString("path")))
                .findFirst()
                .orElse(null);
            
            if (descriptionField == null) {
                logger.error("description field not found");
                return false;
            }
            if (!"text".equals(descriptionField.getString("type"))) {
                logger.error("description field should have type 'text'");
                return false;
            }
            // Uncomment if you want to check the model
            // if (!"voyage-3-large".equals(descriptionField.getString("model"))) {
            //     logger.error("description field should use 'voyage-3-large' model");
            //     return false;
            // }
            
            // Check property_type field
            Document propertyTypeField = fields.stream()
                .filter(field -> "property_type".equals(field.getString("path")))
                .findFirst()
                .orElse(null);
            
            if (propertyTypeField == null) {
                logger.error("property_type field not found");
                return false;
            }
            if (!"filter".equals(propertyTypeField.getString("type"))) {
                logger.error("property_type field should have type 'filter'");
                return false;
            }
            // --- End field checks ---
            
            logger.info("Atlas Search index 'vector_index' exists and fields are correct");
            logger.info("SearchIndex test passed: Atlas Search index operation completed successfully");
            return true;
            
        } catch (Exception e) {
            logger.error("VectorSearchIndex test failed with exception: {}", e.getMessage());
            return false;
        }
    }
}
