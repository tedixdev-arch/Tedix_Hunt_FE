# TedixHunt — End-to-End Flow Diagram & QA Requirements

**Audience:** Manual QA, automation QA, product owner, FE and BE developers  
**Scope:** Full product lifecycle from professional access and content creation to Hunt execution and reporting  
**Source of truth:** FE repository main as inspected on 2026-11-21, its current route/UI components, and the existing C3 Participant Gameplay Implementation Specification; BE details attributed to that specification/audits, not revalidated against a deployed environment.  
**Status convention:** **Implemented in source** (not necessarily deployed), **Partial**, **Blocked**, **Prototype**, **Proposed**. Do **not** record a feature as PASS simply because a prototype, mocked test or Creator preview displays it.  
**Execution rule:** For every case, record environment, FE SHA, BE SHA, DB migration head, account/role, Hunt/Template IDs, input, actual result, screenshots, API status and defect ID.

## 1. Master flow — from Home to a completed Hunt

~~~mermaid
flowchart TD
  HOME["Home /"] --> FREE["Try short Hunt /discover · prototype/demo"]
  HOME --> JOIN["Join a Hunt /join · Participant"]
  HOME --> ACCESS["Professional workspace /login-workspace"]
  ACCESS --> CREATOR["Creator Studio /creator"]
  ACCESS --> ADMIN["Admin /admin"]
  ACCESS --> ORG["Organizer /organizer"]

  CREATOR --> CONTENT["Create exercise / My Content"]
  CONTENT --> DRAFT["Save draft / new immutable revision"]
  DRAFT --> SUBMIT["Submit exact revision"]
  SUBMIT --> CR["Admin Content Review"]
  ADMIN --> CR
  CR -->|Changes requested| DRAFT
  CR -->|Approved| LIB["Approved Exercises Library"]
  CREATOR --> TEMPLATE["Create Universal / Local Template"]
  LIB --> ASSIGN["Predefined: Specific / Random"]
  TEMPLATE --> ASSIGN
  TEMPLATE --> OWN["Create Your Own template-owned exercise"]
  ASSIGN --> SAVE["Save immutable Template version + freeze exercise"]
  OWN --> SAVE
  SAVE --> TR["Submit Template for Admin review"]
  ADMIN --> TR
  TR -->|Changes requested| TEMPLATE
  TR -->|Approved| APPROVED["Approved Template"]

  ORG --> SETUP["Set a Hunt: template + locality + route + schedule"]
  APPROVED --> SETUP
  SETUP --> VALIDATE{"Publish readiness passes?"}
  VALIDATE -->|No| BLOCK["Correct missing geography, permissions or unsupported gameplay"]
  BLOCK --> SETUP
  VALIDATE -->|Yes| PUBLISH["Publish Hunt / invitation code"]
  PUBLISH --> START["Organizer starts Hunt"]
  JOIN --> LOOKUP["Resolve code / link"]
  LOOKUP --> LOGIN["Guest, sign-in or registration"]
  LOGIN --> ENROLL["Enroll in Hunt"]
  ENROLL --> READY["Participant setup / readiness"]
  START --> PLAY["Live play /hunts/:huntId/play"]
  READY --> PLAY
  PLAY --> GPS["Navigate → checkpoint GPS verification"]
  GPS -->|Denied / outside radius| HELP["Retry / ask Organizer for check-in"]
  HELP --> GPS
  GPS -->|Authorized| CHALLENGE["Deliver eligible challenge"]
  CHALLENGE --> ANSWER["Submit answer to BE"]
  ANSWER -->|Wrong| RETRY["Feedback / allowed retry"]
  RETRY --> ANSWER
  ANSWER -->|Correct| NEXT{"FinishPoint reached?"}
  NEXT -->|No| GPS
  NEXT -->|Yes| RESULT["Persist finish / display result"]
  RESULT --> MONITOR["Organizer monitoring, leaderboard, End Hunt"]
  ORG --> MONITOR
  CHALLENGE -.-> C3["C3 BLOCKER: canonical Content challenge delivery, validation and real Team play not complete"]
