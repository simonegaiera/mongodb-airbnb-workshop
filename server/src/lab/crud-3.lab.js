import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

/**
You are required to find all the distinct value based in field field 
 */
export async function crudDistinct(field_name) {
    
    const items = await db.collection(collectionName)

    return items
}
