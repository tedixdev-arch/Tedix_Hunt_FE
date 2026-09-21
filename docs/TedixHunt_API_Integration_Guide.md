# TedixHunt API Integration Guide

Version 2.0 | Updated 21 September 2026

This document refines the development-team API requirement walkthrough and reconciles it with the current TedixHunt architecture, merged FE/BE implementation and Implementation Plan v2.0.

It is a planning and integration guide.

The backend OpenAPI/Swagger contract remains the runtime source of truth for implemented endpoints.

---

## 1. Why this document changed

The original API requirement document was useful because it mapped visible screens and user actions to suggested API calls.

However, several suggestions were based on the reference UI rather than the current implemented architecture.

The main corrections are:

- keep the current resource-oriented `/api/...` convention instead of introducing a parallel `/api/v1/<role>/...` hierarchy now;
- preserve the existing multi-role User model instead of creating separate Organizer/Creator/Admin identity systems;
- keep Organizer application → Admin approval → activation instead of public Organizer OTP registration;
- keep per-Hunt backend lifecycle actions such as publish/pause/cancel instead of directly PATCHing status;
- do not require Admin approval for every Organizer-created Hunt;
- treat Creator templates as drafts + immutable versions + explicit submission/review, not “create and immediately submit”;
- treat the current Admin 2FA screen as mock UX only; real 2FA is deferred unless explicitly implemented;
- preserve the current pilot constraints: team format, team size 4, invitation-only, easy difficulty, recommended checkpoint order;
- separate authentication, Hunt enrollment and participant runtime rather than coupling all of them into one “join” endpoint;
- distinguish reward configuration from reward inventory and actual reward awarding.

---

## 2. API design principles

### 2.1 Current route convention

Current implemented endpoints use:

`/api/...`

Examples:

- `POST /api/auth/organizer/login`
- `POST /api/auth/admin/login`
- `GET /api/hunts`
- `PATCH /api/hunts/:id`
- `POST /api/hunts/:id/publish`
- `GET /api/hunt-access/:code`

Do not add a second role-prefixed API surface such as:

`/api/v1/organizer/hunts`

unless a future versioning decision deliberately migrates the whole API.

### 2.2 API versioning

Do not introduce `/api/v1` only for new features while older endpoints stay on `/api`.

If formal API versioning becomes necessary, introduce it as one coordinated compatibility boundary.

### 2.3 Shared resources over role-specific duplication

Prefer shared resource APIs with backend authorization:

- `/api/hunts`
- `/api/templates`
- `/api/organizations`

instead of duplicating the same resource under:

- `/api/organizer/...`
- `/api/creator/...`
- `/api/admin/...`

Role-specific endpoints are appropriate when the operation itself is role-specific, for example:

- Organizer application approval
- Admin dashboard aggregate
- Creator template submission
- Admin template review

### 2.4 Commands for lifecycle transitions

Do not directly PATCH lifecycle status.

Use explicit command endpoints:

- `POST /api/hunts/:id/publish`
- `POST /api/hunts/:id/start`
- `POST /api/hunts/:id/pause`
- `POST /api/hunts/:id/resume`
- `POST /api/hunts/:id/cancel`
- `POST /api/hunts/:id/finish`

This preserves the backend state machine and authorization rules.

### 2.5 Backend authorization is authoritative

Frontend screens may hide unavailable controls, but the backend must enforce:

- global role
- organization membership/ownership
- Hunt-specific organizer/supervisor role
- resource ownership
- lifecycle state

### 2.6 OpenAPI is the implemented contract

For implemented APIs:

Swagger/OpenAPI in the BE repo is authoritative.

This Markdown guide records:
- current implemented API families;
- planned API families;
- intended screen-to-API mapping;
- architecture decisions.

---

# 3. Current implemented API surface

## 3.1 Authentication

### Participant

Implemented:

- `POST /api/auth/participant/register`
- `POST /api/auth/participant/login`
- `POST /api/auth/guest`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Current concern:

Tedix-linked login by `tedixUserId` still requires a future verified upstream Tedix proof before production use.

### Organizer

Implemented:

- `POST /api/auth/organizer/login`
- `POST /api/auth/organizer/activate`

Organizer capability is checked through authoritative roles.

### Creator

Implemented:

- `POST /api/auth/creator/login`

Creator public registration is intentionally disabled.

### Admin

Implemented:

- `POST /api/auth/admin/login`

Admin capability is checked through authoritative roles.

Real 2FA is not implemented.

---

## 3.2 Organizer applications

Implemented:

- `POST /api/organizer-applications`
- `GET /api/organizer-applications?status=...`
- `POST /api/organizer-applications/:id/approve`
- `POST /api/organizer-applications/:id/reject`

Current workflow:

Public application
→ pending
→ Admin decision
→ User/Organizer role/Organization provisioning
→ one-time activation
→ Organizer login

This replaces the earlier proposal for Organizer registration + email OTP.

---

## 3.3 Organizations

Implemented:

- `GET /api/organizations`
- `GET /api/organizations/:id`
- `POST /api/organizations`
- `PATCH /api/organizations/:id`

Important:

The current create/update authorization still contains Creator-oriented legacy semantics and may need refinement when professional provisioning is completed.

---

## 3.4 Hunts

Implemented:

- `GET /api/hunts`
- `POST /api/hunts`
- `GET /api/hunts/:id`
- `PATCH /api/hunts/:id`

Lifecycle commands:

- `POST /api/hunts/:id/publish`
- `POST /api/hunts/:id/start`
- `POST /api/hunts/:id/pause`
- `POST /api/hunts/:id/resume`
- `POST /api/hunts/:id/cancel`
- `POST /api/hunts/:id/finish`

Access:

- `POST /api/hunts/:id/access`
- `GET /api/hunt-access/:code`

Current rule:

A Hunt does not require Admin approval merely because an Organizer created it.

The backend controls readiness and lifecycle.

Admin approval applies to reusable Creator template versions, not every Hunt instance.

---

## 3.5 Hunt templates/options

Implemented static/pilot metadata:

- `GET /api/hunt-templates`
- `GET /api/hunt-options`

Current limitation:

The approved template catalog is still backend/static domain data.

Future Phase F/G replaces this with database-backed Creator template versions approved by Admin.

---

## 3.6 Hunt reward configuration

Implemented:

- `GET /api/reward-options`
- `GET /api/hunts/:id/rewards`
- `POST /api/hunts/:id/rewards/leaderboard`
- `PATCH /api/hunts/:id/rewards/leaderboard/:rewardId`
- `DELETE /api/hunts/:id/rewards/leaderboard/:rewardId`
- `POST /api/hunts/:id/rewards/special`
- `PATCH /api/hunts/:id/rewards/special/:rewardId`
- `DELETE /api/hunts/:id/rewards/special/:rewardId`

This is configuration only.

It is not:
- Admin inventory;
- winner calculation;
- prize reservation;
- prize fulfillment.

---

# 4. Revised Guest / Participant flow

The original walkthrough proposes a public active Hunt endpoint, email-based join, participant/session ID, then participant-selected difficulty.

The current architecture should be different.

## 4.1 Open Hunt by code

### Screen action

User opens a shared link or types a Hunt code.

### Existing API

`GET /api/hunt-access/:code`

Returns minimal public Hunt identity/status.

### Status

✅ Implemented

### Architecture note

Do not introduce `GET /api/v1/hunts/active` as a default until the product explicitly defines what “default active Hunt” means.

A shared code/link is deterministic and preferable.

A future campaign/landing feature may expose a promoted Hunt separately.

---

## 4.2 Guest identity

### Existing API

`POST /api/auth/guest`

Creates a short-lived participant identity.

### Status

✅ Implemented foundation

### Recommended FE orchestration

The no-login UX can remain one simple Join interaction while the FE performs:

1. resolve Hunt code;
2. create/recover guest identity if needed;
3. enroll the participant in the Hunt.

Authentication and enrollment remain separate backend concerns.

---

## 4.3 Participant enrollment

### Planned API

Preferred resource-oriented shape:

`POST /api/hunts/:huntId/participants`

or, if the access code needs to be the public join key:

`POST /api/hunt-access/:code/join`

### Recommendation

Prefer `POST /api/hunts/:huntId/participants` after resolving the code and establishing participant identity.

This keeps:
- code resolution;
- authentication/session;
- enrollment

as separate responsibilities.

### Required behavior

