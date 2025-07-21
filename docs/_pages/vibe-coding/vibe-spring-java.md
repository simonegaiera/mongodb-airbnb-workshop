---
title: "Vibe Coding: Spring Boot Java Prompt"
permalink: /vibe/spring-boot/
layout: single
classes: wide
---

## ☕ Java Spring Boot Implementation Prompt

### 📋 Instructions

This page contains the comprehensive prompt for implementing the MongoDB Airbnb Workshop REST API in Java Spring Boot. Use this prompt with Cline to generate a complete Java Spring Boot application.

### 🎯 How to Use This Prompt

1. **Copy the entire prompt** from the section below
2. **Paste it into your AI assistant** of choice
3. **Make sure the swagger.json file** is used as context when prompted
4. **Review and test** the generated code
5. **Iterate and refine** as needed

### 📂 Expected Deliverables

After running this prompt, you should receive:
- ✅ Complete Java Spring Boot REST API application
- ✅ Organized package structure with separated concerns
- ✅ MongoDB indexes configuration file
- ✅ Environment setup instructions
- ✅ Integration with Atlas Search and Vector Search
- ✅ AI Chatbot implementation with RAG

---

## 🤖 Java Spring Boot Implementation Prompt

Copy the prompt below and use it with your AI assistant:

```
Create a Java Spring Boot REST API application based on the swagger.json specification file.

**Core Requirements:**
- Read and analyze the swagger.json file to understand all API endpoints
- Build a Java Spring Boot web application using Spring Boot on port 5000
- **Implement ONLY the APIs defined in the swagger.json file - no additional endpoints**
- Organize code into proper Java packages based on the API categories you identify from the swagger
- Separate concerns: CRUD operations, search functionality, vector search, and chatbot using Spring Boot best practices

**Key Implementation Areas:**

1. **CRUD Operations**: Standard database operations for listings and reviews using Spring Data MongoDB
2. **Search & Filtering**: Basic filtering using MongoDB aggregation pipelines and standard queries
3. **Statistics**: Statistical analysis using MongoDB aggregation framework
4. **Atlas Search**: Implement using MongoDB Atlas Search operators (autocomplete, facet, text search)
5. **Vector Search**: Implement using MongoDB Atlas Vector Search with automated embeddings
   - **Embedding Field**: Configure automated embeddings on the `description` field for semantic search capabilities
6. **AI Chatbot**: RAG implementation using Atlas Vector Search + AWS Bedrock LLM integration via LangChain4j
7. **Results**: Workshop participant management

**Implementation Scope:**
- **Swagger-Only Implementation**: Create endpoints ONLY as specified in the swagger.json file
- **No Extra Features**: Do not add endpoints, routes, or functionality beyond what's documented in the OpenAPI specification

**MongoDB Integration:**
- Use Spring Data MongoDB for database operations
- Use the available MCP (Model Context Protocol) to thoroughly analyze and understand the collection schemas before implementing any queries
- **Schema Discovery First**: Query the MCP to examine the actual data structure, field types, and document format in the collection
- Implement proper database queries based on the actual collection structure and field types discovered through MCP
- Ensure all field references and data types match the real database schema, not assumptions

**Database Collection Usage:**
- **Primary Collection**: All listing-related endpoints (`/api/listingsAndReviews/*`) use the `listingsAndReviews` collection
- **Atlas Search**: Search endpoints (`/autocomplete`, `/facet`, `/search`) operate on the `listingsAndReviews` collection
- **Vector Search**: The `/vectorsearch` endpoint uses the `listingsAndReviews` collection with automated embeddings
- **Chat System**: Chat endpoints (`/api/chat/*`) use the `listingsAndReviews` collection for RAG operations
- **Results Data**: Only the Results endpoints (`/api/results/*`) use data from the `airbnb_gameday` database

**Atlas Search & Vector Search Requirements:**
- **Vector Search Index**: Create a separate vector search index specifically for the `/vectorsearch` endpoint with automated embeddings on the `description` field
- **Lexical Search Index**: Create a single Atlas Search index that supports all lexical search operations (`/search`, `/facet`, `/autocomplete`) using appropriate operators and analyzers

**Atlas Search Field Mappings:**
- **name** (for autocomplete): Enable autocomplete search on listing names
- **amenities** (for filtering): Support faceted filtering by available amenities  
- **property_type** (for filtering): Allow filtering by property type categories
- **beds** (for numeric filtering): Enable range filtering on number of beds

**Vector Search Configuration:**
- **numCandidates**: Set to 100 for optimal performance and accuracy
- **limit**: Return top 10 most relevant results
- **Embedding Field**: Configure automated embeddings on the `description` field
- **RAG Architecture**: Use vector search for retrieval in chatbot responses

**Required Deliverables:**
1. **Complete Java Spring Boot application** with proper package organization
2. **mongodb_indexes file** containing all required MongoDB indexes:
   - One comprehensive Atlas Search index for all lexical search operations (search, facet, autocomplete) with proper field mappings
   - One dedicated Vector Search index for semantic search with automated embeddings on the `description` field
   - Standard database indexes for performance optimization
   - Include clear comments and creation instructions
   - MongoDB Atlas UI or Atlas CLI is not available
3. **pom.xml file** with all necessary dependencies
4. **application.properties** or **application.yml** configuration file

**Environment Configuration:**
Load configuration from environment variables or application.properties:
- MONGODB_URI, AWS_REGION, LLM_MODEL, and other necessary configuration
- Use Spring Boot's @ConfigurationProperties or @Value annotations
- Support for existing `.env` file structure

**Spring Boot Features to Implement:**
- **@RestController** for REST endpoints
- **@Service** for business logic
- **@Repository** for data access
- **@Configuration** for configuration classes
- **@Component** for utility classes
- **@Autowired** for dependency injection
- **@Valid** for request validation
- **ResponseEntity** for proper HTTP responses
- **@CrossOrigin** or global CORS configuration
- **@ExceptionHandler** for error handling

**MongoDB Integration:**
- Use **MongoTemplate** for complex aggregation queries
- Use **MongoRepository** for simple CRUD operations
- Implement custom repository methods for Atlas Search and Vector Search
- Use **@Document** annotation for entity mapping
- Use **@Field** annotation for field mapping
- Use **@Id** for document identifiers

**LangChain4j Integration:**
- Configure AWS Bedrock client for LLM integration
- Implement RAG pipeline using vector search results
- Use LangChain4j's conversation memory features
- Integrate with MongoDB for chat history storage

**Additional Features:**
- Proper exception handling with @ControllerAdvice
- Request/Response validation using Bean Validation
- Environment-based configuration support
- CORS for frontend integration
- Compatible with existing test cases in rest-lab/ folder
- Logging with SLF4J and Logback
- Health check endpoints with Spring Boot Actuator

**Technical Implementation Notes:**
- Use Spring Data MongoDB aggregation framework for complex queries
- Separate filtering/statistics from advanced Atlas Search operations
- Use appropriate MongoDB operators for each search type
- Design RAG pipeline for contextual chatbot responses
- Ensure the single Atlas Search index supports text operators, autocomplete operators, and facet operators with proper field mappings
- Create a dedicated vector search index separate from the lexical search index
- Follow Spring Boot naming conventions and best practices
- Use proper HTTP status codes and error responses
- Implement proper logging throughout the application
- No authorization/credentials is required

**Error Handling:**
- Create custom exception classes
- Use @ControllerAdvice for global exception handling
- Return proper HTTP status codes
- Provide meaningful error messages
- Log errors appropriately

**Testing Considerations:**
- Structure code to be testable with Spring Boot Test
- Use @MockBean for mocking dependencies
- Ensure compatibility with existing test files in rest-lab folder

Analyze the swagger.json file first, then design and implement the complete Java Spring Boot application with appropriate package structure and all required indexes.
```

## 🔍 Automated Embeddings Implementation Note

**Automated embeddings is a newer MongoDB Atlas feature**. If your AI assistant doesn't implement automated embeddings correctly or lacks current documentation knowledge, use this enhanced prompt:

```
@web Reference the MongoDB Atlas Vector Search automated embedding documentation at https://www.mongodb.com/docs/atlas/atlas-vector-search/automated-embedding/ for implementation details. Use curl to retrieve the information, not chromium.
```

---

## 🔧 Post-Generation Checklist

After receiving your generated code, verify:

- [ ] **Package Structure**: Code is organized by Spring Boot best practices (controller, service, repository, model, dto)
- [ ] **Environment Setup**: `application.properties`/`application.yml` and `pom.xml` included
- [ ] **MongoDB Indexes**: file with all necessary indexes
- [ ] **Atlas Search**: Proper implementation of lexical search features using MongoTemplate
- [ ] **Vector Search**: Automated embeddings integration for semantic search
- [ ] **AI Chatbot**: RAG implementation with LangChain4j and Bedrock
- [ ] **Error Handling**: Proper HTTP status codes and @ControllerAdvice error responses
- [ ] **Testing**: Compatible with existing test files in rest-lab folder
- [ ] **Documentation**: Clear setup and usage instructions
- [ ] **Spring Boot Features**: Proper use of annotations and dependency injection
- [ ] **Validation**: Request validation using Bean Validation annotations

## 💡 Tips for Success

1. **Start with swagger.json**: Always provide the OpenAPI specification as context
2. **Test incrementally**: Test each endpoint category as it's implemented
3. **Use the MCP**: Leverage the Model Context Protocol for schema understanding
4. **Follow Spring Boot patterns**: Use proper annotations and follow Spring Boot conventions
5. **Iterate**: Don't hesitate to ask for refinements or specific improvements
6. **Maven Dependencies**: Ensure all required dependencies are included in pom.xml
7. **Configuration**: Use Spring Boot's configuration management features

## 🚀 Ready to Code?

Copy the prompt above and start building your MongoDB Airbnb Workshop API in Java Spring Boot!
