import { aggregationPipeline } from "../lab/pipeline-1.lab.js";
import { hostPerformanceAnalytics } from "../lab/pipeline-2.lab.js";
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

export async function getHostAnalytics(req, res) {
    
    try {
        const items = await hostPerformanceAnalytics();
        
        logInfo(req, `[pipeline-2] SUCCESS: Retrieved host analytics with ${items.length} result(s)`);
        res.status(200).json(items);
    } catch (error) {
        logError(req, `[pipeline-2] ERROR: Failed to retrieve host analytics:`, error);
        res.status(500).json({ message: error.message });
    }
};
