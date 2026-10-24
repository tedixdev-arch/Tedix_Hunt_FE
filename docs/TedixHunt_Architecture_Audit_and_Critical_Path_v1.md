# TedixHunt Architecture Audit and Critical Path v1

Audit date: 24 October 2026. Scope: independent source, contract, test and dependency audit; no application changes, migration, merge or deployment.

Baseline: FE main **19b780d10eae71292bbd17bab279ca099bf94a0e**, including merged PR #112; BE main **4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8**. All source links below are pinned to these commits. “v3.6 audit” describes the task, not a revision of the v3.5 plan. The existing plan remains unchanged.

## 1. Executive summary

**TedixHunt has a real professional/content/setup foundation, but no authoritative playable Hunt.** Creator-owned immutable versions, exact submitted-version Admin review, approved catalog selection, server-created Hunt snapshots, draft setup, reward configuration, publication and code lookup exist. The first unconditional lifecycle break is **resolved invitation → authenticated, eligible, persisted Hunt enrollment**. Authentication works; membership, team/start/recovery APIs do not. Gameplay, Monitor, terminal completion and results remain client prototypes or absent. [B-app] [B-access] [B-participant] [F-join] [F-access-page]

**Repair security before extending runtime.** Public applications can establish a password on an existing passwordless identity, including a provisioned Admin; Tedix-linked participant login accepts an unverified identifier. Both are high-confidence source-level credential bypasses. Approved geography is readable by any authenticated identity, defeating future hidden-objective confidentiality. Combined Creator/Admin self-review is unenforced. The reported account-removal gap is real in source: four Creator foreign keys are omitted, so otherwise dependency-free removal is expected to roll back on an FK error instead of retiring the account. This is not evidence of destructive deletion or a reproduced deployed failure. [B-creator-app] [B-organizer-app] [B-admin-provision] [B-auth] [B-review] [B-template] [B-user] [B-m015] [B-m016]

**Shortest safe proof:** secure identity/inspection/review → agree a narrowly controlled pilot and runtime contracts → retain a reviewed immutable one-normal-checkpoint-plus-FinishPoint artifact → authoritative enrollment/team/start → one shared GPS/challenge/progress/score engine → independent sessions and recovery → Organizer monitoring, actual HELP/PANIC and suspension handling → backend terminal completion and final results. Prove one normal checkpoint before adding the terminal role; prove this two-stop slice before the remaining Signal route.

Full Universal community reuse, provider locality search and polished D10 setup are not technical prerequisites to that controlled proof. The current plan nevertheless orders them ahead of runtime. **Product Owner approval is required to stage them on a parallel track under an explicit legacy/pilot compatibility rule.** No automatic classification, altered historical versions, skipped human route review or public launch is proposed. Without that approval, execute the full F7/G4/D10 track first. [Plan]

Current-head CI evidence is stronger than some historical plan summaries: FE reports **226 Node tests plus 263 UI tests**, BE **819 tests** with disposable PostgreSQL preparation. Both have successful dev-deployment jobs, which establish reported pipeline execution, not current serving revisions or a playable journey. This audit independently reran **226 FE Node tests: passed**. No local BE/PostgreSQL reproduction, local UI/browser run, live Mapbox test or deployed multi-user E2E was performed. [CI-FE] [CI-BE]

**First recommended implementation PR:** BE-only, prevent public applications from claiming existing passwordless identities; preserve new self-registration, legitimate activation and existing credentials. See sections 9–10. All subsequent work remains separate, small Draft PRs, with user-controlled merge/deployment.

## 2. Evidence model and actual implementation status

The entire v3.5 plan, including all A–N context views, was reviewed against both pinned repository trees, relevant sources, schema/migrations, OpenAPI annotations, tests and CI logs. A diagram's implemented node means only its named scope. Neither an API name in the historical integration guide nor a model helper establishes an exposed workflow.

Status terms: **tested implementation** means source plus relevant automated coverage, with limitations stated; **unverified implementation** means source exists without sufficient journey evidence; **partial**, **prototype**, **absent**, and **decision-blocked** are distinct. “Database” below means schema/model evidence, not independently inspected deployed data. No row claims independently verified deployed E2E.

| Phase | FE evidence/status | BE evidence/status | Database evidence/status | Verification and remaining boundary |
| --- | --- | --- | --- | --- |
| A Platform | Tested API/session/AuthProvider and guards; browser storage and refresh retry | Tested auth, health, migration/readiness foundation | Users, roles, refresh and activation records/migration history | CI build/tests and dev-deploy jobs succeeded; no fresh live identity journey or restore proof. Authentication exceptions D01/D02/D07 below remain. [F-session] [F-client] [B-auth] [B-app] |
| B Identity/authority | Workspaces consume authenticated contexts; runtime choices say “Runtime coming next” | user_roles and explicit Hunt roles real; B6 automatic supervision/allocation/full Admin operations absent | Membership and role rows real; no assignment/revocation workflow | Tested current scopes, not complete target authority. [B-m003] [B-context] [B-role] [F-workspaces] |
| C Hunt foundation | Real create/list/edit/lifecycle API wiring | Conditional lifecycle transitions and persisted publish readiness | Hunt state, organization/provenance, snapshot fields | Tested setup scope. Start/finish are status commands, not gameplay gates/completion. [B-hunts] [B-hunt] [B-readiness] |
| D Organizer setup | D1–D7 integrated; D8 real explicit read-only preview; Monitor mock | Draft update, approved resolution, access generation, rewards CRUD | Saved setup/options/reward definitions/snapshot/access code | D9 allocation and D10 canonical-location/automatic preview absent. Source snapshot integrity tested; deployed supply chain outstanding. [F-editor] [F-geography] [B-hunts] [B-rewards] |
| E Professional lifecycle | Real applications, provisioning/activation, Admin account security | Real credential/capability transactions and last-Admin protections | Application/activation/account status records | Plan reports historical deployed E flows; not independently rerun here. D01 exposes a credential-establishment flaw despite passing tests. [B-creator-app] [B-organizer-app] [B-admin-provision] [F-admin-users] |
| F Creator | Real save/reopen/version/submit and Mapbox geography/FinishPoint editing; local Participant Preview | Owner-scoped immutable version allocation, submission, unused-draft deletion and fixed starters | Template identity/version JSONB, provenance, submitted pin | F4–F6 authoring tested; no gameplay engine. F7 Universal/Local/community/locality/evidence workflow absent. Changes-requested revision loop blocked. [F-studio] [F-persistence] [B-template] [B-creator-domain] |
| G Governance | Exact-version review actions and geographic preview integrated | Approve/request-changes and approved Creator pin implemented | Submitted artifact composite FK/invariants; no reviewer decision/evidence ledger | Self-review guard absent; category/evidence/expiry/withdrawal absent. No independently proven deployed handoff. [B-review] [B-template] [B-m018] [B-m019] [B-m020] |
| H Enrollment | Public code resolves identity/status; join authenticates only; readiness screen static | Code lookup real; no protected enrollment/team/lobby/readiness/start/recovery APIs | HuntParticipant.enroll, Team helpers and same-Hunt composite FKs exist | Structural partial implementation; the end-to-end break. Model idempotency is not an enrollment workflow. [B-access] [B-participant] [B-team] [F-join] [F-readiness] |
| I Gameplay | TemplateOneExperience/useTemplateOneMission use local answers, timers, reducer and sessionStorage; Creator preview manually resolves activities | Gameplay vocabulary and authoring validation only; runtime routes absent | No attempts, contributions, runtime checkpoint/progress, GPS evidence or score-event tables | Prototype only; no authoritative arrival, validation, idempotent scoring, recovery, terminal completion or suspension. [F-game] [F-mission] [B-gameplay] [B-app] |
| J Operations | initialTeams/local Monitor controls and local SafetyDialog | Generic Hunt state commands only; no live progress/location/incidents/suspension APIs | No runtime operations/incident/latest-location records | Prototype. Actual persisted-snapshot inspection within Monitor does not make team progress live. [F-monitor] [F-game] [B-app] |
| K Results/rewards | Prototype competition/ceremony/results; real reward configuration services | Definition/configuration CRUD only | hunt_leaderboard_rewards/hunt_special_awards are definitions, not winners/grants | Scores, ranking, eligibility, award assignment/reservation/fulfillment absent. [F-results] [B-rewards] [B-reward-domain] |
| L Admin operations | L1 core actions integrated; dashboard/inventory/settings/audit mainly samples | L1 real; other domain subsystems absent | No full audit, settings or physical inventory systems | Phase-wide “prototype only” is too coarse: L1 exists but D03 breaks a removal case. Full Admin cross-Hunt authority is planned. [F-admin-users] [F-admin] [B-user] [B-admin-users] |
| M Long-term | Passport/discovery preview only | No Passport/history/achievements endpoints | No corresponding authoritative records | Absent persistence, prototype presentation. Depends on real completed results. [F-discovery] [B-app] |
| N Requests | CustomRequestPage changes local step to “received” | No request/triage/assignment/return APIs | No custom-request records | Prototype workflow; generic F/G approval is reusable but does not implement N. [F-custom] [B-app] |

