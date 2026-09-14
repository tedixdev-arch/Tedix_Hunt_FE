# TedixHunt — Prototype Architecture & Implementation Plan
Revision 2 · 14 September 2026 · Updated implementation roadmap

## 1. Objective and working rules

Turn the approved mockup into a working, persistent prototype by extending the development team's existing frontend, backend and PostgreSQL database.

The prototype is pre-development/pre-production, as confirmed by the project owner. This permits a small, practical scope; it does not make authentication, saved progress or reliable scoring optional.

Preserve the mobile-first participant experience and desktop-first organizer, creator and admin workflows. Keep the existing React/TypeScript/Vite/PWA frontend, Express/TypeScript backend, PostgreSQL database, REST API and repository separation. Use readable code, a few focused functions and the existing folder conventions. Do not introduce a new framework, ORM, generic workflow engine or service architecture to implement this prototype.

This revision updates the planning document only. The review did not change application code, database schema, records, credentials or deployment configuration.

**First complete product milestone:** an organizer creates and opens a Hunt; real participants join a real team; the organizer starts it; participants complete the approved mission; progress survives refresh; the organizer sees progress and help requests; all parties see consistent final results.

The first mission should be **SIGNAL: CLUJ NAPOCA**, already present in the mockup. Proposed initial scope: its seven stages, four-person teams, one fixed difficulty and a fixed scoring configuration. These scope choices require product confirmation before the affected implementation slice; they are not claims about approved requirements.

### Implementation steps in execution order

The current backend already creates and verifies JWT access tokens. PostgreSQL stores users and refresh tokens; it does not implement JWT verification. The frontend still needs real authentication wiring. Extend this foundation rather than implement a second login system.

| Step | Where | Work and completion condition |
|---|---|---|
| 1. Align deployment | FE + BE hosting | Identify deployed commits, resolve the FE/source mismatch, confirm the BE database target and current credentials. Record working deployment and rollback instructions. |
| 2. Establish database migrations | BE + PostgreSQL | Verify backup/restore, baseline the four existing tables without losing data, introduce tracked migrations and an isolated test database. |
| 3. Complete backend readiness | BE | Require valid runtime configuration, implement database readiness and close the connection pool cleanly on shutdown. Verify failure and recovery behavior. |
| 4. Repair existing authentication | BE + PostgreSQL | Keep JWT access tokens; fix token separation/rotation, trusted Tedix identity verification, logout and input handling. Agree browser refresh transport and test active routes. |
| 5. Connect the frontend login | FE + BE | Add a small API client and mount the provider at the active entry point. Connect actual sign-in pages, restore identity, refresh and log out against the deployed API. |
| 6. Add scoped permissions | FE + BE + PostgreSQL | Define participant/organizer/creator/admin capabilities and organization ownership. Verify that users cannot access another organization's protected resources. |
| 7. Save and publish a Hunt | FE + BE + PostgreSQL | Persist organizer setup and a Signal template snapshot; generate a unique join code/link. Reload must restore saved configuration. |
| 8. Join and prepare real teams | FE + BE + PostgreSQL | Resolve invitations, enroll participants once, assign teams and store readiness. Start only when the server permits it. |
| 9. Complete one real checkpoint | FE + BE + PostgreSQL | Persist individual answers, contributions, team solve and score events. Test multiple devices, repeated requests and reconnection before adding more content. |
| 10. Complete the Signal mission | FE + BE + PostgreSQL | Extend the proven checkpoint flow to all seven stages, FinishPoint and stable results. Remove mock answers/scoring from the playable path. |
| 11. Complete organizer operations | FE + BE + PostgreSQL | Deliver monitoring, pause/resume/end and persistent help alerts with acknowledgements. Start this work after step 8; finish it before any field pilot. |
| 12. Run the supervised pilot | Deployed prototype | Validate the full journey on target phones with real independent sessions; record defects and resolve blockers. |
| 13. Expand from the tested foundation | FE + BE + PostgreSQL | Add approved difficulty/formats, rewards, passport/history, Creator Studio and admin workflows in separate small slices. |

