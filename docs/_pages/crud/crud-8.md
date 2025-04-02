---
title: "CRUD Operations: Delete"
permalink: /crud/8/
layout: single
classes: wide
---

**Goal**: Learn how to delete a document from a MongoDB collection based on its ID.

## Exercise: Delete One Document

1. **Open the File**  
   Navigate to `/server/lab/` and open `crud-8.lab.js`.

2. **Locate the Function**  
   Find the `crudDelete` function in the file.

3. **Update the Code**  
   - Implement code to delete a document where `_id` equals the provided `id` parameter.

### Exercise: Testing API Calls
1. Go to `server/lab/rest-lab` directory.
2. Open `crud-8-lab.http`.
3. Click **Send Request** to execute the API call.
4. Verify the response confirms successful deletion.

### Exercise: Frontend Validation
Test your implementation by selecting "Delete Listing" in the application and confirm the record disappears from the listing.
![crud-7-lab](../../assets/images/crud-7-lab.png)
