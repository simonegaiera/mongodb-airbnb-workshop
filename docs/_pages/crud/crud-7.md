---
title: "CRUD Operations: Push"
permalink: /crud/7/
layout: single
classes: wide
---

In this section, you will learn how to add an element to an array field in MongoDB.

## Exercise: Insert an array field

**Objective**  
Modify an existing document to include a new review in its `reviews` array.

**Pipeline Definition**  
1. **Navigate to the File**  
   Locate `crud-7.lab.js` in the `/server/lab/` folder.  
2. **Modify the Function**  
   Inside `crudAddToArray`, add the new review to the array field named `reviews`.  
3. **Update the Code**  
   - The inputs for this function are:  
       - `_id` (`id`)  
       - The `review` to insert  
   - Use `$push` to add the review to `reviews`  
   - (Bonus) Use `$inc` to increment `number_of_reviews`  

### Exercise: Testing API Calls
1. In `server/lab/rest-lab`, open `crud-7-lab.http`.  
2. Click **Send Request** to test the route.  
3. Verify that the new review is added successfully.

### Exercise: Frontend validation
Add a new review and confirm it appears for the selected listing.
![crud-7-lab](../../assets/images/crud-7-lab.png)
