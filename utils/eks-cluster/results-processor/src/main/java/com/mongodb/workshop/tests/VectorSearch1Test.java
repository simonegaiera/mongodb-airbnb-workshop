package com.mongodb.workshop.tests;

import com.mongodb.client.MongoDatabase;
import java.net.http.HttpResponse;
import org.json.JSONArray;
import java.util.Map;

/**
 * Test for: vector-search-1 (Vector Search Exercise 1)
 * Tests the vectorSearch function implementation
 * Expected: Function should perform semantic search using $vectorSearch on description field
 */
public class VectorSearch1Test extends BaseTest {
    
    public VectorSearch1Test(MongoDatabase database, String serviceName, String endpoint) {
        super(database, serviceName, endpoint);
    }
    
    @Override
    public String getTestName() {
        return "vector-search-1";
    }
    
    @Override
    public boolean execute() {
        logger.info("Executing VectorSearch-1 test - Testing vectorSearch function");
        
        try {
            // Test the vector-search-1 endpoint with a semantic search query
            Map<String, Object> requestBody = createRequestBody();
            requestBody.put("query", "cozy apartment near beach"); // Test semantic search query
            requestBody.put("propertyType", "Apartment"); // Optional property type filter
            
            HttpResponse<String> response = makeLabRequest(endpoint, requestBody);
            
            if (response.statusCode() != 200) {
                logger.warn("VectorSearch-1 test failed: HTTP status {}", response.statusCode());
                return false;
            }
            
            // Parse response as JSON array
            JSONArray results = parseJsonArrayResponse(response.body());
            
            // Validate the response
            if (results.length() == 0) {
                logger.warn("VectorSearch-1 test failed: No vector search results returned");
                return false;
            }
            
            // Check if we get at most 10 results (as per the limit in the pipeline)
            if (results.length() > 10) {
                logger.warn("VectorSearch-1 test failed: Too many results returned (expected max 10, got {})", results.length());
                return false;
            }
            
            // Verify the structure of vector search results
            for (int i = 0; i < results.length(); i++) {
                var result = results.getJSONObject(i);
                
                // Check if essential fields are present
                if (!result.has("_id")) {
                    logger.warn("VectorSearch-1 test failed: Missing '_id' field in result {}", i);
                    return false;
                }
                
                if (!result.has("description")) {
                    logger.warn("VectorSearch-1 test failed: Missing 'description' field in result {}", i);
                    return false;
                }
                
                // If property type filter was applied, verify it matches
                if (result.has("property_type")) {
                    String propertyType = result.getString("property_type");
                    if (!"Apartment".equals(propertyType)) {
                        logger.warn("VectorSearch-1 test failed: Property type '{}' doesn't match filter 'Apartment' in result {}", 
                            propertyType, i);
                        return false;
                    }
                }
                
                // Verify description is a string
                try {
                    String description = result.getString("description");
                    if (description == null || description.isEmpty()) {
                        logger.warn("VectorSearch-1 test failed: Empty description in result {}", i);
                        return false;
                    }
                } catch (Exception e) {
                    logger.warn("VectorSearch-1 test failed: description field is not a string in result {}", i);
                    return false;
                }
            }
            
            logger.info("VectorSearch-1 test passed: Found {} semantic search results", results.length());
            return true;
            
        } catch (Exception e) {
            logger.error("VectorSearch-1 test failed with exception: {}", e.getMessage());
            return false;
        }
    }
}
