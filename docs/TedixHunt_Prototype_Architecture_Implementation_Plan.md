# Tedix Hunt — Prototype Architecture & Implementation Plan

Reference document for evolving the approved TedixHunt mockup into a secure, stable, working prototype using the **existing FE and BE repositories as the technical baseline**.

## 1. Project reference

- Mockup / UX reference: `tedixdev-arch/tedixhunt_student`
- Frontend repository: `tedixdev-arch/Tedix_Hunt_FE`
- Backend repository: `tedixdev-arch/Tedix_Hunt_BE`
- Frontend deployment: `https://tedixhunt.anainfo.ai/`
- Backend deployment: `https://tedixhuntbe.anainfo.ai/`
- Target stack: React + TypeScript frontend; Node.js + TypeScript + Express backend; PostgreSQL database; REST/JSON over HTTPS.

## 2. Core UX premise

TedixHunt is primarily a **mobile experience for Participants**.

- **Participant:** mobile-first. Fast, low-friction, one-hand use, large tap targets, short forms, persistent progress and resilient network behavior.
- **Organizer:** primarily desktop-first. Configuration, dashboards, tables and live monitoring; still responsive for smaller screens.
- **Creator:** primarily desktop-first. Structured template creation, validation, preview and submission workflows.
- **Admin:** desktop-first. Data-dense administration, filtering, permissions, auditability and safe destructive actions.

Responsive does not mean identical. Participant screens should be designed from the phone upward; back-office screens should be designed from desktop workflows downward.

## 3. Architectural baseline and governing principle

The mockup remains the **functional and UX specification**, but the current FE and BE repositories are now the **technical starting point**.

The prototype should therefore **not be rebuilt blindly from scratch** and should not copy BOLT architecture. Existing team structure that is sound should be preserved. Existing mock, legacy or incompatible behavior should be replaced deliberately and incrementally.

Governing principle:

> Preserve approved UX and useful existing structure. Replace simulated, legacy and incompatible behavior progressively with PostgreSQL-backed APIs, real persistence and backend-enforced authorization. Do not redesign working architecture merely to make it resemble the mockup or an earlier plan.

### Current FE baseline

The FE already has a structured React + TypeScript application with folders such as:

- `src/app`
- `src/components`
- `src/features`
- `src/pages`
- `src/routes`
- `src/shared`
- `src/types`
- `src/data`

Useful UI and mock data from the prototype have been moved into this structure. The FE should therefore be evolved in place rather than replaced wholesale.

### Current BE baseline

The BE already existed before the PostgreSQL work and contained:

- Express / TypeScript API structure
- MongoDB / Mongoose models
- JWT authentication
- User, RefreshToken and Organization models
- authentication and organization routes
- Swagger/OpenAPI support

Steps 7.1–7.3 introduced a new PostgreSQL identity/authentication path while some legacy Mongo/JWT code remains temporarily for compatibility.

The backend is therefore currently in a **transition state**:

```text
Node.js / Express
      |
      +-- PostgreSQL path
      |     - users
      |     - auth_sessions
      |     - auth_refresh_tokens
      |     - new authentication API
      |
      +-- Legacy Mongo/JWT path
            - Organization
            - old middleware/models
            - compatibility code only
```

PostgreSQL is the authoritative direction for all new work. MongoDB is transitional legacy and should be removed after the remaining required domain functionality is migrated.

## 4. Target technical architecture

```text
Participant Mobile Browser / PWA   |   Organizer / Creator / Admin Desktop Browser
                                  |
                                  v
                     tedixhunt.anainfo.ai
                       Tedix_Hunt_FE
                     React + TypeScript
                                  |
                           HTTPS REST/JSON
                                  |
                                  v
                   tedixhuntbe.anainfo.ai
                       Tedix_Hunt_BE
              Node.js + TypeScript + Express
                                  |
                                  v
                           PostgreSQL
```

The frontend must never connect directly to PostgreSQL.

The intended runtime path is:

```text
Browser -> FE -> BE API -> PostgreSQL
```

Developer/admin access to PostgreSQL may use pgAdmin through an SSH tunnel, but this is an operator workflow, not application architecture.

## 5. Core architecture principles

### PostgreSQL is authoritative

All new TedixHunt functionality must use PostgreSQL. Do not create new Mongo/Mongoose dependencies.

Legacy Mongo-backed functionality should either be migrated to PostgreSQL or explicitly retired.

### One identity, multiple roles

Authentication identifies a **User**, not a permanently separate CreatorUser, ParticipantUser, OrganizerUser or AdminUser.

A single user may later hold one or more capabilities/roles, for example:

```text
User
 |- Participant
 |- Organizer
 |- Creator
 `- Admin
