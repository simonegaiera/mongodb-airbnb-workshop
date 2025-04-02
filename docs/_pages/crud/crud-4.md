---
title: "CRUD Operations: Find/Query"
permalink: /crud/4/
layout: single
classes: wide
---

In this section, you will learn how to perform more advanced find operations in MongoDB, using multiple query parameters to filter the returned documents.

## Exercise: Find Documents

**Objective**  
In this exercise, you are required to:
- Build a query that accounts for the following input parameters:  
  - `amenities`: an array of selected amenities  
  - `propertyType`: the type of property  
  - `beds`: the range of required beds (e.g., "2-3", "4-7")  
  - `skip`: the number of documents to skip for pagination  
  - `limit`: the number of documents returned per page  
- If none of the query parameters are provided, return all documents for the specified page and limit.

**Pipeline Definition**  
1. **Navigate to the File**  
   Open the file `crud-4.lab.js` located in the `/server/lab/` folder.  
2. **Modify the Function**  
   Locate the `crudFilter` function in `crud-4.lab.js`.  
3. **Update the Code**  
   - Construct the `query` object using the specified parameters.  
   - Use `.find(query)`, then apply `.skip(skip)` and `.limit(limit)`.  
   - Return the correct documents based on the input filters.

### Exercise: Testing API Calls
1. Navigate to the `server/lab/rest-lab` folder.  
2. Open `crud-4-lab.http`.  
3. Use the **Send Request** link to run the API call.  
4. Confirm that the returned data matches the queried criteria.

### Exercise: Frontend Validation
Access the application’s "Filters" panel, set various combinations of amenities and property types, and verify the listings update accordingly.
![crud-4-lab](../../assets/images/crud-4-lab.png)
