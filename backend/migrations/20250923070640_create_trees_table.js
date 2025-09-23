// backend/migrations/20250923070640_create_trees_table.js

exports.up = function(knex) {
  return knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .then(() => {
      return knex.schema.createTable('trees', (table) => {
        // Primary key
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        
        // Basic tree information
        table.string('species', 255);
        table.string('common_name', 255);
        table.string('cultivar', 255);
        
        // Measurements
        table.float('height_m');
        table.float('dbh_cm'); // Diameter at breast height
        table.float('canopy_spread_m');
        
        // Health and risk
        table.enum('health_status', ['excellent', 'good', 'fair', 'poor', 'dead'])
          .defaultTo('good');
        table.integer('risk_rating').defaultTo(0);
        
        // Location - PostGIS geography point
        table.specificType('location', 'GEOGRAPHY(POINT, 4326)');
        table.string('address', 500);
        
        // Tags
        table.string('qr_code', 100).unique();
        table.string('nfc_tag', 100).unique();
        table.string('reference_id', 100);
        
        // Metadata
        table.jsonb('attributes');
        table.uuid('created_by');
        table.uuid('updated_by');
        
        // Timestamps
        table.timestamps(true, true);
        
        // Indexes
        table.index('species');
        table.index('health_status');
        table.index('risk_rating');
      });
    })
    .then(() => {
      // Add spatial index
      return knex.raw('CREATE INDEX idx_trees_location ON trees USING GIST(location)');
    });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('trees');
};