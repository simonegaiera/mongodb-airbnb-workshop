---
title: "CRUD Operations: Find/Query"
permalink: /crud/4/
layout: single
classes: wide
---

## 🚀 Goal: Advanced Filtering & Pagination Like a Pro

Level up your MongoDB skills—build powerful queries with multiple filters and smooth pagination for a truly dynamic search experience!

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
2. Open `crud-4-lab.http`.
3. Click **Send Request** to execute the API call.
4. Confirm the response returns documents matching your filters.

---

### 🖥️ Frontend Validation

Set different filters in the app’s "Filters" panel and watch your listings update in real time—fast, flexible, and user-friendly!

![crud-4-lab](../../assets/images/crud-4-lab.png)
