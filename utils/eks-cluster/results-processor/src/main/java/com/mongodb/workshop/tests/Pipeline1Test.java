package com.mongodb.workshop.tests;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Arrays;
import org.bson.Document;
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
                
                // Verify price is a number (average price) - handle both regular number and $numberDecimal formats
                try {
                    if (result.has("price")) {
                        // Try to get as double first (regular number)
                        try {
                            result.getDouble("price");
                        } catch (Exception e) {
                            // If that fails, check if it's a $numberDecimal object
                            if (result.get("price") instanceof org.json.JSONObject) {
                                org.json.JSONObject priceJsonObj = result.getJSONObject("price");
                                if (!priceJsonObj.has("$numberDecimal")) {
                                    throw new Exception("Price object doesn't contain $numberDecimal field");
                                }
                                // Try to parse the $numberDecimal string as double
                                Double.parseDouble(priceJsonObj.getString("$numberDecimal"));
                            } else {
                                throw e; // Re-throw if it's neither format
                            }
                        }
                    }
                } catch (Exception e) {
                    logger.warn("Pipeline-1 test failed: price field is not a valid number in result {}", i);
                    return false;
                }
            }

            // Get results from MongoDB
            MongoCollection<Document> collection = getListingsAndReviewsCollection();


            // Java equivalent of the provided pipeline
            List<Document> pipeline = Arrays.asList(
                new Document("$match", new Document("beds", new Document("$exists", true))
                    .append("price", new Document("$exists", true))),
                new Document("$group", new Document("_id", "$beds")
                    .append("price", new Document("$avg", "$price"))),
                new Document("$sort", new Document("_id", 1)),
                new Document("$project", new Document("_id", 0)
                    .append("beds", "$_id")
                    .append("price", 1))
            );


            // Run the aggregation pipeline
            List<Document> resultsFromMongo = collection.aggregate(pipeline).into(new java.util.ArrayList<>());

            // Now you can use resultsFromMongo for assertions or further processing

            // Compare the first result from MongoDB with the first result from the API
            if (!resultsFromMongo.isEmpty() && results.length() > 0) {
                Document mongoResult = resultsFromMongo.get(0);
                org.json.JSONObject apiResult = results.getJSONObject(0);

                int bedsMongo = mongoResult.getInteger("beds");
                double priceMongo;
                
                // Handle both regular number and $numberDecimal types
                Object priceObj = mongoResult.get("price");
                if (priceObj instanceof Document) {
                    // Handle $numberDecimal format
                    Document priceDoc = (Document) priceObj;
                    if (priceDoc.containsKey("$numberDecimal")) {
                        priceMongo = Double.parseDouble(priceDoc.getString("$numberDecimal"));
                    } else {
                        priceMongo = priceDoc.getDouble("$numberDecimal");
                    }
                } else if (priceObj instanceof Number) {
                    // Handle regular number format
                    priceMongo = ((Number) priceObj).doubleValue();
                } else {
                    logger.warn("Pipeline-1 test failed: Unexpected price field type: {}", priceObj.getClass());
                    return false;
                }

                int bedsApi = apiResult.getInt("beds");
                double priceApi;
                
                // Handle both regular number and $numberDecimal types for API result
                try {
                    priceApi = apiResult.getDouble("price");
                } catch (Exception e) {
                    // If that fails, check if it's a $numberDecimal object
                    if (apiResult.get("price") instanceof org.json.JSONObject) {
                        org.json.JSONObject priceJsonObj = apiResult.getJSONObject("price");
                        if (priceJsonObj.has("$numberDecimal")) {
                            priceApi = Double.parseDouble(priceJsonObj.getString("$numberDecimal"));
                        } else {
                            logger.warn("Pipeline-1 test failed: API price object doesn't contain $numberDecimal field");
                            return false;
                        }
                    } else {
                        logger.warn("Pipeline-1 test failed: API price field is not a valid number");
                        return false;
                    }
                }

                if (bedsMongo != bedsApi || Math.abs(priceMongo - priceApi) > 0.01) { // Allow small floating point difference
                    logger.warn("Pipeline-1 test failed: First result mismatch. MongoDB: beds={}, price={}; API: beds={}, price={}",
                        bedsMongo, priceMongo, bedsApi, priceApi);
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
