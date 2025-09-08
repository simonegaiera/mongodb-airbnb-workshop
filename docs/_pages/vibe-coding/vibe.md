---
title: "Vibe Coding: Instructions"
permalink: /vibe/
layout: single
classes: wide
---

## MongoDB AI Arena (Vibe Coding Edition)

Welcome to the **MongoDB AI Arena**! 🚀 

Your mission is to **create the best backend possible** for this application. The frontend is already built and waiting for you, and all API endpoints are clearly defined below. Now it's time to **vibe code your backend** and bring this application to life!

**Your Challenge:**
- ✨ Implement robust API endpoints that power the frontend
- 🏗️ Build efficient MongoDB queries and data operations  
- 🔍 Create powerful search and filtering capabilities
- 💡 Add creative features that make your backend stand out
- 🎯 Focus on performance, scalability, and clean code

**What's Provided:**
- 🎨 **Frontend**: Fully functional React application
- 📋 **API Spec**: Complete endpoint definitions and schemas
- 🗄️ **Database**: MongoDB Atlas with sample rental data
- 🛠️ **Tools**: All the development tools you need

**Your Goal**: Make the frontend work flawlessly by implementing these API endpoints. Show off your skills, get creative, and build something amazing! 💪

---

## 📋 Requirements

**Technical Specifications:**
- 🌐 **Server Port**: Must run on `http://localhost:5000`
- 🌐 **Public Link**: Run on `https://<username>.<customer>.mongoarena.com/backend`
- 📋 **Documentation Format**: OpenAPI 3.0
- 🛠️ **Language**: Build in **any programming language** you prefer
- 🎯 **Framework**: Use any web framework (Express.js, FastAPI, Spring Boot, etc.)
- 🗄️ **Database**: MongoDB Atlas (connection details provided)

**Implementation Freedom:**
- ✨ **Your Choice**: Node.js, Python, Java
- 🏗️ **Your Framework**: Express, SpringBoot, FastAPI, Flask
- 💡 **Your Style**: RESTful APIs following the provided OpenAPI specification
- 🚀 **Your Creativity**: Add bonus features and optimizations

---

## 📋 API Documentation Preview

### 🚀 Interactive Documentation

