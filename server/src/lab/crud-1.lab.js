import { db } from "../../server/src/utils/database.js";  
import { collectionName } from '../../server/src/config/config.js';  

/**
You are required to find all the documents given the query in input
Results should be sorted by _id
Define pagination, skipping the required skip pages, and limit results based on limit
 */
export async function crudFind(query, skip, limit) {

    const items = await db.collection(collectionName)
    
    return items.toArray()
}
