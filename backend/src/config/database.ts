import knex from 'knex';
import { Knex } from 'knex';
import path from 'path';

// Import the knexfile
const knexConfig = require(path.join(__dirname, '../../knexfile'));

// Get the environment
const environment = process.env.NODE_ENV || 'development';

// Make sure config exists
if (!knexConfig[environment]) {
  console.error(`No config found for environment: ${environment}`);
  console.error('Available environments:', Object.keys(knexConfig));
  process.exit(1);
}

// Create the database connection
const db: Knex = knex(knexConfig[environment]);

// Test the connection
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });

export default db;