# MongoDB AirBnb Workshop

Welcome to the MongoDB AirBnb Workshop! This workshop is designed to help you get hands-on experience with MongoDB by walking you through various basic operations and advanced features. By the end of this workshop, you will have a solid understanding of how to interact with MongoDB and leverage its powerful capabilities.

## Introduction

This workshop will cover the basic operations you can perform with MongoDB. Each section will require you to complete the code to achieve the desired result. The workshop is structured to provide you with a comprehensive understanding of MongoDB's core functionalities.
Github Link: [mongodb-airbnb-workshop](https://github.com/simonegaiera/mongodb-airbnb-workshop)

## Workshop Overview

The workshop will cover the following topics:

1. **CRUD Operations**: Learn how to Create, Read, Update, and Delete documents in MongoDB.
2. **MongoDB Aggregations**: Understand how to use MongoDB's powerful aggregation framework to perform data analysis.
3. **Atlas Search**: Explore how to use MongoDB Atlas Search to perform full-text search on your data.

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

## Atlas Search

Learn how to use MongoDB Atlas Search to perform full-text search on your data. This section will guide you through creating search indexes and running search queries.

### Index Creation

#### Index Creation: Default

**Objective** 
The goal of this exercise is to create a MongoDB search index with specific field types to optimize search queries and improve database performance. The index must be named `default`.

**Field Mappings**  
You need to create an index with the following field mappings:
- `amenities` should be of type `stringFacet`
- `beds` should be of type `numberFacet`
- `property_type` should be of type `stringFacet`
- `name` should be of type `autocomplete`

#### Index Creation: All

**Objective**  
The goal of this exercise is to create a MongoDB search index with specific field types to optimize search queries and improve database performance. The index must be named `all`.

**Field Mappings**  
You need to create an index with the following field mappings:
- `amenities` should be of type `token`
- `property_type` should be of type `token`
- `name` should be of type `autocomplete`

### Hint: Index Creation
If you need more detailed instructions or additional information on how to create and manage search indexes in MongoDB Atlas, check out the official MongoDB Atlas Search Documentation. It provides comprehensive guides, examples, and best practices to help you get the most out of Atlas Search.
- [Manage Index](https://www.mongodb.com/docs/atlas/atlas-search/manage-indexes/)
- [Define Fields Mapping](https://www.mongodb.com/docs/atlas/atlas-search/define-field-mappings/)

### Autocomplete

#### Exercise: Autocomplete

1. **Navigate to the File**: Open `03-searchController.js`.
2. **Modify the Function**: Locate and modify the `getAutocomplete` function.
3. **Update the Pipeline Array**:
    - Use the `$search` stage on the `default` index.
    - Apply the `autocomplete` operator on the `name` field of the listing.
    - Enable fuzzy search to handle typos and variations.
    - Limit the results to 10 entries.
    - Use the `$project` stage to include only the `name` field in the results.

### Hint: Autocomplete

For more detailed guidance on each step, refer to the following MongoDB documentation links:

- **Autocomplete**: Learn how to use the `autocomplete` operator to enhance search capabilities.
  [Autocomplete Documentation](https://www.mongodb.com/docs/atlas/atlas-search/field-types/autocomplete-type/)
  
- **Create Query**: Understand how to construct search queries in MongoDB Atlas.
  [Create Query Documentation](https://www.mongodb.com/docs/atlas/atlas-search/create-queries/)
  
- **Search**: Explore the `$search` aggregation stage to perform full-text searches.
  [Search Documentation](https://www.mongodb.com/docs/atlas/atlas-search/aggregation-stages/search/)
  
- **Limit**: Learn how to limit the number of documents returned by a query.
  [Limit Documentation](https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit/)
  
- **Project**: Understand how to use the `$project` stage to include or exclude specific fields.
  [Project Documentation](https://www.mongodb.com/docs/manual/reference/operator/aggregation/project/)

### Facets


#### Exercise: Facets

1. **Navigate to the File**: Open `03-searchController.js`.
2. **Modify the Function**: Locate and modify the `getFacet` function.
3. **Update the Pipeline Array**:
    - Use the `$search` stage with the `autocomplete` created before to filter on the facets.
    - In the `facets` section, add string facets for `amenities` and `property_type`.
    - In the `facets` section, add number facets for `beds` with boundaries from 0 to 9, and set the default to "Other".

### Hint: Facets

For more detailed guidance on each step, refer to the following MongoDB documentation links:

- **Autocomplete**: Learn how to use the `autocomplete` operator to enhance search capabilities.
  [Autocomplete Documentation](https://www.mongodb.com/docs/atlas/atlas-search/field-types/autocomplete-type/)
  
- **Create Query**: Understand how to construct search queries in MongoDB Atlas.
  [Create Query Documentation](https://www.mongodb.com/docs/atlas/atlas-search/create-queries/)
  
- **Search**: Explore the `$search` aggregation stage to perform full-text searches.
  [Search Documentation](https://www.mongodb.com/docs/atlas/atlas-search/aggregation-stages/search/)
  
- **Facets**: Learn how to use facets to categorize search results.
  [Facets Documentation](https://www.mongodb.com/docs/atlas/atlas-search/facets/)
  
- **Number Facets**: Understand how to create number facets with boundaries.
  [Number Facets Documentation](https://www.mongodb.com/docs/atlas/atlas-search/facets/#number-facets)

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
