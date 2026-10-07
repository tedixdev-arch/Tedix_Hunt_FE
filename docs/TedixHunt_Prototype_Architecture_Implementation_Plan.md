# Tedix Hunt - Prototype Architecture & Implementation Plan

Version 3.1 | Updated 7 October 2026

This revision preserves Phase A–N and the existing identity, credential and account-retirement architecture. The Creator phase is complete for its agreed baseline before the Mapbox evolution. New geographic capabilities below are unchecked future work, not reasons to reopen that baseline.

Revision note (3.1): corrects B1.1 using merged FE #61 and G1 using merged FE #70; incorporates the finalized geographic architecture and subsequent Admin/Organizer corrections; integrates Mapbox M1–M6 into existing phases. Merged implementation is distinct from deployed E2E evidence; this revision does not claim a new deployment test.

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

Preserve configuration.checkpointPositions initially. Add FinishPoint/navigation/visibility or later game-object fields only after specific BE rules are approved. Do not introduce a giant generic mapObjects schema. Provider route estimates are advisory and cannot establish route safety or arrival.

V1 excludes AR, background geofencing, permanent GPS history, complex GIS tooling and unnecessary 3D. Exact arrival mathematics remains a Participant-runtime design/real-phone validation task; 5 m is a discovery target, not a promise of device precision.

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

Status: ✅ Existing setup baseline complete; D8–D9 are new evolution

### D1. General Setup
Status: ✅ Complete

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
Status: ⬜ Not started
- [ ] Reuse HuntMapPreview from G3 to inspect the approved version during selection and the exact Hunt snapshot after creation.
- [ ] Show normal checkpoints, separate FinishPoint, radii and available route estimates; handle absent legacy geography explicitly.
- [ ] Keep fixed Template geography read-only for Organizer. Portable/repositionable Templates require a separate future product rule.

### D9. Allocate Supervisors — Mapbox M3 frontend
Status: ⬜ Not started; depends on B6 backend deployment
- [ ] Add Allocate Supervisors after Hunt configuration and before Review/Publish readiness.
- [ ] List Organizer by default as Organizer · Supervisor · Automatic; allow allocation/removal of additional eligible identities through B6 APIs.
- [ ] Show authoritative supervision readiness; do not require an extra Supervisor or create a fake professional Supervisor account.
- [ ] E2E: Organizer appears automatically, allocated Supervisor gains only that Hunt's operational access, removal revokes access, self-removal cannot remove automatic supervision.

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

Status: ✅ Creator baseline complete before Mapbox evolution; F4–F6 are new work

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

Normal checkpoints and FinishPoint are separate concepts. Template content uses `configuration.normalCheckpointCount` and `configuration.checkpointPositions`. Each checkpoint position contains `checkpointNumber`, `name`, `latitude`, `longitude`, and `radiusMeters`.

Contract rules:
- `normalCheckpointCount` is 1..20
- `checkpointPositions` represents only normal checkpoints
- FinishPoint belongs to Feature 6 and is not N+1 in `checkpointPositions`
- checkpoint numbers are unique and within 1..N
- latitude is -90..90 and longitude is -180..180
- Current baseline: `radiusMeters` is 10..500. F4 changes acceptance to 5..500 before FE adopts a 5 m default; existing stored values are preserved
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
- Leaflet + React-Leaflet geographic editor with isolated/replaceable OpenStreetMap prototype tiles
- real pan/zoom, map-click placement/repositioning, and radius visualization
- Creator verification and safety-checklist UX
- no invented coordinates

Coordinate persistence does not establish checkpoint verification or route-safety approval. Those facts are not currently persisted, so the FE intentionally reopens persisted coordinates as unverified and safety unchecked.

---

### F4. Radius contract compatibility — Mapbox M1a
Status: ⬜ Not started — NEXT IMPLEMENTATION STEP
Repository: Tedix_Hunt_BE only.
- [ ] Accept explicit radiusMeters from 5..500 throughout geographic validation, submission and serialization; retain all other geographic constraints.
- [ ] Preserve checkpointPositions and existing immutable versions/snapshots; do not rewrite existing 30 m or other radii. Missing legacy geography remains compatible.
- [ ] Test 5 m accepted, values below 5/above 500 rejected, existing valid content unchanged, and 5 m content survives version → submit → approve → catalog → Hunt snapshot.
- [ ] Update the relevant API contract; tracked migration only if actual schema constraints require it.
- [ ] Review → user merge → deploy → verify the contract before F5. No Mapbox dependency or gameplay algorithm in this BE step.

### F5. Shared TedixMap and Creator Hunt Map Editor — Mapbox M1b
Status: ⬜ Not started; follows F4
Repository: Tedix_Hunt_FE. Split the following into separate small prompt/PR cycles.
- [ ] Replace the Creator Leaflet surface with shared TedixMap Mapbox rendering and provider adapter boundaries; preserve the persisted contract.
- [ ] Add location/POI search for city, address, landmark and POI. Search moves the camera; only explicit placement/confirmation writes checkpoint geography.
- [ ] Support exact placement/repositioning, configured normal checkpoint count, radius display and 5 m default for new positions. Allow increases up to the validated limit; preserve saved values.
- [ ] Handle token/configuration failure, search/routing errors, loading, attribution, cleanup and mobile performance. Keep provider types, IDs and camera state out of domain authority.
- [ ] Verify save/reopen/submit preserves coordinates, names, numbering and radii. Never invent Signal coordinates or infer verified safety from location data.

