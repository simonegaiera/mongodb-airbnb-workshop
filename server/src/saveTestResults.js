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
        const indexName = 'timestamp_1_section_1_name_1';

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
            await collection.createIndex({ timestamp: 1, section: 1, name: 1 });
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

async function validateResultsRecord(username, cluster) {
    try {
        await connectToDatabase();
        const database = client.db(resultsDatabaseName);
        const collection = database.collection(resultsCollectionName);
    
        const existingCount = await collection.countDocuments({ username, cluster });
        console.log(`🏅 Congrats! You're on the leaderboard with ${existingCount} completed exercise${existingCount === 1 ? '' : 's'}! Keep up the great work! 🚀`);
        return existingCount;                             // ← return it
    } catch (err) {
        console.error(`Error validating results record: ${err}`);
        return 0;
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
    
    let testsSaved = [];
    let testSection = '';
    let passingCount = 0;
    let failingCount = 0;

    const mocha = spawn('npx', ['mocha', '--bail', '--exit', testFilesPath], { shell: true });
    
    mocha.stdout.on('data', (data) => {
        const text = data.toString();
        console.log(text);

        // parse out “0 passing” / “1 failing”
        const passMatch = text.match(/(\d+)\s+passing/);
        if (passMatch) passingCount = parseInt(passMatch[1], 10);

        const failMatch = text.match(/(\d+)\s+failing/);
        if (failMatch) failingCount = parseInt(failMatch[1], 10);

        if (data.toString().trim().startsWith("MongoDB") && data.toString().trim().endsWith("Tests")) {
            testSection = data.toString().trim()
        } else if (data.toString().trim().startsWith("✔")) {
            let testName = data.toString().trim().replace(/^\s*✔\s*/, '').replace(/\s*\(\d+ms\).*/, '')

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
        console.log(`📊 Test Summary: ✅ ${passingCount} passing, ❌ ${failingCount} failing`);

        await verifyIndex();
        await saveToDatabase(testsSaved);

        // now get the DB count and compare
        const existingCount = await validateResultsRecord(
          mongodbUri.match(regex)[1],
          mongodbUri.match(regex)[2]
        );

        if (existingCount !== passingCount) {
            console.warn(
                `\n⚠️  Heads up! There's a mismatch: the database has ${existingCount} solved exercises, but the text just reported ${passingCount} passing.\nPlease reach out to your MongoDB SA!\n`
            );
        }

        if (code == 0) {
            console.log(`🎉 Amazing work! You’ve completed all the MongoDB Airbnb Gameday challenges! 🏆`);
        }
        process.exit(code);
    });
}

runTests();
