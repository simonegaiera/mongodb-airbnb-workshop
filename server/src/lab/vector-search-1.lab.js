import { db } from "../utils/database.js";
import { collectionName } from '../config/config.js';

/**
 * Uses $vectorSearch to perform semantic search on the 'description' field.
 * This pipeline applies a vector search using the provided query embedding,
 * optionally filters by 'property_type', limits results to 10, and projects relevant fields.
 *
 * @param {Array<number>} queryEmbedding - The embedding vector for the user's query.
 * @param {string} [propertyType] - Optional property type to filter results.
 * @returns {Promise<Array>} - A promise that resolves to an array of relevant documents.
 */
export async function vectorSearch(queryEmbedding, propertyType) {
    const pipeline = [];

    const cursor = db.collection(collectionName);
    return cursor.toArray();
}
