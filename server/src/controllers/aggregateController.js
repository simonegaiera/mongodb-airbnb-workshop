import { db } from "../utils/database.js";
import { collectionName } from '../config/config.js';


export async function getPriceStatistics(req, res) {

    try {
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
            { $sort: { _id: 1 } }
          ]        

        const item = await db.collection(collectionName).aggregate(pipeline).toArray();

        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
