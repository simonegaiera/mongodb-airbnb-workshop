---
title: "Vibe Coding: Node.js Express Prompt"
permalink: /vibe/node-express/
layout: single
classes: wide
---

## 🟢 Node.js Express Implementation Prompt

### 📋 Instructions

This page contains the comprehensive prompt for implementing the MongoDB Airbnb Workshop REST API in Node.js with Express. Use this prompt with Cline to generate a complete Node.js Express application.

### 🎯 How to Use This Prompt

1. **Copy the entire prompt** from the section below
2. **Paste it into your AI assistant** of choice
3. **Make sure the swagger.json file** is used as context when prompted
4. **Review and test** the generated code
5. **Iterate and refine** as needed

### 📂 Expected Deliverables

After running this prompt, you should receive:
- ✅ Complete Node.js Express REST API application
- ✅ Organized file structure with separated concerns
- ✅ MongoDB indexes configuration file
- ✅ Environment setup instructions
- ✅ Integration with Atlas Search and Vector Search
- ✅ AI Chatbot implementation with RAG

---

## 🤖 Node.js Express Implementation Prompt - Part 1: Core Application & Listings & Analytics

Copy the prompt below and use it with your AI assistant:

```
Create a Node.js Express REST API application based on the swagger.json specification file - PART 1: Core Application Setup and Listings & Analytics Operations.

**Core Requirements:**
- Read and analyze the swagger.json file to understand all API endpoints
- Build a Node.js Express web application on port 5000
- **Implement ONLY the CRUD and Results APIs from the swagger.json file - skip search, vector search, and chat endpoints for now**
- Organize code into multiple files based on the API categories you identify from the swagger
- Separate concerns: CRUD operations and results management using Express.js best practices
- Use modern ES6+ syntax with async/await

**Key Implementation Areas for Part 1:**

1. **CRUD Operations**: Standard database operations for listings and reviews
2. **Statistics**: Statistical analysis using MongoDB aggregation framework
3. **Results**: Workshop participant management

**Implementation Scope:**
- **Focus on Basic Operations**: Implement listings CRUD, reviews CRUD, statistics, and results endpoints only
- **Skip Advanced Features**: Do not implement search, vector search, or chatbot endpoints in this part

**MongoDB Integration:**
- Use the MongoDB Node.js driver or Mongoose for database operations
- Use the available MCP (Model Context Protocol) to thoroughly analyze and understand the collection schemas before implementing any queries
- **Schema Discovery First**: Query the MCP to examine the actual data structure, field types, and document format in the collection
- Implement proper database queries based on the actual collection structure and field types discovered through MCP
- Ensure all field references and data types match the real database schema, not assumptions

**Database Collection Usage:**
- **Primary Collection**: All listing-related endpoints (`/api/listingsAndReviews/*`) use the `listingsAndReviews` collection
- **Results Data**: Only the Results endpoints (`/api/results/*`) use data from the `airbnb_arena` database

**Required Deliverables for Part 1:**
1. **Complete Node.js Express application** with proper file organization:
   - Separate route files for CRUD operations
   - Controller files for business logic
   - Middleware for error handling and validation
   - Database connection and configuration files
2. **Basic MongoDB indexes** for performance optimization of CRUD operations
3. **package.json file** with necessary dependencies for Express.js, MongoDB, and basic operations
4. **Environment setup**: Support for existing `.env` file structure

**Environment Variables:**
Load configuration from the existing `.env` file which contains:
- MONGODB_URI and other basic configuration
- Use dotenv to load these environment variables into your application

**Express.js Features to Implement:**
- **Express Router** for organizing routes
- **JSON body parsing** middleware
- **CORS handling** middleware
- **Error handling** middleware
- **Request logging** (optional)
- **Async/await** for all database operations
- **Proper HTTP status codes** and error responses
- **Input validation** and sanitization

**MongoDB Integration:**
- Use **MongoDB aggregation framework** for complex queries
- Use **standard CRUD operations** for simple database operations
- Implement **proper connection pooling** for MongoDB
- Use **modern JavaScript features** (ES6+, async/await, destructuring)

**Additional Features:**
- Proper error handling and validation
- Environment configuration support
- CORS for frontend integration
- Request/response logging
- Graceful server shutdown handling
- Compatible with existing test cases in rest-lab/ folder

Analyze the swagger.json file first, then design and implement the core Express.js application with CRUD operations and results management.
```

## 🤖 Node.js Express Implementation Prompt - Part 2: Search & Vector Search

Copy the prompt below and use it with your AI assistant (after completing Part 1):

```
Extend your existing Node.js Express REST API application with Search and Vector Search capabilities - PART 2: Search Implementation.

**Prerequisites:**
- You should have completed Part 1 with the basic Express application and CRUD operations
- The core application structure and MongoDB integration should be in place
- Use the available MCP (Model Context Protocol) to thoroughly analyze and understand the collection schemas before implementing any queries

**Key Implementation Areas for Part 2:**
1. **Atlas Search**: Implement using MongoDB Atlas Search operators (autocomplete, facet, text search)
2. **Vector Search**: Implement using MongoDB Atlas Vector Search with automated embeddings
   - **Embedding Field**: Configure automated embeddings on the `description` field for semantic search capabilities

**Implementation Scope:**
- **Add Search Endpoints**: Implement all search-related endpoints from the swagger.json file
- **Atlas Search Integration**: Add lexical search capabilities
- **Vector Search Integration**: Add semantic search capabilities

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

**Required Deliverables for Part 2:**
1. **Extended Route Files** with search functionality
2. **New Controller Methods** for search endpoints
3. **mongodb_indexes file** containing search-specific indexes:
   - One comprehensive Atlas Search index for all lexical search operations (search, facet, autocomplete) with proper field mappings
   - One dedicated Vector Search index for semantic search with automated embeddings on the `description` field
   - Include clear comments and creation instructions

**Technical Implementation Notes:**
- Use MongoDB aggregation framework for complex search queries
- Separate filtering/statistics from advanced Atlas Search operations
- Use appropriate MongoDB operators for each search type
- Ensure the single Atlas Search index supports text operators, autocomplete operators, and facet operators with proper field mappings
- Create a dedicated vector search index separate from the lexical search index
- Use modern JavaScript features (ES6+, async/await, destructuring)

**Additional Dependencies:**
Update your package.json with any additional dependencies needed for advanced search operations.

Extend your existing application with comprehensive search capabilities using Atlas Search and Vector Search.
```

## 🔍 Automated Embeddings Implementation Note

**Automated embeddings is a newer MongoDB Atlas feature**. If your AI assistant doesn't implement automated embeddings correctly or lacks current documentation knowledge, use this enhanced prompt:

```
@web Reference the MongoDB Atlas Vector Search automated embedding documentation at https://www.mongodb.com/docs/atlas/atlas-vector-search/automated-embedding/ for implementation details. Use curl to retrieve the information, not chromium.
```

## 🤖 Node.js Express Implementation Prompt - Part 3: AI Chatbot with LangChain

Copy the prompt below and use it with your AI assistant (after completing Parts 1 & 2):

```
Extend your existing Node.js Express REST API application with AI Chatbot capabilities - PART 3: RAG Implementation with LangChain.

**Prerequisites:**
- You should have completed Parts 1 & 2 with CRUD operations and search capabilities
- Vector Search should be implemented and working
- The core application structure and MongoDB integration should be in place

**Key Implementation Areas for Part 3:**

1. **AI Chatbot**: RAG implementation using Atlas Vector Search + AWS Bedrock LLM integration via LangChain
2. **Chat History Management**: Store and retrieve conversation history
3. **RAG Pipeline**: Use vector search for context retrieval in chatbot responses

**Implementation Scope:**
- **Add Chat Endpoints**: Implement all chat-related endpoints from the swagger.json file
- **LangChain Integration**: Add AI conversation capabilities
- **RAG Architecture**: Use vector search for retrieval in chatbot responses

**Database Collection Usage:**
- **Chat System**: Chat endpoints (`/api/chat/*`) use the `listingsAndReviews` collection for RAG operations
- **Chat History**: Store conversation history in MongoDB

**Vector Search Integration:**
- **RAG Architecture**: Use existing vector search functionality for retrieval in chatbot responses
- **Context Retrieval**: Query relevant listings based on user questions using vector search

**Environment Configuration:**
Add to your existing configuration:
- AWS_REGION, LLM_MODEL, and other AWS Bedrock configuration
- Bedrock model configuration for chat responses

**LangChain Integration:**
- Configure AWS Bedrock client for LLM integration
- Implement RAG pipeline using vector search results
- Use LangChain MongoDB chat memory
- Integrate with MongoDB for chat history storage

**Required Deliverables for Part 3:**
1. **Extended Route Files** with chat functionality
2. **New Controller Methods** for chat endpoints
3. **LangChain Configuration** modules
4. **AWS Bedrock Integration** setup
5. **Updated package.json** with LangChain and AWS dependencies

**Additional Dependencies:**
Update your package.json with LangChain and AWS Bedrock dependencies:
- LangChain for AI integration
- AWS SDK for Bedrock integration
- Any additional AI/ML related dependencies

**Technical Implementation Notes:**
- Design RAG pipeline for contextual chatbot responses
- Use existing vector search infrastructure for context retrieval
- Implement conversation memory and history management
- Ensure proper error handling for AI service calls
- Add appropriate logging for AI operations
- Use modern JavaScript features (ES6+, async/await, destructuring)

**Chat Features to Implement:**
- **Context-Aware Responses**: Use RAG to provide relevant information about Airbnb listings
- **Conversation History**: Maintain chat sessions and history
- **Error Handling**: Graceful handling of AI service failures
- **Response Streaming**: If supported, implement streaming responses

Extend your existing application with comprehensive AI chatbot capabilities using LangChain and AWS Bedrock.
```

---

## 🔧 Post-Generation Checklist

After receiving your generated code, verify:

- [ ] **File Structure**: Code is organized by functionality (routes, controllers, middleware)
- [ ] **Express Setup**: Proper Express.js application structure with middleware
- [ ] **Environment Setup**: `.env` file template and package.json included
- [ ] **MongoDB Indexes**: file with all necessary indexes
- [ ] **Atlas Search**: Proper implementation of lexical search features
- [ ] **Vector Search**: Automated embeddings integration for semantic search
- [ ] **AI Chatbot**: RAG implementation with LangChain and Bedrock
- [ ] **Error Handling**: Proper HTTP status codes and error responses
- [ ] **Middleware**: CORS, body parsing, and error handling middleware
- [ ] **Testing**: Compatible with existing test files in rest-lab folder
- [ ] **Documentation**: Clear setup and usage instructions

## 💡 Tips for Success

1. **Start with swagger.json**: Always provide the OpenAPI specification as context
2. **Test incrementally**: Test each endpoint category as it's implemented
3. **Use the MCP**: Leverage the Model Context Protocol for schema understanding
4. **Follow Express patterns**: Use proper Express.js routing and middleware patterns
5. **Modern JavaScript**: Use ES6+ features like async/await, destructuring, and arrow functions
6. **Iterate**: Don't hesitate to ask for refinements or specific improvements

## 🚀 Ready to Code?

Copy the prompt above and start building your MongoDB Airbnb Workshop API in Node.js with Express!