## 3. Full lifecycle: what works and exactly where it breaks

| Handoff | Actual behavior | Classification and evidence | Required proof |
| --- | --- | --- | --- |
| Creator identity → author | Approved Creator capability, owner-scoped drafts and exact version save/submit | Tested implementation with D01 security exception; geographic submission validates structure/completeness, not safe access [B-creator-routes] [B-template] [B-creator-domain] | Native registration/approval or legitimate activation; save/reopen and submit exact version |
| Creator → Admin review | submitted_version pins review artifact; concurrent status decisions lock Template identity | Tested implementation, independent reviewer guard/evidence/history absent [B-template] [B-review] | Different authorized reviewer inspects same artifact and approves; self-review rejected |
| Admin → Organizer selection | Approved Creator resolves pinned submitted version; platform resolves latest saved version | Tested generic implementation, platform approval scope differs [B-template] | Catalog selection matches reviewed key/version; stale preview rejected; no snapshot drift |
| Organizer setup → publish/start | Supported setup saved; readiness checks persisted fields; explicit lifecycle commands | Tested setup, unverified playable readiness; start does not check teams or required GPS/challenges [B-hunts] [B-readiness] | Review gate, valid pilot, actual eligible team/start policy |
| Published Hunt → code lookup | Stable generated code; public identity/code/name/status response | Tested implementation; intentionally no membership [B-access] [F-access-page] | Unknown/error states and current availability |
| Lookup/session → enrollment | /join/:code stops at “joining will be connected”; /join authenticates and discards code semantics | **Blocking gap; first guaranteed chain break.** No enrollment route registered [F-join] [F-access-page] [B-app] | Session identity plus Hunt eligibility, race-safe capacity and persisted membership |
| Enrollment → team/readiness/start | Helpers/tables, but static “Team Aurora is ready”; no real team integration | Partial DB, prototype FE [B-team] [F-readiness] | Actual independent members, approved team-size policy, readiness and lifecycle checks |
| Play → normal checkpoint | Simulated arrival timer, bundled solutions/local scoring and timed fake teammates | Prototype only [F-game] [F-mission] | Server arrival, Personal validation, real Team contribution, one transactionally durable progression |
| Normal → FinishPoint | Prototype advances through seven client-side exercises; geography/configuration authoring is real | Runtime absent [B-gameplay] [F-game] | Same authoritative engine with terminal role; reaching GPS alone never finishes |
| Terminal → results | Generic Organizer finish changes whole Hunt status; prototype ceremony uses score offsets | Absent results runtime; semantic decision required [B-hunts] [F-results] | Per-participant/team completion, Hunt closure, stable aggregation and ranking policy |
| Results → rewards/history | Configuration and sample badges exist | Absent assignment/fulfillment/history [B-rewards] [F-discovery] | Separate eligibility, winner, grant, fulfillment and long-term records |

There are conditional earlier breaks: a requested revision cannot currently be edited/resubmitted because createCreatorVersion and submitCreatorDraft accept draft only; the UI acknowledges the limitation. A legacy approved Template may pass today's generic publish readiness without usable GPS/terminal gameplay. These do not invalidate the implemented generic happy path; they prevent describing it as a guaranteed playable content supply chain.

Current runtime is not bound to the Organizer's Hunt snapshot: /play/template-1 is publicly routed, imports static content, and local state is keyed by one story storage key rather than Hunt/user/team. Fake results therefore cannot demonstrate that the selected approved artifact ran. This is a prototype boundary, not evidence of an authorization bypass against persisted gameplay, which does not yet exist. [F-router] [F-game] [F-mission]

## 4. Ranked findings: confirmed source defects and suspected risks

Confidence describes the source conclusion. Unless explicitly stated otherwise, none of these was independently reproduced against a running backend or deployment. Priorities rank impact and release urgency, not phase number.

| ID | Category / priority | Finding | Confidence / urgency |
| --- | --- | --- | --- |
| D01 | **Critical defect / P0** | Unauthenticated application may set a password on an existing passwordless privileged identity | High source confidence; fix first, before further invited users/pilot |
| D02 | **Critical defect / P0** | Bare Tedix identifier authenticates a linked identity without upstream proof | High source confidence; before further exposed authentication/runtime |
| D03 | **Critical defect / P1** | Creator references omitted from account removal retirement decision | Confirmed source integrity/lifecycle defect; expected FK rollback, not proven data loss |
| D04 | **Critical defect / P1** | Any authenticated identity can obtain approved hidden geography | Confirmed access contract; blocks confidential gameplay; multi-capability fairness decision also needed |
| D05 | **Critical defect / P1** | Creator/Admin may approve their own submitted Template | Confirmed missing enforcement; independent review required before controlled pilot |
| D06 | **Critical defect / P1** | Prototype HELP/PANIC says “Request sent” after a timer with no request | Confirmed misleading safety UI; disable false acknowledgement before participant use |
| D07 | **Critical defect / P1, conditional exposure** | Known default JWT signing secret accepted when configuration is missing | Confirmed unsafe fallback; deployed misconfiguration unknown |
| G01 | **Blocking gap / P1** | Enrollment, team/start/recovery workflow absent | High; first unconditional lifecycle break |
| G02 | **Blocking gap / P1** | Authoritative runtime, contributions, scores and terminal/results absent | High; largest implementation work |
| G03 | **Blocking gap / P1** | Version-bound operational safety evidence and enforceable pilot readiness absent | High; coordinate validity and client checkboxes cannot authorize a real route |
| A01 | **Architecture contradiction / P1** | Generic finish/start and full-content inspection do not implement target terminal/privacy semantics | High; resolve contracts before consuming these as runtime APIs |
| P01 | **Product decision / P1** | Controlled-pilot staging, team size, completion scope, GPS and fairness policies unresolved | Approval gates, not developer defaults |
| T01 | **Technical debt / P2** | Changes-requested revision loop, approval audit/withdrawal, refresh concurrency, schema duplication | High for source limitations; race effects not independently reproduced |
| F01 | **Future enhancement / P3** | Full community reuse/discovery UX, advanced geography, awards/history/custom requests | Retain explicit backlog and dependencies; no substitute for core runtime |

### D01 — public credential establishment on an existing identity

Evidence: public POST /api/creator-applications and /api/organizer-applications pass a bcrypt hash to CreatorApplications.create / OrganizerApplications.create. Both reuse by email and execute UPDATE users SET password_hash when an existing row has NULL password_hash. No proof of control of that existing identity is required. Creator rejects guests/inactive/already-Creator identities, but an active passwordless Admin lacking Creator passes that check; Organizer selects only id/password_hash at this point. AdminProvisioning.provision already grants admin before issuing a one-time activation for such a passwordless identity. [B-creator-application-routes] [B-organizer-routes] [B-creator-app] [B-organizer-app] [B-admin-provision]

Source-derived reproduction conditions: an active invited/provisioned account has no password; another party knows its email; public application submission establishes a chosen password; normal login for an already-granted professional capability can then succeed without the invitation credential or approval of the new application. This defeats activation and potentially takes over Admin authority. Existing password-backed identities are not overwritten by this branch.

Minimal safe correction: public application creation may establish credentials for a genuinely new identity, but must not establish credentials on an existing passwordless identity without validated possession/activation. Initially return a safe conflict requiring the legitimate activation path; do not invent email-as-proof or grant the requested capability. Preserve established passwords/roles and new self-registration. Decide a supported verified continuation flow separately.

Required tests: both application routes; pending/expired Admin, Organizer and Creator invitations; mixed-role accounts; no password/role/token mutation after refusal; concurrent activation/application; new applications still pending; existing password-backed credentials unchanged; normal one-time activation still succeeds. Include real PostgreSQL transaction tests. No live account was attacked during this audit.

### D02 — unverified external identifier is accepted as authentication

POST /api/auth/participant/login branches on tedixUserId, looks up a participant-capable identity and issues tokens without validating a signed upstream assertion, audience, issuer, nonce or trusted server exchange. /participant/register similarly accepts an unverified external link. app.ts exposes authRouter directly; CORS does not authenticate an API caller. The existing auth.test.ts explicitly expects 200 for a body containing only the identifier. Tokens identify the whole User and middleware reloads its authoritative roles, so impact can exceed gameplay if that identity also holds professional roles. [B-auth] [B-auth-tests] [B-app] [B-middleware]

