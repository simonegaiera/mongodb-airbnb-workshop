---
title: "MongoDB Aggregations"
permalink: /aggregations/1/
layout: single
classes: wide
---

## Exercise: Aggregations

**Objective** 
In this exercise, you will create an aggregation pipeline to analyze the average price of listings based on the number of beds. The pipeline will filter, group, and sort the data to provide meaningful insights.

**Pipeline Definition**  

1. **Navigate to the File**: In the `lab` folder open `pipeline-1.lab.js`.
2. **Modify the Function**: Locate and modify the `aggregationPipeline` function.
3. **Update the Pipeline Array**:
    - **$match Stage**: Filter documents to include only those that have both `beds` and `price` fields.
    - **$group Stage**: Group the documents by the number of beds and calculate the average price for each group.
    - **$sort Stage**: Sort the grouped documents by the number of beds in ascending order.