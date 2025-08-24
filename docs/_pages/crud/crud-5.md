---
title: "CRUD Operations: Insert"
permalink: /crud/5/
layout: single
classes: wide
---

<details>
<summary>📋 Lab Reference</summary>
<p><strong>Associated Lab File:</strong> <code>crud-5.lab.js</code></p>
</details>

## 🚀 Goal: Insert New Documents Like a Pro

Your platform is growing, and it’s time to expand your offerings! Imagine a host adding a brand-new property or a guest signing up for the first time. As the backend engineer, you’re the one who makes these moments possible—bringing new data to life in your MongoDB collection.

In this exercise, you’ll master the art of inserting documents. Every new listing, guest, or booking starts with a single insert—and your code is what makes it happen.

---

### 🧩 Exercise: Insert a Document

1. **Open the File**  
   Navigate to `server/src/lab/` and open `crud-5.lab.js`.

2. **Locate the Function**  
   Find the `crudCreateItem` function in the file.

3. **Update the Code**  
   - Insert the document stored in the `item` variable into the collection.
   - The `item` variable is already formatted and ready for insertion.

---

### 🚦 Test Your API

1. Go to `server/src/lab/rest-lab` directory.
2. Open `crud-5-insert-lab.http`.
3. Click **Send Request** to execute the API call.
4. Verify the response confirms successful insertion of the document.

---

### 🖥️ Frontend Validation

**Check Exercise Status:**  
Go to the app and check if the exercise toggle shows green, indicating your implementation is correct.

![crud-5-lab](../../assets/images/crud-5-lab.png)
