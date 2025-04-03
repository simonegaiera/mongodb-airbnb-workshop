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
    
    after(async function() {
        await db.collection(collectionName).deleteMany({ name: 'Test Item' });
        
        await db.collection(collectionName).updateOne(
            { _id: reviewItemId },
            { $pull: { reviews: { _id: '0' } } }
        );
    });
       
    it('crud-5: createItem should create a new item and return it', async function() {
        const req = {
            body: { name: 'Test Item', description: 'This is a test item' }
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
        await insertItem(req, res);
        
        // Assert that the response status code is 201
        strictEqual(res.statusCode, 201, 'Status code should be 201');
        
        // Store the ID of the created item for later deletion
        createdItemId = responseData.insertedId;
        
        // Assert that the response contains the correct item data
        strictEqual(responseData.acknowledged, true, 'insert should be acknowledged');
    });
    
    it('crud-6: crudUpdateElement should create a new item and return it', async function() {
        const req = {
            params: { id: '10006546'},
            body: {
                "key": "accommodates",
                "value": 9
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
        await updateValue(req, res);
        
        // Assert that the response status code is 201
        strictEqual(res.statusCode, 201, 'Status code should be 201');
        
        // Assert that the response contains the correct item data
        strictEqual(responseData.acknowledged, true, 'update should be acknowledged');
        strictEqual(responseData.matchedCount, 1, 'matchedCount should be 1');
        
        req.body.value = 8;
        await updateValue(req, res);
    });
    
    it('crud-7: crudAddToArray should create a new item and return it', async function() {
        const req = {
            params: { id: reviewItemId},
            body: {
                "_id": "0",
                "reviewer_name": "test"
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
        await insertReview(req, res);
        
        // Assert that the response status code is 201
        strictEqual(res.statusCode, 201, 'Status code should be 201');
        
        // Assert that the response contains the correct item data
        strictEqual(responseData.acknowledged, true, 'update should be acknowledged');
        strictEqual(responseData.modifiedCount, 1, 'modifiedCount should be 1');
    });

    it('crud-8: crudDelete should delete an item successfully if it exists', async function() {
        const req = {
            params: { id: createdItemId }
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
        
        await deleteItem(req, res);
        
        strictEqual(res.statusCode, 200, 'Status code should be 200');
        strictEqual(responseData.message, 'Item deleted successfully', 'Response message should match');
    });
    
});
