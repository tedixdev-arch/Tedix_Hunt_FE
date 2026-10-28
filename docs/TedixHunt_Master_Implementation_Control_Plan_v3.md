**TedixHunt**

# Master Implementation Control Plan — v3

26 October 2026  \|  Product Owner control checklist  \|  Baseline: merged architecture v3.6 and PRs \#114–\#116

Purpose: trace every Phase A–N item in the Master Prototype Architecture Plan, distinguish existing foundation from missing implementation, and track small approved PRs. This is a planning/control document, not proof of deployed functionality.

# 1. Mandatory implementation rule

Minimum necessary implementation. Keep interfaces clear, ergonomic and simple; keep code readable and narrowly scoped. Codex must not invent explanations, screens, features, abstractions or optional capabilities. Reuse working FE/BE functionality. One bounded task → Codex Draft PR → review → user merge → deploy → test. No automatic merge.

# 2. How to read the checklist

| Label | Meaning |
| --- | --- |
| Verify / repair | Existing foundation reported in architecture/audit; inspect current FE/BE and test before marking complete. |
| Build | Missing runtime or planned extension; implement only when its dependency/milestone is approved. |
| Decision / defer | Not yet approved in detail or not needed for the first controlled pilot. Track, do not silently implement. |
| Complete | Only after PR merged AND relevant tests/verification recorded. No item in this v3 is newly marked complete. |

Status labels below are planning classifications, not fresh source-code verification. Historical architecture statuses must remain the evidence source until a new review updates them.

# 3. Milestones and dependency gates

| Gate | Target / release rule |
| --- | --- |
| G0 — Security | Repair identity-claim, unverified external ID, JWT fallback, inappropriate geographic access, self-review, deletion dependencies and truthful safety acknowledgement. |
| G1 — Controlled content | One independently reviewed immutable route with one normal checkpoint plus FinishPoint; no public release. |
| G2 — Solo proof | One real Participant joins, starts, completes normal checkpoint and FinishPoint, and receives persisted result. |
| G3 — Team proof | Two independent real accounts; true fragments, collective solution, 5-minute recovery, +100 once; restore/retry. |
| G4 — Variable teams | Automated 2/3/4/6-member scenarios, odd allocations, no-fragment members, concurrency, reconnect and recovery. |
| G5 — Operations/results | Actual HELP/PANIC, authorized monitoring/suspension, truthful finish/results and real-device GPS. |
| G6 — Full product extensions | Universal/Local community reuse, Creator/Organizer enhancements, awards, Admin systems, long-term features and custom requests as separately approved. |

Important sequencing choice: architecture §20.2 currently orders F7/G4/D10 before Participant runtime. The audit permits a parallel-track controlled pilot only with explicit Product Owner approval and a documented legacy/pilot compatibility rule. This document does NOT grant that approval.

# 4. Complete architecture traceability — Phases A–N

## A — Platform foundation

| ID | Master architecture task | Current action | Priority / gate |
| --- | --- | --- | --- |
| A1 | Deployment topology and verification | Verify / repair | Foundation audit |
| A2 | PostgreSQL migration foundation | Verify / repair | Foundation audit |
| A3 | User normalization and compatibility | Verify / repair | Foundation audit |
| A4 | Core authentication | Verify / repair (security) | Foundation audit |
| A5 | Frontend API/session layer | Verify / repair | Foundation audit |
| A6 | Existing real login flows | Verify / repair | Foundation audit |

## B — Identity and authorization

| ID | Master architecture task | Current action | Priority / gate |
| --- | --- | --- | --- |
| B1 | Multi-role identity | Verify / repair | Foundation audit |
| B1.1 | Workspace/context model | Verify / repair | Foundation audit |
| B2 | Backend role authorization | Verify / repair (security) | Foundation audit |
| B3 | Frontend role guards | Verify / repair | Foundation audit |
| B4 | Organizations and membership | Verify / repair | Foundation audit |
| B5 | Hunt-context roles | Verify / repair | Foundation audit |
| B6 | Effective Hunt authority | Verify / repair | Foundation audit |

## C — Hunt domain

