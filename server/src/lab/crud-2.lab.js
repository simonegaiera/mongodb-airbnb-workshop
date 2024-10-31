import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

export async function crudOneDocument(id) {
    const search = { _id: id }

    const item = await db.collection(collectionName).findOne(search);

    return item
}