- authenticated Participant/Guest required;
- idempotent repeated join;
- enforce capacity;
- reject cancelled/finished/closed Hunt;
- return existing enrollment if already joined.

### Status

⬜ Planned — Phase H2/H3

---

## 4.4 Email collection

The original walkthrough treats email as the guest identity.

This is not required by the current architecture.

Decision options:

- guest remains anonymous;
- email becomes optional contact/recovery data;
- user is prompted to create/login to a real Participant account;
- email is required only if product/legal requirements demand it.

Do not use email alone as a security credential.

### Status

⚠ Product decision

---

## 4.5 Difficulty selection

The original walkthrough proposes Easy / Medium / Hard per participant.

Current pilot supports only:

`easy`

and current Hunt options are backend-controlled.

Therefore:

- do not build multi-difficulty participant APIs yet;
- do not expose Medium/Hard as if supported;
- revisit this when runtime/game design supports multiple difficulty branches.

### Status

⚠ Deferred product/runtime decision

---

# 5. Revised Organizer flow

## 5.1 Registered Organizer application

The original guide proposes registration + email OTP.

That is superseded.

### Existing flow

`POST /api/organizer-applications`

Then Admin approval/rejection.

### Status

✅ Implemented backend + FE application form

---

## 5.2 Organizer approval

### Existing APIs

- `GET /api/organizer-applications`
- `POST /api/organizer-applications/:id/approve`
- `POST /api/organizer-applications/:id/reject`

### Status

🟠 Backend complete / Admin FE pending

---

## 5.3 Organizer activation

### Existing API

`POST /api/auth/organizer/activate`

### Status

🟠 Backend complete / activation FE pending

---

## 5.4 Organizer login

### Existing API

`POST /api/auth/organizer/login`

### Status

✅ Implemented

---

## 5.5 My Hunts

### Existing API

`GET /api/hunts`

Returns Hunts manageable by the authenticated user.

### Summary counters

The reference UI contains:
- Active Now
- Needs Attention
- Total Hunts

Two acceptable implementations:

1. FE derives simple counts from `GET /api/hunts` while list size remains small;
2. later add a read-model endpoint such as `GET /api/organizer-dashboard`.

### Recommendation

Do not add a separate aggregate endpoint until FE-side derivation becomes inefficient or “Needs Attention” depends on deeper server state.

---

## 5.6 Edit Hunt

### Existing APIs

- `GET /api/hunts/:id`
- `PATCH /api/hunts/:id`

### Status

✅ Implemented for draft configuration

Important:

Draft updates are allowed only while Hunt status is `draft`.

---

## 5.7 Pause / cancel / resume / start / finish

The original guide suggests PATCHing `status`.

Do not do that.

Use existing lifecycle commands.

### Status

✅ Implemented

---

## 5.8 Duplicate Hunt

The reference walkthrough includes Duplicate Hunt.

Current plan did not explicitly list it.

### Proposed API

`POST /api/hunts/:id/duplicate`

### Required behavior

- Organizer permission required;
- copy setup/options/template snapshot/reward configuration as explicitly decided;
- new Hunt receives a new ID;
- new Hunt starts as `draft`;
- no participant/team/runtime state copied;
- no access code copied;
- no score/results copied.

### Status

⬜ New planned convenience feature

### Plan impact

Add as an Organizer convenience item after core setup, without reopening D1-D7 core completion.

---

## 5.9 New Hunt and Admin approval

The original guide proposes:

New Hunt → `pending_approval` → Admin approval.

This conflicts with the current architecture.

### Current rule

Organizer creates a draft and can publish it when:
- required setup is complete;
- selected template is approved/runtime-selectable;
- backend readiness passes.

### Recommendation

Keep this rule.

Do not introduce per-Hunt Admin approval unless a future compliance or event-governance requirement explicitly needs it.

---

## 5.10 Independent Organizer

The original guide treats Independent Organizer as normal sign-up + OTP.

Current architecture intentionally leaves Independent Organizer unresolved.

### Status

⚠ Architecture decision pending

Do not build OTP-based Independent Organizer registration just to match the original API guide.

---

# 6. Revised Creator flow

The original guide correctly identifies Creator Studio as a separate workflow, but its API model is too shallow.

It proposes:
- list templates;
- create template;
- edit template.

The actual mockup and plan require versioned review workflow.

