---
title: "CRUD Operations: Push"
permalink: /crud/7/
layout: single
classes: wide
---

<details>
<summary>📋 Lab Reference</summary>
<p><strong>Associated Lab File:</strong> <code>crud-7.lab.js</code></p>
</details>

## 🚀 Goal: Effortlessly Add to Arrays with $push

Your platform is thriving, and guests are eager to share their experiences. Imagine a traveler leaving a glowing review after a perfect stay, or a host receiving valuable feedback. As the backend engineer, you make these moments possible—instantly updating listings with new reviews and keeping your data dynamic.

In this exercise, you’ll use MongoDB’s `$push` operator to add reviews (or any array item) to your documents. With every new review, your platform becomes richer and more engaging for everyone.

---

### 🧩 Exercise: Add a Review to an Array

1. **Open the File**  
   Navigate to `server/src/lab/` and open `crud-7.lab.js`.

2. **Locate the Function**  
   Find the `crudAddToArray` function in the file.

3. **Update the Code**  
   - Use `$push` to add the new review to the `reviews` array.
   - The function receives two parameters:
     - `id`: The document's `_id`
     - `review`: The review object to add
   - _(Bonus)_ Use `$inc` to increment the `number_of_reviews` field by 1.

---

### 🚦 Test Your API

1. Go to `server/src/lab/rest-lab` directory.
2. Open `crud-7-reviews-lab.http`.
3. Click **Send Request** to execute the API call.
4. Verify the response shows the updated document with the new review.

---

### 🖥️ Frontend Validation

Add a new review in the app and watch it appear instantly for the selected listing—smooth, dynamic, and oh-so-satisfying! This is how you keep your platform lively and your users engaged.

**Check Exercise Status:**  
Go to the app and check if the exercise toggle shows green, indicating your implementation is correct.

With this step, you’re not just updating arrays—you’re capturing the stories and feedback that make your platform come alive.  
**Ready to let your users’ voices be heard? Let’s get started!**

![crud-7-lab](../../assets/images/crud-7-lab.png)
