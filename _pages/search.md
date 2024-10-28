---
title: "Search"
permalink: /search/
layout: single
---

# Atlas Search

Learn how to use MongoDB Atlas Search to perform full-text search on your data. This section will guide you through creating search indexes and running search queries.

## Exercise: Index Creation

### Index Creation: Default

**Objective** 
The goal of this exercise is to create a MongoDB search index with specific field types to optimize search queries and improve database performance. The index must be named `default`.

**Field Mappings**  
You need to create an index with the following field mappings:
- `amenities` should be of type `stringFacet`
- `beds` should be of type `numberFacet`
- `property_type` should be of type `stringFacet`
- `name` should be of type `autocomplete`

### Index Creation: All

**Objective**  
The goal of this exercise is to create a MongoDB search index with specific field types to optimize search queries and improve database performance. The index must be named `all`.

**Field Mappings**  
You need to create an index with the following field mappings:
- `amenities` should be of type `token`
- `property_type` should be of type `token`
- `name` should be of type `autocomplete`

### Hint: Index Creation
If you need more detailed instructions or additional information on how to create and manage search indexes in MongoDB Atlas, check out the official MongoDB Atlas Search Documentation. It provides comprehensive guides, examples, and best practices to help you get the most out of Atlas Search.
- [Manage Index](https://www.mongodb.com/docs/atlas/atlas-search/manage-indexes/)
- [Define Fields Mapping](https://www.mongodb.com/docs/atlas/atlas-search/define-field-mappings/)

## Autocomplete

### Exercise: Autocomplete

1. **Navigate to the File**: In the `controllers` folder open `03-searchController.js`.
2. **Modify the Function**: Locate and modify the `getAutocomplete` function.
3. **Update the Pipeline Array**:
    - Use the `$search` stage on the `default` index.
    - Apply the `autocomplete` operator on the `name` field of the listing.
    - Enable fuzzy search to handle typos and variations.
    - Limit the results to 10 entries.
    - Use the `$project` stage to include only the `name` field in the results.

### Hint: Autocomplete

For more detailed guidance on each step, refer to the following MongoDB documentation links:

- **Autocomplete**: Learn how to use the `autocomplete` operator to enhance search capabilities.
  [Autocomplete Documentation](https://www.mongodb.com/docs/atlas/atlas-search/field-types/autocomplete-type/)
  
- **Create Query**: Understand how to construct search queries in MongoDB Atlas.
  [Create Query Documentation](https://www.mongodb.com/docs/atlas/atlas-search/create-queries/)
  
- **Search**: Explore the `$search` aggregation stage to perform full-text searches.
  [Search Documentation](https://www.mongodb.com/docs/atlas/atlas-search/aggregation-stages/search/)
  
- **Limit**: Learn how to limit the number of documents returned by a query.
  [Limit Documentation](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit/)
  
- **Project**: Understand how to use the `$project` stage to include or exclude specific fields.
  [Project Documentation](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project/)

## Facets

### Exercise: Facets

1. **Navigate to the File**: In the `controllers` folder open `03-searchController.js`.
2. **Modify the Function**: Locate and modify the `getFacet` function.
3. **Update the Pipeline Array**:
    - Use the `$search` stage with the `autocomplete` created before to filter on the facets.
    - In the `facets` section, add string facets for `amenities` and `property_type`.
    - In the `facets` section, add number facets for `beds` with boundaries from 0 to 9, and set the default to "Other".

### Hint: Facets

For more detailed guidance on each step, refer to the following MongoDB documentation links:

- **Autocomplete**: Learn how to use the `autocomplete` operator to enhance search capabilities.
  [Autocomplete Documentation](https://www.mongodb.com/docs/atlas/atlas-search/field-types/autocomplete-type/)
  
- **Create Query**: Understand how to construct search queries in MongoDB Atlas.
  [Create Query Documentation](https://www.mongodb.com/docs/atlas/atlas-search/create-queries/)
  
- **Search**: Explore the `$search` aggregation stage to perform full-text searches.
  [Search Documentation](https://www.mongodb.com/docs/atlas/atlas-search/aggregation-stages/search/)
  
- **Facets**: Learn how to use facets to categorize search results.
  [Facets Documentation](https://www.mongodb.com/docs/atlas/atlas-search/facets/)
  
- **Number Facets**: Understand how to create number facets with boundaries.
  [Number Facets Documentation](https://www.mongodb.com/docs/atlas/atlas-search/facets/#number-facets)
