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
    public TestResult execute() {
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
                String errorMessage = "Atlas Search index 'vector_index' not found - check if the vector search index was created properly on the listingsAndReviews collection";
                logger.warn("VectorSearchIndex test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
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
                String errorMessage = "fields array is missing or does not have 2 elements - check if your vector_index definition includes both 'description' and 'property_type' fields";
                logger.error("VectorSearchIndex test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Check description field
            Document descriptionField = fields.stream()
                .filter(field -> "description".equals(field.getString("path")))
                .findFirst()
                .orElse(null);
            
            if (descriptionField == null) {
                String errorMessage = "description field not found in vector_index - check if your index definition includes a field with path 'description'";
                logger.error("VectorSearchIndex test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            if (!"text".equals(descriptionField.getString("type"))) {
                String errorMessage = "description field should have type 'text' - check if your description field in the vector_index is configured with type 'text' for vector search";
                logger.error("VectorSearchIndex test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
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
                String errorMessage = "property_type field not found in vector_index - check if your index definition includes a field with path 'property_type'";
                logger.error("VectorSearchIndex test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            if (!"filter".equals(propertyTypeField.getString("type"))) {
                String errorMessage = "property_type field should have type 'filter' - check if your property_type field in the vector_index is configured with type 'filter' for filtering";
                logger.error("VectorSearchIndex test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            // --- End field checks ---
            
            logger.info("Atlas Search index 'vector_index' exists and fields are correct");
            logger.info("SearchIndex test passed: Atlas Search index operation completed successfully");
            return TestResult.success();
            
        } catch (Exception e) {
            String errorMessage = String.format("Test execution failed with exception: %s - check your vector search index configuration and database connection", e.getMessage());
            logger.error("VectorSearchIndex test failed: {}", errorMessage);
            return TestResult.failure(errorMessage);
        }
    }
}
