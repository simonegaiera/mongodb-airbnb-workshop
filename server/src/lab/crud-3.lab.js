import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

export async function crudDistinct(field) {
    const items = await db.collection(collectionName).distinct(field);

    return items
}