Steps 2–4 are separate reviews within milestone M1; do not combine all foundation repairs into one large PR. Section 10 maps these steps to milestones and acceptance criteria. Pilot defaults remain proposals until agreed; the implementation sequence does not silently approve new product restrictions.

## 2. Evidence and limits of the review

Reviewed snapshots:

| Source | Reviewed state |
|---|---|
| Frontend main | a713fdb4c6ce2130d3f7ba499cac6b14bff2524d |
| Backend main | 6dcc58338fba105e3885439ea9dcf921e7b3d925 |
| Mockup main | 2495197e3a47ccb550a6677684b68f1bd03d91f0 |
| Existing architecture plan | FE docs/TedixHunt_Prototype_Architecture_Implementation_Plan.md |
| Deployed Swagger | API 0.1.0, authentication and organization operations |
| Live PostgreSQL | tedix_hunt; PostgreSQL 18.6; metadata inspected with read-only queries |
| Pull requests | No open FE or BE PRs at review time; FE PR #3 closed without merge |

The source review covered application entry points, routes, authentication, PostgreSQL models and bootstrap SQL, CI/test definitions, mockup data, mission state/scoring, and representative participant, organizer, creator and admin flows. Shared source-file hashes were compared between mockup and FE: all shared src files matched except main.tsx and routes/router.tsx.

Live database inspection covered tables, columns, constraints and indexes, not user records or stored credentials. It found only four public application tables and no non-system migration-history table.

Swagger was accessible in the browser after its browser check. Direct HTTP retrieval failed from the shell; a browser health-endpoint navigation was blocked by the client. Therefore this review does **not** certify deployed health/readiness, CORS, token behavior or complete FE-to-BE login.

The deployed FE displayed a “Welcome back” login page, while FE main boots the expanded mockup router. This is evidence of a deployment/cache mismatch to investigate, not proof of its cause or deployed commit. The actual BE deployment commit and whether its DATABASE_URL targets the database inspected here also remain to be verified.

No build or test suite was executed in this planning review. Source presence, historical PR validation and live runtime validation are separate forms of evidence.

## 3. Corrected baseline

| Area | Actual state | Planning consequence |
|---|---|---|
| FE UI | Mockup source already copied into FE | Reuse screens; replace simulated data/actions incrementally |
| FE entry point | main.tsx renders routes/router.tsx directly | Mount authentication around the active router; changing App.tsx alone will have no effect |
| FE old shell | App.tsx, RootNavigator.tsx and mock AuthProvider remain but are not the active entry path | Reuse useful provider code; do not create another parallel router |
| FE API foundation | No shared API client in main; PR #3 closed unmerged | Review reusable work, adapt it to the chosen current contract |
| BE persistence | User, Organization and RefreshToken models use pg and SQL | PostgreSQL migration of these models has already happened |
| MongoDB | No Mongoose dependency or Mongo model implementation in current BE main | Remove the old “migrate organizations from Mongo” work item |
| Auth | Role-specific routes, bcrypt passwords, JWT access/refresh tokens | Opaque cookie sessions from the old plan are not the current implementation |
| Schema management | CREATE TABLE IF NOT EXISTS runs on startup; SQL duplicated inline and in schema.sql | Establish tracked migrations before further schema changes |
| Health | /health and /api/health defined; no /api/health/ready route | Add actual database readiness |
| Tests | Health/environment and an scrypt helper are tested; CI provisions PostgreSQL 17 | Add tests exercising the active SQL/auth paths; align test DB major version with the target |
| Hunt domain | No Hunt, team, mission, progress or result tables/routes | These remain new work |

The earlier plan accurately records some historical work, but its “completed” labels no longer describe current main. BE PR #7 introduced the earlier auth path; later PR #8 changed the baseline. Reconcile the resulting behavior rather than restoring an old architecture wholesale.

