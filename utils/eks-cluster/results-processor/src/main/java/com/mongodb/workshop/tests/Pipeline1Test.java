package com.mongodb.workshop.tests;

import com.mongodb.client.MongoDatabase;
import java.net.http.HttpResponse;
import org.json.JSONArray;

/**
 * Test for: pipeline-1 (Aggregation Pipeline Exercise 1)
 * Tests the aggregationPipeline function implementation
 * Expected: Function should compute average price by bed count using aggregation pipeline
 */
public class Pipeline1Test extends BaseTest {
    
    public Pipeline1Test(MongoDatabase database, String serviceName, String endpoint) {
        super(database, serviceName, endpoint);
    }
    
    @Override
    public String getTestName() {
        return "pipeline-1";
    }
    
    @Override
    public boolean execute() {
        logger.info("Executing Pipeline-1 test - Testing aggregationPipeline function");
        
        try {
            // Test the pipeline-1 endpoint (no request body needed for this aggregation)
            HttpResponse<String> response = makeLabRequest(endpoint);
            
            if (response.statusCode() != 200) {
                logger.warn("Pipeline-1 test failed: HTTP status {}", response.statusCode());
                return false;
            }
            
            // Parse response as JSON array
            JSONArray results = parseJsonArrayResponse(response.body());
            
            // Validate the response
            if (results.length() == 0) {
                logger.warn("Pipeline-1 test failed: No aggregation results returned");
                return false;
            }
            
            // Verify the structure of aggregation results
            for (int i = 0; i < results.length(); i++) {
                var result = results.getJSONObject(i);
                
                // Check if required fields are present
                if (!result.has("beds") || !result.has("price")) {
                    logger.warn("Pipeline-1 test failed: Missing required fields (beds, price) in result {}", i);
                    return false;
                }
                
                // Verify beds is a number
                try {
                    result.getInt("beds");
                } catch (Exception e) {
                    logger.warn("Pipeline-1 test failed: beds field is not a number in result {}", i);
                    return false;
                }
                
                // Verify price is a number (average price)
                try {
                    result.getDouble("price");
                } catch (Exception e) {
                    logger.warn("Pipeline-1 test failed: price field is not a number in result {}", i);
                    return false;
                }
            }
            
            // Verify results are sorted by beds (ascending)
            for (int i = 1; i < results.length(); i++) {
                int prevBeds = results.getJSONObject(i - 1).getInt("beds");
                int currBeds = results.getJSONObject(i).getInt("beds");
                if (currBeds < prevBeds) {
                    logger.warn("Pipeline-1 test failed: Results not sorted by beds in ascending order");
                    return false;
                }
            }
            
            logger.info("Pipeline-1 test passed: Found {} aggregated results with average prices by bed count", results.length());
            return true;
            
        } catch (Exception e) {
            logger.error("Pipeline-1 test failed with exception: {}", e.getMessage());
            return false;
        }
    }
}
