import dotenv from 'dotenv';

// Load test environment variables FIRST - before importing anything else
dotenv.config({ path: '../.env.local' });

// Now import database after env is loaded
import db from '../config/database';

// Increase timeout for database operations
jest.setTimeout(10000);

// Before all tests - ensure database is ready
beforeAll(async () => {
  try {
    // Test database connection
    await db.raw('SELECT 1');
    console.log('Test database connected');
    
    // Run migrations if needed
    await db.migrate.latest();
    
    // Clean ALL data before starting tests
    await db('work_logs').del();
    await db('work_orders').del();
    await db('defects').del();
    await db('risk_alerts').del();
    await db('media').del();
    await db('inspections').del();
    await db('trees').del();
    await db('zones').del();
    await db('properties').del();
    await db('users').del();
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  }
});

// After each test - cleanup
afterEach(async () => {
  // Clean up test data in reverse order of foreign key dependencies
  await db('work_logs').del();
  await db('work_orders').del();
  await db('defects').del();
  await db('risk_alerts').del();
  await db('media').del();
  await db('inspections').del();
  await db('trees').del();
  await db('zones').del();
  await db('properties').del();
  await db('users').del();
});

// After all tests - close connection
afterAll(async () => {
  await db.destroy();
});