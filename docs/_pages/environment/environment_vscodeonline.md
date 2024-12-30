---

### Environment Preparation: VSCode Online

Optimizing your setup for smooth development with VSCode Online is straightforward. Follow this guide to configure your workspace and connect your application seamlessly to MongoDB.

---

### Step 1: Verify Environment

1. **Access VSCode:**
   - Visit your VSCode environment provided for the workshop.
   - URL Pattern:
     ```
     https://username.airbnb-workshop-customer.mongosa.com/?folder=/home/workspace/mongodb-airbnb-workshop
     ```
   - Ensure you can log in and see the workshop files.

2. **Access Application Frontend:**
   - Open the application frontend using:
     ```
     https://username.airbnb-workshop-customer.mongosa.com/frontend/
     ```
   - Confirm that the frontend is accessible and functional.

---

### Step 2: Connect MongoDB Extension

1. **Select MongoDB Extension:**
   - Open VSCode and click on the MongoDB extension in the sidebar.

2. **Establish Connection:**
   - Within the `CONNECTIONS` section, click the `+` to add a new connection.
   - Choose `Connect with Connection String`.
   - Input the connection string provided by your System Administrator (SA). Example:
     ```
     mongodb+srv://user:password@cluster.vrkei.mongodb.net/?retryWrites=true&w=majority
     ```

3. **Verify Connection:**
   - Ensure the MongoDB connection is established successfully, checking for any error messages.

---

### Step 3: Configure Backend Server

1. **Edit the Configuration File:**
   - Navigate to the **server** directory.
   - Open the `.env` file and paste your MongoDB connection string, replacing the placeholder:
     ```
     MONGODB_URI=mongodb+srv://user:password@cluster.vrkei.mongodb.net/?retryWrites=true&w=majority
     ```

2. **Start the Server:**
   - Launch a terminal in VSCode.
   - Change directory to the server folder and start the server with:
     ```bash
     cd server
     npm start
     ```

3. **Verify Server Functionality:**
   - Check for console logs indicating the server is running and connected to MongoDB.

---

Following these steps will ensure your VSCode environment is ready for development, enabling you to efficiently work with your application and MongoDB. If you encounter any issues, consult with your SA for additional support. Happy coding!