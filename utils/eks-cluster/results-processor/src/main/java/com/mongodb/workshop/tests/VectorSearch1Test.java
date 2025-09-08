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
    public TestResult execute() {
        logger.info("Executing VectorSearch-1 test - Testing vectorSearch function");
        
        try {
            // Test the vector-search-1 endpoint with a semantic search query
            Map<String, Object> requestBody = createRequestBody();
            requestBody.put("query", "cozy apartment near beach"); // Test semantic search query
            requestBody.put("property_type", "Apartment"); // Optional property type filter
            
            HttpResponse<String> response = makeLabRequest(endpoint, requestBody);
            
            if (response.statusCode() != 201) {
                String errorMessage = String.format("HTTP request failed with status %d - expected 201 for POST request, check if your vectorSearch endpoint is implemented correctly", response.statusCode());
                logger.warn("VectorSearch-1 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Parse response as JSON array
            JSONArray results = parseJsonArrayResponse(response.body());
            
            // Validate the response
            if (results.length() == 0) {
                String errorMessage = "API returned empty results array - check if your vectorSearch function properly executes the vector search and returns data, and verify the vector_index exists";
                logger.warn("VectorSearch-1 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Check if we get at most 10 results (as per the limit in the pipeline)
            if (results.length() > 10) {
                String errorMessage = String.format("Too many results returned (expected max 10, got %d) - check if your vector search pipeline includes a $limit stage", results.length());
                logger.warn("VectorSearch-1 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Verify the structure of vector search results
            for (int i = 0; i < results.length(); i++) {
                var result = results.getJSONObject(i);
                
                // Check if essential fields are present
                if (!result.has("_id")) {
                    String errorMessage = String.format("Missing '_id' field in result %d - check if your vector search pipeline includes the necessary fields in the $project stage", i);
                    logger.warn("VectorSearch-1 test failed: {}", errorMessage);
                    return TestResult.failure(errorMessage);
                }
                
                if (!result.has("description")) {
                    String errorMessage = String.format("Missing 'description' field in result %d - check if your vector search pipeline includes 'description' in the $project stage", i);
                    logger.warn("VectorSearch-1 test failed: {}", errorMessage);
                    return TestResult.failure(errorMessage);
                }
                
                // If property type filter was applied, verify it matches
                if (result.has("property_type")) {
                    String propertyType = result.getString("property_type");
                    if (!"Apartment".equals(propertyType)) {
                        String errorMessage = String.format("Property type '%s' doesn't match filter 'Apartment' in result %d - check if your vector search pipeline properly applies the $match filter for property_type", 
                            propertyType, i);
                        logger.warn("VectorSearch-1 test failed: {}", errorMessage);
                        return TestResult.failure(errorMessage);
                    }
                }

            }
            
            logger.info("VectorSearch-1 test passed: Found {} semantic search results", results.length());
            return TestResult.success();
            
        } catch (Exception e) {
            String errorMessage = String.format("Test execution failed with exception: %s - check your vectorSearch function implementation, vector index setup, and database connection", e.getMessage());
            logger.error("VectorSearch-1 test failed: {}", errorMessage);
            return TestResult.failure(errorMessage);
        }
    }
}
