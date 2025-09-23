#!/bin/bash
# enable-postgis.sh

# Variables (must match what's in the create script)
SERVER_NAME="arboriq-db-dev"
ADMIN_USER="arboriqadmin"
ADMIN_PASSWORD="Arb0r!Q2025Dev"  # Use your actual password
DATABASE_NAME="arboriq"

echo "Enabling PostGIS extension on ArborIQ database..."
echo ""
echo "This script will:"
echo "1. Connect to the PostgreSQL server"
echo "2. Enable PostGIS extension"
echo "3. Verify the installation"
echo ""

# Install psql if not available
which psql > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "psql not found. Please install PostgreSQL client tools:"
    echo "  Windows: Download from https://www.postgresql.org/download/windows/"
    echo "  Mac: brew install postgresql"
    echo "  Linux: sudo apt-get install postgresql-client"
    exit 1
fi

# Connection string
HOST="$SERVER_NAME.postgres.database.azure.com"
CONNECTION="postgresql://$ADMIN_USER@$SERVER_NAME:$ADMIN_PASSWORD@$HOST:5432/$DATABASE_NAME?sslmode=require"

echo "Connecting to database..."

# Enable PostGIS
psql "$CONNECTION" << EOF
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Verify installation
SELECT PostGIS_Version();

-- Show installed extensions
\dx

-- Create a test table to verify spatial capabilities
CREATE TABLE IF NOT EXISTS spatial_test (
    id SERIAL PRIMARY KEY,
    location GEOGRAPHY(POINT, 4326)
);

-- Insert a test point (Melbourne coordinates)
INSERT INTO spatial_test (location) 
VALUES (ST_MakePoint(144.9631, -37.8136));

-- Verify spatial query works
SELECT id, ST_AsText(location) FROM spatial_test;

-- Clean up test
DROP TABLE spatial_test;

\echo 'PostGIS successfully enabled!'
EOF

echo ""
echo "✅ PostGIS setup complete!"