Minimal safe first slice: fail closed for bare identifier login/linking while retaining native credentials and guest authentication. Enable external identity only after a reviewed upstream verification contract. Tests must reject identifiers without proof, forged/replayed assertions, binding conflicts and blocked/retired identities. Upstream integration/deployed victim presence is unknown; this is source-confirmed credential bypass, not a reported exploited deployment.

### D03 — User.deleteControlled: exact requested investigation

The retirement-dependency UNION checks organizations, organization_members, hunts, hunt_participants, hunt_roles and organizer_applications. It contains neither Creator applications nor Template provenance. Four concrete user FKs are omitted:

| Migration | Referencing column | Current FK behavior | Missing decision |
| --- | --- | --- | --- |
| 015 | creator_applications.user_id | NOT NULL, ON DELETE RESTRICT | Applicant of any status must be considered |
| 015 | creator_applications.reviewed_by | Nullable, ON DELETE RESTRICT | Reviewer provenance must be considered |
| 016 | hunt_templates.created_by_user_id | Nullable for platform, ON DELETE RESTRICT | Creator/platform provenance when non-null |
| 016 | hunt_template_versions.created_by_user_id | Nullable for platform, ON DELETE RESTRICT | Version provenance independent of identity-level owner |

[B-user] [B-m015] [B-m016]

**Trigger:** a removable target is not the final active Admin, has one of these references, and has none of the dependencies the existing UNION does recognize. A self-registered Creator applicant with only an application is a simple candidate; a directly provisioned Creator with only a Template is another. A reviewer who has no other protected relation is also affected. If an existing recognized dependency is present, retirement already happens and the omission is masked.

**Expected behavior from SQL, not independently reproduced runtime:** the hard-delete branch reaches DELETE FROM users; PostgreSQL rejects it with foreign_key_violation (23503); catch executes ROLLBACK. roles/tokens deleted earlier in that transaction should be restored. The Admin route handles last-Admin only, so the FK failure is expected to surface through the generic 500 handler. Existing RESTRICT constraints protect these records; do not call this cascading content loss or successful retirement. [B-admin-users] [B-app]

**Severity:** high lifecycle/referential-dependency defect under the task's Critical defect category. Permanent removal fails for ordinary Creator history; it is not the same security severity as D01/D02.

**Minimal correction:** include both Creator-application references and both Template provenance references in the durable dependency check under the current target-row transaction lock. Safest initial behavior retires any Creator-application reference, including pending, rather than inventing a disposable-Creator-application policy. Preserve all Template versions, applications, submitted pins and Hunt snapshots; keep UUID, clear credentials/roles/sessions, and never rewrite legacy role to participant. No FK weakening, cascade or historical-content migration is needed.

**Required regression matrix:** each omitted FK independently as the only protected dependency; pending/approved/rejected applicant and reviewer-only; non-null platform provenance and version-only provenance where schema-valid; mixed old/new dependencies; active/blocked identities; dependency-free hard delete still succeeds; repeated removal; last-active-Admin protection; transaction rollback on failures; retired identity cannot authenticate/refresh/activate or be restored; snapshot/content/provenance unchanged. Use all tracked migrations through 020 in disposable PostgreSQL and exercise the HTTP removal response as well as the model. User.test.ts currently mocks the dependency result and asserts only the older six tables; it cannot catch these missing FKs. HuntTemplate.integration.test.ts covers Template deletion, not account deletion. [B-user-tests] [B-template-integration]

### D04 — geography inspection is an alternate participant data leak

GET /api/hunt-templates/:key/geography has requireAuth only; its OpenAPI deliberately states there is no additional role restriction. The catalog supplies keys to authenticated callers. findApprovedHuntTemplateGeography allowlists fields but intentionally includes all saved checkpoint/FinishPoint coordinates and radii. requireAuth accepts an active guest; it does not require an inspection capability. Existing route tests explicitly allow participant role. [B-catalog-routes] [B-template-domain] [B-catalog-tests] [B-middleware]

Thus an ordinary participant/guest can inspect hidden destinations through another API even if a future runtime projection is perfect. A sparse legacy Template may return no coordinates, so practical disclosure depends on approved content containing geography; that does not remove the authorization flaw.

Fix the inspection authorization contract first, preserving valid Creator/Admin/Organizer setup access. Participant-only/guest identities must not download privileged route content. Also settle eligibility when a participant has legitimate professional inspection authority: UI hiding cannot undo their prior knowledge. A controlled pilot can exclude privileged content authors/reviewers from ranked participant sessions under explicit rules; broader competition eligibility needs Product Owner approval. Do not simply delete inspection or restrict all existing professional consumers without compatibility tests.

### D05 — independent Template review is not enforced

adminTemplateReviews calls approveSubmittedCreator(key), without the caller's identity; the model checks submitted state/pin but not created_by_user_id against reviewer. A User with both Creator and Admin can submit, then approve its own artifact. requestChanges likewise has no reviewer identity/audit. Exact-version pins are valuable, but do not prove independent review. [B-review] [B-template]

Pass the actor to an atomic decision, reject self-approval under the approved policy, preserve the exact submitted pin, and persist minimal reviewer/version/outcome/time evidence. Test combined-role self-approval denial and different-Admin success, missing/changed pin, concurrent decisions and unchanged snapshots. Whether self-request-changes is permitted is a narrower Product decision; it must not become self-approval. The plan itself records combined-capability enforcement as unresolved, so this audit flags an unenforced required safeguard rather than claiming a newly implemented guard regressed.

### D06/D07 — safety acknowledgement and signing configuration

SafetyDialog.startHold sets sent=true after two seconds and renders “Request sent” without contacting a backend; ParticipantReadinessPage promises it sends location/status. OrganizerMonitor resolves sample alerts locally. Before any real participant use, a narrow FE correction must clearly identify simulation and remove false delivery acknowledgement. Actual HELP/PANIC must show server-confirmed receipt, explicit pending/failure/retry and disconnected contact fallback. Never advertise emergency coverage from this prototype. [F-game] [F-readiness] [F-monitor]

readEnvironment defaults jwtSecret to a public constant; lib/jwt signs/verifies with it. Missing or unsafe signing configuration must fail startup outside explicit disposable test configuration. Do not disclose or rotate live secrets in an audit. No credential value or live secret was inspected, so actual deployed signing-key weakness remains unverified. [B-environment] [B-jwt]

### Other source limitations and suspected risks

- **Publish versus edit race, suspected:** hunts.ts reads readiness, then transitionStatus conditions only on source status. A concurrent allowed draft update can occur between those operations; approval resolution and snapshot update are also separate operations. Prove races in PostgreSQL before claiming a failed live publication. Resolve approved-artifact/playability gating and readiness in one transaction in the pilot publication slice. [B-hunts] [B-hunt]
- **Concurrent enrollment helper, suspected:** HuntParticipant.enroll uses INSERT ... ON CONFLICT DO NOTHING plus same-statement SELECT; under READ COMMITTED a concurrent conflict can leave no visible result for that statement's snapshot. Current model tests mock rows. Design a serialized/correctly retried public enrollment command with race tests rather than exposing this helper unchanged. [B-participant]
- **Refresh race, suspected:** ApiClient refreshes each 401 independently while RefreshToken.consume is single-use. Parallel requests can consume the same credential and one failure can clear a newly rotated client session. No independent race reproduction here; use shared in-flight refresh and test token races before relying on reconnect. [F-client] [B-refresh]
- **Password/logout session semantics:** current changes revoke refresh tokens, not all already-issued access tokens; requireAuth checks current account/roles but no password/session epoch. Blocking/retirement are immediately denied by account status; password change/logout may leave access usable until configured expiry. Do not claim immediate access-token revocation. Whether stricter revocation is required for the pilot is a security/product decision. [B-user] [B-auth] [B-middleware] [B-jwt]
- **Validation is not executable gameplay:** checkpointGameplayTypes derives allowed vocabulary from canonical Signal; Creator validation accepts optional kind/teamKind/navigationMode fields and checks structure/geography. It does not prove supported authoritative evaluator content for every saved Template. A pilot runtime compiler/validator must reject unexecutable configurations without changing legacy readability. Normal radius currently accepts finite 5–500 values in BE while FE and FinishPoint require integers; reconcile future writes explicitly and preserve old content. [B-gameplay] [B-creator-domain] [F-checkpoint-geo]
- **Operational debt:** backups/restores/rollback ownership, targeted abuse limits, XSS exposure of browser-stored tokens, refresh-token storage hardening, migration/schema duplication and database-level immutable-content protection deserve dedicated work. LocalSessionStore token storage is evidence of exposure to any successful same-origin script compromise, not proof that an XSS exists. Version rows currently rely on model/API immutability rather than an UPDATE-prevention trigger. [F-session] [B-template] [Plan]
- No claim is made that maps/providers, accessibility, GPS spoof resistance, deployed indexes/data or infrastructure policies were exhaustively penetration-tested.

