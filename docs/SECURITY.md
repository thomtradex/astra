# Astra — Security (Phase 0.1)

## Security Principles

1. **Defense in depth** — Multiple layers: network, application, data
2. **Least privilege** — RBAC with granular permissions
3. **Complete auditability** — No important action without a log entry
4. **Fail secure** — Invalid auth rejects; audit failures don't expose data
5. **Secrets never in code** — Environment variables only

---

## Authentication

| Control              | Implementation                                       |
| -------------------- | ---------------------------------------------------- |
| Password storage     | bcrypt, 12 rounds (configurable via `BCRYPT_ROUNDS`) |
| Access tokens        | JWT, HS256, 15-minute expiry                         |
| Refresh tokens       | Opaque 128-byte hex, SHA-256 hashed in DB            |
| Token rotation       | Old refresh token revoked on each refresh            |
| Session invalidation | Logout revokes refresh token immediately             |
| User validation      | Active user + active organization required           |

### JWT Payload

Contains: `sub`, `email`, `organizationId`, `roles`, `permissions`

Does **not** contain sensitive data (password, full profile).

---

## Authorization (RBAC)

| Layer             | Mechanism                                                          |
| ----------------- | ------------------------------------------------------------------ |
| Route protection  | Global `JwtAuthGuard` — all routes require auth unless `@Public()` |
| Permission checks | Global `PermissionsGuard` + `@RequirePermissions()`                |
| Access denied     | HTTP 403 + audit log with `ACCESS_DENIED` action                   |
| Multi-tenant      | All queries scoped by `organizationId` from authenticated user     |

---

## Audit Trail

| Property     | Detail                                                      |
| ------------ | ----------------------------------------------------------- |
| Immutability | Append-only — no UPDATE/DELETE on audit_logs                |
| Scope        | Organization-scoped                                         |
| Retention    | Not configured in 0.1 — plan per compliance requirements    |
| Failure mode | Audit write failure logged to app logger; request continues |

Audited events:

- All mutating HTTP requests (POST, PUT, PATCH, DELETE)
- Login, logout, token refresh (explicit)
- Permission denials

---

## Application Security

| Control          | Implementation                                              |
| ---------------- | ----------------------------------------------------------- |
| HTTP headers     | Helmet (API), custom security headers (Next.js)             |
| CORS             | Configurable origin (`CORS_ORIGIN`)                         |
| Rate limiting    | 100 requests/minute per IP (NestJS Throttler)               |
| Input validation | class-validator DTOs + global ValidationPipe                |
| Error handling   | Structured errors — no stack traces in production responses |
| Swagger          | Disabled in production                                      |

---

## Frontend Security

| Control       | Implementation                                      |
| ------------- | --------------------------------------------------- |
| Token storage | HttpOnly cookies — not accessible to JavaScript     |
| Cookie flags  | `httpOnly`, `sameSite: lax`, `secure` in production |
| CSRF          | SameSite cookies + API-only token usage             |
| Middleware    | Redirect unauthenticated users to `/login`          |
| Metadata      | `robots: noindex, nofollow` during development      |

---

## Database Security

| Control     | Implementation                                         |
| ----------- | ------------------------------------------------------ |
| Credentials | Environment variable only                              |
| Connection  | TLS recommended for production PostgreSQL              |
| Migrations  | Version-controlled SQL via Prisma Migrate              |
| Seed data   | Development credentials only — never use in production |

---

## Environment Validation

API startup validates all required environment variables via Joi schema. Missing or invalid configuration prevents startup.

Required:

- `DATABASE_URL` (valid PostgreSQL URI)
- `JWT_ACCESS_SECRET` (min 32 chars)
- `JWT_REFRESH_SECRET` (min 32 chars)

---

## Known Limitations (Phase 0.1)

These are acceptable for foundation development but must be addressed before production:

| Item                           | Status             | Planned                     |
| ------------------------------ | ------------------ | --------------------------- |
| JWT algorithm                  | HS256 (symmetric)  | RS256 with key rotation     |
| MFA                            | Not implemented    | Phase 0.2+                  |
| IP allowlisting                | Not implemented    | Enterprise tier             |
| Encryption at rest             | PostgreSQL default | Managed DB + TDE            |
| Secret management              | `.env` files       | Vault / AWS Secrets Manager |
| Refresh token family detection | Basic rotation     | Detect reuse attacks        |

---

## Reporting

Security issues should be reported privately to the Astra security team. Do not open public issues for vulnerabilities.
