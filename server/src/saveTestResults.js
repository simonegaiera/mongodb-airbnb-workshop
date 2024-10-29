import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import {  connectToDatabase, client } from "./utils/database.js";
import { mongodbUri } from './config/config.js';

// Function to save test results to MongoDB
const regex = /mongodb\+srv:\/\/(.*?):.*?@(.*?)\./;

async function saveToDatabase(testSection, testName) {
    try {
        await connectToDatabase();
        const database = client.db('airbnb_workshop');
        const collection = database.collection('results');
        
        const filter = {
            section: testSection,
            name: testName,
            username: mongodbUri.match(regex)[1],
            cluster: mongodbUri.match(regex)[2],
        };

        const update = {
            $set: {
                timestamp: new Date(),
            }
        };
        
        const options = { upsert: true };

        const result = await collection.updateOne(filter, update, options);
    } catch (err) {
        console.error(`Error saving to database: ${err}`);
    }
}

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runTests() {
    // Construct the absolute path to the test files
    const testFilesPath = path.resolve(__dirname, '../test/*.test.js');
    console.log(`Running tests at: ${testFilesPath}`);
    
    const mocha = spawn('mocha', ['--exit', testFilesPath]);
    
    let section = '';
    
    mocha.stdout.on('data', (data) => {
        console.log(data.toString());
        
        if (data.toString().trim().startsWith("MongoDB")) {
            section = data.toString().trim()
        } else if (data.toString().includes("✔")) {
            let test = data.toString().trim().replace(/^\s*✔\s*/, '').replace(/\s*\(\d+ms\)\s*$/, '')
            saveToDatabase(section, test)
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
        if (code !== 0) {
            console.error(`Mocha process exited with code ${code}`);
        } else {
            console.log(`Mocha process completed successfully`);
        }
        process.exit(code);
    });
}

runTests();