### Current database foundation

- **users:** UUID id, nullable unique email, nullable password_hash, required text role, name, is_guest, unique tedix_user_id, created_at.
- **organizations:** UUID id, name, description, owner_id referencing users, created_at.
- **organization_members:** composite key of organization_id and user_id, foreign keys with cascade deletion.
- **refresh_tokens:** UUID id, user_id, unique raw token, expires_at, created_at.

Keep these identities and relationships. Email uniqueness is currently case-sensitive. Roles are currently a single text field, with TypeScript values creator/participant/guest; organizer and admin capabilities are not implemented. Do not drop or recreate these tables to match a previous plan.

### API available in current source and Swagger

- POST /api/auth/creator/register
- POST /api/auth/creator/login
- POST /api/auth/participant/register
- POST /api/auth/participant/login
- POST /api/auth/guest
- POST /api/auth/refresh
- GET /api/auth/me
- GET and POST /api/organizations
- GET and PATCH /api/organizations/:id

There is no generic /register or /login and no logout endpoint in current main. Swagger is the starting **API contract**, not a database migration plan. Keep request/response examples synchronized with implementation.

## 4. Architecture to retain

```text
Participant mobile browser / Organizer desktop browser
                         |
              Existing React frontend
                         |
                    HTTPS REST
                         |
              Existing Express backend
                         |
                  PostgreSQL
```

- Only the backend accesses the database for application operations.
- Codex/pgAdmin database access is an operator workflow. It does not prove the deployed BE connection or grant an application user an organizer role.
- Keep FE pages, components, hooks, data, routes and shared folders.
- Keep BE routes, middleware, models, lib and db folders.
- Continue using parameterized SQL through the existing pg pool.
- Use a small fetch client, one active auth provider and explicit response types.
- Start live updates with modest polling while the relevant page is open; refresh immediately after an action and on reconnect. Introduce WebSockets only if measured needs justify them.
- Keep demo routes visibly separate from persisted prototype routes until each feature is connected.
- Do not ship answer keys in a publicly accessible demo bundle for the same mission used in a real competitive pilot.

## 5. Prerequisites and readiness gates

| Prerequisite | Status | Required evidence / owner |
|---|---|---|
| GitHub FE/BE access | Verified | Access available; choose implementation branches per slice |
| Operator DB connection | Verified | Successful read-only connection using local password file |
| Dev team's PostgreSQL foundation | Verified | Four live tables match current schema structure |
| Deployed API documentation | Verified | Swagger lists current JWT/auth and organization endpoints |
| FE deployment matches reviewed source | Unresolved | Dev team identifies build commit, deployment process and cache/service-worker state |
| Deployed BE targets intended prototype DB | Unverified | Dev team confirms deployment commit and target DB without exposing secrets |
| BE credentials after DB password change | Unverified | Confirm server secret was updated if it uses the rotated account; verify after pool reconnect/restart |
| Backup and recovery | Unverified | Dev team records snapshot/backup and restores it into an isolated database before first schema migration |
| Versioned migrations | Missing in current main | Baseline existing schema without data loss; record subsequent migrations |
| Authentication and authorization | Partial | Complete section 6 before real participant testing |
| FE-to-BE browser contract | Unverified | Real login, refresh, logout and restricted cross-origin requests pass |
| Prototype test environment | Not established in this review | Disposable database for tests; never run destructive tests on shared prototype data |
| First-pilot rules/content | Proposed | Confirm team size, difficulty, scoring, valid route and arrival policy |
| Field help/operations | Mocked | Named organizer, working alerts and fallback contact before an outdoor pilot |

Keep environment values out of Git. BE needs an explicitly configured DATABASE_URL, JWT secret, bind/port and allowed FE origin. FE needs only a public API base URL. The local password file is not a frontend configuration file and is not a server deployment secret.

