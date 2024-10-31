import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

export async function facetSearch(query) {
  const pipeline = [
    {
      '$searchMeta': {
        'index': 'default',
        'facet': {
          'operator': {
            // TODO: Use the $search stage with the autocomplete created before to filter on the facets
            'autocomplete': {
              'query': query,
              'path': 'name',
              'fuzzy': {}
            }
          },
          'facets': {
            // TODO: Add string facets for amenities called ammenities
            'amenities': {
              'type': 'string',
              'path': 'amenities'
            },
            // TODO: Add string facets for property_type called property_type
            'property_type': {
              'type': 'string',
              'path': 'property_type'
            },
            // TODO: Add number facets for beds with boundaries from 0 to 9 and default as 'Other' called beds
            'beds': {
              'type': 'number',
              'path': 'beds',
              'boundaries': [
                0, 1, 2, 3, 4, 6, 8, 10
              ],
              'default': 'Other'
            }
          }
        }
      }
    }
  ];
  
  // console.log('Facet Pipeline:', JSON.stringify(pipeline, null, 2));
  
  const item = await db.collection(collectionName).aggregate(pipeline);
  
  return item.toArray()
}
