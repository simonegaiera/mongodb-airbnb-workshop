import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

export async function crudFilter(amenities, propertyType, beds, page, limit) {    
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
    
    const items = await db.collection(collectionName)
        .find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        
    return items.toArray();
}
