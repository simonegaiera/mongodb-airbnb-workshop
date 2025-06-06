import '../utils/loadEnvironment.js';

export const port = process.env.PORT || 5000;
export const mongodbUri = process.env.MONGODB_URI;

const regex = /mongodb\+srv:\/\/(.*?):.*?@/;
const match = mongodbUri.match(regex);
export const databaseName = match ? match[1] : 'error';

export const collectionName = 'listingsAndReviews';
export const resultsDatabaseName = 'airbnb_gameday';
export const resultsCollectionName = 'results';
export const participantsCollectionName = 'participants';