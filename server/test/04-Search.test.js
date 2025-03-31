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
               
            // Check amenities: should be an array of length 2 with correct types (order insensitive)
            assert(Array.isArray(mapping.amenities), 'amenities is not an array');
            strictEqual(mapping.amenities.length, 2, 'amenities array should have 2 elements');
            const amenityTypes = mapping.amenities.map(item => item.type);
            assert(amenityTypes.includes('stringFacet'), 'Amenities missing type "stringFacet"');
            assert(amenityTypes.includes('token'), 'Amenities missing type "token"');
            
            // Check beds: should be an array of length 2 with correct types (order insensitive)
            assert(Array.isArray(mapping.beds), 'beds is not an array');
            strictEqual(mapping.beds.length, 2, 'beds array should have 2 elements');
            const bedTypes = mapping.beds.map(item => item.type);
            assert(bedTypes.includes('numberFacet'), 'Beds missing type "numberFacet"');
            assert(bedTypes.includes('number'), 'Beds missing type "number"');
            
            // Check name: should be an object with type "autocomplete" and analyzer "lucene.english"
            assert.strictEqual(typeof mapping.name, 'object', 'name should be an object');
            strictEqual(mapping.name.type, 'autocomplete', 'Field "name" should be of type "autocomplete"');
            strictEqual(mapping.name.analyzer, 'lucene.english', 'Field "name" should have analyzer "lucene.english"');

            // Check property_type: should be an array of length 2 with correct types (order insensitive)
            assert(Array.isArray(mapping.property_type), 'property_type is not an array');
            strictEqual(mapping.property_type.length, 2, 'property_type array should have 2 elements');
            const propertyTypeTypes = mapping.property_type.map(item => item.type);
            assert(propertyTypeTypes.includes('stringFacet'), 'property_type missing type "stringFacet"');
            assert(propertyTypeTypes.includes('token'), 'property_type missing type "token"');
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
                return this;
            },
            json: function(data) {
                responseData = data;
            }
        };

        await getAutocomplete(req, res);

        strictEqual(res.statusCode, 201, 'Status code should be 201');
        strictEqual(responseData.length, 10);
        strictEqual(responseData[0].name, 'A bedroom far away from home');
    });

    it('search-2: facetSearch should return the correct facets', async function() {
        const req = { body: { query: 'hawaii' } };
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