```

Supervisor remains contextual to a competition/Hunt unless later product requirements prove otherwise.

### Security is backend-enforced

Hiding controls in the frontend is UX only. Every protected action must be authorized by the backend.

### Real persistence

No fake login, hard-coded user state, fake scoring or local-only Hunt state in production-like flows.

### Existing structure is preserved deliberately

Do not delete or refactor existing FE/BE structure merely because it predates this plan. First determine whether it is useful, transitional or obsolete.

### Small vertical slices

Each implementation step should have one clear architectural purpose, one Codex task, one review, one PR and one deployment validation.

### No speculative redesign

Codex should implement the requested step only and must not refactor unrelated areas unless explicitly instructed.

### Stable contracts

Frontend and backend communicate through explicit API contracts and predictable error shapes.

### Mobile performance matters

Participant flows should minimize payloads, blocking requests, complex forms and interaction depth.

## 6. Completed work and current transition state

### 7.1 PostgreSQL backend foundation — COMPLETED

Implemented and merged in BE:

- PostgreSQL connection through `DATABASE_URL`
- connection pooling
- versioned migrations with `node-pg-migrate`
- readiness checks
- startup PostgreSQL validation
- graceful shutdown
- PostgreSQL CI integration
- removal of hard-coded Mongo credentials
- isolation of legacy Mongo-backed routes

### 7.2 Core User schema — COMPLETED

Implemented and merged in BE:

- `public.users`
- UUID primary key
- case-insensitive unique email
- optional password hash
- optional display name
- timestamps
- reversible migration and PostgreSQL integration tests

### 7.3 PostgreSQL authentication backend — COMPLETED

Implemented and merged in BE:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- PostgreSQL-backed sessions
- opaque access/refresh tokens
- password hashing
- refresh rotation/replay protection
- CSRF/origin checks
- credentialed CORS support
- request throttling
- OpenAPI documentation

This step intentionally replaced the old Mongo-based role-specific authentication routes.

### Important current limitation

The old `Organization` route/model still belongs to the Mongo/JWT side and does **not** yet share the new PostgreSQL authentication/session system.

This creates a temporary split that must not become permanent.

## 7. Architecture reconciliation milestone

### 7.3A — Architecture & Deployment Reconciliation — NEXT

Before continuing deeper feature work, confirm and document the real runtime/deployment baseline.

This step is primarily an architecture/deployment validation step rather than a large coding step.

Required decisions and checks:

1. PostgreSQL is authoritative for all new product functionality.
2. The PostgreSQL `users.id` is the canonical TedixHunt user identity.
3. The Step 7.3 authentication model remains the canonical authentication system.
4. Legacy Mongo Organization/user dependencies are transitional only.
5. Existing FE structure and useful migrated UI stay in place.
6. Confirm PostgreSQL location, version and database name on the Hetzner environment.
7. Inspect existing schema and migration history before applying migrations.
8. Verify backups before first real server migration.
9. Configure BE runtime secrets outside Git.
10. Confirm FE -> BE connectivity between:
   - `https://tedixhunt.anainfo.ai/`
   - `https://tedixhuntbe.anainfo.ai/`
11. Confirm HTTPS, CORS, cookie behavior and reverse-proxy/trusted-proxy configuration.
12. Verify `/api/health` and `/api/health/ready` in the deployed environment.
13. Decide the migration/retirement path for legacy Mongo Organization code.

Do not declare the authenticated milestone complete until this deployment validation and the FE integration both work against the real environment.

## 8. Revised implementation roadmap

### Phase A — Foundation & authenticated shell

- **7.1 PostgreSQL backend foundation** — COMPLETED
- **7.2 Core User schema** — COMPLETED
- **7.3 Authentication backend** — COMPLETED
- **7.3A Architecture & Deployment Reconciliation** — NEXT
- **7.4 Frontend API/session foundation** — draft PR exists; review against this revised architecture before merge
- **7.5 Real login** — replace mocked frontend login with end-to-end FE -> BE -> PostgreSQL authentication

### Phase B — Identity & permissions

- **7.6 Role/capability model** — Participant, Organizer, Creator and Admin. Roles/capabilities attach to the canonical PostgreSQL user identity.
- **7.7 Protected frontend routes and backend authorization checks.**

### Phase C — Domain reconciliation & Hunt foundation

- **7.8 PostgreSQL domain reconciliation** — migrate/replace legacy Organization dependencies and define the PostgreSQL ownership/membership foundation.
- **7.9 Core Hunt data model** — Organization, Hunt, HuntParticipant and HuntRole using PostgreSQL user IDs.
- **7.10 Hunt lifecycle and CRUD API.**
- **7.11 Basic Hunt frontend backed by real API data.**

### Phase D — Organizer: Set the Hunt

- **7.12 General Setup**
- **7.13 Template Selection**
- **7.14 Hunt Features**
- **7.15 Rewards**
- **7.16 Review Hunt**
- **7.17 Create Hunt**
- **7.18 Generate and share Hunt link/code**