## 6. Authentication and permissions: preserve the foundation, repair the gaps

### Recommended direction

Retain JWT access tokens and the existing PostgreSQL user/organization models. Avoid replacing the whole system with the earlier opaque-session implementation merely to match the old document.

Keep existing role-specific endpoints initially for compatibility. Put shared credential verification/token issuance in small helpers. A generic login can be added when multiple capabilities require it; do not maintain duplicate auth logic.

For browser persistence, the recommended incremental contract is: access token in memory, refresh token in a Secure, HttpOnly cookie, refresh/logout handled by the BE. Retain JWT access authentication. The cookie transport change must be documented and coordinated with any existing API consumers; confirm that contract before connecting FE. Do not silently mix this with PR #3's older cookie-session assumptions.

### Required fixes before the authenticated milestone

1. **Tedix identity proof:** participant login currently accepts tedixUserId without verifying upstream proof. Disable that public shortcut until a trusted server-verified Tedix flow exists. A supplied identifier is not authentication.
2. **Configuration:** fail startup when required database or JWT configuration is missing; remove the working fallback JWT secret. Validate token lifetimes.
3. **Token separation and rotation:** access and refresh JWTs currently share signing behavior and contain no explicit purpose distinction. Require token type and unique IDs; reject refresh tokens at bearer-protected APIs. Store refresh-token hashes, consume/replace them atomically, and define reuse/revocation behavior. Concurrent refresh must not mint multiple valid successors.
4. **Logout:** add backend refresh revocation and cookie clearing. Document that a stateless access JWT remains valid until its short expiry unless explicit server-side revocation is implemented; do not claim immediate universal revocation.
5. **Validation and errors:** validate field types, lengths, email normalization and UUIDs at the boundary. Map uniqueness conflicts to controlled responses, including concurrent registration. Inspect case-colliding emails before creating a case-insensitive unique index.
6. **Password implementation:** active routes use bcrypt; the separate scrypt helper/test does not validate those routes. Keep existing hashes working and test the active path. Do not change algorithms as a side effect of FE integration; explicitly handle bcrypt's byte limit if retaining it.
7. **Browser protection:** configure the exact FE origin and credentialed CORS if cookies are adopted, cookie scope/SameSite rules, origin/CSRF protections for cookie-backed actions, request limits and throttling. Configure trusted proxy behavior only for the actual deployment.
8. **Guest behavior:** the current guest token lasts one hour, while mock setup defaults to a 90-minute Hunt. Decide a recoverable guest session or require participant accounts for the pilot; do not lose an active Hunt after token expiry.
9. **Test active paths:** registration/login, /me, refresh replay/concurrency, logout, invalid identity proof, wrong token type, malformed input and organization ownership must exercise PostgreSQL in a disposable database.

### Minimal capability model

Use the existing users.id for everyone. Propose a small user_roles table only when implementing the role slice, with explicit participant, organizer, creator and admin values. Backfill deliberately from existing roles; preserve compatibility while old consumers still read role.

Organization ownership/membership authorizes organization operations; Hunt enrollment/team membership authorizes gameplay. Supervisor is scoped to a Hunt. Do not build a generic permission engine.

Creator and organizer are separate product capabilities: authoring templates does not automatically imply permission over every organizer's Hunt. Never grant organizer/admin permissions from a client-selected role or a public registration parameter. Provision pilot professional accounts through a controlled operator step.

## 7. Database change workflow

Keep all application schema changes in BE version-controlled migrations.

