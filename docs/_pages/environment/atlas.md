---
title: "Environment Preparation: Atlas"
permalink: /environment/atlas/
layout: single
classes: wide
---

## Overview

This document helps you prepare your MongoDB Atlas environment. You will need:  
1. A MongoDB Atlas cluster
2. Database access credentials (username and password)
3. A connection string to access your database
4. MongoDB Compass configured to connect to your Atlas cluster

---

## Validate Your Environment

If you are attending a guided workshop, the instructor will provide Atlas credentials.

### Connecting with MongoDB Compass

1. **Install MongoDB Compass**
   - Download and install [MongoDB Compass](https://www.mongodb.com/try/download/compass) if you haven't already

2. **Connect using the provided string**
   - Launch MongoDB Compass
   - In the connection dialog, paste the connection string provided by your instructor
   - Replace `<username>` and `<password>` with the credentials provided
   - Click **Connect**

3. **Verify Connection**
   - Once connected, you should see the available databases in the left panel
   - You should see the Airbnb sample dataset collections

![MongoDB Compass Connection Screen](../../assets/images/compass.png)

---

## Self-Paced Setup with MongoDB Atlas

If you're working through this workshop independently, follow these steps to create your own Atlas environment.

### Creating an Atlas Cluster
Follow the [MongoDB Atlas documentation](https://www.mongodb.com/docs/atlas/getting-started/) to create a cluster.

1. **Sign up or log in to MongoDB Atlas**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account or sign in
   - The free tier is sufficient for this workshop

2. **Load Sample Dataset**  
   - Load the MongoDB sample dataset or import your own data.  
   - Use the credentials and connection string from your new cluster.

You should now be ready to use MongoDB Atlas. If you run into issues, recheck your credentials or contact support.
