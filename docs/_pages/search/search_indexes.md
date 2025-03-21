---
title: "Atlas Search: Indexes"
permalink: /search/index/
layout: single
classes: wide
---

Learn how to use MongoDB Atlas Search to perform full-text search on your data. This section will guide you through creating search indexes and running search queries.

## Exercise: Index Creation

**Objective** 
The goal of this exercise is to create a MongoDB search index with specific field types to optimize search queries and improve database performance. 
- Turn off dynamic mapping
- The index must be named `default`.
- The index analyzer should be `lucene.english`.

**Field Mappings**  
You need to create an index with the following field mappings:
- `amenities` should be of type `stringFacet`
- `amenities` should also be of 
    - Type `token`
    - Value `none`
- `beds` should be of type `numberFacet`
- `beds` should also be of
    - Type `number`
- `property_type` should be of type `stringFacet`
- `property_type` also should be of
    - Type `token`
    - Value `none`
- `name` should be of type `autocomplete`
    - Analyzer should be `lucene.english`
    - Max gram should be set to `7`
    - Min gram should be set to `3`
    - Tokenization is `edgeGram`
    - Fold Diacritics should be set to `false`

### Exercise: Execution
If you don't have access to Compass or the Atlas interface you can use the MongoDB Extension.
A MongoDB Playground was created for you to help you solve this Exercise.
