---
title: "CRUD Operations: Find"
permalink: /crud/1/
layout: single
classes: wide
---

In this section, you will learn how to perform basic find operations in MongoDB. You will be required to complete the code snippets to achieve the desired results.

## Exercise: Find

**Objective** 
In this exercise, you will be required to find documents given a query.

**Pipeline Definition**  

1. **Navigate to the File**: In the `lab` folder open `crud-1.lab.js`.
2. **Modify the Function**: Locate and modify the `crudFind` function.
3. **Update the Code**:
    - You are required to find all the documents given the `query` in input
    - Results should be sorted by `_id`
    - Define pagination, skipping the required `skip` pages, and limit results based on `limit`

### Exercise: Testing API Calls

1. Navigate to the directory: `server/lab/rest-lab`.
2. Open the file named `crud-1-lab.http`.
3. In the file, locate and click the `Send Request` link to execute the API call.
4. Verify that the endpoint is returning the expected results.
