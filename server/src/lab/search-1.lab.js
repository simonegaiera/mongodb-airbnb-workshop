import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

/**
Use the $search stage on the default index.
Apply the autocomplete operator on the name field of the listing.
Enable fuzzy search to handle typos and variations.
Limit the results to 10 entries.
Use the $project stage to include only the name field in the results.
*/
export async function autocompleteSearch(query) {
    const pipeline = [
        {
          '$search': {
            'index': 'default', 
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

    const item = await db.collection(collectionName).aggregate(pipeline);

    return item.toArray()
}
