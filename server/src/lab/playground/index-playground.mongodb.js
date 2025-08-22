// Replace the Database Name with your Database Name
airbnb_database = 'sample_airbnb';
use(airbnb_database);


// Find all the available indexes
db.listingsAndReviews.getIndexes();

// Create an index
// index_fields = {}
// db.listingsAndReviews.createIndex(index_fields)
