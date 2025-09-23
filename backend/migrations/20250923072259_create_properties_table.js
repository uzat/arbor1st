exports.up = function(knex) {
  return knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable('properties', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('name', 255).notNullable();
      table.string('address', 500);
      table.string('owner_type', 50); // 'council', 'private', 'commercial', 'strata'
      table.string('owner_name', 255);
      table.string('owner_contact_email', 255);
      table.string('owner_contact_phone', 50);
      table.string('council_id', 100);
      table.specificType('boundary', 'geometry(Polygon, 4326)');
      table.float('area_sqm');
      table.jsonb('metadata').defaultTo('{}');
      table.boolean('active').defaultTo(true);
      table.timestamps(true, true);
      
      // Indexes
      table.index('owner_type');
      table.index('council_id');
      table.index('active');
    })
    .raw('CREATE INDEX idx_properties_boundary ON properties USING GIST(boundary)');
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('properties');
};