package com.mongodb.workshop.tests;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Arrays;
import org.bson.Document;
import org.json.JSONArray;

/**
 * Test for: pipeline-2 (Aggregation Pipeline Exercise 2)
 * Tests the hostPerformanceAnalytics function implementation
 * Expected: Function should analyze host performance metrics comparing Superhosts vs Regular hosts
 */
public class Pipeline2Test extends BaseTest {
    
    public Pipeline2Test(MongoDatabase database, String serviceName, String endpoint) {
        super(database, serviceName, endpoint);
    }
    
    @Override
    public String getTestName() {
        return "pipeline-2";
    }
    
    @Override
    public boolean execute() {
        logger.info("Executing Pipeline-2 test - Testing hostPerformanceAnalytics function");
        
        try {
            // Test the pipeline-2 endpoint (no request body needed for this aggregation)
            HttpResponse<String> response = makeLabRequest(endpoint);
            
            if (response.statusCode() != 200) {
                logger.warn("Pipeline-2 test failed: HTTP status {}", response.statusCode());
                return false;
            }
            
            // Parse response as JSON array
            JSONArray results = parseJsonArrayResponse(response.body());
            
            // Validate the response
            if (results.length() == 0) {
                logger.warn("Pipeline-2 test failed: No aggregation results returned");
                return false;
            }
            
            // We expect exactly 2 results (Superhost and Regular Host)
            if (results.length() != 2) {
                logger.warn("Pipeline-2 test failed: Expected 2 results (Superhost and Regular Host), got {}", results.length());
                return false;
            }
            
            // Verify the structure of aggregation results
            for (int i = 0; i < results.length(); i++) {
                var result = results.getJSONObject(i);
                
                // Check if required fields are present
                String[] requiredFields = {"hostType", "avgRating", "avgReviews", "avgListings", "avgPrice", "totalProperties", "avgResponseRate"};
                for (String field : requiredFields) {
                    if (!result.has(field)) {
                        logger.warn("Pipeline-2 test failed: Missing required field '{}' in result {}", field, i);
                        return false;
                    }
                }
                
                // Verify hostType is either "Superhost" or "Regular Host"
                String hostType = result.getString("hostType");
                if (!hostType.equals("Superhost") && !hostType.equals("Regular Host")) {
                    logger.warn("Pipeline-2 test failed: Invalid hostType '{}' in result {}", hostType, i);
                    return false;
                }
                
                // Verify numeric fields are numbers (handle both regular numbers and $numberDecimal format)
                try {
                    // Handle avgRating - can be regular double or $numberDecimal
                    validateNumericField(result, "avgRating", "double");
                    
                    // Handle avgReviews - can be regular int or $numberDecimal
                    validateNumericField(result, "avgReviews", "int");
                    
                    // Handle avgListings - can be regular int or $numberDecimal
                    validateNumericField(result, "avgListings", "int");
                    
                    // Handle avgPrice - can be regular double or $numberDecimal
                    validateNumericField(result, "avgPrice", "double");
                    
                    // Handle totalProperties - should always be a regular int but validate to be safe
                    validateNumericField(result, "totalProperties", "int");
                    
                    // Handle avgResponseRate - can be regular double or $numberDecimal
                    validateNumericField(result, "avgResponseRate", "double");
                    
                } catch (Exception e) {
                    logger.warn("Pipeline-2 test failed: Invalid numeric field in result {}: {}", i, e.getMessage());
                    return false;
                }
            }

            // Get results from MongoDB to validate against
            MongoCollection<Document> collection = getListingsAndReviewsCollection();

            // Java equivalent of the provided pipeline
            List<Document> pipeline = Arrays.asList(
                new Document("$match", new Document("price", new Document("$gt", 0))
                    .append("number_of_reviews", new Document("$gt", 0))),
                new Document("$addFields", new Document("isSuperhost", 
                    new Document("$ifNull", Arrays.asList("$host.host_is_superhost", false)))),
                new Document("$group", new Document("_id", "$isSuperhost")
                    .append("avgRating", new Document("$avg", "$review_scores.review_scores_rating"))
                    .append("avgReviews", new Document("$avg", "$number_of_reviews"))
                    .append("avgListings", new Document("$avg", "$host.host_total_listings_count"))
                    .append("avgPrice", new Document("$avg", "$price"))
                    .append("totalProperties", new Document("$sum", 1))
                    .append("avgResponseRate", new Document("$avg", "$host.host_response_rate"))),
                new Document("$project", new Document("_id", 0)
                    .append("hostType", new Document("$cond", 
                        Arrays.asList("$_id", "Superhost", "Regular Host")))
                    .append("avgRating", new Document("$round", Arrays.asList("$avgRating", 1)))
                    .append("avgReviews", new Document("$round", Arrays.asList("$avgReviews", 0)))
                    .append("avgListings", new Document("$round", Arrays.asList("$avgListings", 0)))
                    .append("avgPrice", new Document("$round", Arrays.asList("$avgPrice", 2)))
                    .append("totalProperties", "$totalProperties")
                    .append("avgResponseRate", new Document("$round", Arrays.asList("$avgResponseRate", 1)))),
                new Document("$sort", new Document("avgRating", -1))
            );

            // Run the aggregation pipeline
            List<Document> resultsFromMongo = collection.aggregate(pipeline).into(new java.util.ArrayList<>());

            // Compare the results count
            if (resultsFromMongo.size() != results.length()) {
                logger.warn("Pipeline-2 test failed: Result count mismatch. MongoDB: {}, API: {}", 
                    resultsFromMongo.size(), results.length());
                return false;
            }

            // Compare specific results (verify that both Superhost and Regular Host are present)
            boolean foundSuperhost = false;
            boolean foundRegularHost = false;
            
            for (int i = 0; i < results.length(); i++) {
                var apiResult = results.getJSONObject(i);
                String hostType = apiResult.getString("hostType");
                
                if (hostType.equals("Superhost")) {
                    foundSuperhost = true;
                } else if (hostType.equals("Regular Host")) {
                    foundRegularHost = true;
                }
                
                // Verify the corresponding MongoDB result exists
                boolean foundMatchingMongoResult = false;
                for (Document mongoResult : resultsFromMongo) {
                    if (mongoResult.getString("hostType").equals(hostType)) {
                        foundMatchingMongoResult = true;
                        
                        // Verify some key metrics are reasonable (not exact match due to rounding)
                        double apiAvgRating = getNumericValue(apiResult, "avgRating");
                        double mongoAvgRating = getNumericValue(mongoResult, "avgRating");
                        if (Math.abs(apiAvgRating - mongoAvgRating) > 0.1) {
                            logger.warn("Pipeline-2 test failed: avgRating mismatch for {}: API={}, MongoDB={}", 
                                hostType, apiAvgRating, mongoAvgRating);
                            return false;
                        }
                        break;
                    }
                }
                
                if (!foundMatchingMongoResult) {
                    logger.warn("Pipeline-2 test failed: No matching MongoDB result found for hostType: {}", hostType);
                    return false;
                }
            }
            
            if (!foundSuperhost || !foundRegularHost) {
                logger.warn("Pipeline-2 test failed: Missing required host types. Superhost: {}, Regular Host: {}", 
                    foundSuperhost, foundRegularHost);
                return false;
            }

            logger.info("Pipeline-2 test passed: Found {} host performance analytics results with Superhost and Regular Host data", results.length());
            return true;
            
        } catch (Exception e) {
            logger.error("Pipeline-2 test failed with exception: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Extracts numeric value from JSONObject (API result), handling both regular numbers and $numberDecimal format
     */
    private double getNumericValue(org.json.JSONObject jsonObject, String fieldName) throws Exception {
        Object fieldValue = jsonObject.get(fieldName);
        
        // Try to get as regular number first
        try {
            return jsonObject.getDouble(fieldName);
        } catch (Exception e) {
            // If that fails, check if it's a $numberDecimal object
            if (fieldValue instanceof org.json.JSONObject) {
                org.json.JSONObject numericJsonObj = (org.json.JSONObject) fieldValue;
                if (numericJsonObj.has("$numberDecimal")) {
                    return Double.parseDouble(numericJsonObj.getString("$numberDecimal"));
                }
            }
            throw new Exception("Could not extract numeric value from field: " + fieldName);
        }
    }
    
    /**
     * Extracts numeric value from MongoDB Document, handling both regular numbers and $numberDecimal format
     */
    private double getNumericValue(Document document, String fieldName) throws Exception {
        Object fieldValue = document.get(fieldName);
        
        if (fieldValue instanceof Number) {
            return ((Number) fieldValue).doubleValue();
        } else if (fieldValue instanceof Document) {
            Document priceDoc = (Document) fieldValue;
            if (priceDoc.containsKey("$numberDecimal")) {
                return Double.parseDouble(priceDoc.getString("$numberDecimal"));
            }
        }
        throw new Exception("Could not extract numeric value from document field: " + fieldName);
    }
    
    /**
     * Validates that a field contains a valid numeric value, handling both regular numbers and $numberDecimal format
     */
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
                return; // Success - it's a valid $numberDecimal
            } else {
                throw new Exception(fieldName + " is neither a regular number nor a valid $numberDecimal object: " + fieldValue.getClass());
            }
        }
    }
}
