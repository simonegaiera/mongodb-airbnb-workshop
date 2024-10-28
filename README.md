# MongoDB Airbnb Workshop

Welcome to the MongoDB Airbnb Workshop! This hands-on workshop is designed to provide you with practical experience using MongoDB. By the end of this session, you'll have a solid grasp of how to interact with MongoDB and utilize its powerful features.

## Introduction

In this workshop, you'll learn the fundamental operations you can perform with MongoDB. Each section will guide you through completing code snippets to achieve specific outcomes. The workshop is structured to give you a comprehensive understanding of MongoDB's core functionalities. To start, visit our [GitHub repository](https://github.com/simonegaiera/mongodb-airbnb-workshop).

## Workshop Overview

The application is divided into a frontend and a backend. All modifications will be made on the backend, specifically within the controllers section. The workshop will cover the following topics:

1. **CRUD Operations**: Master the basics of Creating, Reading, Updating, and Deleting documents in MongoDB.
2. **MongoDB Aggregations**: Learn how to use MongoDB's powerful aggregation framework for data analysis.
3. **Atlas Search**: Discover how to leverage MongoDB Atlas Search for full-text search capabilities on your data.

Let's get started and dive into the world of MongoDB!

## Environment Preparation: Atlas

### Workshop: Validate your Atlas Cluster

Before you begin, you need to be able to access your environment. Follow these steps to validate your environment:

1. **MongoDB Atlas Connection String**: You will receive a connection string to connect to your MongoDB Atlas cluster.
2. **Database Access**: You will be provided with a username and password to access the database.
3. **Atlas Access Credentials**: Although not required, you may receive credentials to access MongoDB Atlas.

### Self-Paced: Create an Atlas Cluster

If you prefer a self-paced approach, you can create your own Atlas cluster and load the Sample Dataset. Follow the [MongoDB Atlas documentation](https://docs.atlas.mongodb.com/getting-started/) to create a cluster and load the sample data.

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


## CRUD Operations

In this section, you will learn how to perform basic CRUD operations in MongoDB. You will be required to complete the code snippets to achieve the desired results.

- **Create**: Insert documents into a collection.
- **Read**: Query documents from a collection.
- **Update**: Modify existing documents in a collection.
- **Delete**: Remove documents from a collection.

## MongoDB Aggregations

This section will cover MongoDB's aggregation framework. You will learn how to use various aggregation stages to process and analyze your data.

- **Match**: Filter documents.
- **Group**: Group documents by a specified field.
- **Sort**: Sort documents.
- **Project**: Reshape documents.

### Exercise: Aggregations

**Objective** 
In this exercise, you will create an aggregation pipeline to analyze the average price of listings based on the number of beds. The pipeline will filter, group, and sort the data to provide meaningful insights.

**Pipeline Definition**  

1. **Navigate to the File**: In the `controllers` folder open `02-aggregateController.js`.
2. **Modify the Function**: Locate and modify the `getPriceStatistics` function.
3. **Update the Pipeline Array**:
    - **$match Stage**: Filter documents to include only those that have both `beds` and `price` fields.
    - **$group Stage**: Group the documents by the number of beds and calculate the average price for each group.
    - **$sort Stage**: Sort the grouped documents by the number of beds in ascending order.

### Hint: Aggregations

For more detailed guidance on each stage, refer to the following MongoDB documentation links:
- **$match**: Learn how to filter documents in the aggregation pipeline.
  [Match Documentation](https://www.mongodb.com/docs/manual/reference/operator/aggregation/match/)
- **$group**: Understand how to group documents and perform aggregations.
  [Group Documentation](https://www.mongodb.com/docs/manual/reference/operator/aggregation/group/)
- **$sort**: Learn how to sort documents in the aggregation pipeline.
  [Sort Documentation](https://www.mongodb.com/docs/manual/reference/operator/aggregation/sort/)


## Test Your Results

To ensure that your exercise is complete and all functions are working as expected, you can run the provided test suite. Follow these steps to test your results:

1. **Run Tests**: Execute the test suite by running:
   ```bash
   npm test
   ```

2. **Review Test Results**: The test suite will automatically validate each function you were asked to modify. The output will indicate whether each test has passed or failed.

3. **Completion Criteria**: The exercise is considered complete if all tests pass successfully. A positive result for all tests means that your implementation meets the required specifications.

4. **Troubleshooting**: If any tests fail, review the error messages and make the necessary adjustments to your code. Re-run the tests until all of them pass.

By following these steps, you can confidently verify that your changes are correct and the exercise is complete. Happy coding!


## Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB University](https://university.mongodb.com/)
