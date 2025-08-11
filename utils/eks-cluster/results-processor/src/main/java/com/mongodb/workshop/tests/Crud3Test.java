package com.mongodb.workshop.tests;

import com.mongodb.client.MongoDatabase;
import java.net.http.HttpResponse;
import org.json.JSONArray;

/**
 * Test for: crud-3 (CRUD Exercise 3)
 * Tests the crudDistinct function implementation
 * Expected: Function should return distinct values for a specified field
 */
public class Crud3Test extends BaseTest {
    
    public Crud3Test(MongoDatabase database, String serviceName, String endpoint) {
        super(database, serviceName, endpoint);
    }
    
    @Override
    public String getTestName() {
        return "crud-3";
    }
    
    @Override
    public boolean execute() {
        logger.info("Executing CRUD-3 test - Testing crudDistinct function");

        try {
            // Build the GET URL with query parameter
            String url = String.format("%s?field=bedrooms", endpoint);

            HttpResponse<String> response = makeLabRequest(url);

            if (response.statusCode() != 200) {
                logger.warn("CRUD-3 test failed: HTTP status {}", response.statusCode());
                return false;
            }

            // Parse response as JSON array
            JSONArray results = parseJsonArrayResponse(response.body());

            // Validate the response
            if (results.length() == 0) {
                logger.warn("CRUD-3 test failed: No distinct values returned");
                return false;
            }

            // Validate the response
            if (results.length() != 13) {
                logger.warn("CRUD-3 test failed: Expected 13 distinct values, got {}", results.length());
                return false;
            }

            logger.info("CRUD-3 test passed: Found {} distinct amenities", results.length());
            return true;

        } catch (Exception e) {
            logger.error("CRUD-3 test failed with exception: {}", e.getMessage());
            return false;
        }
    }
}
