// Replace the Database Name with your Database Name
airbnb_database = 'sample_airbnb';
use(airbnb_database);


// Find all the available Search indexes
db.listingsAndReviews.getSearchIndexes();

// Create a Vector Search Index
// index_name = 'vector_index';
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
