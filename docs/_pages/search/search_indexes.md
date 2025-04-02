---
title: "Atlas Search: Indexes"
permalink: /search/index/
layout: single
classes: wide
---

**Goal**: Create a MongoDB Atlas Search index to enable efficient full-text search and faceted navigation.

## Exercise: Index Creation

Create a search index with the following specifications:

1. **Basic Configuration**
   - Name: `default`
   - Analyzer: `lucene.english`
   - Dynamic Mapping: Off

2. **Field Mappings**
   - **name** (for autocomplete)
     - Type: `autocomplete`
     - Analyzer: `lucene.english`
     - Tokenization: `edgeGram`
     - Min gram: `3`
     - Max gram: `7`
     - Fold Diacritics: `false`
   
   - **amenities** (for filtering)
     - First mapping: `stringFacet`
     - Second mapping: `token` with value `none`

   - **property_type** (for filtering)
     - First mapping: `stringFacet`
     - Second mapping: `token` with value `none`

   - **beds** (for numeric filtering)
     - First mapping: `numberFacet`
     - Second mapping: `number`

### How to Complete This Exercise

You can create this index using:
- MongoDB Atlas web interface
- MongoDB Compass
- MongoDB Extension with the provided MongoDB Playground
