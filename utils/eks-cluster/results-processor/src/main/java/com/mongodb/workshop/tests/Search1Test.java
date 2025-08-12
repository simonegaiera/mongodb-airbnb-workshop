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
    public boolean execute() {
        logger.info("Executing Search-1 test - Testing autocompleteSearch function");
        
        try {
            // Test the search-1 endpoint with a search query
            Map<String, Object> requestBody = createRequestBody();
            requestBody.put("query", "hawaii");
            
            HttpResponse<String> response = makeLabRequest(endpoint, requestBody);
            
            if (response.statusCode() != 201) {
                logger.warn("Search-1 test failed: HTTP status {}", response.statusCode());
                return false;
            }
            
            // Parse response as JSON array
            JSONArray results = parseJsonArrayResponse(response.body());
            
            // Validate the response
            if (results.length() == 0) {
                logger.warn("Search-1 test failed: No search results returned");
                return false;
            }
            
            // Check if we get at most 10 results (as per the limit in the pipeline)
            if (results.length() > 10) {
                logger.warn("Search-1 test failed: Too many results returned (expected max 10, got {})", results.length());
                return false;
            }
            
            // Verify the structure of search results
            for (int i = 0; i < results.length(); i++) {
                var result = results.getJSONObject(i);
                
                // Check if only 'name' field is present (as per projection)
                if (!result.has("name")) {
                    logger.warn("Search-1 test failed: Missing 'name' field in result {}", i);
                    return false;
                }
                
                // Check that _id is not present (as per projection with _id: 0)
                if (result.has("_id")) {
                    logger.warn("Search-1 test failed: Unexpected '_id' field in result {}", i);
                    return false;
                }
                
                // Verify name is a string
                try {
                    String name = result.getString("name");
                    if (name == null || name.isEmpty()) {
                        logger.warn("Search-1 test failed: Empty name in result {}", i);
                        return false;
                    }
                } catch (Exception e) {
                    logger.warn("Search-1 test failed: name field is not a string in result {}", i);
                    return false;
                }
            }
            
            logger.info("Search-1 test passed: Found {} autocomplete search results", results.length());
            return true;
            
        } catch (Exception e) {
            logger.error("Search-1 test failed with exception: {}", e.getMessage());
            return false;
        }
    }
}
