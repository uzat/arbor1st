exports.up = function(knex) {
  return knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable('work_orders', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('tree_id').notNullable();
      table.uuid('inspection_id'); // Link to inspection that triggered it
      table.string('work_type', 50).notNullable(); // 'pruning', 'removal', 'treatment', 'inspection'
      table.string('priority', 20).notNullable().defaultTo('medium'); // 'urgent', 'high', 'medium', 'low'
      table.string('status', 20).notNullable().defaultTo('pending'); // 'pending', 'scheduled', 'in_progress', 'completed', 'cancelled'
      table.text('description');
      table.jsonb('specifications').defaultTo('{}');
      table.uuid('assigned_to');
      table.date('scheduled_date');
      table.timestamp('completed_at');
      table.decimal('estimated_hours', 5, 2);
      table.decimal('actual_hours', 5, 2);
      table.text('completion_notes');
      table.uuid('created_by').notNullable();
      table.timestamps(true, true);
      
      // Foreign keys
      table.foreign('tree_id').references('id').inTable('trees').onDelete('CASCADE');
      table.foreign('inspection_id').references('id').inTable('inspections').onDelete('SET NULL');
      
      // Indexes
      table.index('tree_id');
      table.index('status');
      table.index('priority');
      table.index('scheduled_date');
      table.index('assigned_to');
    });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('work_orders');
};