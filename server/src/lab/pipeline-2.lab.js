import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

/**
 * Constructs and runs an aggregation pipeline to analyze host performance metrics.
 * Compares Superhosts vs Regular hosts across multiple dimensions.
 * 
 * DESIDERATA: Create a pipeline that analyzes host performance metrics
 * by working with nested documents and handling missing data gracefully.
 * 
 * Your pipeline should:
 * 1. $match: Filter for properties with price > 0 and number_of_reviews > 0
 * 2. $addFields: Create an 'isSuperhost' field that handles missing host.host_is_superhost
 *    (treat missing as false using $ifNull)
 * 3. $group: Group by the isSuperhost field and calculate:
 *    - avgRating: average of review_scores.review_scores_rating
 *    - avgReviews: average number_of_reviews
 *    - avgListings: average host.host_total_listings_count
 *    - avgPrice: average price
 *    - totalProperties: count of properties
 *    - avgResponseRate: average host.host_response_rate
 * 4. $project: Transform output with:
 *    - hostType: "Superhost" if true, "Regular Host" if false
 *    - Round all averages appropriately (ratings to 1 decimal, others as needed)
 * 5. $sort: Sort by avgRating descending
 * 
 *
 * @returns {Promise<Array>} - A promise that resolves to an array of host performance analytics.
 */
export async function hostPerformanceAnalytics() {
    const pipeline = []

    const result = await db.collection(collectionName)

    return result.toArray()
}
