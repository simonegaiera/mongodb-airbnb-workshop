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

### 🚀 Interactive Documentation
- **[📖 Open in Swagger Editor](https://editor.swagger.io/?url=https://raw.githubusercontent.com/simonegaiera/mongodb-airbnb-workshop/main/docs/assets/files/swagger.json)** - Instant preview
- **[💾 Download swagger.json](../assets/files/swagger.json)** - Local file

---

## 🎯 API Endpoints Overview

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 15px; margin: 2rem 0; color: white; text-align: center;">
  <h3 style="margin: 0; font-size: 1.5rem; font-weight: bold;">🚀 Complete API Reference</h3>
  <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Build powerful endpoints that bring your Airbnb app to life</p>
</div>

### 🏠 **Listings Management**
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
    <tr style="background: #fafbfc;">
      <td style="padding: 1rem; border: none;"><span style="background: #e8f5e8; color: #2d5a2d; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 600; font-family: monospace;">GET</span></td>
      <td style="padding: 1rem; border: none; font-family: monospace; color: #1a73e8;">/api/listingsAndReviews/distinct</td>
      <td style="padding: 1rem; border: none;">🔍 Get distinct field values</td>
    </tr>
  </tbody>
</table>
</div>

### ⭐ **Reviews**
<div style="overflow-x: auto; margin: 1.5rem 0;">
<table style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
  <thead>
    <tr style="background: linear-gradient(135deg, #ffd89b, #19547b); color: white;">
      <th style="padding: 1rem; text-align: left; font-weight: 600; border: none;">🔧 Method</th>
      <th style="padding: 1rem; text-align: left; font-weight: 600; border: none;">🌐 Endpoint</th>
      <th style="padding: 1rem; text-align: left; font-weight: 600; border: none;">📝 Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 1rem; border: none;"><span style="background: #e3f2fd; color: #1565c0; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 600; font-family: monospace;">POST</span></td>
      <td style="padding: 1rem; border: none; font-family: monospace; color: #1a73e8;">/api/listingsAndReviews/{id}/reviews</td>
      <td style="padding: 1rem; border: none;">💬 Add review to listing</td>
    </tr>
  </tbody>
</table>
</div>

### 🔍 **Search & Analytics**
<div style="overflow-x: auto; margin: 1.5rem 0;">
<table style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
  <thead>
    <tr style="background: linear-gradient(135deg, #667eea, #764ba2); color: white;">
      <th style="padding: 1rem; text-align: left; font-weight: 600; border: none;">🔧 Method</th>
      <th style="padding: 1rem; text-align: left; font-weight: 600; border: none;">🌐 Endpoint</th>
      <th style="padding: 1rem; text-align: left; font-weight: 600; border: none;">📝 Description</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom: 1px solid #f1f3f4; transition: background-color 0.2s;">
      <td style="padding: 1rem; border: none;"><span style="background: #e3f2fd; color: #1565c0; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 600; font-family: monospace;">POST</span></td>
      <td style="padding: 1rem; border: none; font-family: monospace; color: #1a73e8;">/api/listingsAndReviews/filter</td>
      <td style="padding: 1rem; border: none;">🎛️ Filter listings with complex criteria</td>
    </tr>
    <tr style="background: #fafbfc; border-bottom: 1px solid #f1f3f4; transition: background-color 0.2s;">
      <td style="padding: 1rem; border: none;"><span style="background: #e8f5e8; color: #2d5a2d; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 600; font-family: monospace;">GET</span></td>
      <td style="padding: 1rem; border: none; font-family: monospace; color: #1a73e8;">/api/listingsAndReviews/statistics</td>
      <td style="padding: 1rem; border: none;">📊 Get price statistics</td>
    </tr>
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
    <tr style="border-bottom: 1px solid #f1f3f4; transition: background-color 0.2s;">
      <td style="padding: 1rem; border: none;"><span style="background: #e3f2fd; color: #1565c0; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 600; font-family: monospace;">POST</span></td>
      <td style="padding: 1rem; border: none; font-family: monospace; color: #1a73e8;">/api/listingsAndReviews/search</td>
      <td style="padding: 1rem; border: none;">🔍 Full-text search</td>
    </tr>
    <tr style="background: #fafbfc;">
      <td style="padding: 1rem; border: none;"><span style="background: #e3f2fd; color: #1565c0; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 600; font-family: monospace;">POST</span></td>
      <td style="padding: 1rem; border: none; font-family: monospace; color: #1a73e8;">/api/listingsAndReviews/vectorsearch</td>
      <td style="padding: 1rem; border: none;">🧠 Vector-based semantic search</td>
    </tr>
  </tbody>
</table>
</div>

### 💬 **Chat System**
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
      <td style="padding: 1rem; border: none; font-family: monospace; color: #1a73e8;">/api/chat</td>
      <td style="padding: 1rem; border: none;">💬 Send chat message</td>
    </tr>
    <tr style="background: #fafbfc;">
      <td style="padding: 1rem; border: none;"><span style="background: #e3f2fd; color: #1565c0; padding: 0.3rem 0.6rem; border-radius: 6px; font-weight: 600; font-family: monospace;">POST</span></td>
      <td style="padding: 1rem; border: none; font-family: monospace; color: #1a73e8;">/api/chat/clear</td>
      <td style="padding: 1rem; border: none;">🧹 Clear chat history</td>
    </tr>
  </tbody>
</table>
</div>

### 📈 **Results** *(Optional)*
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

### Testing with curl
All endpoints can be tested using curl commands. See examples above or use the "Try it out" feature in Swagger UI to generate curl commands automatically.

---

## 🔒 Authentication

Currently, the API does not require authentication.