- **[📖 Open in Swagger Editor](https://editor.swagger.io/?url=https%3A//raw.githubusercontent.com/simonegaiera/mongodb-airbnb-workshop/main/docs/assets/files/swagger.json)**  
  1. Go to Swagger Editor.  
  2. Click on **File > Import URL**.  
  3. Paste this URL:  
     ```
     https://raw.githubusercontent.com/simonegaiera/mongodb-airbnb-workshop/main/docs/assets/files/swagger.json
     ```
  4. The API documentation will load automatically.

- **[💾 Download swagger.json](../assets/files/swagger.json)** – Local file

---

## 🎯 API Endpoints Overview

### 🏠 **Listings & Analytics** *(Comprehensive Listing Operations)*
<div style="overflow-x: auto; margin: 1.5rem 0;">
<table style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
  <thead>
    <tr style="background: linear-gradient(135deg, #ff6b6b, #ee5a24); color: white;">
      <th style="padding: 1rem; text-align: left; font-weight: 600; border: none;">🔧 Method</th>
      <th style="padding: 1rem; text-align: left; font-weight: 600; border: none;">🌐 Endpoint</th>
      <th style="padding: 1rem; text-align: left; font-weight: 600; border: none;">📝 Description</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom: 1px solid #f1f3f4; transition: background-color 0.2s;">
      <td style="padding: 1rem; border: none;"><span style="background: #e8f5e8; color: #2d5a2d; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 600; font-family: monospace;">GET</span></td>
      <td style="padding: 1rem; border: none; font-family: monospace; color: #1a73e8;">/api/listingsAndReviews</td>
      <td style="padding: 1rem; border: none;">📄 Get all listings with pagination</td>
    </tr>
    <tr style="background: #fafbfc; border-bottom: 1px solid #f1f3f4; transition: background-color 0.2s;">
      <td style="padding: 1rem; border: none;"><span style="background: #e3f2fd; color: #1565c0; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 600; font-family: monospace;">POST</span></td>
      <td style="padding: 1rem; border: none; font-family: monospace; color: #1a73e8;">/api/listingsAndReviews</td>
      <td style="padding: 1rem; border: none;">✨ Create a new listing</td>
    </tr>
    <tr style="border-bottom: 1px solid #f1f3f4; transition: background-color 0.2s;">
      <td style="padding: 1rem; border: none;"><span style="background: #e8f5e8; color: #2d5a2d; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 600; font-family: monospace;">GET</span></td>
      <td style="padding: 1rem; border: none; font-family: monospace; color: #1a73e8;">/api/listingsAndReviews/{id}</td>
      <td style="padding: 1rem; border: none;">🎯 Get specific listing by ID</td>
    </tr>
    <tr style="background: #fafbfc; border-bottom: 1px solid #f1f3f4; transition: background-color 0.2s;">
      <td style="padding: 1rem; border: none;"><span style="background: #fff3e0; color: #e65100; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 600; font-family: monospace;">PATCH</span></td>
      <td style="padding: 1rem; border: none; font-family: monospace; color: #1a73e8;">/api/listingsAndReviews/{id}</td>
      <td style="padding: 1rem; border: none;">🔧 Update listing field</td>
    </tr>
    <tr style="border-bottom: 1px solid #f1f3f4; transition: background-color 0.2s;">
      <td style="padding: 1rem; border: none;"><span style="background: #ffebee; color: #c62828; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 600; font-family: monospace;">DELETE</span></td>
      <td style="padding: 1rem; border: none; font-family: monospace; color: #1a73e8;">/api/listingsAndReviews/{id}</td>
      <td style="padding: 1rem; border: none;">🗑️ Delete listing</td>
    </tr>
    <tr style="background: #fafbfc; border-bottom: 1px solid #f1f3f4; transition: background-color 0.2s;">
      <td style="padding: 1rem; border: none;"><span style="background: #e3f2fd; color: #1565c0; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 600; font-family: monospace;">POST</span></td>
      <td style="padding: 1rem; border: none; font-family: monospace; color: #1a73e8;">/api/listingsAndReviews/{id}/reviews</td>
      <td style="padding: 1rem; border: none;">💬 Add review to listing</td>
    </tr>
    <tr style="border-bottom: 1px solid #f1f3f4; transition: background-color 0.2s;">
      <td style="padding: 1rem; border: none;"><span style="background: #e8f5e8; color: #2d5a2d; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 600; font-family: monospace;">GET</span></td>
      <td style="padding: 1rem; border: none; font-family: monospace; color: #1a73e8;">/api/listingsAndReviews/distinct</td>
      <td style="padding: 1rem; border: none;">🔍 Get distinct field values</td>
    </tr>
    <tr style="background: #fafbfc; border-bottom: 1px solid #f1f3f4; transition: background-color 0.2s;">
      <td style="padding: 1rem; border: none;"><span style="background: #e3f2fd; color: #1565c0; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 600; font-family: monospace;">POST</span></td>
      <td style="padding: 1rem; border: none; font-family: monospace; color: #1a73e8;">/api/listingsAndReviews/filter</td>
      <td style="padding: 1rem; border: none;">🎛️ Filter listings with complex criteria</td>
    </tr>
    <tr style="background: #fafbfc;">
      <td style="padding: 1rem; border: none;"><span style="background: #e8f5e8; color: #2d5a2d; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 600; font-family: monospace;">GET</span></td>
      <td style="padding: 1rem; border: none; font-family: monospace; color: #1a73e8;">/api/listingsAndReviews/statistics</td>
      <td style="padding: 1rem; border: none;">📊 Get price statistics</td>
    </tr>
  </tbody>
</table>
</div>

> **🏠 Comprehensive Listing Operations**: This unified section includes CRUD operations for listings, reviews management, advanced filtering using MongoDB aggregation pipelines, and statistical analysis with aggregated data operations. All core listing functionality is consolidated here for better organization.

### 🔎 **Atlas Search** *(Advanced Lexical Search Features)*
<div style="overflow-x: auto; margin: 1.5rem 0;">
<table style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
  <thead>
    <tr style="background: linear-gradient(135deg, #4facfe, #00f2fe); color: white;">
      <th style="padding: 1rem; text-align: left; font-weight: 600; border: none;">🔧 Method</th>
      <th style="padding: 1rem; text-align: left; font-weight: 600; border: none;">🌐 Endpoint</th>
      <th style="padding: 1rem; text-align: left; font-weight: 600; border: none;">📝 Description</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom: 1px solid #f1f3f4; transition: background-color 0.2s;">
      <td style="padding: 1rem; border: none;"><span style="background: #e3f2fd; color: #1565c0; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 600; font-family: monospace;">POST</span></td>
      <td style="padding: 1rem; border: none; font-family: monospace; color: #1a73e8;">/api/listingsAndReviews/autocomplete</td>
      <td style="padding: 1rem; border: none;">⚡ Search autocomplete</td>
    </tr>
    <tr style="background: #fafbfc; border-bottom: 1px solid #f1f3f4; transition: background-color 0.2s;">
      <td style="padding: 1rem; border: none;"><span style="background: #e3f2fd; color: #1565c0; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 600; font-family: monospace;">POST</span></td>
      <td style="padding: 1rem; border: none; font-family: monospace; color: #1a73e8;">/api/listingsAndReviews/facet</td>
      <td style="padding: 1rem; border: none;">🔎 Faceted search</td>
    </tr>
    <tr style="background: #fafbfc;">
      <td style="padding: 1rem; border: none;"><span style="background: #e3f2fd; color: #1565c0; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 600; font-family: monospace;">POST</span></td>
      <td style="padding: 1rem; border: none; font-family: monospace; color: #1a73e8;">/api/listingsAndReviews/search</td>
      <td style="padding: 1rem; border: none;">🔍 Full-text search</td>
    </tr>
  </tbody>
</table>
</div>

> **💡 Atlas Search Integration**: These endpoints are designed to leverage MongoDB Atlas Search capabilities for advanced lexical search functionality including full-text search, autocomplete, and faceted search. You're expected to implement these features using Atlas Search indexes and operators for lexical search operations.

### 🧠 **AI & Vector Search** *(Advanced AI-Powered Functionality)*
<div style="overflow-x: auto; margin: 1.5rem 0;">
<table style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
  <thead>
    <tr style="background: linear-gradient(135deg, #a8edea, #fed6e3); color: #333;">
      <th style="padding: 1rem; text-align: left; font-weight: 600; border: none;">🔧 Method</th>
      <th style="padding: 1rem; text-align: left; font-weight: 600; border: none;">🌐 Endpoint</th>
      <th style="padding: 1rem; text-align: left; font-weight: 600; border: none;">📝 Description</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom: 1px solid #f1f3f4; transition: background-color 0.2s;">
      <td style="padding: 1rem; border: none;"><span style="background: #e3f2fd; color: #1565c0; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 600; font-family: monospace;">POST</span></td>
      <td style="padding: 1rem; border: none; font-family: monospace; color: #1a73e8;">/api/listingsAndReviews/vectorsearch</td>
      <td style="padding: 1rem; border: none;">🧠 Vector-based semantic search</td>
    </tr>
    <tr style="background: #fafbfc; border-bottom: 1px solid #f1f3f4; transition: background-color 0.2s;">
      <td style="padding: 1rem; border: none;"><span style="background: #e3f2fd; color: #1565c0; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 600; font-family: monospace;">POST</span></td>
      <td style="padding: 1rem; border: none; font-family: monospace; color: #1a73e8;">/api/chat</td>
      <td style="padding: 1rem; border: none;">💬 Send chat message to AI chatbot</td>
    </tr>
    <tr style="background: #fafbfc;">
      <td style="padding: 1rem; border: none;"><span style="background: #e3f2fd; color: #1565c0; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 600; font-family: monospace;">POST</span></td>
      <td style="padding: 1rem; border: none; font-family: monospace; color: #1a73e8;">/api/chat/clear</td>
      <td style="padding: 1rem; border: none;">🧹 Clear chat history and memory</td>
    </tr>
  </tbody>
</table>
</div>

> **🧠 Advanced AI-Powered Features**: This unified section combines semantic search operations using MongoDB Atlas Vector Search with automated embeddings and knnBeta operator, plus AI chatbot capabilities with RAG (Retrieval-Augmented Generation), AWS Bedrock LLM integration via LangChain, and MongoDB-based conversation memory storage. All AI and vector search functionality is consolidated here for better organization.

### 📈 **Results**
<div style="overflow-x: auto; margin: 1.5rem 0;">
<table style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
  <thead>
    <tr style="background: linear-gradient(135deg, #ffecd2, #fcb69f); color: #333;">
      <th style="padding: 1rem; text-align: left; font-weight: 600; border: none;">🔧 Method</th>
      <th style="padding: 1rem; text-align: left; font-weight: 600; border: none;">🌐 Endpoint</th>
      <th style="padding: 1rem; text-align: left; font-weight: 600; border: none;">📝 Description</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom: 1px solid #f1f3f4; transition: background-color 0.2s;">
      <td style="padding: 1rem; border: none;"><span style="background: #e8f5e8; color: #2d5a2d; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 600; font-family: monospace;">GET</span></td>
      <td style="padding: 1rem; border: none; font-family: monospace; color: #1a73e8;">/api/results</td>
      <td style="padding: 1rem; border: none;">📊 Get section results</td>
    </tr>
    <tr style="background: #fafbfc; border-bottom: 1px solid #f1f3f4; transition: background-color 0.2s;">
      <td style="padding: 1rem; border: none;"><span style="background: #e8f5e8; color: #2d5a2d; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 600; font-family: monospace;">GET</span></td>
      <td style="padding: 1rem; border: none; font-family: monospace; color: #1a73e8;">/api/results/participants</td>
      <td style="padding: 1rem; border: none;">👥 Get all participants</td>
    </tr>
    <tr style="background: #fafbfc;">
      <td style="padding: 1rem; border: none;"><span style="background: #e8f5e8; color: #2d5a2d; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 600; font-family: monospace;">GET</span></td>
      <td style="padding: 1rem; border: none; font-family: monospace; color: #1a73e8;">/api/results/whoami</td>
      <td style="padding: 1rem; border: none;">🙋‍♂️ Get current participant info</td>
    </tr>
  </tbody>
</table>
</div>

---

## 🗄️ MongoDB Collection Schema & Performance

### Understanding the `listingsAndReviews` Collection

**Database Usage**:
- 🏠 **Primary Collection**: All listing-related endpoints (`/api/listingsAndReviews/*`) use the `listingsAndReviews` collection
- 🔍 **Atlas Search**: Search endpoints (`/autocomplete`, `/facet`, `/search`) operate on the `listingsAndReviews` collection
- 🧠 **Vector Search**: The `/vectorsearch` endpoint uses the `listingsAndReviews` collection with automated embeddings
- 💬 **Chat System**: Chat endpoints (`/api/chat/*`) use the `listingsAndReviews` collection for RAG operations
- 📊 **Results Data**: Only the Results endpoints (`/api/results/*`) use data from the `arena_shared` database

**MCP Integration Available**: There is a Model Context Protocol (MCP) available that can help you understand the structure and schema of the two collections. This MCP provides insights into:
- Field types and structures
- Data patterns and relationships
- Sample document formats
- Nested object schemas

**Recommendation**: Leverage the MCP to properly understand the MongoDB collection schema before implementing your API endpoints. This will ensure accurate field mappings, proper data validation, and efficient query construction.

**Key Collection Features**:
- 🏠 **Rich Listing Data**: Property details, amenities, location information
- ⭐ **Embedded Reviews**: Review arrays with dates, comments, and reviewer info
- 📍 **Geospatial Data**: Location coordinates for mapping and proximity searches
- 🏷️ **Categorical Fields**: Property types, room types, amenities for filtering
- 💰 **Pricing Information**: Nightly rates and pricing structures

### 📋 Data Schemas
```json
{
  "_id": "string",
  "listing_url": "string",
  "name": "string",
  "summary": "string",
  "space": "string",
  "description": "string",
  "neighborhood_overview": "string",
  "notes": "string",
  "transit": "string",
  "access": "string",
  "interaction": "string",
  "house_rules": "string",
  "property_type": "string",
  "room_type": "string",
  "bed_type": "string",
  "minimum_nights": "string",
  "maximum_nights": "string",
  "cancellation_policy": "string",
  "last_scraped": "Date",
  "calendar_last_scraped": "Date",
  "accommodates": "Number",
  "bedrooms": "Number",
  "beds": "Number",
  "number_of_reviews": "Number",
  "bathrooms": "Decimal128",
  "amenities": ["string"],
  "price": "Decimal128",
  "weekly_price": "Decimal128",
  "monthly_price": "Decimal128",
  "cleaning_fee": "Decimal128",
  "extra_people": "Decimal128",
  "guests_included": "Decimal128",
  "security_deposit": "Decimal128",
  "images": {
    "thumbnail_url": "string",
    "medium_url": "string",
    "picture_url": "string",
    "xl_picture_url": "string"
  },
  "host": {
    "host_id": "string",
    "host_url": "string",
    "host_name": "string",
    "host_location": "string",
    "host_about": "string",
    "host_thumbnail_url": "string",
    "host_picture_url": "string",
    "host_neighbourhood": "string",
    "host_is_superhost": "Boolean",
    "host_has_profile_pic": "Boolean",
    "host_identity_verified": "Boolean",
    "host_listings_count": "Number",
    "host_total_listings_count": "Number",
    "host_verifications": ["string"],
    "host_response_time": "string",
    "host_response_rate": "Number"
  },
  "address": {
    "street": "string",
    "suburb": "string",
    "government_area": "string",
    "market": "string",
    "country": "string",
    "country_code": "string",
    "location": {
      "type": "string",
      "coordinates": ["Number"],
      "is_location_exact": "Boolean"
    }
  },
  "availability": {
    "availability_30": "Number",
    "availability_60": "Number",
    "availability_90": "Number",
    "availability_365": "Number"
  },
  "review_scores": {
    "review_scores_accuracy": "Number",
    "review_scores_cleanliness": "Number",
    "review_scores_checkin": "Number",
    "review_scores_communication": "Number",
    "review_scores_location": "Number",
    "review_scores_value": "Number",
    "review_scores_rating": "Number"
  },
  "reviews": [
    {
      "_id": "string",
      "date": "Date",
      "listing_id": "string",
      "reviewer_id": "string",
      "reviewer_name": "string",
      "comments": "string"
    }
  ],
  "first_review": "Date",
  "last_review": "Date",
  "updated_at": "Date"
}
```

**Important Data Types:**
- **Decimal128**: Used for precise monetary values (`price`, `weekly_price`, `monthly_price`, `cleaning_fee`, `extra_people`, `guests_included`, `security_deposit`, `bathrooms`)
- **Number**: Used for integers (`accommodates`, `bedrooms`, `beds`, `number_of_reviews`, host counts, availability counts, review scores)
- **Date**: Used for timestamps (`last_scraped`, `calendar_last_scraped`, `first_review`, `last_review`, `updated_at`, review dates)
- **Boolean**: Used for true/false values (host verification flags, location exactness)
- **Array**: Used for lists (`amenities`, `host_verifications`, `reviews`, `coordinates`)
- **Document**: Used for nested objects (`images`, `host`, `address`, `availability`, `review_scores`)

### ⚡ Performance Requirements & Index Creation

**Performance is Key**: Your application must be fast and responsive. Slow queries will hurt user experience and your ranking in the competition!

**Index Strategy**: Ask your LLM to create comprehensive index definitions that cover:
- 🔍 **Query Performance**: Indexes for all filtering and sorting operations
- 📊 **Aggregation Support**: Indexes optimized for statistics and analytics
- 🌐 **Atlas Search**: Full-text search indexes for autocomplete, facet, and text search
- 🧠 **Vector Search**: Vector indexes with automated embeddings for semantic search
- 📍 **Geospatial**: 2dsphere indexes for location-based queries

**Index Creation Options**:

1. **Via MCP** (Preferred if available):
   ```
   Use the MCP to create indexes directly in your MongoDB cluster.
   This is the fastest way to get your indexes deployed automatically.
   ```

2. **Manual Creation** (Fallback):
   ```
   Request your LLM to generate a comprehensive mongodb_indexes.json file
   containing all required index definitions. You'll need to create these
   indexes manually in MongoDB Atlas or via your application startup code.
   ```

**Required Index Types**:
- ✅ **Standard Database Indexes**: For basic CRUD operations and filtering
- ✅ **Atlas Search Indexes**: For text search, autocomplete, and faceted search
- ✅ **Vector Search Indexes**: For semantic search with automated embeddings
- ✅ **Compound Indexes**: For complex queries with multiple filter criteria
- ✅ **Geospatial Indexes**: For location-based searches and proximity queries

**Performance Tips**:
- 🎯 **Index Coverage**: Ensure all your queries are covered by appropriate indexes
- 📈 **Monitor Performance**: Use MongoDB Atlas Performance Advisor
- 🔄 **Query Optimization**: Design queries that leverage your indexes efficiently
- 📊 **Aggregation Pipelines**: Optimize pipelines with proper index support

> **💡 Pro Tip**: Ask your LLM to analyze your API endpoints and automatically generate the optimal index strategy. A well-indexed application can be 100x faster than one without proper indexes!

---

## 🚀 Enhanced Implementation Guide

### **MongoDB Collection Understanding**
- **Use the MCP**: Leverage the available Model Context Protocol to understand the `listingsAndReviews` collection structure
- **Schema Exploration**: Use the MCP insights to implement proper field mappings and data validation
- **Query Optimization**: Build efficient MongoDB queries based on the actual collection schema

### **Atlas Search Implementation**
For the Atlas Search endpoints (`/autocomplete`, `/facet`, `/search`):
- **Search Indexes**: Create appropriate Atlas Search indexes for lexical search
- **Search Operators**: Use Atlas Search operators like `text`, `autocomplete`, and `facet`
- **Performance**: Optimize search queries for fast response times
- **Relevance**: Implement proper scoring and ranking for search results

**Field Mappings**:
- **name** (for autocomplete): Enable autocomplete search on listing names
- **amenities** (for facet): Support faceted filtering by available amenities
- **property_type** (for facet): Allow filtering by property type categories
- **beds** (for numeric facet): Enable range filtering on number of beds

> **📋 Index Requirements**:
> - **Lexical Search Index**: Create a single Atlas Search index that supports all lexical search operations (`/search`, `/facet`, `/autocomplete`) using appropriate operators and analyzers

### **Atlas Vector Search Implementation**
For the Vector Search endpoint (`/vectorsearch`):
- **Vector Index**: Create Atlas Vector Search index with **automated embeddings**
- **Auto Embedding**: Leverage MongoDB's automated embedding feature for seamless vector operations
- **Embedding Field**: Configure automated embeddings on the `description` field for semantic search capabilities

> **📋 Index Requirements**:
> - **Vector Search Index**: Create a separate vector search index specifically for the `/vectorsearch` endpoint with automated embeddings on the `description` field
- **Automated Embeddings**: Reference documentation at http://mongodb.com/docs/atlas/atlas-vector-search/automated-embedding/

> **🎯 Vector Search Parameters**:
> - **numCandidates**: Set to 100 for optimal performance and accuracy
> - **limit**: Return top 10 most relevant results

> **💡 Important**: Ensure your MongoDB Atlas cluster is properly configured for Vector Search, including the creation of a dedicated vector search index with automated embeddings on the `description` field. Reference the latest documentation for detailed setup instructions.

### **Chat System Implementation**
For the Chat endpoints (`/chat`, `/chat/clear`):
- **Vector Search**: Use Atlas Vector Search with **automated embeddings** to find relevant listings based on user queries
- **LLM Integration**: Connect to AWS Bedrock using LangChain for natural language processing
- **Memory Management**: Use LangChain to store the chat history in MongoDB collections
- **RAG Architecture**: Implement Retrieval-Augmented Generation for accurate, context-aware responses
- **Session Handling**: Maintain conversation continuity across multiple interactions
- **Embedding Strategy**: Use automated embeddings for both document indexing and query processing in vector operations

### **Development Workflow**
1. **Explore**: Use the MCP to understand the collection schema
2. **Index Planning**: Ask LLM to create comprehensive index definitions for performance
3. **Index Creation**: Deploy indexes via MCP or manually from generated JSON file
4. **Plan**: Design your API endpoints based on the schema insights
5. **Implement**: Build the REST API following the OpenAPI specification
6. **Test**: Use the provided test cases in the `rest-lab/` folder
7. **Optimize**: Fine-tune queries and add performance improvements
8. **Monitor**: Check query performance and adjust indexes if needed

### **Bonus Features** *(Get Creative!)*
- 🚀 **Caching**: Implement Redis or in-memory caching for frequently accessed data
- 📊 **Analytics**: Add advanced analytics and reporting endpoints
- 🔒 **Rate Limiting**: Implement API rate limiting for production readiness
- 📝 **Logging**: Add comprehensive logging and monitoring
- 🎯 **Validation**: Implement robust input validation and error handling
- 🔍 **Advanced Search**: Create innovative lexical search features using Atlas Search capabilities
- 🧠 **Smart Memory**: Store chat conversation history in MongoDB for personalized experiences
- 🤖 **Intelligent Responses**: Use automated vector embeddings for contextually relevant listing recommendations
- ⚡ **Auto Embedding**: Leverage MongoDB's automated embedding capabilities for vector search operations


---

## 🛠️ Testing

### Postman Collection
Import the OpenAPI specification directly into Postman:
1. Open Postman
2. Click "Import" and provide the collection file
4. All endpoints will be automatically imported

### VS Code Extensions
- **REST Client**: Create `.http` files for testing

### Testing with curl
All endpoints can be tested using curl commands. See examples above or use the "Try it out" feature in Swagger UI to generate curl commands automatically.

---

## 🔒 Authentication

Currently, the API does not require authentication.
