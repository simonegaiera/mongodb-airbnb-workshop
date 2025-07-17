---
title: "Vibe Coding: Instructions"
permalink: /vibe/
layout: single
classes: wide
---

## MongoDB Airbnb GameDay (Vibe Coding Edition)

Welcome to the **MongoDB Airbnb Workshop Gameday**! 🚀 

Your mission is to **create the best backend possible** for this Airbnb application. The frontend is already built and waiting for you, and all API endpoints are clearly defined below. Now it's time to **vibe code your backend** and bring this application to life!

**Your Challenge:**
- ✨ Implement robust API endpoints that power the frontend
- 🏗️ Build efficient MongoDB queries and data operations  
- 🔍 Create powerful search and filtering capabilities
- 💡 Add creative features that make your backend stand out
- 🎯 Focus on performance, scalability, and clean code

**What's Provided:**
- 🎨 **Frontend**: Fully functional React application
- 📋 **API Spec**: Complete endpoint definitions and schemas
- 🗄️ **Database**: MongoDB Atlas with sample Airbnb data
- 🛠️ **Tools**: All the development tools you need

**Your Goal**: Make the frontend work flawlessly by implementing these API endpoints. Show off your skills, get creative, and build something amazing! 💪

---

## 📋 Requirements

**Technical Specifications:**
- 🌐 **Server Port**: Must run on `http://localhost:5000`
- 🌐 **Public Link**: Run on `https://<username>.<customer>.mongogameday.com/backend`
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

### Raw OpenAPI Spec
- **💾 Download JSON**(../assets/files/swagger.json)


### View Interactive Documentation
- **Swagger Editor**: Copy `swagger.json` content to [editor.swagger.io](https://editor.swagger.io/)
- **Postman**: Import `swagger.json` directly into Postman
- **Insomnia**: Import OpenAPI 3.0 specification
- **VS Code**: Use REST Client or Thunder Client extensions

---

## 📊 API Endpoints Summary

### 🏠 Listings Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/listingsAndReviews` | Get all listings with pagination |
| `POST` | `/api/listingsAndReviews` | Create a new listing |
| `GET` | `/api/listingsAndReviews/{id}` | Get specific listing by ID |
| `PATCH` | `/api/listingsAndReviews/{id}` | Update listing field |
| `DELETE` | `/api/listingsAndReviews/{id}` | Delete listing |
| `GET` | `/api/listingsAndReviews/distinct` | Get distinct field values |

### ⭐ Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/listingsAndReviews/{id}/reviews` | Add review to listing |

### 🔍 Search & Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/listingsAndReviews/filter` | Filter listings with complex criteria |
| `GET` | `/api/listingsAndReviews/statistics` | Get price statistics |
| `POST` | `/api/listingsAndReviews/autocomplete` | Search autocomplete |
| `POST` | `/api/listingsAndReviews/facet` | Faceted search |
| `POST` | `/api/listingsAndReviews/search` | Full-text search |
| `POST` | `/api/listingsAndReviews/vectorsearch` | Vector-based semantic search |

### 💬 Chat System
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Send chat message |
| `POST` | `/api/chat/clear` | Clear chat history |

### 📈 Results (Optional)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/results` | Get section results |
| `GET` | `/api/results/participants` | Get all participants |
| `GET` | `/api/results/whoami` | Get current participant info |

---

## 🔧 Example Usage

### Get All Listings
```bash
curl -X GET "http://localhost:5000/api/listingsAndReviews?page=1&limit=10" \
  -H "Content-Type: application/json"
```

### Create New Listing
```bash
curl -X POST "http://localhost:5000/api/listingsAndReviews" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cozy Downtown Apartment",
    "property_type": "Apartment",
    "room_type": "Entire home/apt",
    "price": 120,
    "bedrooms": 2,
    "bathrooms": 1,
    "accommodates": 4
  }'
```

### Search Listings
```bash
curl -X POST "http://localhost:5000/api/listingsAndReviews/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "beach house",
    "limit": 5
  }'
```

### Filter Listings
```bash
curl -X POST "http://localhost:5000/api/listingsAndReviews/filter" \
  -H "Content-Type: application/json" \
  -d '{
    "page": 1,
    "limit": 10,
    "filters": {
      "propertyType": "House",
      "beds": 3,
      "amenities": ["WiFi", "Kitchen"]
    }
  }'
```

---

## 📋 Data Schemas

### Listing Object
```json
{
  "_id": "string",
  "name": "string",
  "description": "string",
  "property_type": "string",
  "room_type": "string",
  "bedrooms": 0,
  "bathrooms": 0,
  "beds": 0,
  "price": 0,
  "accommodates": 0,
  "amenities": ["string"],
  "address": {
    "street": "string",
    "suburb": "string",
    "country": "string",
    "location": {
      "type": "Point",
      "coordinates": [longitude, latitude]
    }
  },
  "host": {
    "host_id": "string",
    "host_name": "string"
  },
  "reviews": [],
  "number_of_reviews": 0
}
```

### Review Object
```json
{
  "_id": "string",
  "date": "2024-01-01T00:00:00Z",
  "reviewer_name": "string",
  "comments": "string"
}
```

---

## 🛠️ Testing

### Postman Collection
Import the OpenAPI specification directly into Postman:
1. Open Postman
2. Click "Import" and provide the collection file
4. All endpoints will be automatically imported

### VS Code Extensions
- **REST Client**: Create `.http` files for testing
- **Thunder Client**: Built-in API testing
- **OpenAPI (Swagger) Editor**: Edit swagger.json with validation

### Testing with curl
All endpoints can be tested using curl commands. See examples above or use the "Try it out" feature in Swagger UI to generate curl commands automatically.

---

## 🔒 Authentication

Currently, the API does not require authentication.

---

## 📝 Response Formats

All responses are in JSON format with consistent error handling:

### Success Response
```json
{
  "data": [...],
  "status": "success"
}
```

### Error Response
```json
{
  "message": "Error description",
  "status": "error"
}
```
