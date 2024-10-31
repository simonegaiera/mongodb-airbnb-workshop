import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

export async function crudDelete(id) {
    const search = { _id: id }

    const result = await db.collection(collectionName).deleteOne( search );

    return result
}
