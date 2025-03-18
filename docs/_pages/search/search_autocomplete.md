---
title: "Atlas Search: Autocomplete"
permalink: /search/autocomplete/
layout: single
classes: wide
---

Learn how to use MongoDB Atlas Search to perform full-text search on your data. This section will guide you through creating search indexes and running search queries.

## Exercise: Autocomplete

1. **Navigate to the File**: In the `lab` folder open `search-1.lab.js`.
2. **Modify the Function**: Locate and modify the `autocompleteSearch` function.
3. **Update the Pipeline Array**:
    - Use the `$search` stage on the `default` index.
    - Apply the `autocomplete` operator on the `name` field of the listing.
    - Enable fuzzy search to handle typos and variations.
    - Limit the results to 10 entries.
    - Use the `$project` stage to include only the `name` field in the results.

### Exercise: Testing API Calls

1. Navigate to the directory: `server/lab/rest-lab`.
2. Open the file named `search-1-lab.http`.
3. In the file, locate and click the `Send Request` link to execute the API call.
4. Verify that the endpoint is returning the expected results.

### Exercise: Frontend validation
Type "hawaii" in the search bar and verify the results.
![search-1-lab](../../assets/images/search-1-lab.png)