### Phase E — Participant runtime

- **7.19 Join by link/code**
- **7.20 Participant enrollment**
- **7.21 Hunt lobby/start**
- **7.22 Mission/checkpoint model**
- **7.23 Mission interaction**
- **7.24 Answer validation**
- **7.25 Score engine**
- **7.26 Progress persistence**
- **7.27 Competition completion**

### Phase F — Live operations & results

- **7.28 Live Hunt state**
- **7.29 Organizer Monitor Hunt**
- **7.30 Persistent Help / PANIC**
- **7.31 Supervisor assignment/actions**
- **7.32 Leaderboard**
- **7.33 Results**
- **7.34 Special Awards**

### Phase G — Long-term systems & governance

- **7.35 Hunt Passport**
- **7.36 Mission History**
- **7.37 Achievements**
- **7.38 Organizer rewards**
- **7.39 Physical prize inventory**
- **7.40 Creator Studio**
- **7.41 Template submission**
- **7.42 Admin approval**
- **7.43 Admin Console**

## 9. First milestone — Secure Authenticated Shell

**Milestone M1:** a real user can open the deployed application, log in against PostgreSQL, establish a secure authenticated session, access a protected screen, restore identity through `/me`, and log out. Nothing in that path is mocked.

```text
Open FE
  -> Login form
  -> tedixhuntbe.anainfo.ai
  -> PostgreSQL
  -> Session
  -> Protected screen
  -> /me identity restore
  -> Logout
```

M1 is not complete until it is validated on the real deployed FE/BE environment.

## 10. Frontend migration principle

The FE already contains useful mock data and prototype behavior under `src/data` and related components.

Do not remove all mock data at once.

For each vertical slice:

```text
Existing mock UI
      |
      v
Define API contract
      |
      v
Implement BE persistence/API
      |
      v
Replace only that mock source in FE
      |
      v
Validate deployed behavior
```

This lets the prototype remain visually usable while simulated behavior is progressively replaced with real behavior.

## 11. Backend legacy-removal principle

Mongo/Mongoose/JWT compatibility code is temporary.

The migration pattern should be:

```text
Legacy Mongo feature
      |
      v
Define PostgreSQL model/API
      |
      v
Implement and test PostgreSQL version
      |
      v
Move FE/use cases to new endpoint
      |
      v
Remove obsolete Mongo model/route/middleware
```

Do not maintain two permanent identity systems or two permanent sources of truth.

## 12. Tedix account linkage

The original backend contained an early `tedixUserId` participant concept. Step 7.3 intentionally did not preserve that role-specific authentication implementation.

This does not mean Tedix account linking is rejected.

It should be reintroduced later as an explicit identity-linking/SSO capability around the canonical PostgreSQL user rather than as a separate parallel User model.

This is outside the immediate authenticated-shell milestone.

## 13. Development / review workflow

1. This planning chat defines the architecture and the next short implementation step.
2. Local ChatGPT checks the latest state of the relevant GitHub repository.
3. Existing code and open PRs are reviewed before creating new work.
4. Local ChatGPT converts the approved step into a narrowly scoped Codex prompt.
5. Codex implements the change on a dedicated branch and runs build/tests.
6. Local ChatGPT reviews the actual diff for correctness, security and architecture.
7. Corrections are applied before the PR is prepared or merged.
8. The project owner merges the PR and validates the deployed result.
9. Only after validation do we move to the next step or issue a focused correction step.

## 14. Definition of a good implementation step

- Small enough to understand in one review.
- Has explicit acceptance criteria.
- Starts from the actual current repository state, not an assumed blank architecture.
- Touches only the repository or repositories required for that step.
- Includes tests where backend behavior or critical frontend logic changes.
- Builds successfully before PR creation.
- Can be verified on the deployed site whenever it creates visible behavior.
- Preserves useful existing structure.
- Removes legacy/mock behavior only when its replacement is ready.
- Leaves the architecture cleaner and more explicit than before.

## 15. Codex prompt guardrail

Every implementation prompt should include this rule:

> Implement only the scope described. Do not redesign unrelated modules, introduce speculative abstractions, or migrate additional prototype functionality unless explicitly requested. Preserve useful existing repository structure and check for legacy/current interactions before replacing code.

## 16. Immediate next step

**7.3A — Architecture & Deployment Reconciliation** is the immediate next step.

After that:

1. Review the existing draft **7.4 Frontend API/session foundation** PR against this revised plan.
2. Merge/correct 7.4 only if it matches the confirmed deployment architecture.
3. Implement **7.5 Real Login** and validate the complete deployed path:

```text
FE -> BE -> PostgreSQL -> authenticated FE session
```

Only after that should work continue into roles, protected actions and the Hunt domain.
