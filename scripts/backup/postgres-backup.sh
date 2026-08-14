#!/bin/sh

set -e

DATE=$(date +"%Y-%m-%d-%H-%M")

mkdir -p backups

docker compose \
-f deploy/production/docker-compose.production.yml \
exec -T postgres \
pg_dump -U astra_user astra \
> backups/astra-$DATE.sql

echo "Backup created: backups/astra-$DATE.sql"
