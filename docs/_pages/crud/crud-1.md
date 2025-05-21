---
title: "CRUD Operations: Find"
permalink: /crud/1/
layout: single
classes: wide
---

**Goal**: Learn how to perform basic find operations in MongoDB with sorting and pagination.

## Exercise: Find Documents

1. **Open the File**  
   Navigate to `server/src/lab/` and open `crud-1.lab.js`.

2. **Locate the Function**  
   Find the `crudFind` function in the file.

3. **Update the Code**  
   - Implement the function to find all documents matching the provided `query` parameter.
   - Sort results by `_id` in ascending order.
   - Apply pagination using:
     - `skip`: number of documents to skip
     - `limit`: maximum documents to return

### Exercise: Testing API Calls
1. Go to `server/src/lab/rest-lab` directory.
2. Open `crud-1-lab.http`.
3. Click **Send Request** to execute the API call.
4. Verify the response returns the paginated results.
5. Run the Test Suite
   ```bash
   cd server/
   npm test
   ```

### Exercise: Frontend Validation
Refresh the homepage and check that the listings are visible. Scroll to confirm pagination works as expected.
![crud-1-lab](../../assets/images/crud-1-lab.png)
