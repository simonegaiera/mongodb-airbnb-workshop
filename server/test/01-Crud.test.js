import { strictEqual } from 'assert';
import { connectToDatabase, db } from "../src/utils/database.js";
import { collectionName } from '../src/config/config.js';
import { getAllItems, getOneItem, createItem, deleteItem, insertReview, updateValue } from '../src/controllers/crudController.js'; 

describe('MongoDB CRUD Testing', function() {
    let createdItemId;
    const reviewItemId = '10006546';

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

    it('getAllItems should return the correct number of items for the given page and limit', async function() {
        const limit = 5
        const req = { 
            query: { page: '2', limit: limit, query: JSON.stringify({}) },
         };
        let responseData = null;
        const res = {
            status: function() { return this; },
            json: function(data) { responseData = data; }
        };

        await getAllItems(req, res);

        // Assert that 5 items are returned for page 2 with a limit of 5
        strictEqual(responseData.length, limit);
        strictEqual(responseData[0]._id, '1003530');
    });

    it('getOneItem should return exactly one result with _id set to "10006546"', async function() {
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

    it('createItem should create a new item and return it', async function() {
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
        await createItem(req, res);

        // Assert that the response status code is 201
        strictEqual(res.statusCode, 201, 'Status code should be 201');

        // Store the ID of the created item for later deletion
        createdItemId = responseData.insertedId;

        // Assert that the response contains the correct item data
        strictEqual(responseData.acknowledged, true, 'insert should be acknowledged');
    });

    it('deleteItem should delete an item successfully if it exists', async function() {
        const req = {
            params: { id: createdItemId}
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

    it('insertReview should create a new item and return it', async function() {
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

    it('updateValue should create a new item and return it', async function() {
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


});