1. Inspect existing schema and dependencies; identify data collisions using aggregate checks rather than exporting personal data.
2. Take and verify a backup/restore path.
3. Add one migration mechanism. node-pg-migrate is a candidate because it was used historically; check reusable historical work, but do not assume it exists in current main. Do not build a custom migration framework.
4. Establish a baseline that supports both a clean database and this already-populated four-table schema. Detect incompatible shapes rather than relying on CREATE TABLE IF NOT EXISTS to repair them.
5. Remove duplicated startup DDL only after the tracked migration path is proven. Startup should validate readiness and required schema, not mutate schema on every launch.
6. For each feature, prefer additive columns/tables, explicit constraints and backfills. Apply once, in order, before the corresponding app release.
7. Document rollback or forward repair. A down migration that deletes new user data is not a safe routine rollback.
8. Test on a disposable database matching PostgreSQL 18, including upgrade from the current schema. Use a separate migration account where practical; avoid broad runtime privileges solely for startup DDL.
9. Release notes record migration identifiers, FE/BE commits and smoke-test results. Deployment scripts/process ownership still need confirmation.

No direct ad hoc schema edits through pgAdmin/Codex should become the only record of a feature change.

## 8. First playable Hunt: proposed scope and data

Use the existing Signal mission: six relay checkpoints plus FinishPoint, individual puzzles, contributions, team puzzles and route unlocks.

Proposed pilot defaults:
- One approved template version, four active participants per team and fixed difficulty.
- Organizer-controlled start and completion; basic pause/resume/cancel where exposed.
- Online operation with honest disconnected/retry states. No promised offline submissions.
- Basic organizer monitoring, persistent help alerts and final results.
- Manual arrival confirmation for an initial indoor/browser test; verified coordinates and an explicit arrival policy before field testing.
- No automated email/SMS, physical prize fulfillment, SSO, generic template editor or advanced awards in the first playable milestone.

Keep future UX options in the roadmap. Disable or label unsupported controls; never silently save an option that has no effect.

### Minimum domain additions, introduced only with their slices

| Entity | Purpose / essential constraints |
|---|---|
| user_roles | Multiple capabilities on canonical users; constrained role values |
| hunts | Organization/owner, title, schedule/timezone, state, join code, template version, configuration snapshot |
| hunt_participants | Hunt/user identity, readiness and optional team; unique Hunt/user enrollment |
| teams | Belongs to one Hunt; fixed pilot capacity; assignment validated transactionally |
| hunt_checkpoints | Ordered per-Hunt snapshot of versioned template content; public prompts separated from private validation/solution data |
| participant_progress | Per-participant/checkpoint state, assistance use and completion; one current state per scope |
| team_progress | Shared checkpoint state and contribution readiness; transitions validated by BE |
| submissions | Scoped request ID, actor/team, checkpoint, result and timestamp; retries return the same outcome |
| score_events | Server-calculated deltas, recipient, reason and unique event key; prevent duplicate awards |
| help_alerts | Hunt/participant, status, timestamps and optional consented location; acknowledge/resolve lifecycle |

This is a logical model, not an instruction to create every table upfront. Use foreign keys and composite constraints to prevent cross-Hunt/team references. Use JSONB for the fixed template's variable puzzle/configuration content, not for user identity, membership or the entire application state.

Seed Signal content from reviewed mock data through an explicit versioned seed step. Store no real participant accounts in fixtures. A published Hunt takes a snapshot so later template edits cannot alter a running game. Defer template-library tables and review workflows until Creator Studio needs them.

Define Hunt states once: draft -> ready -> in_progress -> completed, with explicit allowed pause/resume/cancel transitions. Treat countdown/delayed as display/scheduling conditions unless product behavior needs separate stored states. Validate dates, timezone, capacity and required content at publish/start; keep completed results stable.

### Scoring reconciliation before implementation

The current mission reducer starts at 500 and contains: -25 wrong verified attempt, -50 hint, -100 individual solution/skip, +100 unassisted first-attempt success at checkpoints 1–6, +50 team solve at checkpoints 1–6, +250 final puzzle, +100 completion, and -100 team solution reveal.

These are observed mock rules, not a fully approved multi-user scoring specification. Difficulty buttons advertise multipliers, but the reviewed reducer does not apply them.