~~~

**Critical QA interpretation:** The arrow from frozen approved exercise to Participant gameplay is the *intended requirement*, **not** a currently passing canonical-content path. Legacy Signal gameplay exists; canonical exercises are blocked from publishing/execution by BE safeguards. C3 specifies how to remove that block safely, not by exposing full snapshots.

## 2. Role and navigation reference

| Actor | Main route / entry | Purpose | QA focus |
| --- | --- | --- | --- |
| Visitor | \`/#/\` | Join Hunt; short discovery Hunt; professional access | Correct CTA and role separation |
| Participant | \`/#/join\`, \`/#/join/:code\`, \`/#/participant/setup?hunt=...\`, \`/#/hunts/:huntId/play\` | Admission, location verification, live gameplay | Mobile, privacy, authorization, continuity |
| Creator | \`/#/creator\`, \`/#/create\` | Content library and immutable Template versions | Ownership, validation, approval/version linkage |
| Admin | \`/#/admin\`, \`/#/admin/content-review\`, \`/#/admin/templates\`, \`/#/admin/users\`, \`/#/admin/hunts\` | Review/approval, users, oversight | Approval independence, audits, role boundaries |
| Organizer | \`/#/organizer\`, \`/#/organizer/hunts/new\`, \`/#/organizer/hunts/new/setup\`, \`/#/organizer/hunts/:huntId\` | Create and operate Hunt | Correct Template/locality, lifecycle, invitations, live monitoring |

All paths above are FE hash-router routes, not guarantees about live deployment. \`/#/play/template-1\` and discovery/student demo pages are **prototypes**, not substitutes for real participant API QA. Organizer **independent** mode also requires separate prototype labeling; never mark its local state as persisted.

## 3. Role-to-role handoff requirements

| Handoff | Required invariant | Evidence QA must obtain |
| --- | --- | --- |
| Creator → Admin Content | Submitted exact contentId + revisionId; reviewer cannot approve own submission | Record and review-event status; rejected/self-review attempt |
| Admin Content → Approved Library | Only approval-backed exact immutable revision becomes discoverable | Approved list and exact detail; new draft must not mutate old approval |
| Approved Library → Creator Template | Specific stores exact IDs; Random resolves during immutable Template version save; Personal exercise identity unique across checkpoints | Saved Template GET, revision provenance, frozen exercise payload, duplicate negative test |
| Creator Template → Admin Template | Template approval is independent of Content approval | Submitted version vs approved version; Changes Requested loop |
| Approved Template → Organizer Hunt | Hunt pins its Template snapshot; geographic, challenge and publication rules must pass | Hunt ID, Template version, snapshot digest/provenance, readiness response |
| Organizer Hunt → Participant | Invitation resolution, authentication, enrollment, current checkpoint grants | Separate Participant identity, context and API authorization |
| Participant → Progress/results | BE owns validation, scoring, stage transition and finish | Attempts/score ledger, play response, refresh and final-results evidence |
| Organizer → Hunt lifecycle | Publish/Start/Pause/Resume/Finish/Cancel transitions reflect server truth | Server-read status, invalid transition, refresh behavior |

## 4. QA execution order and test requirements

Run cases in sequence on an **isolated QA environment** with seeded catalog, approved locality, Creator, independent Admin, Organizer, two Participants and one unauthorized user. Prepare one approved Personal and one approved Team revision, a later draft of an approved Content record, a Universal Template and a Local Template. Prefer a disposable PostgreSQL DB for stateful integration testing.

**Pass criteria:** Every action produces the expected authoritative persisted state and permission behavior; FE displays that state after reload. Negative cases must be rejected safely without losing saved work. If there is no implemented backend capability, mark **BLOCKED / NOT IMPLEMENTED**, not PASS or FAIL against a speculative endpoint.

### A. Access, identity and workspaces

| Case | Exact steps | Expected outcome | State |
| --- | --- | --- | --- |
| A01 Home entry | Open \`/#/\`; select Join Hunt, Try a short Hunt, professional access | Correct distinct routes; short Hunt explicitly identified as discovery/prototype | Implemented routes |
| A02 Auth guards | Open Creator/Admin/Organizer restricted URLs as Visitor and wrong-role user | Denied or routed to correct sign-in; no private workspace data | Implemented routes; verify BE too |
| A03 Professional login | Sign in as Creator, Admin and Organizer; refresh and log out | Respective workspace and role restrictions preserved | Implemented |
| A04 Admin user controls | Admin opens Users; create/edit/block user as supported; retry login as blocked user | Backend authorization applied; no stale access | Verify detailed controls against current UI/BE |
| A05 Multiple roles | Use dual-role account to request Participant and professional resources | Role-specific responses; never leak answer-bearing Hunt snapshot into Participant context | Security risk; see C3 |

### B. Content Library and approval (C1/C2)

| Case | Exact steps | Expected outcome | State |
| --- | --- | --- | --- |
| B01 Create | Creator → Content → Add Exercise; choose Personal or Team mechanic; set title, valid interaction/answer, category/grade/geography | Canonical exercise validated; unsaved work retained | Implemented |
| B02 Save draft | Save; reopen My Content and refresh | Persistent contentId/revisionId and status Draft | Implemented |
| B03 Revise | Edit existing Draft; save new revision; inspect old revision behavior | Immutable revision history; no silent overwrite of approved snapshot | Implemented |
| B04 Submit | Submit valid draft for approval | Exact revision status Submitted; not yet selectable as approved | Implemented |
| B05 Review | Admin → Content Review → select submission; inspect read-only preview; Approve | Exact revision Approved; audit event present | Implemented |
| B06 Changes requested | Admin requests changes with feedback; Creator revises and resubmits | Feedback visible; new reviewable revision; prior decisions intact | Implemented |
| B07 Self-review | Submit as Creator who also has reviewer permissions; attempt to approve own revision | Independent-review protection blocks approval | Implemented BE rule; verify |
| B08 Discovery | Creator → Content → Approved Exercises; filter classification, mechanic, category, grade and eligible location | Only matching approval-backed revisions; pagination/search stable | Implemented |
| B09 Cross-Creator use | Creator B discovers Creator A's approved exercise and previews it | Reuse permitted; edit of A's source by B denied | Implemented |
| B10 Approval immutability | Approve revision v1, create v2 Draft, fetch v1 exact detail | v1 remains approved and unchanged | Implemented |
| B11 Invalid payload | Submit malformed mechanics, missing fields, wrong geography/grade or unauthorized edit | Validation error; no partial record or privilege escalation | Implemented |

### C. Creator Template and exercise allocation

| Case | Exact steps | Expected outcome | State |
| --- | --- | --- | --- |
| C01 Template type | Creator → create Template; choose Universal or Local, supported setup/category/grade | Classified Template; proper location requirement | Implemented |
| C02 Checkpoints | Configure checkpoint count, navigation and final terminal entry | FinishPoint counted in total and is last; no navigation beyond it | Implemented |
| C03 Specific | Checkpoints & Challenges → Personal → Predefined → Specific; search approved and select | Exact approved revision and preview; no local Starter substitute | Implemented FE/BE |
| C04 Random | Choose Random; optionally filter mechanic/grade; before save inspect UI | Shows configured eligible pool, *not* pretend-finalized selection | Implemented |
| C05 Save | Save immutable version and reopen | BE chooses Random, stores contentId/revisionId and exact frozen payload; Random no reroll | Implemented |
| C06 Re-save | Change unrelated Template field, save new version | Same pinned allocation remains; instance owner/version updated per contract | Implemented |
| C07 Reroll | Explicitly change to new unresolved Random and save | Only intentional change rerolls; old Template version unchanged | Implemented |
| C08 Duplicates | Assign same Personal contentId at two checkpoints, including different revisions | Duplicate rejected; Team reuse follows its separate policy | Implemented |
| C09 Template-owned | Switch Predefined / Create Your Own; author an exercise; revisit old draft | No automatic Library publication, no concurrent allocation for same slot, no silent draft loss | Implemented |
| C10 Geography | Local Template select country/region/city; attempt out-of-scope Content | BE rejects ineligible revision; Universal only eligible where rules allow | Implemented, catalog fixtures required |
| C11 FinishPoint | Assign Personal and Team content to terminal entry | Same slot allocation rules; no next-checkpoint navigation | Implemented in authoring |
| C12 Template review | Submit completed Template; independent Admin reviews and approves / requests changes | Exact Template version reviewed; independent Content review unchanged | Implemented |
| C13 Snapshots | Modify Library after Template save; inspect old Template and created Hunt | Frozen exercise remains unchanged; no dynamic Library head lookup | Implemented storage; runtime blocked |

### D. Organizer Hunt creation, publication and monitoring

| Case | Exact steps | Expected outcome | State |
| --- | --- | --- | --- |
| D01 Enter | Organizer workspace → Set up a Hunt | Correct setup mode and saved state | Implemented UI; end-to-end verify |
| D02 Select source | Choose approved/available Template, location, Hunt options | Only authorized, eligible sources; locality binding checked server-side | Integrated QA required |
| D03 Route | Configure checkpoint positions, safe radii and FinishPoint; view map | Correct order, unique positions/identities, valid locality; avoid invalid crossing/route assumptions | Integrated QA required |
| D04 Save and reload | Save Hunt draft; reopen by ID | DB-persisted Hunt and accurate geography/schedule/options | Integrated QA required |
| D05 Publish readiness | Publish with missing required location, incomplete route, unapproved Template or unsupported custom exercise | Action rejected with actionable error; no invalid publication | Implemented BE safeguards |
| D06 Legacy publish | Use explicitly supported legacy Signal fixture; publish | Valid published Hunt and participant invite/link | Legacy runtime supported |
| D07 Canonical publish | Attempt to publish frozen approved canonical exercise Hunt | **Blocked by existing safety gate until C3**; must NOT bypass by disabling validation | Blocked |
| D08 Start/monitor | Start Hunt, open Monitor, reload; inspect participants and help | Server-backed lifecycle/status; live progress updates and Organizer check-in authorization | Implemented paths; verify |
| D09 Pause/resume | Pause then Resume while Participants interact | Server state changes; invalid transitions rejected; gameplay gate enforced | Verify actual merged monitor functionality |
| D10 Finish/cancel | End / Cancel from permitted status; retry invalid action | Terminal status persists; no unauthorized new gameplay/admissions | Integrated QA required |
| D11 Independent mode | Create Hunt in independent prototype | Mark as prototype; don't assert server persistence unless proven | Prototype/partial |

### E. Participant legacy runtime: executable QA baseline

| Case | Exact steps | Expected outcome | State |
| --- | --- | --- | --- |
| E01 Invitation | Open valid invite code/link; resolve Hunt | Correct name/status; invalid/expired code denied | Implemented |
| E02 Authenticate | Join as Guest, registered user or sign-in; use separate test accounts | Auth identity created/reused; no duplicate enrollment | Implemented |
| E03 Readiness | Continue to Participant setup and live play | Correct Hunt context, no leaked professional data | Implemented |
| E04 Navigate | View current authorized checkpoint, clue/target and Maps walking link | Only current target; no hidden future answer disclosure | Legacy implemented |
| E05 GPS failure | Deny permission, submit stale/inaccurate/far observation, spoof another checkpoint ID | Clear error; no grant/advance | Implemented gate; physical spoofing remains threat |
| E06 GPS success | Submit valid fresh location (or Organizer-authorized check-in) | Current checkpoint access granted, state refreshes | Implemented |
| E07 Personal wrong | Submit wrong legacy answer | BE returns incorrect; attempt/policy effects persisted | Legacy implemented |
| E08 Personal correct | Submit correct answer; refresh | BE score/progress persists; stage advances | Legacy implemented |
| E09 Legacy Team stage | Submit legacy Team string response | Current **individual** legacy Team stage executes; NOT real multi-user collaboration | Partial |
| E10 Next checkpoint | Complete required legacy stages | Only next checkpoint unlocks | Legacy implemented |
| E11 FinishPoint | Reach and complete terminal | Participant finished timestamp/score persisted | Legacy implemented |
| E12 Help | Send normal help and emergency message; Organizer views it | Authorized help request appears; user-facing safety instructions | Implemented |
| E13 Leaderboard | Open score/rank and reload | Server-projected score/rank; no hidden answer data | Legacy implemented |
| E14 After closure | Organizer closes Hunt; fresh Participant read | Final standalone results behavior not fully implemented; record blocker | Partial/blocked |

### F. Canonical C3 requirements — planned, not yet passable

| Case | Exact steps when developers implement C3 | Acceptance outcome | State |
| --- | --- | --- | --- |
| F01 Safe DTO | Participant GET current approved frozen exercise; inspect entire JSON/network response | No answer, solution, unreleased hint, private teammate packets, owner payload or nested answer mapping | Blocked C3 |
| F02 Identity | Reload /play, switch devices, replay request | Stable Hunt/checkpoint/slot instance identity and policy version | Blocked C3 |
| F03 Typed response | Submit correct, incorrect, malformed and foreign IDs for Single Choice | BE compares private frozen answer; malformed gets no score/attempt; correct persists once | Blocked C3 |
| F04 Idempotency | Lose response after commit; retry same request key; reuse key with different payload | Single attempt/award; mismatched replay rejected | Blocked C3 |
| F05 Real progression | Play Personal-only checkpoint and Personal-only FinishPoint | No phantom Team stage; next-only unlock; final record persists | Blocked C3 |
| F06 15 Personal | Execute correct, wrong and malformed answers for each canonical mechanic | Server-authoritative answer comparison; FE never requires expected answer object | Blocked C3 |
| F07 Stateful mechanics | Test Tap & Pair, Memory Card, Find the Mistake | No in-browser answer oracle; reveal/substep/timing according to approved policy | Blocked C3 |
| F08 Hints | Request permitted hint twice/reconnect/pause | Only authorized releases; durable one-time cost/state | Blocked C3 |
| F09 Team roster | Enroll 2+ distinct members and assign to one team | Membership, capacity, stable assignments and roster visibility | Blocked C3 |
| F10 Private contributions | Open same Team exercise from two independent sessions | Each receives only own packet and authorized shared information | Blocked C3 |
| F11 Shared Team answer | Race two authorized teammates' submissions | Exactly one Team completion and one shared score effect | Blocked C3 |
| F12 Team readiness | Member absent, not arrived, disconnected or not ready | Team progression follows approved readiness policy; no solo bypass | Blocked C3 |
| F13 Team FinishPoint | Complete shared terminal with multiple members | Authoritative shared finish, individual/team results consistent | Blocked C3 |
| F14 Closure/results | Finish or cancel Hunt; reload Participant results | Own authorized final result accessible per approved retention policy; no further submissions | Blocked C3 |
| F15 Role leakage | Attempt raw Hunt reads as Participant, supervisor, Participant+supervisor, other team | No unauthorized answer-bearing snapshot disclosure, including legacy | Security blocker |
| F16 22-mechanic regression | Real HTTP → PostgreSQL → UI on all mechanics in at least two independent sessions for Team | Pass only after full C3 security and gameplay QA; not based on preview mocks | Blocked C3 |

## 5. Negative-case matrix (repeat across applicable steps)

- **Authorization:** unauthenticated, blocked user, wrong role, different Hunt, different Creator's private Draft, reviewer self-approval, wrong Team, cross-Hunt IDs.
- **Versioning:** stale revision, concurrent draft save, approved v1 plus new v2 Draft, saved Random replay, stale Template version, stale runtime response, identical retry key with different body.
- **Geography:** no catalog mapping, wrong country/region/city, missing coordinates, GPS denied, stale/poor accuracy, outside radius, wrong checkpoint, Organizer override unauthorized.
- **Lifecycle:** Draft vs Submitted vs Approved; Hunt Draft/Published/Active/Paused/Finished/Cancelled; retries at transition boundaries, rejoin after network loss.
- **Data exposure:** browser network, GET list/detail, error responses, rendered props, browser storage, history, leaderboard and logs must be inspected for private answers.
- **Mobile:** 320px and 390px, long text/LaTeX, keyboard, touch, drag-drop fallback, no overflow, focus restoration, slow/disconnected network.
- **Race/persistence:** double-click, concurrent tabs, concurrent Team members, transaction rollback, refresh, guest expiry, server retry after response loss.

## 6. Evidence and defect standards

For **each** test case: capture preconditions and seed data; action-by-action UI screenshot or short recording; network request/response *without storing secrets*; authoritative BE/DB evidence where applicable; actual versus expected; PASS / FAIL / BLOCKED / NOT RUN; defect link and severity.

Suggested severities: **P0** answer leakage/authorization bypass/score forgery; **P1** cannot join, incorrect persistent scoring, progression blocked or wrong Hunt snapshot; **P2** UX errors with a workaround; **P3** cosmetic.

**Release gates:**
1. **Creator/Content gate:** B01–B11, C01–C13 with real BE persistence, independent approvals.
2. **Organizer/Legacy pilot gate:** D01–D11 and E01–E13 with a supported legacy Hunt. Clearly distinguish prototype paths and E14 limitation.
3. **C3-MVP gate:** F01–F05, F14–F15, Single Choice canonical at normal checkpoint + FinishPoint, production-safe publication readiness and real database/browser evidence.
4. **C3-Full gate:** F01–F16, every mechanic, actual multi-account Team collaboration and closure results. **Creator preview cannot satisfy this gate.**

## 7. QA run sheet (copy for each execution)

| Field | Value |
| --- | --- |
| Execution date / tester | |
| Environment / FE SHA / BE SHA / DB migration | |
| Roles/test accounts | |
| Template ID/version / Content ID/revision | |
| Hunt ID / locality / checkpoint count / FinishPoint | |
| Flow and case IDs | |
| Steps and test data | |
| Expected result | |
| Actual result / HTTP code / DB evidence | |
| Status: PASS / FAIL / BLOCKED / NOT RUN | |
| Screenshot/recording | |
| Defect, severity and owner | |

## 8. Source map and verification limitations

**FE source paths inspected:** \`src/routes/router.tsx\`, \`src/pages/HomePage.tsx\`, \`src/pages/CreatorStudio.tsx\`, \`src/features/creator/content/ContentLibrary.tsx\`, \`src/pages/AdminContentReview.tsx\`, \`src/pages/AdminTemplateReviews.tsx\`, \`src/pages/OrganizerSetupFlow.tsx\`, \`src/features/organizer/OrganizerSetup.tsx\`, \`src/pages/OrganizerMonitor.tsx\`, \`src/pages/ParticipantJoinFlow.tsx\`, \`src/pages/ParticipantReadinessPage.tsx\`, \`src/pages/LiveHuntPlay.tsx\`; related API modules and the C3 specification provide the existing contract reference.

**Detailed C3 engineering source of truth:** \`docs/C3_Participant_Gameplay_Implementation_Specification.md\` (FE docs). It contains proposed API contracts, the full 15+7 mechanics matrix and BE source references pinned to audit commit \`a0826e8\`.

**Caveats:** This is a QA *requirements and execution guide*, not a claim that production passes. BE behavior comes from the audited specification unless explicitly checked; deployments, the current PostgreSQL state and end-to-end production correctness have not been verified. Some source paths and UI labels may evolve: QA should use the current built version and record deviations as defects or documentation updates rather than forcing old fixture assumptions.