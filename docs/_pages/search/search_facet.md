---
title: "Atlas Search: Facet"
permalink: /search/facet/
layout: single
classes: wide
---

Learn how to use MongoDB Atlas Search to perform full-text search on your data. This section will guide you through creating search indexes and running search queries.

## Exercise: Facets

1. **Navigate to the File**: In the `lab` folder open `search-2.lab.js`.
2. **Modify the Function**: Locate and modify the `facetSearch` function.
3. **Update the Pipeline Array**:
    - Use the `$searchMeta` on the `default` index.
    - Use the `facet` command to create the facets.
    - As `operator`, copy the `autocomplete` search you created in the previous exercise.
    - You will now create the `facets` on tree fields: `amenities`, `property_type`, and `beds`
        - `amenities`: string facet
        - `property_type`: string facet
        - `beds`: numeric facet with boundaries from 0 to 9. Set the default to "Other".

### Exercise: Testing API Calls

1. Navigate to the directory: `server/lab/rest-lab`.
2. Open the file named `search-2-lab.http`.
3. In the file, locate and click the `Send Request` link to execute the API call.
4. Verify that the endpoint is returning the expected results.

### Exercise: Frontend validation
Type "hawaii" in the search bar and validate that facets are visible now.
![search-2-lab](../../assets/images/search-2-lab.png)
