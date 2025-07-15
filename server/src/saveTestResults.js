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

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {};
    
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--test' && i + 1 < args.length) {
            options.testFilter = args[i + 1];
            i++; // Skip the next argument as it's the value
        } else if (args[i].startsWith('--test=')) {
            options.testFilter = args[i].split('=')[1];
        }
    }
    
    return options;
}

async function verifyIndex(indexName, indexDefinition) {
    try {
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
            await collection.createIndex(indexDefinition);
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
    const options = parseArgs();
    const testFolder = path.resolve(__dirname, '../test');
    const files = await fs.readdir(testFolder);
    const testFiles = files.filter(f => f.endsWith('.test.js')).sort();

    // Configure Mocha options based on whether we're filtering tests
    const mochaOptions = { 
        bail: !options.testFilter, // Only bail (stop on first failure) when running all tests
        exit: true, 
        ui: 'bdd' 
    };

    // Add grep option if test filter is specified
    if (options.testFilter) {
        mochaOptions.grep = options.testFilter;
        console.log(`🔍 Running tests matching: "${options.testFilter}"`);
    }

    // Tell Mocha about our test files and load them under its context
    const mocha = new Mocha(mochaOptions);
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

            await verifyIndex('timestamp_1_section_1_name_1', { timestamp: 1, section: 1, name: 1 });
            await verifyIndex('cluster_1_username_1', { cluster: 1, username: 1 });
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
