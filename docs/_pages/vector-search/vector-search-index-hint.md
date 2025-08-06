---
title: "Atlas Vector Search: Indexes"
permalink: /vector-search/index/hint/
layout: single
classes: wide
---

## 🚀 Hint: Atlas Vector Search Indexes—Unlock Semantic Power

Want AI-powered, semantic search in your app? Atlas Vector Search indexes let you search by meaning, not just keywords!  
Automatically embed your text fields and filter results for smarter, more relevant discovery.

- 🛠️ [Manage Index](https://www.mongodb.com/docs/atlas/atlas-search/manage-indexes/)  

- 🤖 **Automated Embeddings**: Let MongoDB handle text-to-vector conversion automatically.  
  [Automated Embedding Documentation](https://www.mongodb.com/docs/atlas/atlas-vector-search/automated-embedding/)

### ✨ Example: Vector Search Index Definition

```json
{
  "fields": [
    {
      "type": "text",
      "path": "description",
      "model": "voyage-3-large"
    },
    {
      "type": "filter",
      "path": "property_type"
    }
  ]
}
```

💡 Use vector fields for semantic search and filter fields to narrow down results by specific criteria.
