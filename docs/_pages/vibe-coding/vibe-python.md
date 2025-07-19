---
title: "Vibe Coding: Python Prompt"
permalink: /vibe/python/
layout: single
classes: wide
---

## 🐍 Python Implementation Prompt

### 📋 Instructions

This page contains the comprehensive prompt for implementing the MongoDB Airbnb Workshop REST API in Python. Use this prompt with Cline to generate a complete Python application.

### 🎯 How to Use This Prompt

1. **Copy the entire prompt** from the section below
2. **Paste it into your AI assistant** of choice
3. **Make sure the swagger.json file** is used as context when prompted
4. **Review and test** the generated code
5. **Iterate and refine** as needed

### 📂 Expected Deliverables

After running this prompt, you should receive:
- ✅ Complete Python REST API application
- ✅ Organized file structure with separated concerns
- ✅ MongoDB indexes configuration file
- ✅ Environment setup instructions
- ✅ Integration with Atlas Search and Vector Search
- ✅ AI Chatbot implementation with RAG

---

## 🤖 Python Implementation Prompt

Copy the prompt below and use it with your AI assistant:

```
Create a Python REST API application based on the swagger.json specification file.

**Core Requirements:**
- Read and analyze the swagger.json file to understand all API endpoints
- Build a Python web application using Flask or FastAPI on port 5000
- **Implement ONLY the APIs defined in the swagger.json file - no additional endpoints**
- Organize code into multiple files based on the API categories you identify from the swagger
- Separate concerns: CRUD operations, search functionality, vector search, and chatbot

**Key Implementation Areas:**

1. **CRUD Operations**: Standard database operations for listings and reviews
2. **Search & Filtering**: Basic filtering using MongoDB aggregation pipelines and standard queries
3. **Statistics**: Statistical analysis using MongoDB aggregation framework
4. **Atlas Search**: Implement using MongoDB Atlas Search operators (autocomplete, facet, text search)
5. **Vector Search**: Implement using MongoDB Atlas Vector Search with knnBeta operator
   - **Automated Embeddings**: Reference documentation at http://mongodb.com/docs/atlas/atlas-vector-search/automated-embedding/
   - **Embedding Field**: Configure automated embeddings on the `description` field for semantic search capabilities
6. **AI Chatbot**: RAG implementation using Atlas Vector Search + AWS Bedrock LLM integration via LangChain
7. **Results**: Workshop participant management

**Implementation Scope:**
- **Swagger-Only Implementation**: Create endpoints ONLY as specified in the swagger.json file
- **No Extra Features**: Do not add endpoints, routes, or functionality beyond what's documented in the OpenAPI specification

**MongoDB Integration:**
- Use the available MCP (Model Context Protocol) to thoroughly analyze and understand the `listingsAndReviews` collection schema before implementing any queries
- **Schema Discovery First**: Query the MCP to examine the actual data structure, field types, and document format in the collection
- Implement proper database queries based on the actual collection structure and field types discovered through MCP
- Ensure all field references and data types match the real database schema, not assumptions

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
1. **Complete Python application** with proper file organization
2. **mongodb_indexes.json file** containing all required MongoDB indexes:
   - One comprehensive Atlas Search index for all lexical search operations (search, facet, autocomplete) with proper field mappings
   - One dedicated Vector Search index for semantic search with automated embeddings on the `description` field
   - Standard database indexes for performance optimization
   - Include clear comments and creation instructions

**Environment Variables:**
- MONGODB_URI, AWS_REGION, LLM_MODEL, and other necessary configuration

**Additional Features:**
- Proper error handling and validation
- Environment configuration support
- CORS for frontend integration
- Compatible with existing test cases in rest-lab/ folder
- LangChain integration for AWS Bedrock connectivity
- LangChain MongoDB chat memory storage

**Technical Implementation Notes:**
- Separate filtering/statistics from advanced Atlas Search operations
- Use appropriate MongoDB operators for each search type
- Design RAG pipeline for contextual chatbot responses
- Ensure the single Atlas Search index supports text operators, autocomplete operators, and facet operators with proper field mappings
- Create a dedicated vector search index separate from the lexical search index

Analyze the swagger.json file first, then design and implement the complete application with appropriate file structure and all required indexes.
```

---

## 🔧 Post-Generation Checklist

After receiving your generated code, verify:

- [ ] **File Structure**: Code is organized by functionality (CRUD, search, vector, chat, etc.)
- [ ] **Environment Setup**: `.env` file template and requirements.txt included
- [ ] **MongoDB Indexes**: `mongodb_indexes.json` file with all necessary indexes
- [ ] **Atlas Search**: Proper implementation of lexical search features
- [ ] **Vector Search**: Automated embeddings integration for semantic search
- [ ] **AI Chatbot**: RAG implementation with LangChain and Bedrock
- [ ] **Error Handling**: Proper HTTP status codes and error responses
- [ ] **Testing**: Compatible with existing test files in rest-lab folder
- [ ] **Documentation**: Clear setup and usage instructions

## 💡 Tips for Success

1. **Start with swagger.json**: Always provide the OpenAPI specification as context
2. **Test incrementally**: Test each endpoint category as it's implemented
3. **Use the MCP**: Leverage the Model Context Protocol for schema understanding
4. **Follow the patterns**: The generated code should match the workshop's architectural patterns
5. **Iterate**: Don't hesitate to ask for refinements or specific improvements

## 🚀 Ready to Code?

Copy the prompt above and start building your MongoDB Airbnb Workshop API in Python!
