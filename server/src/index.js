import express, { json } from 'express';
import cors from 'cors';
import { port } from './config/config.js';
import listingsAndReviews from './routes/listingsAndReviews.js';

const app = express();

// Middleware
app.use(cors());
app.use(json());

// Define your routes here
app.use('/api/listingsAndReviews', listingsAndReviews);

// Global error handling
app.use((err, _req, res, next) => {
  res.status(500).send("Uh oh! An unexpected error occured.")
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
