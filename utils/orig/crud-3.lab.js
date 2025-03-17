import { db } from "../../server/src/utils/database.js";  
import { collectionName } from '../../server/src/config/config.js';  

/**
You are required to find all the distinct value based in field field 
 */
export async function crudDistinct(field) {
    const items = await db.collection(collectionName)

    return items
}
