exports.up = function(knex) {
  return Promise.all([
    // Add deleted_at to trees
    knex.schema.table('trees', function(table) {
      table.timestamp('deleted_at').nullable();
      table.index('deleted_at');
    }),
    
    // Add deleted_at to properties
    knex.schema.table('properties', function(table) {
      table.timestamp('deleted_at').nullable();
      table.index('deleted_at');
    }),
    
    // Add deleted_at to inspections
    knex.schema.table('inspections', function(table) {
      table.timestamp('deleted_at').nullable();
      table.index('deleted_at');
    }),
    
    // Add deleted_at to work_orders
    knex.schema.table('work_orders', function(table) {
      table.timestamp('deleted_at').nullable();
      table.index('deleted_at');
    }),
    
    // Add deleted_at to users
    knex.schema.table('users', function(table) {
      table.timestamp('deleted_at').nullable();
      table.index('deleted_at');
    })
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.table('trees', function(table) {
      table.dropColumn('deleted_at');
    }),
    knex.schema.table('properties', function(table) {
      table.dropColumn('deleted_at');
    }),
    knex.schema.table('inspections', function(table) {
      table.dropColumn('deleted_at');
    }),
    knex.schema.table('work_orders', function(table) {
      table.dropColumn('deleted_at');
    }),
    knex.schema.table('users', function(table) {
      table.dropColumn('deleted_at');
    })
  ]);
};