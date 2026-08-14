#!/bin/bash

set -e

BASE=http://localhost:3001/api/v1

TOKEN=$(curl -s \
-X POST $BASE/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"admin@astra.local","password":"AstraDev2026!"}' \
| jq -r '.accessToken')


echo "Creating construction demo..."


CUSTOMER=$(curl -s \
-X POST $BASE/customers \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
"code":"CONST-DEMO-002",
"name":"Construtora Premium Lda",
"email":"admin@construtorapremium.pt"
}')

CUSTOMER_ID=$(echo $CUSTOMER | jq -r '.id')


SITE=$(curl -s \
-X POST $BASE/sites \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
"name":"Edifício Porto Norte",
"code":"SITE-PORTO-001"
}')

SITE_ID=$(echo $SITE | jq -r '.id')


ASSET=$(curl -s \
-X POST $BASE/assets \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d "{
\"name\":\"Grua Torre Liebherr\",
\"code\":\"ASSET-GRU-002\",
\"status\":\"ACTIVE\",
\"siteId\":\"$SITE_ID\"
}")

ASSET_ID=$(echo $ASSET | jq -r '.id')


WORK_ORDER=$(curl -s \
-X POST $BASE/work-orders \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d "{
\"title\":\"Inspeção preventiva da grua\",
\"description\":\"Manutenção mensal obrigatória\",
\"priority\":\"HIGH\",
\"status\":\"OPEN\",
\"assetId\":\"$ASSET_ID\"
}")


echo "$CUSTOMER" | jq
echo "$SITE" | jq
echo "$ASSET" | jq
echo "$WORK_ORDER" | jq


echo "Construction demo environment ready"
