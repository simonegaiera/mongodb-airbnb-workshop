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
    
    it('vector-search-0: the default vector search index should be created', async function() {
        try {
            const indexName = 'default';
            const collection = db.collection(collectionName);
            const cursor = await collection.listSearchIndexes(indexName);
            const index = await cursor.next();
            const mapping = index.latestDefinition.mappings.fields;
               
            // Check amenities: should be an array of length 2 with correct types (order insensitive)
            assert(Array.isArray(mapping.amenities), 'amenities is not an array');
            strictEqual(mapping.amenities.length, 2, 'amenities array should have 2 elements');
            const amenityTypes = mapping.amenities.map(item => item.type);
            assert(amenityTypes.includes('stringFacet'), 'Amenities missing type "stringFacet"');
            assert(amenityTypes.includes('token'), 'Amenities missing type "token"');
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
    });


});
