# Astra Platform

**Operational Intelligence Platform — Phase 0.1 Foundation**

Astra is not a chatbot, ERP, CRM, or dashboard. It is infrastructure for autonomous operational work — comprehend, decide, execute, and escalate to humans only when necessary.

This repository contains the **enterprise foundation** (Phase 0.1): monorepo, authentication, RBAC, audit, database, Docker, and development tooling. No product features yet.

---

## Architecture

```
astra/
├── apps/
│   ├── api/          NestJS REST API (auth, RBAC, audit, health)
│   └── web/          Next.js 15 frontend (auth foundation only)
├── packages/
│   ├── database/     Prisma schema, migrations, seed
│   ├── shared/       Shared types, permissions, constants
│   ├── eslint-config/
│   └── typescript-config/
├── docker/           PostgreSQL + API Dockerfile
└── docs/             Technical documentation
```

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for full details.

---

## Prerequisites

- **Node.js** 22+ ([nvm](https://github.com/nvm-sh/nvm) recommended — see `.nvmrc`)
- **pnpm** 9+ (`corepack enable`)
- **Docker** (for PostgreSQL)

---

## Quick Start

### 1. Install dependencies

```bash
cd ~/Projects/astra
corepack enable
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit JWT secrets — generate with: openssl rand -base64 64
```

### 3. Start PostgreSQL

```bash
pnpm docker:up
```

### 4. Initialize database

```bash
pnpm db:generate
pnpm db:migrate:deploy
pnpm db:seed
```

### 5. Start development

```bash
pnpm dev
```

| Service  | URL                                 |
| -------- | ----------------------------------- |
| Frontend | http://localhost:3000               |
| API      | http://localhost:3001/api/v1        |
| Swagger  | http://localhost:3001/api/docs      |
| Health   | http://localhost:3001/api/v1/health |

### Default credentials (development only)

| Field    | Value               |
| -------- | ------------------- |
| Email    | `admin@astra.local` |
| Password | `AstraDev2026!`     |

**Change immediately in any non-local environment.**

---

## Scripts

| Command           | Description                         |
| ----------------- | ----------------------------------- |
| `pnpm dev`        | Start all apps in development       |
| `pnpm build`      | Build all packages and apps         |
| `pnpm lint`       | Lint entire monorepo                |
| `pnpm typecheck`  | TypeScript validation               |
| `pnpm test`       | Run tests                           |
| `pnpm db:migrate` | Create/apply migrations (dev)       |
| `pnpm db:seed`    | Seed roles, permissions, admin user |
| `pnpm docker:up`  | Start PostgreSQL container          |

---

## Security

See [docs/SECURITY.md](./docs/SECURITY.md).

Foundation includes:

- JWT access + refresh token rotation
- bcrypt password hashing (12 rounds)
- RBAC with permission guards
- Immutable audit trail
- Helmet, CORS, rate limiting
- HttpOnly secure cookies (frontend)
- Environment validation at startup

---

## Documentation

- [Setup Guide](./docs/SETUP.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Security](./docs/SECURITY.md)

---

## License

Proprietary — Astra Platform. All rights reserved.
