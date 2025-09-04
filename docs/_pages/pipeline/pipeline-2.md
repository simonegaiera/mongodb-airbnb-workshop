---
title: "Host Performance Analytics"
permalink: /pipeline/2/
layout: single
classes: wide
---

<details>
<summary>📋 Lab Reference</summary>
<p><strong>Associated Lab File:</strong> <code>pipeline-2.lab.js</code></p>
</details>

## 🚀 Goal: Superhost vs Regular Host Performance Analysis

Your platform's success depends on understanding what makes hosts exceptional. The marketing team wants to showcase the "Superhost advantage" to attract quality hosts, while the product team needs insights to improve host onboarding. As the backend engineer, you're the data detective who can unlock the secrets hidden in nested host documents.

In this exercise, you'll harness MongoDB's power to work with nested documents. You'll analyze the performance differences between Superhosts and regular hosts by diving deep into the embedded `host` object structure.

---

### 🎯 Exercise Desiderata: What You Need to Build

Your mission is to create an aggregation pipeline that showcases advanced data analysis by:

**🔍 Data Quality Control:**
- Filter for legitimate listings: `price > 0` and `number_of_reviews > 0`
- Focus on properties with actual market activity and guest feedback

**🏗️ Smart Data Transformation:**
- Handle missing `host.host_is_superhost` data gracefully (treat missing as "not a superhost")
- Create computed fields dynamically within the pipeline

**📊 Business Intelligence:**
- Compare Superhosts vs Regular Hosts across multiple dimensions:
  - Average ratings, review counts, and pricing strategies
  - Host portfolio sizes and response rates
  - Property count distribution

**🎨 Clean Output Formatting:**
- Transform technical field names into business-friendly labels
- Round numerical values appropriately for presentation

### 🧩 Exercise: Step-by-Step Implementation

1. **Open the File**  
   Navigate to `server/src/lab/` and open `pipeline-2.lab.js`.

2. **Find the Function**  
   Locate the `hostPerformanceAnalytics` function with detailed instructions.

3. **Build the 5-Stage Pipeline**  
   - **Stage 1 - $match**: Filter for quality data (`price > 0`, `number_of_reviews > 0`)
   - **Stage 2 - $addFields**: Create `isSuperhost` field using `$ifNull` to handle missing data
   - **Stage 3 - $group**: Group by superhost status and calculate 6 key metrics
   - **Stage 4 - $project**: Transform output with readable labels and proper rounding
   - **Stage 5 - $sort**: Sort by average rating (descending) for business insights


---

### 🚦 Test Your API

1. Go to `server/src/lab/rest-lab`.
2. Open `pipeline-2-host-analytics-lab.http`.
3. Click **Send Request** to hit the API.
4. Marvel at the insights comparing Superhosts vs regular hosts!

---

### 🖥️ Frontend Validation

- Check the "Host Analytics" section to see your nested document analysis in action.

**Check Exercise Status:**  
Go to the app and verify the exercise toggle shows green, confirming your mastery of nested document aggregations.

This exercise showcases MongoDB's natural ability to work with complex, nested data structures—a game-changer for modern applications!  
**Ready to unlock the power of nested documents? Let's dive in!**

![pipeline-2-lab](../../assets/images/pipeline-2-lab.png)
