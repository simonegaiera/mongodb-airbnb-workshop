import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

/**
You are given a set of query inputs:
- amenities: an array of ammenities selected in the application
- propertyType: the property_type selected in the application
- beds: the range of required beds. Example: 2-3, 4-7, …
You are given a set of additional inputs:
- page: the page to skip for pagination
- limit: the number of documents returned
You are asked to complete the code to find all the documents for the specific query inputs
Not all the query items are passed by the application at a given time
If no query items are passed you should return all the document for the given page and limit
*/
export async function crudFilter(amenities, propertyType, beds, bounds, page, limit) {    
    const query = {};

    // Adding amenities to the query if available
    if (amenities && amenities.length > 0) {
        query.amenities = { $in: amenities };
    }
    
    // Adding property_type to the query if available
    if (propertyType) {
        query.property_type = propertyType;
    }
    
    // Adding beds to the query if available
    if (beds) {
        const [minBeds, maxBeds] = beds.split('-').map(Number);
        query.beds = { $gte: minBeds, $lte: maxBeds };
    }

    if (bounds) {
        query["address.location.coordinates"] = {
            "$geoWithin": {
                "$box": bounds
            }
        };
    }
    
    const items = await db.collection(collectionName)
        .find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        
    return items.toArray();
}
