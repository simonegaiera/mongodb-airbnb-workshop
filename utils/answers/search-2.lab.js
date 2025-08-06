import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

/**
 * Uses $searchMeta on the default index to create and query facets based on the autocomplete operator.
 * This pipeline includes string facets for 'amenities' and 'property_type' 
 * and a numeric facet for 'beds' with boundaries from 0 to 9, defaulting to "Other".
 *
 * @param {string} query - The search term to autocomplete on.
 * @returns {Promise<Array>} - A promise that resolves to an array with the facet metadata.
 */
export async function facetSearch(query) {
	const pipeline = [{
		'$searchMeta': {
			'index': 'default',
			'facet': {
			'operator': {
				'autocomplete': {
				'query': query,
				'path': 'name',
				'fuzzy': {}
				}
			},
			'facets': {
				'amenities': {
				'type': 'string',
				'path': 'amenities'
				},
				'property_type': {
				'type': 'string',
				'path': 'property_type'
				},
				'beds': {
				'type': 'number',
				'path': 'beds',
				'boundaries': [
					0, 1, 2, 3, 4, 6, 8, 9
				],
				'default': 'Other'
				}
			}
			}
		}
	}]
	
	const item = await db.collection(collectionName)
	  .aggregate(pipeline)
  
	return item.toArray()
}
