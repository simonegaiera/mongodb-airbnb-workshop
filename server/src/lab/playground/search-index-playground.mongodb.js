// Replace the Database Name with your Database Name
airbnb_database = 'sample_airbnb';
use(airbnb_database);


// Find all the available Search indexes
db.listingsAndReviews.getSearchIndexes();

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