## 5. Architecture consistency assessment

Most new diagrams label runtime/category work as planned correctly. The serious problem is treating narrow implemented foundations as complete operational guarantees.

| Plan contract / diagram claim | Actual implementation | Audit treatment |
| --- | --- | --- |
| Account controls access; platform records survive removal | Retirement exists, but omits four Creator FKs | D03; retain architecture and repair dependency coverage |
| Self-registration reuses one identity and may establish credentials if passwordless | No proof of ownership for an existing invited identity | D01; clarify legitimate identity possession, preserve one-identity design |
| Creator cannot approve own work; Admin governs exact versions | Admin role check/pin, no actor self-review check or approval ledger | D05; exact-version authority is real but independent governance incomplete |
| Authorized full-route inspection distinguished from Participant-safe projection | Geography route is open to every authenticated identity | D04; audit every alternate endpoint, not only runtime responses |
| Responsible Organizer automatically supervises own Hunt | Hunt creation inserts organizer only; HuntContext reads explicit supervisor only | Planned B6 gap, not a global Supervisor role; derive effective authority centrally |
| Admin full platform/domain operational authority | Current Hunt read/edit/lifecycle require scoped roles, not global Admin override | Planned B6/L2 gap; avoid inventing blanket implemented access |
| Framework defines mechanics; Template configures them | Vocabulary is derived from one canonical Signal dataset | Runtime validator/evaluator registry must make supported availability explicit; do not create separate Universal/Local engines |
| Publication and finished lifecycle state | Current readiness is setup-only; generic finish can set whole Hunt finished | Keep lifecycle control distinct from proven participant/team terminal success and results eligibility |
| Personal/Team challenges and configurable behavior | Configuration vocabulary/preview exists; client reducers validate bundled answers and simulate readiness | Prototype UX reusable; no authoritative progress or actual teammate contribution |
| Persistent Participant Mapbox map and clue-only discovery | TedixMap real in authoring/inspection; participant NavigationScreen uses prototype maps/timers/external directions | Reuse map adapter, not full-route authoring projection or simulated arrival |
| Geographic safety | FE checks/confirmation are transient; BE structural submission only | Minimum version-bound human evidence/publish gate mandatory; full automation can follow |
| Immutable version and Hunt snapshot | Creator pin and exact content copying implemented; platform uses latest saved version | Preserve current platform behavior for compatibility; approve/restrict the pilot artifact explicitly; later version-scoped governance must not rewrite history |
| Approval/request-changes loop | Changes-requested state/pin exists; editing/submitting require draft | Known partial lifecycle; implement explicit new-version revision transaction later, not mutable edits |
| Rewards/Passport/Admin subsystems | Definitions/sample displays, absent runtime persistence | Keep config, eligibility, assignment, grant, fulfillment and history distinct |

The historical API integration guide contains obsolete proposed Template routes, post-application Organizer activation and “FE pending” labels now superseded by the actual APIs/v3.5 plan. It is not current contract authority. Section 17 of the plan still refers to fake 2FA while A6/E7 correctly say it is removed from active login; no new fake-2FA implementation is needed. This audit changes neither historical document. [API-guide] [F-router] [Plan]

## 6. Product Owner decisions requiring explicit approval

These are proposals to review, not silently adopted requirements. Security fixes must fail closed while the richer product flow is decided.

| Decision | Required before | Proposed smallest safe scope / alternatives |
| --- | --- | --- |
| P1 Controlled-pilot ordering and legacy eligibility | Runtime implementation on shortened path | Approve one explicitly reviewed, geographically complete, unclassified pilot artifact under section 14 compatibility, with recorded operating conditions and no general/public launch. Otherwise deliver full F7/G4/D10 before H/I as the current plan states. Never infer “Local” from coordinates. |
| P2 Team membership/contribution | Enrollment/team contracts | Current only supported teamSize is 4. Use **four independent real sessions** for a full team, satisfying the minimum of two; two are a minimum observation requirement, not authority to lower team size or fake the other members. Alternatively explicitly approve/support a two-person pilot in a separate BE contract/PR. Decide formation, leave/rejoin and incomplete-team start policy. |
| P3 GPS/test policy | Arrival/evidence awards | Named controlled test mode/environment, supplied sample policy, radius interpretation, accuracy ceiling, sample age/window, retry and poor-GPS fallback; real-phone test required. Retain historical 5–500 m radii and current 15 m authoring default; do not treat 5 m as guaranteed accuracy. No unguarded client “test GPS” switch in production. |
| P4 Completion scope | Terminal/results contracts | Define per-participant/team terminal success separately from global Hunt closure; define competition deadline, Organizer force-end/cancel and incomplete teams. A first finisher must not silently finish all teams; forced closure cannot fabricate a successful FinishPoint. |
| P5 Suspension fairness | Runtime suspension and results | Define earned score preservation, omitted opportunities/ranking eligibility, timers, all-normal-suspended behavior, reactivation and suspended terminal behavior. Existing “no automatic penalty; bypass is not solved” invariant remains. |
| P6 Review/safety/availability | Pilot approval/publication | Independent reviewer identity, checkpoint/segment/access evidence, validity and conditions, expiry/withdrawal on future publication/active Hunts; minimum enforceable pilot evidence first, proportional workflow later. Human review never becomes provider certification. |
| P7 Guest eligibility/recovery | Public enrollment release | Guests currently have a 1h access token and no refresh. Use registered native participants for the first recovery proof; explicitly reject unsupported guest enrollment until safe recovery/access policy exists, while preserving guest authentication/prototype. |
| P8 Privileged-player eligibility and location privacy | Competitive pilot/operations location | Professional inspection and fair participant eligibility; latest-location audience/TTL/consent/deletion and separate incident evidence retention. Monitoring progress needs no continuous location trail. |
| P9 External identity continuation | Re-enable Tedix linking or existing passwordless application continuation | Verified upstream exchange / valid activation possession, not email or ID assertions. Disable unsafe branches pending contract. |
| P10 Ranking and awards | Final results/awards | Exact scoring, Personal/Team aggregation, tie-breaks, time bounds, exclusions/late joins/suspensions; configured optional rewards do not require fulfillment to prove core results. |
| P11 Full F7/G4 design | Parallel category track | Versioned classification/provenance, cross-Creator copy authorization, provider/license/coverage, dedup/manual lookup, review expiry and legacy rollout. Do not assume Mapbox is the locality identity provider. |
| P12 Independent Organizer | Any real publication from that route | Choose identity/access model; current ?mode=independent remains an isolated prototype, never an auth bypass. Personal Hunt authoring is a separate deferred capability. |

## 7. Minimum Complete Hunt: concrete acceptance contract

A controlled acceptance artifact contains **one normal checkpoint and one terminal FinishPoint** in the existing geographic fields, plus executable story/clue, Personal and Team activities and score rules. Produce a **new** Creator-owned artifact/version through normal persistence and independent Admin review; do not truncate or mutate canonical Signal, Overload, historical approvals or existing snapshots. Current normalCheckpointCount supports one; authoring/submission already supports normal and terminal structure. Vocabulary selectors are not complete configurable challenge authoring: the pilot needs a validated server-side content/evaluator contract and persisted clue/answer/contribution payloads. Do not claim temporary custom controls already save these. Use newly authored server-held challenge data; copying answers already shipped in a public prototype bundle would not establish answer secrecy. [B-creator-domain] [F-persistence] [F-gameplay]

Reuse: native authentication and role/owner guards after security repairs; organizations/registered Organizer; exact immutable version and submitted pin; approved resolution/snapshot mechanism; Hunt lifecycle/setup/access code; Team/membership schema and same-Hunt constraints; TedixMap/Mapbox camera/resource handling; geography/radius validation; existing story/challenge UX and starter content as reference; optional reward configuration.

Build: verified ownership boundaries, independent approval/evidence, pilot playability gate, enroll/eligibility/capacity transactions, team/readiness/start/rejoin commands, participant-safe projection, checkpoint identity mapping, authoritative evaluators, Personal attempts and actual Team contributions, GPS arrival, score-event uniqueness, progress/read recovery, terminal completion, monitoring, incident lifecycle, safe suspension and final results. A local reducer is a UI reference, not a migration of gameplay authority.

Release acceptance, with independent browser/device storage for each identity:

