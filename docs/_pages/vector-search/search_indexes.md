---
title: "Atlas Vector Search: Index Creation"
permalink: /vector-search/index/
layout: single
classes: wide
---

## 🚀 Goal: Enable Semantic Search with Atlas Vector Search Indexes

Your business wants to deliver smarter, AI-powered search experiences—helping users find the perfect stay, even when they use natural language. To unlock this, you’ll create a **Vector Search index** in MongoDB Atlas. As the backend engineer, you’re laying the foundation for semantic search and conversational AI.

In this exercise, you’ll configure a vector index that enables semantic search on your listings’ descriptions, using MongoDB’s built-in embedding model, and add a filter field for property type.

---

### 🧩 Exercise: Create Your Vector Search Index

Follow these steps:

1. **Open Atlas Search**
   - In your MongoDB Atlas cluster, navigate to the **Search** tab.

2. **Create a New Index**
   - Click **Create Search Index**.
   - Choose **Vector Search** as the index type.
   - Select **"I want to semantically search text fields"**.

3. **Configure the Index**
   - **Text Field Path:** `description`
   - **Embedding Model:** Keep the **recommended** model (default).
   - **Filter Field Path:** `property_type`  
     (Optionally index this field to pre-filter your data and improve query performance.)

4. **Save and Build**
   - Click **Create Index** to start building your vector index.

---

### 🚦 What to Expect

Once your vector index is live, your platform will be ready for:
- **Semantic search** that understands user intent, not just keywords.
- **AI-powered chatbots** that can match guest queries to the best listings.
- **Faster, more relevant results** by filtering on property type.
- The foundation for advanced, conversational discovery experiences.

With this step, you’re not just indexing data—you’re enabling the next generation of search and AI on your platform.  
**Ready to unlock semantic search? Let’s
