---
title: "CRUD Operations: Distinct"
permalink: /crud/3/
layout: single
classes: wide
---

**Goal**: Learn how to retrieve unique values from a specific field in MongoDB using the distinct operation.

## Exercise: Find Unique Values

1. **Open the File**  
   Navigate to `server/lsrc/ab/` and open `crud-3.lab.js`.

2. **Locate the Function**  
   Find the `crudDistinct` function in the file.

3. **Update the Code**  
   - Use the `distinct` method to retrieve all unique values for the field specified by the `field_name` parameter.
   - The function should return an array of all distinct values found in that field across the collection.

### Exercise: Testing API Calls
1. Go to `server/src/lab/rest-lab` directory.
2. Open `crud-3-lab.http`.
3. Click **Send Request** to execute the API call.
4. Verify the response returns a list of unique values for the requested field.

### Exercise: Frontend Validation
Test your implementation by opening the "Filters" panel in the application and confirm that all distinct values for the field are displayed.
![crud-3-lab](../../assets/images/crud-3-lab.png)
