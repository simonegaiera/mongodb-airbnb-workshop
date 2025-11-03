import express, { json } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { port, mongodbUri } from './config/config.js';
import listingsAndReviews from './routes/listingsAndReviews.js';
import results from './routes/results.js';
import chat from './routes/chat.js';
import { logDebug, logError } from './utils/logger.js';
import { client } from './utils/database.js';

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
}));
app.use(json());

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await client.db().admin().ping();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// Define your routes here
app.use('/api/listingsAndReviews', listingsAndReviews);
app.use('/api/results', results);
app.use('/api/chat', chat);

// Global error handling
app.use((err, _req, res, next) => {
  res.status(500).send("Uh oh! An unexpected error occured.")
})

// Function to create server restart signal
function createServerRestartSignal() {
  try {
    // Get signal directory from environment variable, fallback to server/signal folder
    const signalDir = process.env.SIGNAL_FILE_PATH || path.join(process.cwd(), 'signal');
    
    // Create the signal directory if it doesn't exist
    if (!fs.existsSync(signalDir)) {
      fs.mkdirSync(signalDir, { recursive: true });
    }
    
    const signalFile = path.join(signalDir, 'server_restart_signal.txt');
    
    // Create the signal file with timestamp
    const timestamp = new Date().toISOString();
    const signalData = {
      event: 'server_restart',
      timestamp: timestamp,
      port: port,
      pid: process.pid
    };
    
    fs.writeFileSync(signalFile, JSON.stringify(signalData, null, 2));
    logDebug(`📡 Server restart signal created at: ${signalFile}`);
    logDebug(`🔄 Signal data: ${JSON.stringify(signalData)}`);
  } catch (error) {
    logError(`⚠️ Failed to create server restart signal: ${error.message}`);
    // Don't throw - server should still start even if signal creation fails
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  
  // Display MongoDB connection string without query parameters
  if (mongodbUri) {
    const strippedUri = mongodbUri.split('?')[0]; // Remove everything after the first '?'
    console.log('\n' + '='.repeat(29));
    console.log(`🍃 MongoDB Connection String: ${strippedUri}`);
    console.log('='.repeat(29) + '\n');
  }
  
  // Create restart signal after successful server startup
  createServerRestartSignal();
});
