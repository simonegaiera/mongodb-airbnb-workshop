import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

/**
 * Inserts the given item into the collection. 
 * The `item` variable is already formatted and ready for insertion.
 *
 * @param {Object} item - The document to insert.
 * @returns {Promise<Object>} - A promise that resolves to the insert result.
 */
export async function crudCreateItem(item) {
    const result = await db.collection(collectionName)
    
    return result
}
