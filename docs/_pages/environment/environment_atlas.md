---
title: "Environment Preparation: Atlas"
permalink: /environment/atlas/
layout: single
classes: wide
---

## Overview

This document helps you prepare your MongoDB Atlas environment. You will need:  
1. A MongoDB Atlas connection string  
2. Database access credentials (username and password)  
3. (Optional) Additional Atlas access credentials for the Atlas interface

---

## Validate Your Environment

### Using MongoDB Compass

1. **Obtain Your Connection String**  
   Copy the MongoDB Atlas connection string provided to you.

2. **Launch Compass**  
   If you haven’t installed MongoDB Compass, download it from [here](https://www.mongodb.com/try/download/compass).

3. **Enter Connection Details**  
   - Paste the connection string into the **New Connection** screen.  
   - Enter your username and password.

4. **Connect**  
   - Click **Connect** to establish a connection.  
   - If successful, you’ll see your databases and collections in Compass.  
   - If not, verify your connection string and credentials.

![compass](../../assets/images/compass.png)

---

## Self-Paced Setup with MongoDB Atlas

1. **Create an Atlas Cluster**  
   Follow the [MongoDB Atlas documentation](https://www.mongodb.com/docs/atlas/getting-started/) to create a cluster.

2. **Load Sample Data**  
   - Load the MongoDB sample dataset or import your own data.  
   - Use the credentials and connection string from your new cluster.

You should now be ready to use MongoDB Atlas. If you run into issues, recheck your credentials or contact support.
