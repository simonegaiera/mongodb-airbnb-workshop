import { db } from "../../server/src/utils/database.js";  
import { collectionName } from '../../server/src/config/config.js';  

/**
You are required to insert the document item
The variable item is already formatted
*/
export async function crudCreateItem(item) {
    const result = await db.collection(collectionName)

    return result
}
