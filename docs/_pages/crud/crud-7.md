---
title: "CRUD Operations: Push"
permalink: /crud/7/
layout: single
classes: wide
---

**Goal**: Learn how to add an element to an array field in MongoDB using the $push operator.

## Exercise: Add a Review to an Array

1. **Open the File**  
   Navigate to `server/src/lab/` and open `crud-7.lab.js`.

2. **Locate the Function**  
   Find the `crudAddToArray` function in the file.

3. **Update the Code**  
   - Use `$push` to add the new review to the `reviews` array
   - The function receives two parameters:
     - `id`: The document's _id
     - `review`: The review object to add
   - (Bonus) Use `$inc` to increment the `number_of_reviews` field by 1

### Exercise: Testing API Calls
1. Go to `server/src/lab/rest-lab` directory.
2. Open `crud-7-lab.http`.
3. Click **Send Request** to execute the API call.
4. Verify the response shows the updated document with the new review.

### Exercise: Frontend Validation
Test your implementation by adding a new review in the application and confirm it appears for the selected listing.
![crud-7-lab](../../assets/images/crud-7-lab.png)
