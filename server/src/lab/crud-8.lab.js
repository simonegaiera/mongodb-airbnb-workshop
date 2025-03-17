import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

/**
You are required to delete the document with _id equal to id
 */
export async function crudDelete(id) {
    const search = { _id: id }

    const result = await db.collection(collectionName)

    return result
}
