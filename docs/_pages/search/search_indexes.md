---
title: "Atlas Search: Indexes"
permalink: /search/index/
layout: single
classes: wide
---

## 🚀 Goal: Supercharge Search with Atlas Search Indexes

Create a MongoDB Atlas Search index to unlock blazing-fast full-text search and faceted navigation—tailored for next-level discovery!

---

### 🧩 Exercise: Build Your Search Index

Craft your index with these specs:

1. **Basic Configuration**
   - **Name:** `default`
   - **Analyzer:** `lucene.english`
   - **Dynamic Mapping:** Off

2. **Field Mappings**
   - **name** (for autocomplete)
     - Type: `autocomplete`
     - Analyzer: `lucene.english`
     - Tokenization: `edgeGram`
     - Min gram: `3`
     - Max gram: `7`
     - Fold Diacritics: `false`
   
   - **amenities** (for filtering)
     - `stringFacet`
     - `token` (value: `none`)

   - **property_type** (for filtering)
     - `stringFacet`
     - `token` (value: `none`)

   - **beds** (for numeric filtering)
     - `numberFacet`
     - `number`

---

### 🛠️ How to Complete This Exercise

Choose your favorite tool and get indexing:
- **MongoDB Atlas** web interface
- **MongoDB Compass**
- **MongoDB Extension** with the provided MongoDB Playground

💡 Pro tip: Smart field mappings and analyzers make your search experience magical!
