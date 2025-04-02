---
title: "CRUD Operations: Set"
permalink: /crud/6/
layout: single
classes: wide
---

**Goal**: Learn how to update a document's field in MongoDB using the $set operator.

## Exercise: Update a Document

1. **Open the File**  
   Navigate to `/server/lab/` and open `crud-6.lab.js`.

2. **Locate the Function**  
   Find the `crudUpdateElement` function in the file.

3. **Update the Code**  
   - The function receives three parameters:
     - `id`: The document's _id
     - `key`: The field name to update
     - `value`: The new value to set
   - Use `$set` to update the specified field with the new value

### Exercise: Testing API Calls
1. Go to `server/lab/rest-lab` directory.
2. Open `crud-6-lab.http`.
3. Click **Send Request** to execute the API call.
4. Verify the response shows the document with the updated field.

### Exercise: Frontend Validation
Test your implementation by editing a field (e.g., Title) of a listing and confirm the change persists after refreshing the page.
![crud-6-lab](../../assets/images/crud-6-lab.png)
