---
title: "Environment Preparation: VSCode"
permalink: /environment/vscodeonline/
layout: single
classes: wide
---

## Environment Preparation: VSCode Online

### Step 1: Verify Environment
1. Verify that you can access VSCode provided by your SA
   ```
   https://airbnb-workshop-customer.mongosa.com/?folder=/home/ec2-user/username/mongodb-airbnb-workshop
   ```
2. Verify that you can access the Frontend of our application
   ```
   https://airbnb-workshop-customer.mongosa.com/username/
   ```

### Step 1: MongoDB Extension
1. Select the MongoDB extension on VSCode
2. In the `CONNECTIONS` section, select the `+` option
3. Select `Connect with Connection String` and copy the connection string:
   ```
   mongodb+srv://user:password@cluster.vrkei.mongodb.net/?retryWrites=true&w=majority
   ```
4. Verify that the connection was established

### Step 2: Configure the Backend Server
1. In the **server** folder, create a new file named `.env` by using the provided environment template `.env.template`.
2. Copy your MongoDB connection string into the `.env` file, replacing the placeholder:
   ```
   MONGODB_URI=mongodb+srv://user:password@cluster.vrkei.mongodb.net/?retryWrites=true&w=majority
   ```
3. Open a new terminal in your Codespace and navigate to the server directory:
   ```bash
   cd server
   ```
4. Install the required dependencies:
   ```bash
   npm install
   ```
5. Start the server:
   ```bash
   npm start
   ```

