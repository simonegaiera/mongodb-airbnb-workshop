import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

export async function crudCreateItem(item) {
    const result = await db.collection(collectionName).insertOne(item);

    return result
}
