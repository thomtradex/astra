#!/bin/bash

set -e

BASE=http://localhost:3001/api/v1

echo "================================"
echo " ASTRA BACKEND VERIFICATION"
echo "================================"

echo ""
echo "1) Login..."

TOKEN=$(curl -s -X POST $BASE/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"admin@astra.local","password":"AstraDev2026!"}' \
| jq -r '.accessToken')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "LOGIN FAILED"
  exit 1
fi

echo "LOGIN OK"
echo ""

AUTH="Authorization: Bearer $TOKEN"


echo "2) Auth/me"

curl -s $BASE/auth/me \
-H "$AUTH" | jq


echo ""
echo "3) Dashboard"

curl -s $BASE/dashboard/overview \
-H "$AUTH" | jq


echo ""
echo "4) Customers"

curl -s $BASE/customers \
-H "$AUTH" | jq '. | length'


echo ""
echo "5) Sites"

curl -s $BASE/sites \
-H "$AUTH" | jq '. | length'


echo ""
echo "6) Assets"

curl -s $BASE/assets \
-H "$AUTH" | jq '. | length'


echo ""
echo "7) Work Orders"

curl -s $BASE/work-orders \
-H "$AUTH" | jq '. | length'


echo ""
echo "8) Maintenance"

curl -s $BASE/maintenance \
-H "$AUTH" | jq


echo ""
echo "9) Audit"

curl -s $BASE/audit \
-H "$AUTH" | jq


echo ""
echo "================================"
echo " ALL CHECKS FINISHED"
echo "================================"

