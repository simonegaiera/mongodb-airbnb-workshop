import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import {  connectToDatabase, client } from "./utils/database.js";
import { mongodbUri } from './config/config.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const regex = /mongodb\+srv:\/\/(.*?):.*?@(.*?)\./;
const now = new Date()

async function saveToDatabase(testsSaved) {
    try {
        await connectToDatabase();
        const database = client.db('airbnb_workshop');
        const collection = database.collection('results');
        
        for (const test of testsSaved) {
            let result = await collection.findOne(test);

            if (!result) {
                test.timestamp = now;
                await collection.insertOne(test);
            }
        }

    } catch (err) {
        console.error(`Error saving to database: ${err}`);
    }
}

function runTests() {
    // Construct the absolute path to the test files
    const testFilesPath = path.resolve(__dirname, '../test/*.test.js');
    console.log(`Running tests at: ${testFilesPath}`);
    
    let testsSaved = []
    let testSection = '';

    const mocha = spawn('mocha', ['--exit', testFilesPath]);
    
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
