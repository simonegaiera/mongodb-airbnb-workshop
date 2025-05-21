---
title: "CRUD Operations: Find One"
permalink: /crud/2/
layout: single
classes: wide
---

## 🚀 Goal: Instantly Retrieve a Single Document

Unlock the power of MongoDB’s `findOne`—fetch exactly what you need, fast!

---

### 🧩 Exercise: Find One Document

1. **Open the File**  
   Navigate to `server/src/lab/` and open `crud-2.lab.js`.

2. **Locate the Function**  
   Find the `crudOneDocument` function in the file.

3. **Shape the Query**  
   - Implement the function to find one document where `_id` equals the provided `id` parameter.
   - Return the complete document that matches this criteria.

---

### 🚦 Test Your API

1. Go to `server/src/lab/rest-lab`.
2. Open `crud-2-lab.http`.
3. Click **Send Request** to execute the API call.
4. Verify the response returns the single document you requested.

---

### 🖥️ Frontend Validation

Select a listing in the app and watch all the details for that single document appear—fast, focused, and flawless!

![crud-2-lab](../../assets/images/crud-2-lab.png)
