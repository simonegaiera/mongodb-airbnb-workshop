import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

/**
 * Deletes the document from the collection where `_id` equals the provided `id`.
 *
 * @param {string} id - The unique identifier of the document to delete.
 * @returns {Promise<Object>} - A promise that resolves to the delete result.
 */
export async function crudDelete(id) {
    const search = {}

    const result = await db.collection(collectionName)

    return result
}
