---
title: "CRUD Operations: Find"
permalink: /crud/1/
layout: single
classes: wide
---

## 🚀 Goal: Find, Sort & Paginate Like a Pro

Master the basics of MongoDB by finding documents, sorting results, and adding smooth pagination to your queries!

---

### 🧩 Exercise: Find Documents

1. **Open the File**  
   Head to `server/src/lab/` and open `crud-1.lab.js`.

2. **Locate the Function**  
   Find the `crudFind` function in the file.

3. **Shape the Query**  
   - Find all documents matching the provided `query` parameter.
   - Sort results by `_id` in ascending order.
   - Add pagination with:
     - `skip`: number of documents to skip
     - `limit`: maximum documents to return

---

### 🚦 Test Your API

1. Go to `server/src/lab/rest-lab`.
2. Open `crud-1-lab.http`.
3. Click **Send Request** to execute the API call.
4. Check that the response returns the paginated results.
5. Run the Test Suite:
   ```bash
   cd server/
   npm test
   ```

---

### 🖥️ Frontend Validation

Refresh the homepage and watch your listings appear!  
Scroll to see pagination in action—smooth, fast, and just how users love it.

![crud-1-lab](../../assets/images/crud-1-lab.png)
