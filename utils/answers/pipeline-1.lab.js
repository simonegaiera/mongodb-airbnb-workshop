import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

/**
 * Property Investment Market Analysis Pipeline
 * 
 * Analyzes rental property market by bed count, providing investment insights.
 * 
 * DESIDERATA: Create a pipeline that analyzes property market segments
 * by bed count while filtering out invalid data for accurate investment analysis.
 * 
 * Your pipeline should:
 * 1. $match: Filter for quality investment properties with:
 *    - price > 0 (exclude test data and invalid listings)
 *    - number_of_reviews > 0 (only properties with proven market activity)
 *    - beds between 0-10 (focus on residential properties, exclude extreme outliers)
 *    - accommodates > 0 (ensure properties can actually host guests)
 * 2. $group: Group by bed count and calculate:
 *    - averagePrice: average price across properties
 *    - propertyCount: total number of properties in segment
 *    - averageReviews: average number of reviews
 * 3. $project: Format output with:
 *    - _id: 0 (remove the _id field from result set)
 *    - beds: bed count for the segment
 *    - averagePrice: rounded to 2 decimal places
 *    - propertyCount: total properties
 *    - averageReviews: rounded to 1 decimal place
 * 4. $sort: Sort by bed count ascending for logical progression
 *
 * @returns {Promise<Array>} - Market analysis grouped by bed count
 */
export async function aggregationPipeline() {
    const pipeline = [
        // Stage 1: Filter for quality investment properties
        {
            $match: {
                price: { $gt: 0 },                    // Valid pricing - exclude $0 test data
                number_of_reviews: { $gt: 0 },        // Market activity - proven properties only
                beds: { $gte: 0, $lte: 10 },          // Residential range - studios to large homes
                accommodates: { $gt: 0 }              // Functional rentals - must accommodate guests
            }
        },
        
        // Stage 2: Group by bed count and calculate investment metrics
        {
            $group: {
                _id: "$beds",                          // Group by bed count
                averagePrice: { $avg: "$price" },      // Average nightly rate
                propertyCount: { $sum: 1 },            // Market size indicator
                averageReviews: { $avg: "$number_of_reviews" }  // Guest satisfaction proxy
            }
        },
        
        // Stage 3: Format output for business presentation
        {
            $project: {
                _id: 0,
                beds: "$_id",                          // Clear field naming
                averagePrice: { $round: ["$averagePrice", 2] },    // Currency formatting
                propertyCount: 1,                      // Market size
                averageReviews: { $round: ["$averageReviews", 1] }  // Review volume
            }
        },
        
        // Stage 4: Sort by bed count for logical progression
        {
            $sort: { beds: 1 }
        }
    ];

    const result = await db.collection(collectionName)
        .aggregate(pipeline);

    return result.toArray();
}
