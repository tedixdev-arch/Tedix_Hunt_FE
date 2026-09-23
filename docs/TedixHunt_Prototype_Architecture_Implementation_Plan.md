# Tedix Hunt - Prototype Architecture & Implementation Plan

Version 2.4 | Updated 23 September 2026

This document evolves Version 2.3 with the current professional-account implementation state, complete Admin account lifecycle, the identity/workspace architecture for global capabilities and Hunt-contextual access, and the separation between public professional entry and authenticated workspace switching.

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

- ✅ Complete — implemented across the required FE/BE/DB scope for the current prototype.
- 🟡 Partial — important pieces are real, but the end-to-end flow is not complete.
- 🟠 Backend complete / FE pending — backend behavior exists but the frontend is not connected.
- 🟣 FE mock exists / backend pending — the experience exists visually, but persistence/business logic is still simulated.
- ⬜ Not started — no meaningful implementation yet.
- ⚠ Deferred operational item — important, but not the immediate product-development blocker.

A phase is complete only when its intended flow works through the deployed application, not merely because a table or screen exists.

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

Admin governs and approves
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

Participant and Supervisor are Hunt-contextual:

- Participant access to a Hunt is authoritative from hunt_participants.
- Supervisor access to a Hunt is authoritative from hunt_roles with role = 'supervisor'.
- The same User may be Participant in one Hunt, Supervisor in another, both Participant and Supervisor in the same Hunt, and also hold Organizer/Creator/Admin global capabilities.
- Supervisor must never be inferred from Organizer capability or from Hunt ownership.

The existing global participant role remains only as transitional compatibility data for current authentication/guards. New Hunt-context decisions must not infer Participant access from that global role.

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

### Preserve the mockup deliberately

Do not rewrite screens that already express the approved experience. Replace simulated behavior one feature at a time.

### Real persistence

No production-like path should depend on fake login, local-only Hunt state, fake scoring, simulated teammates or browser-only results.

### Immutable published context

A Hunt keeps the exact approved template version/content it was created from. Later template edits must not change an already published or active Hunt.

### Small vertical slices

Each change should be narrowly scoped, reviewable, tested, deployable and verifiable.

---

## 7. Current PostgreSQL baseline

Tracked migrations currently reach:

- 001_baseline
- 002_user_roles
- 003_core_hunt_records
- 004_hunt_general_setup
- 005_hunt_template_selection
- 006_hunt_pilot_options
- 007_hunt_access_code
- 008_hunt_rewards
- 009_organizer_applications
- 010_organizer_approval
- 011_professional_activation_tokens

Current important tables include:

- users
- user_roles
- organizations
- organization_members
- organizer_applications
- hunts
- hunt_participants
- teams
- team_members
- hunt_roles
- hunt_leaderboard_rewards
- hunt_special_awards
- refresh_tokens
- professional_activation_tokens

Major future data areas still missing:

- creator templates
- template versions
- template checkpoints/challenges
- template route points
- template safety verification
- template submission/review history
- participant enrollment workflow state
- team readiness/start gate
- checkpoint attempts
- answers
- hints
- solutions
- progress
- score events
- help/PANIC incidents
- leaderboard/final results
- award winners
- Passport/history
- achievements
- physical reward inventory
- custom Hunt requests
- audit events
- platform settings
- notifications

---

## 8. Current FE baseline

The FE preserves most mockup routes and screens while progressively adding real behavior.

Already-real frontend foundations include:

