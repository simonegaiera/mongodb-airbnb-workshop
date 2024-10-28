import { db } from "../utils/database.js";
import { collectionName } from '../config/config.js';


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
