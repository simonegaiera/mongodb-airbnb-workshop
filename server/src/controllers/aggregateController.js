import { aggregationPipeline } from "../lab/pipeline-1.lab.js";
import { logInfo, logError } from '../utils/logger.js';


export async function getPriceStatistics(req, res) {
    
    try {
        const items = await aggregationPipeline();
        
        logInfo(req, `[pipeline-1] SUCCESS: Retrieved price statistics with ${items.length} result(s)`);
        res.status(200).json(items);
    } catch (error) {
        logError(req, `[pipeline-1] ERROR: Failed to retrieve price statistics:`, error);
        res.status(500).json({ message: error.message });
    }
};