1. Record environment/date, deployed FE/BE commits and migration IDs. Creator persists/reopens/submits the exact two-stop version; a different Admin reviews route and conditions, approves; Organizer selects it, saves/reopens/publishes. Snapshot bytes/key/version remain stable after source changes. No self-review, unauthenticated inspection or hidden-data leakage.
2. At least two independent real participants enroll and contribute. Under the existing four-person contract, use four genuine identities/sessions; none is a timed “ready” substitute. Repeated joins are idempotent; concurrent last-capacity joins cannot overfill; unrelated/blocked/ineligible identities fail.
3. Real team readiness and Hunt active state gate play. One persistent Mapbox instance survives normal navigation and challenge/help/result overlays. Reload may create a new instance but restores the same authorized Hunt/progress, not another story run.
4. Before discovery, responses, bundle-delivered runtime content, errors, polling, alternate catalog endpoints and map layers exclude hidden coordinates, route geometry, answers, unreleased solutions, destination distances and other players' private answers. Reveal only permitted clues/hints.
5. Server receives timestamped location evidence under approved test policy and verifies arrival against server-held target/radius and activity state. Test in/out/stale/inaccurate/denied/missing samples and retry. Run controlled injected-location tests only through an approved environment mechanism, then real-phone field validation; browser GPS is not spoof-proof.
6. Each real participant submits at least one Personal activity; actual distinct team members supply the required contributions. One client cannot impersonate others or advance readiness by waiting. Backend validates answers, hint/solution penalties and team resolution.
7. Score/progress/attempt updates commit atomically with unique idempotency/event constraints. Retry, double tap, concurrent answer, lost response and reconnect produce no duplicate points or progress regression. Personal/private information stays private.
8. Refresh, close/reopen and transient loss recover authoritative membership, team, current clue, prior activities and score events. Client cache edits cannot award points or finish.
9. Organizer sees real team progress/scores/Hunt state. HELP/PANIC is stored, acknowledged/resolved by permitted operators; pending/failure/disconnected states are truthful. Progress polling is sufficient; latest GPS monitoring is optional pending privacy policy.
10. Demonstrate authorized suspension of the normal checkpoint and concurrency handling on a separate test run: atomic no-penalty bypass, history/earned scores retained, no “solved” fabrication. Test all-normal-suspended and terminal handling under explicit approved policy.
11. Terminal arrival unlocks the same engine; only all required activities resolved cause backend terminal success. Duplicate terminal actions are harmless. Organizer operational finish/cancel is distinct; global closure policy cannot prematurely complete other teams.
12. Backend persists final results and deterministic rankings under approved rules; each participant and Organizer see consistent results after reconnect. Optional prizes may remain unconfigured. “Winner assigned” and inventory fulfillment are not implied.

Minimum safety/authorization requirements are not optional: identity possession, independent approval, real human route/access review, operating validity, hidden-payload controls, capacity/team/lifecycle gates, explicit GPS policy, safe pause/cancel/suspension, truthful incident/contact handling and durable replay-safe state. Full worldwide locality lookup, all seven stops, public community reuse, advanced map effects, continuous live tracking, physical inventory/fulfillment, Passport/achievements and custom requests are later work. The public release must still satisfy the full planned category/catalog/safety rollout.

## 8. Dependency and critical-path analysis

Dependencies (each arrow means a required predecessor, not an implemented integration):

- **Security repairs** → safely provisioned Creator/reviewer/Organizer/participants and privileged inspection.
- **P1/P2/P3/P4/P5/P6/P7/P10 decisions + BE runtime contract** → authoritative FE integration.
- **Reviewed exact pilot artifact + version-bound evidence + atomic publish gate** → deployed content supply-chain milestone.
- **Effective Hunt authority** → scoped team operations, monitoring, incident actions and suspension.
- **Eligibility/capacity membership** → actual team/readiness/start → participant-safe objective/read recovery.
- **Runtime identity/progress + arrival + Personal attempts + contributions + unique score events** → normal checkpoint milestone.
- **Pause/cancel/recovery + incident handling + fair suspension** → safe controlled-play gate.
- **Proven normal checkpoint + terminal/global-completion policy** → shared terminal role → stable results → complete two-stop milestone.
- **Complete two-stop proof** → expand content/route to seven stops and repeat field/E2E verification.
- Results → awards/eligibility/grants → inventory fulfillment and long-term records; custom requests reuse the content chain.

### Can F7/G4/D10 be staged safely?

**Technical answer: yes, conditionally; roadmap authority answer: needs P1 approval.** A reviewed stand-alone one-route pilot does not require copying a Universal Template or searching a world locality catalog. Existing immutable JSONB and Hunt snapshot fields can represent it. The full category pipeline is not yet present, and the existing plan explicitly preserves legacy/unclassified compatibility; this supports an explicit pilot policy, not silent classification.

Do not delay minimum safety. Store a version-bound human review/operating record and enforce eligibility at publication/start, even if generalized advisory/evidence/blocker UX and automated provider checks come later. Withdrawal/expiry must affect permitted actions through explicit mutable governance state, never rewrite approved content. One controlled route can use reviewed existing country/city context; it must not masquerade as a canonical Locality UUID.

Run category/provider/copy contract design independently of core runtime. After approval, full category storage, community copy, hybrid location persistence, evidence UX and D10 can run parallel to enrollment/gameplay. Before their public rollout, inventory legacy consumers, explicitly adapt/classify newly reviewed versions, test approval withdrawals and enforce the Local-only catalog without stranding saved Hunts.

If P1 is rejected, this shorter sequence is **not authorized**: complete the category track and deployed supply-chain gate before H/I, as plan 20.2 requires. This audit does not rewrite that sequencing decision.

Additional Supervisor assignment is not needed to invent more people for a pilot: responsible Organizer automatic operational authority is required; assignment APIs/UI can follow on a parallel branch. Minimal live progress can precede live-location ingestion. Results need no configured reward. One terminal checkpoint needs no seven-stop expansion. None of these reductions removes the planned features.

## 9. Prioritized PR-by-PR roadmap

All entries are proposals, not implementation in this PR. Each numbered entry is **one repository, one Draft PR**. The order below is the recommended review/merge order; independent branches may be developed sooner as stated. BE contracts must be reviewed before dependent FE work. Product decisions are prerequisites, not assumptions.

Common definition of done for **every** PR: only its boundary changes; request/response/error and authorization contract documented where affected; tracked migration if needed; specified automated tests and relevant existing regressions pass, with DB suites not silently skipped; explicit verification procedure and limitations recorded; Draft PR reviewed by Architect/user. Merge and deployment require the user's approval and are never automatic. A successful deployment is followed by the named E2E gate, not substituted for it.

### 9.1 Security and integrity first

| Seq / priority / repo | Exact objective and implementation boundary | Dependencies | Acceptance tests / additional done condition |
| --- | --- | --- | --- |
| 01 / P0 / BE | Prevent application credential claims: CreatorApplications.create and OrganizerApplications.create refuse unverified password establishment on existing passwordless users; preserve new registration/normal activation | None; fail closed pending P9 richer continuation | D01 matrix in section 10, both route/model plus PostgreSQL; no credential/role/token changes on refusal |
| 02 / P0 / BE | Disable bare Tedix-ID authentication/linking until upstream proof exists; keep native auth/guests | Independent of 01; review after it | Bare/arbitrary IDs rejected; multi-role linked identity cannot yield tokens without proof; native/blocked/retired regressions; OpenAPI stops advertising trust |
| 03 / P1 / BE | Repair User.deleteControlled's four Creator dependency checks; no FK/schema weakening | Independent of 01–02 | All D03 isolated FK cases against migrations 001–020; HTTP success retires and preserves artifact/history; hard-delete/last-Admin/rollback tests |
| 04 / P1 / BE | Enforce privileged geography inspection boundary and catalog-key visibility contract; maintain legitimate setup/review consumers | P8 inspection/competition policy reviewed | Guest/participant-only denied across alternate geography paths; professional authorized/multi-role cases, malformed/stale geography and no answer leakage tested |
| 05 / P1 / BE | Independent exact-version approval: pass actor, reject self-approval atomically; minimal decision provenance record | P6 decision scope; 01–02 | Own Creator+Admin denied, different Admin succeeds, concurrent/stale pin handling; immutable artifacts unchanged; tracked provenance migration if needed |
| 06 / P1 / FE | Make prototype safety/help and readiness claims truthful; no “sent” from local timers | None; can ship alongside 01–05 | Render/interaction tests distinguish simulation from confirmed delivery; no fabricated Organizer receipt; existing prototype remains understandable |
| 07 / P1 / BE | Fail startup for absent/unsafe JWT configuration outside explicit disposable tests | None; independent | Environment validation and startup tests; valid configured signing works; no logged secrets |

### 9.2 Controlled-pilot contract and content gate

