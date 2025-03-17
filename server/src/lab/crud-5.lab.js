import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

/**
You are required to insert the document item
The variable item is already formatted
*/
export async function crudCreateItem(item) {
    const result = await db.collection(collectionName)

    return result
}
