import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

export async function crudFind(query, skip, limit) {

    const items = await db.collection(collectionName)
    .find(query)
    .sort({ _id: 1 })
    .skip(skip)
    .limit(limit)
    
    return items.toArray()
}