---

## 6.1 Creator login

### Existing API

`POST /api/auth/creator/login`

### Status

✅ Implemented

Creator provisioning still needs Admin-controlled account creation/invitation.

---

## 6.2 Creator template dashboard

### Planned API

`GET /api/templates?owner=me&status=...`

or a Creator-focused read model:

`GET /api/creator-dashboard/templates`

### Recommendation

Prefer the resource API first.

Dashboard counters can be derived or returned as metadata.

### Status

⬜ Phase F12

---

## 6.3 Create template draft

Do not immediately submit on create.

### Planned API

`POST /api/templates`

Creates:
- template identity;
- first draft version.

### Response

Template + draft version.

### Status

⬜ Phase F1/F2

---

## 6.4 Read/edit draft version

### Planned APIs

- `GET /api/templates/:templateId`
- `GET /api/templates/:templateId/versions/:versionId`
- `PATCH /api/templates/:templateId/versions/:versionId`

### Rule

Only editable draft/change-requested versions may be changed.

Approved/submitted versions are immutable.

---

## 6.5 Template checkpoints/features

Depending on final persistence model, use either:

A. one structured version payload; or

B. nested resources.

Preferred initial prototype:

Keep a normalized relational model where lifecycle/security requires it, but avoid unnecessary endpoint fragmentation.

Possible nested APIs:

- `PUT /api/templates/:templateId/versions/:versionId/setup`
- `PUT /api/templates/:templateId/versions/:versionId/checkpoints`
- `PUT /api/templates/:templateId/versions/:versionId/route`
- `PUT /api/templates/:templateId/versions/:versionId/safety`

### Status

⬜ Phase F3-F8

---

## 6.6 Validate template version

### Planned API

`POST /api/templates/:templateId/versions/:versionId/validate`

Returns structured readiness issues.

### Status

⬜ Phase F10

---

## 6.7 Submit template version

### Planned API

`POST /api/templates/:templateId/versions/:versionId/submit`

### Rule

- validation must pass;
- version becomes locked;
- Admin review record/queue entry created;
- submission timestamp recorded.

### Status

⬜ Phase F11

---

# 7. Revised Admin flow

## 7.1 Admin bootstrap

The original guide starts with Admin login but does not address how the first Admin exists.

### Planned mechanism

Trusted operational bootstrap, not a public API.

Example direction:

`npm run bootstrap-admin`

or equivalent controlled command.

### Status

⬜ Phase E6

---

## 7.2 Admin login

### Existing API

`POST /api/auth/admin/login`

### Status

✅ Backend complete / FE pending

---

## 7.3 2FA

The original guide assumes email OTP 2FA.

Current system does not implement real 2FA.

### Recommendation

Do not add fake 2FA APIs.

For the prototype:
- use real email/password Admin login;
- protect Admin routes;
- explicitly defer real 2FA.

If later implemented, it must use a real challenge lifecycle with expiry, retry/rate limits and auditability.

### Status

⚠ Deferred security feature

---

## 7.4 Admin dashboard

The original proposal for one aggregate dashboard endpoint is reasonable.

### Planned API

`GET /api/admin/dashboard`

### Purpose

Read-model aggregation only.

Possible response:

- next template review;
- template counters;
- active safety alert count;
- locked/attention Hunt count;
- latest privileged audit event.

### Dependency

Do not build this before underlying domains exist.

### Status

⬜ Phase L / after template + safety + audit domains

---

## 7.5 Organizer application review

This flow was missing from the original Admin section.

### Existing APIs

- `GET /api/organizer-applications`
- `POST /api/organizer-applications/:id/approve`
- `POST /api/organizer-applications/:id/reject`

### Status

🟠 Backend complete / FE pending

This is the immediate Admin UI priority.

---

## 7.6 Creator provisioning

The original guide does not include Creator account provisioning.

### Planned Admin API

Possible shape:

`POST /api/admin/creator-invitations`

or:

`POST /api/admin/users/:id/roles/creator`

depending on whether the Creator is new or existing.

### Recommendation

Use an invitation/activation flow for a new Creator.

Do not expose public Creator signup.

### Status

⬜ Phase E12

---

## 7.7 Template review

The original guide correctly identifies review listing and decision APIs, but review should be version-based.

### Planned APIs

