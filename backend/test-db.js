const config = require('./knexfile');
const knex = require('knex')(config.development);

async function testDB() {
  try {
    // Check all tables exist
    const tables = await knex.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Tables created:');
    tables.rows.forEach(t => console.log('  ✓', t.table_name));
    
    // Check foreign key relationships
    const fks = await knex.raw(`
      SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table,
        ccu.column_name AS foreign_column
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name
    `);
    
    console.log('\n🔗 Foreign Keys:');
    fks.rows.forEach(fk => 
      console.log(`  ${fk.table_name}.${fk.column_name} → ${fk.foreign_table}.${fk.foreign_column}`)
    );
    
    // Count PostGIS spatial columns
    const spatial = await knex.raw(`
      SELECT f_table_name, f_geometry_column, type
      FROM geometry_columns
    `);
    
    console.log('\n🌍 Spatial Columns (PostGIS):');
    spatial.rows.forEach(s => 
      console.log(`  ${s.f_table_name}.${s.f_geometry_column} (${s.type})`)
    );
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

testDB();