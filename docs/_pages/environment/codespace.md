---
title: "Environment Preparation: Codespace/VSCode"
permalink: /environment/codespace/
layout: single
classes: wide
---

## Environment Preparation: Codespace/VSCode

To get started with the [mongodb-airbnb-workshop](https://github.com/simonegaiera/mongodb-airbnb-workshop) repository, follow these steps to set up your Codespace environment:

### Step 1: Create a Codespace (Skip if not using Codespace)
1. Navigate to the GitHub repository.
2. Click on the **<> Code** button.
3. Select **Codespace** and then click on **Create codespace**.

Once the Codespace is ready, you will see two main folders:

- **app**
- **server**

### Step 2: Install VSCode Extensions
If you are using VSCode, you can install the extensions:
1. MongoDB for VS Code
2. REST Client

### Step 3: Configure the Backend Server
1. In the **server** folder, create a new file named `.env` by using the provided environment template `.env.template`.
2. Copy your MongoDB connection string (provided to you by MongoDB) into the `.env` file, replacing the placeholder:
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
6. (Codespace Only) Switch to the `PORTS` panel, and change the port visibility from `private` to `public`.
![vscode-port-visibility](../../assets/images/vscode_port_visibility.png)

### Step 4: Configure the Web Appplication
1. In the **app** folder, create a new file named `.env` using the environment template `.env.template`. 
   ```bash
   WORKSHOP_USER=
   BACKEND_URL=http://localhost:5000
   ```
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
5. (Codespace Only) A popup will appear asking if you want to open the application in your browser. Select **Open in browser**.
6. (Codespace Only) Switch to the `PORTS` panel, and change the port visibility from `private` to `public`.
![vscode-port-visibility](../../assets/images/vscode_port_visibility.png)
