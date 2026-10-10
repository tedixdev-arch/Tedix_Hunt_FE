# Tedix Hunt - Prototype Architecture & Implementation Plan

Version 3.3 | Updated 10 October 2026

This revision preserves Phase A–N and the existing identity, credential and account-retirement architecture. The Creator phase is complete for its agreed baseline before the Mapbox evolution. Merged geographic authoring/preview capabilities are audited below; new Country/City and map-first setup work does not reopen that baseline.

Revision note (3.1): corrects B1.1 using merged FE #61 and G1 using merged FE #70; incorporates the finalized geographic architecture and subsequent Admin/Organizer corrections; integrates Mapbox M1–M6 into existing phases. Merged implementation is distinct from deployed E2E evidence; this revision does not claim a new deployment test.

Revision note (3.2): defines FinishPoint as a terminal checkpoint using the shared gameplay engine; clarifies geographic compatibility, Feature 6 authoring, backend-authoritative Hunt completion and the existing-phase implementation sequence. Documentation only: existing implementation statuses are preserved; no new implementation or deployed E2E verification is claimed.

Revision note (3.3): documentation only, before implementation prompts. Adds AI-assisted Country/City Templates (F7/G4) and Organizer map-first General Setup (D10); audits merged F4–F6/G3/D8 without claiming deployed E2E. Preserves Signal story, Personal/Team Challenges, the Creator/Admin approval chain and immutable snapshots. No application code, content generation, migrations or deployment are part of this revision.

The implementation strategy is:

Existing approved mockup
→ define the real domain model
→ persist it in PostgreSQL
→ secure it through the backend
→ connect the existing frontend screen
→ verify the deployed flow

The frontend is not being rebuilt. Existing useful mockup screens remain the UX reference and are progressively connected to real backend behavior.

---

## 1. Status legend

- ✅ Implemented — complete for the explicitly named layer or scope.
- 🟡 Pending verification / partial — implementation exists or important pieces are real, but the stated verification or scope is incomplete.
- 🟣 Prototype only — a visual/client prototype exists without the required authoritative integration.
- ⬜ Not started — no meaningful implementation yet.
- ⚠ Deferred operational item — important, but not the immediate product-development blocker.

A phase is complete only when its intended flow works through the deployed application, not merely because a table or screen exists.

Layer status must be stated separately when a feature crosses layers; a combined status is not a substitute for Backend/DB, Frontend, and deployed E2E status.

---

## 2. Project reference

- Mockup / UX: https://github.com/tedixdev-arch/tedixhunt_student
- Frontend repo: https://github.com/tedixdev-arch/Tedix_Hunt_FE
- Frontend dev: https://tedixhunt-fe-dev.anainfo.ai/
- Backend repo: https://github.com/tedixdev-arch/Tedix_Hunt_BE
- Backend Swagger: https://tedixhunt-be-dev.anainfo.ai/api/docs/#/
- PostgreSQL admin: https://tedixhunt-be-dev.anainfo.ai/pgadmin4/browser/

Target stack:

- React + TypeScript
- Node.js + TypeScript + Express
- PostgreSQL
- REST/JSON over HTTPS

The frontend never connects directly to PostgreSQL.

---

## 3. Product architecture

TedixHunt is one platform with four connected experiences:

Admin has full platform/domain operational authority and governs approval
↓
Creator builds reusable Hunt templates
↓
Organizer configures and publishes a Hunt
↓
Participant joins and plays

The target supply chain is:

Creator creates template
→ Admin reviews and approves
→ Organizer selects approved version
→ Hunt stores an immutable template snapshot
→ Organizer configures and publishes
→ Participant joins and plays
→ backend records progress, scoring and results
→ Organizer/Admin monitor
→ Passport/history/achievements preserve long-term value

This dependency chain drives implementation order.

---

## 4. UX premise

- Participant: mobile-first.
- Organizer: primarily desktop-first, still responsive.
- Creator: desktop-first.
- Admin: desktop-first.

Participant UX should prioritize fast interaction, large tap targets, reconnect/recovery and low interaction depth.

Back-office UX should prioritize dense information, filtering, validation, auditability and safe privileged actions.

---

## 5. Runtime architecture

### 5.1 Current development topology

Browser
→ https://tedixhunt-fe-dev.anainfo.ai
→ HTTPS + CORS
→ https://tedixhunt-be-dev.anainfo.ai
→ PostgreSQL

Frontend runtime configuration:

VITE_API_BASE_URL=https://tedixhunt-be-dev.anainfo.ai

Backend runtime configuration:

WEB_ORIGIN=https://tedixhunt-fe-dev.anainfo.ai

This direct FE→BE cross-origin model remains the development architecture for the prototype.

### 5.2 Intended production direction

Preferred production layout:

