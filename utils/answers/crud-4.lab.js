import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

/**
 * Constructs a query based on the provided filter inputs (amenities, propertyType, beds) 
 * and applies pagination (skip, limit). 
 * If no filters are provided, returns all documents using pagination.
 *
 * @param {string[]} amenities - An array of selected amenities.
 * @param {string} propertyType - The property type to filter by.
 * @param {string} beds - The range of required beds (e.g., "2-3", "4-7").
 * @param {number} skip - The number of documents to skip (pagination).
 * @param {number} limit - The number of documents to return (pagination).
 * @returns {Promise<Array>} - A promise that resolves to the filtered list of documents.
 */
export async function crudFilter(amenities, propertyType, beds, skip, limit) {    
    const query = {}

    // Adding amenities to the query if available
    if (amenities && amenities.length > 0) {
        query.amenities = { $all: amenities };
    }

    // Adding property_type to the query if available
    if (propertyType) {
        query.property_type = propertyType;
    }
    
    if (beds) {
        const [minBeds, maxBeds] = beds.split('-').map(Number);
        query.beds = { $gte: minBeds, $lte: maxBeds };
    }
    
    const items = await db.collection(collectionName)
        .find(query)
        .skip(skip)
        .limit(limit)

    return items.toArray()
}