- `GET /api/admin/template-reviews?status=...`
- `GET /api/admin/template-reviews/:reviewId`
- `POST /api/admin/template-reviews/:reviewId/approve`
- `POST /api/admin/template-reviews/:reviewId/request-changes`
- `POST /api/admin/template-reviews/:reviewId/reject`

### Recommendation

Use explicit commands rather than a generic PATCH decision field.

This gives clearer authorization, validation, audit logging and state transitions.

### Status

⬜ Phase G

---

## 7.8 Admin Hunt oversight

The original guide proposes:

- `GET /api/v1/admin/hunts`
- `GET /api/v1/admin/hunts/:id`

This is reasonable as a privileged global read model.

### Planned APIs

- `GET /api/admin/hunts?status=...`
- `GET /api/admin/hunts/:id`

### Rule

Read-only initially.

Do not let Admin silently replace Organizer lifecycle authority without an explicit governance rule.

### Status

⬜ Phase L2

---

## 7.9 Reward inventory

The original guide maps hidden prize lots to leaderboard positions.

This is useful, but should remain separate from Hunt reward configuration.

### Planned resources

- `GET /api/admin/prize-lots`
- `POST /api/admin/prize-lots`
- `PATCH /api/admin/prize-lots/:id`

Inventory/allocation:

- `GET /api/admin/reward-inventory`
- `PATCH /api/admin/reward-inventory/:allocationId`

Later runtime:

- reservation
- winner assignment
- fulfillment

### Important distinction

Organizer sees:
- reward availability/configuration abstraction.

Admin sees:
- hidden physical item identity;
- stock;
- lot;
- fulfillment state.

Participants see:
- only what product rules allow, often not prize identity until results.

### Status

⬜ Phase L4 / K5

---

# 8. Participant runtime APIs missing from the original guide

The original API document stops before the actual Hunt gameplay architecture.

The following API families are required by the current plan.

---

## 8.1 Team membership

Planned:

- `GET /api/hunts/:huntId/team`
- `POST /api/hunts/:huntId/teams`
- `POST /api/hunts/:huntId/teams/:teamId/members`

Exact route shape may be simplified after H2-H4 design.

---

## 8.2 Readiness/start gate

Planned:

- `PUT /api/hunts/:huntId/readiness`
- `GET /api/hunts/:huntId/runtime-state`

Backend determines whether participant/team may start.

---

## 8.3 Checkpoint state

Planned:

- `GET /api/hunts/:huntId/runtime`
- `GET /api/hunts/:huntId/checkpoints/:checkpointId`

Return only participant-safe content.

Never return protected answers or unreleased solutions.

---

## 8.4 Answer submission

Planned:

`POST /api/hunts/:huntId/checkpoints/:checkpointId/attempts`

Required:

- server-side answer validation;
- idempotency key;
- retry rule enforcement;
- score-event generation.

---

## 8.5 Hint use

Planned:

`POST /api/hunts/:huntId/checkpoints/:checkpointId/hints/:hintId/use`

Persist:
- participant/team;
- timestamp;
- penalty/effect;
- one-time/repeat rules.

---

## 8.6 Progress restore

Planned:

`GET /api/hunts/:huntId/my-progress`

The frontend must restore confirmed backend state after reload/reconnect.

---

# 9. Live operations APIs missing from the original guide

## 9.1 Organizer monitor

Planned:

`GET /api/hunts/:huntId/monitor`

Read-model response may contain:

- Hunt state;
- teams;
- readiness;
- checkpoint progress;
- scores;
- active help/safety incidents;
- last update timestamp.

Start with periodic polling.

Do not introduce WebSockets until live requirements justify them.

---

## 9.2 Supervisor assignment

Planned:

- `GET /api/hunts/:huntId/roles`
- `POST /api/hunts/:huntId/roles/supervisors`
- `DELETE /api/hunts/:huntId/roles/supervisors/:userId`

---

## 9.3 Help / PANIC

Planned:

- `POST /api/hunts/:huntId/help-requests`
- `GET /api/hunts/:huntId/help-requests`
- `POST /api/hunts/:huntId/help-requests/:id/acknowledge`
- `POST /api/hunts/:huntId/help-requests/:id/resolve`

Optional location is accepted only with explicit participant permission.

---

