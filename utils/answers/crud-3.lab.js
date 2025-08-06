import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

/**
 * Retrieves all distinct values for the specified field name from the collection.
 *
 * @param {string} field_name - The field to retrieve distinct values from.
 * @returns {Promise<Array>} - An array of distinct values.
 */
export async function crudDistinct(field_name) {
    
    const items = await db.collection(collectionName)
        .distinct(field_name)

    return items
}
