#!/bin/bash

set -e

BASE=http://localhost:3001/api/v1

TOKEN=$(curl -s \
-X POST $BASE/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"admin@astra.local","password":"AstraDev2026!"}' \
| jq -r '.accessToken')


echo "Astra demo token generated"

# customer
# site
# assets
# work orders

echo "Demo environment ready"
