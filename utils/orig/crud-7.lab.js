import { db } from "../../server/src/utils/database.js";  
import { collectionName } from '../../server/src/config/config.js';  

/**
The input for this function are:
- the _id as the id
- the review we want to insert in the array field reviews
Push the new review for the required document
*/
export async function crudAddToArray(id, review) {
    const search = { _id: id }
    const update = { $push: { reviews: review } }
    
    const result = await db.collection(collectionName)

    return result
}
