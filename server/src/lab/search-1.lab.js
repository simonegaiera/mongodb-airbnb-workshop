import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

export async function autocompleteSearch(query) {
    const pipeline = [
        // TODO: Use the $search stage on the default index
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
        // TODO: Limit the results to 10 entries
        {
          '$limit': 10
        }, 
        // TODO: Use the $project stage to include only the name field in the results
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
