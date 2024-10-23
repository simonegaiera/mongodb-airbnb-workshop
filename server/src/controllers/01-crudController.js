import { db } from "../utils/database.js";
import { collectionName } from '../config/config.js';

// GET all items
export async function getAllItems(req, res) {
    const query = req.query.query ? JSON.parse(req.query.query) : {};
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const items = await db.collection(collectionName)
            .find(query)
            .sort({ _id: 1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET one item by ID
export async function getOneItem(req, res) {
    const { id } = req.params;
    try {
        const item = await db.collection(collectionName).findOne({ _id: id });
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST a new item
export async function createItem(req, res) {
    const newItem = req.body;
    try {
        const result = await db.collection(collectionName).insertOne(newItem);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// UPDATE a new item
export async function updateValue(req, res) {
    const { id } = req.params;
    const update = req.body;

    if (!update) {
        return res.status(400).json({ message: 'Body is required' });
    }

    if (Object.keys(update).length === 0 || !Object.values(update).some(value => value !== undefined && value !== null)) {
        return res.status(400).json({ error: "Request body must contain at least one key-value pair" });
    }

    if (!id) {
        return res.status(400).json({ message: 'ID is required' });
    }

    try {
        const result = await db.collection(collectionName).updateOne(
            { _id: id },
            { $set: { [update.key]: update.value } }
        );

        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// POST a new item
export async function insertReview(req, res) {
    const { id } = req.params;
    const newReview = req.body;

    if (!newReview || Object.keys(newReview).length === 0) {
        return res.status(400).json({ message: 'Body is required' });
    }

    if (!id) {
        return res.status(400).json({ message: 'ID is required' });
    }

    try {
        const result = await db.collection(collectionName).updateOne(
            { _id: id },
            { $push: { reviews: newReview } }
        );

        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// DELETE an item by ID
export async function deleteItem(req, res) {
    const { id } = req.params;
    try {
        const result = await db.collection(collectionName).deleteOne({ _id: id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(200).json({ message: 'Item deleted successfully' });
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
        const items = await db.collection(collectionName)
            .distinct(field);

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
    const { amenities, property_type, beds } = filters;
    const query = {};

    // Adding amenities to the query if available
    if (amenities && amenities.length > 0) {
        query.amenities = { $in: amenities };
    }

    // Adding property_type to the query if available
    if (property_type) {
        query.property_type = property_type;
    }

    // Adding beds to the query if available
    if (beds) {
        const [minBeds, maxBeds] = beds.split('-').map(Number);
        query.beds = { $gte: minBeds, $lte: maxBeds };
    }

    try {
        const result = await db.collection(collectionName).find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();

        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}