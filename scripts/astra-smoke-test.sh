#!/bin/bash

set -e

API="http://localhost:3001/api/v1"

echo "=== ASTRA SMOKE TEST ==="

echo "1. Login"

TOKEN=$(curl -s -X POST "$API/auth/login" \
-H "Content-Type: application/json" \
-d '{
"email":"admin@alpha.test",
"password":"AstraDev2026!"
}' | jq -r '.accessToken')


if [ "$TOKEN" = "null" ]; then
 echo "LOGIN FAILED"
 exit 1
fi

echo "LOGIN OK"


echo "2. Auth profile"

curl -sf "$API/auth/me" \
-H "Authorization: Bearer $TOKEN" > /dev/null

echo "AUTH OK"


echo "3. Sites"

curl -sf "$API/sites" \
-H "Authorization: Bearer $TOKEN" > /dev/null

echo "SITES OK"


echo "4. Assets"

curl -sf "$API/assets" \
-H "Authorization: Bearer $TOKEN" > /dev/null

echo "ASSETS OK"


echo "5. Work Orders"

curl -sf "$API/work-orders" \
-H "Authorization: Bearer $TOKEN" > /dev/null

echo "WORK ORDERS OK"


echo "6. Customers"

curl -sf "$API/customers" \
-H "Authorization: Bearer $TOKEN" > /dev/null

echo "CUSTOMERS OK"


echo ""
echo "ASTRA BACKEND READY"
