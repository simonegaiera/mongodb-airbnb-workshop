import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import {  connectToDatabase, client } from "./utils/database.js";
import { mongodbUri, resultsDatabaseName, resultsCollectionName } from './config/config.js';
import fs from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const regex = /mongodb\+srv:\/\/(.*?):.*?@(.*?)\./;
const now = new Date()

// Example usage
const directory = path.resolve(__dirname, '../test');
const output = path.resolve(__dirname, '../test/output.md5');

async function verifyIndex() {
    try {
        const indexName = 'timestamp_-1_section_1_name_1';

        await connectToDatabase();
        const database = client.db(resultsDatabaseName);
        const collection = database.collection(resultsCollectionName);

        const indexes = await collection.indexes();
        const indexExists = indexes.some(index => index.name === indexName);

        if (!indexExists) {
            // console.log(`Creating index: ${indexName}`);
            await collection.createIndex({ timestamp: -1, section: 1, name: 1 });
        }
    } catch (err) {
        console.error(`Error saving to database: ${err}`);
    }
}

async function saveToDatabase(testsSaved) {
    try {
        generateMD5FromDirectory(directory, output);
        const md5Hash = readMD5FromOutputFile(output);

        await connectToDatabase();
        const database = client.db(resultsDatabaseName);
        const collection = database.collection(resultsCollectionName);
        
        for (const test of testsSaved) {
            let result = await collection.findOne(test);

            if (!result) {
                test.timestamp = now;
                test.md5 = md5Hash;
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

/**
 * Generate a single MD5 hash for all files in a directory, if the output file does not already exist.
 * @param {string} directoryPath - Path to the directory containing files.
 * @param {string} outputFilePath - Path to the output file where the hash will be saved.
 */
function generateMD5FromDirectory(directoryPath, outputFilePath) {
  try {
    // Check if the output file already exists
    if (fs.existsSync(outputFilePath)) {
    //   console.log(`Output file "${outputFilePath}" already exists. Skipping processing.`);
      return;
    }

    // Initialize the MD5 hash
    const hash = crypto.createHash('md5');

    // Read all files from the specified directory
    const files = fs.readdirSync(directoryPath);

    // Process each file in the directory
    files.forEach(file => {
      const filePath = path.join(directoryPath, file);

      // Check if it's a file, not a directory
      if (fs.statSync(filePath).isFile()) {
        // Read file content
        const fileContent = fs.readFileSync(filePath);

        // Update the hash with file content
        hash.update(fileContent);
      }
    });

    // Finalize the hash computation
    const resultHash = hash.digest('hex');

    // Write the resulting hash to the output file
    fs.writeFileSync(outputFilePath, resultHash);

    // console.log(`MD5 hash successfully written to ${outputFilePath}`);
  } catch (err) {
    console.error('Error generating MD5 hash:', err);
  }
}

/**
 * Read the MD5 hash from the output file.
 * @param {string} outputFilePath - Path to the output file where the hash is saved.
 * @returns {string|null} - The MD5 hash read from the file, or `null` if the file does not exist.
 */
function readMD5FromOutputFile(outputFilePath) {
    try {
      // Check if the output file exists
      if (!fs.existsSync(outputFilePath)) {
        console.log(`Output file "${outputFilePath}" does not exist.`);
        return null;
      }
      // Read the content of the output file
      const md5Hash = fs.readFileSync(outputFilePath, 'utf8').trim();
    //   console.log(`MD5 hash read from "${outputFilePath}": ${md5Hash}`);
      return md5Hash;
    } catch (err) {
      console.error('Error reading MD5 hash from output file:', err);
      return null;
    }
  }
