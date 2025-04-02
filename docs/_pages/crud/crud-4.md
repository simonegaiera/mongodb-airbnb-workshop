---
title: "CRUD Operations: Find/Query"
permalink: /crud/4/
layout: single
classes: wide
---

**Goal**: Learn how to implement advanced MongoDB queries with multiple filter parameters and pagination.

## Exercise: Find Documents with Filters

1. **Open the File**  
   Navigate to `/server/lab/` and open `crud-4.lab.js`.

2. **Locate the Function**  
   Find the `crudFilter` function in the file.

3. **Update the Code**  
   - Construct a query that filters by:
     - `amenities`: array of selected amenities
     - `propertyType`: specific property type
     - `beds`: range of beds (format: "2-3", "4-7")
   - Apply pagination using:
     - `skip`: number of documents to skip
     - `limit`: maximum documents to return
   - If no filters are provided, return all documents (with pagination)

### Exercise: Testing API Calls
1. Go to `server/lab/rest-lab` directory.
2. Open `crud-4-lab.http`.
3. Click **Send Request** to execute the API call.
4. Verify the response returns documents matching your filters.

### Exercise: Frontend Validation
Test your implementation by setting different filters in the application's "Filters" panel and confirm the listings update correctly.
![crud-4-lab](../../assets/images/crud-4-lab.png)
