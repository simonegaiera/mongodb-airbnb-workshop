import { connectToDatabase, db } from "../src/utils/database.js";
import { collectionName } from '../src/config/config.js';
import assert from 'assert';
import { strictEqual } from 'assert';
import { getVectorSearch } from '../src/controllers/vectorSearchController.js'; 

describe('MongoDB Vector Search Tests', function() {
    this.timeout(10000);
    before(async function() {
        try {
            await connectToDatabase();
        } catch (error) {
            throw new Error(`Database or collection does not exist: ${error.message}`);
        }
    });
    
    it('vector-search-0: the vector search index should be created', async function() {
        try {
            const indexName = 'vector_index';
            const collection = db.collection(collectionName);
            const cursor = await collection.listSearchIndexes(indexName);
            const index = await cursor.next();
            const fields = index.latestDefinition.fields;
               
            // Check that fields array exists and has 2 elements
            assert(Array.isArray(fields), 'fields is not an array');
            strictEqual(fields.length, 2, 'fields array should have 2 elements');
            
            // Check description field
            const descriptionField = fields.find(field => field.path === 'description');
            assert(descriptionField, 'description field not found');
            strictEqual(descriptionField.type, 'text', 'description field should have type "text"');
            // strictEqual(descriptionField.model, 'voyage-3-large', 'description field should use "voyage-3-large" model');
            
            // Check property_type field
            const propertyTypeField = fields.find(field => field.path === 'property_type');
            assert(propertyTypeField, 'property_type field not found');
            strictEqual(propertyTypeField.type, 'filter', 'property_type field should have type "filter"');
        } catch (error) {
            throw new Error(`Error: ${error.message}`);
        }
    });

    it('vector-search-1: the vector search should return the 10 results', async function() {
        const req = { body: { query: 'best view in hawaii', property_type: "Apartment" } };
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

        await getVectorSearch(req, res);

        strictEqual(res.statusCode, 201, 'Status code should be 201');
        strictEqual(responseData.length, 10);
        
        // Validate that all returned listings have property_type "Apartment"
        responseData.forEach((listing) => {
            strictEqual(listing.property_type, 'Apartment', `All listings should have property_type "Apartment"`);
        });
    });


});
