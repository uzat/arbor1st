exports.up = function(knex) {
  return knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable('risk_alerts', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('tree_id').notNullable();
      table.uuid('property_id');
      table.string('alert_type', 50).notNullable(); // 'weather', 'structural', 'health', 'inspection_due'
      table.string('severity', 20).notNullable(); // 'low', 'medium', 'high', 'critical'
      table.string('trigger_source', 100); // 'weather_api', 'inspection', 'manual', 'scheduled'
      table.jsonb('weather_conditions').defaultTo('{}'); // wind speed, rainfall, etc.
      table.jsonb('risk_factors').defaultTo('{}'); // contributing factors
      table.integer('risk_score'); // 0-100
      table.text('description');
      table.text('recommended_action');
      table.specificType('exclusion_zone', 'geometry(Polygon, 4326)'); // Safety perimeter
      table.float('exclusion_radius_m'); // Radius in meters
      table.boolean('acknowledged').defaultTo(false);
      table.uuid('acknowledged_by');
      table.timestamp('acknowledged_at');
      table.boolean('resolved').defaultTo(false);
      table.uuid('resolved_by');
      table.timestamp('resolved_at');
      table.timestamp('expires_at'); // When alert auto-expires
      table.timestamps(true, true);
      
      // Foreign keys
      table.foreign('tree_id').references('id').inTable('trees').onDelete('CASCADE');
      table.foreign('property_id').references('id').inTable('properties').onDelete('SET NULL');
      table.foreign('acknowledged_by').references('id').inTable('users').onDelete('SET NULL');
      table.foreign('resolved_by').references('id').inTable('users').onDelete('SET NULL');
      
      // Indexes
      table.index('tree_id');
      table.index('property_id');
      table.index('alert_type');
      table.index('severity');
      table.index(['acknowledged', 'resolved']);
      table.index('created_at');
    })
    .raw('CREATE INDEX idx_risk_alerts_exclusion ON risk_alerts USING GIST(exclusion_zone)');
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('risk_alerts');
};