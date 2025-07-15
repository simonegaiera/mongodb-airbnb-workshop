import { vectorSearch } from "../lab/vector-search-1.lab.js";


export async function getVectorSearch(req, res) {
    const { query, property_type } = req.body;
    
    if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
    }
    
    try {
        const items = await vectorSearch(query, property_type);
        
        res.status(201).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
