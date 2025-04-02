---
title: "CRUD Operations: Set"
permalink: /crud/6/
layout: single
classes: wide
---

In this section, you will learn how to perform a basic update operation in MongoDB.

## Exercise: Update a document

**Objective**  
You are required to modify a document’s field using the `crudUpdateElement` function.

**Pipeline Definition**  
1. **Navigate to the File**  
   Open `crud-6.lab.js` in the `/server/lab/` folder.  
2. **Modify the Function**  
   The inputs are:  
   - `_id` (`id`)  
   - The field name (`key`)  
   - The new value (`value`)  
   Update the document using `$set` so that the field `key` becomes `value`.  

### Exercise: Testing API Calls
1. Go to `server/lab/rest-lab`.  
2. Open `crud-6-lab.http`.  
3. Click **Send Request** to run the API call.  
4. Check that the document is correctly updated.

### Exercise: Frontend validation
Choose a listing and edit a field (e.g., Title). Refresh the page to confirm the changes are persisted.
![crud-6-lab](../../assets/images/crud-6-lab.png)
