import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import { registerRoutes } from '../../server/routes.js';

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register all the API routes
(async () => {
  try {
    await registerRoutes(app);
    console.log('API routes registered successfully');
  } catch (error) {
    console.error('Error registering API routes:', error);
  }
})();

// Export the serverless function
export const handler = serverless(app);
