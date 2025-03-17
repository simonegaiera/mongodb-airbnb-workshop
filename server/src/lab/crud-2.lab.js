import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

/**
You are required to find the document with _id equal to id
*/
export async function crudOneDocument(id) {
    const search = { _id: id }

    const item = await db.collection(collectionName)

    return item
}
