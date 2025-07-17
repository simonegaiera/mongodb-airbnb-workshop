---
title: "Environment Preparation: VSCode Online"
permalink: /environment/vscode-vibe/
layout: single
classes: wide
---

## 🌐💡 VSCode Online: Your Cloud Playground

Welcome to your cloud-powered dev playground!  
Let’s get you connected, coding, and exploring MongoDB in style.

**Quick Check**: Navigate to `https://<customer>.mongogameday.com/` and verify your name appears in the participant list. If it’s not there, please ask your SA before proceeding.

---

## 🔗 Step 1: Use Cline for Bedrock AI

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

## 🎨 Step 2: Frontend Setup

1. **Launch the App:**
> **Note:** You can use the default customer page to access your frontend
   - Open your app in the browser:
     ```
     https://<username>.<customer>.mongogameday.com/app/
     ```

---

## 🚀 Step 3: Backend Setup

1. **Access VSCode Online:**
> **Note:** You can use the default customer page to access your workspace

   - Go to:
     ```
     https://<username>.<customer>.mongogameday.com/
     ```
   - In the `Explorer`, click **Open Folder** and navigate to:
     ```
     /home/workspace/mongodb-airbnb-workshop/backend/
     ```
     Click **Ok**.
     ![Folder View](../../assets/images/environment-folder.png)  
2. **Trust the Workspace:**
   - When prompted:
     - Click **Yes, I trust the author**
     - Click **Mark Done**
  ![Trust Prompt](../../assets/images/environment-folder-trust.png)

---

## 🔗 Step 4: Connect the MongoDB Extension (Optional)

1. **Grab Your Connection String:**  
   - Open `/backend/.env` and copy your MongoDB URI:
     ```markdown
     MONGODB_URI=`mongodb+srv://<username>:<password>@<cluster>.mongodb.net`/?retryWrites=true&w=majority
     ```

2. **Connect in VSCode:**
   - Click the **MongoDB extension** in the sidebar.
   - In **CONNECTIONS**, hit the **+** and choose **Connect with Connection String**.
   - Paste your URI and connect!

3. **Success Check:**
   - If you see your databases, you’re ready to roll!


---

## 🛠️ Troubleshooting

- **Server not starting?**  
  Double-check your terminal commands and directory.

- **Still stuck?**  
  Ping your SA for help—no shame in asking!

---

✨ That’s it! You’re set to code, create, and explore.  
Happy hacking!
