---
title: "Environment Preparation: Codespace"
permalink: /environment/codespace/
layout: single
---

## Environment Preparation: Codespace

To get started with the [mongodb-airbnb-workshop](https://github.com/simonegaiera/mongodb-airbnb-workshop) repository, follow these steps to set up your Codespace environment:

### Step 1: Create a Codespace
1. Navigate to the GitHub repository.
2. Click on the **<> Code** button.
3. Select **Codespace** and then click on **Create codespace**.

Once the Codespace is ready, you will see two main folders:

- **app**
- **server**

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

### Step 3: Configure the Web Appplication
1. In the **app** folder, create a new file named `.env` using the environment template `.env.template`.
2. Open another terminal and navigate to the app directory:
   ```bash
   cd app
   ```
3. Install the required dependencies:
   ```bash
   npm install
   ```
4. Start the application in development mode:
   ```bash
   npm run dev
   ```
5. A popup will appear asking if you want to open the application in your browser. Select **Open in browser**.
