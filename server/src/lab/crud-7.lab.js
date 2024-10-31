import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

export async function crudUpdateElement(id, key, value) {

    const search = { _id: id }
    const update = { $set: { [key] : value } }
    
    const result = await db.collection(collectionName).updateOne(
        search,
        update
    );

    return result
}
