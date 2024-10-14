import { db } from "../utils/database.js";
import { collectionName } from '../config/config.js';


export async function getAutocomplete(req, res) {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
    }

    try {
        const pipeline = [
            {
              '$search': {
                'index': 'default', 
                'autocomplete': {
                  'query': query, 
                  'path': 'name'
                }
              }
            }, {
              '$limit': 10
            }, {
              '$project': {
                'name': 1, 
                '_id': 0
              }
            }
          ]

        const item = await db.collection(collectionName).aggregate(pipeline).toArray();

        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export async function getFacet(req, res) {

    try {
        const pipeline = [
          {
            '$searchMeta': {
              'index': 'default', 
              'facet': {
                'facets': {
                  'amenities': {
                    'type': 'string', 
                    'path': 'amenities'
                  }, 
                  'property_type': {
                    'type': 'string', 
                    'path': 'property_type'
                  }, 
                  'beds': {
                    'type': 'number', 
                    'path': 'beds', 
                    'boundaries': [
                      0, 1, 2, 3, 4, 6, 8, 10
                    ], 
                    'default': 'Other'
                  }
                }
              }
            }
          }
        ]

        const item = await db.collection(collectionName).aggregate(pipeline).toArray();

        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