| ID | Master architecture task | Current action | Priority / gate |
| --- | --- | --- | --- |
| C1 | Core Hunt records | Verify / repair | Foundation audit |
| C2 | Hunt lifecycle | Verify / repair | Foundation audit |
| C3 | Organizer Hunt list | Verify / repair | Foundation audit |
| C4 | Publish-readiness authority | Verify / repair | Foundation audit |

## D — Organizer setup

| ID | Master architecture task | Current action | Priority / gate |
| --- | --- | --- | --- |
| D1 | General Setup | Verify / repair | Foundation audit |
| D2 | Template selection and snapshot | Verify / repair | Foundation audit |
| D3 | Supported pilot options | Verify / repair | Foundation audit |
| D4 | Rewards configuration | Verify / repair | Foundation audit |
| D5 | Review | Verify / repair | Foundation audit |
| D6 | Publish | Verify / repair | Foundation audit |
| D7 | Access code/link | Verify / repair | Foundation audit |
| D8 | Organizer geographic preview | Verify / repair | Foundation audit |
| D9 | Allocate Supervisors | Verify / repair | Foundation audit |
| D10 | Map-first General Setup | Build (separate track) | Architecture dependency |

## E — Professional accounts

| ID | Master architecture task | Current action | Priority / gate |
| --- | --- | --- | --- |
| E1 | Organizer application | Verify / repair | Foundation audit |
| E2 | Organizer login | Verify / repair | Foundation audit |
| E3 | Organizer approval backend | Verify / repair | Foundation audit |
| E4 | Organizer credential boundary | Verify / repair (security) | Foundation audit |
| E5 | Admin backend login | Verify / repair | Foundation audit |
| E6 | Bootstrap first Admin | Verify / repair | Foundation audit |
| E7 | Admin frontend login | Verify / repair | Foundation audit |
| E8 | Protect Admin routes | Verify / repair | Foundation audit |
| E9 | Admin account security | Verify / repair (security) | Foundation audit |
| E10 | Additional Admin provisioning | Verify / repair | Foundation audit |
| E11 | Organizer Applications Admin UI | Verify / repair | Foundation audit |
| E12 | Organizer self-registration credentials | Verify / repair | Foundation audit |
| E13 | Organizer onboarding E2E | Verify / repair | Foundation audit |
| E14 | Creator provisioning | Verify / repair | Foundation audit |
| E15 | Creator activation | Verify / repair | Foundation audit |
| E16 | Creator onboarding verification | Verify / repair | Foundation audit |
| E17 | Creator self-registration/application | Verify / repair | Foundation audit |

## F — Creator Templates

| ID | Master architecture task | Current action | Priority / gate |
| --- | --- | --- | --- |
| F1 | Template hierarchy and Mechanics Library | Verify / repair | Foundation audit |
| F2 | Template persistence and immutable versions | Verify / repair | Foundation audit |
| F3 | Geographic checkpoint architecture | Verify / repair | Foundation audit |
| F4 | Radius contract compatibility | Verify / repair | Foundation audit |
| F5 | Shared map and Creator Map Editor | Verify / repair | Foundation audit |
| F6 | FinishPoint authoring and route validation | Verify / repair | Foundation audit |
| F7 | Universal/Local creation, community reuse and Country/Locality | Build (separate track) | Architecture dependency |

## G — Admin Template governance

| ID | Master architecture task | Current action | Priority / gate |
| --- | --- | --- | --- |
| G1 | Admin Template review | Verify / repair | Foundation audit |
| G2 | Approved Template authority | Verify / repair | Foundation audit |
| G3 | Admin geographic preview | Verify / repair | Foundation audit |
| G4 | Separate Universal/Local governance | Build (separate track) | Architecture dependency |

## H — Participant enrollment

| ID | Master architecture task | Current action | Priority / gate |
| --- | --- | --- | --- |
| H1 | Resolve access code | Build | Post-pilot / verify |
| H2 | Persist Participant enrollment | Build | Pilot critical |
| H3 | Enrollment availability rules | Build | Post-pilot / verify |
| H4 | Team creation/assignment | Build | Post-pilot / verify |
| H5 | Team lobby | Build | Post-pilot / verify |
| H6 | Readiness | Build | Post-pilot / verify |
| H7 | Start gate | Build | Post-pilot / verify |
| H8 | Session recovery/reconnect | Build | Post-pilot / verify |

