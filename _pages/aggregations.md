---
title: "MongoDB Aggregations"
permalink: /aggregations/
layout: single
---

# MongoDB Aggregations

This section will cover MongoDB's aggregation framework. You will learn how to use various aggregation stages to process and analyze your data.

- **Match**: Filter documents.
- **Group**: Group documents by a specified field.
- **Sort**: Sort documents.
- **Project**: Reshape documents.

## Exercise: Aggregations

**Objective** 
In this exercise, you will create an aggregation pipeline to analyze the average price of listings based on the number of beds. The pipeline will filter, group, and sort the data to provide meaningful insights.

**Pipeline Definition**  

1. **Navigate to the File**: In the `controllers` folder open `02-aggregateController.js`.
2. **Modify the Function**: Locate and modify the `getPriceStatistics` function.
3. **Update the Pipeline Array**:
    - **$match Stage**: Filter documents to include only those that have both `beds` and `price` fields.
    - **$group Stage**: Group the documents by the number of beds and calculate the average price for each group.
    - **$sort Stage**: Sort the grouped documents by the number of beds in ascending order.

## Hint: Aggregations

For more detailed guidance on each stage, refer to the following MongoDB documentation links:
- **$match**: Learn how to filter documents in the aggregation pipeline.
  [Match Documentation](https://www.mongodb.com/docs/manual/reference/operator/aggregation/match/)
- **$group**: Understand how to group documents and perform aggregations.
  [Group Documentation](https://www.mongodb.com/docs/manual/reference/operator/aggregation/group/)
- **$sort**: Learn how to sort documents in the aggregation pipeline.
  [Sort Documentation](https://www.mongodb.com/docs/manual/reference/operator/aggregation/sort/)