# 10. Results and reward runtime APIs

## 10.1 Results

Planned:

- `GET /api/hunts/:huntId/leaderboard`
- `GET /api/hunts/:huntId/results`
- `GET /api/hunts/:huntId/my-result`

Backend is authoritative.

---

## 10.2 Special Awards

Planned runtime calculation endpoint may be internal rather than public.

Possible command:

`POST /api/hunts/:huntId/finalize-results`

This could:
- calculate final scores;
- apply tie rules;
- calculate Special Awards;
- persist stable results.

Do not calculate final results only in the browser.

---

## 10.3 Reward assignment

Planned admin/internal resources should distinguish:

- configured reward;
- winner;
- reservation;
- granted/fulfilled state.

---

# 11. Long-term Participant APIs

Planned after stable results exist:

- `GET /api/me/hunt-passport`
- `GET /api/me/mission-history`
- `GET /api/me/achievements`
- `GET /api/me/rewards`

These must derive from persisted completed Hunt data.

---

# 12. Custom Hunt request APIs

The original guide does not cover the mockup's “Ask for a new Hunt” professional workflow.

Planned:

- `POST /api/custom-hunt-requests`
- `GET /api/custom-hunt-requests` for authorized Organizer
- `GET /api/admin/custom-hunt-requests`
- `POST /api/admin/custom-hunt-requests/:id/assign-creator`
- `POST /api/admin/custom-hunt-requests/:id/close`

Implement only after the Creator/Admin template lifecycle exists.

---

# 13. Dashboard aggregate endpoints

Aggregate endpoints are acceptable when they represent UI read models, not domain authority.

Good examples:

- `GET /api/admin/dashboard`
- `GET /api/hunts/:id/monitor`

They may combine data from multiple tables/services for efficient screen loading.

Do not put mutation/business rules into dashboard endpoints.

---

# 14. Error conventions

Continue predictable JSON error shapes.

Example:

```json
{
  "error": "invalid_input"
}
```

Common classes:

- `400 invalid_input`
- `401 invalid_credentials`
- `401 invalid_refresh`
- `403 forbidden`
- `404 not_found`
- `409 invalid_hunt_state`
- `409 conflict-specific-code`
- `422 hunt_not_ready`

Do not leak:
- password state;
- whether an unauthorized account exists;
- SQL/PostgreSQL details;
- activation token hashes;
- protected answers/solutions.

---

# 15. Pagination, filtering and sorting

Add pagination only where datasets can reasonably grow.

Likely candidates:

- Admin users
- Admin Hunts
- template review list
- Creator templates
- Organizer applications
- audit log

Recommended query style:

`?status=pending&page=1&pageSize=25`

Keep early prototype APIs simple until volume justifies more abstraction.

---

# 16. Idempotency and concurrency

Important mutation APIs should be designed for retries.

Examples:

- participant enrollment;
- activation;
- Hunt access generation;
- answer submission;
- scoring;
- result finalization;
- reward reservation.

Use:
- unique constraints;
- conditional SQL updates;
- row locking where necessary;
- explicit idempotency keys for client-retry-sensitive gameplay commands.

---

# 17. Security requirements

### Authentication

Bearer access token for protected APIs.

Refresh token rotation for registered users.

Guest sessions remain limited and short-lived.

### Authorization

Use authoritative roles from PostgreSQL.

Never rely only on legacy `users.role`.

### Activation

Store only hashed activation credentials.

Plain activation token is returned/delivered once.

### Creator/Admin

No public self-service privileged signup.

### Participant content

Do not return unreleased:
- correct answers;
- solutions;
- future checkpoint content where hiding is required.

### Rate limiting

Add targeted rate limiting before public production use for:

- login;
- activation;
- join/enrollment;
- help/PANIC;
- answer submission.

---

# 18. Dev and production transport

## Development

Browser
→ `https://tedixhunt-fe-dev.anainfo.ai`
→ direct API call
→ `https://tedixhunt-be-dev.anainfo.ai`
→ PostgreSQL

CORS is configured by backend `WEB_ORIGIN`.

## Production target

Browser
→ `https://tedixhunt.com`
→ `/api/*`
→ nginx reverse proxy
→ Node API
→ PostgreSQL

The API resource design should not depend on whether nginx or CORS is used.

---

