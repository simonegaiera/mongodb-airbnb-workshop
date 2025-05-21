---
title: "Atlas Search: Autocomplete"
permalink: /search/1/
layout: single
classes: wide
---

## 🚀 Goal: Autocomplete That Wows

Harness the magic of MongoDB Atlas Search to build a slick, lightning-fast autocomplete feature your users will love!

---

### 🧩 Exercise: Autocomplete Like a Pro

1. **Open the File**  
   Head to `server/src/lab/` and open `search-1.lab.js`.

2. **Find the Function**  
   Locate the `autocompleteSearch` function.

3. **Shape the Pipeline**  
   - Add a `$search` stage on the `default` index.  
   - Use `autocomplete` on the `name` field.  
   - Enable `fuzzy` search for typo-tolerant results.  
   - Limit results to 10 documents.  
   - Use `$project` to return only the `name` field.

---

### 🚦 Test Your API

1. Go to `server/src/lab/rest-lab`.  
2. Open `search-1-lab.http`.  
3. Click **Send Request** to call the API.  
4. Confirm the response contains the expected results.

---

### 🖥️ Frontend Validation

Type `"hawaii"` in the search bar and watch autocomplete suggestions appear like magic!

![search-1-lab](../../assets/images/search-1-lab.png)
