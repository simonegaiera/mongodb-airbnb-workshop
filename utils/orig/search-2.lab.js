import { db } from "../../server/src/utils/database.js";  
import { collectionName } from '../../server/src/config/config.js';  

/**
Use the $search stage with the autocomplete created before to filter on the facets.
In the facets section, add string facets for amenities and property_type.
In the facets section, add number facets for beds with boundaries from 0 to 9, and set the default to “Other”.
*/
export async function facetSearch(query) {
  const pipeline = [

  ];
  
  // console.log('Facet Pipeline:', JSON.stringify(pipeline, null, 2));
  
  const item = await db.collection(collectionName)
    .aggregate(pipeline);
  
  return item.toArray()
}
