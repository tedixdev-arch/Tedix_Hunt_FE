**TedixHunt**

# Master Implementation Control Plan — v3

26 October 2026 baseline; current reconciliation 30 October 2026 (Europe/Bucharest)  \|  Product Owner control checklist  \|  Baseline: merged architecture v3.6 and PRs \#114–\#116

Purpose: trace every Phase A–N item in the Master Prototype Architecture Plan, distinguish existing foundation from missing implementation, and track small approved PRs. This is a planning/control document, not proof of deployed functionality.

## Current execution dashboard — 30 October 2026

**NEXT CODEX TASK: F7-FE-01 — Creator dashboard/navigation and read-only Mechanics Library using the existing supported authoring contract.** One FE Draft PR; do not implement it in this documentation PR. Required functionality, verified prerequisites, tests and closure evidence are in the [execution dependency matrix](TedixHunt_Execution_Dependency_Matrix.md#capability-boundary-and-first-task-prerequisites) and §8 below. This master remains the single entry point; the supporting matrix supplies subordinate PR-sized slices, not another progress authority.

| Order | Task ID | Deliverable | Status | Dependency | Next action |
| --- | --- | --- | --- | --- | --- |
| Foundation | F7 C6b-4 / C6b-5 | Local binding, retained approval/revision and explicit suspension | Complete — merged/source verified | BE #85/#87 | Reuse; no reimplementation or deployed claim. |
| Foundation | C7 contract / backend | Local eligibility, safe preview and exact atomic Hunt selection | Complete — merged/source verified | BE #88 contract; #89 code | Consume merged APIs after integration gates; report/test evidence is not deployed E2E. |
| 1 | F7-FE-01 | Four dashboard entries and truthful supported-mechanics guidance | Ready for implementation | Existing Creator guard/editor, C2 typed contract; matrix capability boundary | Open one bounded implementation Draft PR. |
| 2 | F7-FE-02–05 | Owned type/status/version context, Universal create/save/submit | Not started | 01 and C2/C5 | Deliver individual read/create/save/submit slices. |
| 3 | F7-FE-06–12 | Approved Universal reuse, scratch Local, binding, proposals, revisions and Local editor | Not started | C3–C6b-5 and preceding FE slices | Follow matrix branch dependencies; preserve shared editor. |
| 4 | F7-FE-13; G4-FE-01–05 | Creator regression and category-specific independent Admin review/continuity/suspension | Not started | Representative Creator submissions and merged Admin APIs | Review exact version; complete stored/manual catalog branch. |
| Alongside 1–4 | G4-DEC-01 / G4-BE-03 | Safety/validity/conditions and narrative-feedback decisions | Decision/deferred | Architecture §14/§20.2; actual API gaps | Record PO decisions; existing state-only corrections can proceed. |
| 5 | G4-BE-01/02; G4-FE-06/07 | Missing governance and approved narrative feedback integration | Blocked | Approved decisions/contracts and missing BE work | Contract-first small slices; no invented safety certification. |
| 6 | D10-GATE | Creator/Admin, reviewed catalog, compatibility and applicable readiness evidence | Blocked | Architecture §20.2; FE #121 report; above dependencies | Record satisfaction or explicit PO scope clarification; no hidden exception. |
| 7 | D10-FE-01–08 | Country → Locality → Eligible Local → Preview → Select → Configure | Blocked | D10-GATE; merged C7 | Then deliver bounded dependent slices, preserving settings/legacy. |
| 8 | D10-E2E-01/02 | Integrated chain, then deployed acceptance | Blocked | FE implementation, actual environment and applicable rollout gates | Record each evidence level separately. |
| Provider branch | C6b-2 | Mapbox permanent-result persistence | Blocked | Account licensing/entitlement evidence | Verify rights; stored/manual work need not wait. |
| Later | H1–H8; I1–I13; J1–J8; K1–K3 | Enrollment, shared engine, live safety and results | Not started | Content-chain gate; B6/D9 and relevant policy decisions | H1 lookup alone source-complete; use H–N execution audit, then §20.3 Solo/Team stages with minimum safety/results. |
| Later | L1 | Users & Roles operational audit coverage | Partially implemented | Existing controls; proposal-only deletion verification | Verify scoped history/retirement cases. |
| Later | L2–L6 | Remaining Admin operational systems | Not started | Real J/K events and approved scoped contracts | Follow original phase dependencies; demo screens are not delivery. |
| Staged | I14/J9/K4–K6; M1–M5/N1–N6 | Deferred extensions | Decision/deferred | Original phase decisions in §4 | Approve only separately scoped dependent work. |

**Evidence boundary:** current pinned FE `fc43d2040700e44df0db9e5481f95964f597e6be` (#121), BE `bcf1fda4153cc8ea787c4d7e5922f4cb4b34ee32` (#89). GitHub merge metadata verified; source/API and test assertions inspected. No deployment, live DB, provider entitlement, real-device GPS or integrated/deployed E2E was verified here. BE #89's reported tests are attributed in §10. FE #121 is a readiness report only. Architecture v3.6 remains unchanged; stale C7-pending statements in its §20.2/§21 are recorded as discrepancies, not permission to waive its integration gate.

# 1. Mandatory implementation rule

Minimum necessary implementation. Keep interfaces clear, ergonomic and simple; keep code readable and narrowly scoped. Codex must not invent explanations, screens, features, abstractions or optional capabilities. Reuse working FE/BE functionality. One bounded task → Codex Draft PR → review → user merge → deploy → test. No automatic merge.

# 2. How to read the checklist

| Label | Meaning |
| --- | --- |
| Verify / repair | Existing foundation reported in architecture/audit; inspect current FE/BE and test before marking complete. |
| Build | Missing runtime or planned extension; implement only when its dependency/milestone is approved. |
| Decision / defer | Not yet approved in detail or not needed for the first controlled pilot. Track, do not silently implement. |
| Complete — merged/source verified | Exact bounded slice is merged; source and relevant tests inspected. A contract-only slice completes only its contract. No deployment/E2E claim. |
| Complete — deployed/E2E verified | Exact slice has recorded actual deployed acceptance, environment/date/revisions/cases/results. |
| Ready for implementation | All prerequisites for the bounded slice are verified; no implementation completion implied. |
| Partially implemented | Some foundation exists, but the named task/workflow still has missing behavior or verification. |
| Not started | No implementation of the required behavior found; a prototype or schema alone does not count. |
| Blocked | Explicit prerequisite prevents the specified slice from proceeding. |
| Decision/deferred | Product/technical decision or separately approved later scope; no implied implementation. |

The original Current action and Priority / gate columns retain the 26 October planning baseline. The Reconciled status column, §§6/8/10 and dashboard record current source review; §9 preserves dated historical evidence. Current records supersede stale progress claims without rewriting historical observations. Historical architecture checkmarks are baseline evidence, not proof of deployed or end-to-end behavior. “Partially implemented — verification pending” does not assert a known code defect; it withholds full completion where this review lacks sufficient acceptance evidence.

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

| ID | Master architecture task | Current action | Priority / gate | Reconciled status / evidence |
| --- | --- | --- | --- | --- |
| A1 | Deployment topology and verification | Verify / repair | Foundation audit | Partially implemented — deployment diagnostics exist; rollback/backup and current deployment verification pending (§9). |
| A2 | PostgreSQL migration foundation | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| A3 | User normalization and compatibility | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| A4 | Core authentication | Verify / repair (security) | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| A5 | Frontend API/session layer | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| A6 | Existing real login flows | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |

## B — Identity and authorization

| ID | Master architecture task | Current action | Priority / gate | Reconciled status / evidence |
| --- | --- | --- | --- | --- |
| B1 | Multi-role identity | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| B1.1 | Workspace/context model | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| B2 | Backend role authorization | Verify / repair (security) | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| B3 | Frontend role guards | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| B4 | Organizations and membership | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| B5 | Hunt-context roles | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| B6 | Effective Hunt authority | Verify / repair | Foundation audit | Not started — required runtime/extension absent (§9). |

## C — Hunt domain

| ID | Master architecture task | Current action | Priority / gate | Reconciled status / evidence |
| --- | --- | --- | --- | --- |
| C1 | Core Hunt records | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| C2 | Hunt lifecycle | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| C3 | Organizer Hunt list | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| C4 | Publish-readiness authority | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |

## D — Organizer setup

| ID | Master architecture task | Current action | Priority / gate | Reconciled status / evidence |
| --- | --- | --- | --- | --- |
| D1 | General Setup | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| D2 | Template selection and snapshot | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| D3 | Supported pilot options | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| D4 | Rewards configuration | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| D5 | Review | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| D6 | Publish | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| D7 | Access code/link | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| D8 | Organizer geographic preview | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| D9 | Allocate Supervisors | Verify / repair | Foundation audit | Not started — required runtime/extension absent (§9). |
| D10 | Map-first General Setup | Build (separate track) | Architecture dependency | Not started — FE absent; implementation blocked by §20.2 integration gates (FE #121), despite merged C7 BE #89. See D10-GATE. |

## E — Professional accounts

| ID | Master architecture task | Current action | Priority / gate | Reconciled status / evidence |
| --- | --- | --- | --- | --- |
| E1 | Organizer application | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| E2 | Organizer login | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| E3 | Organizer approval backend | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| E4 | Organizer credential boundary | Verify / repair (security) | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| E5 | Admin backend login | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| E6 | Bootstrap first Admin | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| E7 | Admin frontend login | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| E8 | Protect Admin routes | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| E9 | Admin account security | Verify / repair (security) | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| E10 | Additional Admin provisioning | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| E11 | Organizer Applications Admin UI | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| E12 | Organizer self-registration credentials | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| E13 | Organizer onboarding E2E | Verify / repair | Foundation audit | Partially implemented — onboarding foundation exists; deployed onboarding E2E not verified (§9). |
| E14 | Creator provisioning | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| E15 | Creator activation | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| E16 | Creator onboarding verification | Verify / repair | Foundation audit | Partially implemented — Creator onboarding foundation exists; deployed verification pending (§9). |
| E17 | Creator self-registration/application | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |

## F — Creator Templates

| ID | Master architecture task | Current action | Priority / gate | Reconciled status / evidence |
| --- | --- | --- | --- | --- |
| F1 | Template hierarchy and Mechanics Library | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| F2 | Template persistence and immutable versions | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| F3 | Geographic checkpoint architecture | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| F4 | Radius contract compatibility | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| F5 | Shared map and Creator Map Editor | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| F6 | FinishPoint authoring and route validation | Verify / repair | Foundation audit | Partially implemented — authoring/route estimates/preview exist; deployed/provider/device verification pending; no runtime completion (§9). |
| F7 | Universal/Local creation, community reuse and Country/Locality | Build (separate track) | Architecture dependency | Partially implemented — BE C1–C5, C6b-1/3/4/5 foundations complete; C7 contract/backend complete at merged-source level (#88/#89); category/reuse/location FE and integrated chain pending (§6/§9). |

## G — Admin Template governance

| ID | Master architecture task | Current action | Priority / gate | Reconciled status / evidence |
| --- | --- | --- | --- | --- |
| G1 | Admin Template review | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| G2 | Approved Template authority | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| G3 | Admin geographic preview | Verify / repair | Foundation audit | Partially implemented — existing foundation; full task verification pending (§9). |
| G4 | Separate Universal/Local governance | Build (separate track) | Architecture dependency | Partially implemented — classified exact review, locality binding, Local continuity/suspension foundations complete; C7 backend complete (#89); category-specific Admin FE and full safety/evidence/validity incomplete (§6/§9). |

## H — Participant enrollment

| ID | Master architecture task | Current action | Priority / gate | Reconciled status / evidence |
| --- | --- | --- | --- | --- |
| H1 | Resolve access code | Build | Post-pilot / verify | Complete — merged/source verified for public code resolution only; FE #17 / BE #24 (§9). |
| H2 | Persist Participant enrollment | Build | Pilot critical | Not started — required runtime/extension absent (§9). |
| H3 | Enrollment availability rules | Build | Post-pilot / verify | Not started — required runtime/extension absent (§9). |
| H4 | Team creation/assignment | Build | Post-pilot / verify | Not started — required runtime/extension absent (§9). |
| H5 | Team lobby | Build | Post-pilot / verify | Not started — required runtime/extension absent (§9). |
| H6 | Readiness | Build | Post-pilot / verify | Not started — required runtime/extension absent (§9). |
| H7 | Start gate | Build | Post-pilot / verify | Not started — required runtime/extension absent (§9). |
| H8 | Session recovery/reconnect | Build | Post-pilot / verify | Not started — required runtime/extension absent (§9). |

## I — Checkpoint gameplay

| ID | Master architecture task | Current action | Priority / gate | Reconciled status / evidence |
| --- | --- | --- | --- | --- |
| I1 | Checkpoint runtime model | Build | Pilot critical | Not started — required runtime/extension absent (§9). |
| I2 | Participant progress state | Build | Post-pilot / verify | Not started — required runtime/extension absent (§9). |
| I3 | Answer submission | Build | Pilot critical | Not started — required runtime/extension absent (§9). |
| I4 | Backend validation | Build | Pilot critical | Not started — required runtime/extension absent (§9). |
| I5 | Hint use | Build | Post-pilot / verify | Not started — required runtime/extension absent (§9). |
| I6 | Personal and Team contribution | Build | Pilot critical | Not started — required runtime/extension absent (§9). |
| I7 | Score events | Build | Pilot critical | Not started — required runtime/extension absent (§9). |
| I8 | Idempotency | Build | Pilot critical | Not started — required runtime/extension absent (§9). |
| I9 | Restore progress | Build | Post-pilot / verify | Not started — required runtime/extension absent (§9). |
| I10 | All Signal checkpoints | Build | Post-pilot / verify | Not started — required runtime/extension absent (§9). |
| I11 | FinishPoint completion | Build | Pilot critical | Not started — terminal authoring exists; authoritative completion runtime absent (§9). |
| I12 | Participant map | Build | Post-pilot / verify | Not started — required runtime/extension absent (§9). |
| I13 | Checkpoint suspension | Build | Post-pilot / verify | Not started — required runtime/extension absent (§9). |
| I14 | Geographic gamification | Decision / defer | Later / decision | Decision/deferred — original scope decision retained. |

## J — Live operations

| ID | Master architecture task | Current action | Priority / gate | Reconciled status / evidence |
| --- | --- | --- | --- | --- |
| J1 | Shared Hunt live state | Build | Post-pilot / verify | Not started — required runtime/extension absent (§9). |
| J2 | Organizer Monitor | Build | Post-pilot / verify | Not started — required runtime/extension absent (§9). |
| J3 | Lifecycle controls | Build | Post-pilot / verify | Not started — required runtime/extension absent (§9). |
| J4 | Supervisor access | Build | Post-pilot / verify | Not started — required runtime/extension absent (§9). |
| J5 | Help request | Build | Pilot critical | Not started — real delivery absent; FE #117 fixes simulation truthfulness only. |
| J6 | PANIC incident | Build | Pilot critical | Not started — persisted real PANIC lifecycle absent; FE #117 is a simulation correction. |
| J7 | Acknowledge/resolve | Build | Pilot critical | Not started — demo dismissal is not real acknowledgement/resolution. |
| J8 | Network-loss fallback | Build | Post-pilot / verify | Not started — required runtime/extension absent (§9). |
| J9 | Live Operations Map | Decision / defer | Later / decision | Decision/deferred — original scope decision retained. |

## K — Results and rewards

| ID | Master architecture task | Current action | Priority / gate | Reconciled status / evidence |
| --- | --- | --- | --- | --- |
| K1 | Final score aggregation | Build | Pilot critical | Not started — required runtime/extension absent (§9). |
| K2 | Leaderboard | Build | Post-pilot / verify | Not started — required runtime/extension absent (§9). |
| K3 | Final results | Build | Pilot critical | Not started — required runtime/extension absent (§9). |
| K4 | Special Awards | Decision / defer | Later / decision | Decision/deferred — original scope decision retained. |
| K5 | Reward assignment | Decision / defer | Later / decision | Decision/deferred — original scope decision retained. |
| K6 | Physical-prize eligibility | Decision / defer | Later / decision | Decision/deferred — original scope decision retained. |

## L — Admin operations

| ID | Master architecture task | Current action | Priority / gate | Reconciled status / evidence |
| --- | --- | --- | --- | --- |
| L1 | Users and Roles | Verify / repair (security) | Post-pilot / verify | Partially implemented — real Users & Roles controls; full operational auditability remains pending (§9). |
| L2 | Hunt oversight | Verify / repair | Post-pilot / verify | Not started — required runtime/extension absent (§9). |
| L3 | Safety Alerts | Verify / repair | Post-pilot / verify | Not started — required runtime/extension absent (§9). |
| L4 | Physical Reward Inventory | Verify / repair | Post-pilot / verify | Not started — required runtime/extension absent (§9). |
| L5 | Platform Settings | Verify / repair | Post-pilot / verify | Not started — required runtime/extension absent (§9). |
| L6 | Audit Log | Verify / repair | Post-pilot / verify | Not started — required runtime/extension absent (§9). |

## M — Long-term Participant

| ID | Master architecture task | Current action | Priority / gate | Reconciled status / evidence |
| --- | --- | --- | --- | --- |
| M1 | Hunt Passport | Decision / defer | Later / decision | Decision/deferred — original scope decision retained. |
| M2 | Mission History | Decision / defer | Later / decision | Decision/deferred — original scope decision retained. |
| M3 | Achievements | Decision / defer | Later / decision | Decision/deferred — original scope decision retained. |
| M4 | Collectibles and virtual rewards | Decision / defer | Later / decision | Decision/deferred — original scope decision retained. |
| M5 | Long-term profile | Decision / defer | Later / decision | Decision/deferred — original scope decision retained. |

## N — Custom Hunt requests

| ID | Master architecture task | Current action | Priority / gate | Reconciled status / evidence |
| --- | --- | --- | --- | --- |
| N1 | Persist custom request | Decision / defer | Later / decision | Decision/deferred — original scope decision retained. |
| N2 | Admin triage | Decision / defer | Later / decision | Decision/deferred — original scope decision retained. |
| N3 | Assign Creator | Decision / defer | Later / decision | Decision/deferred — original scope decision retained. |
| N4 | Creator builds Template | Decision / defer | Later / decision | Decision/deferred — original scope decision retained. |
| N5 | Admin review | Decision / defer | Later / decision | Decision/deferred — original scope decision retained. |
| N6 | Return approved Template to Organizer | Decision / defer | Later / decision | Decision/deferred — original scope decision retained. |

# 5. Cross-cutting decisions and exceptions

- Independent Organizer (§11): unresolved identity/access and Personal Hunt authoring; keep isolated prototype, no bypass or invented launch path.

- Universal vs Local (§F1/F7/G4): categories of Template, not two gameplay engines. Universal approved source may be copied into Creator-owned version with provenance; Local has geography, independent review and exact-version approval. Organizer sees approved Local for selected Country/Locality.

- Approved Local continuity (Product Owner policy, reaffirmed 28 October 2026): an existing approved Local Template version remains eligible while its replacement is under review, unless Admin explicitly suspends it. Revision must preserve the prior exact approval independently of candidate state; no implicit withdrawal on draft/submission/request-changes. This is implemented at merged BE foundation/selection level by #87/#89; dependent FE and integrated/deployed acceptance remain missing. C6a §7/U2 temporary-removal recommendation conflicts with this approved policy and is not adopted. Local support is independently verified in C6b-5/C7 source; Universal C5 alone was never proof of it.

- Organizer map-first (§D10): Country → Locality → approved Template → read-only preview; do not treat a map as safety certification.

- Solo/Team (§3.3): Organizer selects supported mode; real team members, allocation independent of team size; all original required activities before five-minute recovery, legitimate fragment recovery after threshold, backend-validated collective solution.

- Team scoring (§3.3, PR \#116): exactly 100 points once to the team for successful challenge, including recovery; zero if uncompleted; no normalized Team scoring, no per-member Team Challenge points or recovery penalty.

- FinishPoint (§I11): same authoritative engine, terminal semantics; one team finishing does not end every team.

- Safety: persistent truthful HELP/PANIC and incident lifecycle; network loss must not falsely acknowledge delivery. GPS and route safety require real-device/human verification.

- Open policies: team size bounds, membership changes, late join/reassignment races, one-active-member recovery mechanic, GPS fallback, tie rules, cross-mode rankings, suspensions and global Hunt closure require narrow explicit decisions before relevant code.

# 6. Implementation PR control register

Use one row per actual PR. Status below refers only to each bounded slice, not completion of its parent A–N workflow. FE and BE PR numbers are repository-specific. Merge metadata and source were checked at the pinned heads in §9; test totals below are historical PR reports, not fresh runs in this reconciliation.

| PR / task IDs | Implemented scope | Reconciled state | Source/test evidence and limits |
| --- | --- | --- | --- |
| [FE #123](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/123) / F7-FE-01 | Four Creator Studio entries and read-only Mechanics Library; staged Universal/Local destinations; existing My Templates and legacy chooser preserved | Implemented — Draft, pending ChatGPT review; not merged | [Implementation report](F7_FE_01_Implementation_Report.md): 281 Vitest tests / 14 files, Node runner 35 passing file entries; typecheck/build and Chromium 320–1440px checks passed, zero skips. Contract/BE unchanged; FE pending review; integrated/deployed acceptance unverified. Universal/Local creation and full F7/D10 remain pending. |
| BE #69 / D01; E4/E12/E17 | Public applications refuse existing passwordless identities | Complete — merged/source verified | CreatorApplication.ts, OrganizerApplication.ts; ApplicationCredentials.integration.test.ts (ownership, activation races, rollback). Deployed verification pending. |
| BE #70 / D02; A4/A6 | Fail closed on unverified Tedix ID | Complete — merged/source verified | routes/auth.ts; TedixAuthentication.integration.test.ts. No upstream identity-verification integration; native auth retained. |
| BE #71 / D03; L1 | Account Deletion Integrity | Complete — merged/source verified | models/User.ts; UserDeletion.integration.test.ts. Creator dependencies retained through retirement; no general history deletion. |
| BE #72 / D04; B2/D8/G3 | Hidden geography access control | Complete — merged/source verified | routes/huntTemplates.ts; huntTemplates.integration.test.ts (professional capability, guest/Participant denial, role revocation). |
| BE #73 / D05; G1/G2 | Independent Template review | Complete — merged/source verified | HuntTemplate.approveCreatorTemplate and adminTemplateReviews.integration.test.ts: self-approval denial, exact submitted pin, rollback. |
| FE #117 / D06; J5–J7/L3 | Truthful HELP/PANIC safety UI | Complete — merged/source verified | SafetyDialog/readiness/Monitor/Admin demo labels; safetyPrototype.test.tsx. Real incident transport and lifecycle are absent; manual browser/device check pending. |
| BE #74 / D07; A4/E9 | JWT signing configuration security | Complete — merged/source verified | config/environment.ts + environment.test.ts and lib/jwt.ts: reject missing/weak/default secrets, no fallback. Serving configuration/revision not inspected. |
| BE #75 / F7 C0 | Backend contract/product decisions | Decision/deferred — merged proposal | F7_Backend_Template_Contract_Proposal.md; technical proposals are not implementation evidence. |
| BE #76 / F7 C1 | Universal/Local classification and immutable provenance foundation | Complete — merged/source verified | Migration 022, templateClassification.integration.test.ts; source bindings/history protections. Classified Organizer gates closed. |
| BE #77 / F7 C2 | Creator-owned Universal/Local scratch authoring | Complete — merged/source verified | routes/creatorTemplates.ts; creatorTemplates.integration.test.ts: category validation, persisted owner/capability, legacy starters unchanged. FE category authoring absent. |
| BE #78 / F7 C3, G4 foundation | Exact published Universal authority and Creator library | Complete — merged/source verified | models/PublishedUniversal.ts and creatorTemplates.integration.test.ts: independent exact approval, safe library projection. Current authority strengthened by C5. |
| BE #79 / F7 C4 | Independent Local draft from published Universal | Complete — merged/source verified | PublishedUniversal.ts; creatorTemplates.integration.test.ts: exact copy/provenance, stale reference, owner isolation, transaction rollback; no source propagation. |
| BE #80 / F7 C5 | Creator revisions and atomic Universal republication | Complete — merged/source verified | Migration 023; HuntTemplate.ts / PublishedUniversal.ts; creatorTemplates.integration.test.ts + templatePublication.integration.test.ts. Reported 1,037 tests/54 files, zero skips. Approved Local revision was not enabled by C5; subsequently implemented by C6b-5 (#87). |
| BE #81 / F7/G4 C6a | Hybrid Country/Locality contract | Decision/deferred — merged contract | F7_C6a_Hybrid_Locality_Contract.md. Provider rights unresolved; historical proposed withdrawal is superseded by continuity contracts #84/#86 and implementation #87 (§5). Actual C6b-3 API supersedes its proposal examples. |
| BE #82 / F7/G4 C6b-1 | Implemented Country/Locality foundation, subject to verification | Complete — merged/source verified | Migration 024; Geography.ts / routes/geography.ts; geography.integration.test.ts. Reported 1,043 tests/55 files, zero skips. RO reference only; no seeded localities/provider/FE/deployed E2E in #82. Template binding subsequently merged in #85. |
| BE #83 / F7/G4 C6b-3 | Implemented manual proposal/Admin-decision foundation, subject to verification | Complete — merged/source verified | Migration 025; LocalityProposal.ts / routes/localityProposals.ts; localityProposals.integration.test.ts. Reported 1,056 tests/56 files, zero skips. Independent evidence and storage-rights review remains human; no Template or Organizer activation. |
| BE #84 / F7 C6b-4 contract | Locality binding contract | Complete — merged/source verified — contract only | Binding/inheritance/refresh/null, exact snapshots and lock ordering; no implementation in #84. |
| BE #85 / F7 C6b-4 implementation | Local version locality binding | Complete — merged/source verified — backend foundation | Migration 026, HuntTemplate.ts, creatorTemplates.ts and templateLocalityBinding.integration.test.ts. Optional Local-only binding, server snapshot, exact inheritance/read, locks/rollback; no Organizer activation. Reported PostgreSQL and independently checked CI distinguished in §9. |
| BE #86 / F7/G4 C6b-5 contract | Exact Local authority, revision and suspension | Complete — merged/source verified — contract only | Independent exact-version approval survives candidate review; explicit one-way Admin suspension; no implementation in #86. |
| BE #87 / F7/G4 C6b-5 implementation | Local approval/revision continuity and suspension | Complete — merged/source verified — backend foundation | Migration 027/fresh schema, retained Local authority, immutable suspension tuple, locality submission/approval checks, private inspection and adversarial SQL guards. Historical compatibility/integrity limits retained; no C7, FE or deployed E2E. |
| BE #88 / C7 contract | Organizer Local eligibility/discovery/exact selection | Complete — merged/source verified — contract only; backend separately implemented in #89 | C7_Organizer_Local_Template_Eligibility_Contract.md defines routes/source tuple/acceptance. #88 itself registers no code; #89 implements it. D10 FE not implemented. |
| BE #89 / C7 implementation | Organizer eligible Local discovery/detail and exact atomic draft Hunt selection | Complete — merged/source verified — backend only | OrganizerLocalTemplate.ts, organizerLocalTemplates.ts, migration 028, app.ts, Hunt mapping/protected PATCH/publish and organizerLocalTemplate.integration.test.ts inspected. Reported 1,255 tests/60 files, zero failures/skips, not rerun here. No FE, deployment or E2E claim. |
| FE #121 / D10 readiness | Explicit integration blocker and verified C7 handoff | Complete — merged/source verified — documentation only | D10_Organizer_Integration_Readiness_Report.md; no application changes or Organizer implementation. D10 remains blocked. |
| FE #118 / control baseline | Faithful Markdown baseline conversion | Complete — merged/source verified — documentation only | Original file blob 35737425ed64805f55b79bb2dfc1d644ef58fa28; no implementation progress conveyed by conversion. |

Each PR above is individually linked with its merge SHA in the ledger in §9 and is also available in the [FE merged history](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pulls?q=is%3Apr+is%3Amerged) or [BE merged history](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pulls?q=is%3Apr+is%3Amerged). Pinned repository heads and merge SHAs are recorded in §9; evidence file paths are repository-relative.

| Remaining register scope (original order preserved) | Reconciled state / prerequisite |
| --- | --- |
| 04 — F7/G4/D10 track decision and completion | Partially implemented upstream BE; no approved pilot bypass inferred. Binding and approval-continuity/suspension foundations complete; C7 backend complete (#89); full safety/evidence/validity and category-specific FE/rollout remain incomplete. |
| C6b-2 — Mapbox permanent-storage integration | Blocked pending account entitlement verification: permanent-result storage, immutable snapshot/backup/sharing/post-termination retention, attribution and target settlement coverage. Temporary Search Box camera use confers no storage rights. No provider persistence found. |
| C6b-4 — Local version locality binding | Complete — merged/source verified — backend #85 against contract #84; verification boundaries in §9. |
| C6b-5 — Local approval/revision continuity, suspension and locality checks | Complete — merged/source verified — backend #87 against contract #86; verification boundaries in §9. |
| C7 — Organizer Local eligibility/discovery/exact-version Hunt selection | Complete — merged/source verified — contract #88 and backend #89; FE/integrated/deployed acceptance separate (§10). |
| D10 — Organizer frontend integration | Blocked — FE not started; C7 backend merged #89, but §20.2 Creator/Admin/reviewed-catalog/compatibility/readiness prerequisites remain (FE #121). |
| 05 — H1–H3 invitation, eligibility and enrollment | H1 code resolution complete; H2 enrollment and H3 authoritative admission rules not started. |
| 06 — H4–H8 membership/lobby/readiness/restore | Not started; team policies and enrollment prerequisites remain. |
| 07 — I1–I9 authoritative checkpoint engine | Not started; local prototype gameplay is not backend runtime. |
| 08 — I11, J, K FinishPoint/safety/operations/results | Not started for real workflows; authoring and D06 truthfulness are foundations only. |
| 09 — I10, I12–I14; L–N | Staged: runtime work not started; existing L1 foundation partial; other L operations absent; decision/deferred scope retained for I14 and M–N. |

# 7. Update the Master Architecture Plan — mandatory closing loop

At the end of each implementation PR (not only at the end of the whole project):

- Record merged PR number, FE/BE commit SHA, affected A–N task IDs and exact implemented scope.

- Update task status only for verified behavior; distinguish source tests, CI, deployed verification and multi-user E2E.

- Update API/schema/contract references, acceptance evidence and any known limitations.

- Keep approved decisions, unresolved policies, audit history and immutable Template/Hunt semantics intact.

- Reconcile this v3 control register with the repository Master Architecture Plan and companion Audit/Critical Path; document deferred work explicitly.

- Submit any documentation synchronization as a separate small Draft PR when appropriate; Product Owner reviews and merges.

# 8. Next action

**NEXT CODEX TASK: F7-FE-01 — Creator dashboard/navigation and read-only Mechanics Library.** Base implementation on freshly verified latest FE main in a separate bounded Draft PR. This documentation PR implements none of it.

Verified prerequisites: persisted active Creator guard/session and existing Studio; shared supported gameplay vocabulary/configuration contract (BE checkpointGameplay/C2, FE checkpointGameplay/editor); architecture F1/F7 four-entry information architecture. Implement Mechanics Library, My Templates, Create Universal Template and Create Local Template navigation with truthful staged destinations and short supported-authoring explanations. Existing My Templates remains usable; planned creation is not falsely routed to unclassified creation. Do not add a new mechanic, runtime or persistence contract. The [matrix capability boundary](TedixHunt_Execution_Dependency_Matrix.md#capability-boundary-and-first-task-prerequisites) constrains availability claims; unresolved future configuration fields remain decisions, not prerequisites invented for this read-only slice.

Closure: keyboard/focus/back navigation and responsive interaction tests, Creator-route authorization and session-error handling, no mutation from browsing, legacy Studio/starter reachability regression, relevant FE tests/typecheck/build and documented results/screenshots or equivalent review evidence. Record PR/merge SHA and exact implemented scope under F7-FE-01; do not mark F7 complete or D10 unblocked from this slice.

Execution order and critical path are in the [dependency matrix](TedixHunt_Execution_Dependency_Matrix.md#3-dependency-order-and-decisions): Creator type context and Universal create/save/submit; approved Universal reuse plus standalone Local; stored/manual locality binding and Local editor/revisions; independent category-specific Admin review with retained authority/suspension; applicable missing governance, reviewed catalog and legacy/compatibility decisions; D10 readiness gate; then dependent Organizer FE and integrated/deployed acceptance. Product/governance contract work can proceed alongside isolated Creator development. New narrative feedback requires its own reviewed contract; existing decision-state correction can proceed.

C6b-4/#85, C6b-5/#87, C7 contract/#88 and C7 backend/#89 are complete only at their bounded merged-source levels; do not reissue them. C6b-2 permanent provider persistence remains blocked by licensing; stored/manual work can proceed. D10 remains explicitly blocked under architecture §20.2 and FE #121 until its prerequisites are satisfied or PO records a specific scope clarification; no hidden integration exception is inferred. Runtime H–N sequencing, G0–G6 and explicit PO approval for a parallel pilot remain unchanged. No application, deployment, release or merge is authorized by this documentation PR.

# 9. Reconciliation record — 28 October 2026

**Historical record through BE #88.** Keep the observations, test reports and pending-work statements below at their stated source heads. Current §10, §6, §8 and dashboard supersede C7-pending claims after merged #89; they do not turn these historical observations into fresh verification.

## Baseline and verification boundaries

The following original reconciliation baseline is historical through BE #83. The dated supplement below advances the current source/evidence baseline through #88 without rewriting the earlier audit or its test record.

Original baseline: 26 October 2026; faithful conversion merged as FE #118 on 28 October. This update preserves every original A–N task identifier/action/priority, G0–G6 milestone rule, dependencies and deferred scope, while adding reconciled statuses, replacing unsupported register claims and correcting the next action. Original baseline is recoverable at [FE commit 3221a390](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/3221a3906e25c9fdea17aeb5a113e7238a0351c5/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md).

Reviewed source heads:

- FE `3221a3906e25c9fdea17aeb5a113e7238a0351c5` (main, #118). Architecture plan remains v3.6 with merged FE #114–#116 participation/recovery/+100 policy. FE application/tests are unchanged from #117, `efe9c282a45bdfcd7b9bd36451270d068d6bdb62`.
- BE `465775a47a1f699314377130f140aa341fd83d1b` (main, #83). Read current models/routes, additive migrations, integration-test assertions and relevant merged PR metadata. Merge dates were verified through GitHub, not inferred from PR titles or stale “Draft” wording in merged PR descriptions.
- No deployment, live database, Mapbox account, real-device GPS, multi-account gameplay or end-to-end safety verification performed. Historical PR-reported PostgreSQL results are labeled as such; this review inspects the tests but does not rerun BE integration suites. Local shell proxy was unavailable, so current BE evidence was read through GitHub; no live environment changes.

## Phase evidence and completion limits

The original evidence rows refer to the historical pinned heads above; F7/G4 is advanced to the #88 supplement below. [FE architecture plan](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/3221a3906e25c9fdea17aeb5a113e7238a0351c5/docs/TedixHunt_Prototype_Architecture_Implementation_Plan.md) and companion [audit/critical path](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/3221a3906e25c9fdea17aeb5a113e7238a0351c5/docs/TedixHunt_Architecture_Audit_and_Critical_Path_v1.md) retain historical checkmarks/findings; current bounded fixes in §6 supersede their stale security findings, without rewriting those documents here.

| Tasks | Verified foundation / relevant merged PRs | Remaining completion boundary |
| --- | --- | --- |
| A1–A6 | BE #9–#13; FE deployment/session foundations. Current auth.ts, jwt.ts and environment.ts show native sessions and fail-closed fixes #70/#74. FE AuthProvider/API client and existing auth tests. | Fresh deployed revision/configuration, backup/restore and operational acceptance not established; no whole-platform completion claim. |
| B1/B1.1/B2–B5 | BE #14–#16/#35; FE #28/#43/#45/#53/#61. Persisted global capabilities and Hunt context read model; current professional geography authorization regression inspected in BE huntTemplates.integration.test.ts. | Context/schema is not enrollment or Supervisor assignment/runtime. B6 effective Hunt authority absent; D9 remains not started. Full cross-domain acceptance not rerun. |
| C1–C4; D1–D8 | BE #17–#25/#50/#51/#63; FE #17/#18/#64/#83/#84. Existing Hunt setup, publish-readiness, exact snapshot/access-code/catalog integration and geographic inspection. | Current classified catalog resolver in HuntTemplate.ts requires category IS NULL. Generic setup is not D10 Country → Locality → eligible Local selection; new safety/category readiness and deployed supply-chain checks pending. |
| E1–E17 | BE #26/#28–#34/#36/#42/#46/#47; FE #19/#21/#27/#28/#30/#31/#35/#48/#54/#55/#60/#63. Existing real professional onboarding/UI/session foundations; D01/D02/D03/D07 regressions inspected. | E13/E16 are verification workflows: source tests do not close deployed onboarding E2E. Full account task acceptance not reverified here. |
| F1–F6 | BE #48–#62/#64–#68; FE #65/#67/#68/#74–#81/#86–#104. Current Creator persistence, geographic/terminal authoring and map/preview tests; independent exact Admin review tested. | Starter catalog is not published community reuse. Walking estimates/preview are not safety certification or runtime. Provider/device/deployed save/reopen/review verification pending. |
| F7/G4 | BE #76–#88; Universal publication/copy, stored/manual Localities, migration 026 binding and migration 027 Local authority/continuity/suspension implemented. C7 contract merged. | Full Local route-safety/evidence/validity/readiness remains incomplete; C7 backend implementation and D10 not started. FE/community supply chain and deployed acceptance pending. |
| G1–G3 | BE #56–#58/#63/#73/#80; FE #70/#73/#82. Current exact submitted-version review and self-approval/rollback tests; Admin geographic inspection. | Existing review foundation does not satisfy G4 Local governance or deployed independent route/safety review. |
| H1 | BE #24, FE #17: routes/huntAccess.ts returns only identity/code/name/status; FE services/api/huntAccess.ts and tests/huntAccess.test.ts; BE domain/huntAccess.test.ts. | Complete only for public lookup; no membership mutation or admission authorization. |
| H2–H8 | Membership/team tables and workspace reads exist; readiness screens are prototypes. BE app.ts exposes no enrollment/team/readiness/start/recovery runtime API. | Required persisted join/capacity/team/lobby/start/reconnect workflows not started; shared schema is not implementation. |
| I1–I13 | FE useTemplateOneMission.ts, template-one/TemplateOneExperience.tsx and checkpointGameplay/finishPoint/participantPreview tests implement local play/preview. BE app.ts has no authoritative checkpoint/answer/progress/scoring/FinishPoint runtime routes. | Persisted authoritative runtime, five-minute recovery, once-only +100, restore/concurrency, actual GPS progression and suspension absent. I14 stays decision/deferred. |
| J1–J8; K1–K3 | OrganizerMonitor and Participant gameplay/results are local prototypes; FE #117 adds truthful safety labels. No real incident/result runtime mounted in BE app.ts. | Real monitoring, HELP/PANIC delivery/receipt/resolve, network fallback, persisted final aggregation/results absent. J9/K4–K6 retain decision/deferred scope. |
| L1–L6 | BE #37–#45/#71 and FE #52/#57/#58 support real Users & Roles lifecycle controls; UserDeletion.integration.test.ts verifies dependency retention. AdminConsole operational cards remain demo/local UI. | L1 remains partial for full auditability; L2–L6 operational systems not implemented by their screens. D06 does not create Safety Alerts backend. |
| M1–M5; N1–N6 | Prototype history/request UI and generic Template review may be reusable foundations. | No verified persisted long-term Participant or complete request workflow; retain all decision/deferred boundaries. |


## Merge evidence ledger

| PR | Verified merge commit |
| --- | --- |
| [BE #69](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/69) | `0c128285a3b533e192d19047861e0bc401c3869d` |
| [BE #70](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/70) | `d5634074665d2d17062004f796742bb4e64e0d7b` |
| [BE #71](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/71) | `df7e38016be8df82d8441252f5c343b5be70dfd8` |
| [BE #72](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/72) | `5fa660a730ff2fd91d7442b755b73c9c82566cd8` |
| [BE #73](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/73) | `2869b3a56982e2e2a44d349062b8e4aac0d15e19` |
| [BE #74](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/74) | `4fea7c31375a5ce9a7899c0fc6f009eb42949298` |
| [BE #76](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/76) | `81f914dd95dd0a78fef651e61aab758c316a0f6b` |
| [BE #77](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/77) | `d89bc06c48aa21d5660803294bc0cfe3ac786850` |
| [BE #78](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/78) | `95da8c343a79ac1104df3ecc2b2cd8baf1e41e72` |
| [BE #79](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/79) | `7663dc95170e12b25cd17f9ad0771819c43f8906` |
| [BE #80](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/80) | `29ef1d9d808106735b101d65fd1344a546e01b87` |
| [BE #81](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/81) | `9ca8d90d85c228a37e617388157893ff2c9a50e7` |
| [BE #82](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/82) | `dd0f12b4abc67c917bb548bdb1a3b05faa402b2b` |
| [BE #83](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/83) | `465775a47a1f699314377130f140aa341fd83d1b` |
| [FE #117](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/117) | `efe9c282a45bdfcd7b9bd36451270d068d6bdb62` |
| [FE #118](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/118) | `3221a3906e25c9fdea17aeb5a113e7238a0351c5` |


## Specific discrepancies and unresolved blockers

- The original register's broad “Done” remains unsupported: binding and Local continuity/suspension are now merged foundations (#85/#87), but route safety, validity, full G4 readiness and C7/D10 implementation/acceptance remain incomplete.
- Architecture §20.1 is retained as a dated 24 October audit; its former current-state absence claims are explicitly superseded by the 28 October reconciliation in the same two-document PR. Both documents now agree on C6b-4/5 completion, C7 contract-only status and C7 implementation as next action.
- C6a proposed paths/status `accepted`/accept-against-existing are not C6b-3's actual API: Creator uses `/api/geography/locality-proposals` and `/mine`; Admin uses `/api/admin/locality-proposals` and `/:id/decision`, status `approved`. Approval creates a new catalog entry; duplicate conflict remains pending, with no silent reuse/merge. Independent evidence review and semantic duplicate ambiguity remain human responsibilities.
- Historical through #83: approved Local revision was rejected; C5 enabled Universal revisions only. Superseded by #87's Local-only retained approval authority and replacement flow. `published_version` remains Universal-only. Approved Local authority survives replacement review; explicit suspension remains effective after later approval. One-way suspension has no reinstatement/reset API.
- C6b-2 remains blocked by unverified account-specific Mapbox permanent-storage/retention entitlement. Do not persist temporary Search Box results through the manual-proposal path. C6b-3 rejects explicit Mapbox evidence text but cannot establish undisclosed provenance or licensing automatically.
- G0 source fixes are present, but no current deployment acceptance was established. G1 independent immutable route/safety verification, G2 Solo proof, G3 real Team proof, G4 variable-team scenarios and G5 operational/device proof remain open. G6 extensions remain staged. No pilot-track shortcut or release approval is inferred.
- Potential cross-feature integrity gap for follow-up: current User.deleteControlled dependency detection does not include locality_proposals creator/reviewer references, while migration 025 adds restrictive user FKs. A proposal-only Creator or reviewer without another recognized history dependency may reach hard deletion and hit the FK instead of retirement. The existing D03 fix remains verified for its original Creator/Template scope; no regression covering this later proposal-only account case was found in the inspected suites. Verify and repair separately before claiming complete account-deletion coverage for C6b-3; no application change is made here.
- Existing unresolved team/GPS/suspension/global-closure policies in §5 remain gates before their dependent work. No new policy is introduced by this reconciliation.

## Historical verification performed for the earlier control-plan reconciliation

FE focused regressions were run against local `efe9c28`, whose application/tests match current FE main (the only later merged change #118 is this baseline Markdown). Executed `npx vitest run tests/safetyPrototype.test.tsx`: 5/5 tests passed (one file). Executed `node --test --experimental-strip-types tests/huntAccess.test.ts tests/creatorTemplates.test.ts tests/adminTemplateReviews.test.ts tests/workspaceSelector.test.ts`: four Node test files passed, no skips. These include source-contract assertions, not real BE HTTP/PostgreSQL or deployed E2E. The initial Vitest invocation also named these `.test.ts` files, but Vitest includes only `.test.tsx`; they were run separately with Node. BE test assertions were inspected at the pinned current head; historical totals in §6 are PR-reported, not independently rerun. No application code or tests were modified.

## Foundation reconciliation supplement — 28 October 2026, through BE #88

Current reviewed FE main: `53a3e376025adb161e28430a4d6c8ebe35644218` (#119); current reviewed BE main: `c0b4dbd43707e993d9dede9c5ca75b0240cd647e` (#88). GitHub merge metadata was checked for every PR below. Historical “Draft / do not merge” wording in merged PR bodies/reports describes delivery at that time; it does not override `merged=true`.

### Exact merge evidence — contracts versus implementation

All timestamps below are UTC on 28 October 2026 (for unambiguous GitHub audit matching).

| PR | Exact status / merged at UTC | Merge commit | Final PR head commit | Evidence class |
| --- | --- | --- | --- | --- |
| [BE #84](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/84) | Closed; merged=true; 18:41:58 | `46e191fd84ccb0c919b0ff490b74dae169cd1deb` | `7d6212a4678b8b58f2d859f50a7b138cdf018d9f` | Contract only — C6b-4 |
| [BE #85](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/85) | Closed; merged=true; 18:55:00 | `9c20270f90cb31ed450eb7638eed9578d1d262a2` | `63f6e1ad18fc6a2dd77c589858fede8fd941a265` | Backend implementation — C6b-4 |
| [BE #86](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/86) | Closed; merged=true; 19:08:09 | `5518197ae63b669d83226669f68b19f4ade17f85` | `15ce8b9c9a1e21e275322aa13f768fcd56edca4a` | Contract only — C6b-5 |
| [BE #87](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/87) | Closed; merged=true; 19:55:59 | `0b63014f0ea197598990e9b92755dc999375141a` | `fec589f32829cf50a83b2f5c3f9200c5f1093138` | Backend implementation — C6b-5, hardened final head |
| [BE #88](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/88) | Closed; merged=true; 20:15:56 | `c0b4dbd43707e993d9dede9c5ca75b0240cd647e` | `047c4191f828a1ae94fd1bdadfa16a3e4b64e8dd` | Contract only — C7 |

### Verification classes and limits

| Evidence class | Observed evidence | Boundary |
| --- | --- | --- |
| Merged contract | #84 binding; #86 continuity/suspension; #88 C7 eligibility/selection | Contract approval does not implement or activate routes. |
| Merged backend implementation | #85 migration 026, Local-only stored ID/server snapshot, omission inheritance/explicit refresh/null and exact reads; #87 migration 027, retained exact authority/independent evidence, locality gates and immutable one-way suspension | Source, fresh-schema parity and relevant model/route/PostgreSQL test assertions inspected at pinned BE head. Complete only at backend foundation level. |
| Reported PostgreSQL tests | #85: PostgreSQL 17.11; focused 72/0/0; full 1,076/0/0 (57 files), including 213 PostgreSQL tests (not additional). #87: PostgreSQL 17.10; focused 90/0/0 (61 lifecycle/API/SQL + 29 guard tests); full 1,166/0/0 (59 files) | Pass/fail/skip totals are PR/report evidence, not locally rerun here. #84/#86/#88 are documentation only and add no executed acceptance results. |
| Independently verified CI | [#85 head run 40749287918](https://github.com/tedixdev-arch/Tedix_Hunt_BE/actions/runs/40749287918), `63f6e1ad18fc6a2dd77c589858fede8fd941a265`; [#87 head run 40757933255](https://github.com/tedixdev-arch/Tedix_Hunt_BE/actions/runs/40757933255), `fec589f32829cf50a83b2f5c3f9200c5f1093138`: Backend validation completed success; test job and build/database preparation/migrations/npm test steps success | GitHub run/job/step metadata inspected independently. Logs/totals not independently reproduced; successful CI does not prove deployment or E2E. Both runs' dev/production deployment jobs skipped. |
| Deployed verification | None performed for these slices in this reconciliation | No deployed revision/database/provider/device acceptance established. |
| End-to-end acceptance | Not established | C7 implementation, D10, full G4 governance and deployed supply-chain/rollout gates remain open. |

Pinned evidence: [C6b-4 contract](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/c0b4dbd43707e993d9dede9c5ca75b0240cd647e/docs/F7_C6b_4_Locality_Binding_Contract.md), [C6b-5 contract](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/c0b4dbd43707e993d9dede9c5ca75b0240cd647e/docs/F7_C6b_5_Local_Approval_Revision_Contract.md), [implementation report](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/c0b4dbd43707e993d9dede9c5ca75b0240cd647e/docs/F7_C6b_5_Implementation_Report.md), [authority guard review](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/c0b4dbd43707e993d9dede9c5ca75b0240cd647e/docs/F7_C6b_5_Authority_Guard_Review.md), and [C7 contract](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/c0b4dbd43707e993d9dede9c5ca75b0240cd647e/docs/C7_Organizer_Local_Template_Eligibility_Contract.md). Inspected migrations 026/027, schema.sql, HuntTemplate.ts, Creator/Admin routes, binding/lifecycle/authority-guard integration tests and app.ts/legacy Hunt paths. C7's proposed Organizer routes are absent; the contract's acceptance matrix is future work.

### Product rules and unresolved boundaries

Universal and Local remain independent reusable Template types; a Hunt is an instance, not a third Template type. Organizer chooses Country → Locality → available Local Template; Organizer residence does not restrict Hunt location. The backend must resolve the exact approved version and store immutable Hunt source snapshots. Organizers see names, locations and previews, not technical version management; stale selection requires refresh and explicit reconfirmation, never silent substitution.

Approved Local authority survives replacement drafting/submission/changes requested. Explicit Admin suspension prevents new selection under C7 and is not cleared by replacement approval or Locality reactivation. C6b-5 implements authority/suspension; enforcement by new Organizer selection remains C7 implementation work. Historical unbound/evidence-less approvals retain compatibility without invented reviews, binding or backfill; C7 excludes them. Missing/inconsistent pins remain integrity exceptions, never latest-version fallback. Existing Hunts and Signal: Cluj-Napoca remain unchanged.

C7 eligibility does not certify physical route safety. Full G4 evidence quality, validity/expiry/re-review, operating conditions and publish/start governance remain incomplete. C6b-2 Mapbox permanent-storage entitlement remains unresolved; manual/stored locations confer no provider rights. Reinstatement and historical remediation remain deferred. The earlier proposal-only account-deletion concern remains an unverified follow-up; suspension-attribution retirement added in #87 does not establish resolution of that separate case. No new contradiction in current C6b-4/5/C7/D10 status remains between these plans; historical source-head limitations are explicitly labeled.

### Documentation validation and changed sections

Architecture v3.6: current diagrams/captions in §3 and Phase F/G; BE baseline §9; F1/F7/G4 status and lifecycle §14; dated audit context §20.1; dependency update §20.2 and next action §21. Historical revision notes, original audit evidence and all existing acceptance gates retained. Control v3: §4 F7/G4 statuses, §6 register, §8 next action, §9 phase evidence/discrepancies and this dated supplement/ledger.

Validated existing Phase A–N task identifiers and G0–G6 gate rows against the pre-change documents; historical evidence/audit headings and original merge ledger retained. Checked referenced #84–#88 merge metadata and new pinned file/CI links via GitHub. Both plans agree: C6b-4/5 backend foundations complete, C7 contract complete/backend pending, D10 not started, full G4 incomplete, next action C7 backend. Only the two requested Markdown files change. No application/database/test edits or application tests run for this documentation-only reconciliation; prior test executions above remain historical evidence. Shell Git proxy unavailable; GitHub connector used for current source/evidence and delivery.

TedixHunt · Master Implementation Control Plan v3 · reconciled 28 October 2026 · Draft for ChatGPT review; do not merge or deploy.


# 10. Current reconciliation and execution control — 30 October 2026

## Verified current baseline and status corrections

Pinned latest FE main `fc43d2040700e44df0db9e5481f95964f597e6be` includes documentation-only FE #121; BE main `bcf1fda4153cc8ea787c4d7e5922f4cb4b34ee32` includes C7 #89. GitHub trees and direct PR metadata, including merged=true, merge commit and timestamps, were checked. PR descriptions retaining “Draft / do not merge” are historical and do not override GitHub merge state. Dates below retain UTC for exact GitHub audit matching; this review date uses Europe/Bucharest.

| PR | Verified GitHub merge UTC | Exact merge commit | Current completion boundary |
| --- | --- | --- | --- |
| [BE #76](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/76) | merged=true; 2026-10-27T17:33:47Z | `81f914dd95dd0a78fef651e61aab758c316a0f6b` | Backend foundation only |
| [BE #77](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/77) | merged=true; 2026-10-28T12:34:11Z | `d89bc06c48aa21d5660803294bc0cfe3ac786850` | Backend foundation only |
| [BE #78](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/78) | merged=true; 2026-10-28T12:52:51Z | `95da8c343a79ac1104df3ecc2b2cd8baf1e41e72` | Backend foundation only |
| [BE #79](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/79) | merged=true; 2026-10-28T16:23:27Z | `7663dc95170e12b25cd17f9ad0771819c43f8906` | Backend foundation only |
| [BE #80](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/80) | merged=true; 2026-10-28T16:49:09Z | `29ef1d9d808106735b101d65fd1344a546e01b87` | Backend foundation only |
| [BE #82](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/82) | merged=true; 2026-10-28T17:41:03Z | `dd0f12b4abc67c917bb548bdb1a3b05faa402b2b` | Backend foundation only |
| [BE #83](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/83) | merged=true; 2026-10-28T18:11:37Z | `465775a47a1f699314377130f140aa341fd83d1b` | Backend foundation only |
| [BE #85](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/85) | merged=true; 2026-10-28T18:55:00Z | `9c20270f90cb31ed450eb7638eed9578d1d262a2` | Backend foundation only |
| [BE #87](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/87) | merged=true; 2026-10-28T19:55:59Z | `0b63014f0ea197598990e9b92755dc999375141a` | Backend foundation only |
| [BE #88](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/88) | merged=true; 2026-10-28T20:15:56Z | `c0b4dbd43707e993d9dede9c5ca75b0240cd647e` | Contract only; #89 supplies implementation |
| [BE #89](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/89) | merged=true; 2026-10-29T23:34:41Z | `bcf1fda4153cc8ea787c4d7e5922f4cb4b34ee32` | Backend implementation complete at merged-source level; no FE/deployed/E2E completion |
| [FE #121](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/121) | merged=true; 2026-10-29T23:43:07Z | `fc43d2040700e44df0db9e5481f95964f597e6be` | D10 readiness documentation only, not Organizer implementation. |

| Item | Current status | What remains |
| --- | --- | --- |
| C6b-4 | Complete — merged/source verified | FE binding/editor and integrated/deployed acceptance. |
| C6b-5 | Complete — merged/source verified | FE continuity/suspension/independent review; no reinstatement API or automatic historic remediation. |
| C7 contract | Complete — merged/source verified | Contract closure is distinct from code and activation. |
| C7 backend | Complete — merged/source verified | No Organizer FE, physical safety certification, new publish/start governance, deployed or E2E completion. |
| F7 | Partially implemented | Category/reuse/location FE; existing editor and BE do not close the user workflow. |
| G4 task | Partially implemented | Category-specific Admin FE; route evidence quality, validity/expiry/re-review, conditions and applicable readiness enforcement. |
| D10 | Blocked | FE not implemented; explicit §20.2 integration prerequisites remain, documented by FE #121. |
| C6b-2 | Blocked | Account-specific permanent-storage/retention entitlement; temporary results cannot be laundered through manual proposals. |

## Execution slices and evidence levels

The [supporting matrix](TedixHunt_Execution_Dependency_Matrix.md) defines 13 F7 FE slices, 11 G4 FE/BE/decision items and 11 D10 gate/FE/acceptance items: **35 unique dependency-matrix IDs**. It adds **23 H–N subordinate execution/verification/decision IDs**, for **58 new IDs total**. Broad future governance/runtime rows are explicitly contract-first containers and must acquire PR-sized implementation children after approved design; they do not authorize a giant implementation. Original tasks are not renumbered, reordered or redefined.

For every slice track contract/decision, BE, FE, integrated workflow and deployed E2E separately. Existing C1–C7 contracts/BE foundations are merged-source complete where stated. All new FE deliverables remain incomplete; integrated/deployed acceptance is unverified. Governance APIs are missing/decision-dependent where marked. Required functionality, tests, security, legacy regressions, documentation and closure evidence are specified per slice plus CLOSE-1 in the matrix. All original A–N rows and G0–G6 gates remain; H–N scope and namespace collisions are explicitly audited there.

## Verification performed and limitations

Read current architecture v3.6, control plan, FE #121 readiness report, Creator Studio/chooser/gameplay and API client, Admin Console/TemplateReviews/review client, Organizer setup/editor/generalSetup and backend reports/contracts/routes/models plus binding/Local-approval/C7 test assertions. Verified BE #76–#80/#82/#83/#85/#87/#88/#89 and FE #121 merge metadata directly in GitHub; compared pinned tree and file contents rather than relying on the older local checkout. C7 discovery/detail/PUT registration, preview allowlist, exact approval/binding resolver, server source capture, preserved settings, authorization/locking and stale error rules were inspected. Source tests demonstrate intended coverage, not that they were rerun in this review.

BE #89 and its [implementation report](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/bcf1fda4153cc8ea787c4d7e5922f4cb4b34ee32/docs/C7_Implementation_Report.md) report PostgreSQL 17, 89 C7 tests included in 248 focused/8-file tests and 1,255 complete-suite/60-file tests, zero failures/skips, typecheck/build and 28-migration rerun/fresh-schema parity passed. These are **reported executions**, not fresh local results or independently verified current CI. No application/runtime tests were run for this docs-only change. No live DB, current deployed revision/API availability, provider entitlement, human route review, real-device GPS, multi-account integrated chain or deployed E2E was verified. Shell git fetch/clone failed at the configured proxy; GitHub connector reads/delivery were used without changing network controls.

Documentation checks: original §4 task ID/name/action/priority sequence and G0–G6 rows compared with the pinned pre-change master; all retained. Supporting matrix IDs/dependencies, duplicate IDs, counts, table column structure, relative links and Markdown whitespace checked. Only the master and one linked dependency table change. Architecture plan, application code, migrations, runtime tests and deployments are unchanged. GitHub diff and committed-file verification are required before delivery closure.

## Outstanding decisions, discrepancies and mapping

PO decisions are explicitly indexed in the matrix: applicable D10 integration prerequisites/scope clarification, safety/evidence/validity/operating/publish-start policy, legacy/Signal staged activation, version-bound narrative feedback, Mapbox rights, and existing dependent pilot/team/GPS/suspension/ranking policies. No decision or exception is invented. Stored/manual Creator/Admin development is not automatically blocked by provider persistence or deployment restrictions; the explicit D10 integration gate is preserved.

Architecture §20.1a/§20.2/§21's C7-pending status is stale after #89 and needs separate documentation synchronization. Architecture v3.6 and its design/gates are not rewritten in this PR. Historical Local compatibility without binding/independent evidence remains readable but excluded from new C7 selection; no latest-version fallback, automatic classification or history rewrite. The earlier proposal-only account-deletion concern remains an unverified L1 follow-up; #87 suspension-attribution protection does not prove that separate path fixed.

No existing task was found unmappable to the architecture. Phase C1–C4 versus F7 backend C1–C7, G4 variable-team gate versus G4 Admin task, and Mapbox M-stage versus Phase M IDs are explicitly distinguished in the matrix. All H–N original scope, approved five-minute recovery/+100-once rules, Signal: Cluj-Napoca compatibility and deferred features remain intact.

Draft for ChatGPT review. **Do not merge automatically. Do not deploy. Stop after the documentation Draft PR.**
