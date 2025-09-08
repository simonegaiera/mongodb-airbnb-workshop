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
    public TestResult execute() {
        logger.info("Executing CRUD-3 test - Testing crudDistinct function");

        try {
            // Build the GET URL with query parameter
            String url = String.format("%s?field=bedrooms", endpoint);

            HttpResponse<String> response = makeLabRequest(url);

            if (response.statusCode() != 200) {
                String errorMessage = String.format("HTTP request failed with status %d - check if your crudDistinct endpoint is implemented and accessible", response.statusCode());
                logger.warn("CRUD-3 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }

            // Parse response as JSON array
            JSONArray results;
            try {
                results = parseJsonArrayResponse(response.body());
            } catch (Exception e) {
                String errorMessage = String.format("Failed to parse API response as JSON array - expected array format but got: %s", response.body());
                logger.warn("CRUD-3 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }

            // Validate the response
            if (results.length() == 0) {
                String errorMessage = "No distinct values returned - check if your crudDistinct function properly queries the 'bedrooms' field and returns distinct values";
                logger.warn("CRUD-3 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }

            // Validate the response
            if (results.length() != 13) {
                String errorMessage = String.format("Incorrect number of distinct values - expected 13 distinct bedroom values but got %d - check your distinct operation logic", results.length());
                logger.warn("CRUD-3 test failed: {}", errorMessage);
                return TestResult.failure(errorMessage);
            }

            logger.info("CRUD-3 test passed: Found {} distinct bedroom values", results.length());
            return TestResult.success();

        } catch (Exception e) {
            String errorMessage = String.format("Test execution failed with exception: %s - check your crudDistinct function implementation and database connection", e.getMessage());
            logger.error("CRUD-3 test failed: {}", errorMessage);
            return TestResult.failure(errorMessage);
        }
    }
}
