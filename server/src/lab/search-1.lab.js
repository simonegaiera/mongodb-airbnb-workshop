import { db } from "../utils/database.js";
import { collectionName } from '../config/config.js';

/**
 * Uses $search on the 'search_index' index to build a simple autocomplete search.
 * This pipeline applies an autocomplete operator on the 'name' field,
 * enabling fuzzy search to handle typos and variations.
 * It limits the results to 10 documents and projects only the 'name' field.
 *
 * @param {string} query - The search term to autocomplete on.
 * @returns {Promise<Array>} - A promise that resolves to an array of documents containing only the 'name' field.
 */
export async function autocompleteSearch(query) {
    const pipeline = []

    const item = await db.collection(collectionName)

    return item.toArray()
}
