import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import { promises as fs } from 'fs';
import XXH from 'xxhashjs'; 
import {  connectToDatabase, client } from "./utils/database.js";
import { mongodbUri, resultsDatabaseName, resultsCollectionName } from './config/config.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const regex = /mongodb\+srv:\/\/(.*?):.*?@(.*?)\./;
const now = new Date()

async function verifyIndex() {
    try {
        const indexName = 'timestamp_-1_section_1_name_1';

        await connectToDatabase();
        const database = client.db(resultsDatabaseName);

        // Check if the collection exists. If not, create it.
        const collections = await database.listCollections({ name: resultsCollectionName }).toArray();
        if (collections.length === 0) {
            await database.createCollection(resultsCollectionName);
        }

        const collection = database.collection(resultsCollectionName);
        const indexes = await collection.indexes();
        const indexExists = indexes.some(index => index.name === indexName);

        if (!indexExists) {
            await collection.createIndex({ timestamp: -1, section: 1, name: 1 });
        }
    } catch (err) {
        console.error(`Error saving to database: ${err}`);
    }
}

async function saveToDatabase(testsSaved) {
    try {
        await connectToDatabase();
        const checksum = await createOutputChecksum()
        const database = client.db(resultsDatabaseName);
        const collection = database.collection(resultsCollectionName);
        
        for (const test of testsSaved) {
            let result = await collection.findOne(test);

            if (!result) {
                test.timestamp = now;
                test.checksum = checksum;
                await collection.insertOne(test);
            }
        }

    } catch (err) {
        console.error(`Error saving to database: ${err}`);
    }
}

async function createOutputChecksum() {
    try {
        const testFolder = path.resolve(__dirname, '../test');
        const files = await fs.readdir(testFolder);
        const testFiles = files.filter(file => file.endsWith('.test.js')).sort();
        let combinedContents = '';
        for (const file of testFiles) {
            const filePath = path.join(testFolder, file);
            const content = await fs.readFile(filePath, 'utf-8');
            combinedContents += content;
        }
        // Use xxhashjs for a fast non-cryptographic hash. Using seed 0xABCD.
        const seed = 0xABCD;
        const hash = XXH.h32(seed).update(combinedContents);
        const checksum = hash.digest().toString(16);
        return checksum;
    } catch (err) {
        console.error('Error generating checksum:', err);
        throw err;
    }
}

function runTests() {
    // Construct the absolute path to the test files
    const testFilesPath = path.resolve(__dirname, '../test/*.test.js');
    console.log(`Running tests at: ${testFilesPath}`);
    
    let testsSaved = []
    let testSection = '';

    // Use npx so that the local mocha installation is used
    const mocha = spawn('npx', ['mocha', '--exit', testFilesPath]);
    
    mocha.stdout.on('data', (data) => {
        console.log(data.toString());
        
        if (data.toString().trim().startsWith("MongoDB")) {
            testSection = data.toString().trim()
        } else if (data.toString().includes("✔")) {
            let testName = data.toString().trim().replace(/^\s*✔\s*/, '').replace(/\s*\(\d+ms\)\s*$/, '')

            testsSaved.push(
                {
                    section: testSection,
                    name: testName,
                    username: mongodbUri.match(regex)[1],
                    cluster: mongodbUri.match(regex)[2],
                }
            )
        }
    });
    
    mocha.stderr.on('data', (data) => {
        console.error(`${data}`);
    });
    
    mocha.on('error', (err) => {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    });
    
    mocha.on('close', async (code) => {
        console.log('Tests completed. Saving results to the database...');
        await verifyIndex()
        await saveToDatabase(testsSaved)

        if (code !== 0) {
            console.error(`Mocha process exited with code ${code}`);
        } else {
            console.log(`Mocha process completed successfully`);
        }
        process.exit(code);
    });
}

runTests();
