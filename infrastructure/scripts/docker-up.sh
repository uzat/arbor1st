#!/bin/bash
echo "Starting ArborIQ local development environment..."

# Go to project root (assuming script is run from infrastructure/scripts)
cd ../..

# Start containers
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Check if services are running
docker-compose ps

echo ""
echo "✅ Local development environment started!"
echo ""
echo "Services:"
echo "  PostgreSQL: localhost:5432"
echo "  Redis:      localhost:6379"
echo ""
echo "Database credentials:"
echo "  Database: arboriq"
echo "  Username: arboriqadmin"
echo "  Password: localdev123"
