import { connectToDatabase } from "../src/utils/database.js";
import { strictEqual } from 'assert';
import { getPriceStatistics } from '../src/controllers/02-aggregateController.js'; 

describe('MongoDB Search Tests', function() {
    const indexName = 'default';
    
    before(async function() {
        try {
            await connectToDatabase();
        } catch (error) {
            throw new Error(`Database or collection does not exist: ${error.message}`);
        }
    });
    
    it('getPriceStatistics should return the correct avg', async function() {
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
        strictEqual(responseData[0].avgPrice.toString(), '153.6206896551724137931034482758621', 'average is not correct');
    });

});
