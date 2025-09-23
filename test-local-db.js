// test-local-db.js
const { Client } = require('pg');

async function testLocalDatabase() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'arboriq',
    user: 'arboriqadmin',
    password: 'localdev123'
  });

  try {
    await client.connect();
    console.log('✅ Connected to LOCAL PostgreSQL');
    
    // Check PostGIS
    const result = await client.query('SELECT PostGIS_Version()');
    console.log('✅ PostGIS Version:', result.rows[0].postgis_version);
    
    await client.end();
    console.log('✅ Local database ready!');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testLocalDatabase();