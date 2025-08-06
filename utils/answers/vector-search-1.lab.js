import { db } from "../utils/database.js";
import { collectionName } from '../config/config.js';

/**
 * Performs a semantic search on the 'description' field using MongoDB's $vectorSearch.
 * The search uses the provided query string and requires a property type filter.
 * The pipeline considers 100 candidates and returns up to 10 results.
 *
 * @param {string} query - The user's search query as a string.
 * @param {string} propertyType - The property type to filter results (optional).
 * @returns {Promise<Array>} - A promise that resolves to an array of relevant documents.
 */
export async function vectorSearch(query, propertyType) {
    let filter = {};
    if (propertyType) {
        filter = {
        'property_type': propertyType
        };
    }

    const pipeline = [
    {
        '$vectorSearch': {
        'query': query, 
        'path': 'description', 
        'numCandidates': 100, 
        'index': 'vector_index', 
        'limit': 10, 
        'filter': filter
        }
    }
    ];

    const cursor = db.collection(collectionName)
        .aggregate(pipeline);

    return cursor.toArray();
}
