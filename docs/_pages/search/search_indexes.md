---
title: "Atlas Search: Indexes"
permalink: /search/index/
layout: single
---

Learn how to use MongoDB Atlas Search to perform full-text search on your data. This section will guide you through creating search indexes and running search queries.

## Exercise: Index Creation - Default

**Objective** 
The goal of this exercise is to create a MongoDB search index with specific field types to optimize search queries and improve database performance. The index must be named `default`.

**Field Mappings**  
You need to create an index with the following field mappings:
- `amenities` should be of type `stringFacet`
- `beds` should be of type `numberFacet`
- `property_type` should be of type `stringFacet`
- `name` should be of type `autocomplete`

## Exercise: Index Creation - All

**Objective**  
The goal of this exercise is to create a MongoDB search index with specific field types to optimize search queries and improve database performance. The index must be named `all`.

**Field Mappings**  
You need to create an index with the following field mappings:
- `amenities` should be of type `token`
- `property_type` should be of type `token`
- `name` should be of type `autocomplete`
