// backend/knexfile.js
require('dotenv').config({ path: '../.env.local' });

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: 'localhost',
      port: 5432,
      database: 'arboriq',
      user: 'arboriqadmin',
      password: 'localdev123'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      host: 'arboriq-db-dev.postgres.database.azure.com',
      port: 5432,
      database: 'arboriq',
      user: 'arboriqadmin',
      password: 'Arb0r!Q2025Dev',
      ssl: { rejectUnauthorized: false }
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    }
  }
};