Confirm:
- Which events belong to individuals versus teams, and how team totals are derived.
- Whether scores may become negative; how ties and partial completion are handled.
- Assistance/reveal rules, including the two-stage “find sabotage” challenge.
- Four-person contribution assignment and what happens when a member leaves.
- Whether different difficulty levels change content, points, both or neither.

For the pilot, propose preserving these base values at one fixed difficulty. Resolve aggregation before coding; do not multiply the single-browser mock score by team size. Keep one short BE scoring function and a small set of rule tests.

## 9. API additions by product slice

Extend current REST routes; the following new paths are proposals to finalize in Swagger with each slice.

| Slice | Contract to implement |
|---|---|
| Auth | Add logout; finalize refresh transport and user capability response |
| Organizer Hunt | List/create/get/update /api/hunts; lifecycle action endpoints; ownership enforced |
| Invitation | Resolve join code to a minimal public preview; join authenticated/guest identity; no roster leakage |
| Enrollment | Readiness/team assignment with capacity and repeat-join protection |
| Runtime | Authorized current checkpoint/state; answer submission; hint/reveal requests; team progress |
| Operations | Authorized monitor summary and lifecycle controls; create/list/acknowledge/resolve help alerts |
| Results | Final participant/team results from persisted events and completion state |

The BE derives user, team, points and next state from authentication and stored membership. The client must not set its own score, pass/fail result, privilege or completion.

Return only the content a participant is allowed to see at that stage. Answer keys, later contributions and solutions remain server-side until an authorized reveal. Authenticate every protected route and check object ownership/membership, not merely whether a token exists.

For mutations that users may retry, scope an idempotency key to the actor/action and persist the result transactionally. Do not automatically replay arbitrary writes from the FE client. A repeated submission must not award points or penalize twice. Handle simultaneous team submissions and organizer pause/start transitions consistently.

## 10. Revised delivery sequence

The old 7.1–7.43 list is retained as historical coverage, not as evidence that foundations are complete. Use the following milestones for new tasks. Each milestone can contain several small PRs.

| Milestone | Deliverable | Acceptance / dependency |
|---|---|---|
| M0 — Baseline and deployment | Confirm active FE/BE commits, BE database target, backup owner and auth contract | Source/deployment mismatch explained; first-pilot decisions recorded; no feature migration yet |
| M1 — Reliable backend foundation | Tracked baseline migrations, required config, DB readiness, pool shutdown, active auth fixes/tests | Fresh and existing-schema upgrade tests pass; current users/orgs preserved; depends on M0 |
| M2 — Real authenticated FE | Small API client, provider mounted at main.tsx, real role entry forms, restore/refresh/logout | Deployed FE-to-BE login survives reload, handles expiry and logs out; simulated admin 2FA not presented as real; depends on M1 |
| M3 — Capabilities and organizations | Minimal capability assignments, protected routes, organization ownership rules | Participant cannot manage another org/Hunt; organizer can access only authorized scope; depends on M2 |
| M4 — Create and publish Signal Hunt | Save organizer setup, fixed template snapshot, lifecycle and unique invitation code/link | Draft survives refresh; invalid publish rejected; a second browser opens the correct Hunt; depends on M3 |
| M5 — Join and team lobby | Persistent participant enrollment, four-person team assignment, readiness and start gate | Repeat joins do not duplicate enrollment; capacity races handled; all devices see same team/start state; depends on M4 |
| M6 — One real checkpoint | Individual answer, contribution, team solve, server scoring and resume | Four independent sessions complete a checkpoint; replay/concurrency cannot duplicate points; answers absent from public bundle/payloads; depends on M5 |
| M7 — Complete mission and results | Extend the same logic to all seven Signal stages, FinishPoint and final results | Same server results across devices; reconnect restores exact progress; completion awarded once; depends on M6 |
| M8 — Pilot operations | Monitor, pause/resume/end, help alerts, reliable status and organizer acknowledgement | No simulated alert delivery; display failure/offline clearly; named fallback contact; field route verified; depends on M5, complete before outdoor pilot |
| M9 — Supervised prototype pilot | Run the complete organizer/participant journey on target phones | Record defects, resolve blockers and compare outcomes with acceptance checklist; depends on M7 and M8 |
| M10 — Expand proven prototype | More templates/difficulty/formats, rewards, history, creator/admin systems | Implement only after core pilot is reliable; small prioritized slices |

