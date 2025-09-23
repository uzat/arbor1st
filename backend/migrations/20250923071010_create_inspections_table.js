// backend/migrations/[timestamp]_create_inspections_table.js

exports.up = function(knex) {
  return knex.schema.createTable('inspections', (table) => {
    // Primary key
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    
    // Foreign key to tree
    table.uuid('tree_id').notNullable();
    table.foreign('tree_id').references('id').inTable('trees').onDelete('CASCADE');
    
    // Inspector details
    table.uuid('inspector_id').notNullable();
    table.string('inspector_name', 255);
    table.string('inspector_company', 255);
    
    // Inspection details
    table.enum('inspection_type', ['routine', 'emergency', 'post-storm', 'detailed', 'aerial'])
      .defaultTo('routine');
    table.date('inspection_date').notNullable();
    
    // Findings
    table.jsonb('defects'); // Array of defect objects
    table.integer('risk_score').defaultTo(0); // 0-100
    table.text('notes');
    table.text('recommendations');
    
    // Weather conditions during inspection
    table.jsonb('weather_conditions');
    
    // Photos and attachments
    table.jsonb('photos'); // Array of photo URLs/IDs
    table.jsonb('attachments'); // Other documents
    
    // Status
    table.enum('status', ['draft', 'complete', 'reviewed']).defaultTo('draft');
    
    // Timestamps
    table.timestamps(true, true);
    
    // Indexes
    table.index('tree_id');
    table.index('inspector_id');
    table.index('inspection_date');
    table.index('inspection_type');
    table.index('status');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('inspections');
};