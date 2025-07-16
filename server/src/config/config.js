import '../utils/loadEnvironment.js';

export const port = process.env.PORT || 5000;
export const mongodbUri = process.env.MONGODB_URI;
export const llmModel = process.env.LLM_MODEL;
export const awsRegion = process.env.AWS_REGION;

const regex = /mongodb\+srv:\/\/(.*?):.*?@/;
const match = mongodbUri.match(regex);
export const databaseName = match ? match[1] : 'error';

export const collectionName = 'listingsAndReviews';
export const resultsDatabaseName = 'airbnb_gameday';
export const resultsCollectionName = 'results';
export const participantsCollectionName = 'participants';