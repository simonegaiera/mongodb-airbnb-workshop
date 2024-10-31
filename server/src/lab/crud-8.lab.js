import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

export async function crudAddToArray(id, review) {
    const search = { _id: id }
    const update = { $push: { reviews: review } }
    
    const result = await db.collection(collectionName).updateOne(
        search,
        update
    );

    return item
}
