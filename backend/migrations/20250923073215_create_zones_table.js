exports.up = function(knex) {
  return knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable('zones', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('property_id').notNullable();
      table.string('name', 255).notNullable();
      table.string('zone_type', 50); // 'high_risk', 'playground', 'parking', 'building_adjacent', 'public_area'
      table.specificType('boundary', 'geometry(Polygon, 4326)');
      table.float('area_sqm');
      table.jsonb('risk_factors').defaultTo('{}'); // high_traffic, children_present, etc.
      table.integer('priority_level'); // 1-5 for inspection priority
      table.text('notes');
      table.boolean('active').defaultTo(true);
      table.timestamps(true, true);
      
      // Foreign keys
      table.foreign('property_id').references('id').inTable('properties').onDelete('CASCADE');
      
      // Indexes
      table.index('property_id');
      table.index('zone_type');
      table.index('priority_level');
    })
    .raw('CREATE INDEX idx_zones_boundary ON zones USING GIST(boundary)');
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('zones');
};