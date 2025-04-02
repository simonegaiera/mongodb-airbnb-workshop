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
        
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET one item by ID
export async function getOneItem(req, res) {
    const { id } = req.params;
    try {
        const item = await crudOneDocument(id);
                
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET distinct items
export async function getDistinct(req, res) {
    const field = req.query.field || '';
    
    if (!field || field === '') {
        return res.status(400).json({ message: 'field parameter is required' });
    }
    
    try {
        const items = await crudDistinct(field)
        
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Filters item
export async function getFilters(req, res) {
    if (!req.body) {
        return res.status(400).json({ message: 'Body is required' });
    }
    
    const { page, limit, filters } = req.body;
    
    const { amenities, propertyType, beds, bounds } = filters;

    const skip = (page - 1) * limit;
    
    try {
        const items = await crudFilter(amenities, propertyType, beds, skip, limit);
        
        res.status(201).json(items);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// POST a new item
export async function insertItem(req, res) {
    const item = req.body;
    
    try {
        const result = await crudCreateItem(item)
        
        res.status(201).json(result);
    } catch (error) {
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
            return res.status(500).json({ message: 'Unexpected result type from deletion operation' });
        }
        
        if (result && typeof result.deletedCount !== 'undefined') {
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Item not found' });
            }
            return res.status(200).json({ message: 'Item deleted successfully' });
        } else {
            return res.status(500).json({ message: 'Unexpected result from deletion operation' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PATCH a new item
export async function updateValue(req, res) {
    const { id } = req.params;
    const doc = req.body;
    
    if (!doc) {
        return res.status(400).json({ message: 'Body is required' });
    }
    
    if (Object.keys(doc).length === 0 || !Object.values(doc).some(value => value !== undefined && value !== null)) {
        return res.status(400).json({ error: "Request body must contain at least one key-value pair" });
    }
    
    if (!id) {
        return res.status(400).json({ message: 'ID is required' });
    }
    
    const key = doc.key
    const value = doc.value
    
    try {
        const result = await crudUpdateElement(id, key, value)
        
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// POST a new item
export async function insertReview(req, res) {
    const { id } = req.params;
    const review = req.body;
    
    if (!review || Object.keys(review).length === 0) {
        return res.status(400).json({ message: 'Body is required' });
    }
    
    if (!id) {
        return res.status(400).json({ message: 'ID is required' });
    }
    
    try {
        const result = await crudAddToArray(id, review)
        
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
