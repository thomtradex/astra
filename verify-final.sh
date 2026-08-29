#!/bin/bash

set -e

BASE=http://localhost:3001/api/v1

echo "=== ASTRA FINAL CHECK ==="

TOKEN=$(curl -s -X POST $BASE/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"admin@astra.local","password":"AstraDev2026!"}' \
| jq -r '.accessToken')

if [ "$TOKEN" = "null" ]; then
 echo "LOGIN FAILED"
 exit 1
fi

AUTH="Authorization: Bearer $TOKEN"

echo "LOGIN OK"

curl -sf $BASE/auth/me -H "$AUTH" >/dev/null
echo "AUTH OK"

curl -sf $BASE/dashboard/overview -H "$AUTH" >/dev/null
echo "DASHBOARD OK"

curl -sf $BASE/customers -H "$AUTH" >/dev/null
echo "CUSTOMERS OK"

curl -sf $BASE/assets -H "$AUTH" >/dev/null
echo "ASSETS OK"

curl -sf $BASE/work-orders -H "$AUTH" >/dev/null
echo "WORK ORDERS OK"

curl -sf $BASE/maintenance -H "$AUTH" >/dev/null
echo "MAINTENANCE OK"

curl -sf $BASE/audit -H "$AUTH" >/dev/null
echo "AUDIT OK"

echo ""
echo "======================="
echo " ASTRA BACKEND READY"
echo "======================="
