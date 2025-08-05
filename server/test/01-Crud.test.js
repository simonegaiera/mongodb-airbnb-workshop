import { strictEqual } from 'assert';
import { connectToDatabase, db } from "../src/utils/database.js";

import { getDistinct, getFilters } from '../src/controllers/crudController.js';

describe('MongoDB CRUD Tests', function() {
    let createdItemId;
    const reviewItemId = '10006546';
    
    this.timeout(10000);
    before(async function() {
        try {
            await connectToDatabase();
        } catch (error) {
            throw new Error(`Database or collection does not exist: ${error.message}`);
        }
    });
    
    it('crud-3: crudDistinct should return distinct values', async function() {
        const req = { 
            query: { field: 'bedrooms'},
        };
        
        let responseData = null;
        const res = {
            status: function() { return this; },
            json: function(data) { responseData = data; }
        };
        
        await getDistinct(req, res);
        
        // Assert that the response contains one result with the correct _id
        strictEqual(responseData.length, 13);
        strictEqual(responseData[0], 0);
    });
    
    it('crud-4: crudFilter should return the wanted listings', async function() {
        const req = {
            body:     {
                page: 1,
                limit: 9,
                filters: {
                    amenities: [ '24-hour check-in', 'Accessible-height bed' ],
                    propertyType: 'Aparthotel',
                    beds: '1-2'
                }
            }
        };
        
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
        
        // Call the function
        await getFilters(req, res);
        
        strictEqual(res.statusCode, 201, 'Status code should be 201');
        strictEqual(responseData[0]._id, '6242962', '_id should be 6242962');
        strictEqual(responseData.length, 1, 'the query should return 3 items');
    });

});
