import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

/**
You are given a set of query inputs:
- amenities: an array of ammenities selected in the application
- propertyType: the property_type selected in the application
- beds: the range of required beds. Example: 2-3, 4-7, …
You are given a set of additional inputs:
- page: the skip for pagination
- limit: the number of documents returned
You are asked to complete the code to find all the documents for the specific query inputs
Not all the query items are passed by the application at a given time
If no query items are passed you should return all the document for the given page and limit
*/
export async function crudFilter(amenities, propertyType, beds, skip, limit) {    
    const query = {};
    
    const items = await db.collection(collectionName)
        
    return items.toArray();
}
