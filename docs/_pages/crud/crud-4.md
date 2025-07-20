---
title: "CRUD Operations: Find/Query"
permalink: /crud/4/
layout: single
classes: wide
---

## 🚀 Goal: Advanced Filtering & Pagination Like a Pro

Your platform is now buzzing with listings, and your users want to find their perfect stay—fast. Imagine a guest searching for a cozy apartment with a hot tub, or a family looking for a house with just the right number of beds. As the backend engineer, it’s your job to make these searches seamless and powerful.

In this exercise, you’ll combine multiple filters and pagination to create a dynamic, user-friendly search experience. With MongoDB, you’ll let guests filter by amenities, property type, and bed count—returning only the listings that match their dreams.

---

### 🧩 Exercise: Find Documents with Filters

1. **Open the File**  
   Navigate to `server/src/lab/` and open `crud-4.lab.js`.

2. **Locate the Function**  
   Find the `crudFilter` function in the file.

3. **Shape the Query**  
   - Filter by:
     - `amenities`: array of selected amenities
     - `propertyType`: specific property type
     - `beds`: range of beds (format: "2-3", "4-7")
   - Add pagination with:
     - `skip`: number of documents to skip
     - `limit`: maximum documents to return
   - No filters? Return all documents (with pagination).

---

### 🚦 Test Your API

1. Go to `server/src/lab/rest-lab`.
2. Open `crud-4-filter-lab.http`.
3. Click **Send Request** to execute the API call.
4. Confirm the response returns documents matching your filters.

---

### 🖥️ Frontend Validation

Set different filters in the app’s "Filters" panel and watch your listings update in real time—fast, flexible, and user-friendly! This is the search experience that keeps guests coming back, and it’s all powered by your code.

With this step, you’re not just filtering data—you’re helping every guest find their perfect stay, no matter what they’re looking for.  
**Ready to make your platform truly dynamic? Let’s get started!**

![crud-4-lab](../../assets/images/crud-4-lab.png)
