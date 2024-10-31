---
title: "CRUD Operations"
permalink: /crud/7/
layout: single
classes: wide
---

In this section, you will learn how to perform basic find operations in MongoDB. You will be required to complete the code snippets to achieve the desired results.

## Exercise: Update a document

**Objective** 
In this exercise, you will be required to modify a document.

**Pipeline Definition**  

1. **Navigate to the File**: In the `lab` folder open `crud-7.lab.js`.
2. **Modify the Function**: Locate and modify the `crudUpdateElement` function.
3. **Update the Code**:
    - The input for this function are:
        - the `_id` as the `id`
        - the name of the field you want to update `key`
        - the new value for the field you want to update `value`
    - Modify the function to update the required document with the given value for the given field name
