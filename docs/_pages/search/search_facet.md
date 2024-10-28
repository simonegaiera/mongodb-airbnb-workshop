---
title: "Atlas Search: Facet"
permalink: /search/facet/
layout: single
---

Learn how to use MongoDB Atlas Search to perform full-text search on your data. This section will guide you through creating search indexes and running search queries.

## Exercise: Facets

1. **Navigate to the File**: In the `controllers` folder open `03-searchController.js`.
2. **Modify the Function**: Locate and modify the `getFacet` function.
3. **Update the Pipeline Array**:
    - Use the `$search` stage with the `autocomplete` created before to filter on the facets.
    - In the `facets` section, add string facets for `amenities` and `property_type`.
    - In the `facets` section, add number facets for `beds` with boundaries from 0 to 9, and set the default to "Other".
