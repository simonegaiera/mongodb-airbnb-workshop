---
title: "CRUD Operations: Set"
permalink: /crud/6/
layout: single
classes: wide
---

In this section, you will learn how to perform basic find operations in MongoDB. You will be required to complete the code snippets to achieve the desired results.

## Exercise: Update a document

**Objective** 
In this exercise, you will be required to modify a document.

**Pipeline Definition**  

1. **Navigate to the File**: In the `lab` folder open `crud-6.lab.js`.
2. **Modify the Function**: Locate and modify the `crudUpdateElement` function.
3. **Update the Code**:
    - The input for this function are:
        - the `_id` as the `id`
        - the name of the field you want to update `key`
        - the new value for the field you want to update `value`
    - Modify the function to update (`$set`) the required document with the given `value` for the given `key`

### Exercise: Testing API Calls

1. Navigate to the directory: `server/lab/rest-lab`.
2. Open the file named `crud-6-lab.http`.
3. In the file, locate and click the `Send Request` link to execute the API call.
4. Verify that the endpoint is returning the expected results.

### Exercise: Frontend validation
Select one listing, and try to edit the Title. Refresh the page to validate the changes.
![crud-6-lab](../../assets/images/crud-6-lab.png)
