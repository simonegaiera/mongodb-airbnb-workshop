import { db } from "../utils/database.js";
import { collectionName } from '../config/config.js';

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

