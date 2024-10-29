---
title: "Atlas Search: Autocomplete"
permalink: /search/autocomplete/
layout: single
classes: wide
---

Learn how to use MongoDB Atlas Search to perform full-text search on your data. This section will guide you through creating search indexes and running search queries.

## Exercise: Autocomplete

1. **Navigate to the File**: In the `controllers` folder open `03-searchController.js`.
2. **Modify the Function**: Locate and modify the `getAutocomplete` function.
3. **Update the Pipeline Array**:
    - Use the `$search` stage on the `default` index.
    - Apply the `autocomplete` operator on the `name` field of the listing.
    - Enable fuzzy search to handle typos and variations.
    - Limit the results to 10 entries.
    - Use the `$project` stage to include only the `name` field in the results.
