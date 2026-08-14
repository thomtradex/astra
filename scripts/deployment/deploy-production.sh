#!/bin/sh

set -e

echo "Building Astra production containers..."

docker compose \
-f deploy/production/docker-compose.production.yml \
build

echo "Starting Astra production..."

docker compose \
-f deploy/production/docker-compose.production.yml \
up -d

echo "Checking services..."

docker compose \
-f deploy/production/docker-compose.production.yml \
ps

echo "Deployment finished."
