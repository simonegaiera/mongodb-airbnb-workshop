import { connectToDatabase, db } from "../src/utils/database.js";
import { collectionName } from '../src/config/config.js';
import { strictEqual } from 'assert';

describe('MongoDB Index Tests', function() {
    this.timeout(10000);
    before(async function() {
        try {
            await connectToDatabase();
        } catch (error) {
            throw new Error(`Database or collection does not exist: ${error.message}`);
        }
    });

    it('crud-index: verify that the index exists', async function() {
        const indexName = 'beds_1_price_1';
        
        const collection = db.collection(collectionName);
        const indexes = await collection.indexes();
        const indexExists = indexes.some(index => index.name === indexName);
        strictEqual(indexExists, true, `Index "${indexName}" should exist`);
    });
});
