package com.mongodb.workshop.tests;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import org.bson.Document;

/**
 * Test for: search-index (Search Index Test)
 * Tests search index creation/management functionality
 * Expected: Function should handle search index operations successfully
 */
public class SearchIndexTest extends BaseTest {
    
    public SearchIndexTest(MongoDatabase database, String serviceName, String endpoint) {
        super(database, serviceName, endpoint);
    }
    
    @Override
    public String getTestName() {
        return "search-index";
    }
    
    @Override
    public TestResult execute() {
        logger.info("Executing SearchIndex test - Testing search index operations");
        
        try {
            // Get results from MongoDB
            MongoCollection<Document> collection = getListingsAndReviewsCollection();
            
            boolean found = false;
            for (Document index : collection.listSearchIndexes()) {
                String indexName = index.getString("name");
                if ("search_index".equals(indexName) || "default".equals(indexName)) {
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                String errorMessage = "Atlas Search index 'search_index' or 'default' not found - check if the text search index was created properly on the listingsAndReviews collection";
                logger.warn("SearchIndex test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Get the index document
            Document indexDoc = null;
            for (Document index : collection.listSearchIndexes()) {
                String indexName = index.getString("name");
                if ("search_index".equals(indexName) || "default".equals(indexName)) {
                    indexDoc = index;
                    break;
                }
            }
            if (indexDoc == null) {
                String errorMessage = "Index document not found - check if the search index was properly created and is accessible";
                logger.error("SearchIndex test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Extract mappings.fields
            Document latestDefinition = (Document) indexDoc.get("latestDefinition");
            if (latestDefinition == null) {
                String errorMessage = "latestDefinition not found in index document - check if the search index has a valid definition structure";
                logger.error("SearchIndex test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            Document mappings = (Document) latestDefinition.get("mappings");
            if (mappings == null) {
                String errorMessage = "mappings not found in latestDefinition - check if the search index has field mappings configured";
                logger.error("SearchIndex test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            Object fieldsObj = mappings.get("fields");
            if (fieldsObj == null) {
                String errorMessage = "fields not found in mappings - check if the search index has field mappings defined";
                logger.error("SearchIndex test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }

            Document fields;
            if (fieldsObj instanceof Document) {
                fields = (Document) fieldsObj;
            } else if (fieldsObj instanceof java.util.List) {
                java.util.List<?> fieldsList = (java.util.List<?>) fieldsObj;
                if (fieldsList.isEmpty()) {
                    String errorMessage = "fields list is empty - check if the search index has field mappings configured for text search";
                    logger.error("SearchIndex test failed: {}", errorMessage);
                    return TestResult.failure(errorMessage);
                }
                Object firstElement = fieldsList.get(0);
                if (!(firstElement instanceof Document)) {
                    String errorMessage = String.format("First element in fields list is not a Document, it's: %s - check search index field mapping structure", firstElement.getClass().getName());
                    logger.error("SearchIndex test failed: {}", errorMessage);
                    return TestResult.failure(errorMessage);
                }
                fields = (Document) firstElement;
            } else {
                String errorMessage = String.format("Unexpected type for 'fields': %s - expected Document or List, check search index configuration", fieldsObj.getClass().getName());
                logger.error("SearchIndex test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Check amenities
            Object amenitiesObj = fields.get("amenities");
            if (amenitiesObj == null) {
                String errorMessage = "amenities field not found in search index - check if your search index includes the 'amenities' field mapping";
                logger.error("SearchIndex test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }

            // Accept both single object and array formats
            boolean amenitiesValid = false;
            if (amenitiesObj instanceof Document) {
                // Single object format: { "type": "token" }
                Document amenitiesDoc = (Document) amenitiesObj;
                if ("token".equals(amenitiesDoc.getString("type"))) {
                    amenitiesValid = true;
                }
            } else if (amenitiesObj instanceof java.util.List) {
                // Array format: [{ "type": "stringFacet" }, { "type": "token" }]
                java.util.List<?> amenities = (java.util.List<?>) amenitiesObj;
                java.util.Set<String> amenityTypes = new java.util.HashSet<>();
                for (Object item : amenities) {
                    if (item instanceof Document) {
                        amenityTypes.add(((Document) item).getString("type"));
                    }
                }
                if (amenityTypes.contains("token")) {
                    amenitiesValid = true;
                }
            }

            if (!amenitiesValid) {
                String errorMessage = "amenities field must be either { \"type\": \"token\" } or an array containing { \"type\": \"token\" } - check if your search index includes token type for amenities field";
                logger.error("SearchIndex test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Check beds
            Object bedsObj = fields.get("beds");
            if (bedsObj == null) {
                String errorMessage = "beds field not found in search index - check if your search index includes the 'beds' field mapping";
                logger.error("SearchIndex test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }

            // Accept both single object and array formats
            boolean bedsValid = false;
            if (bedsObj instanceof Document) {
                // Single object format: { "type": "number" }
                Document bedsDoc = (Document) bedsObj;
                if ("number".equals(bedsDoc.getString("type"))) {
                    bedsValid = true;
                }
            } else if (bedsObj instanceof java.util.List) {
                // Array format: [{ "type": "numberFacet" }, { "type": "number" }]
                java.util.List<?> beds = (java.util.List<?>) bedsObj;
                java.util.Set<String> bedTypes = new java.util.HashSet<>();
                for (Object item : beds) {
                    if (item instanceof Document) {
                        bedTypes.add(((Document) item).getString("type"));
                    }
                }
                if (bedTypes.contains("number")) {
                    bedsValid = true;
                }
            }

            if (!bedsValid) {
                String errorMessage = "beds field must be either { \"type\": \"number\" } or an array containing { \"type\": \"number\" } - check if your search index includes number type for beds field";
                logger.error("SearchIndex test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Check name
            Object nameObj = fields.get("name");
            if (nameObj == null) {
                String errorMessage = "name field not found in search index - check if your search index includes the 'name' field mapping";
                logger.error("SearchIndex test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            if (!(nameObj instanceof Document)) {
                String errorMessage = String.format("name should be an object, but it's: %s - check if name field is configured as an object type in the search index", nameObj.getClass().getName());
                logger.error("SearchIndex test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            Document name = (Document) nameObj;
            if (!"autocomplete".equals(name.getString("type"))) {
                String errorMessage = String.format("Field 'name' should be of type 'autocomplete', but is: %s - check if name field uses autocomplete type in search index", name.getString("type"));
                logger.error("SearchIndex test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            if (!"lucene.english".equals(name.getString("analyzer"))) {
                String errorMessage = String.format("Field 'name' should have analyzer 'lucene.english', but has: %s - check if name field uses the correct analyzer in search index", name.getString("analyzer"));
                logger.error("SearchIndex test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Check property_type
            Object propertyTypeObj = fields.get("property_type");
            if (propertyTypeObj == null) {
                String errorMessage = "property_type field not found in search index - check if your search index includes the 'property_type' field mapping";
                logger.error("SearchIndex test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }

            // Accept both single object and array formats
            boolean propertyTypeValid = false;
            if (propertyTypeObj instanceof Document) {
                // Single object format: { "type": "token" }
                Document propertyTypeDoc = (Document) propertyTypeObj;
                if ("token".equals(propertyTypeDoc.getString("type"))) {
                    propertyTypeValid = true;
                }
            } else if (propertyTypeObj instanceof java.util.List) {
                // Array format: [{ "type": "stringFacet" }, { "type": "token" }]
                java.util.List<?> propertyType = (java.util.List<?>) propertyTypeObj;
                java.util.Set<String> propertyTypeTypes = new java.util.HashSet<>();
                for (Object item : propertyType) {
                    if (item instanceof Document) {
                        propertyTypeTypes.add(((Document) item).getString("type"));
                    }
                }
                if (propertyTypeTypes.contains("token")) {
                    propertyTypeValid = true;
                }
            }

            if (!propertyTypeValid) {
                String errorMessage = "property_type field must be either { \"type\": \"token\" } or an array containing { \"type\": \"token\" } - check if your search index includes token type for property_type field";
                logger.error("SearchIndex test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            logger.info("Atlas Search index 'search_index' exists");
            logger.info("SearchIndex test passed: Atlas Search index operation completed successfully");
            return TestResult.success();
            
        } catch (Exception e) {
            String errorMessage = String.format("Test execution failed with exception: %s - check your search index configuration and database connection", e.getMessage());
            logger.error("SearchIndex test failed: {}", errorMessage);
            return TestResult.failure(errorMessage);
        }
    }
}
