// Replace the Database Name with your Database Name
airbnb_database = require('process').env.DATABASE_NAME || "sample_airbnb";
use(airbnb_database);

db.listingsAndReviews.find();
