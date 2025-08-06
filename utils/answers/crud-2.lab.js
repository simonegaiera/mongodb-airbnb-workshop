import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

/**
 * Finds a single document where the `_id` equals the provided `id`.
 *
 * @param {string} id - The unique identifier of the document to find.
 * @returns {Promise<Object|null>} - A promise that resolves to the matched document or null if not found.
 */
export async function crudOneDocument(id) {
    const search = { _id: id }

    const item = await db.collection(collectionName)
        .findOne(search);

    return item
}
