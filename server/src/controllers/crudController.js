import { crudFind } from "../lab/crud-1.lab.js";
import { crudOneDocument } from "../lab/crud-2.lab.js";
import { crudDistinct } from "../lab/crud-3.lab.js";
import { crudFilter } from "../lab/crud-4.lab.js";
import { crudCreateItem } from "../lab/crud-5.lab.js";
import { crudUpdateElement } from "../lab/crud-6.lab.js";
import { crudAddToArray } from "../lab/crud-7.lab.js";
import { crudDelete } from "../lab/crud-8.lab.js";


// GET all items
export async function getAllItems(req, res) {
    const query = req.query.query ? JSON.parse(req.query.query) : {};
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    try {
        const items = await crudFind(query, skip, limit);
        
        console.info(`[crud-1] SUCCESS: Retrieved ${items.length} items (page ${page}, limit ${limit})`);
        res.status(200).json(items);
    } catch (error) {
        console.error(`[crud-1] ERROR: Failed to retrieve items:`, error.message);
        console.error(`[crud-1] ERROR: Stack trace:`, error.stack);
        res.status(500).json({ message: error.message });
    }
};

// GET one item by ID
export async function getOneItem(req, res) {
    const { id } = req.params;
    try {
        const item = await crudOneDocument(id);
                
        if (!item) {
            console.info(`[crud-2] INFO: Item not found for ID: ${id}`);
            return res.status(404).json({ message: 'Item not found' });
        }
        
        console.info(`[crud-2] SUCCESS: Retrieved item with ID: ${id}`);
        res.status(200).json(item);
    } catch (error) {
        console.error(`[crud-2] ERROR: Failed to retrieve item with ID ${id}:`, error.message);
        console.error(`[crud-2] ERROR: Stack trace:`, error.stack);
        res.status(500).json({ message: error.message });
    }
};

// GET distinct items
export async function getDistinct(req, res) {
    const field = req.query.field || '';
    
    if (!field || field === '') {
        console.info(`[crud-3] INFO: Missing field parameter in request`);
        return res.status(400).json({ message: 'field parameter is required' });
    }
    
    try {
        const items = await crudDistinct(field);
        
        console.info(`[crud-3] SUCCESS: Retrieved ${items.length} distinct values for field: ${field}`);
        res.status(200).json(items);
    } catch (error) {
        console.error(`[crud-3] ERROR: Failed to retrieve distinct values for field ${field}:`, error.message);
        console.error(`[crud-3] ERROR: Stack trace:`, error.stack);
        res.status(500).json({ message: error.message });
    }
};

// Filters item
export async function getFilters(req, res) {
    if (!req.body) {
        console.info(`[crud-4] INFO: Missing request body`);
        return res.status(400).json({ message: 'Body is required' });
    }
    
    const { page, limit, filters } = req.body;
    
    const { amenities, propertyType, beds, bounds } = filters;

    const skip = (page - 1) * limit;
    
    try {
        const items = await crudFilter(amenities, propertyType, beds, skip, limit);
        
        console.info(`[crud-4] SUCCESS: Retrieved ${items.length} filtered items (page ${page}, limit ${limit})`);
        res.status(201).json(items);
    } catch (error) {
        console.error(`[crud-4] ERROR: Failed to apply filters:`, error.message);
        console.error(`[crud-4] ERROR: Stack trace:`, error.stack);
        res.status(400).json({ message: error.message });
    }
}

// POST a new item
export async function insertItem(req, res) {
    const item = req.body;
    
    try {
        const result = await crudCreateItem(item);
        
        console.info(`[crud-5] SUCCESS: Created new item with ID: ${result.insertedId || 'unknown'}`);
        res.status(201).json(result);
    } catch (error) {
        console.error(`[crud-5] ERROR: Failed to create new item:`, error.message);
        console.error(`[crud-5] ERROR: Stack trace:`, error.stack);
        res.status(400).json({ message: error.message });
    }
};

// DELETE an item by ID
export async function deleteItem(req, res) {
    const { id } = req.params;
    
    try {   
        const result = await crudDelete(id);

        // Check if result is a Collection (has a property like collectionName) instead of a deletion result
        if (result && result.collectionName) {
            console.error(`[crud-8] ERROR: Unexpected result type from deletion operation for ID ${id}`);
            return res.status(500).json({ message: 'Unexpected result type from deletion operation' });
        }
        
        if (result && typeof result.deletedCount !== 'undefined') {
            if (result.deletedCount === 0) {
                console.info(`[crud-8] INFO: Item not found for deletion with ID: ${id}`);
                return res.status(404).json({ message: 'Item not found' });
            }
            console.info(`[crud-8] SUCCESS: Deleted ${result.deletedCount} item(s) with ID: ${id}`);
            res.status(202).json(result);
        } else {
            console.error(`[crud-8] ERROR: Unexpected result from deletion operation for ID ${id}`);
            return res.status(500).json({ message: 'Unexpected result from deletion operation' });
        }
    } catch (error) {
        console.error(`[crud-8] ERROR: Failed to delete item with ID ${id}:`, error.message);
        console.error(`[crud-8] ERROR: Stack trace:`, error.stack);
        res.status(500).json({ message: error.message });
    }
};

// PATCH a new item
export async function updateValue(req, res) {
    const { id } = req.params;
    const doc = req.body;
    
    if (!doc) {
        console.info(`[crud-6] INFO: Missing request body for ID: ${id}`);
        return res.status(400).json({ message: 'Body is required' });
    }
    
    if (Object.keys(doc).length === 0 || !Object.values(doc).some(value => value !== undefined && value !== null)) {
        console.info(`[crud-6] INFO: Empty or invalid request body for ID: ${id}`);
        return res.status(400).json({ error: "Request body must contain at least one key-value pair" });
    }
    
    if (!id) {
        console.info(`[crud-6] INFO: Missing ID parameter`);
        return res.status(400).json({ message: 'ID is required' });
    }
    
    const key = doc.key;
    const value = doc.value;
    
    try {
        const result = await crudUpdateElement(id, key, value);
        
        console.info(`[crud-6] SUCCESS: Updated item with ID: ${id}, key: ${key}`);
        res.status(201).json(result);
    } catch (error) {
        console.error(`[crud-6] ERROR: Failed to update item with ID ${id}:`, error.message);
        console.error(`[crud-6] ERROR: Stack trace:`, error.stack);
        res.status(400).json({ message: error.message });
    }
};

// POST a new item
export async function insertReview(req, res) {
    const { id } = req.params;
    const review = req.body;
    
    if (!review || Object.keys(review).length === 0) {
        console.info(`[crud-7] INFO: Missing or empty review body for ID: ${id}`);
        return res.status(400).json({ message: 'Body is required' });
    }
    
    if (!id) {
        console.info(`[crud-7] INFO: Missing ID parameter`);
        return res.status(400).json({ message: 'ID is required' });
    }
    
    try {
        const result = await crudAddToArray(id, review);
        
        console.info(`[crud-7] SUCCESS: Added review to item with ID: ${id}`);
        res.status(201).json(result);
    } catch (error) {
        console.error(`[crud-7] ERROR: Failed to add review to item with ID ${id}:`, error.message);
        console.error(`[crud-7] ERROR: Stack trace:`, error.stack);
        res.status(400).json({ message: error.message });
    }
};
