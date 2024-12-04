---
title: "CRUD Operations"
permalink: /crud/8/
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
