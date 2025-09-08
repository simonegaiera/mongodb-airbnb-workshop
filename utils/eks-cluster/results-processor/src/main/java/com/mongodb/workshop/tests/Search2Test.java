package com.mongodb.workshop.tests;

import com.mongodb.client.MongoDatabase;
import java.net.http.HttpResponse;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.Map;

/**
 * Test for: search-2 (Search Exercise 2)
 * Tests the facetSearch function implementation
 * Expected: Function should perform faceted search using $searchMeta with facets
 */
public class Search2Test extends BaseTest {
    
    public Search2Test(MongoDatabase database, String serviceName, String endpoint) {
        super(database, serviceName, endpoint);
    }
    
    @Override
    public String getTestName() {
        return "search-2";
    }
    
    @Override
    public TestResult execute() {
        logger.info("Executing Search-2 test - Testing facetSearch function");
        
        try {
            // Test the search-2 endpoint with a search query
            Map<String, Object> requestBody = createRequestBody();
            requestBody.put("query", "hawaii");
            
            HttpResponse<String> response = makeLabRequest(endpoint, requestBody);
            
            if (response.statusCode() != 201) {
                String errorMessage = String.format("HTTP request failed with status %d - expected 201 for POST request, check if your facetedSearch endpoint is implemented correctly", response.statusCode());
                logger.warn("Search-2 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Parse response as JSON array (should contain one facet metadata object)
            JSONArray results = parseJsonArrayResponse(response.body());
            
            // Validate the response
            if (results.length() == 0) {
                String errorMessage = "API returned empty results array - check if your facetedSearch function properly executes the search with facets and returns data";
                logger.warn("Search-2 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Should have exactly one result containing facet metadata
            if (results.length() != 1) {
                String errorMessage = String.format("Expected exactly 1 facet result but got %d - check if your faceted search pipeline groups facet data into a single result document", results.length());
                logger.warn("Search-2 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            JSONObject facetResult = results.getJSONObject(0);
            
            // Check if facet structure is present
            if (!facetResult.has("facet")) {
                String errorMessage = "Missing 'facet' field in result - check if your faceted search pipeline includes a $searchMeta stage with facets";
                logger.warn("Search-2 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            JSONObject facet = facetResult.getJSONObject("facet");
            
            // Verify expected facets are present
            String[] expectedFacets = {"amenities", "property_type", "beds"};
            for (String expectedFacet : expectedFacets) {
                if (!facet.has(expectedFacet)) {
                    String errorMessage = String.format("Missing '%s' facet - check if your faceted search includes all required facets (amenities, property_type, beds)", expectedFacet);
                    logger.warn("Search-2 test failed: {}", errorMessage);
                    return TestResult.failure(errorMessage);
                }
                
                // Each facet should have buckets
                JSONObject facetData = facet.getJSONObject(expectedFacet);
                if (!facetData.has("buckets")) {
                    String errorMessage = String.format("Missing 'buckets' in '%s' facet - check if your faceted search properly configures facet buckets", expectedFacet);
                    logger.warn("Search-2 test failed: {}", errorMessage);
                    return TestResult.failure(errorMessage);
                }
                
                JSONArray buckets = facetData.getJSONArray("buckets");
                if (buckets.length() == 0) {
                    String errorMessage = String.format("No buckets found in '%s' facet - check if your data contains values for this field and facet configuration is correct", expectedFacet);
                    logger.warn("Search-2 test failed: {}", errorMessage);
                    return TestResult.failure(errorMessage);
                }
                
                // Verify bucket structure
                for (int i = 0; i < buckets.length(); i++) {
                    JSONObject bucket = buckets.getJSONObject(i);
                    if (!bucket.has("_id") || !bucket.has("count")) {
                        String errorMessage = String.format("Invalid bucket structure in '%s' facet - buckets should have '_id' and 'count' fields", expectedFacet);
                        logger.warn("Search-2 test failed: {}", errorMessage);
                        return TestResult.failure(errorMessage);
                    }
                }
            }
            
            // Verify count field is present at the top level
            if (!facetResult.has("count")) {
                String errorMessage = "Missing 'count' field in facet result - check if your $searchMeta stage includes count metadata";
                logger.warn("Search-2 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }
            
            // Extract count object and get lowerBound value
            JSONObject countObj = facetResult.getJSONObject("count");
            int totalCount = countObj.getInt("lowerBound");
            
            logger.info("Search-2 test passed: Found valid faceted search results with {} total count", 
                totalCount);
            return TestResult.success();
            
        } catch (Exception e) {
            String errorMessage = String.format("Test execution failed with exception: %s - check your facetedSearch function implementation, search index setup, and database connection", e.getMessage());
            logger.error("Search-2 test failed: {}", errorMessage);
            return TestResult.failure(errorMessage);
        }
    }
}