# 19. API implementation status matrix

| Area | Status | Main API direction |
|---|---|---|
| Participant auth | ✅ Implemented | `/api/auth/participant/*`, `/api/auth/guest` |
| Organizer login | ✅ Implemented | `/api/auth/organizer/login` |
| Organizer application | ✅ Implemented | `/api/organizer-applications` |
| Organizer approval | 🟠 BE ready / Admin FE pending | approve/reject endpoints |
| Organizer activation | 🟠 BE ready / FE pending | `/api/auth/organizer/activate` |
| Admin login | 🟠 BE ready / FE pending | `/api/auth/admin/login` |
| Creator login | ✅ Implemented | `/api/auth/creator/login` |
| Hunts | ✅ Core implemented | `/api/hunts` |
| Hunt lifecycle | ✅ Implemented | explicit command endpoints |
| Hunt access code | ✅ Implemented | `/api/hunt-access/:code` |
| Hunt reward configuration | ✅ Implemented | `/api/hunts/:id/rewards/*` |
| Participant enrollment | ⬜ Planned | Hunt participant resource |
| Teams/readiness | ⬜ Planned | Phase H |
| Creator template persistence | ⬜ Planned | `/api/templates/*` |
| Admin template review | ⬜ Planned | `/api/admin/template-reviews/*` |
| Live monitor | ⬜ Planned | `/api/hunts/:id/monitor` |
| Help/PANIC | ⬜ Planned | Hunt-scoped help requests |
| Results | ⬜ Planned | leaderboard/results |
| Admin Hunt oversight | ⬜ Planned | `/api/admin/hunts/*` |
| Physical reward inventory | ⬜ Planned | Admin inventory resources |
| Passport/history | ⬜ Planned | `/api/me/*` |
| Custom Hunt requests | ⬜ Planned | `/api/custom-hunt-requests` |

---

# 20. Changes required in Implementation Plan v2.0

The API walkthrough does not require a major reordering of the current plan.

The current dependency order remains sound.

However, the plan should gain the following explicit items.

## 20.1 Add Organizer Hunt duplication

Add a planned Organizer convenience feature:

`POST /api/hunts/:id/duplicate`

This does not reopen the completed D1-D7 core setup milestone.

## 20.2 Add dashboard/read-model APIs as implementation notes

Document that:

- Organizer summary counters may initially be derived from `GET /api/hunts`;
- Admin dashboard may later use `GET /api/admin/dashboard`;
- Organizer Monitor may later use `GET /api/hunts/:id/monitor`.

## 20.3 Explicitly reject per-Hunt Admin approval as a default rule

Admin approves reusable template versions.

Organizer Hunt publication remains backend-readiness controlled.

## 20.4 Explicitly keep real 2FA deferred

The mockup's Continue to 2FA screen is not an API contract.

Real 2FA is a separate security feature.

## 20.5 Add API contract governance

For each future implementation step:

1. define API request/response/error contract;
2. add/update OpenAPI;
3. implement backend + tests;
4. connect FE;
5. verify deployed behavior.

This should be part of every Codex task involving FE/BE integration.

---

# 21. Recommended next API sequence

From the current project state:

1. Bootstrap first Admin — operational mechanism, not public API.
2. Connect FE to `POST /api/auth/admin/login`.
3. Protect Admin routes.
4. Connect Admin Organizer Application list/approve/reject.
5. Connect Organizer activation page to `POST /api/auth/organizer/activate`.
6. Implement Admin-controlled Creator invitation/provisioning.
7. Build Creator template domain APIs.
8. Build Admin template review APIs.
9. Replace static template catalog with approved DB versions.
10. Build participant enrollment/team/runtime APIs.

This remains aligned with Implementation Plan v2.0.

---

# 22. Final API architecture rule

Do not design APIs around screen names alone.

Use this hierarchy:

```text
User identity / roles
        ↓
Domain resources
        ↓
Explicit lifecycle commands
        ↓
Screen-specific read models where useful
```

For TedixHunt:

```text
Auth
→ Organizations
→ Templates / Versions
→ Hunts
→ Participants / Teams
→ Runtime / Attempts / Scores
→ Help / Safety
→ Results / Rewards
→ Passport / History
```

This keeps the API coherent while still supporting the existing mockup efficiently.
