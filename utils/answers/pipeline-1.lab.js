import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

/**
 * Constructs and runs an aggregation pipeline to compute the average price of listings based on their bed count.
 * 
 * - $match: Filter for documents with both beds and price fields.
 * - $group: Group by number of beds and calculate average price.
 * - $sort: Sort by number of beds in ascending order.
 * - $project: Return only `beds` and `price` fields.
 *
 * @returns {Promise<Array>} - A promise that resolves to an array of aggregated documents.
 */
export async function aggregationPipeline() {
    const pipeline = [
      {
        $match: {
          beds: { $exists: true },
          price: { $exists: true }
        }
      },
      {
        $group: {
          _id: '$beds',
          price: { $avg: '$price' }
        }
      },
      { 
          $sort: {
            _id : 1 
          } 
      },
      {
        $project: {
          _id: 0,
          beds: '$_id',
          price: 1
        }
      }
    ]

    const item = await db.collection(collectionName)
    		.aggregate(pipeline);

    return item.toArray()
}
