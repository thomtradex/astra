#!/bin/bash

BASE=http://localhost:3001/api/v1

TOKEN=$(curl -s -X POST $BASE/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"admin@astra.local","password":"AstraDev2026!"}' \
| jq -r '.accessToken')

echo "TOKEN OK"

curl -s $BASE/auth/me \
-H "Authorization: Bearer $TOKEN" | jq

curl -s $BASE/dashboard/overview \
-H "Authorization: Bearer $TOKEN" | jq

curl -s $BASE/customers \
-H "Authorization: Bearer $TOKEN" | jq

curl -s $BASE/assets \
-H "Authorization: Bearer $TOKEN" | jq

curl -s $BASE/work-orders \
-H "Authorization: Bearer $TOKEN" | jq

