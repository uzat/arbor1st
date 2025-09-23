exports.up = function(knex) {
  return knex.schema.table('users', function(table) {
    table.string('password_hash', 255);
    table.index('password_hash');
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', function(table) {
    table.dropColumn('password_hash');
  });
};