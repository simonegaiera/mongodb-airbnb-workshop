---
title: "CRUD Operations: Distinct"
permalink: /crud/3/
layout: single
classes: wide
---

<details>
<summary>📋 Lab Reference</summary>
<p><strong>Associated Lab File:</strong> <code>crud-3.lab.js</code></p>
</details>

## 🚀 Goal: Discover Unique Values Like a Pro

Your platform is evolving, and now it’s time to give your users the power to filter and explore listings in new ways. Imagine a guest searching for properties by neighborhood, amenities, or property type—dynamic filters make it all possible. As the backend engineer, you’ll use MongoDB’s `distinct` to unlock these features and make your app truly interactive.

In this exercise, you’ll reveal all the unique values in any field, powering up the filters that help guests find exactly what they’re looking for. This is how you turn a simple list into a personalized discovery experience.

---

### 🧩 Exercise: Find Unique Values

1. **Open the File**  
   Navigate to `server/src/lab/` and open `crud-3.lab.js`.

2. **Locate the Function**  
   Find the `crudDistinct` function in the file.

3. **Shape the Query**  
   - Use the `distinct` method to retrieve all unique values for the field specified by the `field_name` parameter.
   - Return an array of all distinct values found in that field across the collection.

---

### 🚦 Test Your API

1. Go to `server/src/lab/rest-lab`.
2. Open `crud-3-distinct-lab.http`.
3. Click **Send Request** to execute the API call.
4. Verify the response returns a list of unique values for the requested field.

---

### 🖥️ Frontend Validation

Open the "Filters" panel in the app and watch as all distinct values for your chosen field appear—enabling dynamic, user-friendly filtering for your guests.

**Check Exercise Status:**  
Go to the app and check if the exercise toggle shows green, indicating your implementation is correct.

With this step, you’re not just fetching data—you’re empowering your users to discover the perfect stay, their way.  
**Ready to make your platform smarter and more interactive? Let’s get started!**

![crud-3-lab](../../assets/images/crud-3-lab.png)

{% include simple_next_nav.html %}
