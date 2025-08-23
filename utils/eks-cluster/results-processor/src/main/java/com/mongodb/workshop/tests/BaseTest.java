package com.mongodb.workshop.tests;

import com.mongodb.client.MongoDatabase;
import com.mongodb.client.MongoCollection;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.time.Duration;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.security.cert.X509Certificate;
import org.json.JSONObject;
import org.json.JSONArray;
import java.util.Map;
import java.util.HashMap;

/**
 * Base class for all exercise tests
 * Provides common functionality and access to MongoDB database and HTTP requests
 */
public abstract class BaseTest {
    
    protected static final Logger logger = LoggerFactory.getLogger(BaseTest.class);
    protected final MongoDatabase database;
    protected final String serviceName;
    protected final String endpoint;
    protected final HttpClient httpClient;
    
    public BaseTest(MongoDatabase database, String serviceName, String endpoint) {
        this.database = database;
        this.serviceName = serviceName;
        this.endpoint = endpoint;
        this.httpClient = createHttpClient();
    }
    
    /**
     * Creates an HTTP client with SSL trust-all configuration for HTTPS endpoints
     */
    private HttpClient createHttpClient() {
        try {
            HttpClient.Builder clientBuilder = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10));
            
            // Create trust-all SSL context to ignore certificate issues
            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, new TrustManager[] {
                new X509TrustManager() {
                    public void checkClientTrusted(X509Certificate[] chain, String authType) {}
                    public void checkServerTrusted(X509Certificate[] chain, String authType) {}
                    public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[0]; }
                }
            }, null);
            clientBuilder.sslContext(sslContext);
            
            return clientBuilder.build();
        } catch (Exception e) {
            logger.error("Failed to create HTTP client with SSL context", e);
            return HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        }
    }
    
    /**
     * Makes an HTTP GET request to the lab endpoint
     */
    protected HttpResponse<String> makeLabRequest(String exerciseName) throws Exception {
        return makeLabRequest(exerciseName, null);
    }
    
    /**
     * Makes an HTTP POST request to the lab endpoint with request body
     */
    protected HttpResponse<String> makeLabRequest(String endpoint, Object requestBody) throws Exception {
        return makeLabRequest(endpoint, requestBody, "POST");
    }
    
    /**
     * Makes an HTTP request to the lab endpoint with specified method
     */
    protected HttpResponse<String> makeLabRequest(String endpoint, Object requestBody, String httpMethod) throws Exception {
        // Build the lab endpoint URL
        String baseUrl;
        if (serviceName.startsWith("http://") || serviceName.startsWith("https://")) {
            baseUrl = serviceName;
        } else {
            baseUrl = "https://" + serviceName;
        }
        
        if (!baseUrl.endsWith("/")) {
            baseUrl += "/";
        }
        String labUrl = baseUrl + endpoint;
        
        logger.info("Making request to lab endpoint: {}", labUrl);
        
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create(labUrl))
            .timeout(Duration.ofSeconds(30))
            .header("Content-Type", "application/json")
            .header("User-Agent", "ResultsProcessor/1.0.0");
        
        if (requestBody != null) {
            String jsonBody;
            if (requestBody instanceof Map) {
                jsonBody = new JSONObject((Map<?, ?>) requestBody).toString();
            } else if (requestBody instanceof String) {
                jsonBody = (String) requestBody;
            } else {
                jsonBody = new JSONObject().put("data", requestBody).toString();
            }
            
            // Set HTTP method based on parameter
            switch (httpMethod.toUpperCase()) {
                case "POST":
                    requestBuilder.POST(HttpRequest.BodyPublishers.ofString(jsonBody));
                    break;
                case "PUT":
                    requestBuilder.PUT(HttpRequest.BodyPublishers.ofString(jsonBody));
                    break;
                case "PATCH":
                    requestBuilder.method("PATCH", HttpRequest.BodyPublishers.ofString(jsonBody));
                    break;
                case "DELETE":
                    requestBuilder.method("DELETE", HttpRequest.BodyPublishers.ofString(jsonBody));
                    break;
                default:
                    requestBuilder.POST(HttpRequest.BodyPublishers.ofString(jsonBody));
            }
        } else {
            if ("DELETE".equalsIgnoreCase(httpMethod)) {
                requestBuilder.DELETE();
            } else {
                requestBuilder.GET();
            }
        }
        
        HttpRequest request = requestBuilder.build();
        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }
    
    /**
     * Parses JSON response to JSONObject
     */
    protected JSONObject parseJsonResponse(String responseBody) throws Exception {
        return new JSONObject(responseBody);
    }
    
    /**
     * Parses JSON response to JSONArray
     */
    protected JSONArray parseJsonArrayResponse(String responseBody) throws Exception {
        return new JSONArray(responseBody);
    }
    
    /**
     * Creates a request body map for POST requests
     */
    protected Map<String, Object> createRequestBody() {
        return new HashMap<>();
    }
    
    /**
     * Gets the listingsAndReviews collection
     */
    protected MongoCollection<Document> getListingsAndReviewsCollection() {
        return database.getCollection("listingsAndReviews");
    }
    
    /**
     * Abstract method that each test must implement
     */
    public abstract boolean execute();
    
    /**
     * Gets the test name for logging and identification
     */
    public abstract String getTestName();
}
