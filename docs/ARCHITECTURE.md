# Astra — Architecture (Phase 0.1)

## Overview

Phase 0.1 establishes the **enterprise foundation** for the Astra Operational Intelligence Platform. No product features, dashboards, AI engines, or integrations are included in this phase.

The [ASTRA Engineering Book](./engineering-book/ASTRA_ENGINEERING_BOOK_MASTER.md) is the architectural constitution of this repository. When this document and the Engineering Book disagree, the Engineering Book wins.

The foundation is designed for:

- Multi-tenant international growth
- Modular team development
- Complete auditability
- Security by default

---

## Monorepo Structure

| Package | Purpose |
|---------|---------|
| `@astra/api` | NestJS REST API — auth, RBAC, audit, health |
| `@astra/web` | Next.js 15 — authentication shell only |
| `@astra/database` | Prisma ORM, PostgreSQL schema, migrations, seed |
| `@astra/shared` | Shared types, permissions, API route constants |
| `@astra/typescript-config` | Shared TypeScript configurations |
| `@astra/eslint-config` | Shared ESLint rules |

**Tooling:** pnpm workspaces + Turborepo

---

## Engineering Book Governance

All new business modules must follow the boundary rules in [Module Boundaries](./architecture/MODULE_BOUNDARIES.md):

- Domain contains business rules and never imports frameworks, databases, AI providers, queues, or delivery adapters.
- Application contains use cases, commands, queries, handlers, and ports.
- Infrastructure implements ports for persistence, messaging, external systems, integrations, and AI providers.
- Delivery adapts HTTP, workers, subscribers, and other external inputs into application calls.
- Existing Phase 0.1 modules are a foundation shell and must not be copied as the pattern for new domain capabilities.

Architecture decisions that affect module boundaries, dependency direction, platform evolution, security, or data ownership require an ADR under `docs/adr/`.

---

## Layered Architecture

```
┌─────────────────────────────────────────┐
│           Experience Layer              │
│         Next.js 15 + Tailwind           │
└─────────────────┬───────────────────────┘
                  │ HTTPS / REST
┌─────────────────▼───────────────────────┐
│              API Gateway                  │
│    NestJS + Validation + Rate Limiting    │
│         JWT Auth + RBAC Guards            │
└─────────────────┬───────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼───┐   ┌─────▼─────┐  ┌───▼────┐
│ Auth  │   │   Audit   │  │ Health │
└───┬───┘   └─────┬─────┘  └────────┘
    │             │
┌───▼─────────────▼───────────────────────┐
│              Data Layer                   │
│         PostgreSQL + Prisma               │
└───────────────────────────────────────────┘
```

Future phases will add (not in 0.1):

- Comprehension Engine
- Decision Engine
- Execution Engine
- Memory Engine
- Integrations Hub

---

## Database Model

### Core Entities

| Entity | Description |
|--------|-------------|
| `Organization` | Multi-tenant boundary |
| `User` | Identity within an organization |
| `Role` | Named role (SUPER_ADMIN, ADMIN, OPERATOR, VIEWER) |
| `Permission` | Granular capability (e.g. `user:read`) |
| `UserRole` | User ↔ Role assignment |
| `RolePermission` | Role ↔ Permission mapping |
| `RefreshToken` | Hashed refresh tokens with revocation |
| `AuditLog` | Immutable action trail |

### Design Decisions

1. **Schema-per-tenant deferred** — Single schema with `organizationId` FK for v0.1; sufficient until ~1000 tenants.
2. **Snake_case in DB, camelCase in code** — Prisma `@map` for PostgreSQL conventions.
3. **Append-only audit** — No updates or deletes on `audit_logs`.
4. **Permission strings** — Human-readable, extensible (`resource:action` pattern).

---

## Authentication Flow

```
Client                    API                     Database
  │                        │                         │
  │── POST /auth/login ───►│                         │
  │                        │── validate user ───────►│
  │                        │◄── user + roles ────────│
  │                        │── create refresh token ►│
  │                        │── audit: LOGIN ────────►│
  │◄── access + refresh ───│                         │
  │                        │                         │
  │── GET /auth/me ───────►│ (Bearer access token)   │
  │◄── profile ────────────│                         │
  │                        │                         │
  │── POST /auth/refresh ─►│                         │
  │                        │── revoke old token ────►│
  │                        │── issue new tokens ────►│
  │◄── new tokens ─────────│                         │
```

### Token Strategy

| Token | Lifetime | Storage |
|-------|----------|---------|
| Access (JWT) | 15 minutes | HttpOnly cookie (web) / Authorization header |
| Refresh | 7 days | HttpOnly cookie, SHA-256 hashed in DB |

Refresh tokens are rotated on each use. Revocation is immediate via `revokedAt`.

---

## RBAC Model

### System Roles

| Role | Purpose |
|------|---------|
| `SUPER_ADMIN` | Full platform access within organization |
| `ADMIN` | User and org management, audit read |
| `OPERATOR` | Read users, read audit, read org |
| `VIEWER` | Read-only user and org access |

### Permission Enforcement

1. `@Public()` — Bypasses JWT and permission checks
2. `@RequirePermissions('user:read')` — Requires specific permission
3. `PermissionsGuard` — Global guard, logs `ACCESS_DENIED` to audit

Permissions are loaded from DB at login and embedded in JWT. Re-validated on each request via DB lookup in JWT strategy.

---

## Audit System

Every significant action is logged:

| Field | Description |
|-------|-------------|
| `organizationId` | Tenant scope |
| `actorId` | User who performed action (nullable for system) |
| `action` | CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT, REFRESH, ACCESS_DENIED |
| `resource` | Target resource (users, auth, audit, rbac) |
| `method`, `path` | HTTP context |
| `ipAddress`, `userAgent` | Client context |
| `metadata` | JSON additional context |

Audit failures never block business operations — logged to application logger as fallback.

---

## API Versioning

All routes prefixed with `/api/v1/`. Versioning via URI path (NestJS `VersioningType.URI`).

---

## Next Phases (Roadmap)

| Phase | Focus |
|-------|-------|
| **0.2** | Domain model expansion, API hardening |
| **0.3** | COO first screen (mock data) |
| **0.4** | Comprehension Engine |
| **0.5** | Decision + Execution (one E2E flow) |
| **1.0** | Integrations + AI + Memory |