- shared API client
- token/session handling
- refresh/retry
- AuthProvider
- participant auth
- creator auth
- organizer auth
- admin auth
- role-based guards
- Admin login connected to the real backend
- Admin route protection merged in FE PR #28
- Admin Account Security / own-password change
- Admin list, provisioning and activation UI
- grouped collapsible Admin left sidebar
- canonical authenticated /workspaces switcher and shared professional workspace-switch entry (FE PR #43, refined by FE PR #45)
- public /login-workspace selector for Organizer / Creator / Admin only (FE PR #45)
- homepage keeps Participant entry separate through Join a Hunt; professional entry links to /login-workspace
- organizations API
- Hunt API
- Hunt template metadata API
- Hunt options API
- reward configuration API
- organizer application form
- Hunt access-code resolution
- Hunt draft create/reopen/edit
- publish flow

The active application uses src/main.tsx and src/routes/router.tsx.

---

## 9. Current BE baseline

Current main backend domains:

- /api/auth
- /api/me/hunt-contexts
- /api/admin/users
- /api/organizer-applications
- /api/organizations
- /api/hunt-templates
- /api/hunt-options
- /api/hunt-access
- /api/reward-options
- /api/hunts/:id/rewards
- /api/hunts

This is a strong foundation, but Creator template persistence, participant runtime, live operations and long-term systems remain to be built.

---

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
Status: 🟡 Backend complete / FE contextual wiring pending

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
- Supervisor context is derived only from hunt_roles(role='supervisor').
- One Hunt may expose both Participant and Supervisor access for the same User.

Remaining:
- connect /workspaces to GET /api/me/hunt-contexts
- render Participant/Supervisor only as specific Hunt contexts
- add contextual navigation targets as Participant/Supervisor runtime routes mature

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

### B5. Hunt-context roles
Status: 🟡 Context read model complete / runtime assignment-use pending

Participant membership is represented by hunt_participants.

Supervisor authority is represented by hunt_roles(role='supervisor').

GET /api/me/hunt-contexts is the authenticated read model used to expose those contextual relationships to workspace switching without converting them into global roles.

Supervisor assignment/use during live Hunt operations is still pending.

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

Status: ✅ Complete

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

## Phase E — Professional account lifecycle

Status: 🟡 In progress

This is the immediate implementation phase.

### E1. Registered Organizer application
Status: ✅ Complete

### E2. Organizer login
Status: ✅ Complete

### E3. Organizer approval backend
Status: ✅ Complete

Admin approval transaction:
- reuses or creates User
- grants Organizer role
- creates Organization
- adds membership
- creates one-time activation token

### E4. Organizer activation backend
Status: ✅ Complete

- hashed one-time token
- expiry
- bcrypt password for new account
- existing password preserved for existing user
- existing roles preserved

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
Status: 🟠 Backend complete / FE pending

Admin needs:
- pending list
- detail
- approve
- reject
- decision status

### E12. Organizer activation frontend
Status: 🟠 Backend complete / FE pending

Public activation page:
- token from URL
- initial password where needed
- confirmation
- successful session or Organizer-login redirect

### E13. Organizer onboarding verification
Status: ⬜ Not started

Verify:
Apply → pending → Admin login → approve → account/role/org → activate → Organizer login → workspace

### E14. Creator provisioning
Status: ⬜ Not started

For prototype:
- no public Creator self-registration
- Admin provisions/invites Creator
- reuse the same professional-account principles used for Admin/Organizer identities
- preserve existing roles and passwords for existing users
- use one-time activation for new passwordless identities

Recommended:
Admin → invite/create Creator → Creator activation → Creator login

### E15. Creator activation/account lifecycle
Status: ⬜ Not started

Implement:
- one-time expiring activation
- Creator chooses password when the identity is new/passwordless
- existing password-backed identity keeps its credentials
- authoritative `creator` role is preserved alongside any other roles
- successful activation leads to Creator login/session

### E16. Creator onboarding verification
Status: ⬜ Not started

Verify:
Admin provisions Creator
→ activation if required
→ Creator login
→ authoritative Creator access
→ Creator Studio

---

## Phase F — Creator template system

Status: 🟣 FE mock exists / backend pending

Creator Studio is visually advanced but still mostly local prototype state.

### F1. Template domain model
Status: ⬜ Not started

Need:
- template identity
- creator/owner
- lifecycle status
- metadata

### F2. Template versioning
Status: ⬜ Not started

Suggested states:
- draft
- submitted
- changes_requested
- approved
- rejected
- archived

Approved versions are immutable.

### F3. Template Setup persistence
Status: ⬜ Not started

Persist:
- name
- description
- category
- age range
- duration
- language
- participant range
- team-size support
- format support
- environment/accessibility
- equipment
- difficulty policy
- theme
- mission
- briefing

### F4. Hunt Features persistence
Status: ⬜ Not started

Persist reusable defaults for:
- personal challenge
- team challenge
- navigation
- route/positions
- final challenge
- other approved mockup feature blocks

### F5. Checkpoint/challenge model
Status: ⬜ Not started

Represent:
- order
- title
- prompt
- type
- options
- answer definition
- hints
- solution/reveal rules
- personal/team behavior

### F6. Fixed route and location model
Status: ⬜ Not started

Persist:
- route points
- checkpoint coordinates
- detection radius
- ordering
- FinishPoint

### F7. Safety verification
Status: ⬜ Not started

### F8. Answers, hints and solutions
Status: ⬜ Not started

Sensitive answer material stays backend-side where appropriate.

### F9. Participant journey preview
Status: ⬜ Not started

Preview uses persisted template-version data.

### F10. Template validation
Status: ⬜ Not started

Backend-authoritative readiness before submission.

### F11. Submit version to Admin
Status: ⬜ Not started

Submission locks/preserves the reviewed version.

### F12. Real Creator Studio list/status
Status: ⬜ Not started

Replace mock counts/list with real:
- Drafts
- Changes requested
- Submitted
- Approved

---

## Phase G — Admin template governance

Status: 🟣 FE mock exists / backend pending

### G1. Pending template review list
Status: ⬜ Not started

### G2. Review submitted version
Status: ⬜ Not started

Admin sees:
- metadata
- challenges
- route
- safety
- preview
- validation result

### G3. Request changes
Status: ⬜ Not started

### G4. Reject template
Status: ⬜ Not started

### G5. Approve template version
Status: ⬜ Not started

### G6. DB-backed approved template catalog
Status: ⬜ Not started

Replace static backend template catalog as final authority.

### G7. Organizer consumes approved template version
Status: 🟡 Partially prepared

D2 already stores version/snapshot.

Future:
- catalog comes from approved DB versions
- Hunt snapshot remains immutable

---

## Phase H — Participant enrollment and team formation

Status: 🟡 Structural DB foundation exists / runtime pending

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

Status: 🟣 FE mock exists / backend pending

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

## Phase J — Live Hunt operations

Status: 🟣 Organizer Monitor mock exists / backend pending

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

### J4. Supervisor assignment
Status: ⬜ Not started

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

Status: 🟣 FE mock exists / mostly backend pending

Implement each subsystem only when the underlying domain exists.

### L1. Users & Roles
Status: ⬜ Not started

Phase E implements only the minimum professional-account administration needed to operate the prototype. Phase L expands this into the full Users & Roles system.

Future L1 scope:
- searchable user list
- inspect authoritative role set
- grant/remove Organizer capability
- grant/remove Creator capability
- grant/remove Admin capability
- account/activation status
- safe deactivation
- role-history visibility
- last-Admin protection
- exceptional participant support

Admins must not be able to view stored passwords or arbitrarily overwrite another user's password. Password changes/resets remain account-security/authentication operations.

### L2. Hunt oversight
Status: ⬜ Not started

### L3. Safety Alerts
Status: ⬜ Not started

Depends on Phase J help/PANIC.

### L4. Physical Reward Inventory
Status: 🟣 FE mock exists / backend pending

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

Status: 🟣 FE concepts/mock exist / backend pending

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

Status: 🟣 FE mock exists / backend pending

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

## 12. Creator provisioning policy

For the current prototype:

- no public Creator self-registration
- Creator access is privileged
- Admin provisions/invites Creator
- Creator then uses normal authentication

A public Creator application workflow should only be added if explicitly required later.

---

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

Future Creator/Admin template architecture:

Template Draft
→ Submitted Version
→ Admin Review
→ Approved Version
→ Organizer selects version
→ Hunt stores immutable snapshot

Never let an edited template retroactively change a published/active Hunt.

---

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
→ exact Codex task
→ Codex implements + tests
→ PR
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

# 20. Recommended implementation order from current state

1. Finish Identity / Workspace context integration
   - ✅ canonical /workspaces selector and same-session global switching (FE PR #43)
   - ✅ public /login-workspace separated from authenticated /workspaces (FE PR #45)
   - ✅ homepage Participant entry remains Join a Hunt; professional entry goes to /login-workspace
   - ✅ authenticated Hunt-context read API (BE PR #35)
   - wire Participant/Supervisor Hunt contexts into /workspaces
   - keep global participant role compatibility-only

2. Finish Professional Account Lifecycle
   - ✅ Admin own-password change and session revocation (E9)
   - ✅ normal additional-Admin provisioning/activation (E10)
   - Organizer Applications Admin UI (E11)
   - Organizer activation FE (E12)
   - verify Organizer onboarding (E13)
   - Creator provisioning (E14)
   - Creator activation/account lifecycle (E15)
   - verify Creator onboarding (E16)

3. Build Creator Template Persistence + Versioning

4. Build Admin Template Review / Approval

5. Replace static approved-template authority with real approved DB template versions

6. Verify Organizer selects a real approved Creator template

7. Build Participant enrollment/team formation

8. Build ONE complete checkpoint runtime

9. Extend to full Signal mission

10. Connect live Organizer monitoring + Help/PANIC

11. Build results + reward-awarding runtime

12. Add Admin operational systems as their domains become real

13. Add Passport/history/achievements

14. Add Custom Hunt request workflow

15. Resolve Independent Organizer production architecture

This order avoids building participant gameplay permanently around hard-coded Signal content.

---

# 21. Immediate next steps

## Immediate 0 — Contextual workspace integration

Architecture now distinguishes global capabilities from Hunt-specific access.

Complete:
- FE PR #43 — /workspaces selector and same-session switching for global workspaces
- FE PR #45 — public /login-workspace separated from authenticated /workspaces
- FE PR #45 — homepage professional entry routes to /login-workspace while Join a Hunt remains the only public Participant entry
- FE PR #45 — explicit Switch Workspace: <Current> → action in professional headers
- BE PR #35 — GET /api/me/hunt-contexts authoritative contextual-access read model

Next:
- load authenticated Hunt contexts from /api/me/hunt-contexts inside /workspaces
- keep Organizer/Creator/Admin as global capability entries
- render Participant and Supervisor only per specific Hunt
- never infer Hunt participation from the global participant compatibility role

## Completed professional Admin foundation — E6 through E10

Complete:
- E6 First Admin bootstrap
- E7 Real Admin frontend login
- E8 Admin route protection
- E9 Admin account security
- E10 Additional Admin provisioning/activation and two-Admin lifecycle verification

The Admin Console now uses a grouped collapsible left sidebar for desktop-first navigation.

## Immediate 1 — E11 Organizer Applications Admin UI

Use the already implemented backend Organizer application/approval endpoints.

## Immediate 2 — E12 + E13 Organizer activation and onboarding verification

Allow approved Organizers to complete activation and verify the complete application → approval → activation → login → workspace flow.

## Immediate 3 — E14 + E15 + E16 Creator lifecycle

Create controlled Admin→Creator provisioning, activation/account lifecycle and end-to-end onboarding verification.

After these professional identity flows are complete, begin Phase F — Creator Template System.

---

# 22. Prototype success milestones

## Milestone 1 — Professional platform access

First Admin bootstrap/login works
→ ✅ Admin can maintain their own password
→ ✅ Admin can provision another Admin safely
→ Organizer apply/approve/activate/login works
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

Creator creates
→ Admin governs
→ Organizer configures
→ Participant plays
→ Backend records truth

Every new implementation step should strengthen that chain without bypassing backend authority or replacing real persistence with frontend simulation.
