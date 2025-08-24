import { db } from "../utils/database.js";
import { collectionName } from '../config/config.js';

/**
 * Uses $search on the default index to build a simple autocomplete search.
 * This pipeline applies an autocomplete operator on the 'name' field,
 * enabling fuzzy search to handle typos and variations.
 * It limits the results to 10 documents and projects only the 'name' field.
 *
 * @param {string} query - The search term to autocomplete on.
 * @returns {Promise<Array>} - A promise that resolves to an array of documents containing only the 'name' field.
 */
export async function autocompleteSearch(query) {
	const pipeline = [
		{
			'$search': {
				'index': 'search_index', 
				'autocomplete': {
				'query': query, 
				'path': 'name',
				'fuzzy': {}
				}
			}
		}, 
		{
			'$limit': 10
		}, 
		{
			'$project': {
				'name': 1, 
				'_id': 0
			}
		}
	]

    const item = await db.collection(collectionName)
		.aggregate(pipeline);

    return item.toArray()
}
