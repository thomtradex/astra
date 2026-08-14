#!/bin/sh

set -e

echo "Rolling back Astra production"

docker compose \
-f deploy/production/docker-compose.production.yml \
down

docker compose \
-f deploy/production/docker-compose.production.yml \
up -d

echo "Rollback completed"
