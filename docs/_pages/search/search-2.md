---
title: "Atlas Search: Facet"
permalink: /search/2/
layout: single
classes: wide
---

## 🚀 Goal: Faceted Search That Shines

Unlock the magic of MongoDB Atlas Search facets—give your users the power to filter, explore, and discover data like never before!

---

### 🧩 Exercise: Facets in Action

1. **Open the File**  
   Navigate to `server/src/lab/` and open `search-2.lab.js`.

2. **Locate the Function**  
   Find the `facetSearch` function in the file.

3. **Shape the Pipeline**  
   - Use `$searchMeta` on the `default` index.  
   - Apply `facet` in your pipeline.  
   - For the `operator`, reuse the `autocomplete` search from the previous exercise.  
   - Create these facets:  
     - `amenities`: a string facet  
     - `property_type`: a string facet  
     - `beds`: a numeric facet with boundaries from 0 to 9, and "Other" for any additional values  

---

### 🚦 Test Your API

1. Go to `server/src/lab/rest-lab`.  
2. Open `search-2-lab.http`.  
3. Click **Send Request** to call the API.  
4. Make sure you see valid results in the response.

---

### 🖥️ Frontend Validation

Type `"hawaii"` in the search bar and watch the new facets appear—instantly filter and explore your results!

![search-2-lab](../../assets/images/search-2-lab.png)
