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
    public boolean execute() {
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
                logger.warn("Atlas Search index 'search_index' or 'default' not found");
                return false;
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
                logger.error("Index document not found");
                return false;
            }
            
            // Extract mappings.fields
            Document latestDefinition = (Document) indexDoc.get("latestDefinition");
            if (latestDefinition == null) {
                logger.error("latestDefinition not found in index document");
                return false;
            }
            
            Document mappings = (Document) latestDefinition.get("mappings");
            if (mappings == null) {
                logger.error("mappings not found in latestDefinition");
                return false;
            }
            
            Object fieldsObj = mappings.get("fields");
            if (fieldsObj == null) {
                logger.error("fields not found in mappings");
                return false;
            }

            Document fields;
            if (fieldsObj instanceof Document) {
                fields = (Document) fieldsObj;
            } else if (fieldsObj instanceof java.util.List) {
                java.util.List<?> fieldsList = (java.util.List<?>) fieldsObj;
                if (fieldsList.isEmpty()) {
                    logger.error("fields list is empty");
                    return false;
                }
                Object firstElement = fieldsList.get(0);
                if (!(firstElement instanceof Document)) {
                    logger.error("First element in fields list is not a Document, it's: " + firstElement.getClass().getName());
                    return false;
                }
                fields = (Document) firstElement;
            } else {
                logger.error("Unexpected type for 'fields': " + fieldsObj.getClass().getName());
                return false;
            }
            
            // Check amenities
            Object amenitiesObj = fields.get("amenities");
            if (amenitiesObj == null) {
                logger.error("amenities field not found");
                return false;
            }
            if (!(amenitiesObj instanceof java.util.List)) {
                logger.error("amenities is not an array, it's: " + amenitiesObj.getClass().getName());
                return false;
            }
            java.util.List<?> amenities = (java.util.List<?>) amenitiesObj;
            if (amenities.size() != 2) {
                logger.error("amenities array should have 2 elements, but has: " + amenities.size());
                return false;
            }
            java.util.Set<String> amenityTypes = new java.util.HashSet<>();
            for (Object item : amenities) {
                if (!(item instanceof Document)) {
                    logger.error("amenities item is not a Document, it's: " + item.getClass().getName());
                    return false;
                }
                amenityTypes.add(((Document) item).getString("type"));
            }
            if (!amenityTypes.contains("token")) {
                logger.error("Amenities missing type 'token'");
                return false;
            }
            
            // Check beds
            Object bedsObj = fields.get("beds");
            if (bedsObj == null) {
                logger.error("beds field not found");
                return false;
            }
            if (!(bedsObj instanceof java.util.List)) {
                logger.error("beds is not an array, it's: " + bedsObj.getClass().getName());
                return false;
            }
            java.util.List<?> beds = (java.util.List<?>) bedsObj;
            if (beds.size() != 2) {
                logger.error("beds array should have 2 elements, but has: " + beds.size());
                return false;
            }
            java.util.Set<String> bedTypes = new java.util.HashSet<>();
            for (Object item : beds) {
                if (!(item instanceof Document)) {
                    logger.error("beds item is not a Document, it's: " + item.getClass().getName());
                    return false;
                }
                bedTypes.add(((Document) item).getString("type"));
            }
            if (!bedTypes.contains("number")) {
                logger.error("Beds missing type 'number'");
                return false;
            }
            
            // Check name
            Object nameObj = fields.get("name");
            if (nameObj == null) {
                logger.error("name field not found");
                return false;
            }
            if (!(nameObj instanceof Document)) {
                logger.error("name should be an object, but it's: " + nameObj.getClass().getName());
                return false;
            }
            Document name = (Document) nameObj;
            if (!"autocomplete".equals(name.getString("type"))) {
                logger.error("Field 'name' should be of type 'autocomplete', but is: " + name.getString("type"));
                return false;
            }
            if (!"lucene.english".equals(name.getString("analyzer"))) {
                logger.error("Field 'name' should have analyzer 'lucene.english', but has: " + name.getString("analyzer"));
                return false;
            }
            
            // Check property_type
            Object propertyTypeObj = fields.get("property_type");
            if (propertyTypeObj == null) {
                logger.error("property_type field not found");
                return false;
            }
            if (!(propertyTypeObj instanceof java.util.List)) {
                logger.error("property_type is not an array, it's: " + propertyTypeObj.getClass().getName());
                return false;
            }
            java.util.List<?> propertyType = (java.util.List<?>) propertyTypeObj;
            if (propertyType.size() != 2) {
                logger.error("property_type array should have 2 elements, but has: " + propertyType.size());
                return false;
            }
            java.util.Set<String> propertyTypeTypes = new java.util.HashSet<>();
            for (Object item : propertyType) {
                if (!(item instanceof Document)) {
                    logger.error("property_type item is not a Document, it's: " + item.getClass().getName());
                    return false;
                }
                propertyTypeTypes.add(((Document) item).getString("type"));
            }
            if (!propertyTypeTypes.contains("token")) {
                logger.error("property_type missing type 'token'");
                return false;
            }
            
            logger.info("Atlas Search index 'search_index' exists");
            logger.info("SearchIndex test passed: Atlas Search index operation completed successfully");
            return true;
            
        } catch (Exception e) {
            logger.error("SearchIndex test failed with exception: {}", e.getMessage());
            return false;
        }
    }
}
