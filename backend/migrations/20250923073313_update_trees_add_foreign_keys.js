exports.up = function(knex) {
  return knex.schema.table('trees', function(table) {
    table.uuid('property_id');
    table.uuid('zone_id');
    
    // Foreign keys
    table.foreign('property_id').references('id').inTable('properties').onDelete('SET NULL');
    table.foreign('zone_id').references('id').inTable('zones').onDelete('SET NULL');
    table.foreign('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.foreign('updated_by').references('id').inTable('users').onDelete('SET NULL');
    
    // Indexes
    table.index('property_id');
    table.index('zone_id');
  });
};

exports.down = function(knex) {
  return knex.schema.table('trees', function(table) {
    table.dropForeign('property_id');
    table.dropForeign('zone_id');
    table.dropForeign('created_by');
    table.dropForeign('updated_by');
    table.dropColumn('property_id');
    table.dropColumn('zone_id');
  });
};