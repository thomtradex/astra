# Astra — Setup Guide (Phase 0.1)

## Environment Requirements

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 22+ | Use `nvm use` (see `.nvmrc`) |
| pnpm | 9+ | Enable via `corepack enable` |
| Docker | Latest | For PostgreSQL |
| Git | Latest | Optional — requires Xcode CLI tools on macOS |

---

## Initial Setup

### 1. Clone or navigate to project

```bash
cd ~/Projects/astra
```

### 2. Install Node.js (if not installed)

```bash
# Using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install 22
nvm use
```

### 3. Enable pnpm

```bash
corepack enable
corepack prepare pnpm@9.15.0 --activate
```

### 4. Install dependencies

```bash
pnpm install
```

### 5. Environment configuration

```bash
cp .env.example .env
```

Generate secure JWT secrets:

```bash
openssl rand -base64 64   # Use for JWT_ACCESS_SECRET
openssl rand -base64 64   # Use for JWT_REFRESH_SECRET
```

Update `.env` with the generated values.

### 6. Start PostgreSQL

```bash
pnpm docker:up
```

Verify:

```bash
docker ps | grep astra-postgres
```

### 7. Database setup

```bash
pnpm db:generate    # Generate Prisma client
pnpm db:migrate:deploy  # Apply migrations
pnpm db:seed        # Seed roles, permissions, admin user
```

### 8. Start development servers

```bash
pnpm dev
```

This starts:

- **API** on http://localhost:3001
- **Web** on http://localhost:3000

---

## Verify Installation

### Health check

```bash
curl http://localhost:3001/api/v1/health
```

Expected:

```json
{
  "status": "ok",
  "timestamp": "...",
  "services": { "database": "up" }
}
```

### Login test

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@astra.local","password":"AstraDev2026!"}'
```

### Web login

Open http://localhost:3000/login and sign in with default credentials.

---

## Development Workflow

### Create a new migration

After changing `packages/database/prisma/schema.prisma`:

```bash
pnpm db:migrate
```

Name the migration descriptively (e.g. `add_work_items`).

### Prisma Studio

Inspect database visually:

```bash
pnpm db:studio
```

### Run a single app

```bash
pnpm --filter @astra/api dev
pnpm --filter @astra/web dev
```

---

## Troubleshooting

### PostgreSQL connection refused

```bash
pnpm docker:logs
# Ensure container is healthy
docker compose -f docker/docker-compose.yml ps
```

### JWT validation errors on startup

Ensure `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are at least 32 characters.

### Prisma client not found

```bash
pnpm db:generate
```

### Port already in use

Change `API_PORT` in `.env` or stop conflicting processes.

---

## Production Considerations (Future)

Phase 0.1 is development-ready, not production-deployed. Before production:

1. Replace all default secrets and passwords
2. Enable HTTPS/TLS termination
3. Configure managed PostgreSQL
4. Set `NODE_ENV=production`
5. Review [SECURITY.md](./SECURITY.md)
