import { db } from "../utils/database.js";
import { collectionName } from '../config/config.js';


// PATCH a new item
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
        const result = await db.collection(collectionName).updateOne(
            { _id: id },
            { $push: { reviews: newReview } }
        );

        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
