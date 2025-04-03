---
title: "Atlas Search: Autocomplete"
permalink: /search/1/
layout: single
classes: wide
---

**Goal**: Use MongoDB Atlas Search to build a simple autocomplete feature.

## Exercise: Autocomplete

1. **Open the File**  
   Navigate to `server/src/lab/` and open `search-1.lab.js`.

2. **Locate the Function**  
   Find the `autocompleteSearch` function.

3. **Update the Pipeline**  
   - Add a `$search` stage on the `default` index.  
   - Use `autocomplete` on the `name` field.  
   - Enable `fuzzy` search for better typo handling.  
   - Limit the results to 10 documents.  
   - Use `$project` to return only the `name` field.

### Exercise: Testing API Calls

1. Go to `server/src/lab/rest-lab`.  
2. Open `search-1-lab.http`.  
3. Click **Send Request** to call the API.  
4. Confirm the response contains the expected results.

### Exercise: Frontend Validation

Type `"hawaii"` in the search bar and verify that the autocomplete suggestions are showing up.
![search-1-lab](../../assets/images/search-1-lab.png)
