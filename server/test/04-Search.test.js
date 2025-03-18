import { connectToDatabase, db } from "../src/utils/database.js";
import { collectionName } from '../src/config/config.js';
import assert from 'assert';
import { strictEqual } from 'assert';
import { getAutocomplete, getFacet } from '../src/controllers/searchController.js'; 

describe('MongoDB Search Tests', function() {
    this.timeout(10000);
    before(async function() {
        try {
            await connectToDatabase();
        } catch (error) {
            throw new Error(`Database or collection does not exist: ${error.message}`);
        }
    });
    
    it('search-0: the default search index should be created', async function() {
        try {
            const indexName = 'default';

            const collection = db.collection(collectionName);
            const cursor = await collection.listSearchIndexes(indexName);

            const index = await cursor.next();
            const mapping = index.latestDefinition.mappings.fields;
               
            // Assert that the fields are configured as facets
            strictEqual(mapping.amenities.type, 'stringFacet', 'Field "amenities" should be of type "stringFacet"');
            strictEqual(mapping.beds.type, 'numberFacet', 'Field "beds" should be of type "numberFacet"');
            strictEqual(mapping.property_type.type, 'stringFacet', 'Field "property_type" should be of type "stringFacet"');
            strictEqual(mapping.name.type, 'autocomplete', 'Field "name" should be of type "autocomplete"');
        } catch (error) {
            throw new Error(`Error: ${error.message}`);
        }
    });

    it('search-0: the all search index should be created', async function() {
        try {
            const indexName = 'all';

            const collection = db.collection(collectionName);
            const cursor = await collection.listSearchIndexes(indexName);

            const index = await cursor.next();
            const mapping = index.latestDefinition.mappings.fields;
               
            // Assert that the fields are configured as facets
            strictEqual(mapping.amenities.type, 'token', 'Field "amenities" should be of type "token"');
            strictEqual(mapping.property_type.type, 'token', 'Field "property_type" should be of type "token"');
            strictEqual(mapping.name.type, 'autocomplete', 'Field "name" should be of type "autocomplete"');
        } catch (error) {
            throw new Error(`Error: ${error.message}`);
        }
    });

    it('search-1: autocompleteSearch should return the correct number of items when looking for hawaii', async function() {
        const req = { body: { query: 'hawaii' } };
        let responseData = null;

        const res = {
            status: function(status) {
                this.statusCode = status;
                console.log('Status code:', status);
                return this;
            },
            json: function(data) {
                console.log('Response data:', JSON.stringify(data, null, 2));
                
                responseData = data;
            }
        };

        console.log('Request:', JSON.stringify(req.body, null, 2));
        await getAutocomplete(req, res);

        strictEqual(res.statusCode, 201, 'Status code should be 201');
        strictEqual(responseData.length, 10);
        strictEqual(responseData[0].name, 'A bedroom far away from home');
    });

    it('search-2: facetSearch should return the correct facets', async function() {
        const req = { query: { query: 'hawaii' } };
        let responseData = null;
        const res = {
            status: function() { return this; },
            json: function(data) { responseData = data; }
        };

        await getFacet(req, res);

        // Check that response is an array with at least one item
        assert(Array.isArray(responseData), 'Response is not an array');
        assert(responseData.length > 0, 'Response array is empty');
        
        // Check that the first item in the response contains "facet"
        assert(responseData[0].hasOwnProperty('facet'), 'Response item does not have a facet property');

        // Extract the facet object
        const facet = responseData[0].facet;

        // Check that the facet object contains keys for amenities, property_type, and beds
        assert(facet.hasOwnProperty('amenities'), 'Facet does not contain amenities');
        assert(facet.hasOwnProperty('property_type'), 'Facet does not contain property_type');
        assert(facet.hasOwnProperty('beds'), 'Facet does not contain beds');

        // Check that each facet key has an array of buckets
        assert(Array.isArray(facet.amenities.buckets), 'Amenities buckets is not an array');
        assert(Array.isArray(facet.property_type.buckets), 'Property_type buckets is not an array');
        assert(Array.isArray(facet.beds.buckets), 'Beds buckets is not an array');

    });

});
