import { db } from "../../server/src/utils/database.js";  
import { collectionName } from '../../server/src/config/config.js';  

/**
The input for this function are:
- the _id as the id
- the name of the field you want to update key
- the new value for the field you want to update value
Modify the function to update ($set) the required document with the given value for the given key
 */
export async function crudUpdateElement(id, key, value) {
    
    const result = await db.collection(collectionName)

    return result
}
