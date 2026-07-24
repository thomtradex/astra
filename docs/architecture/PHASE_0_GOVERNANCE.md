# Phase 0 Governance

## Objective

Phase 0 establishes the engineering governance required before building additional Astra capabilities. It does not add product features.

## Engineering Rationale

The Engineering Book requires domain-first architecture, Clean Architecture, Hexagonal Architecture, DDD, ports and adapters, security by design, observability by default, and modular monolith first.

The current codebase has a working foundation, but future work needs enforceable guardrails before new domain behavior is added. Phase 0 therefore defines the architectural contract and adds automated dependency checks.

## Current Architectural Deviations

These deviations are known and must be handled in later phases:

- API modules are organized around NestJS `controller/service` files rather than bounded-context layers.
- Some application behavior currently reaches Prisma directly through service classes.
- Domain entities, value objects, aggregates, domain services, domain events, and repository ports are not yet explicit.
- Existing tests focus on integration behavior; domain unit tests will be required when domain modules are introduced.

These deviations are tolerated only for the current foundation shell. They are not approved as patterns for future modules.

## Phase 0 Scope

Phase 0 creates:

- An ADR that records the Engineering Book governed modular monolith decision.
- A module boundary standard for all future bounded contexts.
- A dependency-boundary checker that fails on forbidden domain/application imports.
- CI integration for architecture checks.

Phase 0 does not:

- Refactor auth, RBAC, users, audit, or health into full DDD modules.
- Add Company Brain, engines, agents, integrations, workflows, or product screens.
- Introduce new runtime infrastructure.

## Definition of Done

- The Engineering Book remains the highest-priority source of truth.
- New architectural rules are documented.
- The boundary checker runs through `pnpm architecture:check`.
- CI runs the boundary checker before lint, typecheck, build, and test.
- Future phases have a clear migration path.

## Next Phase Gate

Phase 1 may begin only after approval. It should migrate the first bounded context into the Engineering Book structure without mixing unrelated product work.

# Phase 0 — Governance

## Purpose

Phase 0 defines the engineering governance of the Astra Platform.

Before writing code, the platform must establish how engineering decisions are made, documented, reviewed and maintained.

The objective of this phase is to guarantee long-term consistency across the entire platform.

Every future engineering activity must comply with this document.

---

# Mission

Create a disciplined engineering culture where architecture is intentional, documentation is authoritative, and software quality is never compromised for delivery speed.

---

# Engineering Philosophy

The Astra Platform is engineered as a long-term system.

Every decision must favour maintainability over convenience.

Engineering exists to protect the platform from complexity.

Technology serves architecture.

Architecture serves the business.

---

# Core Principles

Every engineering decision follows these principles.

• Architecture First

• Documentation First

• Domain First

• Simplicity

• Consistency

• Security by Design

• AI Native

• Technology Independence

• Testability

• Continuous Evolution

---

# Architecture First

Architecture is always designed before implementation.

No component should be developed without first defining its responsibilities, boundaries and dependencies.

Implementation validates architecture.

It never defines architecture.

---

# Documentation First

Documentation is part of the product.

No architectural decision should exist only inside someone's head.

Every relevant decision must be documented.

Documentation evolves together with the platform.

---

# Domain First

The business domain represents the most valuable asset of Astra.

Business knowledge must remain independent from technology.

Frameworks may change.

Cloud providers may change.

Programming languages may change.

The domain remains.

---

# Engineering Standards

Every engineer is responsible for protecting the architecture.

Code must be.

Readable.

Predictable.

Testable.

Observable.

Replaceable.

Consistent.

Engineering quality is never optional.

---

# Definition of Done

A feature is only considered complete when all of the following are true.

Business requirements are satisfied.

Architecture remains consistent.

Documentation is updated.

Tests are implemented.

Code review is completed.

Observability is included.

Security requirements are validated.

No technical debt is intentionally introduced.

---

# Documentation Requirements

Every major feature must include.

Architecture updates.

Technical documentation.

API documentation.

ADR when required.

Engineering notes when applicable.

Undocumented software is considered incomplete.

---

# Architecture Decision Records

Every significant engineering decision must generate an ADR.

Examples.

Technology selection.

Architectural changes.

Security decisions.

Infrastructure strategy.

Data modelling changes.

Integration strategy.

The ADR becomes the official historical record.

---

# Code Reviews

Every Pull Request must be reviewed.

The review validates.

Architecture.

Maintainability.

Naming.

Performance.

Security.

Testing.

Documentation.

Reviews exist to improve software.

Not to criticise engineers.

---

# Git Strategy

Development follows a trunk-based workflow.

Branches remain short-lived.

Long-running branches are discouraged.

The main branch always represents a deployable platform.

---

# Branch Naming

Examples.

feature/company-brain

feature/workflow-engine

feature/context-engine

bugfix/authentication

hotfix/security-patch

refactor/domain-model

docs/architecture

---

# Commit Messages

Commits describe intent.

Examples.

feat(identity): add authentication workflow

fix(workflow): resolve execution ordering

refactor(memory): simplify repository abstraction

docs(ai): update reasoning architecture

Avoid meaningless messages.

Examples.

update

changes

fix

test

---

# Testing Philosophy

Testing is mandatory.

The testing pyramid should be respected.

Unit Tests.

Integration Tests.

Contract Tests.

End-to-End Tests.

Business logic should always be testable without infrastructure.

---

# Security

Security is designed from the beginning.

Never added later.

Authentication.

Authorization.

Encryption.

Auditing.

Secrets Management.

Secure Defaults.

Least Privilege.

Zero Trust.

---

# Observability

Every service must expose.

Logs.

Metrics.

Tracing.

Health Checks.

No component should operate as a black box.

---

# Dependency Rules

Dependencies always point towards the business.

Business never depends on infrastructure.

Artificial Intelligence never owns business knowledge.

Infrastructure never defines architecture.

---

# Engineering Culture

Engineers are expected to challenge ideas.

Not architecture.

Discussions should be based on principles.

Never on personal preference.

Consistency is more valuable than individual optimisation.

---

# Continuous Improvement

Engineering standards evolve continuously.

Processes should improve.

Architecture should improve.

Documentation should improve.

Knowledge should improve.

Improvement never stops.

---

# Governance Validation

Governance is considered healthy when.

Architecture remains stable.

Documentation remains current.

Code quality remains high.

Technical debt remains controlled.

Engineers understand the platform.

Knowledge is shared.

Business remains protected.

---

# Founder Statement

The greatest risk for a software platform is not technology.

It is inconsistency.

Small shortcuts become permanent habits.

Permanent habits become technical debt.

Technical debt eventually becomes architecture.

I want Astra to be engineered with discipline.

Every engineer should understand why the platform exists.

How it is organised.

And how to evolve it without compromising its principles.

Architecture is not bureaucracy.

Architecture is protection.

---

# End of Phase 0 — Governance
