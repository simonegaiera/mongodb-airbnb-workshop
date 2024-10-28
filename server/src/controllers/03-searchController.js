import { db } from "../utils/database.js";
import { collectionName } from '../config/config.js';


export async function getAutocomplete(req, res) {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
    }

    try {
        const pipeline = [
            // TODO: Use the $search stage on the default index
            {
              '$search': {
                'index': 'default', 
                'autocomplete': {
                  'query': query, 
                  'path': 'name',
                  'fuzzy': {}
                }
              }
            }, 
            // TODO: Limit the results to 10 entries
            {
              '$limit': 10
            }, 
            // TODO: Use the $project stage to include only the name field in the results
            {
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
                          // TODO: Use the $search stage with the autocomplete created before to filter on the facets
                          'autocomplete': {
                              'query': query,
                              'path': 'name',
                              'fuzzy': {}
                          }
                      },
                      'facets': {
                          // TODO: Add string facets for amenities called ammenities
                          'amenities': {
                              'type': 'string',
                              'path': 'amenities'
                          },
                          // TODO: Add string facets for property_type called property_type
                          'property_type': {
                              'type': 'string',
                              'path': 'property_type'
                          },
                          // TODO: Add number facets for beds with boundaries from 0 to 9 and default as 'Other' called beds
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
