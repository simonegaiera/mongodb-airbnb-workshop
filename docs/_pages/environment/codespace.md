---
title: "Environment Preparation: Codespace/VSCode"
permalink: /environment/codespace/
layout: single
classes: wide
---

## 💻✨ Codespace/VSCode Setup

Ready to dive into the [mongodb-airbnb-workshop](https://github.com/simonegaiera/mongodb-airbnb-workshop)?  
Let’s get your environment up and running—fast, smooth, and with style!

---

## 🚀 Step 1: Launch Your Codespace

1. Head to the GitHub repo.
2. Click **<> Code** → **Codespace** → **Create codespace**.

> **Pro Tip:**  
> Once loaded, you’ll see two folders:  
> - `app` (the frontend)  
> - `server` (the backend)

---

## 🧩 Step 2: Power Up VSCode

Supercharge your workflow with these extensions:
- **MongoDB for VS Code**
- **REST Client**

---

## 🔥 Step 3: Backend Server Magic

1. In `server`, create a `.env` file from `.env.template`.
2. Paste your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://user:password@cluster.vrkei.mongodb.net/?retryWrites=true&w=majority
   ```
3. Open a terminal and run:
   ```bash
   cd server
   npm install
   npm start
   ```
4. **Codespace Only:**  
   In the `PORTS` panel, set your port to **public** for easy access!  
   ![vscode-port-visibility](../../assets/images/vscode_port_visibility.png)

---

## 🎨 Step 4: Web App Setup

1. In `app`, create a `.env` from `.env.template`:
   ```bash
   WORKSHOP_USER=
   BACKEND_URL=http://localhost:5000
   ```
2. Open a new terminal and run:
   ```bash
   cd app
   npm install
   npm run dev
   ```
3. **Codespace Only:**  
   - When prompted, click **Open in browser**.
   - Set the port to **public** in the `PORTS` panel.  
   ![vscode-port-visibility](../../assets/images/vscode_port_visibility.png)

---

## 🎉 You’re Ready!

If you hit a snag, double-check your steps or ask for help.  
Now go build something awesome!
