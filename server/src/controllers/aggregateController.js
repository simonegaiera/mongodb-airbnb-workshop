import { db } from "../utils/database.js";
import { collectionName } from '../config/config.js';
import { aggregationPipeline } from "../lab/pipeline-1.lab.js";


export async function getPriceStatistics(req, res) {
    
    try {
        const items = await aggregationPipeline();
        
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
