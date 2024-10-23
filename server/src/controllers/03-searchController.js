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
                  'path': 'name',
                  'fuzzy': {}
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
  const { query } = req.query;

  try {
      const pipeline = [
          {
              '$searchMeta': {
                  'index': 'default',
                  'facet': {
                      'operator': {
                          'autocomplete': {
                              'query': query,
                              'path': 'name',
                              'fuzzy': {}
                          }
                      },
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
      ];

      // console.log('Facet Pipeline:', JSON.stringify(pipeline, null, 2));

      const item = await db.collection(collectionName).aggregate(pipeline).toArray();

      res.status(200).json(item);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

export async function getSearchItems(req, res) {
  const { page, limit, facetsQuery, searchQuery } = req.body;
  const { amenities, propertyType, beds } = facetsQuery;

  // Define the pipeline array for the MongoDB aggregation framework
  let pipeline = [];

  if (searchQuery === '') {
    pipeline.push({
      '$match': {
        'name': { '$ne': '' }
      }
    });
  } else {
    let searchPipeline = {
        $search: {
          index: "all",
          compound: {
            must: {
              autocomplete: {
                'query': searchQuery, 
                'path': 'name',
                'fuzzy': {}
              }
            },
            filter: [
            ]
          }
        }
      }
    
    if (amenities.length > 0) {
      searchPipeline['$search']['compound']['filter'] = { 
        'in': {
          path: 'amenities',
          value: amenities
        }
      };
    }
    if (propertyType.length > 0) {
      searchPipeline['$search']['compound']['filter'] = { 
        'in': {
          path: 'property_type',
          value: propertyType
        }
      };
    }
    if (beds.length > 0) {
      searchPipeline['$search']['compound']['filter'] = { 
        'in': {
          path: 'beds',
          value: beds
        }
      };
    }

    pipeline.push(searchPipeline)
  }

  // Pagination stages
  pipeline.push({
    '$skip': (page - 1) * limit
  }, {
    '$limit': limit
  });

  // console.log('Search Item Pipeline:', JSON.stringify(pipeline, null, 2));

  try {
    const items = await db.collection(collectionName).aggregate(pipeline).toArray();
    res.status(201).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
