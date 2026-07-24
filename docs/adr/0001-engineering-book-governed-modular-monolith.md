# ADR 0001: Engineering Book Governed Modular Monolith

## Status

Accepted

## Context

The Astra Engineering Book is the constitutional source of truth for the platform. It requires Clean Architecture, Hexagonal Architecture, Domain Driven Design, SOLID, domain-first modeling, ports and adapters, security by design, observability by default, and a modular monolith before distributed services.

The current Phase 0.1 codebase provides a useful enterprise foundation: NestJS API, Next.js web shell, Prisma/PostgreSQL, authentication, RBAC, audit, health checks, tests, Docker, and CI. However, the API modules currently follow a framework-first `controller/service/prisma` shape. That shape is acceptable only as a temporary foundation shell; it must not become the architectural pattern for future Astra modules.

## Decision

Astra will evolve as a modular monolith governed by the Engineering Book.

All new business capabilities must be organized by bounded context and must keep dependency direction inward:

```text
delivery -> application -> domain
infrastructure -> application/domain
```

The domain layer must not depend on NestJS, Prisma, databases, HTTP, queues, AI providers, external integrations, or framework DTOs. Infrastructure implements ports owned by the domain or application layer. Delivery adapters expose use cases but contain no business rules.

Phase 0 adds architectural guardrails and documentation before further feature development. Existing foundation modules will be migrated in later phases rather than rewritten inside Phase 0.

## Consequences

- Future modules must expose `domain`, `application`, `infrastructure`, `delivery`, `contracts`, and `tests` boundaries where business behavior exists.
- Business rules must live in entities, value objects, aggregates, domain services, domain events, and use cases.
- Frameworks, databases, AI models, queues, and integrations are replaceable adapters.
- Architectural deviations require a new ADR before implementation.
- Automated boundary checks run in local quality checks and CI.

## Links

- `docs/engineering-book/ASTRA_ENGINEERING_BOOK_MASTER.md`
- `docs/architecture/PHASE_0_GOVERNANCE.md`
- `docs/architecture/MODULE_BOUNDARIES.md`
