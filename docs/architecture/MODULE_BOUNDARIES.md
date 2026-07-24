# Module Boundaries

## Constitutional Rule

Business logic belongs in the domain. Frameworks, databases, queues, AI providers, and external systems are implementation details.

## Required Bounded Context Structure

New business capabilities must use this shape:

```text
<bounded-context>/
  domain/
    entities/
    value-objects/
    aggregates/
    services/
    events/
    repositories/
  application/
    commands/
    queries/
    handlers/
    ports/
    use-cases/
  infrastructure/
    persistence/
    messaging/
    external-services/
  delivery/
    http/
    workers/
    subscribers/
  contracts/
  tests/
```

Small contexts may omit empty folders, but they may not collapse domain, application, infrastructure, and delivery responsibilities into one file.

## Dependency Direction

Allowed direction:

```text
delivery -> application -> domain
infrastructure -> application/domain
contracts -> domain/application types only
tests -> any layer under test
```

Forbidden direction:

```text
domain -> application
domain -> infrastructure
domain -> delivery
application -> infrastructure
application -> delivery
delivery -> infrastructure persistence details
```

## Domain Rules

Domain code may contain:

- Entities
- Value objects
- Aggregates
- Domain services
- Domain events
- Repository interfaces
- Domain policies and invariants

Domain code must not import:

- NestJS
- Next.js
- React
- Prisma or database clients
- Express or HTTP framework types
- Queue clients
- AI provider SDKs
- Infrastructure adapters
- Delivery adapters

## Application Rules

Application code may contain:

- Commands
- Queries
- Use cases
- Handlers
- Application ports
- Transaction boundaries through ports

Application code must not import concrete databases, HTTP controllers, UI code, AI providers, or infrastructure adapters.

## Infrastructure Rules

Infrastructure code implements ports. It may depend on databases, queues, provider SDKs, filesystem APIs, external systems, and framework integrations. Infrastructure must not contain business rules.

## Delivery Rules

Delivery code translates external input into application calls. Controllers, route handlers, workers, subscribers, and CLI commands belong here. Delivery must not contain business rules or direct persistence access.

## Legacy Foundation Rule

Existing Phase 0.1 modules may keep their current structure until explicitly migrated. No new business capability may copy the legacy `controller/service/prisma` pattern.
