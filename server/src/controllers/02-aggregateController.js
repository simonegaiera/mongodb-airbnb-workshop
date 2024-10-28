import { db } from "../utils/database.js";
import { collectionName } from '../config/config.js';


export async function getPriceStatistics(req, res) {

    try {
        const pipeline = [
            // TODO: Filter documents to include only those that have both beds and price fields
            {
              $match: {
                beds: { $exists: true },
                price: { $exists: true }
              }
            },
            // TODO: Group the documents by the number of beds and calculate the average price for each group
            {
              $group: {
                _id: '$beds',
                avgPrice: { $avg: '$price' }
              }
            },
            // TODO: Sort the grouped documents by the number of beds in ascending order
            { $sort: {_id : 1 } }
          ]        

        const item = await db.collection(collectionName).aggregate(pipeline).toArray();

        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
