exports.up = function(knex) {
  return knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable('work_logs', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('work_order_id').notNullable();
      table.uuid('logged_by').notNullable();
      table.string('action', 50).notNullable(); // 'status_change', 'note_added', 'photo_added', 'work_performed'
      table.text('description');
      table.jsonb('old_values').defaultTo('{}');
      table.jsonb('new_values').defaultTo('{}');
      table.decimal('hours_logged', 5, 2);
      table.timestamp('logged_at').notNullable().defaultTo(knex.fn.now());
      
      // Foreign keys
      table.foreign('work_order_id').references('id').inTable('work_orders').onDelete('CASCADE');
      table.foreign('logged_by').references('id').inTable('users').onDelete('SET NULL');
      
      // Indexes
      table.index('work_order_id');
      table.index('logged_by');
      table.index('logged_at');
    });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('work_logs');
};