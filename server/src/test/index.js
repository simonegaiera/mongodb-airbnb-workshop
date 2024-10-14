import { db } from "../src/utils/database.js";
import { collectionName } from '../src/config/config.js';


describe('MongoDB Index Tests', function() {
    const indexName = 'property_type_1_room_type_1_beds_1'
    it('should verify that the index exists', async function() {
        const collection = db.collection(collectionName);
        const indexes = await collection.indexes();
        const indexExists = indexes.some(index => index.name === indexName);
        strictEqual(indexExists, true, `Index "${indexName}" should exist`);
    });
});