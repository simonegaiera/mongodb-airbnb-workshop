---
title: "Environment Preparation: VSCode Online"
permalink: /environment/vscode/
layout: single
classes: wide
---

## 🌐💡 VSCode Online: Your Cloud Playground

Welcome to your cloud-powered dev playground!  
Let’s get you connected, coding, and exploring MongoDB in style.

**Quick Check**: Navigate to `https://<customer>.mongogameday.com/` and verify your name appears in the participant list. If it’s not there, please ask your SA before proceeding.

---

## 🚀 Step 1: Backend Setup

1. **Access VSCode Online:**
> **Note:** You can use the default customer page to access your workspace

   - Go to:
     ```
     https://<username>.<customer>.mongogameday.com/
     ```
   - In the `Explorer`, click **Open Folder** and navigate to:
     ```
     /home/workspace/mongodb-airbnb-workshop/
     ```
     Click **Ok**.
     ![Folder View](../../assets/images/environment-folder.png)  
2. **Trust the Workspace:**
   - When prompted:
     - Click **Yes, I trust the author**
     - Click **Mark Done**
  ![Trust Prompt](../../assets/images/environment-folder-trust.png)

3. **Start the Server:**
   - Open a new terminal:
     ```
     ☰ > Terminal > New Terminal
     ```
   - Fire up the backend:
     ```bash
     cd server
     npm start
     ```
   - ✅ **Check:** If you see a MongoDB connection message in the logs, you’re good to go!

---

## 🎨 Step 2: Frontend Setup

1. **Launch the App:**
> **Note:** You can use the default customer page to access your frontend
   - Open your app in the browser:
     ```
     https://<username>.<customer>.mongogameday.com/app/
     ```
2. **Validate the App:**    
   - See your name on the homepage? ✅ You’re in!
   ![Frontend Name Display](../../assets/images/environment-name.png)
   - If you see the message **Stays** instead of your name, double-check that your backend server is running.
   - Still not working? Call your SA for help!

---

## 🔗 Step 3: Connect the MongoDB Extension

1. **Grab Your Connection String:**  
   - Open `/server/.env` and copy your MongoDB URI:
     ```markdown
     MONGODB_URI=`mongodb+srv://<username>:<password>@<cluster>.mongodb.net`/?retryWrites=true&w=majority
     ```

2. **Connect in VSCode:**
   - Click the **MongoDB extension** in the sidebar.
   - In **CONNECTIONS**, hit the **+** and choose **Connect with Connection String**.
   - Paste your URI and connect!

3. **Success Check:**
   - If you see your databases, you’re ready to roll!

## 🔗 Step 4: Use MongoDB Playground

1. **Open the MongoDB Playground:**  
   - In VSCode Online, locate and open the file `mongodb-playground.mongodb.js` (usually found in the bottom left of the Explorer).
   ![MongoDB Playground](../../assets/images/playground.png)

2. **Set Your Database:**  
   - Find the line:
     ```js
     airbnb_database = 'sample_airbnb';
     ```
   - Replace `'sample_airbnb'` with your own database name:
     ```js
     airbnb_database = '<username>';
     ```

3. **Run Your First Query:**  
   - Click the **Play** ▶️ button at the top right of the editor to execute the playground script.

4. **Check the Results:**  
   - If your query runs successfully and returns data from your database, you’re all set!
   - If you see errors, double-check your database name and connection.

## 🔗 Step 5: Use Cline for Bedrock AI

1. **LaunchCline:**  
   - Click the **Cline** icon in the toolbar to open the extension.
   - Select **Use your own API key**.


2. **Configure the API:**
   1. Set **API Provider** to **Amazon Bedrock**.
   2. Choose **AWS Profile** as the authentication method.
   3. Choose **AWS Region** closest to you.
   4. Enable the **Use cross-region inference** option to automatically route requests to the best available region.
   5. Select **Let's go!**
      ![cline-welcome](../../assets/images/cline-welcome.png)
   6. Confirm the selection
      ![cline-conf](../../assets/images/cline-conf.png)

3. **Save and Test:**
   - Click **Save** to apply your settings.
   - Try a quick prompt in Cline to confirm everything is working! I generally ask to tell me a joke.
      ![cline-working](../../assets/images/cline-working.png)

---

## 🛠️ Troubleshooting

- **Server not starting?**  
  Double-check your terminal commands and directory.

- **Still stuck?**  
  Ping your SA for help—no shame in asking!

---

✨ That’s it! You’re set to code, create, and explore.  
Happy hacking!
