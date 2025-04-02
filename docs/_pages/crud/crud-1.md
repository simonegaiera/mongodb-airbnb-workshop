---
title: "CRUD Operations: Find"
permalink: /crud/1/
layout: single
classes: wide
---

In this section, you will learn how to perform basic find operations in MongoDB. You will complete the code snippets so that all documents matching the provided query are returned, sorted, and paginated.

## Exercise: Find

**Objective**  
Update the `crudFind` function in `crud-1.lab.js` to:
- Find all documents given the `query` in input.  
- Sort results by `_id`.  
- Implement pagination by skipping the required `skip` value and limiting the results based on `limit`.  

**Pipeline Definition**  
1. **Navigate to the File**  
   Open the file `crud-1.lab.js` located in the `/server/lab/` folder.  

2. **Locate the Function**  
   Look for the `crudFind` function in the code.  

3. **Modify the Function**  
   Update the existing code to handle querying, sorting, skipping, and limiting as required.  

### Exercise: Testing API Calls
1. Locate and open `crud-1-lab.http` in `server/lab/rest-lab`.
2. Click the **Send Request** link to run the API call.
3. Verify that the expected results are returned.

### Exercise: Frontend Validation
Refresh the homepage and check that the listings are visible. Scroll to confirm pagination works as expected.
![crud-1-lab](../../assets/images/crud-1-lab.png)
