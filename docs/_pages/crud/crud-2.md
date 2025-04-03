---
title: "CRUD Operations: Find One"
permalink: /crud/2/
layout: single
classes: wide
---

**Goal**: Learn how to retrieve a single document from MongoDB using its unique identifier.

## Exercise: Find One Document

1. **Open the File**  
   Navigate to `server/src/lab/` and open `crud-2.lab.js`.

2. **Locate the Function**  
   Find the `crudOneDocument` function in the file.

3. **Update the Code**  
   - Implement the function to find one document where `_id` equals the provided `id` parameter.
   - The function should return the complete document matching this criteria.

### Exercise: Testing API Calls
1. Go to `server/src/lab/rest-lab` directory.
2. Open `crud-2-lab.http`.
3. Click **Send Request** to execute the API call.
4. Verify the response returns the single document you requested.

### Exercise: Frontend Validation
Test your implementation by selecting a listing in the application and confirm that all details for the single document display correctly.
![crud-2-lab](../../assets/images/crud-2-lab.png)
