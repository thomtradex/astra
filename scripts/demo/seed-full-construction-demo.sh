#!/bin/bash

set -e

BASE=http://localhost:3001/api/v1

echo "Creating Astra enterprise construction demo..."

TOKEN=$(curl -s \
-X POST $BASE/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"admin@astra.local","password":"AstraDev2026!"}' \
| jq -r '.accessToken')


AUTH="Authorization: Bearer $TOKEN"

echo "Creating customers..."


CUSTOMER=$(curl -s \
-X POST $BASE/customers \
-H "$AUTH" \
-H "Content-Type: application/json" \
-d '{
"code":"ATL-001",
"name":"Construtora Atlântico SA",
"email":"contacto@atlantico.pt"
}')

CUSTOMER_ID=$(echo $CUSTOMER | jq -r '.id')


SITE=$(curl -s \
-X POST $BASE/sites \
-H "$AUTH" \
-H "Content-Type: application/json" \
-d '{
"name":"Porto Business Center",
"code":"SITE-ATL-001"
}')

SITE_ID=$(echo $SITE | jq -r '.id')


echo "Creating assets..."


for i in 1 2 3 4 5
do

ASSET=$(curl -s \
-X POST $BASE/assets \
-H "$AUTH" \
-H "Content-Type: application/json" \
-d "{
\"name\":\"Equipamento Construção $i\",
\"code\":\"ATL-ASSET-00$i\",
\"status\":\"ACTIVE\",
\"siteId\":\"$SITE_ID\"
}")

ASSET_ID=$(echo $ASSET | jq -r '.id')


curl -s \
-X POST $BASE/work-orders \
-H "$AUTH" \
-H "Content-Type: application/json" \
-d "{
\"title\":\"Inspeção equipamento $i\",
\"description\":\"Manutenção preventiva trimestral\",
\"priority\":\"HIGH\",
\"status\":\"OPEN\",
\"assetId\":\"$ASSET_ID\"
}" > /dev/null

done


echo "Enterprise construction demo ready"