### F6. Route validation and Participant Preview — Mapbox M1c
Status: ⬜ Not started
- [ ] Inspect existing Feature 6 first; any missing FinishPoint geographic contract is a separate BE-only slice before FE wiring. FinishPoint never becomes checkpoint N+1.
- [ ] Show CP1 → CP2 → … → CPn → FinishPoint and approximate walking distance/time when routing succeeds. Distinguish straight-line visualization, provider route estimate and human route-safety verification.
- [ ] Support incomplete/invalid/unavailable routes without claiming safe access. Preserve explicit Creator verification.
- [ ] Add Preview as Participant using shared map and visibility projection. Before I12 exists, label simulated navigation/arrival and never treat preview as real progression.
- [ ] E2E: search → explicit placement → save/reopen → route inspection → Participant Preview → submit; historical versions remain unchanged.

## Phase G — Admin Template governance and approved authority

Status: ✅ Backend/DB, Admin FE review and Organizer integration implemented; G3 is new map evolution

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
Status: ⬜ Not started; follows F5–F6
- [ ] Reuse HuntMapPreview for the exact submitted immutable artifact: checkpoints, FinishPoint, radii and route.
- [ ] Reuse the same component in D8; no second map implementation or new generic domain schema.
- [ ] Keep the review preview read-only to preserve the artifact under review. This UI mode does not restrict Admin's platform authority; explicit edit/override operations preserve versions and provenance.
- [ ] Verify approval and later Hunt selection refer to the same version; unavailable provider services do not alter content.

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

### I11. FinishPoint / final puzzle
Status: ⬜ Not started

---

### I12. Participant geographic runtime — Mapbox M4
Status: ⬜ Not started; depends on H enrollment/start/recovery and B6
Backend / DB first, then separate FE integration slices.
- [ ] Define authorized objective projections, discovery and progression APIs, navigation rules, FinishPoint unlock and idempotent transitions.
- [ ] Build one persistent Hunt Game Map per mounted Hunt session; checkpoint changes update layers/state instead of remounting maps. Refresh/reopen restores backend state and may create a new provider load.
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
- [ ] Atomically bypass suspended checkpoints without penalty or blocking, including current and future objectives; preserve completed history and prior earned scores.
- [ ] Define score eligibility, timers, all-normal-checkpoints-suspended behavior and separate FinishPoint rules before coding. Do not silently mark bypassed checkpoints as solved or invent completion rewards.
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

Completed foundation: A–E baseline, B1.1 contextual workspace integration, F Creator baseline, G1 real Admin review and G2 approved catalog/snapshot integration. FE #61 and #70 correct stale v3.0 status. Creator completion is accepted as the project baseline; this plan does not reopen it for new Mapbox requirements.

Step 7A is implemented (FE #70), not the next task. Preserve Step 7 supply-chain E2E evidence as a release gate: Creator persists/submits → Admin reviews exact version/approves → catalog resolves it → Organizer selects → exact Hunt snapshot persists. Record a deployed evidence link/result if absent; do not equate merge with deployment verification.

Mapbox sequence aliases M1–M6 below are not Phase M Passport/history item IDs.

1. [ ] M1a / F4 — BE radius acceptance 5..500, preserving versions and snapshots.
2. [ ] M1b / F5 — FE shared TedixMap foundation, then search/placement in separate small PRs.
3. [ ] M1c / F6 — required FinishPoint contract BE first, then route validation and Participant Preview FE.
4. [ ] M2 / G3 + D8 — shared read-only Admin/Organizer previews.
5. [ ] M3 / B6 then D9 — BE effective authority/assignment APIs, then Allocate Supervisors FE.
6. [ ] H / Step 8 — Participant enrollment/team formation/start/recovery; Step 7 deployed verification gates this phase.
7. [ ] M4 / I1–I9 + I12 — one authoritative checkpoint with persistent map, GPS, navigation and Arrival Engine; BE contracts before FE.
8. [ ] I13 — BE suspension/bypass rules, then Participant FE handling; prove before live suspension controls.
9. [ ] I10–I11 — expand proven gameplay to Signal and separate FinishPoint.
10. [ ] M5 / J — backend live state/minimal GPS, then shared Operations Map, suspension controls and HELP/PANIC.
11. [ ] K — results and reward awarding; retain suspension fairness.
12. [ ] M6 / I14 — later geographic gamification only after rules and operational gameplay are proven.
13. [ ] Complete outstanding L Admin operations/audit, M long-term records and N custom requests as scoped steps; resolve Independent Organizer separately.

Each numbered entry is a sequence container, not authorization for one large PR. Split every BE/FE boundary and each sizeable feature into one small step, one repo, one prompt/PR, review, user merge, deploy and E2E before continuing.

# 21. Immediate next implementation prompt

**F4 / Mapbox M1a — accept a 5 m discovery target in Tedix_Hunt_BE.**

Implement only the existing checkpoint radius contract change from 10..500 to 5..500. Preserve configuration.checkpointPositions, all unrelated constraints, existing stored radii, immutable Template versions and Hunt snapshots. Do not backfill 30 m values to 5 m. Keep legacy geography compatibility. Add boundary/regression and lifecycle round-trip tests; update the API contract. Use a tracked migration only if a real DB constraint needs changing. Do not add Mapbox, a mapObjects schema, GPS, Arrival Engine, supervisor or suspension features in this PR.

Acceptance checklist:
- [ ] 5 m survives create/version/submit/approve/catalog/snapshot.
- [ ] Below 5 and above 500 are rejected; existing valid radii remain valid.
- [ ] Historical versions and existing Hunt snapshots remain byte-equivalent in content.
- [ ] Relevant tests, typecheck/build and diff review pass.
- [ ] Draft PR in BE only; user reviews/merges.
- [ ] Deploy and verify contract; record result before F5 adopts 5 m for new positions.

This planning PR modifies only the FE repository plan. It does not implement F4, merge, deploy or claim new E2E results.

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
