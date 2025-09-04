package com.mongodb.workshop.tests;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Arrays;
import org.bson.Document;
import org.json.JSONArray;

/**
 * Test for: pipeline-1 (Property Investment Market Analysis)
 * Tests the aggregationPipeline function implementation
 * Expected: Function should provide investment market analysis grouped by bed count
 * with filtering for quality properties and comprehensive metrics
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
                if (!result.has("beds") || !result.has("averagePrice") || 
                    !result.has("propertyCount") || !result.has("averageReviews")) {
                    logger.warn("Pipeline-1 test failed: Missing required fields (beds, averagePrice, propertyCount, averageReviews) in result {}", i);
                    return false;
                }
                
                // Verify beds is a number
                try {
                    result.getInt("beds");
                } catch (Exception e) {
                    logger.warn("Pipeline-1 test failed: beds field is not a number in result {}", i);
                    return false;
                }
                
                // Verify numeric fields are numbers (handle both regular numbers and $numberDecimal format)
                try {
                    // Handle averagePrice - can be regular double or $numberDecimal
                    validateNumericField(result, "averagePrice", "double");
                    
                    // Handle propertyCount - should always be a regular int but validate to be safe
                    validateNumericField(result, "propertyCount", "int");
                    
                    // Handle averageReviews - can be regular double or $numberDecimal
                    validateNumericField(result, "averageReviews", "double");
                    
                } catch (Exception e) {
                    logger.warn("Pipeline-1 test failed: Invalid numeric field in result {}: {}", i, e.getMessage());
                    return false;
                }
            }

            // Get results from MongoDB
            MongoCollection<Document> collection = getListingsAndReviewsCollection();


            // Java equivalent of the new property investment analysis pipeline
            List<Document> pipeline = Arrays.asList(
                // Stage 1: Filter for quality investment properties
                new Document("$match", new Document("price", new Document("$gt", 0))
                    .append("number_of_reviews", new Document("$gt", 0))
                    .append("beds", new Document("$gte", 0).append("$lte", 10))
                    .append("accommodates", new Document("$gt", 0))),
                    
                // Stage 2: Group by bed count and calculate investment metrics
                new Document("$group", new Document("_id", "$beds")
                    .append("averagePrice", new Document("$avg", "$price"))
                    .append("propertyCount", new Document("$sum", 1))
                    .append("averageReviews", new Document("$avg", "$number_of_reviews"))),
                    
                // Stage 3: Format output for business presentation
                new Document("$project", new Document("_id", 0)
                    .append("beds", "$_id")
                    .append("averagePrice", new Document("$round", Arrays.asList("$averagePrice", 2)))
                    .append("propertyCount", 1)
                    .append("averageReviews", new Document("$round", Arrays.asList("$averageReviews", 1)))),
                    
                // Stage 4: Sort by bed count ascending
                new Document("$sort", new Document("beds", 1))
            );


            // Run the aggregation pipeline
            List<Document> resultsFromMongo = collection.aggregate(pipeline).into(new java.util.ArrayList<>());

            // Now you can use resultsFromMongo for assertions or further processing

            // Compare the first result from MongoDB with the first result from the API
            if (!resultsFromMongo.isEmpty() && results.length() > 0) {
                Document mongoResult = resultsFromMongo.get(0);
                org.json.JSONObject apiResult = results.getJSONObject(0);

                int bedsMongo = mongoResult.getInteger("beds");
                double averagePriceMongo = extractMongoNumericValue(mongoResult, "averagePrice");
                int propertyCountMongo = mongoResult.getInteger("propertyCount");
                double averageReviewsMongo = extractMongoNumericValue(mongoResult, "averageReviews");

                int bedsApi = apiResult.getInt("beds");
                double averagePriceApi = extractNumericValue(apiResult, "averagePrice", "double");
                int propertyCountApi = (int) extractNumericValue(apiResult, "propertyCount", "int");
                double averageReviewsApi = extractNumericValue(apiResult, "averageReviews", "double");

                // Compare all fields with small tolerance for floating point differences
                if (bedsMongo != bedsApi || 
                    Math.abs(averagePriceMongo - averagePriceApi) > 0.01 ||
                    propertyCountMongo != propertyCountApi ||
                    Math.abs(averageReviewsMongo - averageReviewsApi) > 0.1) {
                    
                    logger.warn("Pipeline-1 test failed: First result mismatch. MongoDB: beds={}, averagePrice={}, propertyCount={}, averageReviews={}; API: beds={}, averagePrice={}, propertyCount={}, averageReviews={}",
                        bedsMongo, averagePriceMongo, propertyCountMongo, averageReviewsMongo,
                        bedsApi, averagePriceApi, propertyCountApi, averageReviewsApi);
                    return false;
                }
            }

            logger.info("Pipeline-1 test passed: Found {} investment market segments with comprehensive metrics by bed count", results.length());
            return true;
            
        } catch (Exception e) {
            logger.error("Pipeline-1 test failed with exception: {}", e.getMessage());
            return false;
        }
    }

    private void validateNumericField(org.json.JSONObject jsonObject, String fieldName, String expectedType) throws Exception {
        if (!jsonObject.has(fieldName)) {
            throw new Exception("Field " + fieldName + " is missing");
        }
        
        Object fieldValue = jsonObject.get(fieldName);
        
        // Try to get as regular number first
        try {
            if (expectedType.equals("double")) {
                jsonObject.getDouble(fieldName);
            } else if (expectedType.equals("int")) {
                jsonObject.getInt(fieldName);
            }
            return; // Success - it's a regular number
        } catch (Exception e) {
            // If that fails, check if it's a $numberDecimal object
            if (fieldValue instanceof org.json.JSONObject) {
                org.json.JSONObject numericJsonObj = (org.json.JSONObject) fieldValue;
                if (!numericJsonObj.has("$numberDecimal")) {
                    throw new Exception(fieldName + " object doesn't contain $numberDecimal field");
                }
                // Try to parse the $numberDecimal string as the expected type
                String decimalStr = numericJsonObj.getString("$numberDecimal");
                if (expectedType.equals("double")) {
                    Double.parseDouble(decimalStr);
                } else if (expectedType.equals("int")) {
                    // For int, we can parse as double first then convert to int
                    Double.parseDouble(decimalStr);
                }
            } else {
                throw new Exception(fieldName + " field is not a valid number");
            }
        }
    }

    private double extractNumericValue(org.json.JSONObject jsonObject, String fieldName, String expectedType) throws Exception {
        if (!jsonObject.has(fieldName)) {
            throw new Exception("Field " + fieldName + " is missing");
        }
        
        Object fieldValue = jsonObject.get(fieldName);
        
        // Try to get as regular number first
        try {
            if (expectedType.equals("double")) {
                return jsonObject.getDouble(fieldName);
            } else if (expectedType.equals("int")) {
                return jsonObject.getInt(fieldName);
            }
        } catch (Exception e) {
            // If that fails, check if it's a $numberDecimal object
            if (fieldValue instanceof org.json.JSONObject) {
                org.json.JSONObject numericJsonObj = (org.json.JSONObject) fieldValue;
                if (!numericJsonObj.has("$numberDecimal")) {
                    throw new Exception(fieldName + " object doesn't contain $numberDecimal field");
                }
                // Parse the $numberDecimal string as double
                String decimalStr = numericJsonObj.getString("$numberDecimal");
                return Double.parseDouble(decimalStr);
            } else {
                throw new Exception(fieldName + " field is not a valid number");
            }
        }
        
        throw new Exception("Unknown expectedType: " + expectedType);
    }

    private double extractMongoNumericValue(Document document, String fieldName) throws Exception {
        if (!document.containsKey(fieldName)) {
            throw new Exception("Field " + fieldName + " is missing from MongoDB result");
        }
        
        Object fieldValue = document.get(fieldName);
        
        // Handle regular Double
        if (fieldValue instanceof Double) {
            return (Double) fieldValue;
        }
        
        // Handle org.bson.types.Decimal128
        if (fieldValue instanceof org.bson.types.Decimal128) {
            return ((org.bson.types.Decimal128) fieldValue).doubleValue();
        }
        
        // Handle Integer (should convert to double)
        if (fieldValue instanceof Integer) {
            return ((Integer) fieldValue).doubleValue();
        }
        
        // Handle Long (should convert to double)
        if (fieldValue instanceof Long) {
            return ((Long) fieldValue).doubleValue();
        }
        
        throw new Exception("Field " + fieldName + " has unexpected type: " + fieldValue.getClass().getName());
    }
}
