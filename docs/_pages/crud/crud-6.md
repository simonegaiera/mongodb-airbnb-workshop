---
title: "CRUD Operations: Set"
permalink: /crud/6/
layout: single
classes: wide
---

## 🚀 Goal: Update Any Field with $set—Like a Pro

Your platform is thriving, and your users expect flexibility—whether it’s updating a property’s title, adding a new amenity, or correcting a typo. As the backend engineer, you’re the one who makes these real-time updates possible, keeping your data fresh and your users happy.

In this exercise, you’ll harness the power of MongoDB’s `$set` operator to update any field in your documents. This is how you give your platform the agility to grow and adapt—one update at a time.

---

### 🧩 Exercise: Update a Document

1. **Open the File**  
   Navigate to `server/src/lab/` and open `crud-6.lab.js`.

2. **Locate the Function**  
   Find the `crudUpdateElement` function in the file.

3. **Shape the Update**  
   - The function receives three parameters:
     - `id`: The document's `_id`
     - `key`: The field name to update
     - `value`: The new value to set
   - Use `$set` to update the specified field with the new value—dynamic, flexible, and powerful!

---

### 🚦 Test Your API

1. Go to `server/src/lab/rest-lab` directory.
2. Open `crud-6-update-lab.http`.
3. Click **Send Request** to execute the API call.
4. Verify the response shows the document with the updated field.

---

### 🖥️ Frontend Validation

Edit a field (like the Title) of a listing in the app and watch your changes stick—even after a refresh.  
Slick, instant, and oh-so-satisfying!

With this step, you’re not just updating data—you’re keeping your platform fresh, relevant, and responsive to every user’s needs.  
**Ready to give your data a makeover? Let’s get started!**

![crud-6-lab](../../assets/images/crud-6-lab.png)
