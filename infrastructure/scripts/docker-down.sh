#!/bin/bash
echo "Stopping ArborIQ local development environment..."

# Go to project root
cd ../..

docker-compose down
echo "✅ Stopped"
