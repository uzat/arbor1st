// backend/test-inspections.js
const knex = require('knex');
const config = require('./knexfile');

async function testInspections() {
  const db = knex(config.development);
  
  try {
    // Check if inspections table exists
    const exists = await db.schema.hasTable('inspections');
    console.log('✅ Inspections table exists:', exists);
    
    // Get column info
    const columns = await db('inspections').columnInfo();
    console.log('\n📋 Inspections table columns:');
    Object.keys(columns).forEach(col => {
      console.log(`  - ${col}: ${columns[col].type}`);
    });
    
    // Check foreign key constraint
    const fkeys = await db.raw(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'inspections' 
      AND constraint_type = 'FOREIGN KEY'
    `);
    console.log('\n🔗 Foreign keys:', fkeys.rows.length > 0 ? 'Configured' : 'None');
    
    // Check indexes
    const indexes = await db.raw(`
      SELECT indexname FROM pg_indexes 
      WHERE tablename = 'inspections'
    `);
    console.log('\n📍 Indexes:');
    indexes.rows.forEach(idx => console.log(`  - ${idx.indexname}`));
    
    await db.destroy();
    console.log('\n✅ Inspections table test complete!');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    await db.destroy();
  }
}

testInspections();