| Seq / priority / repo | Exact objective and implementation boundary | Dependencies | Acceptance tests / additional done condition |
| --- | --- | --- | --- |
| 08 / P1 / BE | Runtime/pilot contract document and OpenAPI examples only: state/identity IDs, membership, teamSize=4, hidden projection, commands/errors/idempotency, completion and safety policies | P1–P7/P10 decisions; 01–07 | Review examples for one normal + terminal, four real sessions, rejected guest enrollment, privacy, retries, pause/cancel, terminal versus global finish; no invented implemented APIs |
| 09 / P1 / BE | Minimal exact-version route-review/operating eligibility record and enforcement on approval; no provider automation or full category schema | 05, 08, P6 | Missing/expired/blocked evidence cannot approve pilot; independent reviewer, checkpoint/segment/access/conditions validation; records survive account retirement |
| 10 / P1 / BE | Add the pilot content/evaluator schema and pure validator for approved playability; validate publish/start atomically against snapshot/operating validity; preserve legacy reads. Runtime command persistence follows 17–20 | 08–09 | Unsupported/missing gameplay rejected for pilot; stale/concurrent draft edits and source approval races; immutable snapshots preserved; generic legacy compatibility explicit |
| 11 / P1 / FE | Add the pilot's missing persisted clue/Personal/Team payload fields and review evidence/conditions to existing Creator/Admin workflow; explicit save/version/submit/decision context | Deployed 09–10 contracts | Save/reopen/edit-invalidates-new-review context; exact artifact/validity/error states; no fake safety checkbox certification |
| 12 / P1 / FE | Wire pilot readiness/publication issues into existing Organizer setup without D10 provider selectors | 10–11 | Approved selection/save/reopen/publish, expired/revoked/stale content and unsupported options; real source-to-snapshot proof recorded as **E2E-A** after approved deployment |

E2E-A: Creator creates a new two-stop artifact → different Admin reviews/approves exact version → Organizer snapshots/publishes/reopens. Record live revisions and stable content after source/version changes. No new runtime release proceeds on a merely passing mock.

### 9.3 Membership and one normal checkpoint

| Seq / priority / repo | Exact objective and implementation boundary | Dependencies | Acceptance tests / additional done condition |
| --- | --- | --- | --- |
| 13 / P1 / BE | Central effective authority: own Organizer implies Supervisor, explicit assignments contribute, Admin gets reviewed operational scope; contexts use same rules | 08, B6 policy; independently develop after 05 | Own-Hunt allowed/unrelated denied, active account, Organizer automatic context cannot be removed; mutations remain separately scoped; retirement/revocation tests |
| 14 / P1 / BE | Enrollment command/read recovery: session + code + eligibility, idempotent membership, locked capacity; no Team logic yet | 08, 10, 13 | Concurrent final-slot joins, repeated/lost-response join, closed/cancelled/finished/full states, registered eligibility and explicit guest refusal; real DB tests |
| 15 / P1 / BE | Team/lobby/readiness/start gate: real same-Hunt assignment, four-person supported policy, retry-safe readiness and rejoin | 14, P2 | Cross-Hunt/multiple-team denial, real members, concurrent joins/readiness and pause/cancel/start races; no simulated contributors; authoritative read projection |
| 16 / P1 / FE | Retain invitation through authentication and wire join/lobby/readiness/rejoin to the chosen Hunt | Deployed 14–15 | Unknown/full/expired auth and reconnect; four distinct sessions with actual membership and readiness; **E2E-B** records two independently observable contributors at minimum |
| 17 / P1 / BE | Runtime persistence and participant-safe read/recovery for one normal + terminal identities; server-only content/evaluator mapping | 08, 10, 15 | Stable snapshot-derived IDs, membership/lifecycle gates, private answer/coordinate redaction on every read/error, cross-Hunt denial and restart recovery; tracked schema |
| 18 / P1 / BE | GPS arrival evidence/transition under explicit policy; no score awarded by raw GPS alone | 17, P3 | Distance/radius/accuracy/age/sample boundaries, denial/missing/retry, controlled test isolation; no public production spoof switch; real-phone validation procedure |
| 19 / P1 / BE | Personal attempt/hint/solution evaluator for pilot mechanic; persist private attempts and unique score effects transactionally | 17–18, P10 | Correct/incorrect/retry/hint/solution cases, actor/phase validation, lost response/concurrency duplicate prevention, no answers in unauthorized reads |
| 20 / P1 / BE | Actual Team contributions and team evaluator; resolve checkpoint/progress and team score once | 19, P2 | Distinct member requirements; one user cannot manufacture all contributions; simultaneous final inputs/answers, unique events, private Personal answers and durable advancement |
| 21 / P1 / FE | Persistent HuntGameMap shell consuming safe backend clue/state; overlays, location evidence and reconnect | Deployed 17–18 | One mounted map through ordinary overlays; denied/stale GPS/error handling; hidden coordinates/routes not requested or rendered; keyboard/mobile focus |
| 22 / P1 / FE | Replace local attempt/team/score reducer authority with 19–20 commands and read recovery | Deployed 19–20, 21 | Real Personal and Team interactions; retries/offline stale state reconcile; independent sessions contribute; **E2E-C** one normal checkpoint on real devices, durable scores and reconnect |

Do not add the remaining six stops at E2E-C. First record that backend state, not timers or browser storage, caused arrival/activities/advancement.

### 9.4 Safe operations, terminal role and final results

| Seq / priority / repo | Exact objective and implementation boundary | Dependencies | Acceptance tests / additional done condition |
| --- | --- | --- | --- |
| 23 / P1 / BE | Authorized minimal Monitor read model from real progress/events; no live-GPS ingestion | 13, 17, 20 | Own Organizer/Admin scopes, unrelated denial, consistent scores/current state/private answers excluded; polling sufficient |
| 24 / P1 / FE | Replace initialTeams/local Monitor lifecycle state with 23 and existing authoritative commands | Deployed 23; 16/22 | Real sessions update progress; pause/resume/cancel visible across clients; no local pretend completion |
| 25 / P1 / BE | Persistent HELP/PANIC create/read/acknowledge/resolve with minimal optional permitted evidence and retry identity | 13, 17, P8 incident retention | Membership/actor scope, duplicate request/retry, permission and retention validation; no required permanent tracking; state conflict tests |
| 26 / P1 / FE | Wire truthful help receipt and operator acknowledgement/resolution; disconnected contact fallback | Deployed 25, 24 | Server success only means receipt; offline pending/failure/retry and permission denied; independent participant/operator acknowledgement proof |
| 27 / P1 / BE | Runtime suspension/fairness state and bypass transaction, including explicit terminal/all-normal policy | 17–20, P5 | Concurrent answer/suspend, stale/retry, no penalty/solved fabrication, earned history retained, all-normal and terminal cases, immutable snapshot unchanged |
| 28 / P1 / FE | Participant suspension recovery and Organizer/Admin controls; Supervisors report/request only | Deployed 27, 24–26 | Current/future target refresh and reconnect; unsupported actors denied; separate suspension acceptance run recorded |
| 29 / P1 / BE | Apply proven shared engine to terminal completion; separate participant/team success from global close/force-end | 20, 27, P4 | Arrival alone insufficient; required terminal activities; simultaneous/duplicate completion once; first finisher cannot silently finish others; force-end/cancel not success |
| 30 / P1 / FE | Terminal checkpoint UX and backend-confirmed completion using same map/activity components | Deployed 29, 22, 28 | No second final-puzzle authority; reload/parallel terminal actions stable; no client-only completion |
| 31 / P1 / BE | Persist/finalize core results from authoritative score/completion/operational history; deterministic ranking, no prize fulfillment | 23, 27, 29, P10 | Repeated finalization stable, ties/incomplete teams/suspension/cancel rules, contribution aggregation and snapshot rules; private safe reads |
| 32 / P1 / FE | Real final standings/participant result and Organizer results; replace sample offsets/ceremony authority | Deployed 31, 30 | Cross-session consistent results/reconnect and honest pending states; **E2E-D** full Minimum Complete Hunt in section 7, signed verification record |

E2E-D is the first complete-Hunt claim. Include a normal successful run, refusal/error cases, reconnect, idempotency, uncertain GPS, real contributions, operational incident handling, suspension scenario and terminal results. Human field review and live Mapbox/mobile checks remain explicit requirements.

### 9.5 Retained parallel and later work — concrete bounded PRs

This track may begin contract work after security; its implementation follows approved contracts. If P1 staging is not approved, category/catalog PRs 33–45 and their deployed supply-chain verification precede 14–32. This preserves, rather than silently abandons, F7/G4/D10.

