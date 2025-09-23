// backend/test-migration.js
const knex = require('knex');
const config = require('./knexfile');

async function testMigration() {
  const db = knex(config.development);
  
  try {
    // Check if trees table exists
    const exists = await db.schema.hasTable('trees');
    console.log('✅ Trees table exists:', exists);
    
    // Get column info
    const columns = await db('trees').columnInfo();
    console.log('\n📋 Trees table columns:');
    Object.keys(columns).forEach(col => {
      console.log(`  - ${col}: ${columns[col].type}`);
    });
    
    // Test PostGIS
    const postgis = await db.raw('SELECT PostGIS_Version()');
    console.log('\n✅ PostGIS enabled:', postgis.rows[0].postgis_version);
    
    // Test spatial index
    const indexes = await db.raw(`
      SELECT indexname FROM pg_indexes 
      WHERE tablename = 'trees'
    `);
    console.log('\n📍 Spatial indexes:');
    indexes.rows.forEach(idx => console.log(`  - ${idx.indexname}`));
    
    await db.destroy();
    console.log('\n✅ Migration test complete!');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    await db.destroy();
  }
}

testMigration();