// test-db-connection.js

async function testDatabase() {
  // First, let's install the pg package
  console.log('Testing database connection...\n');
  
  const { Client } = require('pg');
  
  const client = new Client({
    host: 'arboriq-db-dev.postgres.database.azure.com',
    port: 5432,
    database: 'arboriq',
    user: 'arboriqadmin',
    password: 'Arb0r!Q2025Dev',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL database\n');
    
    // Enable PostGIS extension
    console.log('Enabling PostGIS...');
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis');
    
    // Check PostGIS version
    const result = await client.query('SELECT PostGIS_Version()');
    if (result.rows[0]) {
      console.log('✅ PostGIS Version:', result.rows[0].postgis_version);
    }
    
    // List all extensions
    const extensions = await client.query("SELECT extname FROM pg_extension");
    console.log('\n📦 Installed extensions:');
    extensions.rows.forEach(ext => console.log('  -', ext.extname));
    
    await client.end();
    console.log('\n✅ Database test complete!');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.message.includes('pg')) {
      console.log('\nPlease install pg first: npm install pg');
    }
  }
}

// Check if pg is installed
try {
  require.resolve('pg');
  testDatabase();
} catch(e) {
  console.log('Installing pg package first...');
  console.log('Run: npm install pg');
  console.log('Then: node test-db-connection.js');
}