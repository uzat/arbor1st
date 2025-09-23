// backend/knexfile.js
require('dotenv').config({ path: '../.env.local' });

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'arboriq',
      user: process.env.DB_USER || 'arboriqadmin',
      password: process.env.DB_PASSWORD || 'localdev123'
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

  test: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'arboriq',  // Same DB for now
      user: process.env.DB_USER || 'arboriqadmin',
      password: process.env.DB_PASSWORD || 'localdev123'
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
      host: process.env.AZURE_DB_HOST || 'arboriq-db-dev.postgres.database.azure.com',
      port: process.env.AZURE_DB_PORT || 5432,
      database: process.env.AZURE_DB_NAME || 'arboriq',
      user: process.env.AZURE_DB_USER || 'arboriqadmin',
      password: process.env.AZURE_DB_PASSWORD || 'Arb0r!Q2025Dev',
      ssl: {
        rejectUnauthorized: false
      }
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