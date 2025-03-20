import { connectToDatabase } from "../src/utils/database.js";
import { strictEqual } from 'assert';
import { getPriceStatistics } from '../src/controllers/aggregateController.js'; 

describe('MongoDB Aggregation Tests', function() {
    const indexName = 'default';
    this.timeout(10000);
    before(async function() {
        try {
            await connectToDatabase();
        } catch (error) {
            throw new Error(`Database or collection does not exist: ${error.message}`);
        }
    });
    
    it('pipeline-1: aggregationPipeline should return the correct avg', async function() {
        const req = {};
        let responseData = null;

        const res = {
            status: function(status) {
                this.statusCode = status;
                return this;
            },
            json: function(data) {
                responseData = data;
            }
        };

        await getPriceStatistics(req, res);

        strictEqual(responseData.length, 19, 'lenght should be 19');
        strictEqual(responseData[0]._id, 0, 'first result should contain the average for 0 beds');
        strictEqual(responseData[0].price.toString(), '153.6206896551724137931034482758621', 'average is not correct');
    });

});
