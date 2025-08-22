import { db } from "../utils/database.js";
import { collectionName } from '../config/config.js';
import { autocompleteSearch } from "../lab/search-1.lab.js";
import { facetSearch } from "../lab/search-2.lab.js";


export async function getAutocomplete(req, res) {
    const { query } = req.body;
    
    if (!query) {
        console.info(`[search-1] INFO: Missing query parameter in request`);
        return res.status(400).json({ message: 'Query parameter is required' });
    }
    
    try {
        const items = await autocompleteSearch(query);
        
        console.info(`[search-1] SUCCESS: Retrieved ${items.length} autocomplete results for query: "${query}"`);
        res.status(201).json(items);
    } catch (error) {
        console.error(`[search-1] ERROR: Failed to get autocomplete results for query "${query}":`, error.message);
        console.error(`[search-1] ERROR: Stack trace:`, error.stack);
        res.status(500).json({ message: error.message });
    }
};

export async function getFacet(req, res) {
    const { query } = req.body;

    if (!query) {
        console.info(`[search-2] INFO: Missing query parameter in request`);
        return res.status(400).json({ message: 'Query parameter is required' });
    }
    
    try {
        const items = await facetSearch(query);
        
        console.info(`[search-2] SUCCESS: Retrieved ${items.length} facet results for query: "${query}"`);
        res.status(201).json(items);
    } catch (error) {
        console.error(`[search-2] ERROR: Failed to get facet results for query "${query}":`, error.message);
        console.error(`[search-2] ERROR: Stack trace:`, error.stack);
        res.status(500).json({ message: error.message });
    }
};

export async function getSearchItems(req, res) {
    const { page, limit, facetsQuery, searchQuery } = req.body;
    const { amenities, propertyType, beds } = facetsQuery;
    
    // Define the pipeline array for the MongoDB aggregation framework
    let pipeline = [];
    
    // Only add the search stage if searchQuery is not null or empty
    if (searchQuery && searchQuery.trim() !== '') {
        let searchPipeline = {
            $search: {
                index: "default",
                compound: {
                    must: {
                        autocomplete: {
                            query: searchQuery,
                            path: 'name',
                            fuzzy: {}
                        }
                    },
                    filter: []
                }
            }
        };
        
        if (amenities.length > 0) {
            searchPipeline.$search.compound.filter.push({ 
                in: {
                    path: 'amenities',
                    value: amenities
                }
            });
        }
        if (propertyType.length > 0) {
            searchPipeline.$search.compound.filter.push({ 
                in: {
                    path: 'property_type',
                    value: propertyType
                }
            });
        }
        if (beds.length > 0) {
            searchPipeline.$search.compound.filter.push({ 
                in: {
                    path: 'beds',
                    value: beds
                }
            });
        }
        
        pipeline.push(searchPipeline);

        // Pagination stages
        pipeline.push({
            '$skip': (page - 1) * limit
        }, {
            '$limit': limit
        });
    }

    // console.log('Search Query:', searchQuery, page, limit, facetsQuery);
    // console.log('Search Item Pipeline:', JSON.stringify(pipeline, null, 2));
    
    try {
        const items = await db.collection(collectionName).aggregate(pipeline).toArray();
        
        console.info(`[getSearchItems] SUCCESS: Retrieved ${items.length} search results for query: "${searchQuery}" (page ${page}, limit ${limit})`);
        res.status(201).json(items);
    } catch (error) {
        console.error(`[getSearchItems] ERROR: Failed to get search results for query "${searchQuery}":`, error.message);
        console.error(`[getSearchItems] ERROR: Stack trace:`, error.stack);
        res.status(500).json({ message: error.message });
    }
}
