// Replace the Database Name with your Database Name
airbnb_database = 'sample_airbnb';
use(airbnb_database);

db.listingsAndReviews.find();

/*
Indexes
*/

// Find all the available indexes
// db.listingsAndReviews.getIndexes();

// Create an index
// index_fields = {}
// db.listingsAndReviews.createIndex(index_fields)


/*
Search Indexes
*/

// Find all the available Search indexes
// db.listingsAndReviews.getSearchIndexes();

// Create a Search Index
// index_name = 'search_index';
// type = 'search'
// definition = {
//   "analyzer": "",
//   "searchAnalyzer": "",
//   "mappings": {
//     "dynamic": false,
//     "fields": {
//       "amenities": [
//         {
//           "type": ""
//         },
//         {
//           "type": ""
//         }
//       ],
//       "beds": [
//         {
//           "type": ""
//         },
//         {
//           "type": ""
//         }
//       ],
//       "name": {
//         "analyzer": "",
//         "foldDiacritics": false,
//         "maxGrams": 1,
//         "minGrams": 1,
//         "type": ""
//       },
//       "property_type": [
//         {
//           "type": ""
//         },
//         {
//           "type": ""
//         }
//       ]
//     }
//   }
// }
// db.listingsAndReviews.createSearchIndex(
//     index_name,
//     type,
//     definition
//  )

/*
Vector Search Indexes
*/
airbnb_database = 'simone-gaiera';
use(airbnb_database);
// Find all the available Search indexes
db.listingsAndReviews.getSearchIndexes();

// Create a Vector Search Index
// index_name = 'vector_index_2';
// type = 'vectorSearch'
// definition = {
//   "fields": [
//     {
//       "type": "text",
//       "path": "description",
//       "model": "voyage-3-large"
//     },
//     {
//       "type": "filter",
//       "path": "property_type"
//     }
//   ]
// }
// db.listingsAndReviews.createSearchIndex(
//     index_name,
//     type,
//     definition
//  )
