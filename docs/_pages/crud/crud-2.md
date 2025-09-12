---
title: "CRUD Operations: Find One"
permalink: /crud/2/
layout: single
classes: wide
---

<details>
<summary>📋 Lab Reference</summary>
<p><strong>Associated Lab File:</strong> <code>crud-2.lab.js</code></p>
</details>

## 🚀 Goal: Instantly Retrieve a Single Document

Your platform is growing, and now your users want more than just a list—they want details! Imagine a guest clicking on a property to see every photo, amenity, and review. As the backend engineer, it’s your job to deliver that information instantly and accurately.

In this exercise, you’ll unlock the power of MongoDB’s `findOne` to fetch exactly what your users need, right when they need it. This is the magic behind every detail page—making sure guests can dive deep into any listing with a single click.

---

### 🧩 Exercise: Find One Document

1. **Open the File**  
   Navigate to `server/src/lab/` and open `crud-2.lab.js`.

2. **Locate the Function**  
   Find the `crudOneDocument` function in the file.

3. **Shape the Query**  
   - Implement the function to find one document where `_id` equals the provided `id` parameter.
   - Return the complete document that matches this criteria.

---

### 🚦 Test Your API

1. Go to `server/src/lab/rest-lab`.
2. Open `crud-2-one-lab.http`.
3. Click **Send Request** to execute the API call.
![test-rest-lab](../../assets/images/test-rest-lab.png)
4. Verify the response returns the single document you requested.

---

### 🖥️ Frontend Validation

> **Important:**  
> To check if your implementation works, **go to the homepage of the app and select a listing**.  
> This will open the details page for that property and trigger your new API code.

- When you select a listing, all the details for that property should appear—fast, focused, and flawless.
- **Check Exercise Status:**  
  Look for the exercise toggle on the details page. If it shows green, your implementation is correct!

With this step, you’re not just retrieving data—you’re bringing each listing to life for your users.  
**Ready to deliver the details that make your platform shine? Let’s get started!**

![crud-2-lab](../../assets/images/crud-2-lab.png)

{% include simple_next_nav.html %}
