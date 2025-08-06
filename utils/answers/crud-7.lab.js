import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

/**
 * Uses $push to add a new review to the `reviews` array of the specified document.
 * Optionally, uses $inc to increment the `number_of_reviews` field by 1.
 *
 * @param {string} id - The unique identifier of the document to update.
 * @param {Object} review - The review object to add to the document.
 * @returns {Promise<Object>} - A promise that resolves to the update result.
 */
export async function crudAddToArray(id, review) {
    const search = { _id: id }
    const update = { 
        $inc: { number_of_reviews: 1 },
        $push: { reviews: review } 
    }
    
    const result = await db.collection(collectionName)
        .updateOne(
            search,
            update
        );

    return result
}
