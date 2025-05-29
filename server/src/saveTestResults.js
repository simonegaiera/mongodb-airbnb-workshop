import Mocha from 'mocha';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import { promises as fs } from 'fs';
import XXH from 'xxhashjs'; 
import { connectToDatabase, client } from "./utils/database.js";
import { mongodbUri, resultsDatabaseName, resultsCollectionName } from './config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const regex = /mongodb\+srv:\/\/(.*?):.*?@(.*?)\./;
const now = new Date();

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
        const checksum = await createOutputChecksum();
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
        return existingCount;
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

async function runTests() {
    const testFolder = path.resolve(__dirname, '../test');
    const files = await fs.readdir(testFolder);
    const testFiles = files.filter(f => f.endsWith('.test.js')).sort();

    // Tell Mocha about our test files and load them under its context
    const mocha = new Mocha({ bail: true, exit: true, ui: 'bdd' });
    testFiles.forEach(file => mocha.addFile(path.join(testFolder, file)));
    // Load ESM modules so `describe` / `it` are defined when imported
    await mocha.loadFilesAsync();

    let testsSaved = [];
    let passingCount = 0;
    let failingCount = 0;
    let testSection = '';

    // Listen to Mocha events for more granular control
    mocha.suite.on('pre-require', function(context, file, mocha) {
        context.beforeEach(function() {
            // Optionally, set up context
        });
    });

    // Run the loaded tests
    mocha.run()
        .on('suite', function(suite) {
            if (suite.title && suite.title.endsWith('Tests')) {
                testSection = suite.title;
            }
        })
        .on('pass', function(test) {
            passingCount++;
            testsSaved.push({
                section: testSection,
                name: test.title,
                username: mongodbUri.match(regex)[1],
                cluster: mongodbUri.match(regex)[2],
            });
        })
        .on('fail', function(test) {
            failingCount++;
        })
        .on('end', async function() {
            console.log(`📊 Test Summary: ✅ ${passingCount} passing, ❌ ${failingCount} failing`);

            await verifyIndex();
            await saveToDatabase(testsSaved);

            const existingCount = await validateResultsRecord(
                mongodbUri.match(regex)[1],
                mongodbUri.match(regex)[2]
            );

            if (existingCount !== passingCount) {
                console.warn(
                    `\n⚠️  Heads up! There's a mismatch: the database has ${existingCount} solved exercises, but Mocha just reported ${passingCount} passing.\nPlease reach out to your MongoDB SA if you need help syncing your progress.`
                );
            }

            if (failingCount === 0) {
                console.log(`\n🎉 Amazing work! You’ve completed all the MongoDB Airbnb Gameday challenges! 🏆`);
            } else {
                console.error(`\n🚀 Great effort! Some tests are still waiting for you—keep going, you're making awesome progress!`);
            }
            process.exit(failingCount === 0 ? 0 : 1);
        });
}

runTests();
