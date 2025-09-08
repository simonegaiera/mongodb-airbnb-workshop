package com.mongodb.workshop.tests;

import com.mongodb.client.MongoDatabase;
import java.net.http.HttpResponse;
import org.json.JSONArray;
import java.util.Map;

/**
 * Test for: search-1 (Search Exercise 1)
 * Tests the autocompleteSearch function implementation
 * Expected: Function should perform autocomplete search using $search with fuzzy matching
 */
public class Search1Test extends BaseTest {
    
    public Search1Test(MongoDatabase database, String serviceName, String endpoint) {
        super(database, serviceName, endpoint);
    }
    
    @Override
    public String getTestName() {
        return "search-1";
    }
    
    @Override
    public TestResult execute() {
        logger.info("Executing Search-1 test - Testing autocompleteSearch function");
        
        try {
            // Test the search-1 endpoint with a search query
            Map<String, Object> requestBody = createRequestBody();
            requestBody.put("query", "hawaii");
            
            HttpResponse<String> response = makeLabRequest(endpoint, requestBody);
            
            if (response.statusCode() != 201) {
                String errorMessage = String.format("HTTP request failed with status %d - expected 201 for POST request, check if your textSearch endpoint is implemented correctly", response.statusCode());
                logger.warn("Search-1 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Parse response as JSON array
            JSONArray results = parseJsonArrayResponse(response.body());
            
            // Validate the response
            if (results.length() == 0) {
                String errorMessage = "API returned empty results array - check if your textSearch function properly executes the text search and returns data, and verify the text index exists";
                logger.warn("Search-1 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Check if we get at most 10 results (as per the limit in the pipeline)
            if (results.length() > 10) {
                String errorMessage = String.format("Too many results returned (expected max 10, got %d) - check if your text search pipeline includes a $limit stage", results.length());
                logger.warn("Search-1 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Verify the structure of search results
            for (int i = 0; i < results.length(); i++) {
                var result = results.getJSONObject(i);
                
                // Check if only 'name' field is present (as per projection)
                if (!result.has("name")) {
                    String errorMessage = String.format("Missing 'name' field in result %d - check if your text search pipeline includes 'name' in the $project stage", i);
                    logger.warn("Search-1 test failed: {}", errorMessage);
                    return TestResult.failure(errorMessage);
                }
                
                // Check that _id is not present (as per projection with _id: 0)
                if (result.has("_id")) {
                    String errorMessage = String.format("Unexpected '_id' field in result %d - check if your text search pipeline uses {_id: 0} in the $project stage", i);
                    logger.warn("Search-1 test failed: {}", errorMessage);
                    return TestResult.failure(errorMessage);
                }
                
                // Verify name is a string
                try {
                    String name = result.getString("name");
                    if (name == null || name.isEmpty()) {
                        String errorMessage = String.format("Empty name field in result %d - check if your text search returns valid documents with name values", i);
                        logger.warn("Search-1 test failed: {}", errorMessage);
                        return TestResult.failure(errorMessage);
                    }
                } catch (Exception e) {
                    String errorMessage = String.format("name field is not a valid string in result %d - check if your text search returns properly formatted name fields", i);
                    logger.warn("Search-1 test failed: {}", errorMessage);
                    return TestResult.failure(errorMessage);
                }
            }
            
            logger.info("Search-1 test passed: Found {} autocomplete search results", results.length());
            return TestResult.success();
            
        } catch (Exception e) {
            String errorMessage = String.format("Test execution failed with exception: %s - check your textSearch function implementation, text index setup, and database connection", e.getMessage());
            logger.error("Search-1 test failed: {}", errorMessage);
            return TestResult.failure(errorMessage);
        }
    }
}
