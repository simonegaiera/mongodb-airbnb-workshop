import { aggregationPipeline } from "../lab/pipeline-1.lab.js";


export async function getPriceStatistics(req, res) {
    
    try {
        const items = await aggregationPipeline();
        
        console.info(`[pipeline-1] SUCCESS: Retrieved price statistics with ${items.length} result(s)`);
        res.status(200).json(items);
    } catch (error) {
        console.error(`[pipeline-1] ERROR: Failed to retrieve price statistics:`, error.message);
        console.error(`[pipeline-1] ERROR: Stack trace:`, error.stack);
        res.status(500).json({ message: error.message });
    }
};