Implement a thin monitor/help path as soon as enrollment exists; do not postpone operational support until after a field test. The first checkpoint validates the full technical pattern before expanding content.

### Definition of the authenticated milestone

A real application account—not the database login—authenticates through the deployed FE and BE; /me restores identity; token expiry is handled; protected requests reject unauthorized access; logout follows the documented revocation policy. No route in this journey relies on prefilled demo credentials or fake verification.

### Definition of the playable milestone

One organizer and four independently authenticated participant sessions can complete a created Signal Hunt. No invented teammates, timer-driven team readiness, browser-authoritative score or local-only completion remains in that path.

## 11. Coverage of the original roadmap

| Original area | Revised placement |
|---|---|
| PostgreSQL/auth/reconciliation, 7.1–7.5 | M0–M2; correct outdated completion claims |
| Roles and authorization, 7.6–7.7 | M3 |
| Organization reconciliation, 7.8 | Already PostgreSQL; validate/reuse, then extend permissions in M3 |
| Hunt domain/setup/link, 7.9–7.18 | M4 with only implemented pilot configuration |
| Join/lobby/mission/score/progress, 7.19–7.27 | M5–M7; model team collaboration explicitly |
| Live/monitor/help/supervisor, 7.28–7.31 | M8; scoped supervisor expansion later if pilot does not need it |
| Leaderboard/results/awards, 7.32–7.34 | Basic persisted results in M7; advanced awards in M10 |
| Passport/history/achievements, 7.35–7.37 | M10; reuse completion/score records |
| Rewards/inventory, 7.38–7.39 | M10; no financial/inventory engine in core pilot |
| Creator submission/admin approval/console, 7.40–7.43 | M10; preserve existing screen designs |
| Tedix linkage/SSO | M10 or a separately agreed earlier slice; verified upstream proof required |

Persistent help is required for field use. More elaborate administration, rewards and template governance remain planned, not discarded.

## 12. Simple code and developer handoff

“Short and simple” means few moving parts and readable changes, not compressed one-line JSX or missing checks.

- Extend the active FE router and existing BE route/model patterns.
- Keep SQL explicit and parameterized; use transactions only where several writes form one outcome.
- Prefer a few named helpers over generic repositories, base classes, event buses or configurable engines.
- Extract a component only when it makes the touched screen easier to understand or is genuinely reused.
- Do not reformat unrelated files or repair all old code in a feature PR.
- Reuse tests and API-client ideas from closed FE PR #3 selectively. Its cookie-session assumptions do not match current BE; do not merge it unchanged.
- Remove obsolete mock paths only when their replacement is complete and no demo depends on them.
- No new dependency without a concrete benefit that the existing stack cannot reasonably supply.

Add concise comments where the team needs intent or a business rule, for example:
- “Lock team progress so simultaneous solves award points once.”
- “Freeze the template here; later edits must not change an active Hunt.”
- “Keep this response free of answer keys.”
- “Support the previous role field until all API consumers use capabilities.”

Comment exported API contracts, non-obvious SQL constraints, scoring/assistance decisions and temporary compatibility boundaries. Avoid comments that restate obvious syntax or narrate the entire implementation. Use SQL comments for important schema rules and OpenAPI comments beside route definitions.

Each PR includes the concrete behavior changed, files/contract affected, migrations and their recovery approach, tests run, deployment verification, and remaining limitations.

## 13. Verification and completion criteria

Use existing FE build and BE build/Vitest commands. Add targeted tests for changed business behavior; do not create a broad test framework for this document.

