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

    if (amenities && amenities.length > 0) {
        query.amenities = {};
    }
    
    if (beds) {
        const [minBeds, maxBeds] = beds.split('-').map(Number);
        query.beds = {};
    }
    
    const items = await db.collection(collectionName)
        
    return items.toArray()
}
