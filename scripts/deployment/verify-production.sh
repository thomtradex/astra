#!/bin/sh

set -e

echo "Checking Astra production..."

curl -f http://localhost:3001/api/v1/health

echo ""

docker compose \
-f deploy/production/docker-compose.production.yml \
ps

echo "Production verification completed"
