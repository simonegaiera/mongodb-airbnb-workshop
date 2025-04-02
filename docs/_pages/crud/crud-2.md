---
title: "CRUD Operations: Find One"
permalink: /crud/2/
layout: single
classes: wide
---

In this section, you will learn how to perform a find operation in MongoDB to retrieve a single document.

## Exercise: Find One Document

**Objective**  
Update the `crudOneDocument` function in `crud-2.lab.js` to:
- Find the document with `_id` equal to the provided `id`.

**Pipeline Definition**  
1. **Navigate to the File**  
   Open the file `crud-2.lab.js` located in the `/server/lab/` folder.  
2. **Locate the Function**  
   Look for the `crudOneDocument` function in the code.  
3. **Modify the Function**  
   Update the existing code to find exactly one document by `_id`.  

### Exercise: Testing API Calls
1. Locate and open `crud-2-lab.http` in `server/lab/rest-lab`.
2. Click the **Send Request** link to run the API call.
3. Verify that the correct document is returned.

### Exercise: Frontend Validation
Select a listing and confirm that the data for the single document is displayed correctly.
![crud-2-lab](../../assets/images/crud-2-lab.png)