Required scenario checks as features land:
- Unauthorized, wrong-role and cross-organization/Hunt requests are rejected.
- Malformed input returns controlled errors; case-insensitive duplicate accounts are handled.
- Refresh tokens cannot act as access tokens; concurrent refresh and logout behave as specified.
- Repeat joins/submissions/reveals/completion cannot duplicate effects.
- One participant cannot read another's unreleased contribution or private answer.
- Team readiness is based on real participants, not sample names or timeouts.
- Refresh, loss/recovery of network and access-token expiry preserve confirmed progress.
- Organizer start/pause/resume/end and participant submissions obey the same state machine.
- PWA caches static UI only as intended; authenticated API responses and old demo answer assets do not leak into the playable flow.
- Help requests display queued/failed/received/acknowledged states accurately.
- Results match server events and remain stable after completion.
- Narrow-screen input, readable errors and touch targets work on actual pilot phones.

No milestone is complete merely because a PR merged. Record deployment commit(s), migration version and the relevant browser/database verification. Keep a short list of known prototype limitations.

## 14. Immediate next task

**M0: confirm and record the deployment/authentication baseline.**

1. Identify why deployed FE differs from main: branch/build, hosting process, CDN or service-worker cache.
2. Confirm deployed BE revision and intended DB target; check its credential configuration following the password change.
3. Confirm backup/restore ownership and isolate test data.
4. Review the specific auth gaps above with the dev team and adopt one browser token contract.
5. Confirm the proposed first pilot: Signal, four-person teams, fixed difficulty/scoring, participant recovery and arrival policy.
6. Prepare the narrow M1 implementation task with migration, auth and deployment acceptance criteria.

These are open implementation prerequisites, not reasons to redo the UI or restart the backend. The current PostgreSQL models and copied mockup screens are the foundation to extend.

## Sources

- [Original architecture plan](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/a713fdb4c6ce2130d3f7ba499cac6b14bff2524d/docs/TedixHunt_Prototype_Architecture_Implementation_Plan.md)
- [FE active entry point](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/a713fdb4c6ce2130d3f7ba499cac6b14bff2524d/src/main.tsx), [router](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/a713fdb4c6ce2130d3f7ba499cac6b14bff2524d/src/routes/router.tsx), [mission reducer](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/a713fdb4c6ce2130d3f7ba499cac6b14bff2524d/src/hooks/useTemplateOneMission.ts)
- [BE schema](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/6dcc58338fba105e3885439ea9dcf921e7b3d925/src/db/schema.sql), [PostgreSQL bootstrap](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/6dcc58338fba105e3885439ea9dcf921e7b3d925/src/lib/postgres.ts), [auth routes](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/6dcc58338fba105e3885439ea9dcf921e7b3d925/src/routes/auth.ts), [auth middleware](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/6dcc58338fba105e3885439ea9dcf921e7b3d925/src/middleware/auth.ts)
- [BE application/CORS/routes](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/6dcc58338fba105e3885439ea9dcf921e7b3d925/src/app.ts), [environment](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/6dcc58338fba105e3885439ea9dcf921e7b3d925/src/config/environment.ts), [CI](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/6dcc58338fba105e3885439ea9dcf921e7b3d925/.github/workflows/backend.yml)
- [FE PR #3, closed unmerged](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/3); [BE PR #7](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/7); [BE PR #8](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/8)
- [Approved mockup source snapshot](https://github.com/tedixdev-arch/tedixhunt_student/tree/2495197e3a47ccb550a6677684b68f1bd03d91f0)
- [Deployed API documentation](https://tedixhuntbe.anainfo.ai/api/docs/); [deployed FE](https://tedixhunt.anainfo.ai/)
- Live PostgreSQL metadata inspection, 14 September 2026: read-only connection to tedix_hunt, information_schema, pg_constraint and pg_indexes. No application data exported.
