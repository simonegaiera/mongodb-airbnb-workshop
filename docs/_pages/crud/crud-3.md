---
title: "CRUD Operations: Distinct"
permalink: /crud/3/
layout: single
classes: wide
---

## 🚀 Goal: Discover Unique Values Like a Pro

Unlock the magic of MongoDB’s `distinct`—instantly reveal all the unique values in any field and power up your filters!

---

### 🧩 Exercise: Find Unique Values

1. **Open the File**  
   Navigate to `server/src/lab/` and open `crud-3.lab.js`.

2. **Locate the Function**  
   Find the `crudDistinct` function in the file.

3. **Shape the Query**  
   - Use the `distinct` method to retrieve all unique values for the field specified by the `field_name` parameter.
   - Return an array of all distinct values found in that field across the collection.

---

### 🚦 Test Your API

1. Go to `server/src/lab/rest-lab`.
2. Open `crud-3-lab.http`.
3. Click **Send Request** to execute the API call.
4. Verify the response returns a list of unique values for the requested field.

---

### 🖥️ Frontend Validation

Open the "Filters" panel in the app and watch all distinct values for your field appear—perfect for dynamic, user-friendly filtering!

![crud-3-lab](../../assets/images/crud-3-lab.png)
