import '../utils/loadEnvironment.js';

export const port = process.env.PORT || 5000;
export const mongodbUri = process.env.MONGODB_URI;
export const databaseName = 'sample_airbnb';
export const collectionName = 'listingsAndReviews';
export const resultsDatabaseName = 'airbnb_workshop';
export const resultsCollectionName = 'results';