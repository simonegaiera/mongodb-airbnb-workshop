---
title: "MongoDB Aggregations"
permalink: /aggregations/1/
layout: single
classes: wide
---

## 🚀 Goal: Analyze Listings with Aggregations

Unleash the power of MongoDB aggregations!  
Build a pipeline to reveal the average price of listings by number of beds—turn raw data into instant insights.

---

### 🧩 Exercise: Craft Your Aggregation Pipeline

1. **Open the File**  
   Head to `server/src/lab/` and crack open `pipeline-1.lab.js`.

2. **Find the Function**  
   Locate the `aggregationPipeline` function.

3. **Shape the Pipeline**  
   - **$match**: Filter for documents with both `beds` and `price` fields.  
   - **$group**: Group by number of beds and calculate the average price.  
   - **$sort**: Sort by beds (ascending).  
   - **$project**: Return only `beds` and `price` fields.

---

### 🚦 Test Your API

1. Go to `server/src/lab/rest-lab`.
2. Open `pipeline-1-lab.http`.
3. Click **Send Request** to hit the API.
4. Check that you get the expected results—average prices by bed count!

---

### 🖥️ Frontend Validation

- Tick the "Show Statistics" checkbox to see your aggregated results come alive in the table.

![pipeline-1-lab](../../assets/images/pipeline-1-lab.png)
