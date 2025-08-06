import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

/**
 * Updates the specified document's field using the $set operator.
 *
 * @param {string} id - The unique identifier of the document to update.
 * @param {string} key - The field name to update.
 * @param {string|number|boolean} value - The new value to set for the field.
 * @returns {Promise<Object>} - A promise that resolves to the update result.
 */
export async function crudUpdateElement(id, key, value) {
    const search = { _id: id }
    const update = { $set: { [key] : value } }
    
    const result = await db.collection(collectionName)
        .updateOne(
            search,
            update
        );

    return result
}
