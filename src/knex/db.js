import knex from 'knex';
import knexConfig from './knexfile.js';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

// Get the environment (default to development)
const environment = process.env.NODE_ENV || 'development';

// Initialize Knex with the appropriate configuration
const db = knex(knexConfig[environment]);

// Export the Knex instance
export default db;
