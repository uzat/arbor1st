exports.up = function(knex) {
  return knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTable('users', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('email', 255).notNullable().unique();
      table.string('first_name', 100).notNullable();
      table.string('last_name', 100).notNullable();
      table.string('phone', 50);
      table.string('role', 50).notNullable(); // 'admin', 'arborist', 'council_manager', 'viewer'
      table.string('certification_level', 50); // 'cert_arborist', 'qualified_arborist', 'consulting_arborist'
      table.string('certification_number', 100);
      table.date('certification_expiry');
      table.string('company', 255);
      table.uuid('company_id');
      table.string('avatar_url', 500);
      table.jsonb('permissions').defaultTo('{}');
      table.jsonb('preferences').defaultTo('{}');
      table.boolean('active').defaultTo(true);
      table.timestamp('last_login_at');
      table.string('auth_provider', 50); // 'auth0', 'azure_ad', 'google'
      table.string('auth_provider_id', 255);
      table.timestamps(true, true);
      
      // Indexes
      table.index('email');
      table.index('role');
      table.index('company_id');
      table.index('active');
      table.index('auth_provider_id');
    });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('users');
};