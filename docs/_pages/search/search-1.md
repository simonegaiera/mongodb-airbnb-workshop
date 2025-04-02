---
title: "Atlas Search: Autocomplete"
permalink: /search/1/
layout: single
classes: wide
---

Learn how to use MongoDB Atlas Search to perform full-text search on your data. This section will guide you through creating search indexes and running search queries.

## Exercise: Autocomplete

1. **Navigate to the File**: In the `lab` folder, open `search-1.lab.js`.
2. **Modify the Function**: Locate and modify the `autocompleteSearch` function.
3. **Update the Pipeline Array**:  
   - Use the `$search` stage on the `default` index.  
   - Apply the `autocomplete` operator on the `name` field of the listing.  
   - Enable `fuzzy` search to handle typos and variations.  
   - Limit the results to 10 entries.  
   - Use `$project` to return only the `name` field.

### Exercise: Testing API Calls
1. Navigate to `server/lab/rest-lab`.  
2. Open `search-1-lab.http`.  
3. Click the **Send Request** link to run the API call.  
4. Verify the endpoint returns the expected results.

### Exercise: Frontend validation
Type "hawaii" in the search bar and confirm that the suggestions appear correctly.
![search-1-lab](../../assets/images/search-1-lab.png)
