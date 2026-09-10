# Tedix Hunt — Prototype Architecture & Implementation Plan

Reference document for rebuilding the approved mockup from `tedixdev-arch/tedixhunt_student` into a secure, stable, production-like prototype.

## 1. Project reference

- Mockup / UX reference: `tedixdev-arch/tedixhunt_student`
- Production frontend: `tedixdev-arch/Tedix_Hunt_FE`
- Production backend: `tedixdev-arch/Tedix_Hunt_BE`
- Deployed prototype: `https://tedixhunt.anainfo.ai/`
- Target stack: React + TypeScript frontend; Node.js + TypeScript backend; PostgreSQL database; REST/JSON over HTTPS.

## 2. Core UX premise

TedixHunt is primarily a **mobile experience for Participants**.

- **Participant:** mobile-first. Fast, low-friction, one-hand use, large tap targets, short forms, persistent progress and resilient network behavior.
- **Organizer:** primarily desktop-first. Configuration, dashboards, tables and live monitoring; still responsive for smaller screens.
- **Creator:** primarily desktop-first. Structured template creation, validation, preview and submission workflows.
- **Admin:** desktop-first. Data-dense administration, filtering, permissions, auditability and safe destructive actions.

Responsive does not mean identical. Participant screens should be designed from the phone upward; back-office screens should be designed from desktop workflows downward.

## 3. Architectural goal

The mockup is the **functional and UX specification**, not the architecture to be copied.

The real prototype should be rebuilt as a secure, stable and production-like reference implementation that the development team can later evolve toward the final product.

Principles:

- Preserve approved user flows, terminology, behavior and visual intent from the mockup.
- Replace simulated and hard-coded behavior with real API calls, persistence and authorization.
- Keep the system simple: one frontend, one backend and one PostgreSQL database.
- Use a modular-monolith backend rather than premature microservices.
- Keep roles and capabilities inside one TedixHunt domain instead of creating separate applications.

## 4. Target technical architecture

```text
Participant Mobile Browser / PWA   |   Organizer / Creator / Admin Desktop Browser
                                  ↓
                     Tedix_Hunt_FE
                   React + TypeScript
                                  ↓
                     REST/JSON over HTTPS
                                  ↓
                     Tedix_Hunt_BE
            Node.js + TypeScript + Express
                                  ↓
                         PostgreSQL
```

## 5. Core architecture principles

### Security is backend-enforced

Hiding controls in the frontend is UX only. Every protected action must be authorized by the backend.

### Real persistence

No fake login, hard-coded user state, fake scoring or local-only Hunt state in production-like flows.

### Small vertical slices

Each implementation step should have one clear architectural purpose, one Codex task, one review, one PR and one deployment validation.

### No speculative redesign

Codex should implement the requested step only and must not refactor unrelated areas unless explicitly instructed.

### Stable contracts

Frontend and backend communicate through explicit API contracts and predictable error shapes.

### Mobile performance matters

Participant flows should minimize payloads, blocking requests, complex forms and interaction depth.

## 6. Implementation roadmap

### Phase A — Foundation

- **7.1 PostgreSQL backend foundation** — connection, configuration, migration mechanism and database health check.
- **7.2 Core User schema** — minimum identity model and role-ready structure.
- **7.3 Authentication backend** — register, login, refresh, logout and `/me` with secure password/token handling and tests.
- **7.4 Frontend API foundation** — centralized API client, configuration, errors and auth handling.
- **7.5 Real login** — replace mocked frontend login with end-to-end FE → BE → PostgreSQL authentication.

### Phase B — Identity & permissions

- **7.6 Role/capability model** — Participant, Organizer, Creator and Admin. Keep Supervisor contextual to a competition unless later requirements prove otherwise.
- **7.7 Protected frontend routes and backend authorization checks.**

### Phase C — Hunt domain foundation

- **7.8 Core Hunt data model** — User, Organization, Hunt, HuntParticipant and HuntRole.
- **7.9 Hunt lifecycle and CRUD API.**
- **7.10 Basic Hunt frontend backed by real API data.**

### Phase D — Organizer: Set the Hunt

- **7.11 General Setup**
- **7.12 Template Selection**
- **7.13 Hunt Features**
- **7.14 Rewards**
- **7.15 Review Hunt**
- **7.16 Create Hunt**
- **7.17 Generate and share Hunt link/code**

### Phase E — Participant runtime

- **7.18 Join by link/code**
- **7.19 Participant enrollment**
- **7.20 Hunt lobby/start**
- **7.21 Mission/checkpoint model**
- **7.22 Mission interaction**
- **7.23 Answer validation**
- **7.24 Score engine**
- **7.25 Progress persistence**
- **7.26 Competition completion**

### Phase F — Live operations & results

- **7.27 Live Hunt state**
- **7.28 Organizer Monitor Hunt**
- **7.29 Persistent Help / PANIC**
- **7.30 Supervisor assignment/actions**
- **7.31 Leaderboard**
- **7.32 Results**
- **7.33 Special Awards**

### Phase G — Long-term systems & governance

- **7.34 Hunt Passport**
- **7.35 Mission History**
- **7.36 Achievements**
- **7.37 Organizer rewards**
- **7.38 Physical prize inventory**
- **7.39 Creator Studio**
- **7.40 Template submission**
- **7.41 Admin approval**
- **7.42 Admin Console**

## 7. First milestone — Secure Authenticated Shell

**Milestone M1:** a real user can open the deployed application, log in against PostgreSQL, establish a secure authenticated session, access a protected screen, restore identity through `/me`, and log out. Nothing in that path is mocked.

```text
Open site → Login → Backend validation → PostgreSQL → Session → Protected screen → Logout
```

## 8. Development / review workflow

1. This planning chat defines the architecture and the next short implementation step.
2. Local ChatGPT checks the latest state of the relevant GitHub repository.
3. Local ChatGPT converts the approved step into a narrowly scoped Codex prompt.
4. Codex implements the change on a dedicated branch and runs build/tests.
5. Local ChatGPT reviews the actual diff for correctness, security and architecture.
6. Corrections are applied before the PR is prepared.
7. Local ChatGPT pushes/prepares the PR in FE or BE.
8. The project owner merges the PR and validates the deployed result.
9. Only after validation do we move to the next step or issue a focused correction step.

## 9. Definition of a good implementation step

- Small enough to understand in one review.
- Has explicit acceptance criteria.
- Touches only the repository or repositories required for that step.
- Includes tests where backend behavior or critical frontend logic changes.
- Builds successfully before PR creation.
- Can be verified on the deployed site whenever it creates visible behavior.
- Leaves the architecture cleaner and more explicit than before.

## 10. Codex prompt guardrail

Every implementation prompt should include this rule:

> Implement only the scope described. Do not redesign unrelated modules, introduce speculative abstractions, or migrate additional prototype functionality unless explicitly requested.

## 11. Immediate next step

**7.1 — PostgreSQL Backend Foundation** should be the first implementation step.

Scope:

- Configure PostgreSQL connection through environment variables.
- Select and configure the migration/data-access approach.
- Add the initial migration mechanism.
- Add database connectivity to health/readiness checks.
- Remove or isolate Mongo/Mongoose dependencies only within the agreed scope.
- Keep product functionality unchanged.

This establishes the persistence layer before authentication or Hunt functionality is built and prevents new work from being tied to the current incomplete Mongo/Mongoose path.
