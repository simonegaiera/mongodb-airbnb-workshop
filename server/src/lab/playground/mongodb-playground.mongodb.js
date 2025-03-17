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
// index_name = 'default'
// type = 'search'
// definition = {}
// db.listingsAndReviews.createSearchIndex(
//     index_name,
//     type,
//     definition
//  )