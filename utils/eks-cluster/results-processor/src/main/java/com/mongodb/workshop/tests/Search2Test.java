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
    public boolean execute() {
        logger.info("Executing Search-2 test - Testing facetSearch function");
        
        try {
            // Test the search-2 endpoint with a search query
            Map<String, Object> requestBody = createRequestBody();
            requestBody.put("query", "apartment"); // Test search term
            
            HttpResponse<String> response = makeLabRequest(endpoint, requestBody);
            
            if (response.statusCode() != 200) {
                logger.warn("Search-2 test failed: HTTP status {}", response.statusCode());
                return false;
            }
            
            // Parse response as JSON array (should contain one facet metadata object)
            JSONArray results = parseJsonArrayResponse(response.body());
            
            // Validate the response
            if (results.length() == 0) {
                logger.warn("Search-2 test failed: No facet results returned");
                return false;
            }
            
            // Should have exactly one result containing facet metadata
            if (results.length() != 1) {
                logger.warn("Search-2 test failed: Expected 1 facet result, got {}", results.length());
                return false;
            }
            
            JSONObject facetResult = results.getJSONObject(0);
            
            // Check if facet structure is present
            if (!facetResult.has("facet")) {
                logger.warn("Search-2 test failed: Missing 'facet' field in result");
                return false;
            }
            
            JSONObject facet = facetResult.getJSONObject("facet");
            
            // Verify expected facets are present
            String[] expectedFacets = {"amenities", "property_type", "beds"};
            for (String expectedFacet : expectedFacets) {
                if (!facet.has(expectedFacet)) {
                    logger.warn("Search-2 test failed: Missing '{}' facet", expectedFacet);
                    return false;
                }
                
                // Each facet should have buckets
                JSONObject facetData = facet.getJSONObject(expectedFacet);
                if (!facetData.has("buckets")) {
                    logger.warn("Search-2 test failed: Missing 'buckets' in '{}' facet", expectedFacet);
                    return false;
                }
                
                JSONArray buckets = facetData.getJSONArray("buckets");
                if (buckets.length() == 0) {
                    logger.warn("Search-2 test failed: No buckets in '{}' facet", expectedFacet);
                    return false;
                }
                
                // Verify bucket structure
                for (int i = 0; i < buckets.length(); i++) {
                    JSONObject bucket = buckets.getJSONObject(i);
                    if (!bucket.has("_id") || !bucket.has("count")) {
                        logger.warn("Search-2 test failed: Invalid bucket structure in '{}' facet", expectedFacet);
                        return false;
                    }
                }
            }
            
            // Verify count field is present at the top level
            if (!facetResult.has("count")) {
                logger.warn("Search-2 test failed: Missing 'count' field in facet result");
                return false;
            }
            
            logger.info("Search-2 test passed: Found valid faceted search results with {} total count", 
                facetResult.getInt("count"));
            return true;
            
        } catch (Exception e) {
            logger.error("Search-2 test failed with exception: {}", e.getMessage());
            return false;
        }
    }
}
