---
title: "Atlas Search: Facet"
permalink: /search/2/
layout: single
classes: wide
---

**Goal**: Learn how to use MongoDB Atlas Search to create and query facets.

## Exercise: Facets

1. **Open the File**  
   In the `lab` folder, open `search-2.lab.js`.

2. **Locate the Function**  
   Find the `facetSearch` function in the file.

3. **Modify the Pipeline**  
   - Use `$searchMeta` on the `default` index.  
   - Apply `facet` in your pipeline.  
   - For the `operator`, reuse the `autocomplete` search from the previous exercise.  
   - Create these facets:  
     - `amenities`: a string facet  
     - `property_type`: a string facet  
     - `beds`: a numeric facet with boundaries from 0 to 9, and "Other" for any additional values  

### Exercise: Testing API Calls

1. Go to the `server/lab/rest-lab` directory.  
2. Open `search-2-lab.http`.  
3. Click **Send Request** to call the API.  
4. Make sure you see valid results in the response.

### Exercise: Frontend Validation

Type `"hawaii"` in the search bar and confirm that the new facets appear.
![search-2-lab](../../assets/images/search-2-lab.png)
