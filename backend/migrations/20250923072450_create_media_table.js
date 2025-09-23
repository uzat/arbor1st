exports.up = function(knex) {
  return knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable('media', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('entity_type', 50).notNullable(); // 'tree', 'inspection', 'work_order', 'property'
      table.uuid('entity_id').notNullable();
      table.string('media_type', 20).notNullable(); // 'photo', 'video', 'document', 'report'
      table.string('mime_type', 100);
      table.string('original_filename', 255);
      table.string('storage_path', 500).notNullable();
      table.string('cdn_url', 500);
      table.integer('file_size_bytes');
      table.specificType('location', 'geometry(Point, 4326)'); // Where photo was taken
      table.text('caption');
      table.jsonb('metadata').defaultTo('{}'); // EXIF data, GPS coords, etc.
      table.jsonb('ai_analysis').defaultTo('{}'); // Store Plant.id or other AI results
      table.uuid('uploaded_by').notNullable();
      table.timestamp('uploaded_at').notNullable().defaultTo(knex.fn.now());
      
      // Indexes
      table.index(['entity_type', 'entity_id']);
      table.index('media_type');
      table.index('uploaded_by');
    })
    .raw('CREATE INDEX idx_media_location ON media USING GIST(location)');
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('media');
};