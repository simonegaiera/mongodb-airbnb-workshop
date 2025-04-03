import { strictEqual } from 'assert';
import { connectToDatabase, db } from "../src/utils/database.js";
import { collectionName } from '../src/config/config.js';

import { getAllItems, getOneItem, getDistinct, getFilters, insertItem, insertReview, updateValue, deleteItem  } from '../src/controllers/crudController.js';

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
    
    it('crud-1: crudFind should return the correct number of items for the given page and limit', async function() {
        
        const limit = 5
        const req = { 
            query: { page: '2', limit: limit, query: JSON.stringify({}) },
        };
        let responseData = null;
        const res = {
            status: function() { return this; },
            json: function(data) {
                responseData = data; 
            }
        };
        
        await getAllItems(req, res);
        
        // Assert that 5 items are returned for page 2 with a limit of 5
        strictEqual(responseData.length, limit);
        strictEqual(responseData[0]._id, '1003530');
    });
    
    it('crud-2: crudOneDocument should return exactly one result with _id set to "10006546"', async function() {
        const req = { params: { id: '10006546' } };
        let responseData = null;
        const res = {
            status: function() { return this; },
            json: function(data) { responseData = data; }
        };
        
        await getOneItem(req, res);
        
        // Assert that the response contains one result with the correct _id
        strictEqual(responseData._id, '10006546', '_id should be "10006546"');
        strictEqual(Object.keys(responseData).length > 0, true, 'Response should not be empty');
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