| Seq / priority / repo | Exact objective and implementation boundary | Dependencies | Acceptance tests / additional done condition |
| --- | --- | --- | --- |
| 33 / P2 / BE | Category/provenance/copy/legacy contract document only | P11; can parallel 08 | Universal no-GPS, standalone Local, exact cross-Creator source, independent approval, legacy inventory/examples reviewed |
| 34 / P2 / BE | Hybrid locality/provider/manual-resolution contract document only | P11; independent provider research | Stable internal UUID, ISO/context/provider identity, licensing/cache/failure/dedup/manual proposals; no world import or automatic name merge |
| 35 / P2 / BE | Version-aware classification/provenance storage and validation | 33; preserve 09 evidence | Universal/Local distinct validation, unclassified explicit, no historical JSONB/backfill mutation; migration tests |
| 36 / P2 / BE | Authorized approved Universal discovery and atomic independent Local copy | 35 | Cross-Creator source authorization/approval races; exact provenance retained; no private drafts/live inheritance |
| 37 / P2 / BE | Locality search/resolution and on-demand persistence | 34–35 | Known reuse, ambiguous/duplicate/provider failure/manual pending cases; stable IDs/provenance and cache behavior |
| 38 / P2 / BE | Extend minimal review record into proportional advisory/evidence/blocker/expiry/withdrawal contracts | 09, 35, 37 | New/edited Local requires own review, unresolved blocker fails, validity/re-review concurrency; old snapshots unchanged |
| 39 / P2 / BE | Approved Local catalog/filter/selection gates under controlled legacy rollout | 35–38 | Country/locality/category/approval mismatches rejected; withdrawn sources and stale reads; existing Hunts/read compatibility; no silent emptying |
| 40 / P2 / FE | Creator dashboard/My Templates/Mechanics Library and type-aware reusable editor | Deployed 35, supported mechanics contract | Four named entries; implemented versus planned availability; type-relevant fields; no executable mechanic uploads |
| 41 / P2 / FE | Approved Universal chooser/copy and independent Local creation | Deployed 36, 40 | Both Local starts, privacy/provenance/version context, loading/error/retry and save/submit |
| 42 / P2 / FE | Country/Locality lookup and Local geography/evidence forms | Deployed 37–38, 41 | Country changes clear dependent choices, ambiguous/manual/provider failure states, explicit conditions; progressive required validation |
| 43 / P2 / FE | Separate Universal/Local exact-version Admin review and evidence/validity decisions | Deployed 38, 42 | Universal approval never approves Local geography; invalid/expired evidence blocked; independent review |
| 44 / P2 / FE | D10 dependent selectors and automatic approved route preview | Deployed 39, 43 | Rapid switching/stale cancellation/key-version checks, no invented provider metrics, read-only saved snapshot after creation |
| 45 / P2 / FE | Record full deployed category supply-chain E2E after approved deployments | 39–44 | Standalone Local and cross-Creator Universal copy, separate approvals, provider failures/withdrawal/legacy reads and snapshot stability; committed evidence, not another implementation |
| 46 / P2 / BE | Additional Supervisor list/add/revoke APIs using effective authority | 13; independent of core play | Organizer automatic powers cannot be removed; unrelated assignment/revocation denied; removed actor loses operations; current-account validation |
| 47 / P2 / FE | D9 Allocate Supervisors using 46 | Deployed 46 | Organizer Automatic row, real additional allocation/removal and revoked-session operation denial |
| 48 / P2 / BE | Changes-requested revision/resubmission through new immutable versions | 05; independent after contract | Owner-only revision, exact prior pin preserved in history, new submission/approval, no edit of approved artifacts |
| 49 / P2 / BE | Latest-location monitoring contract/storage with TTL/throttle/consent/deletion | P8, 13, 23, 25 | Expired/ended data disappears; no permanent trails/log copies; spoofed/stale evidence rejected within declared limits; incident retention separate |
| 50 / P2 / FE | Authorized LiveHuntMap for minimal fresh/stale locations/incidents | Deployed 49, 24/26/28 | Real devices, stale/missing state, permission revocation and expiry; participant privacy and no locked-objective leaks |
| 51 / P2 / BE | Expand validated runtime content/evaluator coverage to canonical six normal + terminal journey | E2E-D; supported content/review ready | Each new mechanic's evaluator/privacy/retry tests; preserve story/scoring and immutable legacy; no duplicate engine |
| 52 / P2 / FE | Integrate expanded Signal journey and record seven-stop field/E2E evidence | Deployed 51, E2E-D | Actual independent members, real-phone GPS/recovery/operations/results all stops; no bundled answer authority |

The following remain separate, lower-priority PRs. Each inherits the common done conditions, including a scoped deployed verification after user-approved deployment.

| Seq / priority / repo | Exact objective / boundary | Dependencies | Acceptance tests / additional done condition |
| --- | --- | --- | --- |
| 53 / P2 / BE | Award eligibility and Special Award calculation, without granting prizes | 31, P10 | Tie/suspension/physical eligibility calculations deterministic; configured reward alone grants nothing |
| 54 / P2 / BE | Idempotent winner/award grant records, without fulfillment | 53 | Repeated/concurrent assignment creates one grant; authorized eligible recipients only |
| 55 / P2 / FE | Display real calculated/assigned/granted awards | Deployed 54 | Pending versus granted explicit; no client winner calculation |
| 56 / P2 / BE | Platform inventory stock/reservation, separate from Organizer rewards | 54, approved inventory/quantity policy | Concurrent stock/quantity/eligibility and hidden-prize access tests; no negative stock |
| 57 / P2 / BE | Fulfillment state transitions and provenance | 56 | Authorized auditable retries and failure states; reservation does not imply delivery |
| 58 / P2 / FE | Inventory/reservation/fulfillment operations | Deployed 56–57 | Real quantities and states; configured versus fulfilled clearly separate |
| 59 / P2 / BE | Passport/history read model from authoritative completed results | 31 | Correct identity scope, incomplete/cancelled handling and repeated completion tests |
| 60 / P2 / FE | Real persisted Passport and Mission History | Deployed 59 | Reconnect/history reads and empty/error states; no sample data represented as earned |
| 61 / P2 / BE | Achievements/collectibles rules and idempotent grants | 59, approved thresholds | Repeated result consumption awards once; competition score is not an invented currency |
| 62 / P2 / FE | Real achievements and long-term profile | Deployed 61 | Identity privacy and persisted earned state; no fabricated badges |
| 63 / P2 / BE | Custom-request create/read persistence only | 35/39, approved request contract | Owner scope, safe validation, retries; no implicit Template approval |
| 64 / P2 / BE | Request triage/Creator assignment/approved-artifact return | 63, F/G contracts | Actor/state/version tests and separate exact Local approval |
| 65 / P2 / FE | Wire real request workflow | Deployed 64 | No local “received” before save; assignment/status/errors from backend |
| 66 / P2 / BE | Privileged audit event writer/read API, extending minimal decision records | 05/09, approved retention policy | Actor/resource/outcome records, immutable provenance and secret redaction |
| 67 / P2 / FE | Admin audit/oversight views | Deployed 66 and 13/23 | Authorized scoped reads, retention/privacy and real operational state |

Platform settings and I14 advanced mechanics require individual approved rules and separate future slices; do not create generic schemas before those decisions.

Security maintenance and infrastructure backup/restore verification may proceed independently. A discovered release-blocking defect interrupts numeric feature order. Optional work does not postpone D01–D07 or the E2E gates.

## 10. First recommended implementation PR and precise acceptance

**BE only: “fix: prevent public applications from claiming existing passwordless accounts”.** This audit does not implement it.

Boundary: public Creator/Organizer application identity reuse and tests/OpenAPI. For an existing passwordless identity lacking validated possession, reject safely without setting a password, granting roles, consuming/replacing activation credentials or creating duplicate users. Preserve the one-identity and Admin-provisioned activation architecture. A new applicant can still choose credentials before approval; existing password-backed identity reuse never resets its credential. No new external identity provider, email service, FE feature or category migration in this PR.

Acceptance:

- Unauthenticated Creator or Organizer application cannot initialize the password of an existing active invited Admin, Organizer or Creator, including mixed-role and expired-invitation cases.
- The refusal commits no application/password/role/session/activation changes; the caller gets a documented safe conflict, never tokens or sensitive identity detail.
- Normal new self-registration still creates a pending application and password on its new identity, without professional capability.
- Existing password-backed identity credentials/roles remain untouched; legitimate invitation activation still works exactly once and preserves other capabilities.
- Tests cover concurrent application and activation, same normalized email, blocked/retired/guest refusal where applicable and transaction rollback in disposable PostgreSQL, plus route-level status assertions.
- Native authentication/provisioning/application regressions pass; document temporary verified-continuation limitation. No silent conversion of an existing identity to a new User.

Done: reviewable BE Draft PR with passing relevant full CI/DB tests and an explicit disposable-account verification script/procedure. A user-approved dev deployment should verify a newly provisioned disposable invitation cannot be claimed publicly and can still activate legitimately. Do not test takeover against real users. Merge/deployment remain separately approved actions.

