/**
 * Main Application File
 * 
 * This file sets up the Express application and configures middleware.
 * It demonstrates:
 * 1. Express application configuration
 * 2. Middleware setup (CORS, JSON parsing)
 * 3. Route mounting
 * 4. Database initialization
 * 5. Server startup
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database';
import routes from './routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Log environment variables on startup
console.log('\n--- Environment Configuration ---');
console.log(`Node Environment: ${process.env.NODE_ENV}`);
console.log(`Server Port: ${process.env.PORT}`);
console.log(`Database Type: ${process.env.DB_TYPE}`);
console.log(`Database Path: ${process.env.DB_PATH}`);
console.log(`API Version: ${process.env.API_VERSION}`);
console.log(`Rate Limit: ${process.env.RATE_LIMIT} requests\n`);

// Middleware
app.use(cors());
app.use(express.json());

// Mount all routes
app.use(routes);

/**
 * Start the server
 * 
 * This section:
 * 1. Syncs the database (creates tables if they don't exist)
 * 2. Starts the Express server
 * 3. Logs the server URL
 */
// Use { force: true } to drop and recreate tables - ONLY use this in development!
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

export default app; 