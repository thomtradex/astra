#!/bin/bash

set -e

BASE=http://localhost:3001/api/v1

echo "Creating Astra construction enterprise demo..."

TOKEN=$(curl -s \
-X POST $BASE/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"admin@astra.local","password":"AstraDev2026!"}' \
| jq -r '.accessToken')


echo "Token generated"

echo "Creating construction dataset..."

# empresas
# obras
# equipamentos
# ordens manutenção
# métricas dashboard


echo "Enterprise construction demo ready"

