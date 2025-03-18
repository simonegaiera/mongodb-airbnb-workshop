---
title: "CRUD Operations: Push"
permalink: /crud/7/
layout: single
classes: wide
---

In this section, you will learn how to perform basic find operations in MongoDB. You will be required to complete the code snippets to achieve the desired results.

## Exercise: Insert an array field

**Objective** 
In this exercise, you will be required to modify a document.

**Pipeline Definition**  

1. **Navigate to the File**: In the `lab` folder open `crud-8.lab.js`.
2. **Modify the Function**: Locate and modify the `crudAddToArray` function.
3. **Update the Code**:
    - The input for this function are:
        - the `_id` as the `id`
        - the `review` we want to insert in the array field `reviews`
    - Push the new review for the required document
4. **Bonus**:
    - Increment the `number_of_reviews`
    - The bonus won't give more point, but only street cred.

### Exercise: Testing API Calls

1. Navigate to the directory: `server/lab/rest-lab`.
2. Open the file named `crud-7-lab.http`.
3. In the file, locate and click the `Send Request` link to execute the API call.
4. Verify that the endpoint is returning the expected results.

### Exercise: Frontend validation
Try to add a new review to the listings.
![crud-7-lab](../../assets/images/crud-7-lab.png)