The reported retirement fix is recommended PR 03, with the exact matrix in D03. It should not be bundled into this credential-ownership PR.

## 11. Evidence references and verification limitations

### What was independently checked

- GitHub main refs and recursive repository trees at the pinned FE/BE commits; FE main is the requested #112 merge. No AGENTS.md appeared in either pinned repository tree.
- Complete v3.5 plan and source of current FE routes, services, identity flows, Creator authoring/Mapbox/preview, participant prototypes, Monitor/results/Admin/request screens; BE route registration/controllers, auth/middleware, models/domain logic, migrations 001–020, Swagger source and relevant unit/integration tests.
- FE main CI run 40115018561/job 120934406050: log reports 226 Node tests plus 263 Vitest tests across 12 files passed. BE main run 38417642930/job 115366229011: log reports 819 tests across 44 files passed; workflow prepares disposable PostgreSQL and migrations. Successful deploy-dev jobs are visible for both. Production jobs in these runs were skipped.
- Locally fetched pinned FE source/tests into a scratch snapshot; used available existing node_modules without changing repository dependencies. Node 24 command: node --test --experimental-strip-types --test-isolation=none tests/*.test.ts — **226 passed, 0 failed, 0 skipped**. Focused API/catalog/Creator/review/snapshot subset also passed 57 tests. The first scratch run lacked workflow/version/font-config inputs; fetching those exact source files resolved those harness-only failures. Default child-isolation output counted 35 files, so the explicit no-isolation run established individual test counts.
- Existing browser report uses real Mapbox GL/camera with mocked style/search HTTP and fixture data. It proves reported UI/camera behavior, not live imagery, token authorization, real GPS arrival or deployed content. [Map-report]

### What was not established

Shell Git/network access failed at the configured proxy. GitHub connector supplied current pinned sources and CI evidence instead. No local BE dependency installation/runtime, disposable PostgreSQL instance, migration execution, account-removal or auth exploit reproduction was run. BE conclusions are source/schema/test evidence, with expected runtime consequences labeled. CI includes DB tests, but does not reproduce the newly identified defect cases merely by passing.

No live credentials, private secret values or deployed DB data were inspected. No application code changed. No actual guest enrollment, two/four-user gameplay, real-phone GPS, help receipt, terminal completion, results, production security posture or backup/restore was independently verified. No authenticated deployed browser sessions were available for those journeys. Dev deployment job success is not a guarantee of current serving version, correct runtime configuration or end-to-end functionality.

Absence claims are based on the complete pinned route/model/migration trees and relevant implementations, not merely text search or missing UI buttons. OpenAPI is generated from source; proposed historical endpoints are not counted as implemented. This audit is not an exhaustive penetration test, infrastructure assessment or provider certification.

### Pinned source index

References name exact files; symbols/endpoints in the sections above identify the relevant behavior. FE and BE repository scope is explicit in each reference label.

[B-app]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/app.ts
[B-auth]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/routes/auth.ts
[B-auth-tests]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/routes/auth.test.ts
[B-middleware]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/middleware/auth.ts
[B-environment]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/config/environment.ts
[B-jwt]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/lib/jwt.ts
[B-refresh]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/models/RefreshToken.ts
[B-user]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/models/User.ts
[B-user-tests]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/models/User.test.ts
[B-admin-users]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/routes/adminUsers.ts
[B-admin-provision]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/models/AdminProvisioning.ts
[B-creator-app]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/models/CreatorApplication.ts
[B-organizer-app]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/models/OrganizerApplication.ts
[B-creator-routes]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/routes/creatorTemplates.ts
[B-creator-application-routes]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/routes/creatorApplications.ts
[B-organizer-routes]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/routes/organizerApplications.ts
[B-creator-domain]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/domain/creatorTemplates.ts
[B-access]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/routes/huntAccess.ts
[B-participant]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/models/HuntParticipant.ts
[B-team]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/models/Team.ts
[B-role]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/models/HuntRole.ts
[B-context]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/models/HuntContext.ts
[B-hunts]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/routes/hunts.ts
[B-hunt]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/models/Hunt.ts
[B-readiness]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/domain/huntReadiness.ts
[B-template]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/models/HuntTemplate.ts
[B-template-integration]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/models/HuntTemplate.integration.test.ts
[B-review]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/routes/adminTemplateReviews.ts
[B-catalog-routes]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/routes/huntTemplates.ts
[B-catalog-tests]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/routes/huntTemplates.test.ts
[B-template-domain]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/domain/huntTemplates.ts
[B-gameplay]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/domain/checkpointGameplay.ts
[B-rewards]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/routes/huntRewards.ts
[B-reward-domain]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/domain/rewards.ts
[B-m003]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/db/migrations/003_core_hunt_records.ts
[B-m015]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/db/migrations/015_creator_applications.ts
[B-m016]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/db/migrations/016_hunt_template_versions.ts
[B-m018]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/db/migrations/018_template_submission.ts
[B-m019]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/db/migrations/019_template_approval.ts
[B-m020]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4b45c2d8af15e39e049e2069c37b9e29b5ecfbf8/src/db/migrations/020_template_changes_requested.ts
[F-session]: https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/19b780d10eae71292bbd17bab279ca099bf94a0e/src/services/api/session.ts
[F-client]: https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/19b780d10eae71292bbd17bab279ca099bf94a0e/src/services/api/client.ts
[F-workspaces]: https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/19b780d10eae71292bbd17bab279ca099bf94a0e/src/pages/ProfessionalAccess.tsx
[F-router]: https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/19b780d10eae71292bbd17bab279ca099bf94a0e/src/routes/router.tsx
[F-join]: https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/19b780d10eae71292bbd17bab279ca099bf94a0e/src/pages/ParticipantJoinFlow.tsx
[F-access-page]: https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/19b780d10eae71292bbd17bab279ca099bf94a0e/src/pages/PublicHuntAccessPage.tsx
[F-readiness]: https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/19b780d10eae71292bbd17bab279ca099bf94a0e/src/pages/ParticipantReadinessPage.tsx
[F-game]: https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/19b780d10eae71292bbd17bab279ca099bf94a0e/src/pages/template-one/TemplateOneExperience.tsx
[F-mission]: https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/19b780d10eae71292bbd17bab279ca099bf94a0e/src/hooks/useTemplateOneMission.ts
[F-monitor]: https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/19b780d10eae71292bbd17bab279ca099bf94a0e/src/pages/OrganizerMonitor.tsx
[F-results]: https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/19b780d10eae71292bbd17bab279ca099bf94a0e/src/data/competitionResults.ts
[F-editor]: https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/19b780d10eae71292bbd17bab279ca099bf94a0e/src/pages/CustomHuntEditor.tsx
[F-geography]: https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/19b780d10eae71292bbd17bab279ca099bf94a0e/src/components/OrganizerHuntGeography.tsx
[F-studio]: https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/19b780d10eae71292bbd17bab279ca099bf94a0e/src/pages/CreatorStudio.tsx
[F-persistence]: https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/19b780d10eae71292bbd17bab279ca099bf94a0e/src/features/creator/templatePersistence.ts
[F-gameplay]: https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/19b780d10eae71292bbd17bab279ca099bf94a0e/src/features/creator/checkpointGameplay.ts
[F-checkpoint-geo]: https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/19b780d10eae71292bbd17bab279ca099bf94a0e/src/features/creator/checkpointGeography.ts
[F-admin-users]: https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/19b780d10eae71292bbd17bab279ca099bf94a0e/src/pages/AdminUsers.tsx
[F-admin]: https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/19b780d10eae71292bbd17bab279ca099bf94a0e/src/pages/AdminConsole.tsx
[F-discovery]: https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/19b780d10eae71292bbd17bab279ca099bf94a0e/src/pages/DiscoveryFlow.tsx
[F-custom]: https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/19b780d10eae71292bbd17bab279ca099bf94a0e/src/pages/OrganizerSetupFlow.tsx
[Map-report]: https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/19b780d10eae71292bbd17bab279ca099bf94a0e/docs/reference-checkpoint-camera/README.md
[Plan]: https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/19b780d10eae71292bbd17bab279ca099bf94a0e/docs/TedixHunt_Prototype_Architecture_Implementation_Plan.md
[API-guide]: https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/19b780d10eae71292bbd17bab279ca099bf94a0e/docs/TedixHunt_API_Integration_Guide.md
[CI-FE]: https://github.com/tedixdev-arch/Tedix_Hunt_FE/actions/runs/40115018561
[CI-BE]: https://github.com/tedixdev-arch/Tedix_Hunt_BE/actions/runs/38417642930