## I — Checkpoint gameplay

| ID | Master architecture task | Current action | Priority / gate |
| --- | --- | --- | --- |
| I1 | Checkpoint runtime model | Build | Pilot critical |
| I2 | Participant progress state | Build | Post-pilot / verify |
| I3 | Answer submission | Build | Pilot critical |
| I4 | Backend validation | Build | Pilot critical |
| I5 | Hint use | Build | Post-pilot / verify |
| I6 | Personal and Team contribution | Build | Pilot critical |
| I7 | Score events | Build | Pilot critical |
| I8 | Idempotency | Build | Pilot critical |
| I9 | Restore progress | Build | Post-pilot / verify |
| I10 | All Signal checkpoints | Build | Post-pilot / verify |
| I11 | FinishPoint completion | Build | Pilot critical |
| I12 | Participant map | Build | Post-pilot / verify |
| I13 | Checkpoint suspension | Build | Post-pilot / verify |
| I14 | Geographic gamification | Decision / defer | Later / decision |

## J — Live operations

| ID | Master architecture task | Current action | Priority / gate |
| --- | --- | --- | --- |
| J1 | Shared Hunt live state | Build | Post-pilot / verify |
| J2 | Organizer Monitor | Build | Post-pilot / verify |
| J3 | Lifecycle controls | Build | Post-pilot / verify |
| J4 | Supervisor access | Build | Post-pilot / verify |
| J5 | Help request | Build | Pilot critical |
| J6 | PANIC incident | Build | Pilot critical |
| J7 | Acknowledge/resolve | Build | Pilot critical |
| J8 | Network-loss fallback | Build | Post-pilot / verify |
| J9 | Live Operations Map | Decision / defer | Later / decision |

## K — Results and rewards

| ID | Master architecture task | Current action | Priority / gate |
| --- | --- | --- | --- |
| K1 | Final score aggregation | Build | Pilot critical |
| K2 | Leaderboard | Build | Post-pilot / verify |
| K3 | Final results | Build | Pilot critical |
| K4 | Special Awards | Decision / defer | Later / decision |
| K5 | Reward assignment | Decision / defer | Later / decision |
| K6 | Physical-prize eligibility | Decision / defer | Later / decision |

## L — Admin operations

| ID | Master architecture task | Current action | Priority / gate |
| --- | --- | --- | --- |
| L1 | Users and Roles | Verify / repair (security) | Post-pilot / verify |
| L2 | Hunt oversight | Verify / repair | Post-pilot / verify |
| L3 | Safety Alerts | Verify / repair | Post-pilot / verify |
| L4 | Physical Reward Inventory | Verify / repair | Post-pilot / verify |
| L5 | Platform Settings | Verify / repair | Post-pilot / verify |
| L6 | Audit Log | Verify / repair | Post-pilot / verify |

## M — Long-term Participant

| ID | Master architecture task | Current action | Priority / gate |
| --- | --- | --- | --- |
| M1 | Hunt Passport | Decision / defer | Later / decision |
| M2 | Mission History | Decision / defer | Later / decision |
| M3 | Achievements | Decision / defer | Later / decision |
| M4 | Collectibles and virtual rewards | Decision / defer | Later / decision |
| M5 | Long-term profile | Decision / defer | Later / decision |

## N — Custom Hunt requests

| ID | Master architecture task | Current action | Priority / gate |
| --- | --- | --- | --- |
| N1 | Persist custom request | Decision / defer | Later / decision |
| N2 | Admin triage | Decision / defer | Later / decision |
| N3 | Assign Creator | Decision / defer | Later / decision |
| N4 | Creator builds Template | Decision / defer | Later / decision |
| N5 | Admin review | Decision / defer | Later / decision |
| N6 | Return approved Template to Organizer | Decision / defer | Later / decision |

# 5. Cross-cutting decisions and exceptions

- Independent Organizer (§11): unresolved identity/access and Personal Hunt authoring; keep isolated prototype, no bypass or invented launch path.

- Universal vs Local (§F1/F7/G4): categories of Template, not two gameplay engines. Universal approved source may be copied into Creator-owned version with provenance; Local has geography, independent review and exact-version approval. Organizer sees approved Local for selected Country/Locality.

