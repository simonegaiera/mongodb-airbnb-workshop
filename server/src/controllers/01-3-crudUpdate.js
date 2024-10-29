import { db } from "../utils/database.js";
import { collectionName } from '../config/config.js';


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
        const search = { _id: id }
        const update = { $set: { [key] : value } }

        const result = await db.collection(collectionName).updateOne(
            search,
            update
        );

        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// PUSH a new item
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
        const search = { _id: id }
        const update = { $push: { reviews: newReview } }

        const result = await db.collection(collectionName).updateOne(
            search,
            update
        );

        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
