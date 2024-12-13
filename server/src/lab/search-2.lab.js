import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

/**
Use the $search stage with the autocomplete created before to filter on the facets.
In the facets section, add string facets for amenities and property_type.
In the facets section, add number facets for beds with boundaries from 0 to 9, and set the default to “Other”.
*/
export async function facetSearch(query) {
  const pipeline = [
    {
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
