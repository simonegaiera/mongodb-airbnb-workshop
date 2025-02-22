import { db } from "../utils/database.js";  
import { collectionName } from '../config/config.js';  

/**
Update the Pipeline Array:
- $match Stage: Filter documents to include only those that have both beds and price fields.
- $group Stage: Group the documents by the number of beds and calculate the average price for each group.
- $sort Stage: Sort the grouped documents by the number of beds in ascending order.
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
            avgPrice: { $avg: '$price' }
          }
        },
        { 
            $sort: {
              _id : 1 
            } 
        }
      ]        

    const item = await db.collection(collectionName)
      .aggregate(pipeline);

    return item.toArray()
}
