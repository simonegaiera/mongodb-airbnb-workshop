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
- Organize code into multiple files based on the API categories you identify from the swagger
- Separate concerns: CRUD operations, search functionality, vector search, filtering, statistics, and chatbot

**Key Implementation Areas:**

1. **CRUD Operations**: Standard database operations for listings and reviews
2. **Search & Filtering**: Basic filtering using MongoDB aggregation pipelines and standard queries
3. **Statistics**: Statistical analysis using MongoDB aggregation framework
4. **Atlas Search**: Implement using MongoDB Atlas Search operators (autocomplete, facet, text search)
5. **Vector Search**: Implement using MongoDB Atlas Vector Search with knnBeta operator
   - **Automated Embeddings**: Reference documentation at http://mongodb.com/docs/atlas/atlas-vector-search/automated-embedding/
6. **AI Chatbot**: RAG implementation using Atlas Vector Search + AWS Bedrock LLM integration via LangChain
7. **Results**: Workshop participant management

**MongoDB Integration:**
- Use the available MCP (Model Context Protocol) to understand the `listingsAndReviews` collection schema
- Implement proper database queries based on the actual collection structure

**Atlas Search & Vector Search Requirements:**
- **Atlas Search**: Use Atlas Search indexes for text search, autocomplete, and faceted search
- **Vector Search**: Implement semantic search using vector embeddings and knnBeta operator
- **Automated Embeddings**: Leverage MongoDB's automated embedding features for vector search
- **RAG Architecture**: Use vector search for retrieval in chatbot responses

**Required Deliverables:**
1. **Complete Python application** with proper file organization
2. **mongodb_indexes.json file** containing all required MongoDB indexes in JSON format:
   - Atlas Search indexes for search functionality
   - Vector Search indexes for AI chatbot with automated embeddings
   - Standard database indexes for performance
   - Include clear comments and creation instructions

**Environment Variables:**
- MONGODB_URI, AWS_REGION, LLM_MODEL, and other necessary configuration

**Additional Features:**
- Proper error handling and validation
- Environment configuration support
- CORS for frontend integration
- Compatible with existing test cases in rest-lab/ folder
- LangChain integration for AWS Bedrock connectivity
- MongoDB-based chat memory storage (bonus points)

**Technical Implementation Notes:**
- Separate filtering/statistics from advanced Atlas Search operations
- Use appropriate MongoDB operators for each search type
- Implement vector embeddings for semantic search capabilities
- Design RAG pipeline for contextual chatbot responses

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
