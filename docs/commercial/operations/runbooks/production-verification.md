# Astra Production Verification Runbook

## Pre-deployment

Verify:

- Environment variables configured
- Database credentials configured
- JWT secrets rotated
- HTTPS configured
- Backup destination configured

## Deployment

Execute:

./scripts/deployment/deploy-production.sh

## Verification

Health check:

curl https://YOUR_DOMAIN/api/v1/health

Expected:

{
  "status":"ok"
}

## Database

Verify:

- PostgreSQL healthy
- migrations applied
- backup available

## Application

Verify:

- Login works
- Tenant isolation works
- RBAC permissions work
- Customer creation works
- Asset creation works
- Work orders work

## Rollback

Execute:

./scripts/deployment/rollback-production.sh
