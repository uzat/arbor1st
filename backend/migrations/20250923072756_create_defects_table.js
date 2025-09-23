exports.up = function(knex) {
  return knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable('defects', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('inspection_id').notNullable();
      table.uuid('tree_id').notNullable();
      table.string('defect_type', 50).notNullable(); // 'cavity', 'crack', 'deadwood', 'decay', 'lean', 'pest', 'disease'
      table.string('severity', 20).notNullable(); // 'minor', 'moderate', 'major', 'severe', 'critical'
      table.string('location_on_tree', 100); // 'trunk_base', 'trunk_mid', 'crown', 'roots', 'branch_union'
      table.text('description');
      table.float('size_cm'); // Size of defect in cm
      table.integer('height_from_ground_m'); // Height of defect from ground
      table.jsonb('measurements').defaultTo('{}');
      table.boolean('requires_action').defaultTo(false);
      table.string('recommended_action', 255);
      table.timestamps(true, true);
      
      // Foreign keys
      table.foreign('inspection_id').references('id').inTable('inspections').onDelete('CASCADE');
      table.foreign('tree_id').references('id').inTable('trees').onDelete('CASCADE');
      
      // Indexes
      table.index('inspection_id');
      table.index('tree_id');
      table.index('defect_type');
      table.index('severity');
      table.index('requires_action');
    });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('defects');
};