https://tedixhunt.com/
- / serves React
- /api/* is reverse-proxied by nginx to the Node API
- Node API talks to PostgreSQL

The browser would call relative /api paths. This normally removes the FE↔BE cross-origin requirement.

Do not introduce a separate API Gateway/BFF unless future scale or architecture actually requires it.

---

## 6. Core architecture principles

### PostgreSQL is authoritative

All new runtime state uses PostgreSQL. Do not introduce MongoDB/Mongoose for new functionality.

### One identity, global capabilities and Hunt contexts

One User identity and authenticated session may simultaneously have several platform capabilities and several Hunt-specific relationships.

Global platform capabilities are:

- organizer
- creator
- admin

For those capabilities, user_roles is authoritative. users.role remains transitional compatibility data only.

Credential establishment belongs to the **User identity**. Professional-role approval belongs to **authorization**. The concise governing rule is:

**SELF-REGISTRATION:** User chooses credentials → Admin approves capability.

**ADMIN PROVISIONING:** Admin creates identity/capability → user activates and establishes credentials.

For an existing password-backed identity applying for another professional capability, the platform reuses the identity, preserves its password, creates no duplicate User and changes no credentials; approval adds only the appropriate authoritative capability. A passwordless identity may establish credentials through self-registration, but those credentials still belong to that same identity.

The authoritative global professional capabilities in `user_roles` remain Organizer, Creator and Admin. Participant and Supervisor remain Hunt-context capabilities and must not be converted into global professional roles.

#### Professional lifecycle contract

**Self-registered Organizer — implemented:**

Organizer application
→ applicant provides profile/application information
→ applicant chooses and confirms a password
→ bcrypt password hash is stored on the one User identity
→ application remains Pending with no Organizer capability
→ Admin reviews and Approves or Rejects
→ approval grants authoritative Organizer capability and establishes Organization/membership
→ applicant can immediately use normal Organizer sign-in with the application password

Admin approval is an authorization decision, not a credential-establishment step. There is no application activation token, second password setup or application activation page. A future approval email may say, “Your Organizer account has been approved. You can now sign in.” Email delivery is future work and is not implemented.

**Self-registered Creator — implemented and deployed/verified (E17):**

Creator application
→ Creator provides identity data and chooses a password
→ request remains Pending with no Creator capability
→ Admin reviews and Approves or Rejects
→ approval grants authoritative Creator capability
→ Creator can immediately use normal Creator sign-in with the registration password

A self-registered Creator uses the original application password after approval and requires no post-approval activation token.

**Admin-provisioned professionals — implemented separately:**

- Organizer: Admin provisions identity/role/professional structure → one-time activation credential/link → user establishes password → normal Organizer sign-in. Existing FE route: `/organizer/activate-direct`; endpoint: `POST /api/auth/organizer/activate-direct`.
- Creator: Admin provisions Creator → one-time activation credential/link → user establishes password → normal Creator sign-in. Existing FE route: `/creator/activate`; endpoint: `POST /api/auth/creator/activate`.
- Admin: preserve the existing additional-Admin provisioning and activation architecture in E10; it is not redesigned by this lifecycle correction.

Participant and Supervisor are Hunt-contextual:

- Participant access to a Hunt is authoritative from hunt_participants.
- Additional Supervisor access is authoritative from hunt_roles with role = 'supervisor'; the target B6 rule also grants the Hunt's Organizer effective Supervisor access automatically.
- The same User may be Participant in one Hunt, Supervisor in another, both Participant and Supervisor in the same Hunt, and also hold Organizer/Creator/Admin global capabilities.
- Global Organizer capability alone grants no access to arbitrary Hunts. The responsible Organizer automatically has Supervisor powers for their own Hunt; implement this backend-enforced exception in B6 and expose it through the context read model.

The existing global participant role remains only as transitional compatibility data for current authentication/guards. New Hunt-context decisions must not infer Participant access from that global role.

### Account lifecycle is separate from platform-record lifecycle

**Account controls access.**

**Roles control capabilities.**

**Hunt-context records control contextual participation/authority.**

**Platform records survive account removal.**

**Provenance survives where required.**

`users` represents identity/account. `user_roles` represents authoritative global capabilities. `hunt_participants` and `hunt_roles` represent Hunt-context relationships and authority.

Hunts, Organizations, templates, results, awards, reviewed applications and future audit records belong to / are governed by the TedixHunt platform/domain. References such as `created_by`, `reviewed_by`, `supervised_by` and owner-like fields record relationships or provenance; they do not make a domain record's lifecycle depend on the continued existence of an active account. Admin has platform authority to manage platform records independently of whether the originating identity remains an active account.

When permanent account removal encounters durable platform history, the platform retains the User UUID only as required provenance and retires/anonymizes the account rather than deleting domain records or rejecting removal. The inert transitional `users.role` value is not rewritten to `participant`: retirement removes authoritative `user_roles`, creates neither Participant capability nor `hunt_participants`, and leaves Participant authority Hunt-contextual.

### Entry selection and workspace switching

Public entry and authenticated switching are separate concerns.

Public/default entry:
- `/` is Participant-first.
- `Join a Hunt` is the single public Participant entry and leads to `/join`.
- The homepage `Organizer · Creator · Admin →` link leads to `/login-workspace`.

Public professional entry:
- `/login-workspace` is a login/entry selector, not a context switcher.
- It shows only Organizer, Creator and Admin.
- It routes to the corresponding professional sign-in flows.
- Participant and Supervisor must never appear on this public professional selector.
- Legacy `/professional-access` redirects to `/login-workspace`.

Authenticated workspace switching:
- `/workspaces` is authenticated-only.
- Unauthenticated access redirects to `/login-workspace`.
- Organizer, Creator and Admin are global workspaces/capabilities and appear only when the authenticated identity actually has them.
- Participant and Supervisor entries are Hunt-specific contexts and will be populated from authenticated Hunt-context data.
- Switching workspace/context reuses the same authenticated session; it is navigation, not re-authentication.
- Professional headers expose an explicit `Switch Workspace: <Current> →` action leading to `/workspaces`.

The frontend must not flatten contextual Hunt access into permanent global roles, and it must not use `/workspaces` as a public login selector.

### Security is backend-enforced

Frontend guards and hidden buttons are UX only. Protected actions are authorized by the backend.

### Authoritative layer responsibilities

**Backend / DB owns:** the domain model, PostgreSQL persistence, migrations, business rules, permissions and authorization, lifecycle transitions, API contracts, immutable-version authority, validation, and runtime truth.

**Frontend owns:** UX, forms and editors, API consumption, client working state, loading/error/retry behavior, presentation, navigation, and responsive behavior.

Frontend guards and UI state are never authorization authority. When a feature introduces or changes domain behavior, its Backend/DB contract comes before Frontend integration; deployed E2E verification follows both.

### Admin user-management safety

Users & Roles is not only a provisioning surface. The target Admin capability also includes controlled user administration.

Admin may manage other user identities through backend-authorized actions, including:
- edit safe account/profile fields
- grant/remove global professional capabilities where allowed
- block/unblock accounts
- initiate password reset
- request permanent account removal

Blocking is the normal reversible operational action and must revoke active refresh sessions.

Password administration follows the platform authority model:
- Admin may directly replace the password of any non-Admin identity
- Admin must never be able to read or recover any user's existing password or password hash
- replacing a password stores only a new bcrypt hash and immediately revokes all refresh sessions for the target identity
- password replacement preserves roles, Hunt contexts, account status and business records
- a blocked identity remains blocked after its password is replaced
- an Admin may change their own password through the normal authenticated own-password flow
- an Admin must never replace the password of another identity that holds the authoritative Admin capability, even if that identity also holds Organizer or Creator capabilities

The backend transactionally chooses the successful permanent-removal outcome. An identity with no durable platform-history dependencies is hard-deleted together with disposable account/onboarding artifacts. An identity with durable platform-history dependencies is retired/anonymized: `account_status = retired`, authentication is permanently rejected, password credentials are removed, refresh sessions are revoked, activation/provisioning credentials are invalidated, authoritative `user_roles` are removed, personal account data is anonymized, and email becomes `NULL` so the original address can be reused. The User UUID and platform/domain records remain only where durable history requires them. Normal role, password, status and provisioning flows cannot revive a retired identity.

Both `deleted` and `retired` are successful permanent account-removal outcomes. Platform history is a reason to retire the identity, not to reject removal. Blocking remains a reversible operational suspension; retirement is permanent account removal. No restore/unretire behavior is part of this architecture.

Last-active-Admin protection remains mandatory for role removal, blocking and permanent account removal.

### Preserve the mockup deliberately

Do not rewrite screens that already express the approved experience. Replace simulated behavior one feature at a time.

### Real persistence

No production-like path should depend on fake login, local-only Hunt state, fake scoring, simulated teammates or browser-only results.

### Immutable published context

A Hunt keeps the exact approved template version/content it was created from. Later template edits must not change an already published or active Hunt.

### Small vertical slices

Each change should be narrowly scoped, reviewable, tested, deployable and verifiable.

---

### Shared geographic architecture and V1 boundary

Mapbox is the shared geographic presentation, search and navigation provider behind a provider-neutral TedixMap boundary. PostgreSQL/TedixHunt remains authoritative for content, rules, permissions, visibility, arrival, progression, scores and runtime state. Mapbox is not the game database.

TedixMap grows only as needed: Mapbox adapter/base, search, checkpoint/FinishPoint/route/radius layers, player/team layers, GPS controller and camera utilities. HuntMapEditor, HuntMapPreview, HuntGameMap and LiveHuntMap reuse those foundations. Creator, Operations and Participant are three experiences; Admin/Organizer previews reuse the same platform.

Preserve `configuration.normalCheckpointCount`, `configuration.checkpointPositions[]` and `configuration.finishPoint` as the compatible geographic persistence contract. Extend gameplay/navigation/visibility or later game-object fields only through specific BE contracts. The terminal gameplay role does not require an immediate database migration or rewriting immutable Template versions or Hunt snapshots. Do not introduce a giant generic mapObjects schema. Provider route estimates are advisory and cannot establish route safety or arrival.

V1 excludes AR, background geofencing, permanent GPS history, complex GIS tooling and unnecessary 3D. Exact arrival mathematics remains a Participant-runtime design/real-phone validation task; 5 m is a discovery target, not a promise of device precision.

### Shared checkpoint gameplay and terminal role

FinishPoint is a regular gameplay checkpoint with the special role `terminal`. Normal and terminal checkpoints support the same geography and discovery radius, navigation, GPS arrival/discovery, Personal Challenges, Team Challenges, scoring and penalties, and checkpoint completion.

Conceptual gameplay model (not a replacement persistence schema):

```text
Checkpoint
  - Geography
  - Navigation
  - Personal Challenge
  - Team Challenge
  - Scoring
  - Completion
  - Role: normal | terminal
```

Use ONE checkpoint gameplay engine. FinishPoint reuses navigation logic, the Arrival Engine, Personal/Team Challenge logic, scoring, and progression/completion rules. Do not build a second FinishPoint gameplay engine or challenge system. The role changes what happens after checkpoint completion, not how the checkpoint is played: normal completion advances to the next checkpoint; terminal completion triggers backend-authoritative Hunt completion only after all required FinishPoint activities are successfully resolved. Reaching FinishPoint coordinates alone never completes the Hunt.

## 7. Current PostgreSQL baseline

Tracked migrations currently reach the implemented Creator/Template baseline:

- 001–014 — existing platform, Hunt, professional activation, and account-status foundation
- 015 — Creator application persistence/lifecycle
- 016 — Hunt Template identities + immutable versions
- 017 — canonical Signal v1 persistence
- 018 — `submitted_version` / exact submitted artifact
- 019 — approved Creator submitted-version invariant
- 020 — `changes_requested` submitted-version invariant

Migration 014 adds the retired account state; retired identities use `NULL` email. Migrations 015–020 add the Creator application and persisted Template lifecycle described below.

Current important tables/data areas include:

- users and user_roles
- organizations and organization_members
- organizer_applications and creator applications
- hunts, hunt_participants, teams, team_members, and hunt_roles
- hunt_templates and hunt_template_versions
- immutable Template version content stored as JSONB
- exact submitted-version pins and Creator/platform provenance
- Hunt Template key/version/content snapshots
- hunt_leaderboard_rewards and hunt_special_awards
- refresh_tokens and professional_activation_tokens

Creator Templates and Template Versions are implemented data, not future/missing areas. The current design does not claim separate checkpoint or route tables: geographic configuration and other Template content live inside immutable Template-version JSONB.

Major future data areas still missing include participant enrollment workflow state, team readiness/start gates, checkpoint attempts, answers/hints/solutions, runtime progress and score events, help/PANIC incidents, final results and award winners, Passport/history, achievements, physical reward inventory, custom Hunt requests, audit events, platform settings, and notifications.

## 8. Current FE baseline

The FE preserves the approved UX while progressively connecting it to authoritative backend behavior.

Already-real frontend foundations include:

- shared API client, token/session handling, refresh/retry, AuthProvider, and role-based guards
- real Participant, Creator, Organizer, and Admin authentication
- Admin account security and Users & Roles operations
- Organizer and Creator application/provisioning/activation experiences, including deployed/verified Creator self-registration
- canonical professional workspace selection
- organizations, Hunt, options, rewards, and access-code API integration
- Hunt draft create/reopen/edit and publish flow
- Organizer Quick Setup backed by `GET /api/hunt-templates`, with loading/error/empty handling
- Creator Studio geographic editing with Leaflet + React-Leaflet and OpenStreetMap prototype tiles
- Creator Studio real persistence/submission integration from FE PR #68

Admin Template Review is connected to the real list/detail/approve/request-changes APIs (merged FE PR #70). It reviews the exact submitted version. Geographic Mapbox preview is a new G3 enhancement.

The active application uses `src/main.tsx` and `src/routes/router.tsx`.

## 9. Current BE baseline

Current main backend domains include authentication and Hunt contexts; Admin users and professional applications; organizations; Creator Templates; Admin Template review; approved Hunt Templates; Hunt options/access/rewards; and Hunts.

Implemented Creator/Template backend foundation includes:

- Creator self-registration/application approval lifecycle
- `hunt_templates` identity and `hunt_template_versions` immutable-version persistence
- canonical Signal v1 as persisted platform Template content
- Creator owner-scoped list/read/create/version/submit APIs
- exact `submitted_version` review, approval, and request-changes lifecycle
- approved DB-backed Template catalog
- approved Template resolution and immutable Hunt key/version/content snapshots
- geographic configuration validation and submission completeness

Participant runtime, live operations, and long-term systems remain to be built.

# 10. Implementation roadmap

## Phase A — Platform foundation

Status: 🟡 Mostly complete

### A1. Deployment topology and verification
Status: ✅ Complete enough for prototype

Done:
- FE/BE development URLs established
- GitHub Actions deployment
- FE version/public bundle verification
- BE readiness endpoint
- direct FE→BE CORS architecture confirmed

Remaining:
- ⚠ formal rollback/release notes
- ⚠ documented server inventory
- ⚠ final backup/restore verification

### A2. PostgreSQL migration foundation
Status: ✅ Complete

- migration runner/history
- ordered migrations
- drift checking
- DB readiness
- clean shutdown

### A3. User normalization and compatibility
Status: ✅ Complete

- email normalization
- duplicate handling
- public serializer
- legacy role compatibility

### A4. Core authentication
Status: ✅ Complete

- JWT access
- opaque refresh tokens
- rotation
- logout
- guest sessions
- participant login/register
- creator login
- organizer login
- admin login

### A5. Frontend API/session layer
Status: ✅ Complete

### A6. Existing real login flows
Status: ✅ Complete

Complete:
- participant
- creator
- organizer
- admin

Admin authentication uses the real backend session flow. Fake Admin 2FA is no longer part of the active prototype login path.

---

## Phase B — Identity, organizations and authorization

Status: 🟡 Mostly complete

### B1. Multi-role identity
Status: ✅ Complete for global capabilities

Authoritative global capabilities are Organizer, Creator and Admin. The global Participant role remains compatibility-only for the current prototype and must not be used as proof of access to a specific Hunt.

### B1.1 Workspace/context model
Status: ✅ Implemented for the existing workspace/context contract

Backend / DB: ✅ Context read model implemented

Frontend: ✅ Context wiring implemented; canonical response parsing fixed in merged FE PR #61

Deployed E2E: record deployment evidence separately; no fresh test claimed here.

Implemented foundation:
- FE PR #43 introduced the canonical /workspaces selector and same-session workspace switching for global capabilities.
- FE PR #45 separated public professional entry from authenticated switching:
  - /login-workspace is the public Organizer/Creator/Admin entry selector
  - /workspaces is authenticated-only
  - the generic Participant card was removed from /workspaces
  - professional headers expose Switch Workspace: <Current> →
  - /professional-access redirects to /login-workspace
- BE PR #35 added GET /api/me/hunt-contexts.
- The API returns one row per Hunt with huntId, huntName, huntStatus, participant and supervisor.
- Participant context is derived only from hunt_participants.
- Existing Supervisor context derives from hunt_roles(role='supervisor'); B6 adds automatic supervision for the responsible Organizer.
- One Hunt may expose both Participant and Supervisor access for the same User.

Implemented: /workspaces consumes GET /api/me/hunt-contexts using the canonical { contexts: [] } envelope and renders Hunt-specific choices. Empty contexts and malformed responses are handled.

Future: evolve contextual targets as runtime routes mature and extend effective Supervisor context through B6. This is new scope, not unfinished B1.1 wiring.

### B2. Backend role authorization
Status: ✅ Complete

### B3. Frontend role guards
Status: ✅ Complete for current prototype

Real:
- participant
- organizer
- creator
- admin

Admin:
- authoritative `user.roles` check merged in FE PR #28
- all current `/admin/*` routes are protected by `RequireAdmin`

### B4. Organizations and membership
Status: ✅ Complete for current prototype

Current `organizations.owner_id` participates in operational authority while the referenced owner is a normal active identity. If that identity is retired:
- the Organization is not deleted
- `owner_id` continues to reference the retired UUID as preserved provenance
- the retired identity cannot authenticate and therefore has no operational authority
- authoritative Admin capability provides the narrow platform-management fallback
- Admin does not become or replace `owner_id` merely because the owner retired

**Future architecture — Organization stewardship/ownership transfer:** the current `owner_id` mixes operational ownership with provenance. Future Organization stewardship should separate historical creator/origin attribution from current operational stewardship/ownership. The schema and transfer API are intentionally not designed in this plan.

### B5. Hunt-context roles
Status: 🟡 Context read model complete / runtime assignment-use pending

Participant membership is represented by hunt_participants.

Additional Supervisor assignment is represented by hunt_roles(role='supervisor'). Automatic Organizer supervision is the new B6 target.

GET /api/me/hunt-contexts is the authenticated read model used to expose those contextual relationships to workspace switching without converting them into global roles.

Supervisor assignment/use during live Hunt operations is still pending.

### B6. Effective Hunt authority — Mapbox M3 domain prerequisite
Status: ⬜ Not started
Backend / DB first; Frontend follows in D9.
- [ ] Grant the responsible Organizer effective Supervisor capabilities automatically for their own Hunt. Decide against the existing model whether to derive this or maintain an invariant row; do not require a separate identity.
- [ ] Keep additional Supervisors Hunt-scoped with operational powers only; no Organizer configuration, Template edits or checkpoint suspension by default.
- [ ] Permit Admin full platform/domain operations across Hunts, Templates, checkpoints and runtime objects, including edit, override, reassignment and suspension, subject only to security/technical invariants.
- [ ] Preserve authenticated active-account requirements, secret protection, last-active-Admin safeguards, referential integrity and immutable provenance. Admin corrections create explicit versions/overrides; they do not silently rewrite historical artifacts.
- [ ] Extend authorization tests and GET /api/me/hunt-contexts consistently. Test own-Hunt access, unrelated-Hunt denial, removed assignment denial and Admin authority.
- [ ] Define assignment list/add/remove APIs and revocation semantics before D9. Organizer's automatic effective supervision cannot be accidentally removed.

---

## Phase C — Hunt domain foundation

Status: ✅ Complete for current setup scope

### C1. Core Hunt records
Status: ✅ Complete

### C2. Hunt lifecycle
Status: ✅ Complete

Supported states:
- draft
- published
- active
- paused
- cancelled
- finished

### C3. Organizer Hunt list
Status: ✅ Complete

### C4. Publish-readiness authority
Status: ✅ Complete

Backend validates persisted configuration before publication.

---

## Phase D — Organizer Hunt setup

Status: ✅ Existing setup baseline and D8 implementation complete; D9/D10 remain planned; D8 deployed E2E unverified

### D1. General Setup
Status: ✅ Existing baseline complete; future map-first ordering is D10, not yet implemented

### D2. Template selection + snapshot
Status: ✅ Complete

### D3. Supported pilot options
Status: ✅ Complete

### D4. Rewards configuration
Status: ✅ Complete

Persisted:
- leaderboard rewards
- predefined Special Awards
- provider
- physical/virtual distinction
- quantities

Rewards are optional for publish readiness.

### D5. Review
Status: ✅ Complete

### D6. Publish
Status: ✅ Complete

### D7. Access code/link
Status: ✅ Complete

Important boundary:

Phase D completes Hunt configuration/publication, not the full Organizer product.

Still pending:
- live monitor
- supervisors
- PANIC/help
- custom Hunt requests
- live operational controls
- final results/reward awarding

---

### D8. Organizer geographic preview — Mapbox M2
Status: ✅ FE implementation complete; deployed authenticated/Mapbox E2E unverified
- [x] Pre-creation approved-version geography uses authenticated `GET /api/hunt-templates/:key/geography` (merged BE #63). Independent inspection compares exact catalog key/version before rendering; mismatches require explicit catalog refresh/reinspection, never silent version substitution.
- [x] Loading, retry, 401/404/409, missing/partial legacy geography, rapid switching, stale responses and close/reopen are covered; close/switch/unmount cancel requests and clean up Mapbox resources.
- [x] Reuse HuntMapPreview from G3 for the exact persisted Hunt snapshot after creation, through existing Hunt GET/save responses; never substitute a newer catalog version.
- [x] Show normal checkpoints, separate FinishPoint, radii and optional explicit walking estimates for valid snapshots; handle absent/invalid legacy geography explicitly.
- [x] Keep fixed Template geography read-only in inspection. Portable/repositionable Templates require a separate future product rule.
Validation: `npm test` passed (30 Node test files; 8 Vitest files / 138 tests), `npm run typecheck`, `npm run build` and `git diff --check` passed. Build retains the existing large-chunk warning. Existing Admin G3 and Organizer Quick Setup regressions pass. Deployed E2E verification remains separate from implementation completion.
See [Organizer geographic preview](Organizer_Geographic_Preview.md) for authority sources and verification limits.

#### Personal Hunt — deferred
Organizer may eventually create a Hunt without selecting an approved Template. Reuse the existing checkpoint engine, FinishPoint, navigation and rewards; no second gameplay engine. Participant runtime must consume the persisted Hunt configuration without depending on its Template origin. Organizer-created content must pass backend publish-readiness validation. This is a future architecture note only; no Personal Hunt implementation is included.

### D9. Allocate Supervisors — Mapbox M3 frontend
Status: ⬜ Not started; depends on B6 backend deployment
- [ ] Add Allocate Supervisors after Hunt configuration and before Review/Publish readiness.
- [ ] List Organizer by default as Organizer · Supervisor · Automatic; allow allocation/removal of additional eligible identities through B6 APIs.
- [ ] Show authoritative supervision readiness; do not require an extra Supervisor or create a fake professional Supervisor account.
- [ ] E2E: Organizer appears automatically, allocated Supervisor gains only that Hunt's operational access, removal revokes access, self-removal cannot remove automatic supervision.

### D10. Organizer map-first General Setup — planned workstream
Status: ⬜ Not started; depends on F7/G4 location, review and approved-catalog contracts.

Target order within General Setup:

1. Country.
2. City, restricted to the selected Country.
3. Approved Template, restricted to that Country/City and exact approved version.
4. Automatic read-only real Mapbox route preview immediately on Template selection.
5. Hunt details.
6. Participants/access.
7. Experience defaults.

- [ ] Reuse D8 approved geography, HuntMapPreview and TedixMap. Selection automatically fetches and displays valid saved geography; no extra Inspect click. This is a deliberate future change from merged FE #84's independent, explicitly opened inspection.
- [ ] Show saved ordered normal checkpoints and terminal FinishPoint, names/radii and a clearly labelled route overview. A straight-line connection is not a walkable route. Mapbox walking geometry/distance/time remains a provider estimate; define request/cost/cancellation behavior in the scoped FE step and never invent metrics on failure.
- [ ] Changing Country clears City/Template/preview; changing City clears Template/preview. Cancel stale requests; reject key/version mismatches and require fresh approval selection. Loading, no approved Templates, withdrawn approval, incomplete legacy geography and provider failure need explicit states; never show the previous route as the new choice.
- [ ] Preview is visual confirmation, not a save/create/publish action. Keep explicit persistence and backend publish-readiness. After creation, read only the exact saved Hunt snapshot; newer catalog content must not replace it.
- [ ] For fixed Templates, remove the simulated checkpoint editor from the **future Organizer UX plan**: no dragging, coordinate/radius/gameplay edits, fake placement or local geography overrides. Authoring stays with Creator and Admin governance. This documentation change removes no existing implementation.
- [ ] Preserve Hunt details, access/Participants, supported Experience defaults, rewards, Review and Publish. Editable defaults cannot override immutable Template content or backend rules.
- [ ] E2E: Country → City → approved Template automatically shows its actual route; switch locations rapidly; handle missing data; save/reopen and verify exact snapshot stability after later Template approval changes.

## Phase E — Professional account lifecycle

Status: ✅ Implemented and deployed/verified for E1–E17

The professional-account lifecycle is completed foundation; it is no longer the immediate implementation phase.

### E1. Registered Organizer application
Status: ✅ Complete

The applicant provides profile/application information, chooses and confirms a password, and submits the application. The backend stores only a bcrypt password hash on the one User identity. The application remains Pending and the identity has no Organizer authorization while Pending.

### E2. Organizer login
Status: ✅ Complete

### E3. Organizer approval backend
Status: ✅ Complete

Admin approval transaction:
- reuses the one User identity and preserves its established password
- grants authoritative Organizer capability in `user_roles`
- creates Organization
- adds membership
- creates no application activation token or credential handoff

### E4. Organizer credential and authorization boundary
Status: ✅ Complete

- credentials are established on the User identity during self-registration
- approval grants authorization without replacing credentials
- existing password-backed identities retain their password and all existing roles
- passwordless identities may establish credentials on that same identity during self-registration
- no duplicate User, post-approval password setup, activation token or activation expiry is created for an Organizer application

### E5. Real Admin backend login
Status: ✅ Complete

### E6. Bootstrap first Admin
Status: ✅ Complete

No public Admin registration.

Implemented trusted server-side bootstrap:
- creates the first Admin safely against PostgreSQL
- normalizes email
- stores only a bcrypt password hash
- assigns authoritative `admin` in `user_roles`
- preserves existing user passwords and roles when promoting an existing password-backed identity
- rejects passwordless existing identities rather than silently setting credentials
- serializes the first-Admin safety check
- refuses additional Admin creation by default
- supports `--allow-additional-admin` only as an explicit recovery/maintenance escape hatch
- supports `TEDIX_BOOTSTRAP_ADMIN_PASSWORD` so production operators do not need to place the password in normal CLI arguments

The bootstrap is an operational first/recovery mechanism, not the normal product workflow for creating Admin accounts.

### E7. Real Admin frontend login
Status: ✅ Complete

Implemented:
- `POST /api/auth/admin/login`
- shared access/refresh-token session handling
- real AuthProvider Admin login
- successful login enters `/admin`
- fake Continue to 2FA behavior removed
- legacy `/admin/verify` redirects to Admin sign-in
- no fake 2FA is represented as real security

### E8. Protect Admin routes
Status: ✅ Complete

Merged in FE PR #28:
- `canAccessAdmin()` uses authoritative `user.roles`
- authenticated Admins can enter the Admin Console
- unauthenticated users are redirected to `/admin/sign-in`
- authenticated non-Admins are denied
- all current `/admin/*` routes use the Admin guard
- existing Admin sessions opening the sign-in page are redirected to `/admin`
- Admin logout returns to Admin sign-in
- misleading `2FA verified` UI is removed

### E9. Admin account security
Status: ✅ Complete

The first bootstrapped Admin can maintain their own credentials without server intervention.

#### E9.1 Change own password
Status: ✅ Complete

Implemented shared authenticated endpoint:

`POST /api/auth/change-password`

Behavior:
- authenticated non-guest account
- verifies the current password with bcrypt
- validates the new password policy
- stores only a new bcrypt hash
- never returns password material
- scoped to the current authenticated identity

This is a shared account-security capability and is not Admin-specific.

#### E9.2 Session revocation after password change
Status: ✅ Complete

A successful password change:
- revokes the user's existing refresh sessions atomically with the password update
- does not issue replacement tokens
- requires a fresh login afterward

#### E9.3 Account-security frontend
Status: ✅ Complete

Implemented Admin Account Security UI:
- Current password
- New password
- Confirm new password
- safe validation/error handling
- local session is cleared after success
- redirect to Admin sign-in for fresh authentication

Password management remains an authentication/account-security function, not arbitrary Users & Roles editing.

### E10. Additional Admin provisioning
Status: ✅ Complete

Normal additional-Admin creation must move into the product. Do not use the bootstrap command as the routine Admin-management workflow.

Target flow:

Existing Admin
→ invite/provision Admin
→ existing identity is reused or a new credential-less identity is created
→ authoritative `admin` role is assigned
→ new identity receives one-time activation when a password is required
→ new Admin chooses their own password
→ Admin login works

#### E10.1 Admin list
Status: ✅ Complete

Admin can list current Admin identities and their activation/account state through the real backend and Admin UI.

#### E10.2 Grant Admin to an existing user
Status: ✅ Complete

If the normalized email already belongs to a password-backed User:
- existing password is preserved
- all existing roles are preserved
- `admin` is added idempotently

#### E10.3 Invite/provision a new Admin
Status: ✅ Complete

If no User exists:
- a credential-less professional identity is created
- `admin` is assigned authoritatively
- a hashed, one-time, expiring activation token is created
- plaintext activation token is returned only once for the current prototype handoff
- the inviting Admin never chooses the new Admin's permanent password

#### E10.4 New Admin activation
Status: ✅ Complete

The invited Admin follows the public activation link, chooses their own password and receives the normal authenticated session on success.

#### E10.5 Last-Admin protection
Status: ✅ Complete for current backend capability

Backend role-removal logic protects the final active Admin using a serialized check.

The platform must not allow removal/deactivation of the final active Admin or accidental self-lockout when only one active Admin capability remains.

There is no Admin-removal UI yet; full role-management UI belongs to Phase L.

#### E10.6 Two-Admin lifecycle verification
Status: ✅ Complete

Verified on the deployed development environment:
First Admin login
→ provision second Admin
→ second Admin activation
→ second Admin login
→ both Admin identities appear active
→ existing roles/credentials remain preserved by the implementation
→ last-Admin protection remains enforced in backend logic/tests

The bootstrap `--allow-additional-admin` path remains recovery/maintenance only.

### E11. Organizer Applications Admin UI
Status: ✅ Complete

Implemented:
- pending/approved/rejected/all filtering
- application detail
- approve
- reject
- safe already-decided handling
- approval completes without an activation-token handoff
- pending-attention indicator in Admin navigation

The Organizer Applications UI is backed by the real application/approval API.

### E12. Organizer self-registration credential lifecycle
Status: ✅ Implemented

- Organizer chooses and confirms a password during application.
- Password is securely established on the one User identity.
- Application remains Pending with no Organizer authorization.
- Admin approval grants the authoritative Organizer capability and establishes Organization/membership.
- No application activation token or second password setup exists.
- After approval, the applicant uses normal Organizer sign-in with the original application password.

Implementation references:
- BE PR #42 — “Add self-registration credentials to Organizer applications” (backend merge status cannot be verified from this frontend repository).
- FE PR #55 — “Correct self-registered Organizer credential lifecycle” (confirmed merged in this repository).

### E13. Verify Organizer self-registration onboarding end-to-end
Status: ✅ Implemented and deployed/verified

Verified chain:
Apply with password
→ Pending
→ Admin sees application
→ Admin Approves
→ Organizer capability granted
→ Organization/membership present
→ applicant signs in normally with the original application password
→ Organizer workspace accessible

### E14. Creator provisioning
Status: ✅ Implemented

The separate Admin-provisioned Creator flow remains:
Admin provisions a passwordless Creator
→ one-time activation
→ Creator establishes a password
→ normal sign-in.

Existing password-backed identities are reused without changing their credentials, and authoritative `creator` capability is added in `user_roles`.

### E15. Creator activation/account lifecycle
Status: ✅ Implemented

For Admin-provisioned Creators only, the one-time expiring `creator_activation` token lets a new/passwordless identity establish credentials. This activation lifecycle is not used by self-registered Creator applicants.

### E16. Admin-provisioned Creator onboarding verification
Status: ✅ Implemented and deployed/verified

Verified chain:
Admin provisions Creator
→ activation if required
→ Creator session/login
→ authoritative Creator access
→ Creator Studio.

### E17. Creator self-registration/application lifecycle
Status: ✅ Implemented and deployed/verified

### Backend / DB
Status: ✅ Implemented

Responsibilities / implemented work:
- accepts Creator identity/application data and password and stores credentials on the one User identity
- keeps the application Pending without Creator capability
- makes Admin approval/rejection an authorization decision
- grants authoritative Creator capability on approval without changing the original password
- creates no post-approval activation token

### Frontend
Status: ✅ Implemented

Responsibilities / implemented work:
- Creator application and password-entry UX
- Admin application review controls
- pending state and normal sign-in UX after approval

### Deployed E2E verification
Status: ✅ Verified

Acceptance flow:
Creator application
→ identity data + password
→ Pending without Creator capability
→ Admin Approve
→ Creator capability active
→ normal sign-in using original password.

This credential lifecycle remains distinct from E14–E16 Admin provisioning.

## Phase F — Creator Template system

Status: ✅ Creator baseline and F4–F6 implementation merged; geographic deployed E2E remains unverified; F7 is planned

### F1. Authoritative Template hierarchy

1. **Creator Framework / Component Catalog** — the general authoring system defining what Creators can build. It is not copied wholesale into every Template version.
2. **Competition Template** — a concrete reusable implementation/configuration produced with the Creator Framework. A Template version records **what was built**.
3. **Hunt instance** — an Organizer instantiates an approved Template and configures permitted Hunt-level variables.
4. **Hunt runtime/results** — Participant progress, answers, scores, awards, and history.

**Governing rule:** Creator Framework defines what can be built. Template version records what was built. Hunt records what was instantiated. Adding Creator Studio options later must not mutate existing Template versions.

Canonical Signal v1 is persisted platform Template content and is one concrete Competition Template implementation; it is not the Creator Framework. Legacy `eventData` is not canonical Template authority. This plan intentionally does not duplicate the complete Signal dataset.

### F2. Creator Template persistence and immutable versioning

### Backend / DB
Status: ✅ Implemented

Responsibilities / implemented work:
- `hunt_templates` identity and `hunt_template_versions` immutable versions
- Creator/platform provenance and Creator ownership
- draft/submitted/changes_requested/approved lifecycle
- immutable version numbering
- Creator owner-scoped list/read
- create Creator Template with v1 and create the next immutable draft version
- exact `submitted_version` pin and submission of the exact latest version
- Admin read of the exact submitted artifact, approval, and request changes
- approved Creator catalog resolves the exact pinned submitted version
- Hunt Template selection resolves an approved persisted Template
- Hunt stores the exact Template key/version/content snapshot

Template-version content is immutable JSONB. As an accepted current limitation, rows are treated as immutable through model/API behavior; the schema does not currently use a database trigger that prohibits direct `UPDATE` of version content.

### Frontend
Status: ✅ Implemented (FE PR #68)

Responsibilities / implemented work:
- consumes `GET /api/creator/templates`, `GET /api/creator/templates/:key`, `POST /api/creator/templates`, `POST /api/creator/templates/:key/versions`, and `POST /api/creator/templates/:key/submit`
- lists Creator-owned Templates and reopens persisted drafts
- hydrates Creator Studio from backend content
- uses **Complete Hunt Features** as the explicit persistence boundary
- first persistence creates the Template and immutable v1
- changed persisted content creates the next immutable version; unchanged content creates no duplicate
- stabilizes the Template key after creation
- submits the real persisted version and shows success only after backend success
- treats backend status/version/content as authoritative
- preserves BE #59 geographic configuration through persistence
- does not manufacture verification or safety state from persisted coordinates

Revision/resubmission after `changes_requested` is not yet implemented in Creator Studio and is not claimed here.

### Deployed E2E verification
Status: 🟡 Deployed evidence to record; FE integration is implemented in merged FE #70 and is no longer a blocker

Acceptance flow:
Creator persists and submits an exact immutable Template version → Admin reviews the same artifact → approval exposes that pinned version to Organizer setup → Hunt stores its exact snapshot.

### F3. Geographic checkpoint architecture

Normal checkpoints and FinishPoint remain separately configured and persisted geographically, while sharing one checkpoint gameplay model. Template content preserves `configuration.normalCheckpointCount`, `configuration.checkpointPositions[]` and `configuration.finishPoint`. Each normal checkpoint position contains `checkpointNumber`, `name`, `latitude`, `longitude`, and `radiusMeters`.

Contract rules:
- `normalCheckpointCount` is 1..20
- `checkpointPositions` represents only normal checkpoints
- normal checkpoint geography remains in Creator Studio Feature 2; FinishPoint geography remains in Feature 6 and is not N+1 in `checkpointPositions`
- separate geographic persistence does not imply separate gameplay: FinishPoint has the terminal checkpoint role and the same applicable capabilities
- preserve compatibility without an immediate database migration or rewriting existing immutable Template versions/snapshots
- checkpoint numbers are unique and within 1..N
- latitude is -90..90 and longitude is -180..180
- Current merged contract: integer `radiusMeters` is 5..500 (BE #60/#61); FE #76/#77 default new positions to 5 m and preserve existing stored values
- name is non-empty and at most 100 characters
- incomplete geography is allowed while drafting
- submission requires complete N-position geography for Templates using this contract
- legacy persisted content without geographic fields remains compatible
- old mock-map x/y percentages are never converted to latitude/longitude
- Signal coordinates are never invented

### Backend / DB
Status: ✅ Implemented

Responsibilities / implemented work:
- validates the geographic contract
- persists it inside immutable Template-version JSONB
- validates submission completeness
- carries the exact content through approval and the Hunt snapshot

### Frontend
Status: ✅ Implemented

Responsibilities / implemented work:
- Shared TedixMap/Mapbox Creator editor (FE #74–#77), superseding the earlier Leaflet/React-Leaflet prototype
- real pan/zoom, map-click placement/repositioning, and radius visualization
- Creator verification and safety-checklist UX
- no invented coordinates

Coordinate persistence does not establish checkpoint verification or route-safety approval. Those facts are not currently persisted, so the FE intentionally reopens persisted coordinates as unverified and safety unchecked.

---

### F4. Radius contract compatibility — Mapbox M1a
Status: ✅ Backend implementation merged in [BE #60](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/60); deployed E2E unverified.
- [x] Accept 5..500 m; preserve historical radii, immutable versions, snapshots and legacy content; update Swagger without a migration.
- [x] PR reports 613 tests with PostgreSQL, none skipped, including 5 m lifecycle and 30 m historical preservation.
- [ ] Record deployed contract/lifecycle evidence. F4 is no longer the next implementation step.

### F5. Shared TedixMap and Creator Hunt Map Editor — Mapbox M1b
Status: ✅ FE implementation merged in [#74](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/74), [#75](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/75), [#76](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/76); deployed Mapbox E2E unverified.
- [x] Shared Mapbox foundation, temporary location/POI search, camera-only search selection and explicit checkpoint placement.
- [x] Numbered markers, discovery circles, 5 m new-position default, saved-value preservation and provider lifecycle/error handling.
- [ ] Verify live token/search/placement/save/reopen/submit and mobile behavior. Mocked provider tests do not establish live behavior.

### F6. FinishPoint configuration, route validation and Participant Preview — Mapbox M1c
Status: ✅ Scoped BE/FE authoring and preview implementation merged; deployed E2E unverified.
- [x] FinishPoint geography: [BE #61](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/61), [FE #77](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/77). Preserve separate configuration.finishPoint; no N+1 in checkpointPositions.
- [x] Shared terminal gameplay contract: [BE #62](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/62), [FE #79](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/79). Existing Personal/Team/navigation vocabulary; no new challenge engine.
- [x] Explicit walking-route inspection: [FE #80](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/80). CP1 → CPn → FinishPoint, provider geometry/estimates, cancellation and errors; no safety certification.
- [x] Creator Participant simulation: [FE #81](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/81). Preserves unsaved work and one mounted map; manual arrival/activity resolution with no real GPS, scoring, answers or gameplay mutations.
- [ ] Deployed search → placement → save/reopen → route inspection → preview → submit verification, including immutable history.
- [ ] Authoritative visibility, navigation, Arrival Engine, actual challenge interactions and completion remain Phase I. The Creator simulation does not complete I12 or the planned popup UX.
Validation limits: BE #62 reported 21 database tests skipped; later BE #63 reports a full PostgreSQL suite of 712 passing tests, zero skipped. Neither is deployed E2E evidence. FE provider tests are mocked; FE #81's mobile smoke used the missing-token fallback. Temporary custom challenge controls in FE #79 are not persisted authoring support.

### F7. AI-assisted Templates per Country/City — planned workstream
Status: ⬜ Not started. Reuse the existing Creator draft/version/submission architecture; AI is assistance, not an approver or a new platform role.

- [ ] Begin with Signal: preserve its story, Personal Challenges and Team Challenges while proposing real location-specific routes. Preserve the seven-stop journey (six normal checkpoints plus terminal FinishPoint); do not silently create seven normal checkpoints plus an eighth finish or rewrite canonical Signal v1.
- [ ] Proposed content target: three distinct Templates/routes per city. This is a curation target, not a hard database cardinality, approval requirement, automated generation quota or reason to publish weak routes.
- [ ] AI proposes location candidates, route order, narrative fit and draft content with sources, uncertainties and review notes. Candidate coordinates must be checked against real places; generated claims are not verified facts.
- [ ] A responsible Creator explicitly reviews/edits and saves proposals as ordinary Creator-owned drafts. No direct AI publication, approval, bypass of submitted_version, or writes to approved versions/Hunt snapshots.
- [ ] Human safety/accessibility review covers every stop AND connecting walk: pedestrian/legal access, crossings/traffic, opening hours/closures, terrain/steps, step-free alternatives and audience suitability. Record evidence, reviewer, date, limitations and unresolved issues against the exact version; use local/on-site checking where desk evidence is insufficient. AI/Mapbox cannot certify safety or accessibility.
- [ ] BE contract first: define canonical Country/City identity, city-country validation, draft location metadata, AI provenance and version-bound review evidence/status; define required submission/approval gates and compatibility for legacy content. Field names/endpoints and any tracked migrations are design outputs of the later contract step, not invented APIs in this plan.
- [ ] Preserve configuration.normalCheckpointCount, checkpointPositions[] and finishPoint, immutable versioning, progressive draft authoring and existing capability enforcement. Existing approved content/snapshots are not backfilled or relabelled silently.
- [ ] Creator FE follows the contract: Country/City, AI-assisted draft intake/editing, clear unverified proposals, human review evidence and normal save/submit. Provider integration, if needed, stays behind backend authorization; no provider secret in FE.
- [ ] Acceptance: one city pilot through Creator draft → human review → exact submission → Admin approval → location-filtered catalog → Organizer snapshot; reject missing required evidence/invalid location at the backend and preserve historical content.

## Phase G — Admin Template governance and approved authority

Status: ✅ Backend/DB, Admin FE review, Organizer integration and G3 preview implemented; G4 location/review evolution planned

### G1. Admin Template review

### Backend / DB
Status: ✅ Implemented

Responsibilities / implemented work:
- submitted Creator Template review list/detail
- review of the exact `submitted_version`
- approval and request changes
- approved catalog pins the exact submitted version

### Frontend
Status: ✅ Implemented in merged FE PR #70

Responsibilities / implemented work:
- real review list/detail for the exact submittedVersion
- real approve and request-changes API calls
- backend-authoritative decisions with loading/error/retry/empty states and duplicate-action protection

### Deployed E2E verification
Status: 🟡 Deployed evidence to record; FE integration is implemented in merged FE #70 and is no longer a blocker

Acceptance flow:
Admin receives the submitted artifact → reviews that exact version → approval makes that pinned version available in the approved catalog.

### G2. Organizer approved Template authority

### Backend / DB
Status: ✅ Implemented

Responsibilities / implemented work:
- `GET /api/hunt-templates` returns approved persisted Templates
- approved Creator Templates resolve the exact `submitted_version`
- Hunt draft creation resolves an approved Template
- Hunt stores an immutable key/version/content snapshot
- existing Hunt snapshots remain stable

### Frontend
Status: ✅ Implemented

Responsibilities / implemented work:
- Organizer Quick Setup fetches authoritative `GET /api/hunt-templates`
- selectable Templates come from the backend
- only the Template key is sent during Hunt creation/update as appropriate
- the FE does not manufacture Template snapshots
- missing/loading/error/empty states are handled

### Deployed E2E verification
Status: 🟡 Deployed evidence to record; FE integration is implemented in merged FE #70 and is no longer a blocker

Acceptance flow:
Approved exact version appears in Quick Setup → Organizer selects its key → backend resolves and snapshots the approved key/version/content.

### G3. Shared Admin geographic preview — Mapbox M2
Status: ✅ FE implementation merged in [FE #82](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/82); deployed authenticated/Mapbox E2E unverified.
- [x] Read-only shared HuntMapPreview of exact submitted immutable content, saved checkpoints/FinishPoint/radii and explicit walking estimates.
- [x] Reused in D8, with loading/error/legacy-data handling and resource cleanup; inspection does not approve, edit or mutate content.
This read-only review mode does not restrict Admin platform authority; any explicit edit/override must preserve versions and provenance.

- [ ] Record deployed exact-version review → approve → Organizer selection verification and real Mapbox/mobile checks.

### G4. Country/City Template governance — planned extension
Status: ⬜ Not started; paired with F7 contract work.
- [ ] Extend existing Admin review to inspect Country/City, AI provenance, proposed route and version-bound human safety/accessibility evidence.
- [ ] Admin retains explicit approve/request-changes authority for the exact submitted version. Human review is a prerequisite for approval, not replaced by an AI score or map rendering.
- [ ] Backend catalog filtering exposes only approved Templates for the requested Country/City; approval withdrawal and version changes remain authoritative. Reuse BE #63 geography projection and its key/version checks.
- [ ] Define explicit legacy/unclassified behavior before FE filtering; do not infer a city from a display name or silently classify historical Signal content. Existing Hunt snapshots remain usable and unchanged.
- [ ] Keep review evidence scoped to the reviewed version; edited routes require renewed review before approval. Existing G1/G2 lifecycle and Creator/Admin permissions remain intact.

## Phase H — Participant enrollment and team formation

Status: 🟡 Partial

Backend / DB: 🟡 Structural foundation only; enrollment/team runtime pending

Frontend: ⬜ Runtime integration not started

### H1. Resolve Hunt access code
Status: ✅ Complete

### H2. Participant enrollment
Status: ⬜ Not started

Requirements:
- real participant/guest identity
- save Hunt membership
- idempotent repeated join
- capacity enforcement

### H3. Enrollment availability rules
Status: ⬜ Not started

Handle:
- unknown code
- closed enrollment
- cancelled Hunt
- finished Hunt
- full capacity

### H4. Team creation/assignment
Status: ⬜ Not started

### H5. Team lobby
Status: ⬜ Not started

### H6. Readiness
Status: ⬜ Not started

### H7. Start gate
Status: ⬜ Not started

### H8. Session recovery/reconnect
Status: ⬜ Not started

---

## Phase I — Checkpoint runtime

Status: 🟣 Prototype only

Implement one complete checkpoint before scaling to the full mission.

### I1. Checkpoint runtime model
Status: ⬜ Not started

Implement one shared checkpoint gameplay engine with `normal | terminal` roles. Separate geographic persistence must map into that shared runtime without duplicating navigation, arrival, Personal/Team Challenges, scoring or completion logic. BE owns required-activity validation and authoritative progression/completion; FE consumes that state.

### I2. Participant progress state
Status: ⬜ Not started

### I3. Answer submission
Status: ⬜ Not started

### I4. Backend validation
Status: ⬜ Not started

### I5. Hint use
Status: ⬜ Not started

### I6. Personal/team contribution
Status: ⬜ Not started

Replace simulated teammates/readiness.

### I7. Score events
Status: ⬜ Not started

Use auditable score events rather than opaque browser-only totals.

### I8. Idempotency
Status: ⬜ Not started

Prevent duplicate scoring on retries/double taps/concurrent team actions.

### I9. Restore progress
Status: ⬜ Not started

### I10. Extend to all Signal checkpoints
Status: ⬜ Not started

Only after one checkpoint works across independent sessions.

### I11. FinishPoint terminal checkpoint completion
Status: ⬜ Not started

- [ ] Extend the proven shared checkpoint runtime to FinishPoint, including navigation, GPS discovery, required Personal/Team Challenges, scoring and penalties. Reuse existing challenge types and the I1–I9/I12 engine; do not implement an independent final-puzzle engine.
- [ ] Normal checkpoint completion advances to the next checkpoint. FinishPoint completion triggers Hunt completion only after BE confirms all required terminal activities are successfully resolved; GPS arrival alone never finishes the Hunt.
- [ ] Prove idempotent terminal completion, concurrent Personal/Team Challenge resolution and reconnect/recovery against authoritative BE state before Phase K results consume completion.

Intended Participant sequence:

Checkpoint 1 → required activities → Checkpoint 2 → required activities → … → FinishPoint → required Personal/Team Challenges → backend-authoritative Hunt completion.

The terminal suspension/fairness policy remains explicitly unresolved under I13; this completion rule does not decide how a suspended FinishPoint is resolved.

---

### I12. Participant geographic runtime — Mapbox M4
Status: ⬜ Not started; depends on H enrollment/start/recovery and B6
Backend / DB first, then separate FE integration slices.
- [ ] Define authorized objective projections, discovery and progression APIs, navigation rules, FinishPoint unlock and idempotent transitions using the shared checkpoint model. FinishPoint uses the same navigation and Arrival Engine; arrival/discovery is distinct from checkpoint completion and never independently completes the Hunt.
- [ ] Build one persistent Hunt Game Map per active Participant Hunt session. Persistent means the map remains mounted during normal in-Hunt navigation; it does not mean the map is always visible. Challenges, Score / Results, Mission History, Help and other Hunt interfaces may cover or hide the map without destroying it. When the map becomes visible again, preserve its camera, zoom, location, objective, navigation and Hunt context as appropriate. Refresh, close/reopen or session recovery may create a new map instance and must restore authoritative Hunt state from the backend.
- [ ] Preserve Signal story and Personal/Team Challenges over the persistent route-map background. Use popups/overlays for story, checkpoint activities, scores and help without remounting the map; support focus return, keyboard access, mobile sheets and reduced motion. Show the seven-stop journey only as authorized by runtime visibility; do not expose locked coordinates/answers. Basic game-state map styling belongs here; advanced geographic mechanics remain I14.
- [ ] Browser Geolocation API supplies latitude, longitude, accuracy and timestamp; TedixHunt interprets readings and Mapbox renders them. Handle denied/unavailable/stale location and reconnect.
- [ ] Design and field-test the accuracy-aware Arrival Engine using target radius, distance, accuracy, timestamps and a bounded recent-reading window. Output not-arrived/approaching/arrived; do not use distance <= 5 m as the complete algorithm or claim spoof-proof browser GPS.
- [ ] Define poor-accuracy recovery/fallback and backend validation before enabling arrival awards; do not reward repeated GPS events twice.
- [ ] Implement Map, Compass, Signal Strength, Landmark, Decoded Route and Hidden navigation progressively under explicit domain rules. Hidden/locked targets must not leak through payloads, routes or client layers; direction/distance hints must be deliberately authorized.
- [ ] Derive visual hidden/locked/available/approaching/discovered/active/completed states from authoritative rules without persisting every presentation state.
- [ ] Validate one checkpoint with real phones and independent sessions, uncertain GPS, denial, refresh and network loss before I10 expands the mission.

### I13. Runtime checkpoint suspension — prerequisite for Mapbox M5
Status: ⬜ Not started
Backend / DB first, then Participant handling and J9 controls in separate FE steps.
- [ ] Add Hunt/runtime-level active/suspended state referencing snapshot checkpoint identity, with actor, time and reason; never mutate approved Template content or the immutable Hunt snapshot.
- [ ] Authorize Admin and the responsible Organizer only by default. Additional Supervisors may report/request suspension; later delegation requires an explicit new rule.
- [ ] Atomically bypass suspended normal checkpoints without penalty or blocking, including current and future objectives; preserve completed history and prior earned scores. Terminal behavior requires the unresolved policy below and must not infer Hunt completion from this bypass rule.
- [ ] Define score eligibility, timers and all-normal-checkpoints-suspended behavior before coding. Apply the same checkpoint suspension/fairness model when considering terminal checkpoints. Unresolved policy: how a suspended FinishPoint's required activities, bypass, scoring/timers and Hunt completion interact. Resolve explicitly before terminal suspension implementation; this revision introduces no new terminal suspension policy. Do not silently mark bypassed checkpoints as solved or invent completion rewards.
- [ ] Test concurrent answer/suspension requests, retries, stale clients and reconnect; refresh authoritative targets across sessions. Any reactivation rule must prevent retroactive penalties or progression rollback.

### I14. Geographic gamification — Mapbox M6
Status: ⬜ Deferred until core gameplay and J9 operate reliably
- [ ] Define Shadow/Event, Discovery/Easter Egg, Zone and Secret Location rules individually: lifecycle, visibility, trigger, eligibility, scoring and persistence.
- [ ] For each mechanic, ship BE contract/security first and then shared map presentation; add focused domain fields only when rules are clear.
- [ ] Tie reveal/pulse/completion effects to actual Hunt events with reduced-motion support. No giant generic mapObjects schema in advance.
- [ ] Test hidden-data protection and idempotent awards. Geographic Zones do not imply background geofencing.

## Phase J — Live Hunt operations

Status: 🟣 Prototype only

### J1. Shared Hunt live state
Status: ⬜ Not started

Participant and Organizer read the same start/pause/resume/cancel/finish state.

### J2. Real Organizer Monitor
Status: ⬜ Not started

Replace mock:
- teams
- scores
- checkpoint position/progress
- status

### J3. Live lifecycle controls
Status: ⬜ Not started

### J4. Supervisor operational access
Status: ⬜ Not started

Assignment is implemented once through B6/D9 (M3). Reuse that authority for live operations; Organizer is automatically Supervisor and additional Supervisors receive only the operational subset.

### J5. Help request
Status: ⬜ Not started

### J6. PANIC / safety incident
Status: ⬜ Not started

Persist:
- team
- Hunt step
- optional location with permission
- incident state

### J7. Acknowledge/resolve
Status: ⬜ Not started

### J8. Network-loss fallback
Status: ⬜ Not started

---

### J9. Shared Live Hunt Operations Map — Mapbox M5
Status: ⬜ Not started; follows I12–I13
- [ ] BE: authorize Hunt-scoped live state and minimal location updates from active Participants; validate timestamps/payloads and throttle updates.
- [ ] Decide a short latest-location TTL, consent/permission UX, audience and deletion rules before collecting live GPS. Expire on TTL/Hunt end; avoid permanent trails, analytics copies and raw GPS logs.
- [ ] Use a bounded recent-reading buffer for arrival only where needed. Any incident-location evidence has a separate explicit minimum retention policy.
- [ ] FE: Organizer/Supervisor share LiveHuntMap with checkpoints, FinishPoint, progress, last permitted location/age/accuracy, HELP/PANIC and operational state.
- [ ] Mark stale/missing positions accurately; never imply continuous real-time tracking or safety coverage when disconnected.
- [ ] Add Organizer/Admin suspension controls backed by I13; additional Supervisors get report/request controls only.
- [ ] E2E: phone → browser → TedixHunt backend → authorized operations view; unrelated users denied, removal revokes access, expired location disappears, suspension bypass and HELP/PANIC work.

## Phase K — Results and rewards runtime

Status: 🟡 Reward configuration complete / runtime pending

### K1. Final score aggregation
Status: ⬜ Not started

### K2. Leaderboard
Status: ⬜ Not started

### K3. Final results
Status: ⬜ Not started

### K4. Special Award calculation
Status: ⬜ Not started

### K5. Reward assignment
Status: ⬜ Not started

Distinguish:
- configured reward
- calculated winner
- actually granted reward

### K6. Physical-prize eligibility
Status: ⬜ Not started

---

## Phase L — Admin operational systems

Status: 🟣 Prototype only

Implement each subsystem only when the underlying domain exists.

### L1. Users & Roles
Status: 🟡 Core implementation complete / deployed end-to-end verification pending

Phase E now implements the minimum real Users & Roles provisioning surface needed to operate the prototype:
- list/filter Admin, Organizer and Creator identities
- direct provision/grant Admin capability
- direct provision/grant Organizer capability
- direct provision/grant Creator capability
- role-specific activation/account state
- Organizer Organization requirement
- last-Admin protection in backend logic

Participant and Supervisor are intentionally absent from global professional provisioning because they are Hunt-contextual.

FE PR #52 connects the core user-management actions below to backend-authorized endpoints. Deployed end-to-end verification and the future audit subsystem remain outstanding.

#### L1.1 View and edit user
Status: ✅ Implemented

Admin can inspect an identity and edit safe account/profile fields.

The implemented editable scope is explicit and conservative:
- name
- email only with uniqueness/normalization safeguards
- professional organization/membership data where the domain rules permit it

Do not expose password hashes, tokens or internal authentication secrets.

#### L1.2 Global role/capability administration
Status: ✅ Implemented

Admin can:
- grant Organizer capability
- grant Creator capability
- grant Admin capability
- remove Organizer capability
- remove Creator capability
- remove Admin capability

`user_roles` remains authoritative.

Participant and Supervisor continue to use Hunt-context records rather than global role administration.

Removing/blocking/permanently removing the last active Admin must be rejected.

#### L1.3 Block / unblock account
Status: ✅ Implemented

Blocking is the primary reversible operational control.

Implemented behavior:
- account has an authoritative `active | blocked | retired` status
- `active` is a normal account
- `blocked` is a reversible operational suspension
- `retired` is a permanently removed/anonymized account retained only for provenance/history
- blocked user cannot authenticate or refresh sessions
- blocking immediately revokes existing refresh sessions
- unblock restores eligibility to authenticate but does not recreate revoked sessions
- historical Hunts, templates, memberships, results and audit references remain intact

Retired identities cannot be unblocked, restored or unretired through normal account-management flows.

#### L1.4 Admin password authority
Status: ✅ Implemented

Admin is the higher platform authority for non-Admin identities and may directly replace their passwords from Users & Roles.

Target flow:

Admin selects Set password
→ Admin enters and confirms a new password
→ backend verifies the caller's authoritative Admin capability
→ backend verifies the target identity does not hold authoritative Admin capability
→ backend validates and bcrypt-hashes the new password
→ backend atomically replaces the target password hash and revokes all target refresh sessions
→ target must authenticate again using the new password

Architecture rules:
- Admin can replace passwords for Participant, Supervisor, Organizer and Creator identities
- Admin cannot read or recover the current password or password hash
- Admin cannot replace the password of another identity that holds the authoritative Admin capability
- the protection follows the identity's Admin capability, regardless of which workspace or other capabilities that identity also has
- an Admin changes their own password only through the existing authenticated own-password flow
- direct Admin password replacement is identity-level and does not alter roles/capabilities
- account status is preserved; a blocked target remains blocked
- organizations, memberships, Hunt contexts, templates, results and other business history are preserved
- successful replacement revokes all refresh sessions for the target identity
- no reset token or reset-link handoff is required for this Admin action

This direct password-replacement authority is distinct from any future public self-service “forgot password” recovery flow.

#### L1.5 Permanent account removal
Status: ✅ Implemented

Admin selects Remove account
→ backend validates self-removal and last-active-Admin safety invariants
→ backend checks durable platform references within the transaction
→ an unused identity hard-deletes with disposable account/onboarding artifacts
OR
→ a history-bearing identity retires/anonymizes while retaining its UUID as required provenance
→ platform/domain records survive without destructive cascading
→ FE reports `Account removed.`

The backend is authoritative and the entire decision is transactional. Both hard deletion and retirement are successful permanent-removal outcomes; the FE deliberately does not expose that implementation distinction. Platform history is a reason to **RETIRE** the identity, not a reason to reject account removal.

Safety rules remain:
- an Admin cannot remove their own account through this flow
- the last active Admin cannot be removed
- referential integrity and platform history must be preserved
- no account removal may destructively cascade Hunts, Organizations, templates, results, awards, reviewed applications, audit records or other platform/domain records

For retirement, `users.role` remains inert transitional compatibility data and must not be rewritten to `participant`. Retirement removes authoritative `user_roles`, does not create Participant capability or `hunt_participants`, and leaves Participant authority Hunt-contextual.

#### L1.6 Auditability
Status: ⬜ Not started

Privileged user-management actions should become audit events when the audit subsystem exists:
- profile edits
- role grants/removals
- block/unblock
- Admin password replacement
- account removal request
- hard-delete vs retirement outcome
- privileged retirement/anonymization event

The current prototype may implement the user-management behavior before the full audit-log UI, but the API/domain design must not make future auditability difficult.

### L2. Hunt oversight
Status: ⬜ Not started

### L3. Safety Alerts
Status: ⬜ Not started

Depends on Phase J help/PANIC.

### L4. Physical Reward Inventory
Status: 🟣 Prototype only

Need:
- stock
- reservation
- hidden prize identity
- fulfillment
- quantity controls

### L5. Platform Settings
Status: ⬜ Not started

Only true global configuration belongs here.

### L6. Audit Log
Status: ⬜ Not started

Audit important privileged actions:
- role changes
- approvals
- template decisions
- inventory changes
- safety actions
- sensitive settings

---

## Phase M — Participant long-term systems

Status: 🟣 Prototype only

### M1. Hunt Passport
Status: ⬜ Not started

### M2. Mission History
Status: ⬜ Not started

### M3. Achievements
Status: ⬜ Not started

### M4. Collectibles / virtual rewards
Status: ⬜ Not started

### M5. Long-term participant profile
Status: ⬜ Not started

All long-term records derive from real completed Hunt/results data.

---

## Phase N — Custom Hunt request workflow

Status: 🟣 Prototype only

Mockup flow:

Organizer
→ Ask for a new Hunt
→ Admin review
→ Creator assignment
→ Creator builds template
→ Admin approves
→ Organizer receives it

Implement after Creator/Admin template lifecycle exists.

### N1. Persist custom request
Status: ⬜ Not started

### N2. Admin triage
Status: ⬜ Not started

### N3. Assign Creator
Status: ⬜ Not started

### N4. Creator builds requested template
Status: ⬜ Not started

### N5. Admin review
Status: ⬜ Not started

### N6. Return approved template to Organizer
Status: ⬜ Not started

---

## 11. Independent Organizer — unresolved architecture

Status: ⚠ Explicitly unresolved

The FE currently has prototype behavior using ?mode=independent, allowing selected setup routes to bypass normal registered Organizer flow.

This must not silently become permanent production architecture.

Possible future models:
- temporary local-only Hunt
- guest/restricted Organizer identity
- lightweight account
- require registration before publish
- another approved product rule

Until decided:
- keep it isolated
- do not expand privileges
- do not weaken backend authorization

---

## 12. Professional provisioning policy

For the current prototype:

- Organizer and Creator self-registration/application establish credentials before review; approval grants capability only
- Organizer / Creator / Admin are global professional capabilities in authoritative `user_roles`
- Participant and Supervisor remain Hunt-contextual and are not provisioned from Users & Roles
- Admin can directly provision Organizer and Creator through a distinct activation-based lifecycle
- existing identities keep their password and existing roles
- Admin-provisioned new/passwordless professional identities receive one-time activation rather than an Admin-chosen password
- guest identities cannot be promoted directly

Direct Organizer provisioning does not create an `organizer_applications` row. It creates/reuses the Organization and membership transactionally and uses `/organizer/activate-direct` when credentials must be established.

The two Creator credential lifecycles must remain separate:

**Self-registered Creator:** application → identity data + password → Pending without Creator capability → Admin Approve → Creator capability active → normal sign-in with the original password. There is no post-approval activation token.

**Admin-provisioned Creator:** Admin provisions a passwordless Creator → one-time activation → Creator establishes password → normal sign-in.

## 13. Admin bootstrap policy

There must never be a public Register as Admin flow.

The first Admin account is created through a trusted operational mechanism.

Bootstrap is for the first Admin and recovery/maintenance only.

Normal additional Admin creation is handled through the product flow:

Existing Admin
→ provision/invite Admin
→ activation when required
→ normal Admin login

The bootstrap `--allow-additional-admin` option remains an explicit recovery/maintenance escape hatch, not the routine Admin-management workflow.

---

## 14. Template lifecycle contract

Implemented Creator/Admin Template lifecycle:

Template Draft
→ exact Submitted Version pinned
→ Admin reviews that exact version
→ Approved Version
→ Organizer selects the approved persisted version
→ Hunt stores an immutable key/version/content snapshot.

Request changes returns the submitted Template to `changes_requested` while preserving the reviewed artifact and submitted-version invariant. Creator Studio revision/resubmission UI is not yet claimed as implemented.

Never let an edited Template retroactively change a published/active Hunt.

## 15. Participant runtime implementation rule

Do not implement all seven checkpoints at once.

First prove one checkpoint end-to-end with:
- multiple real participant sessions
- saved state
- backend answer validation
- team contribution
- backend scoring
- reconnect/recovery
- Organizer visibility

Then extend the pattern.

Extend it to FinishPoint through the same engine and the terminal role in I11/I12. Configuration work in F6 must not pull the entire Participant runtime forward. Arrival alone is never the Hunt-completion condition.

---

## 16. Rewards architecture boundary

Already implemented:

Organizer configures possible rewards.

Not yet implemented:

Gameplay produces results
→ winners calculated
→ Special Awards calculated
→ reward assignment
→ physical fulfillment

Reward configuration is not reward awarding.

---

## 17. Operational / technical debt

### ⚠ Backup and restore

Confirm:
- regular PostgreSQL backup
- tested restore
- owner
- retention

### ⚠ Server access

Preferred governance:
- read-only SSH diagnostic access may be useful
- dev team remains server-change checkpoint
- infrastructure changes documented
- GitHub remains source of truth for application code

### ⚠ Legacy schema duplication

Backend still contains transitional schema definitions outside migrations. Migration history remains authoritative. Avoid expanding duplicated schema ownership.

### ⚠ Dependency/security maintenance

Address dependency/audit issues in dedicated maintenance work, not inside unrelated product PRs.

### ⚠ Real 2FA

Current Admin mockup contains fake 2FA. Do not represent it as real security.

For prototype:
- remove/bypass fake 2FA cleanly
- implement real 2FA later as a dedicated security feature if required

---

## 18. Standard implementation workflow

ChatGPT Web / Architect
→ define ONE implementation step
→ exact Codex task for ONE repository
→ Codex implements + tests
→ Draft PR
→ Architect reviews diff/tests/acceptance criteria
→ User merges
→ GitHub Actions
→ deploy
→ run new migration if required
→ restart/reload if required
→ verify deployed behavior
→ NEXT STEP

User controls final merge.

Never make untracked manual DB schema changes.

---

## 19. Definition of a good implementation step

Every step should:

- solve one clear product/architecture objective
- fit current repository structure
- preserve approved UX where practical
- define API contract before FE wiring
- use tracked DB migration for schema changes
- enforce permissions in backend
- include tests
- avoid unrelated refactors
- be deployable
- have an explicit deployed verification action

Codex guardrail:

Implement only this step. Keep the existing structure, avoid unnecessary abstractions, and use short, readable code. Add comments for business rules, permission checks and important database behavior. Do not refactor unrelated modules.

---

# 20. Implementation order and checklist

Completed foundation: A–E baseline, B1.1 contextual workspace integration, F Creator baseline, G1 real Admin review and G2 approved catalog/snapshot integration. FE #61 and #70 correct stale v3.0 status. Preserve those accepted baselines.

## 20.1 Merged implementation audit — 10 October 2026

Audit source: GitHub PR merge metadata and PR scope/validation reports, checked against FE main `e3a6668bde6e55a8e7392d608a413a1586067a72` (includes #84). “Merged” below is repository evidence, not a deployed E2E result.

| Plan scope | Merged evidence | Remaining verification / boundary |
| --- | --- | --- |
| F4, radius 5..500 | [BE #60](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/60) | Deployed contract/lifecycle evidence; no repeat implementation prompt |
| F5, Mapbox foundation/search/placement | [FE #74](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/74), [#75](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/75), [#76](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/76) | Live provider/mobile and persisted authoring E2E |
| F6, FinishPoint geography | [BE #61](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/61), [FE #77](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/77) | Deployed save/reopen/submit |
| F6, terminal gameplay authoring | [BE #62](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/62), [FE #79](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/79) | Runtime/completion still Phase I; prototype custom controls not persisted |
| F6, walking route + Creator preview | [FE #80](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/80), [#81](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/81) | Explicit provider estimates + local simulation; no real arrival/scoring or safety certification |
| G3, Admin map preview | [FE #82](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/82) | Exact-version deployed review/approval + real provider verification |
| D8, saved snapshot + approved Template preview | [FE #83](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/83), [BE #63](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/63), [FE #84](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/84) | Explicit Inspect action is implemented; Country/City and automatic selection preview are future D10 |

All listed PRs have `merged = true`; their descriptions may retain historical “draft only” instructions. Those descriptions are scope/test evidence, while merge metadata establishes status. No new deployment or browser E2E was run for this documentation change. A deployed Swagger response, passing CI or a successful deployment job alone does not verify the user journey.

Step 7A is implemented (FE #70), not the next task. Preserve Step 7 supply-chain E2E as a release gate: Creator persists/submits → Admin reviews exact version/approves → catalog resolves it → Organizer selects → exact Hunt snapshot persists. Record environment, deployed FE/BE revisions, date, cases and results; do not relabel absent evidence as passed.

## 20.2 Staged workstreams before Participant runtime

The following are planned slices, not implementation prompts or authorization to implement now. Keep one repository and one reviewable step per Draft PR; split further where necessary.

1. [ ] **BE contract — F7/G4:** settle Country/City identity and catalog filtering, draft metadata/provenance, version-bound human review evidence and approval gates, legacy compatibility and exact-version behavior. Reuse existing Creator/Admin lifecycle and BE #63 geography; add tracked migrations only if the agreed schema requires them. Validate authorization, invalid locations, approval withdrawal and snapshot preservation.
2. [ ] **Creator FE — F7:** integrate Country/City and AI-assisted proposals into ordinary drafts; retain story/Personal/Team content and explicit human review. AI generation/intake must follow the agreed BE contract. Pilot one reviewed city route before working toward three distinct approved routes per city.
3. [ ] **Admin FE — G4:** expose required location/provenance/review evidence in existing exact-version review, using the established approve/request-changes workflow.
4. [ ] **Organizer FE — D10:** Country → City → approved Template → automatic read-only real Mapbox preview → Hunt details → Participants/access → Experience defaults. Replace the future fixed-Template simulated-editor UX with read-only inspection; preserve explicit saves and snapshots.
5. [ ] **Deployed supply-chain verification:** use reviewed real geography and record evidence through AI-assisted draft → human review → Admin approval → automatic Organizer preview → saved Hunt snapshot. Verify empty/error/stale-version/provider failures and immutable history; merge does not satisfy this gate.

## 20.3 Remaining existing-phase sequence

Mapbox aliases M1–M6 are not Phase M Passport/history item IDs. M1/F4–F6 and M2/G3/D8 implementation are merged as audited above; their deployed verification remains outstanding.

1. [ ] M3 / B6 then D9 — BE effective authority/assignment APIs, then Allocate Supervisors FE.
2. [ ] H / Step 8 — Participant enrollment/team formation/start/recovery; Step 7 deployed verification gates this phase.
3. [ ] M4 / I1–I9 + I12 — one authoritative checkpoint first, with persistent map background, popup/overlay interactions, Signal story and Personal/Team Challenges, GPS/navigation/Arrival Engine. BE contracts before FE; Creator simulation is not runtime completion.
4. [ ] I13 — BE suspension/bypass rules, then Participant handling; prove before live suspension controls.
5. [ ] I10–I11 — expand proven shared gameplay to Signal's seven stops, including terminal FinishPoint; BE completes Hunt only after required terminal activities resolve. Resolve terminal suspension/fairness policy first.
6. [ ] M5 / J — backend live state/minimal GPS, then shared Operations Map, suspension controls and HELP/PANIC.
7. [ ] K — results and reward awarding; retain suspension fairness.
8. [ ] M6 / I14 — advanced geographic gamification after core rules and operations are proven; this does not defer I12's basic gamified map presentation.
9. [ ] Outstanding L Admin operations/audit, M long-term records and N custom requests as scoped steps; resolve Independent Organizer separately.

Each entry is a sequence container, not one large PR. Follow review → user merge → deployment → explicit verification, keeping implementation status and E2E status separate.

# 21. Next-step planning gate — no implementation prompt yet

The obsolete “implement F4 / 5 m radius” prompt is retired: BE #60 already merged, followed by the dependent FE work. Do not reissue it.

First review this v3.3 documentation-only FE Draft PR in the existing project workflow. After user merge, the next scoped planning target is the **F7/G4 Backend contract** in section 20.2, including the unresolved field/API and legacy/review-gate decisions. Only then write a separate implementation prompt for that one repository/slice.

No implementation prompts, AI-generated routes, application changes, automatic merge or deployment are included in this plan update. Preserve the existing architecture and verify deployed evidence independently.

# 22. Prototype success milestones

## Milestone 1 — Professional platform access

First Admin bootstrap/login works
→ ✅ Admin can maintain their own password
→ ✅ Admin can provision another Admin safely
→ ✅ Admin can directly provision Organizer and Creator capabilities
→ ✅ Admin can edit/block/manage roles/set non-Admin passwords and permanently remove accounts while required platform history/provenance survives
→ Organizer application/approve/normal-login works
→ Creator provision/activate/login works

## Milestone 2 — Real content supply chain

Creator creates template
→ Admin approves version
→ Organizer selects approved version
→ Hunt snapshot persists

## Milestone 3 — Real participant Hunt

Participant joins
→ team forms
→ Hunt starts
→ one checkpoint works
→ progress/scoring persists

## Milestone 4 — Complete Signal pilot

Full mission
→ live monitor
→ Help/PANIC
→ final results
→ rewards

## Milestone 5 — Long-term platform loop

Passport
→ history
→ achievements
→ repeat participation

---

# 23. Final governing rule

Account controls access. Roles control capabilities. Platform records survive accounts.

Creator creates
→ Admin governs
→ Organizer configures
→ Participant plays
→ Backend records truth

Every new implementation step should strengthen that chain without bypassing backend authority or replacing real persistence with frontend simulation.