- Organizer map-first (§D10): Country → Locality → approved Template → read-only preview; do not treat a map as safety certification.

- Solo/Team (§3.3): Organizer selects supported mode; real team members, allocation independent of team size; all original required activities before five-minute recovery, legitimate fragment recovery after threshold, backend-validated collective solution.

- Team scoring (§3.3, PR \#116): exactly 100 points once to the team for successful challenge, including recovery; zero if uncompleted; no normalized Team scoring, no per-member Team Challenge points or recovery penalty.

- FinishPoint (§I11): same authoritative engine, terminal semantics; one team finishing does not end every team.

- Safety: persistent truthful HELP/PANIC and incident lifecycle; network loss must not falsely acknowledge delivery. GPS and route safety require real-device/human verification.

- Open policies: team size bounds, membership changes, late join/reassignment races, one-active-member recovery mechanic, GPS fallback, tie rules, cross-mode rankings, suspensions and global Hunt closure require narrow explicit decisions before relevant code.

# 6. Implementation PR control register

Use one row per actual PR. Update this register after every merge and verification; do not infer status from a Draft PR or green CI alone.

| Order | PR / task IDs | Scope | State | Verified evidence |
| --- | --- | --- | --- | --- |
| 01 | D01 credential claim | BE-only: block claiming existing passwordless identities | Done | — |
| 02 | D02 external identity | Fail closed on unverified Tedix ID | Done | — |
| 03 | D03–D07 security/integrity | Scoped authorization, self-review, JWT, deletion and truthful safety fixes | Done | — |
|  | D03 Account Deletion Integrity |  | Done |  |
|  | D04 — Hidden geography access control |  | Done |  |
|  | D05 — Independent Template review |  | Done |  |
|  | D06 — HELP/PANIC safety UI |  | Done |  |
|  | D07 — JWT signing configuration security |  | Done |  |
| 04 | F7/G4/D10 decision | Choose full upstream track or explicitly approved pilot parallel track | Started | — |
|  | F7 — Creator-owned Universal/Local Template versions and provenance. |  |  |  |
|  | Universal/Local classification, database foundation |  | Done |  |
|  | Creator creates Universal or Local from scratch |  | Done |  |
|  | Admin approval and published Universal library |  | Done |  |
|  | Create independent Local draft from published Universal |  | Done |  |
|  | Creator Template Revisions and Republication |  | Done |  |
|  | Hybrid Country/Locality Contract |  | Done |  |
|  | Local approval, locality and evidence requirements |  | Done |  |
|  | Legacy compatibility and Organizer selection |  |  |  |
|  |  |  |  |  |
| 05 | H1–H3 | Real Hunt invitation, eligibility and enrollment | Not started | — |
| 06 | H4–H8 | Team membership, lobby, readiness and session restore | Not started | — |
| 07 | I1–I9 | One authoritative checkpoint, Solo/Team, recovery, idempotency | Not started | — |
| 08 | I11, J, K | FinishPoint, safety/operations and final results | Not started | — |
| 09 | I10, I12–I14; L–N | Full route and later product work as separately approved | Deferred / staged | — |

# 7. Update the Master Architecture Plan — mandatory closing loop

At the end of each implementation PR (not only at the end of the whole project):

- Record merged PR number, FE/BE commit SHA, affected A–N task IDs and exact implemented scope.

- Update task status only for verified behavior; distinguish source tests, CI, deployed verification and multi-user E2E.

- Update API/schema/contract references, acceptance evidence and any known limitations.

- Keep approved decisions, unresolved policies, audit history and immutable Template/Hunt semantics intact.

- Reconcile this v3 control register with the repository Master Architecture Plan and companion Audit/Critical Path; document deferred work explicitly.

- Submit any documentation synchronization as a separate small Draft PR when appropriate; Product Owner reviews and merges.

# 8. Next action

Begin with security/identity Task 01. Before any Codex coding prompt, inspect current BE/FE against the audit finding and specify the smallest safe patch plus regression tests. Do not start the gameplay engine or Universal/Local expansion by assumption.

TedixHunt · Master Implementation Control Plan v3 · controlled working document
