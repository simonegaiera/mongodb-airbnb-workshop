---
title: "MongoDB Aggregations"
permalink: /aggregations/1/
layout: single
classes: wide
---

## 🚀 Goal: Analyze Listings with Aggregations

Your platform is buzzing with activity, and your team wants to make smarter decisions—fast. Imagine being able to spot trends, set competitive prices, or help guests find the best value for their needs. As the backend engineer, you’re the data wizard who can turn mountains of raw listings into actionable insights.

In this exercise, you’ll unleash the power of MongoDB aggregations to reveal the average price of listings by number of beds. With just a few pipeline stages, you’ll transform your data into knowledge that drives your business forward.

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
2. Open `pipeline-1-statistics-lab.http`.
3. Click **Send Request** to hit the API.
4. Check that you get the expected results—average prices by bed count!

---

### 🖥️ Frontend Validation

- Tick the "Show Statistics" checkbox to see your aggregated results come alive in the table.

With this step, you’re not just crunching numbers—you’re giving your company the insights it needs to shine in the rental market.  
**Ready to turn data into strategy? Let’s get started!**

![pipeline-1-lab](../../assets/images/pipeline-1-lab.png)
