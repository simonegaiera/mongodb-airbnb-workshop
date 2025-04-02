---
title: "CRUD Operations: Distinct"
permalink: /crud/3/
layout: single
classes: wide
---

In this section, you will learn how to perform basic find operations in MongoDB to retrieve unique values from a specific field.

## Exercise: Find Unique Values

**Objective**  
Update the `crudDistinct` function in `crud-3.lab.js` to:
- Return all `distinct` values for the document field name (`field_name`).

**Pipeline Definition**  
1. **Navigate to the File**  
   Open the file `crud-3.lab.js` located in the `/server/lab/` folder.
2. **Locate the Function**  
   Look for the `crudDistinct` function in the code.
3. **Modify the Function**  
   Update the existing code to find and return all distinct values for the given field.

### Exercise: Testing API Calls
1. Open `crud-3-lab.http` in `server/lab/rest-lab`.
2. Click the **Send Request** link to run the API call.
3. Verify that the expected unique values are returned.

### Exercise: Frontend validation
Select "Filters" on the frontend and confirm that all distinct field values are displayed.
![crud-3-lab](../../assets/images/crud-3-lab.png)
