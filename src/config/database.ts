/**
 * Database Configuration
 * 
 * This file contains the Sequelize instance configuration.
 * It demonstrates:
 * 1. Sequelize instance setup
 * 2. SQLite configuration
 * 3. Connection management
 */

import { Sequelize } from 'sequelize';

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

export default sequelize; 