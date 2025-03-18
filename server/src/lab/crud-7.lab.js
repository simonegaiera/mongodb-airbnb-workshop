import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

/**
The input for this function are:
- the _id as the id
- the review we want to insert in the array field reviews
Push the new review for the required document
*/
export async function crudAddToArray(id, review) {
    const search = {}
    const update = {}
    
    const result = await db.collection(collectionName)

    return result
}
