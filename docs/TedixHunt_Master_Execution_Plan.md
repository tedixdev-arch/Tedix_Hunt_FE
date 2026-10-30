# TedixHunt Master Execution Plan

Authoritative execution register, consolidated 30 October 2026 (Europe/Bucharest). Architecture remains v3.6. Base: FE main `ab54a3e0c776ed8843a2ae5d103f6313677aab2b`, including merged FE #123. This is reconciliation, with no new product scope or implementation authorization. [Reconciliation report](TedixHunt_Execution_Plan_Reconciliation.md) records counts, provenance and discrepancies.

This document governs task selection and current execution status. The [original control plan](TedixHunt_Master_Implementation_Control_Plan_v3.md) and [original matrix](TedixHunt_Execution_Dependency_Matrix.md) are frozen historical references. The Architecture Implementation Plan still governs architecture, requirements and acceptance; any conflict must be reported, never silently resolved. Historical timestamps and status wording below describe their pinned reviews, not current instructions.

## A. Execution rules

1. Every implementation must reference an existing authorized Task ID in §C. No Task ID means no implementation.
2. New executable tasks, including proposed children of a container, require Product Owner approval before entering this register. A mention of future children does not register them.
3. Verify dependencies, exact source/API evidence and ongoing/open PR work before starting. A merged backend prerequisite does not establish frontend, integration or deployed acceptance.
4. Do not silently expand scope, change task IDs, merge requirements or invent work to maintain progress. Strictly necessary supporting tests, types and refactoring are allowed within the bounded task when they add no separate feature.
5. Report discovered blockers and conflicting requirements; do not bypass them through hidden routes, flags, undocumented exceptions or guessed contracts.
6. Codex delivers one bounded Draft PR for ChatGPT review. Product Owner controls merging. Deployment requires its own authorization and evidence.
7. A merge proves neither integrated nor deployed acceptance. Preserve completed source history even when deployment fails.
8. Only the Product Owner may change major scope, architecture, execution priority or governance. Preserve documented sequence; only a documented dependency may require a different eligible choice.
9. Keep interfaces clear, simple and ergonomic; reuse existing working frontend/backend behavior. No unrelated screens, features, abstractions or optional capabilities.
10. Maintain this register and the evidence/history after verified changes; reconcile architecture/audit references through small documentation Draft PRs where appropriate. Never make untracked manual DB schema changes.

## B. Project execution dashboard

This is a derived navigation view of §C, not a second status register. Progress wording references register records; recompute this view from those records after status changes. A next candidate still requires §G's fresh dependency and open-work checks.

| Phase/workstream | Progress from §C | Current blockers / decisions | Next eligible boundary |
| --- | --- | --- | --- |
| A — Platform foundation | A1–A6 — 6 partial foundation / verification pending | Current deployment/configuration, rollback and backup/restore verification | No automatic preemption of F7 sequence |
| B — Identity and authorization | B1/B1.1/B2–B6 — 6 partial foundation / verification pending; 1 not started | B6 effective authority and assignment contract; D9 depends on B6 | B6 after content-chain gate |
| C — Hunt domain | C1–C4 — 4 partial foundation / verification pending | Classified/safety activation and deployed acceptance | Verify only within an authorized bounded slice |
| D — Organizer setup | D1–D10; D10-GATE — 8 partial foundation / verification pending; 2 not started | F7/G4 integrated readiness, reviewed catalog, PO-GATE/PO-LEGACY | D10-GATE remains blocked |
| E — Professional accounts | E1–E17 — 17 partial foundation / verification pending | Original verification limits and historic deployed claims conflict; see §E | Preserve onboarding history; no inferred new implementation |
| F — Creator Templates | F1–F7; F7-FE-01–13 — 7 partial foundation / verification pending; F7-FE-01 merged-source; 12 Creator FE slices remain | Classified FE remains missing after source-complete F7-FE-01 | F7-FE-02 is next candidate; F7-FE-03 follows recorded branch |
| G — Admin Template governance | G1–G4; G4 children — 4 partial foundation / verification pending | Representative submissions; PO-SAFETY/PO-FEEDBACK; missing governance APIs | G4 decision work alongside Creator only within recorded prerequisites |
| H — Participant enrollment | H1–H8; H execution entries — 1 source complete (bounded); 7 not started | Content-chain gate; B6/D9; P2 team policy | Bounded H contract/verification after gates |
| I — Checkpoint gameplay | I1–I14; I execution entries — 13 not started; 1 deferred | H start/membership; gameplay/GPS/suspension policies | One normal checkpoint plus terminal; A → B → C before I10 |
| J — Live operations | J1–J9; J execution entries — 8 not started; 1 deferred | B6/D9, H/I authority; incident and location/privacy decisions | Minimum safety/operations before each live stage |
| K — Results and rewards | K1–K6; K execution entries — 3 not started; 3 deferred | Authoritative I outcomes; tie/ranking/reward policy | Core results accompany each pilot stage |
| L — Admin operations | L1–L6; L execution entries — 1 partial foundation / verification pending; 5 not started | Proposal-only deletion concern; real incident/results domains | L1-VERIFY-1 within original sequence; scoped contracts for remaining systems |
| M — Long-term Participant | M1–M5; M1-DEC-1 — 5 deferred | Real completion/results and approved long-term rules | Decision-only; no feature authorization |
| N — Custom Hunt requests | N1–N6; N1-DEC-1 — 6 deferred | F/G/D supply chain and approved request contract | Decision/contract first; no invented orchestration |

Overall ordered content path: F7-FE-02/03 → Universal save/submit and community reuse/scratch Local branches → Local binding/editor/revision → independent G4 review → applicable governance/catalog/compatibility gate → D10 → integrated then separately authorized deployed acceptance. C6b-2 remains blocked; stored/manual development does not acquire a provider dependency. H–N follow the content chain unless the Product Owner explicitly approves P1's bounded parallel pilot.

## C. Authoritative task register

Only this section holds current task records. Original architecture rows retain their exact label, action, priority and legacy progress qualification. A parent is a scope/acceptance aggregate, never a duplicate executable task; child completion cannot close it. Phase A–N order remains original. The 23 H–N execution IDs retain their original contract/verification/decision boundary: they do not authorize a whole runtime feature. The undefined `.1` suffix in the historical matrix is a discrepancy, not an ID to invent.

Status is recorded by dimension. `Not started` for outstanding verification does not erase a partial or completed foundation. Unverified means no acceptance evidence recorded, not proof of failure. Parent aggregate qualifications and imported historical labels are retained explicitly rather than coerced to a false whole-task state. For every implementation use CLOSE-1 in §E plus the complete architecture requirement for the named original task.

### C1. Original architecture rows

For original rows without a dedicated dependency list, dependencies/acceptance remain the named architecture section and its §20 sequence; no guessed predecessor IDs are inserted. Before coding, read that section and verify its prerequisites. An unresolved contract or excessively broad task must return to the Product Owner for bounded scope approval, not become an invented task. PR evidence for each phase is preserved in §F's phase ledger.

<a id="task-a1"></a>

#### A1 — Deployment topology and verification

| Field | Record |
| --- | --- |
| Task ID | A1 |
| Parent / Phase | A — Platform foundation; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Deployment topology and verification; exact architecture scope retained |
| Dependencies | [A1. Deployment topology and verification](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — deployment diagnostics exist; rollback/backup and current deployment verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for A; original qualification: Partially implemented — deployment diagnostics exist; rollback/backup and current deployment verification pending (§9). |
| Acceptance | Full A1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-a2"></a>

#### A2 — PostgreSQL migration foundation

| Field | Record |
| --- | --- |
| Task ID | A2 |
| Parent / Phase | A — Platform foundation; Original executable verification/build/decision entry; not a new slice |
| Deliverable | PostgreSQL migration foundation; exact architecture scope retained |
| Dependencies | [A2. PostgreSQL migration foundation](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for A; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full A2 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-a3"></a>

#### A3 — User normalization and compatibility

| Field | Record |
| --- | --- |
| Task ID | A3 |
| Parent / Phase | A — Platform foundation; Original executable verification/build/decision entry; not a new slice |
| Deliverable | User normalization and compatibility; exact architecture scope retained |
| Dependencies | [A3. User normalization and compatibility](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for A; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full A3 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-a4"></a>

#### A4 — Core authentication

| Field | Record |
| --- | --- |
| Task ID | A4 |
| Parent / Phase | A — Platform foundation; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Core authentication; exact architecture scope retained |
| Dependencies | [A4. Core authentication](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for A; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full A4 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair (security). |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-a5"></a>

#### A5 — Frontend API/session layer

| Field | Record |
| --- | --- |
| Task ID | A5 |
| Parent / Phase | A — Platform foundation; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Frontend API/session layer; exact architecture scope retained |
| Dependencies | [A5. Frontend API/session layer](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for A; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full A5 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-a6"></a>

#### A6 — Existing real login flows

| Field | Record |
| --- | --- |
| Task ID | A6 |
| Parent / Phase | A — Platform foundation; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Existing real login flows; exact architecture scope retained |
| Dependencies | [A6. Existing real login flows](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for A; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full A6 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-b1"></a>

#### B1 — Multi-role identity

| Field | Record |
| --- | --- |
| Task ID | B1 |
| Parent / Phase | B — Identity and authorization; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Multi-role identity; exact architecture scope retained |
| Dependencies | [B1. Multi-role identity](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for B; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full B1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-b1-1"></a>

#### B1.1 — Workspace/context model

| Field | Record |
| --- | --- |
| Task ID | B1.1 |
| Parent / Phase | B — Identity and authorization; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Workspace/context model; exact architecture scope retained |
| Dependencies | [B1.1 Workspace/context model](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for B; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full B1.1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-b2"></a>

#### B2 — Backend role authorization

| Field | Record |
| --- | --- |
| Task ID | B2 |
| Parent / Phase | B — Identity and authorization; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Backend role authorization; exact architecture scope retained |
| Dependencies | [B2. Backend role authorization](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for B; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full B2 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair (security). |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-b3"></a>

#### B3 — Frontend role guards

| Field | Record |
| --- | --- |
| Task ID | B3 |
| Parent / Phase | B — Identity and authorization; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Frontend role guards; exact architecture scope retained |
| Dependencies | [B3. Frontend role guards](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for B; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full B3 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-b4"></a>

#### B4 — Organizations and membership

| Field | Record |
| --- | --- |
| Task ID | B4 |
| Parent / Phase | B — Identity and authorization; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Organizations and membership; exact architecture scope retained |
| Dependencies | [B4. Organizations and membership](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for B; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full B4 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-b5"></a>

#### B5 — Hunt-context roles

| Field | Record |
| --- | --- |
| Task ID | B5 |
| Parent / Phase | B — Identity and authorization; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Hunt-context roles; exact architecture scope retained |
| Dependencies | [B5. Hunt-context roles](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for B; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full B5 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-b6"></a>

#### B6 — Effective Hunt authority

| Field | Record |
| --- | --- |
| Task ID | B6 |
| Parent / Phase | B — Identity and authorization; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Effective Hunt authority; exact architecture scope retained |
| Dependencies | [B6. Effective Hunt authority — Mapbox M3 domain prerequisite](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for B; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full B6 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-c1"></a>

#### C1 — Core Hunt records

| Field | Record |
| --- | --- |
| Task ID | C1 |
| Parent / Phase | C — Hunt domain; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Core Hunt records; exact architecture scope retained |
| Dependencies | [C1. Core Hunt records](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for C; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full C1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-c2"></a>

#### C2 — Hunt lifecycle

| Field | Record |
| --- | --- |
| Task ID | C2 |
| Parent / Phase | C — Hunt domain; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Hunt lifecycle; exact architecture scope retained |
| Dependencies | [C2. Hunt lifecycle](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for C; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full C2 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-c3"></a>

#### C3 — Organizer Hunt list

| Field | Record |
| --- | --- |
| Task ID | C3 |
| Parent / Phase | C — Hunt domain; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Organizer Hunt list; exact architecture scope retained |
| Dependencies | [C3. Organizer Hunt list](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for C; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full C3 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-c4"></a>

#### C4 — Publish-readiness authority

| Field | Record |
| --- | --- |
| Task ID | C4 |
| Parent / Phase | C — Hunt domain; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Publish-readiness authority; exact architecture scope retained |
| Dependencies | [C4. Publish-readiness authority](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for C; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full C4 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-d1"></a>

#### D1 — General Setup

| Field | Record |
| --- | --- |
| Task ID | D1 |
| Parent / Phase | D — Organizer setup; Original executable verification/build/decision entry; not a new slice |
| Deliverable | General Setup; exact architecture scope retained |
| Dependencies | [D1. General Setup](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for D; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full D1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-d2"></a>

#### D2 — Template selection and snapshot

| Field | Record |
| --- | --- |
| Task ID | D2 |
| Parent / Phase | D — Organizer setup; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Template selection and snapshot; exact architecture scope retained |
| Dependencies | [D2. Template selection + snapshot](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for D; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full D2 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-d3"></a>

#### D3 — Supported pilot options

| Field | Record |
| --- | --- |
| Task ID | D3 |
| Parent / Phase | D — Organizer setup; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Supported pilot options; exact architecture scope retained |
| Dependencies | [D3. Supported pilot options](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for D; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full D3 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-d4"></a>

#### D4 — Rewards configuration

| Field | Record |
| --- | --- |
| Task ID | D4 |
| Parent / Phase | D — Organizer setup; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Rewards configuration; exact architecture scope retained |
| Dependencies | [D4. Rewards configuration](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for D; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full D4 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-d5"></a>

#### D5 — Review

| Field | Record |
| --- | --- |
| Task ID | D5 |
| Parent / Phase | D — Organizer setup; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Review; exact architecture scope retained |
| Dependencies | [D5. Review](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for D; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full D5 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-d6"></a>

#### D6 — Publish

| Field | Record |
| --- | --- |
| Task ID | D6 |
| Parent / Phase | D — Organizer setup; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Publish; exact architecture scope retained |
| Dependencies | [D6. Publish](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for D; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full D6 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-d7"></a>

#### D7 — Access code/link

| Field | Record |
| --- | --- |
| Task ID | D7 |
| Parent / Phase | D — Organizer setup; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Access code/link; exact architecture scope retained |
| Dependencies | [D7. Access code/link](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for D; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full D7 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-d8"></a>

#### D8 — Organizer geographic preview

| Field | Record |
| --- | --- |
| Task ID | D8 |
| Parent / Phase | D — Organizer setup; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Organizer geographic preview; exact architecture scope retained |
| Dependencies | [D8. Organizer geographic preview — Mapbox M2](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for D; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full D8 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-d9"></a>

#### D9 — Allocate Supervisors

| Field | Record |
| --- | --- |
| Task ID | D9 |
| Parent / Phase | D — Organizer setup; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Allocate Supervisors; exact architecture scope retained |
| Dependencies | [D9. Allocate Supervisors — Mapbox M3 frontend](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for D; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full D9 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-d10"></a>

#### D10 — Map-first General Setup

| Field | Record |
| --- | --- |
| Task ID | D10 |
| Parent / Phase | D — Organizer setup; Parent workstream; children: [D10-GATE](#task-d10-gate), [D10-FE-01](#task-d10-fe-01), [D10-FE-02](#task-d10-fe-02), [D10-FE-03](#task-d10-fe-03), [D10-FE-04](#task-d10-fe-04), [D10-FE-05](#task-d10-fe-05), [D10-FE-06](#task-d10-fe-06), [D10-FE-07](#task-d10-fe-07), [D10-FE-08](#task-d10-fe-08), [D10-E2E-01](#task-d10-e2e-01), [D10-E2E-02](#task-d10-e2e-02) |
| Deliverable | Map-first General Setup; exact architecture scope retained |
| Dependencies | [D10. Organizer map-first General Setup — planned workstream](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Architecture dependency. |
| Status | Aggregate only — Not started — FE absent; implementation blocked by §20.2 integration gates (FE #121), despite merged C7 BE #89. See D10-GATE. Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for D; original qualification: Not started — FE absent; implementation blocked by §20.2 integration gates (FE #121), despite merged C7 BE #89. See D10-GATE. |
| Acceptance | Full D10 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build (separate track). |
| Blocker / Decision | Retain original gate: Architecture dependency. §E decisions apply; no new priority or architecture decision. |

<a id="task-e1"></a>

#### E1 — Organizer application

| Field | Record |
| --- | --- |
| Task ID | E1 |
| Parent / Phase | E — Professional accounts; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Organizer application; exact architecture scope retained |
| Dependencies | [E1. Registered Organizer application](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full E1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-e2"></a>

#### E2 — Organizer login

| Field | Record |
| --- | --- |
| Task ID | E2 |
| Parent / Phase | E — Professional accounts; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Organizer login; exact architecture scope retained |
| Dependencies | [E2. Organizer login](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full E2 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-e3"></a>

#### E3 — Organizer approval backend

| Field | Record |
| --- | --- |
| Task ID | E3 |
| Parent / Phase | E — Professional accounts; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Organizer approval backend; exact architecture scope retained |
| Dependencies | [E3. Organizer approval backend](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full E3 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-e4"></a>

#### E4 — Organizer credential boundary

| Field | Record |
| --- | --- |
| Task ID | E4 |
| Parent / Phase | E — Professional accounts; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Organizer credential boundary; exact architecture scope retained |
| Dependencies | [E4. Organizer credential and authorization boundary](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full E4 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair (security). |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-e5"></a>

#### E5 — Admin backend login

| Field | Record |
| --- | --- |
| Task ID | E5 |
| Parent / Phase | E — Professional accounts; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Admin backend login; exact architecture scope retained |
| Dependencies | [E5. Real Admin backend login](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full E5 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-e6"></a>

#### E6 — Bootstrap first Admin

| Field | Record |
| --- | --- |
| Task ID | E6 |
| Parent / Phase | E — Professional accounts; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Bootstrap first Admin; exact architecture scope retained |
| Dependencies | [E6. Bootstrap first Admin](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full E6 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-e7"></a>

#### E7 — Admin frontend login

| Field | Record |
| --- | --- |
| Task ID | E7 |
| Parent / Phase | E — Professional accounts; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Admin frontend login; exact architecture scope retained |
| Dependencies | [E7. Real Admin frontend login](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full E7 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-e8"></a>

#### E8 — Protect Admin routes

| Field | Record |
| --- | --- |
| Task ID | E8 |
| Parent / Phase | E — Professional accounts; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Protect Admin routes; exact architecture scope retained |
| Dependencies | [E8. Protect Admin routes](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full E8 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-e9"></a>

#### E9 — Admin account security

| Field | Record |
| --- | --- |
| Task ID | E9 |
| Parent / Phase | E — Professional accounts; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Admin account security; exact architecture scope retained |
| Dependencies | [E9. Admin account security](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full E9 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair (security). |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-e10"></a>

#### E10 — Additional Admin provisioning

| Field | Record |
| --- | --- |
| Task ID | E10 |
| Parent / Phase | E — Professional accounts; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Additional Admin provisioning; exact architecture scope retained |
| Dependencies | [E10. Additional Admin provisioning](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full E10 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-e11"></a>

#### E11 — Organizer Applications Admin UI

| Field | Record |
| --- | --- |
| Task ID | E11 |
| Parent / Phase | E — Professional accounts; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Organizer Applications Admin UI; exact architecture scope retained |
| Dependencies | [E11. Organizer Applications Admin UI](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full E11 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-e12"></a>

#### E12 — Organizer self-registration credentials

| Field | Record |
| --- | --- |
| Task ID | E12 |
| Parent / Phase | E — Professional accounts; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Organizer self-registration credentials; exact architecture scope retained |
| Dependencies | [E12. Organizer self-registration credential lifecycle](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full E12 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-e13"></a>

#### E13 — Organizer onboarding E2E

| Field | Record |
| --- | --- |
| Task ID | E13 |
| Parent / Phase | E — Professional accounts; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Organizer onboarding E2E; exact architecture scope retained |
| Dependencies | [E13. Verify Organizer self-registration onboarding end-to-end](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — onboarding foundation exists; deployed onboarding E2E not verified (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for E; original qualification: Partially implemented — onboarding foundation exists; deployed onboarding E2E not verified (§9). |
| Acceptance | Full E13 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-e14"></a>

#### E14 — Creator provisioning

| Field | Record |
| --- | --- |
| Task ID | E14 |
| Parent / Phase | E — Professional accounts; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Creator provisioning; exact architecture scope retained |
| Dependencies | [E14. Creator provisioning](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full E14 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-e15"></a>

#### E15 — Creator activation

| Field | Record |
| --- | --- |
| Task ID | E15 |
| Parent / Phase | E — Professional accounts; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Creator activation; exact architecture scope retained |
| Dependencies | [E15. Creator activation/account lifecycle](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full E15 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-e16"></a>

#### E16 — Creator onboarding verification

| Field | Record |
| --- | --- |
| Task ID | E16 |
| Parent / Phase | E — Professional accounts; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Creator onboarding verification; exact architecture scope retained |
| Dependencies | [E16. Admin-provisioned Creator onboarding verification](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — Creator onboarding foundation exists; deployed verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for E; original qualification: Partially implemented — Creator onboarding foundation exists; deployed verification pending (§9). |
| Acceptance | Full E16 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-e17"></a>

#### E17 — Creator self-registration/application

| Field | Record |
| --- | --- |
| Task ID | E17 |
| Parent / Phase | E — Professional accounts; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Creator self-registration/application; exact architecture scope retained |
| Dependencies | [E17. Creator self-registration/application lifecycle](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full E17 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-f1"></a>

#### F1 — Template hierarchy and Mechanics Library

| Field | Record |
| --- | --- |
| Task ID | F1 |
| Parent / Phase | F — Creator Templates; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Template hierarchy and Mechanics Library; exact architecture scope retained |
| Dependencies | [F1. Authoritative Template hierarchy](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for F; original qualification: Partially implemented — existing foundation; full task verification pending (§9). FE #123 closes only F7-FE-01 navigation/guidance, not full F1 acceptance. |
| Acceptance | Full F1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-f2"></a>

#### F2 — Template persistence and immutable versions

| Field | Record |
| --- | --- |
| Task ID | F2 |
| Parent / Phase | F — Creator Templates; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Template persistence and immutable versions; exact architecture scope retained |
| Dependencies | [F2. Creator Template persistence and immutable versioning](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for F; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full F2 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-f3"></a>

#### F3 — Geographic checkpoint architecture

| Field | Record |
| --- | --- |
| Task ID | F3 |
| Parent / Phase | F — Creator Templates; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Geographic checkpoint architecture; exact architecture scope retained |
| Dependencies | [F3. Geographic checkpoint architecture](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for F; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full F3 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-f4"></a>

#### F4 — Radius contract compatibility

| Field | Record |
| --- | --- |
| Task ID | F4 |
| Parent / Phase | F — Creator Templates; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Radius contract compatibility; exact architecture scope retained |
| Dependencies | [F4. Radius contract compatibility — Mapbox M1a](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for F; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full F4 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-f5"></a>

#### F5 — Shared map and Creator Map Editor

| Field | Record |
| --- | --- |
| Task ID | F5 |
| Parent / Phase | F — Creator Templates; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Shared map and Creator Map Editor; exact architecture scope retained |
| Dependencies | [F5. Shared TedixMap and Creator Hunt Map Editor — Mapbox M1b](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for F; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full F5 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-f6"></a>

#### F6 — FinishPoint authoring and route validation

| Field | Record |
| --- | --- |
| Task ID | F6 |
| Parent / Phase | F — Creator Templates; Original executable verification/build/decision entry; not a new slice |
| Deliverable | FinishPoint authoring and route validation; exact architecture scope retained |
| Dependencies | [F6. FinishPoint configuration, route validation and Participant Preview — Mapbox M1c](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — authoring/route estimates/preview exist; deployed/provider/device verification pending; no runtime completion (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for F; original qualification: Partially implemented — authoring/route estimates/preview exist; deployed/provider/device verification pending; no runtime completion (§9). |
| Acceptance | Full F6 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-f7"></a>

#### F7 — Universal/Local creation, community reuse and Country/Locality

| Field | Record |
| --- | --- |
| Task ID | F7 |
| Parent / Phase | F — Creator Templates; Parent workstream; children: [F7-FE-01](#task-f7-fe-01), [F7-FE-02](#task-f7-fe-02), [F7-FE-03](#task-f7-fe-03), [F7-FE-04](#task-f7-fe-04), [F7-FE-05](#task-f7-fe-05), [F7-FE-06](#task-f7-fe-06), [F7-FE-07](#task-f7-fe-07), [F7-FE-08](#task-f7-fe-08), [F7-FE-09](#task-f7-fe-09), [F7-FE-10](#task-f7-fe-10), [F7-FE-11](#task-f7-fe-11), [F7-FE-12](#task-f7-fe-12), [F7-FE-13](#task-f7-fe-13) |
| Deliverable | Universal/Local creation, community reuse and Country/Locality; exact architecture scope retained |
| Dependencies | [F7. Universal/Local creation, reuse and Country/Locality — planned workstreams](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Architecture dependency. |
| Status | Aggregate only — Partially implemented — BE C1–C5, C6b-1/3/4/5 foundations complete; C7 contract/backend complete at merged-source level (#88/#89); category/reuse/location FE and integrated chain pending (§6/§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for F; original qualification: Partially implemented — BE C1–C5, C6b-1/3/4/5 foundations complete; C7 contract/backend complete at merged-source level (#88/#89); category/reuse/location FE and integrated chain pending (§6/§9). |
| Acceptance | Full F7 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build (separate track). |
| Blocker / Decision | Retain original gate: Architecture dependency. §E decisions apply; no new priority or architecture decision. |

<a id="task-g1"></a>

#### G1 — Admin Template review

| Field | Record |
| --- | --- |
| Task ID | G1 |
| Parent / Phase | G — Admin Template governance; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Admin Template review; exact architecture scope retained |
| Dependencies | [G1. Admin Template review](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for G; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full G1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-g2"></a>

#### G2 — Approved Template authority

| Field | Record |
| --- | --- |
| Task ID | G2 |
| Parent / Phase | G — Admin Template governance; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Approved Template authority; exact architecture scope retained |
| Dependencies | [G2. Organizer approved Template authority](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for G; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full G2 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-g3"></a>

#### G3 — Admin geographic preview

| Field | Record |
| --- | --- |
| Task ID | G3 |
| Parent / Phase | G — Admin Template governance; Original executable verification/build/decision entry; not a new slice |
| Deliverable | Admin geographic preview; exact architecture scope retained |
| Dependencies | [G3. Shared Admin geographic preview — Mapbox M2](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit. |
| Status | Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for G; original qualification: Partially implemented — existing foundation; full task verification pending (§9). |
| Acceptance | Full G3 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision. |

<a id="task-g4"></a>

#### G4 — Separate Universal/Local governance

| Field | Record |
| --- | --- |
| Task ID | G4 |
| Parent / Phase | G — Admin Template governance; Parent workstream; children: [G4-FE-01](#task-g4-fe-01), [G4-FE-02](#task-g4-fe-02), [G4-FE-03](#task-g4-fe-03), [G4-FE-04](#task-g4-fe-04), [G4-FE-05](#task-g4-fe-05), [G4-DEC-01](#task-g4-dec-01), [G4-BE-01](#task-g4-be-01), [G4-BE-02](#task-g4-be-02), [G4-BE-03](#task-g4-be-03), [G4-FE-06](#task-g4-fe-06), [G4-FE-07](#task-g4-fe-07) |
| Deliverable | Separate Universal/Local governance; exact architecture scope retained |
| Dependencies | [G4. Separate Universal/Local governance — planned extension](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Architecture dependency. |
| Status | Aggregate only — Partially implemented — classified exact review, locality binding, Local continuity/suspension foundations complete; C7 backend complete (#89); category-specific Admin FE and full safety/evidence/validity incomplete (§6/§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for G; original qualification: Partially implemented — classified exact review, locality binding, Local continuity/suspension foundations complete; C7 backend complete (#89); category-specific Admin FE and full safety/evidence/validity incomplete (§6/§9). |
| Acceptance | Full G4 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build (separate track). |
| Blocker / Decision | Retain original gate: Architecture dependency. §E decisions apply; no new priority or architecture decision. |

<a id="task-h1"></a>

#### H1 — Resolve access code

| Field | Record |
| --- | --- |
| Task ID | H1 |
| Parent / Phase | H — Participant enrollment; Parent workstream; children: [H1-VERIFY-1](#task-h1-verify-1) |
| Deliverable | Resolve access code; exact architecture scope retained |
| Dependencies | [H1. Resolve Hunt access code](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify. |
| Status | Aggregate only — Complete — merged/source verified for public code resolution only; FE #17 / BE #24 (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for H; original qualification: Complete — merged/source verified for public code resolution only; FE #17 / BE #24 (§9). Public lookup source complete (FE #17 / BE #24); H1-VERIFY-1 is rollout re-verification, not missing lookup implementation. |
| Acceptance | Full H1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision. |

<a id="task-h2"></a>

#### H2 — Persist Participant enrollment

| Field | Record |
| --- | --- |
| Task ID | H2 |
| Parent / Phase | H — Participant enrollment; Parent workstream; children: [H2-EXEC-1](#task-h2-exec-1) |
| Deliverable | Persist Participant enrollment; exact architecture scope retained |
| Dependencies | [H2. Participant enrollment](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Pilot critical. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for H; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full H2 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Pilot critical. §E decisions apply; no new priority or architecture decision. |

<a id="task-h3"></a>

#### H3 — Enrollment availability rules

| Field | Record |
| --- | --- |
| Task ID | H3 |
| Parent / Phase | H — Participant enrollment; Parent workstream; children: [H2-EXEC-1](#task-h2-exec-1) |
| Deliverable | Enrollment availability rules; exact architecture scope retained |
| Dependencies | [H3. Enrollment availability rules](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for H; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full H3 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision. |

<a id="task-h4"></a>

#### H4 — Team creation/assignment

| Field | Record |
| --- | --- |
| Task ID | H4 |
| Parent / Phase | H — Participant enrollment; Parent workstream; children: [H4-EXEC-1](#task-h4-exec-1) |
| Deliverable | Team creation/assignment; exact architecture scope retained |
| Dependencies | [H4. Team creation/assignment](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for H; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full H4 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision. |

<a id="task-h5"></a>

#### H5 — Team lobby

| Field | Record |
| --- | --- |
| Task ID | H5 |
| Parent / Phase | H — Participant enrollment; Parent workstream; children: [H5-EXEC-1](#task-h5-exec-1) |
| Deliverable | Team lobby; exact architecture scope retained |
| Dependencies | [H5. Team lobby](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for H; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full H5 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision. |

<a id="task-h6"></a>

#### H6 — Readiness

| Field | Record |
| --- | --- |
| Task ID | H6 |
| Parent / Phase | H — Participant enrollment; Parent workstream; children: [H5-EXEC-1](#task-h5-exec-1) |
| Deliverable | Readiness; exact architecture scope retained |
| Dependencies | [H6. Readiness](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for H; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full H6 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision. |

<a id="task-h7"></a>

#### H7 — Start gate

| Field | Record |
| --- | --- |
| Task ID | H7 |
| Parent / Phase | H — Participant enrollment; Parent workstream; children: [H5-EXEC-1](#task-h5-exec-1) |
| Deliverable | Start gate; exact architecture scope retained |
| Dependencies | [H7. Start gate](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for H; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full H7 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision. |

<a id="task-h8"></a>

#### H8 — Session recovery/reconnect

| Field | Record |
| --- | --- |
| Task ID | H8 |
| Parent / Phase | H — Participant enrollment; Parent workstream; children: [H8-EXEC-1](#task-h8-exec-1) |
| Deliverable | Session recovery/reconnect; exact architecture scope retained |
| Dependencies | [H8. Session recovery/reconnect](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for H; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full H8 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision. |

<a id="task-i1"></a>

#### I1 — Checkpoint runtime model

| Field | Record |
| --- | --- |
| Task ID | I1 |
| Parent / Phase | I — Checkpoint gameplay; Parent workstream; children: [I1-EXEC-1](#task-i1-exec-1) |
| Deliverable | Checkpoint runtime model; exact architecture scope retained |
| Dependencies | [I1. Checkpoint runtime model](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Pilot critical. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for I; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full I1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Pilot critical. §E decisions apply; no new priority or architecture decision. |

<a id="task-i2"></a>

#### I2 — Participant progress state

| Field | Record |
| --- | --- |
| Task ID | I2 |
| Parent / Phase | I — Checkpoint gameplay; Parent workstream; children: [I1-EXEC-1](#task-i1-exec-1) |
| Deliverable | Participant progress state; exact architecture scope retained |
| Dependencies | [I2. Participant progress state](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for I; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full I2 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision. |

<a id="task-i3"></a>

#### I3 — Answer submission

| Field | Record |
| --- | --- |
| Task ID | I3 |
| Parent / Phase | I — Checkpoint gameplay; Parent workstream; children: [I1-EXEC-1](#task-i1-exec-1) |
| Deliverable | Answer submission; exact architecture scope retained |
| Dependencies | [I3. Answer submission](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Pilot critical. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for I; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full I3 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Pilot critical. §E decisions apply; no new priority or architecture decision. |

<a id="task-i4"></a>

#### I4 — Backend validation

| Field | Record |
| --- | --- |
| Task ID | I4 |
| Parent / Phase | I — Checkpoint gameplay; Parent workstream; children: [I1-EXEC-1](#task-i1-exec-1) |
| Deliverable | Backend validation; exact architecture scope retained |
| Dependencies | [I4. Backend validation](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Pilot critical. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for I; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full I4 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Pilot critical. §E decisions apply; no new priority or architecture decision. |

<a id="task-i5"></a>

#### I5 — Hint use

| Field | Record |
| --- | --- |
| Task ID | I5 |
| Parent / Phase | I — Checkpoint gameplay; Parent workstream; children: [I5-EXEC-1](#task-i5-exec-1) |
| Deliverable | Hint use; exact architecture scope retained |
| Dependencies | [I5. Hint use](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for I; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full I5 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision. |

<a id="task-i6"></a>

#### I6 — Personal and Team contribution

| Field | Record |
| --- | --- |
| Task ID | I6 |
| Parent / Phase | I — Checkpoint gameplay; Parent workstream; children: [I5-EXEC-1](#task-i5-exec-1) |
| Deliverable | Personal and Team contribution; exact architecture scope retained |
| Dependencies | [I6. Personal/team contribution](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Pilot critical. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for I; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full I6 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Pilot critical. §E decisions apply; no new priority or architecture decision. |

<a id="task-i7"></a>

#### I7 — Score events

| Field | Record |
| --- | --- |
| Task ID | I7 |
| Parent / Phase | I — Checkpoint gameplay; Parent workstream; children: [I7-EXEC-1](#task-i7-exec-1) |
| Deliverable | Score events; exact architecture scope retained |
| Dependencies | [I7. Score events](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Pilot critical. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for I; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full I7 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Pilot critical. §E decisions apply; no new priority or architecture decision. |

<a id="task-i8"></a>

#### I8 — Idempotency

| Field | Record |
| --- | --- |
| Task ID | I8 |
| Parent / Phase | I — Checkpoint gameplay; Parent workstream; children: [I7-EXEC-1](#task-i7-exec-1) |
| Deliverable | Idempotency; exact architecture scope retained |
| Dependencies | [I8. Idempotency](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Pilot critical. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for I; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full I8 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Pilot critical. §E decisions apply; no new priority or architecture decision. |

<a id="task-i9"></a>

#### I9 — Restore progress

| Field | Record |
| --- | --- |
| Task ID | I9 |
| Parent / Phase | I — Checkpoint gameplay; Parent workstream; children: [I7-EXEC-1](#task-i7-exec-1) |
| Deliverable | Restore progress; exact architecture scope retained |
| Dependencies | [I9. Restore progress](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for I; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full I9 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision. |

<a id="task-i10"></a>

#### I10 — All Signal checkpoints

| Field | Record |
| --- | --- |
| Task ID | I10 |
| Parent / Phase | I — Checkpoint gameplay; Parent workstream; children: [I10-EXEC-1](#task-i10-exec-1) |
| Deliverable | All Signal checkpoints; exact architecture scope retained |
| Dependencies | [I10. Extend to all Signal checkpoints](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for I; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full I10 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision. |

<a id="task-i11"></a>

#### I11 — FinishPoint completion

| Field | Record |
| --- | --- |
| Task ID | I11 |
| Parent / Phase | I — Checkpoint gameplay; Parent workstream; children: [I11-EXEC-1](#task-i11-exec-1) |
| Deliverable | FinishPoint completion; exact architecture scope retained |
| Dependencies | [I11. FinishPoint terminal checkpoint completion](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Pilot critical. |
| Status | Aggregate only — Not started — terminal authoring exists; authoritative completion runtime absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for I; original qualification: Not started — terminal authoring exists; authoritative completion runtime absent (§9). |
| Acceptance | Full I11 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Pilot critical. §E decisions apply; no new priority or architecture decision. |

<a id="task-i12"></a>

#### I12 — Participant map

| Field | Record |
| --- | --- |
| Task ID | I12 |
| Parent / Phase | I — Checkpoint gameplay; Parent workstream; children: [I12-EXEC-1](#task-i12-exec-1) |
| Deliverable | Participant map; exact architecture scope retained |
| Dependencies | [I12. Participant geographic runtime — Mapbox M4](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for I; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full I12 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision. |

<a id="task-i13"></a>

#### I13 — Checkpoint suspension

| Field | Record |
| --- | --- |
| Task ID | I13 |
| Parent / Phase | I — Checkpoint gameplay; Parent workstream; children: [I13-EXEC-1](#task-i13-exec-1) |
| Deliverable | Checkpoint suspension; exact architecture scope retained |
| Dependencies | [I13. Runtime checkpoint suspension — prerequisite for Mapbox M5](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for I; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full I13 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision. |

<a id="task-i14"></a>

#### I14 — Geographic gamification

| Field | Record |
| --- | --- |
| Task ID | I14 |
| Parent / Phase | I — Checkpoint gameplay; Parent workstream; children: [I14-DEC-1](#task-i14-dec-1) |
| Deliverable | Geographic gamification; exact architecture scope retained |
| Dependencies | [I14. Geographic gamification — Mapbox M6](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision. |
| Status | Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for I; original qualification: Decision/deferred — original scope decision retained. |
| Acceptance | Full I14 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer. |
| Blocker / Decision | Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision. |

<a id="task-j1"></a>

#### J1 — Shared Hunt live state

| Field | Record |
| --- | --- |
| Task ID | J1 |
| Parent / Phase | J — Live operations; Parent workstream; children: [J1-EXEC-1](#task-j1-exec-1) |
| Deliverable | Shared Hunt live state; exact architecture scope retained |
| Dependencies | [J1. Shared Hunt live state](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for J; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full J1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision. |

<a id="task-j2"></a>

#### J2 — Organizer Monitor

| Field | Record |
| --- | --- |
| Task ID | J2 |
| Parent / Phase | J — Live operations; Parent workstream; children: [J1-EXEC-1](#task-j1-exec-1) |
| Deliverable | Organizer Monitor; exact architecture scope retained |
| Dependencies | [J2. Real Organizer Monitor](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for J; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full J2 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision. |

<a id="task-j3"></a>

#### J3 — Lifecycle controls

| Field | Record |
| --- | --- |
| Task ID | J3 |
| Parent / Phase | J — Live operations; Parent workstream; children: [J1-EXEC-1](#task-j1-exec-1) |
| Deliverable | Lifecycle controls; exact architecture scope retained |
| Dependencies | [J3. Live lifecycle controls](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for J; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full J3 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision. |

<a id="task-j4"></a>

#### J4 — Supervisor access

| Field | Record |
| --- | --- |
| Task ID | J4 |
| Parent / Phase | J — Live operations; Parent workstream; children: [J1-EXEC-1](#task-j1-exec-1) |
| Deliverable | Supervisor access; exact architecture scope retained |
| Dependencies | [J4. Supervisor operational access](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for J; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full J4 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision. |

<a id="task-j5"></a>

#### J5 — Help request

| Field | Record |
| --- | --- |
| Task ID | J5 |
| Parent / Phase | J — Live operations; Parent workstream; children: [J5-EXEC-1](#task-j5-exec-1) |
| Deliverable | Help request; exact architecture scope retained |
| Dependencies | [J5. Help request](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Pilot critical. |
| Status | Aggregate only — Not started — real delivery absent; FE #117 fixes simulation truthfulness only. Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for J; original qualification: Not started — real delivery absent; FE #117 fixes simulation truthfulness only. |
| Acceptance | Full J5 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Pilot critical. §E decisions apply; no new priority or architecture decision. |

<a id="task-j6"></a>

#### J6 — PANIC incident

| Field | Record |
| --- | --- |
| Task ID | J6 |
| Parent / Phase | J — Live operations; Parent workstream; children: [J5-EXEC-1](#task-j5-exec-1) |
| Deliverable | PANIC incident; exact architecture scope retained |
| Dependencies | [J6. PANIC / safety incident](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Pilot critical. |
| Status | Aggregate only — Not started — persisted real PANIC lifecycle absent; FE #117 is a simulation correction. Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for J; original qualification: Not started — persisted real PANIC lifecycle absent; FE #117 is a simulation correction. |
| Acceptance | Full J6 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Pilot critical. §E decisions apply; no new priority or architecture decision. |

<a id="task-j7"></a>

#### J7 — Acknowledge/resolve

| Field | Record |
| --- | --- |
| Task ID | J7 |
| Parent / Phase | J — Live operations; Parent workstream; children: [J5-EXEC-1](#task-j5-exec-1) |
| Deliverable | Acknowledge/resolve; exact architecture scope retained |
| Dependencies | [J7. Acknowledge/resolve](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Pilot critical. |
| Status | Aggregate only — Not started — demo dismissal is not real acknowledgement/resolution. Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for J; original qualification: Not started — demo dismissal is not real acknowledgement/resolution. |
| Acceptance | Full J7 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Pilot critical. §E decisions apply; no new priority or architecture decision. |

<a id="task-j8"></a>

#### J8 — Network-loss fallback

| Field | Record |
| --- | --- |
| Task ID | J8 |
| Parent / Phase | J — Live operations; Parent workstream; children: [J5-EXEC-1](#task-j5-exec-1) |
| Deliverable | Network-loss fallback; exact architecture scope retained |
| Dependencies | [J8. Network-loss fallback](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for J; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full J8 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision. |

<a id="task-j9"></a>

#### J9 — Live Operations Map

| Field | Record |
| --- | --- |
| Task ID | J9 |
| Parent / Phase | J — Live operations; Parent workstream; children: [J9-DEC-1](#task-j9-dec-1) |
| Deliverable | Live Operations Map; exact architecture scope retained |
| Dependencies | [J9. Shared Live Hunt Operations Map — Mapbox M5](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision. |
| Status | Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for J; original qualification: Decision/deferred — original scope decision retained. |
| Acceptance | Full J9 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer. |
| Blocker / Decision | Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision. |

<a id="task-k1"></a>

#### K1 — Final score aggregation

| Field | Record |
| --- | --- |
| Task ID | K1 |
| Parent / Phase | K — Results and rewards; Parent workstream; children: [K1-EXEC-1](#task-k1-exec-1) |
| Deliverable | Final score aggregation; exact architecture scope retained |
| Dependencies | [K1. Final score aggregation](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Pilot critical. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for K; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full K1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Pilot critical. §E decisions apply; no new priority or architecture decision. |

<a id="task-k2"></a>

#### K2 — Leaderboard

| Field | Record |
| --- | --- |
| Task ID | K2 |
| Parent / Phase | K — Results and rewards; Parent workstream; children: [K1-EXEC-1](#task-k1-exec-1) |
| Deliverable | Leaderboard; exact architecture scope retained |
| Dependencies | [K2. Leaderboard](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for K; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full K2 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision. |

<a id="task-k3"></a>

#### K3 — Final results

| Field | Record |
| --- | --- |
| Task ID | K3 |
| Parent / Phase | K — Results and rewards; Parent workstream; children: [K1-EXEC-1](#task-k1-exec-1) |
| Deliverable | Final results; exact architecture scope retained |
| Dependencies | [K3. Final results](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Pilot critical. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for K; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full K3 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build. |
| Blocker / Decision | Retain original gate: Pilot critical. §E decisions apply; no new priority or architecture decision. |

<a id="task-k4"></a>

#### K4 — Special Awards

| Field | Record |
| --- | --- |
| Task ID | K4 |
| Parent / Phase | K — Results and rewards; Parent workstream; children: [K4-DEC-1](#task-k4-dec-1) |
| Deliverable | Special Awards; exact architecture scope retained |
| Dependencies | [K4. Special Award calculation](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision. |
| Status | Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for K; original qualification: Decision/deferred — original scope decision retained. |
| Acceptance | Full K4 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer. |
| Blocker / Decision | Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision. |

<a id="task-k5"></a>

#### K5 — Reward assignment

| Field | Record |
| --- | --- |
| Task ID | K5 |
| Parent / Phase | K — Results and rewards; Parent workstream; children: [K4-DEC-1](#task-k4-dec-1) |
| Deliverable | Reward assignment; exact architecture scope retained |
| Dependencies | [K5. Reward assignment](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision. |
| Status | Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for K; original qualification: Decision/deferred — original scope decision retained. |
| Acceptance | Full K5 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer. |
| Blocker / Decision | Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision. |

<a id="task-k6"></a>

#### K6 — Physical-prize eligibility

| Field | Record |
| --- | --- |
| Task ID | K6 |
| Parent / Phase | K — Results and rewards; Parent workstream; children: [K4-DEC-1](#task-k4-dec-1) |
| Deliverable | Physical-prize eligibility; exact architecture scope retained |
| Dependencies | [K6. Physical-prize eligibility](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision. |
| Status | Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for K; original qualification: Decision/deferred — original scope decision retained. |
| Acceptance | Full K6 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer. |
| Blocker / Decision | Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision. |

<a id="task-l1"></a>

#### L1 — Users and Roles

| Field | Record |
| --- | --- |
| Task ID | L1 |
| Parent / Phase | L — Admin operations; Parent workstream; children: [L1-VERIFY-1](#task-l1-verify-1) |
| Deliverable | Users and Roles; exact architecture scope retained |
| Dependencies | [L1. Users & Roles](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify. |
| Status | Aggregate only — Partially implemented — real Users & Roles controls; full operational auditability remains pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for L; original qualification: Partially implemented — real Users & Roles controls; full operational auditability remains pending (§9). |
| Acceptance | Full L1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair (security). |
| Blocker / Decision | Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision. |

<a id="task-l2"></a>

#### L2 — Hunt oversight

| Field | Record |
| --- | --- |
| Task ID | L2 |
| Parent / Phase | L — Admin operations; Parent workstream; children: [L2-EXEC-1](#task-l2-exec-1) |
| Deliverable | Hunt oversight; exact architecture scope retained |
| Dependencies | [L2. Hunt oversight](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for L; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full L2 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision. |

<a id="task-l3"></a>

#### L3 — Safety Alerts

| Field | Record |
| --- | --- |
| Task ID | L3 |
| Parent / Phase | L — Admin operations; Parent workstream; children: [L2-EXEC-1](#task-l2-exec-1) |
| Deliverable | Safety Alerts; exact architecture scope retained |
| Dependencies | [L3. Safety Alerts](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for L; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full L3 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision. |

<a id="task-l4"></a>

#### L4 — Physical Reward Inventory

| Field | Record |
| --- | --- |
| Task ID | L4 |
| Parent / Phase | L — Admin operations; Parent workstream; children: [L4-DEC-1](#task-l4-dec-1) |
| Deliverable | Physical Reward Inventory; exact architecture scope retained |
| Dependencies | [L4. Physical Reward Inventory](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for L; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full L4 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision. |

<a id="task-l5"></a>

#### L5 — Platform Settings

| Field | Record |
| --- | --- |
| Task ID | L5 |
| Parent / Phase | L — Admin operations; Parent workstream; children: [L4-DEC-1](#task-l4-dec-1) |
| Deliverable | Platform Settings; exact architecture scope retained |
| Dependencies | [L5. Platform Settings](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for L; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full L5 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision. |

<a id="task-l6"></a>

#### L6 — Audit Log

| Field | Record |
| --- | --- |
| Task ID | L6 |
| Parent / Phase | L — Admin operations; Parent workstream; children: [L2-EXEC-1](#task-l2-exec-1) |
| Deliverable | Audit Log; exact architecture scope retained |
| Dependencies | [L6. Audit Log](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify. |
| Status | Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for L; original qualification: Not started — required runtime/extension absent (§9). |
| Acceptance | Full L6 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair. |
| Blocker / Decision | Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision. |

<a id="task-m1"></a>

#### M1 — Hunt Passport

| Field | Record |
| --- | --- |
| Task ID | M1 |
| Parent / Phase | M — Long-term Participant; Parent workstream; children: [M1-DEC-1](#task-m1-dec-1) |
| Deliverable | Hunt Passport; exact architecture scope retained |
| Dependencies | [M1. Hunt Passport](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision. |
| Status | Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for M; original qualification: Decision/deferred — original scope decision retained. |
| Acceptance | Full M1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer. |
| Blocker / Decision | Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision. |

<a id="task-m2"></a>

#### M2 — Mission History

| Field | Record |
| --- | --- |
| Task ID | M2 |
| Parent / Phase | M — Long-term Participant; Parent workstream; children: [M1-DEC-1](#task-m1-dec-1) |
| Deliverable | Mission History; exact architecture scope retained |
| Dependencies | [M2. Mission History](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision. |
| Status | Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for M; original qualification: Decision/deferred — original scope decision retained. |
| Acceptance | Full M2 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer. |
| Blocker / Decision | Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision. |

<a id="task-m3"></a>

#### M3 — Achievements

| Field | Record |
| --- | --- |
| Task ID | M3 |
| Parent / Phase | M — Long-term Participant; Parent workstream; children: [M1-DEC-1](#task-m1-dec-1) |
| Deliverable | Achievements; exact architecture scope retained |
| Dependencies | [M3. Achievements](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision. |
| Status | Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for M; original qualification: Decision/deferred — original scope decision retained. |
| Acceptance | Full M3 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer. |
| Blocker / Decision | Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision. |

<a id="task-m4"></a>

#### M4 — Collectibles and virtual rewards

| Field | Record |
| --- | --- |
| Task ID | M4 |
| Parent / Phase | M — Long-term Participant; Parent workstream; children: [M1-DEC-1](#task-m1-dec-1) |
| Deliverable | Collectibles and virtual rewards; exact architecture scope retained |
| Dependencies | [M4. Collectibles / virtual rewards](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision. |
| Status | Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for M; original qualification: Decision/deferred — original scope decision retained. |
| Acceptance | Full M4 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer. |
| Blocker / Decision | Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision. |

<a id="task-m5"></a>

#### M5 — Long-term profile

| Field | Record |
| --- | --- |
| Task ID | M5 |
| Parent / Phase | M — Long-term Participant; Parent workstream; children: [M1-DEC-1](#task-m1-dec-1) |
| Deliverable | Long-term profile; exact architecture scope retained |
| Dependencies | [M5. Long-term participant profile](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision. |
| Status | Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for M; original qualification: Decision/deferred — original scope decision retained. |
| Acceptance | Full M5 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer. |
| Blocker / Decision | Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision. |

<a id="task-n1"></a>

#### N1 — Persist custom request

| Field | Record |
| --- | --- |
| Task ID | N1 |
| Parent / Phase | N — Custom Hunt requests; Parent workstream; children: [N1-DEC-1](#task-n1-dec-1) |
| Deliverable | Persist custom request; exact architecture scope retained |
| Dependencies | [N1. Persist custom request](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision. |
| Status | Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for N; original qualification: Decision/deferred — original scope decision retained. |
| Acceptance | Full N1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer. |
| Blocker / Decision | Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision. |

<a id="task-n2"></a>

#### N2 — Admin triage

| Field | Record |
| --- | --- |
| Task ID | N2 |
| Parent / Phase | N — Custom Hunt requests; Parent workstream; children: [N1-DEC-1](#task-n1-dec-1) |
| Deliverable | Admin triage; exact architecture scope retained |
| Dependencies | [N2. Admin triage](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision. |
| Status | Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for N; original qualification: Decision/deferred — original scope decision retained. |
| Acceptance | Full N2 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer. |
| Blocker / Decision | Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision. |

<a id="task-n3"></a>

#### N3 — Assign Creator

| Field | Record |
| --- | --- |
| Task ID | N3 |
| Parent / Phase | N — Custom Hunt requests; Parent workstream; children: [N1-DEC-1](#task-n1-dec-1) |
| Deliverable | Assign Creator; exact architecture scope retained |
| Dependencies | [N3. Assign Creator](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision. |
| Status | Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for N; original qualification: Decision/deferred — original scope decision retained. |
| Acceptance | Full N3 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer. |
| Blocker / Decision | Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision. |

<a id="task-n4"></a>

#### N4 — Creator builds Template

| Field | Record |
| --- | --- |
| Task ID | N4 |
| Parent / Phase | N — Custom Hunt requests; Parent workstream; children: [N1-DEC-1](#task-n1-dec-1) |
| Deliverable | Creator builds Template; exact architecture scope retained |
| Dependencies | [N4. Creator builds requested template](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision. |
| Status | Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for N; original qualification: Decision/deferred — original scope decision retained. |
| Acceptance | Full N4 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer. |
| Blocker / Decision | Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision. |

<a id="task-n5"></a>

#### N5 — Admin review

| Field | Record |
| --- | --- |
| Task ID | N5 |
| Parent / Phase | N — Custom Hunt requests; Parent workstream; children: [N1-DEC-1](#task-n1-dec-1) |
| Deliverable | Admin review; exact architecture scope retained |
| Dependencies | [N5. Admin review](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision. |
| Status | Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for N; original qualification: Decision/deferred — original scope decision retained. |
| Acceptance | Full N5 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer. |
| Blocker / Decision | Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision. |

<a id="task-n6"></a>

#### N6 — Return approved Template to Organizer

| Field | Record |
| --- | --- |
| Task ID | N6 |
| Parent / Phase | N — Custom Hunt requests; Parent workstream; children: [N1-DEC-1](#task-n1-dec-1) |
| Deliverable | Return approved Template to Organizer; exact architecture scope retained |
| Dependencies | [N6. Return approved template to Organizer](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision. |
| Status | Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F. |
| PR / Evidence | §F phase evidence for N; original qualification: Decision/deferred — original scope decision retained. |
| Acceptance | Full N6 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer. |
| Blocker / Decision | Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision. |

### C2. Expanded F7 / G4 / D10 execution entries

The original two keyed matrix tables are joined here, with every deliverable, prerequisite, acceptance/test, PR boundary and blocking-effect cell preserved. Only F7-FE-01 receives a verified current-state correction. No other slice is promoted from its imported state.

<a id="task-f7-fe-01"></a>

#### F7-FE-01 — Four-entry dashboard and read-only Mechanics Library

| Field | Record |
| --- | --- |
| Task ID | F7-FE-01 |
| Parent / Phase | F / Creator; original parent [F7](#task-f7) |
| Deliverable | Four-entry dashboard and read-only Mechanics Library |
| Dependencies | Backend: Existing framework/gameplay contract; no new API. C2 typed authoring is merged. Frontend: Existing /creator guard, Studio and shared editor Governance: No new mechanic or availability policy. See capability boundary below. Correction: noninteractive Coming soon cards are the merged bounded result; no unavailable-flow dialog or classified creation is implied. See §E discrepancies. |
| Status | Merged — source verified. Contract/BE: existing support unchanged; no new API. FE: Merged — source verified. Integrated workflow: unverified. Deployed E2E: unverified. F1/F7 remain partial; D10 stays blocked. |
| PR / Evidence | [FE #123](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/123), merged=true, 2026-10-30T00:19:05Z; merge `ab54a3e0c776ed8843a2ae5d103f6313677aab2b`, final head `7798b6d8c1f25ddb01c3149d9e5aebe90570cf5d`. Navigation source and guarded-route test assertions inspected at main; [report](F7_FE_01_Implementation_Report.md) records 281 Vitest tests/14 files, 35 Node entries, typecheck/build and Chromium 320–1440px passing (reported, not rerun here). |
| Acceptance | Show Mechanics Library, My Templates, Create Universal Template, Create Local Template. Reach guidance and owned list; creation entries reach explicit forthcoming-flow explanations until their slices ship, never generic unclassified creation masquerading as classified. Explain existing authorable components separately from planned runtime. Tests/closure: Keyboard/focus/back navigation; responsive views; no create/save requests on browsing; Creator guard and existing Studio entry regression. CLOSE-1 applies. PR boundary: Dashboard/navigation and read-only guidance only; no category mutations. |
| Blocker / Decision | No new mechanic or availability policy. See capability boundary below. Correction: noninteractive Coming soon cards are the merged bounded result; no unavailable-flow dialog or classified creation is implied. See §E discrepancies. Blocking effect: Unblocks F7-FE-02/03; required for content chain; no public activation. |

<a id="task-f7-fe-02"></a>

#### F7-FE-02 — My Templates category, candidate and approval context

| Field | Record |
| --- | --- |
| Task ID | F7-FE-02 |
| Parent / Phase | F / Creator; original parent [F7](#task-f7) |
| Deliverable | My Templates category, candidate and approval context |
| Dependencies | Backend: GET /api/creator/templates and /{key}; C2/C5/C6b-5 private projections. Frontend: F7-FE-01 Governance: None; do not infer type on legacy NULL. |
| Status | Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Show explicit Universal/Local/legacy-unclassified, candidate status/version and retained approval/publication separately; loading/empty/retry/401/403 and ownership-safe 404; no latest-as-approved assumption. Tests/closure: Projection fixtures for draft/submitted/changes_requested/approved, retained Local authority, suspension and integrity exception; revoked session; legacy list/delete regressions. CLOSE-1 applies. PR boundary: Typed read projections and owned-list UI only. |
| Blocker / Decision | None; do not infer type on legacy NULL. Blocking effect: Unblocks F7-FE-04/08/11; required before workflow acceptance. |

<a id="task-f7-fe-03"></a>

#### F7-FE-03 — Create Universal draft in shared reusable editor

| Field | Record |
| --- | --- |
| Task ID | F7-FE-03 |
| Parent / Phase | F / Creator; original parent [F7](#task-f7) |
| Deliverable | Create Universal draft in shared reusable editor |
| Dependencies | Backend: POST /api/creator/templates {key,content,category:universal}; C2. Frontend: F7-FE-01; existing gameplay/checkpoint editor Governance: Use only currently supported typed configuration; no new framework fields. |
| Status | Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Explicit Universal identity; no fixed Country/Locality/route requirement; reuse story/gameplay editor; no reserved ownership/provenance fields; persisted response is authority. Tests/closure: Exact POST envelope; progressive route-free draft; unsupported mechanics and 400/403/409; duplicate click/lost-response recovery via owned list; legacy scratch unchanged. CLOSE-1 applies. PR boundary: Classified Universal creation and type-relevant editor sections. |
| Blocker / Decision | Use only currently supported typed configuration; no new framework fields. Blocking effect: Unblocks F7-FE-04; no G4/D10 bypass. |

<a id="task-f7-fe-04"></a>

#### F7-FE-04 — Edit, save and reopen Universal draft

| Field | Record |
| --- | --- |
| Task ID | F7-FE-04 |
| Parent / Phase | F / Creator; original parent [F7](#task-f7) |
| Deliverable | Edit, save and reopen Universal draft |
| Dependencies | Backend: POST /api/creator/templates/{key}/versions {content}; GET owned detail; C2/C5. Frontend: F7-FE-02/03 Governance: None. |
| Status | Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Explicit save creates immutable version; hydrate response/version; no save per keystroke; preserve mission/gameplay/terminal content; submitted remains locked. Tests/closure: Save/reopen round trip; failed save retains input; stale/server-state refresh; other-owner denial; old version and legacy persistence regression. CLOSE-1 applies. PR boundary: Universal draft persistence only. |
| Blocker / Decision | None. Blocking effect: Unblocks F7-FE-05/11. |

<a id="task-f7-fe-05"></a>

#### F7-FE-05 — Submit saved Universal for independent review

| Field | Record |
| --- | --- |
| Task ID | F7-FE-05 |
| Parent / Phase | F / Creator; original parent [F7](#task-f7) |
| Deliverable | Submit saved Universal for independent review |
| Dependencies | Backend: POST /api/creator/templates/{key}/submit {version}; C2. Frontend: F7-FE-04 Governance: None; approval is independent Admin action. |
| Status | Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Submit exact saved latest candidate, surface validation without route-safety checklist for Universal; unsaved edits require save; submitted read-only; approval never promises Organizer availability. Tests/closure: Counted gameplay plus terminal validation; 400/409 stale or repeat submission; no direct approve/publish; legacy submit regression. CLOSE-1 applies. PR boundary: Universal submission and status UI. |
| Blocker / Decision | None; approval is independent Admin action. Blocking effect: Provides representative Universal for G4-FE-01/02. |

<a id="task-f7-fe-06"></a>

#### F7-FE-06 — Browse approved Universal Library

| Field | Record |
| --- | --- |
| Task ID | F7-FE-06 |
| Parent / Phase | F / Creator; original parent [F7](#task-f7) |
| Deliverable | Browse approved Universal Library |
| Dependencies | Backend: GET /api/creator/universal-library and /{key}; C3/C5. Frontend: F7-FE-01/02 Governance: None; shipped starters are separate. |
| Status | Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Show one product per exact published reference, approved content/provenance allowlist and explicit empty/loading/error states; no private drafts or history selector. Tests/closure: Cross-Creator browse; missing/evidence-free/Local excluded; 401/403/404; source approval changes refresh details; starters unchanged. CLOSE-1 applies. PR boundary: Read-only community Universal chooser. |
| Blocker / Decision | None; shipped starters are separate. Blocking effect: Unblocks F7-FE-07. |

<a id="task-f7-fe-07"></a>

#### F7-FE-07 — Copy approved Universal to independent Local draft

| Field | Record |
| --- | --- |
| Task ID | F7-FE-07 |
| Parent / Phase | F / Creator; original parent [F7](#task-f7) |
| Deliverable | Copy approved Universal to independent Local draft |
| Dependencies | Backend: POST /api/creator/templates/from-universal/{sourceKey} {key,publishedReference:{templateId,version}}; C4. Frontend: F7-FE-06 and shared editor Governance: None; never propagate later source edits. |
| Status | Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Use exact inspected publication and new destination key; independent owned Local v1 with server provenance; stale source requires explicit refresh/reselect; no inferred Local approval. Tests/closure: Exact C4 envelope; cross-Creator independence, stale 409, invalid 400, authorization, duplicate key/lost response; unchanged source and starter path. CLOSE-1 applies. PR boundary: Copy action and independent Local handoff only. |
| Blocker / Decision | None; never propagate later source edits. Blocking effect: Unblocks F7-FE-09; one Local origin for E2E. |

<a id="task-f7-fe-08"></a>

#### F7-FE-08 — Create Local independently from scratch

| Field | Record |
| --- | --- |
| Task ID | F7-FE-08 |
| Parent / Phase | F / Creator; original parent [F7](#task-f7) |
| Deliverable | Create Local independently from scratch |
| Dependencies | Backend: POST /api/creator/templates {key,content,category:local}; C2. Frontend: F7-FE-02/03 reusable editor pattern Governance: None; Universal is optional. |
| Status | Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Local start chooser offers approved Universal and scratch. Scratch creates independent Local with no source lineage, progressive drafts and separate reusable/location sections. Tests/closure: Exact Local category; no invented source; owner denial/duplicate handling; incomplete draft save allowed; legacy starter creation unchanged. CLOSE-1 applies. PR boundary: Local scratch entry and draft identity only. |
| Blocker / Decision | None; Universal is optional. Blocking effect: Unblocks F7-FE-09; second Local origin for E2E. |

<a id="task-f7-fe-09"></a>

#### F7-FE-09 — Country/Locality selection and immutable binding

| Field | Record |
| --- | --- |
| Task ID | F7-FE-09 |
| Parent / Phase | F / Creator; original parent [F7](#task-f7) |
| Deliverable | Country/Locality selection and immutable binding |
| Dependencies | Backend: GET geography countries/localities/{id}, search; C6b-1; Local create/save localityId, C6b-4. Frontend: F7-FE-07 or 08 Governance: Stored/manual only; C6b-2 stays blocked. |
| Status | Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Country reset clears stale locality choice; query nonempty country-scoped search; use UUID, not text. Distinguish omission inheritance, explicit refresh UUID and null clearing on new versions; show saved snapshot versus current registry. Tests/closure: Same-name UUIDs, inactive/wrong-country/material drift, empty catalog, delayed search responses, save/reopen snapshot, 400/404/409; no client snapshot fields. CLOSE-1 applies. PR boundary: Selectors and server binding integration only; immutable means version snapshot, not ban on explicit new-version rebinding. |
| Blocker / Decision | Stored/manual only; C6b-2 stays blocked. Blocking effect: Unblocks F7-FE-10/12; does not require provider storage. |

<a id="task-f7-fe-10"></a>

#### F7-FE-10 — Missing locality proposal and own decision status

| Field | Record |
| --- | --- |
| Task ID | F7-FE-10 |
| Parent / Phase | F / Creator; original parent [F7](#task-f7) |
| Deliverable | Missing locality proposal and own decision status |
| Dependencies | Backend: POST /api/geography/locality-proposals; GET /mine; C6b-3. Frontend: F7-FE-09; G4-FE-05 closes the later review loop (not a prerequisite to form development) Governance: Independent rights/evidence; semantic duplicates stay human decisions. |
| Status | Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Creator submits name/context/coordinates/explanation/independent evidence; pending is not a selectable Locality. Approved UUID becomes discoverable; rejected/duplicate pending states explicit; no temporary Mapbox-derived persistence. Tests/closure: Validation, role/ownership denial, pending/approved/rejected, duplicate conflict and no provider payload; legacy geography unchanged. CLOSE-1 applies. PR boundary: Manual proposal form and own history only. |
| Blocker / Decision | Independent rights/evidence; semantic duplicates stay human decisions. Blocking effect: Needed for empty-catalog manual path, not for existing stored-locality work. |

<a id="task-f7-fe-11"></a>

#### F7-FE-11 — Immutable revisions, request-changes state and resubmission

| Field | Record |
| --- | --- |
| Task ID | F7-FE-11 |
| Parent / Phase | F / Creator; original parent [F7](#task-f7) |
| Deliverable | Immutable revisions, request-changes state and resubmission |
| Dependencies | Backend: Existing versions/submit; C5 Universal and C6b-5 Local continuity; owned detail. Frontend: F7-FE-02/04/05; Local binding/editor for Local cases Governance: Narrative review feedback needs G4-BE-03 decision/contract; current API exposes decision/state, not a feedback conversation. |
| Status | Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Approved or changes_requested classified item creates new immutable candidate; submitted locked; previous published/approved authority visible; save then exact resubmit. Show current decision truthfully, never fabricate reviewer comments. Tests/closure: Universal and Local correction/resubmit; approval retained during candidate states; suspended remains suspended; old artifacts and copies stable; legacy lifecycle restrictions retained. CLOSE-1 applies. PR boundary: Supported revision lifecycle only; free-text feedback excluded pending separate contract. |
| Blocker / Decision | Narrative review feedback needs G4-BE-03 decision/contract; current API exposes decision/state, not a feedback conversation. Blocking effect: Unblocks final Creator acceptance; narrative feedback remains tracked separately. |

<a id="task-f7-fe-12"></a>

#### F7-FE-12 — Local geography editor, validation and exact submission

| Field | Record |
| --- | --- |
| Task ID | F7-FE-12 |
| Parent / Phase | F / Creator; original parent [F7](#task-f7) |
| Deliverable | Local geography editor, validation and exact submission |
| Dependencies | Backend: C2 Local completeness; C6b-4 binding and C6b-5 submission gates; versions/submit APIs. Frontend: F7-FE-09; reuse RouteEditor, FinishPointEditor, CheckpointGameplayEditor Governance: New route evidence/operating-condition fields wait G4-BE-01/02. |
| Status | Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Visible Local-specific geography/adaptation area; count 1–20 numbered checkpoints and one complete FinishPoint/terminal gameplay; active matching stored binding. Progressive save allowed, complete saved artifact required for submission; route estimate never safety certification. Tests/closure: Scratch and copied Local save/reopen/submit; missing positions/terminal/binding and material registry drift rejection; exact saved version; existing Signal editor/preview regressions. CLOSE-1 applies. PR boundary: Local editor adaptation and submit; no new evidence schema. |
| Blocker / Decision | New route evidence/operating-condition fields wait G4-BE-01/02. Blocking effect: Representative Local submissions unblock G4-FE-01/03; required content chain. |

<a id="task-f7-fe-13"></a>

#### F7-FE-13 — Creator workflow regression and integration acceptance

| Field | Record |
| --- | --- |
| Task ID | F7-FE-13 |
| Parent / Phase | F / Creator; original parent [F7](#task-f7) |
| Deliverable | Creator workflow regression and integration acceptance |
| Dependencies | Backend: C1–C6b-5 merged APIs in disposable integrated environment. Frontend: F7-FE-01 through 12; G4-FE-01 through 05 for review cases Governance: Feedback decision boundary recorded; provider path excluded. |
| Status | Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Prove both Local origins, separate Universal/Local decisions, revise/resubmit and approval visibility; auth/error/loading/stale coverage across all slices. No frontend guard substitutes for BE authorization. Tests/closure: Real FE→BE flows with two Creators and independent Admin, including combined-role self-review denial; Signal starters, legacy NULL templates, deletion/save/preview regressions; typecheck/build and relevant FE suites. CLOSE-1 applies. PR boundary: Cross-slice acceptance tests and documented gaps, not gameplay runtime. |
| Blocker / Decision | Feedback decision boundary recorded; provider path excluded. Blocking effect: Closes Creator integration evidence; feeds D10-GATE and D10-E2E-01. |

<a id="task-g4-fe-01"></a>

#### G4-FE-01 — Separate Universal/Local queues and exact submitted inspection

| Field | Record |
| --- | --- |
| Task ID | G4-FE-01 |
| Parent / Phase | G / Admin A; original parent [G4](#task-g4) |
| Deliverable | Separate Universal/Local queues and exact submitted inspection |
| Dependencies | Backend: GET /api/admin/templates/review and /{key}; C2/C5/C6b-5. Frontend: F7-FE-05/12 representative submitted artifacts; existing Admin review UI Governance: None; client queue grouping only, no invented server filter. |
| Status | Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Separate explicit categories and legacy group; inspect exact returned submitted version, never latest candidate; immutable content and private route inspected only by Admin. Tests/closure: Mixed categories/legacy, later candidate fixture, loading/empty/auth/error/ambiguous 404, revoked Admin; existing review regression. CLOSE-1 applies. PR boundary: Queue grouping, typed projections and read-only submitted detail. |
| Blocker / Decision | None; client queue grouping only, no invented server filter. Blocking effect: Unblocks G4-FE-02/03; required Admin chain. |

<a id="task-g4-fe-02"></a>

#### G4-FE-02 — Independent exact approval and request-changes

| Field | Record |
| --- | --- |
| Task ID | G4-FE-02 |
| Parent / Phase | G / Admin A; original parent [G4](#task-g4) |
| Deliverable | Independent exact approval and request-changes |
| Dependencies | Backend: POST /api/admin/templates/review/{key}/approve or /request-changes with {version}; C5/C6b-5. Frontend: G4-FE-01 Governance: No narrative feedback contract yet; G4-BE-03. |
| Status | Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Send exact inspected version for both classified decisions; no self-approval even combined roles; stale decision refreshes inspection and requires new explicit action; no invented rejection state. Tests/closure: Capture exact request, stale/repeated 409, self-review/unauthorized denial, failed action no success UI; legacy optional-body behavior regression. CLOSE-1 applies. PR boundary: Decision mutations and state refresh only. |
| Blocker / Decision | No narrative feedback contract yet; G4-BE-03. Blocking effect: Unblocks independent approval acceptance; not full safety governance. |

<a id="task-g4-fe-03"></a>

#### G4-FE-03 — Local geographic/binding and retained-authority inspection

| Field | Record |
| --- | --- |
| Task ID | G4-FE-03 |
| Parent / Phase | G / Admin A; original parent [G4](#task-g4) |
| Deliverable | Local geographic/binding and retained-authority inspection |
| Dependencies | Backend: GET review/{key}, ?view=approved; geography exact read; C6b-4/5. Frontend: G4-FE-01; F7-FE-09/12 Governance: Historical remediation is deferred; no backfill. |
| Status | Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Show exact positions/FinishPoint and saved locality snapshot, separate current registry and candidate. Inspect retained Local approval while replacement is draft/submitted/changes_requested. Surface historical unbound/evidence-less/integrity exceptions without inferring valid authority. Tests/closure: Saved-label drift versus numeric drift, inactive locality, missing pins, old approval during revision, privacy and legacy preview; read-only map regression. CLOSE-1 applies. PR boundary: Local inspection/continuity UI using existing geography components. |
| Blocker / Decision | Historical remediation is deferred; no backfill. Blocking effect: Unblocks G4-FE-04; required before catalog acceptance. |

<a id="task-g4-fe-04"></a>

#### G4-FE-04 — Explicit suspension and consequences

| Field | Record |
| --- | --- |
| Task ID | G4-FE-04 |
| Parent / Phase | G / Admin A; original parent [G4](#task-g4) |
| Deliverable | Explicit suspension and consequences |
| Dependencies | Backend: POST /api/admin/templates/{key}/suspend {version,reason}; C6b-5; C7 eligibility. Frontend: G4-FE-03 Governance: One-way only; reinstatement/reset requires separate decision. |
| Status | Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Suspend exact inspected retained Local authority with nonblank reason ≤1,000 characters. Show audit and distinguish candidate approval from suspension. Explain exclusion from new selection; no claim existing Hunts or runtime are stopped. Tests/closure: Exact version conflict/reason validation, permission and repeated action, retained suspension after later approval; C7 list/PUT exclusion; existing Hunt snapshot unchanged. CLOSE-1 applies. PR boundary: Admin suspension action, consequences and evidence view. |
| Blocker / Decision | One-way only; reinstatement/reset requires separate decision. Blocking effect: Required Admin operational boundary; runtime I13 remains separate. |

<a id="task-g4-fe-05"></a>

#### G4-FE-05 — Independent manual Locality proposal review

| Field | Record |
| --- | --- |
| Task ID | G4-FE-05 |
| Parent / Phase | G / Admin A; original parent [G4](#task-g4) |
| Deliverable | Independent manual Locality proposal review |
| Dependencies | Backend: GET /api/admin/locality-proposals; POST /{id}/decision {decision,reason}; C6b-3. Frontend: F7-FE-10 for representative proposal; existing Admin guard Governance: Human place/evidence/rights check; no automatic duplicate merge. |
| Status | Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Inspect full proposal; independent approved/rejected decision and required reason; approved creates stored UUID; duplicate conflict leaves pending. Template approval remains separate. Tests/closure: Self-review denial, concurrent/repeated decision, duplicate pending, empty/error/auth, approved UUID available to Creator; legacy review regression. CLOSE-1 applies. PR boundary: Proposal review only. |
| Blocker / Decision | Human place/evidence/rights check; no automatic duplicate merge. Blocking effect: Completes manual-catalog branch; not required for existing stored fixtures. |

<a id="task-g4-dec-01"></a>

#### G4-DEC-01 — Product Owner safety/validity/operating and integration-gate decision

| Field | Record |
| --- | --- |
| Task ID | G4-DEC-01 |
| Parent / Phase | G / Admin C; original parent [G4](#task-g4) |
| Deliverable | Product Owner safety/validity/operating and integration-gate decision |
| Dependencies | Backend: No complete safety/validity governance contract in C7. Frontend: G4-FE-03 evidence examples; architecture §14/§20.2 and D10 readiness Governance: Define proportional route/access evidence, qualified review, validity/expiry/re-review, operating conditions, existing-Hunt consequences, publish/start enforcement and applicable D10 gates. |
| Status | Deferred. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Deferred. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Written decision distinguishes Universal content approval, Local geographic approval and physical safety; names required evidence, owner, expiry triggers and failure behavior. Explicitly settle any bounded integration exception rather than infer one. Tests/closure: Review decision against sample safe/blocked/expired routes, historical legacy and Signal; no fabricated safety certification; document unresolved cases. CLOSE-1 applies. PR boundary: Decision document PR, no runtime code. |
| Blocker / Decision | Define proportional route/access evidence, qualified review, validity/expiry/re-review, operating conditions, existing-Hunt consequences, publish/start enforcement and applicable D10 gates. Blocking effect: Blocks G4-BE-01/02 and D10-GATE; public activation blocked. |

<a id="task-g4-be-01"></a>

#### G4-BE-01 — Safety evidence and operating-condition API contract then implementation

| Field | Record |
| --- | --- |
| Task ID | G4-BE-01 |
| Parent / Phase | G / Admin B; original parent [G4](#task-g4) |
| Deliverable | Safety evidence and operating-condition API contract then implementation |
| Dependencies | Backend: G4-DEC-01 approved; new additive immutable-version evidence contract required. Frontend: Representative F7/G4 artifacts Governance: G4-DEC-01 |
| Status | Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | First contract PR defines storage/projection/access/version binding; subsequent bounded implementation PRs enforce required evidence and operating conditions server-side. Reuse exact review, never infer safety from coordinates/C7. Tests/closure: Disposable DB/API positive/negative/authorization/rollback/history tests; old snapshots unchanged; document migration/contract and acceptance. CLOSE-1 applies. PR boundary: Planning container: contract first, split storage/API and validation into child PRs after approved design; not one giant PR. |
| Blocker / Decision | G4-DEC-01 Blocking effect: Blocks G4-FE-06 and full D10 readiness where applicable. |

<a id="task-g4-be-02"></a>

#### G4-BE-02 — Validity, expiry/re-review and readiness enforcement

| Field | Record |
| --- | --- |
| Task ID | G4-BE-02 |
| Parent / Phase | G / Admin B; original parent [G4](#task-g4) |
| Deliverable | Validity, expiry/re-review and readiness enforcement |
| Dependencies | Backend: G4-DEC-01; G4-BE-01 version/evidence contract; new governance APIs. Frontend: No FE prerequisite beyond fixtures Governance: Explicit temporal rules and publish/start/existing-Hunt consequences approved first. |
| Status | Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Implement only approved validity/expiry/re-review gates and trustworthy server state; exact retained artifact/candidate distinction persists. No implicit historical revocation/backfill. Tests/closure: Boundary-time, expiry/approval/selection/publish races, auth, rollback and stable existing snapshots; legacy/Signal policy cases. CLOSE-1 applies. PR boundary: Contract then small authority/readiness implementation PRs; define execution children after decision. |
| Blocker / Decision | Explicit temporal rules and publish/start/existing-Hunt consequences approved first. Blocking effect: Blocks G4-FE-06 and public activation; applicable D10 gates remain. |

<a id="task-g4-be-03"></a>

#### G4-BE-03 — Narrative request-changes feedback contract and API

| Field | Record |
| --- | --- |
| Task ID | G4-BE-03 |
| Parent / Phase | G / Admin B; original parent [G4](#task-g4) |
| Deliverable | Narrative request-changes feedback contract and API |
| Dependencies | Backend: Existing review records store decision; no supported end-to-end narrative feedback contract found. Frontend: G4-FE-02 and F7-FE-11 state-only flows Governance: PO decides required feedback fields, visibility, retention and exact-version linkage. |
| Status | Deferred. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Deferred. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | If approved, persist/retrieve reviewer feedback tied to exact review/version, owner-scoped and Admin-authorized; correction resubmits new immutable version. Do not invent endpoints in FE. Tests/closure: Feedback visibility/auth, repeat/stale decision, retention and immutable history; legacy decision regression; contract examples. CLOSE-1 applies. PR boundary: Decision/contract first, then separate bounded BE implementation. |
| Blocker / Decision | PO decides required feedback fields, visibility, retention and exact-version linkage. Blocking effect: Blocks G4-FE-07 narrative feedback only; not existing state-only correction. |

<a id="task-g4-fe-06"></a>

#### G4-FE-06 — Safety, validity and operating-condition review controls

| Field | Record |
| --- | --- |
| Task ID | G4-FE-06 |
| Parent / Phase | G / Admin B; original parent [G4](#task-g4) |
| Deliverable | Safety, validity and operating-condition review controls |
| Dependencies | Backend: G4-BE-01/02 merged and available. Frontend: G4-FE-01/02/03 Governance: G4-DEC-01 approved policies |
| Status | Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Render authoritative evidence/expiry/conditions; prevent approval when required evidence missing; explicit re-review state and readiness explanation. Client does not certify route or compute authoritative expiry. Tests/closure: Required/missing/expired/re-review cases, auth/stale/races via integration, history/legacy compatibility, documented human route review. CLOSE-1 applies. PR boundary: Split evidence UI and validity controls into separately reviewed children after API is approved. |
| Blocker / Decision | G4-DEC-01 approved policies Blocking effect: Blocks full G4 closure and D10-GATE as applicable. |

<a id="task-g4-fe-07"></a>

#### G4-FE-07 — Exact review feedback authoring and Creator display

| Field | Record |
| --- | --- |
| Task ID | G4-FE-07 |
| Parent / Phase | G / Admin B; original parent [G4](#task-g4) |
| Deliverable | Exact review feedback authoring and Creator display |
| Dependencies | Backend: G4-BE-03 approved and merged. Frontend: G4-FE-02; F7-FE-11 Governance: Feedback visibility/retention approved first. |
| Status | Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Admin records supported feedback; Creator sees it on exact requested-changes candidate and can save/resubmit correction; no fabricated comments on older reviews. Tests/closure: Exact linkage/privacy/stale action and correction loop; legacy reviews without text; UI errors retain input. CLOSE-1 applies. PR boundary: Feedback FE only; split by Admin/Creator if independently reviewable. |
| Blocker / Decision | Feedback visibility/retention approved first. Blocking effect: Closes narrative feedback gap, subject to approved scope. |

<a id="task-d10-gate"></a>

#### D10-GATE — Recorded satisfaction of architecture §20.2 integration prerequisites

| Field | Record |
| --- | --- |
| Task ID | D10-GATE |
| Parent / Phase | D / Organizer; original parent [D10](#task-d10) |
| Deliverable | Recorded satisfaction of architecture §20.2 integration prerequisites |
| Dependencies | Backend: C7 #89 merged; applicable G4 governance BE complete or explicit approved scope clarification. Frontend: F7 integrated category/reuse/location; representative independent G4 review; reviewed Local catalog; compatibility rollout decision Governance: PO-GATE/PO-LEGACY below; no hidden/non-public exception inferred. |
| Status | Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Record each applicable prerequisite with source/test evidence and reviewed catalog; resolve full safety/validity requirements that gate integration. A deploy restriction alone is not a development ban; this architecture is an explicit integration gate. Tests/closure: Checklist review against §20.2 and FE #121; no waiver from elapsed time, merged C7 or feature flag. CLOSE-1 applies. PR boundary: Documentation readiness checkpoint, no new flow. |
| Blocker / Decision | PO-GATE/PO-LEGACY below; no hidden/non-public exception inferred. Blocking effect: Blocks every D10 FE implementation slice and public activation. |

<a id="task-d10-fe-01"></a>

#### D10-FE-01 — Create Hunt → Country

| Field | Record |
| --- | --- |
| Task ID | D10-FE-01 |
| Parent / Phase | D / Organizer; original parent [D10](#task-d10) |
| Deliverable | Create Hunt → Country |
| Dependencies | Backend: GET /api/geography/countries; existing HuntsApi draft creation; C7. Frontend: D10-GATE; existing OrganizerSetupFlow/CustomHuntEditor Governance: Resolved integration gate |
| Status | Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Reuse existing draft-first builder; render backend countries, currently RO reference, no inferred worldwide catalog/residence restriction; changing country clears dependent selection. Tests/closure: Country loading/empty/retry/401/403, selected reset, draft creation failure/lost response, existing general setup regression. CLOSE-1 applies. PR boundary: Country step and client types only. |
| Blocker / Decision | Resolved integration gate Blocking effect: Unblocks D10-FE-02; no activation by this slice. |

<a id="task-d10-fe-02"></a>

#### D10-FE-02 — Country-scoped stored/manual Locality search

| Field | Record |
| --- | --- |
| Task ID | D10-FE-02 |
| Parent / Phase | D / Organizer; original parent [D10](#task-d10) |
| Deliverable | Country-scoped stored/manual Locality search |
| Dependencies | Backend: GET geography/localities?countryCode&q and /{id}; C6b-1/3. Frontend: D10-FE-01 Governance: No provider storage; Organizer cannot submit Creator-only manual proposals. |
| Status | Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Search stored approved manual entries with nonempty q ≤100; max 50; UUID/context selection, delayed-request protection and empty/unavailable states. No pending proposal or raw text treated as locality; clear cards/preview when changed. Tests/closure: Same-name UUIDs, wrong country/inactive 404/409, no result, out-of-order responses, auth; no proposal/provider mutation. CLOSE-1 applies. PR boundary: Locality search/select only. |
| Blocker / Decision | No provider storage; Organizer cannot submit Creator-only manual proposals. Blocking effect: Unblocks D10-FE-03. |

<a id="task-d10-fe-03"></a>

#### D10-FE-03 — Eligible Local cards and pagination

| Field | Record |
| --- | --- |
| Task ID | D10-FE-03 |
| Parent / Phase | D / Organizer; original parent [D10](#task-d10) |
| Deliverable | Eligible Local cards and pagination |
| Dependencies | Backend: GET /api/organizer/local-templates; C7 list. Frontend: D10-FE-02 Governance: No FE eligibility rules. |
| Status | Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Use countryCode/localityId and limit 1–50/default20; render name/theme/saved location; opaque filter-scoped nextCursor reset on filter change; versions internal only; empty/error explicit. Tests/closure: Exact filters/cursor, pagination/duplicate loading, 400/404/409, cancellation and no private metadata/technical version controls. CLOSE-1 applies. PR boundary: Discovery API and cards only. |
| Blocker / Decision | No FE eligibility rules. Blocking effect: Unblocks D10-FE-04. |

<a id="task-d10-fe-04"></a>

#### D10-FE-04 — Automatic read-only exact geographic preview

| Field | Record |
| --- | --- |
| Task ID | D10-FE-04 |
| Parent / Phase | D / Organizer; original parent [D10](#task-d10) |
| Deliverable | Automatic read-only exact geographic preview |
| Dependencies | Backend: GET organizer/local-templates/{templateId}/versions/{version} with same filters; C7. Frontend: D10-FE-03; existing OrganizerHuntGeography/TedixMap Governance: Mapbox runtime access distinct from permanent-storage entitlement. |
| Status | Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Automatic preview of exact selected card via normalCheckpointCount, checkpointPositions and finishPoint allowlist. Saved localitySnapshot separate from currentLocality; no answers/private evidence or editing. Truthful read-only location summary on map failure. Tests/closure: Allowlist/answer exclusion, stale indistinguishable 404, provider failure, old response race, keyboard/mobile and existing geographic preview regression. CLOSE-1 applies. PR boundary: Preview only; no source snapshot authored by client. |
| Blocker / Decision | Mapbox runtime access distinct from permanent-storage entitlement. Blocking effect: Unblocks D10-FE-05. |

<a id="task-d10-fe-05"></a>

#### D10-FE-05 — Explicit selection into existing draft Hunt

| Field | Record |
| --- | --- |
| Task ID | D10-FE-05 |
| Parent / Phase | D / Organizer; original parent [D10](#task-d10) |
| Deliverable | Explicit selection into existing draft Hunt |
| Dependencies | Backend: PUT /api/hunts/{id}/local-template {templateId,version,countryCode,localityId}; C7. Frontend: D10-FE-04; existing authorized draft Governance: No technical version chooser. |
| Status | Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Select inspected exact reference; backend captures full source tuple. Existing draft required; do not PATCH templateKey or submit client content/locality snapshots. Configure Hunt using returned server state. Tests/closure: Exact four-field payload, draft-only and Hunt-specific organizer denial, forged data rejection, failed selection leaves source/settings unchanged, no optimistic success. CLOSE-1 applies. PR boundary: Selection mutation and handoff to existing configuration only. |
| Blocker / Decision | No technical version chooser. Blocking effect: Unblocks D10-FE-06/07. |

<a id="task-d10-fe-06"></a>

#### D10-FE-06 — Stale selection and explicit reselection

| Field | Record |
| --- | --- |
| Task ID | D10-FE-06 |
| Parent / Phase | D / Organizer; original parent [D10](#task-d10) |
| Deliverable | Stale selection and explicit reselection |
| Dependencies | Backend: C7 409 template_selection_stale/template_not_eligible/locality_geography_changed/locality_unavailable; 404 preview. Frontend: D10-FE-05 Governance: None beyond gate; no automatic retry/replacement guarantee. |
| Status | Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Invalidate attempted choice/preview, refresh inventory and require explicit reconfirmation. Preserve previously persisted Hunt source until successful new PUT; ambiguous 404 reveals no suspension/private reason. Tests/closure: Approval advance, suspension, inactive/material drift, concurrent choice, lost response refetch; never auto-select latest or retry as a new choice. CLOSE-1 applies. PR boundary: Stale/error recovery only. |
| Blocker / Decision | None beyond gate; no automatic retry/replacement guarantee. Blocking effect: Required before D10-FE-08 and chain acceptance. |

<a id="task-d10-fe-07"></a>

#### D10-FE-07 — Hunt settings and legacy/Signal compatibility

| Field | Record |
| --- | --- |
| Task ID | D10-FE-07 |
| Parent / Phase | D / Organizer; original parent [D10](#task-d10) |
| Deliverable | Hunt settings and legacy/Signal compatibility |
| Dependencies | Backend: Existing Hunt GET/PATCH plus C7 protected source tuple and publish readiness. Frontend: D10-FE-05/06 Governance: PO-LEGACY approved transition; no automatic classification. |
| Status | Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Selection/reopen preserves organization, roles, name, schedule, rewards and supported options. Existing C7 source cannot be replaced/cleared by legacy templateKey PATCH. Legacy category-null/Signal creation works under approved compatibility policy. Tests/closure: Save/reopen, dates, settings before/after selection, competing PATCH/publish failure; old Hunt snapshots stable after source edits/approval/suspension. CLOSE-1 applies. PR boundary: Existing builder integration/compatibility only. |
| Blocker / Decision | PO-LEGACY approved transition; no automatic classification. Blocking effect: Unblocks D10-FE-08; required public compatibility evidence. |

<a id="task-d10-fe-08"></a>

#### D10-FE-08 — Frontend integration and authorization acceptance

| Field | Record |
| --- | --- |
| Task ID | D10-FE-08 |
| Parent / Phase | D / Organizer; original parent [D10](#task-d10) |
| Deliverable | Frontend integration and authorization acceptance |
| Dependencies | Backend: Merged C7 plus integrated disposable backend. Frontend: D10-FE-01 through 07 Governance: D10-GATE satisfied |
| Status | Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Complete Create Hunt → Country → Locality → Eligible Local Templates → Preview → Select → Configure; auth/loading/error/empty/stale behavior across steps; no duplicate eligibility or authoritative client snapshots. Tests/closure: Real FE→BE tests plus contract/UI tests: 401/403, wrong-Hunt, revoked role, invalid_hunt_state, all C7 conflicts, cursor/filter races, answer-free preview and responsive/keyboard flow; relevant legacy/Signal suite, typecheck/build. CLOSE-1 applies. PR boundary: D10 test/evidence PR after behavior slices; no gameplay runtime. |
| Blocker / Decision | D10-GATE satisfied Blocking effect: Unblocks D10-E2E-01; FE implementation completion only. |

<a id="task-d10-e2e-01"></a>

#### D10-E2E-01 — Creator → Admin → Organizer integrated acceptance

| Field | Record |
| --- | --- |
| Task ID | D10-E2E-01 |
| Parent / Phase | D / Supply chain; original parent [D10](#task-d10) |
| Deliverable | Creator → Admin → Organizer integrated acceptance |
| Dependencies | Backend: C1–C7 available in recorded test environment. Frontend: F7-FE-13; G4 supported flows and applicable full-governance slices; D10-FE-08 Governance: Recorded catalog/legacy/readiness decisions |
| Status | Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Two Creators + independent Admin + authorized Organizer: approve Universal, cross-Creator copy Local and scratch Local, bind/review/approve separately, discover/preview/select/save/reopen Hunt; revisions, changes requested, suspension and existing snapshot stability. Tests/closure: Record identities/capabilities, exact source/candidate references, API outcomes and failing cases; denied combined-role self-review/other-Hunt selection; old Universal/copies/Hunts stable. Never call this deployed E2E from fixtures alone. CLOSE-1 applies. PR boundary: Integrated acceptance evidence; defects go to bounded follow-up PRs. |
| Blocker / Decision | Recorded catalog/legacy/readiness decisions Blocking effect: Blocks whole-chain completion and deployed acceptance. |

<a id="task-d10-e2e-02"></a>

#### D10-E2E-02 — Deployed supply-chain and pilot readiness verification

| Field | Record |
| --- | --- |
| Task ID | D10-E2E-02 |
| Parent / Phase | D / Rollout; original parent [D10](#task-d10) |
| Deliverable | Deployed supply-chain and pilot readiness verification |
| Dependencies | Backend: Reviewed deployment with actual migrated DB/API revisions; provider/device capability where applicable. Frontend: D10-E2E-01; recorded FE revision Governance: Applicable G0–G6, §20.3, human route review and explicit staged activation approval |
| Status | Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified. |
| PR / Evidence | No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review. |
| Acceptance | Record environment/date/FE+BE SHAs/migration status, real accounts, both Local origins, real provider/mobile save/reopen/review/select cases, failure cases and legacy compatibility. Public/pilot readiness remains separate from source completion. Tests/closure: Actual deployed outcomes/evidence, real-device geography and human operating conditions; rollback/backup/readiness checks; no simulated safety acceptance. CLOSE-1 applies. PR boundary: Verification record after separately authorized deployment; this task does not authorize deploying. |
| Blocker / Decision | Applicable G0–G6, §20.3, human route review and explicit staged activation approval Blocking effect: Blocks Complete — deployed/E2E verified and public activation. |

### C3. H–N bounded execution / verification / decision entries

Original IDs and table order are retained, including I11 before I10 because the documented staged dependency requires terminal proof before full expansion. Each container authorizes only its written next contract/verification/decision action once prerequisites clear; feature implementation children need approved existing IDs. `.1` does not authorize a generated ID. Parent status is independent from these records.

<a id="task-h1-verify-1"></a>

#### H1-VERIFY-1

| Field | Record |
| --- | --- |
| Task ID | H1-VERIFY-1 |
| Parent / Phase | [H1](#task-h1); H1 source-complete public code lookup only |
| Deliverable | Only original next bounded action: Reverify existing code lookup at rollout; no enrollment mutation. |
| Dependencies | Reverify existing code lookup at rollout; no enrollment mutation. Content-chain, authority and stage gates in §E remain. |
| Status | Not started. Source foundation: retain original parent qualification H1 source-complete public code lookup only. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified. |
| PR / Evidence | §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only. |
| Acceptance | Contract tests for public minimum identity/code/name/status, invalid code, no private geography or membership; record deployed result separately. CLOSE-1 and original container closure rules in §E. |
| Blocker / Decision | Public lookup deployment claim, not missing H2 code. No broad implementation or undefined child ID authorized. |

<a id="task-h2-exec-1"></a>

#### H2-EXEC-1

| Field | Record |
| --- | --- |
| Task ID | H2-EXEC-1 |
| Parent / Phase | [H2](#task-h2), [H3](#task-h3); H2–H3 Not started |
| Deliverable | Only original next bounded action: After content-chain gate and B6 authority contract: design persisted enrollment + authoritative eligibility/capacity/lifecycle transaction. |
| Dependencies | After content-chain gate and B6 authority contract: design persisted enrollment + authoritative eligibility/capacity/lifecycle transaction. Content-chain, authority and stage gates in §E remain. |
| Status | Not started. Source foundation: retain original parent qualification H2–H3 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified. |
| PR / Evidence | §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only. |
| Acceptance | Exact actor/Hunt membership, duplicate/retry/race/closed-capacity denial, no client eligibility; legacy code lookup preserved; contract then separately scoped persistence/API/UI children. CLOSE-1 and original container closure rules in §E. |
| Blocker / Decision | H4–H8 admission and live Solo proof. No broad implementation or undefined child ID authorized. |

<a id="task-h4-exec-1"></a>

#### H4-EXEC-1

| Field | Record |
| --- | --- |
| Task ID | H4-EXEC-1 |
| Parent / Phase | [H4](#task-h4); H4 Not started |
| Deliverable | Only original next bounded action: H2/H3; P2 team size/membership/change policy; define formation/assignment contract. |
| Dependencies | H2/H3; P2 team size/membership/change policy; define formation/assignment contract. Content-chain, authority and stage gates in §E remain. |
| Status | Not started. Source foundation: retain original parent qualification H4 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified. |
| PR / Evidence | §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only. |
| Acceptance | Real independent accounts, uneven/no-fragment-compatible formation, join/leave/replacement races, capacity and scoped authority; no fixed-four rule. Contract evidence before implementation. CLOSE-1 and original container closure rules in §E. |
| Blocker / Decision | Team lobby/start; not automatic approval for unresolved P2. No broad implementation or undefined child ID authorized. |

<a id="task-h5-exec-1"></a>

#### H5-EXEC-1

| Field | Record |
| --- | --- |
| Task ID | H5-EXEC-1 |
| Parent / Phase | [H5](#task-h5), [H6](#task-h6), [H7](#task-h7); H5–H7 Not started |
| Deliverable | Only original next bounded action: Enrollment, formation, supported Solo/Team compatibility and B6/D9 authority; contract lobby/readiness/start boundaries. |
| Dependencies | Enrollment, formation, supported Solo/Team compatibility and B6/D9 authority; contract lobby/readiness/start boundaries. Content-chain, authority and stage gates in §E remain. |
| Status | Not started. Source foundation: retain original parent qualification H5–H7 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified. |
| PR / Evidence | §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only. |
| Acceptance | Real persisted membership/readiness, atomic start and admission/role/lifecycle races; Solo A/Team B without simulated members; preserve mode contract and authorized views. CLOSE-1 and original container closure rules in §E. |
| Blocker / Decision | Real Hunt start. No broad implementation or undefined child ID authorized. |

<a id="task-h8-exec-1"></a>

#### H8-EXEC-1

| Field | Record |
| --- | --- |
| Task ID | H8-EXEC-1 |
| Parent / Phase | [H8](#task-h8); H8 Not started |
| Deliverable | Only original next bounded action: Above persisted states; define restore/reconnect including membership revisions. |
| Dependencies | Above persisted states; define restore/reconnect including membership revisions. Content-chain, authority and stage gates in §E remain. |
| Status | Not started. Source foundation: retain original parent qualification H8 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified. |
| PR / Evidence | §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only. |
| Acceptance | Refresh/reconnect/backend restart, revoked/stale member denial, accepted contributions preserved and no private data leak; client disconnect does not silently change membership. CLOSE-1 and original container closure rules in §E. |
| Blocker / Decision | Reliable runtime/live acceptance. No broad implementation or undefined child ID authorized. |

<a id="task-i1-exec-1"></a>

#### I1-EXEC-1

| Field | Record |
| --- | --- |
| Task ID | I1-EXEC-1 |
| Parent / Phase | [I1](#task-i1), [I2](#task-i2), [I3](#task-i3), [I4](#task-i4); I1–I4 Not started |
| Deliverable | Only original next bounded action: H membership/start plus content snapshots; first authoritative one-normal-checkpoint engine contract. |
| Dependencies | H membership/start plus content snapshots; first authoritative one-normal-checkpoint engine contract. Content-chain, authority and stage gates in §E remain. |
| Status | Not started. Source foundation: retain original parent qualification I1–I4 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified. |
| PR / Evidence | §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only. |
| Acceptance | Persist checkpoint/progress, server-only answers/validation, actor/Hunt/activity scope and exact snapshot; no client result authority. Contract/storage/API/UI children; normal and terminal share engine. CLOSE-1 and original container closure rules in §E. |
| Blocker / Decision | I5–I9 and Solo A. No broad implementation or undefined child ID authorized. |

<a id="task-i5-exec-1"></a>

#### I5-EXEC-1

| Field | Record |
| --- | --- |
| Task ID | I5-EXEC-1 |
| Parent / Phase | [I5](#task-i5), [I6](#task-i6); I5–I6 Not started |
| Deliverable | Only original next bounded action: I1-EXEC-1 contract; approved §3.3 semantics, P2 unresolved allocation/membership details settled as needed. |
| Dependencies | I1-EXEC-1 contract; approved §3.3 semantics, P2 unresolved allocation/membership details settled as needed. Content-chain, authority and stage gates in §E remain. |
| Status | Not started. Source foundation: retain original parent qualification I5–I6 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified. |
| PR / Evidence | §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only. |
| Acceptance | Hint authority and Personal/Team activity distinct from fragments; fixed fragments, 2+2/2+1+1/1+1+1+1/six with two none, all-required pre-recovery; legitimate recovery after five minutes, no vote or invented completion. Privacy and stale allocation cases required. CLOSE-1 and original container closure rules in §E. |
| Blocker / Decision | Team B/C gameplay acceptance. No broad implementation or undefined child ID authorized. |

<a id="task-i7-exec-1"></a>

#### I7-EXEC-1

| Field | Record |
| --- | --- |
| Task ID | I7-EXEC-1 |
| Parent / Phase | [I7](#task-i7), [I8](#task-i8), [I9](#task-i9); I7–I9 Not started |
| Deliverable | Only original next bounded action: I1/I6 authoritative outcomes; define score/idempotency/restore transaction and API. |
| Dependencies | I1/I6 authoritative outcomes; define score/idempotency/restore transaction and API. Content-chain, authority and stage gates in §E remain. |
| Status | Not started. Source foundation: retain original parent qualification I7–I9 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified. |
| PR / Evidence | §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only. |
| Acceptance | +100 exactly once for successful Team Challenge including recovery, zero otherwise; no individual partial Team points; retries/conflicting replay/concurrent final answers/backend restart and private restore. Record real DB proof, old snapshots unchanged. CLOSE-1 and original container closure rules in §E. |
| Blocker / Decision | Results authority and reliable Team proof. No broad implementation or undefined child ID authorized. |

<a id="task-i11-exec-1"></a>

#### I11-EXEC-1

| Field | Record |
| --- | --- |
| Task ID | I11-EXEC-1 |
| Parent / Phase | [I11](#task-i11); I11 Not started |
| Deliverable | Only original next bounded action: Shared normal engine; terminal completion/global closure/suspension decisions where required. |
| Dependencies | Shared normal engine; terminal completion/global closure/suspension decisions where required. Content-chain, authority and stage gates in §E remain. |
| Status | Not started. Source foundation: retain original parent qualification I11 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified. |
| PR / Evidence | §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only. |
| Acceptance | One normal + FinishPoint resolves all required terminal activities before completion; arrival alone fails; one team finish does not end all teams. Solo A then Team B; persisted results consume true terminal state. CLOSE-1 and original container closure rules in §E. |
| Blocker / Decision | Pilot finish/results; precedes I10 expansion. No broad implementation or undefined child ID authorized. |

<a id="task-i12-exec-1"></a>

#### I12-EXEC-1

| Field | Record |
| --- | --- |
| Task ID | I12-EXEC-1 |
| Parent / Phase | [I12](#task-i12); I12 Not started |
| Deliverable | Only original next bounded action: Authoritative checkpoint contract and approved GPS/fallback rules; existing map foundation only. |
| Dependencies | Authoritative checkpoint contract and approved GPS/fallback rules; existing map foundation only. Content-chain, authority and stage gates in §E remain. |
| Status | Not started. Source foundation: retain original parent qualification I12 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified. |
| PR / Evidence | §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only. |
| Acceptance | Persistent map/navigation/arrival through same engine, GPS accuracy/failure/reconnect/device evidence and privacy; local author preview never runtime acceptance. CLOSE-1 and original container closure rules in §E. |
| Blocker / Decision | Live geographic proof; later map operations. No broad implementation or undefined child ID authorized. |

<a id="task-i13-exec-1"></a>

#### I13-EXEC-1

| Field | Record |
| --- | --- |
| Task ID | I13-EXEC-1 |
| Parent / Phase | [I13](#task-i13); I13 Not started |
| Deliverable | Only original next bounded action: Backend suspension/bypass and terminal/global-closure policy resolved before FE/operator controls. |
| Dependencies | Backend suspension/bypass and terminal/global-closure policy resolved before FE/operator controls. Content-chain, authority and stage gates in §E remain. |
| Status | Not started. Source foundation: retain original parent qualification I13 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified. |
| PR / Evidence | §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only. |
| Acceptance | Preserve completed activities/earned points; no automatic penalty or fabricated successful bypass. Authorization, race/restore and terminal fairness tests; contract first. CLOSE-1 and original container closure rules in §E. |
| Blocker / Decision | J9 controls and suspension-dependent live stages. No broad implementation or undefined child ID authorized. |

<a id="task-i10-exec-1"></a>

#### I10-EXEC-1

| Field | Record |
| --- | --- |
| Task ID | I10-EXEC-1 |
| Parent / Phase | [I10](#task-i10); I10 Not started |
| Deliverable | Only original next bounded action: Stages A–C normal+terminal, J/K operations/results and compatibility proven. |
| Dependencies | Stages A–C normal+terminal, J/K operations/results and compatibility proven. Content-chain, authority and stage gates in §E remain. |
| Status | Not started. Source foundation: retain original parent qualification I10 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified. |
| PR / Evidence | §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only. |
| Acceptance | Expand existing Signal to all six normal checkpoints plus FinishPoint using same engine; no new mechanic; checkpoint-by-checkpoint restore/concurrency and legacy narrative regression. CLOSE-1 and original container closure rules in §E. |
| Blocker / Decision | Full Signal seven-stop completion claim. No broad implementation or undefined child ID authorized. |

<a id="task-i14-dec-1"></a>

#### I14-DEC-1

| Field | Record |
| --- | --- |
| Task ID | I14-DEC-1 |
| Parent / Phase | [I14](#task-i14); I14 Decision/deferred |
| Deliverable | Only original next bounded action: Core engine/geographic operations proven; separate scope approval for Mapbox M6. |
| Dependencies | Core engine/geographic operations proven; separate scope approval for Mapbox M6. Content-chain, authority and stage gates in §E remain. |
| Status | Deferred. Source foundation: retain original parent qualification I14 Decision/deferred. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified. |
| PR / Evidence | §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only. |
| Acceptance | Decision records exact approved extension and tests; no implementation/runtime promotion now. CLOSE-1 and original container closure rules in §E. |
| Blocker / Decision | Only later gamification. No broad implementation or undefined child ID authorized. |

<a id="task-j1-exec-1"></a>

#### J1-EXEC-1

| Field | Record |
| --- | --- |
| Task ID | J1-EXEC-1 |
| Parent / Phase | [J1](#task-j1), [J2](#task-j2), [J3](#task-j3), [J4](#task-j4); J1–J4 Not started |
| Deliverable | Only original next bounded action: B6 Hunt authority/D9 assignment, H/I events; define minimum live state/monitor/control contract. |
| Dependencies | B6 Hunt authority/D9 assignment, H/I events; define minimum live state/monitor/control contract. Content-chain, authority and stage gates in §E remain. |
| Status | Not started. Source foundation: retain original parent qualification J1–J4 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified. |
| PR / Evidence | §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only. |
| Acceptance | Authorized actual Organizer/Supervisor views, no arbitrary-Hunt global capability, real lifecycle status and concurrent controls; prototype labels remain until connected. CLOSE-1 and original container closure rules in §E. |
| Blocker / Decision | Minimum live operation per stage. No broad implementation or undefined child ID authorized. |

<a id="task-j5-exec-1"></a>

#### J5-EXEC-1

| Field | Record |
| --- | --- |
| Task ID | J5-EXEC-1 |
| Parent / Phase | [J5](#task-j5), [J6](#task-j6), [J7](#task-j7), [J8](#task-j8); J5–J8 Not started |
| Deliverable | Only original next bounded action: Approved incident/operations contract and responsible recipients before live pilot. |
| Dependencies | Approved incident/operations contract and responsible recipients before live pilot. Content-chain, authority and stage gates in §E remain. |
| Status | Not started. Source foundation: retain original parent qualification J5–J8 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified. |
| PR / Evidence | §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only. |
| Acceptance | Real persisted HELP/PANIC send→receipt→acknowledge→resolve; pending/failure/retry/network fallback, permission/audit evidence; no false acknowledgement or automatic recovery resolution; FE #117 truthfulness retained. Split transport, lifecycle, UI/fallback PRs after contract. CLOSE-1 and original container closure rules in §E. |
| Blocker / Decision | Every live Solo/Team stage; L3. No broad implementation or undefined child ID authorized. |

<a id="task-j9-dec-1"></a>

#### J9-DEC-1

| Field | Record |
| --- | --- |
| Task ID | J9-DEC-1 |
| Parent / Phase | [J9](#task-j9); J9 Decision/deferred |
| Deliverable | Only original next bounded action: I12/I13 and B6/D9/J incident lifecycle; explicit later scope approval. |
| Dependencies | I12/I13 and B6/D9/J incident lifecycle; explicit later scope approval. Content-chain, authority and stage gates in §E remain. |
| Status | Deferred. Source foundation: retain original parent qualification J9 Decision/deferred. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified. |
| PR / Evidence | §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only. |
| Acceptance | Shared operations map visibility and checkpoint consequences follow approved backend authority; Supervisors request/report unless separately authorized. No prototype operational claims. CLOSE-1 and original container closure rules in §E. |
| Blocker / Decision | Later Mapbox M5 only. No broad implementation or undefined child ID authorized. |

<a id="task-k1-exec-1"></a>

#### K1-EXEC-1

| Field | Record |
| --- | --- |
| Task ID | K1-EXEC-1 |
| Parent / Phase | [K1](#task-k1), [K2](#task-k2), [K3](#task-k3); K1–K3 Not started |
| Deliverable | Only original next bounded action: Authoritative I7–I9/I11 outcomes; ranking/tie/cross-mode policy before dependent behavior. |
| Dependencies | Authoritative I7–I9/I11 outcomes; ranking/tie/cross-mode policy before dependent behavior. Content-chain, authority and stage gates in §E remain. |
| Status | Not started. Source foundation: retain original parent qualification K1–K3 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified. |
| PR / Evidence | §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only. |
| Acceptance | Idempotent final aggregation/results; +100 once and preserved earned points, no arrival-only finish; multi-team concurrency, restore, privacy and no fabricated ranks. Stage A results before expansion; contract then aggregation/read API/UI slices. CLOSE-1 and original container closure rules in §E. |
| Blocker / Decision | Truthful pilot results and leaderboard acceptance. No broad implementation or undefined child ID authorized. |

<a id="task-k4-dec-1"></a>

#### K4-DEC-1

| Field | Record |
| --- | --- |
| Task ID | K4-DEC-1 |
| Parent / Phase | [K4](#task-k4), [K5](#task-k5), [K6](#task-k6); K4–K6 Decision/deferred |
| Deliverable | Only original next bounded action: Real K1–K3; separate award/assignment/physical eligibility decisions. |
| Dependencies | Real K1–K3; separate award/assignment/physical eligibility decisions. Content-chain, authority and stage gates in §E remain. |
| Status | Deferred. Source foundation: retain original parent qualification K4–K6 Decision/deferred. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified. |
| PR / Evidence | §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only. |
| Acceptance | Record rules, tie/eligibility/fulfillment boundary and allowed roles; configuration is not award/inventory; preserve existing reward settings. CLOSE-1 and original container closure rules in §E. |
| Blocker / Decision | Later reward work only. No broad implementation or undefined child ID authorized. |

<a id="task-l1-verify-1"></a>

#### L1-VERIFY-1

| Field | Record |
| --- | --- |
| Task ID | L1-VERIFY-1 |
| Parent / Phase | [L1](#task-l1); L1 Partially implemented |
| Deliverable | Only original next bounded action: Verify Users & Roles/audit/dependency coverage at pinned BE; proposal-only deletion concern remains open. |
| Dependencies | Verify Users & Roles/audit/dependency coverage at pinned BE; proposal-only deletion concern remains open. Content-chain, authority and stage gates in §E remain. |
| Status | Not started. Source foundation: retain original parent qualification L1 Partially implemented. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified. |
| PR / Evidence | §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only. |
| Acceptance | Reproduce proposal-only Creator/reviewer retirement-vs-FK behavior in disposable DB before repair; role invariants/retained reviews/suspension attribution, no destructive history deletion; separate bounded fix if needed. CLOSE-1 and original container closure rules in §E. |
| Blocker / Decision | Full account-history/audit claim; not F7-FE-01. No broad implementation or undefined child ID authorized. |

<a id="task-l2-exec-1"></a>

#### L2-EXEC-1

| Field | Record |
| --- | --- |
| Task ID | L2-EXEC-1 |
| Parent / Phase | [L2](#task-l2), [L3](#task-l3), [L6](#task-l6); L2/L3/L6 Not started |
| Deliverable | Only original next bounded action: B6/J real events/incident authority; define oversight, Safety Alerts and audit contracts. |
| Dependencies | B6/J real events/incident authority; define oversight, Safety Alerts and audit contracts. Content-chain, authority and stage gates in §E remain. |
| Status | Not started. Source foundation: retain original parent qualification L2/L3/L6 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified. |
| PR / Evidence | §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only. |
| Acceptance | Persisted authorized oversight, delivery/ack/resolve linked to actual incidents, immutable actor/time/evidence with privacy; demo cards do not qualify. Split oversight/alerts/audit after contract. CLOSE-1 and original container closure rules in §E. |
| Blocker / Decision | Full operational governance, not basic read-only Creator development. No broad implementation or undefined child ID authorized. |

<a id="task-l4-dec-1"></a>

#### L4-DEC-1

| Field | Record |
| --- | --- |
| Task ID | L4-DEC-1 |
| Parent / Phase | [L4](#task-l4), [L5](#task-l5); L4/L5 Not started, approval/scope required |
| Deliverable | Only original next bounded action: Inventory depends on approved reward fulfillment; settings need narrow platform policy/API. |
| Dependencies | Inventory depends on approved reward fulfillment; settings need narrow platform policy/API. Content-chain, authority and stage gates in §E remain. |
| Status | Not started; approval/scope required (parents L4/L5 remain Not started). Source foundation: retain original parent qualification L4/L5 Not started, approval/scope required. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified. |
| PR / Evidence | §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only. |
| Acceptance | Decide inventory/settings rules separately, authorization and audit requirements; no new product scope or prototype-as-implementation; implementation only after scoped contracts. CLOSE-1 and original container closure rules in §E. |
| Blocker / Decision | Dependent inventory/settings capabilities only. No broad implementation or undefined child ID authorized. |

<a id="task-m1-dec-1"></a>

#### M1-DEC-1

| Field | Record |
| --- | --- |
| Task ID | M1-DEC-1 |
| Parent / Phase | [M1](#task-m1), [M2](#task-m2), [M3](#task-m3), [M4](#task-m4), [M5](#task-m5); M1–M5 Decision/deferred |
| Deliverable | Only original next bounded action: Persisted I/K completion/results and separately approved long-term rules. |
| Dependencies | Persisted I/K completion/results and separately approved long-term rules. Content-chain, authority and stage gates in §E remain. |
| Status | Deferred. Source foundation: retain original parent qualification M1–M5 Decision/deferred. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified. |
| PR / Evidence | §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only. |
| Acceptance | Map Passport/history/achievements/collectibles/profile to real source events, privacy/retention and no double credit; no balance or achievement inferred from chosen reward category. Decision-only now. CLOSE-1 and original container closure rules in §E. |
| Blocker / Decision | Later long-term Participant work only. No broad implementation or undefined child ID authorized. |

<a id="task-n1-dec-1"></a>

#### N1-DEC-1

| Field | Record |
| --- | --- |
| Task ID | N1-DEC-1 |
| Parent / Phase | [N1](#task-n1), [N2](#task-n2), [N3](#task-n3), [N4](#task-n4), [N5](#task-n5), [N6](#task-n6); N1–N6 Decision/deferred |
| Deliverable | Only original next bounded action: Approved request/orchestration contract and F/G/D content supply chain. |
| Dependencies | Approved request/orchestration contract and F/G/D content supply chain. Content-chain, authority and stage gates in §E remain. |
| Status | Deferred. Source foundation: retain original parent qualification N1–N6 Decision/deferred. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified. |
| PR / Evidence | §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only. |
| Acceptance | Persist request→triage→assignment→Creator→independent exact Admin review→Organizer delivery; scoped roles, no self-approval, no invented pricing/deadlines/statuses/API. Decision/contract first; later each phase a bounded slice. CLOSE-1 and original container closure rules in §E. |
| Blocker / Decision | Custom-request work only, not ordinary Local creation. No broad implementation or undefined child ID authorized. |

### C4. Existing provider task and backend foundation aliases

<a id="task-c6b-2"></a>

#### C6b-2 — Mapbox permanent-storage integration

| Field | Record |
| --- | --- |
| Task ID | C6b-2 |
| Parent / Phase | F7/G4 provider branch; existing Master §6 row, not a new task |
| Deliverable | Mapbox permanent-result persistence under verified account entitlement; do not alter provider architecture. |
| Dependencies | PO-PROVIDER account-specific permanent storage, sharing, backups, post-termination retention, attribution and target settlement coverage evidence. |
| Status | Blocked. Contract/entitlement: unverified; provider implementation: Not started; integration/deployment: unverified. |
| PR / Evidence | Original Master §6 remaining-scope row and §9 blocker; no provider persistence or entitlement evidence recorded. |
| Acceptance | Verify the exact account rights and approved contract before provider work; no temporary Search Box persistence or laundering through manual proposals. |
| Blocker / Decision | Unresolved licensing/retention. Stored/manual Creator/Admin development remains available. |


F7 backend identifiers C0, C1–C5, C6a, C6b-1/3/4/5 and C7 (contract and implementation) remain in the exact PR history in §F. These are existing completed/decision foundation slices, not renamed Phase C Hunt-domain tasks or new pending work. The Master remaining-scope aliases C6b-4, C6b-5 and C7 refer to that same history; do not double-count contract and code as new product tasks. Original numbered sequence containers 04–09 remain in §F and preserve their scope/order. D01–D07 remain historical remediation IDs tied to their original A–N requirements, not duplicate executable tasks.

## D. Task status definitions

| State | Evidence required |
| --- | --- |
| Not started | No verified execution of the outstanding bounded deliverable or verification action. Existing partial foundations stay explicitly recorded. |
| Blocked | An explicit named prerequisite, decision or contract prevents the specified work. |
| In progress | Recorded active execution against this exact Task ID; identify branch/owner and open work. |
| In review | Actual open PR awaiting review; implementation and acceptance remain bounded. |
| Merged — source verified | GitHub merge and exact source/test evidence for this slice. Contract-only remains contract-only. |
| Integrated — verified | Recorded real FE→BE/workflow acceptance with exact actors/artifacts/revisions/outcomes. |
| Deployed — verified | Actual environment/date/revisions/migrations/provider/device cases and results; authorization remains separate. |
| Deferred | A retained approved later-scope or pending decision boundary; no automatic code authorization. |


Keep contract/decision, backend, frontend, integrated workflow and deployed E2E as independent dimensions in each affected record. `Unverified`, `not applicable` and legacy `partially implemented` are evidence qualifiers, not additional completion states. Do not call existing verified work “not started” merely because another dimension is unverified. Imported partial parent aggregates remain partial. No task is upgraded to integrated/deployed by this consolidation.

## E. Dependencies, decision gates and preserved execution constraints

### E1. G0–G6 gates

Historical gate wording preserved; current execution constraints:

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

### E2. Product decisions and exceptions

Original decisions retained:

- Independent Organizer (§11): unresolved identity/access and Personal Hunt authoring; keep isolated prototype, no bypass or invented launch path.

- Universal vs Local (§F1/F7/G4): categories of Template, not two gameplay engines. Universal approved source may be copied into Creator-owned version with provenance; Local has geography, independent review and exact-version approval. Organizer sees approved Local for selected Country/Locality.

- Approved Local continuity (Product Owner policy, reaffirmed 28 October 2026): an existing approved Local Template version remains eligible while its replacement is under review, unless Admin explicitly suspends it. Revision must preserve the prior exact approval independently of candidate state; no implicit withdrawal on draft/submission/request-changes. This is implemented at merged BE foundation/selection level by #87/#89; dependent FE and integrated/deployed acceptance remain missing. C6a §7/U2 temporary-removal recommendation conflicts with this approved policy and is not adopted. Local support is independently verified in C6b-5/C7 source; Universal C5 alone was never proof of it.

- Organizer map-first (§D10): Country → Locality → approved Template → read-only preview; do not treat a map as safety certification.

- Solo/Team (§3.3): Organizer selects supported mode; real team members, allocation independent of team size; all original required activities before five-minute recovery, legitimate fragment recovery after threshold, backend-validated collective solution.

- Team scoring (§3.3, PR \#116): exactly 100 points once to the team for successful challenge, including recovery; zero if uncompleted; no normalized Team scoring, no per-member Team Challenge points or recovery penalty.

- FinishPoint (§I11): same authoritative engine, terminal semantics; one team finishing does not end every team.

- Safety: persistent truthful HELP/PANIC and incident lifecycle; network loss must not falsely acknowledge delivery. GPS and route safety require real-device/human verification.

- Open policies: team size bounds, membership changes, late join/reassignment races, one-active-member recovery mechanic, GPS fallback, tie rules, cross-mode rankings, suspensions and global Hunt closure require narrow explicit decisions before relevant code.

### E3. Matrix constraints, prerequisites and closure

Imported narrative below retains the original matrix wording for full requirement preservation. Status observations are dated at its pinned review, superseded only by §C evidence. Its old `F7-FE-01 is ready` and `no new FE row below is complete` statements no longer describe current status. All capability limits, CLOSE-1, acceptance, dependencies and decisions remain binding. References to Master §4/§5 mean the original rows/decisions now in §C1/§E2; references to architecture sections still refer to architecture. The historical phrase `.1` creates no executable ID.


#### Imported matrix: Verified implementation boundary

Pinned FE main: `fc43d2040700e44df0db9e5481f95964f597e6be` (FE #121). Pinned BE main: `bcf1fda4153cc8ea787c4d7e5922f4cb4b34ee32` (BE #89). GitHub recursive trees and PR merge metadata were read; local checkout is older and is not the source of current status. No AGENTS.md was present in either pinned tree. Shell git fetch/clone failed at the configured proxy; authenticated GitHub connector reads are the source of current evidence.

Creator inspection: `src/pages/CreatorStudio.tsx`, `src/features/creator/TemplateCreationChooser.tsx`, `checkpointGameplay.ts`, `src/services/api/creatorTemplates.ts`. Existing owned list, draft creation/save/submit, shared gameplay/geography/FinishPoint authoring and starter chooser are reusable. The current `configuration.category` subject field (Mathematics etc.) is **not** identity `category: universal|local`. The API client omits classified create/binding/library/copy projections. Studio makes every non-draft read-only and says revision is unavailable; backend classified revisions now exist. Current generic route/safety readiness UI cannot simply be reused as Universal submission requirements. F7 is partial, not complete.

Admin inspection: `src/pages/AdminConsole.tsx`, `src/pages/AdminTemplateReviews.tsx`, `src/services/api/adminTemplateReviews.ts`, BE `src/routes/adminTemplateReviews.ts`, `adminTemplateEligibility.ts`, `localityProposals.ts` and `src/models/HuntTemplate.ts`. Generic exact inspection exists, but FE approve/requestChanges sends no version body; classified C5/C6b-5 decisions require the inspected `{version}`. Category review, continuity/suspension projections and proposal review need FE slices. Request-changes currently persists a decision, not narrative feedback; no feedback text API is promised here. No complete route evidence, expiry/re-review or operating-condition enforcement was found in C7; do not represent its integrity eligibility as physical route safety.

Organizer inspection: `src/pages/OrganizerSetupFlow.tsx`, `CustomHuntEditor.tsx`, `generalSetup.ts`, merged [D10 readiness report](D10_Organizer_Integration_Readiness_Report.md). Existing draft-first builder and settings persist through HuntsApi/legacy templateKey selection. Reuse that builder and geographic preview components after the integration gate is satisfied. FE #121 adds a report only.

Backend evidence includes C1–C5/C6b reports/contracts, C7 contract/report, Creator/Universal/geography/proposal/Admin/Organizer/Hunt routes, `PublishedUniversal.ts`, `HuntTemplate.ts`, `OrganizerLocalTemplate.ts`, migration 028, binding/Local-approval/C7 PostgreSQL test assertions and `app.ts`. C7 mounts exact discovery/detail/selection, server snapshots and concurrency/authorization protections. **Complete — merged/source verified** applies to those bounded BE foundations, not full F7/G4/D10. Reported C7 tests: 89 C7 tests, 248 focused tests in 8 files, 1,255 complete-suite tests in 60 files; all zero failures/skips, typecheck/build passed. Totals overlap. They were reported by BE #89/report, not executed here; CI/deployment/E2E success is not inferred.


#### Imported matrix: Capability boundary and first task prerequisites

**F7-FE-01 is ready** only within the existing read-only supported-authoring boundary. BE `src/domain/checkpointGameplay.ts` derives allowed `kind`, `teamKind`, `navigationMode` from canonical Signal v1; FE `checkpointGameplay.ts` uses the matching Signal vocabulary, hydrates/serializes immutable content and existing gameplay editors configure it. C2 validates those types. Existing count bounds are 1–20 normal checkpoints with separate terminal authoring. This is evidence of supported configuration, not authoritative Participant runtime, new arbitrary mechanics, mode compatibility declarations or five-minute recovery implementation.

F7-FE-01 must explain authoring/preview availability versus planned runtime for Personal/Team Challenges, hints/scoring/progression, GPS arrival and FinishPoint. Do not advertise later Shadows/Shields, variable-team compatibility or executable custom components as configurable merely because architecture mentions them. If implementing a new control needs an unagreed configuration/availability contract, stop that control and record a decision; the read-only guidance/navigation slice does not create one. Four entries may reach truthful staged destinations until creation slices are delivered. That bounded result does not satisfy full F1/F7 acceptance or unlock D10.


#### Imported matrix: Matrix conventions and closure requirements

The two linked tables below form one matrix keyed by unique ID. Table 1 gives deliverable, current stable status and prerequisites; Table 2 gives acceptance, tests, proposed PR scope and blocking effect. Phase/workstream is explicit. All statuses are as of the pinned review. `Ready for implementation` means prerequisites for that slice are verified; `Not started` means no implementation of its deliverable found and named predecessor work remains. `Blocked` denotes an explicit architectural/contract/decision gate. Decision rows do not authorize code.

Every implementation row also requires **CLOSE-1**: required functionality in its acceptance cell; the named behavioral/API/integration tests; persisted-role, owner or Hunt-scope authorization checks as applicable, including denied/revoked/guest actors and no private-data leakage; relevant legacy category-null, Signal starter, exact review, immutable-version/copy/Hunt-snapshot regressions; applicable FE typecheck/build and focused test results with failures/skips disclosed; updated API/UX/limitation documentation and master register; PR URL/merge SHA, source refs, test commands/results and review evidence. Failure cases must preserve user input and must not report success before server commit. Loading, empty, retry, out-of-order response and 400/401/403/404/409 behavior belongs in each affected slice, not deferred entirely to a test-only PR. No UI role check substitutes for server authority. No new runtime tests or migrations are part of this documentation PR.

Decision rows close with a reviewed written decision and examples, not application tests. Future BE implementation rows require disposable DB/API/transaction tests in addition to CLOSE-1. Integration acceptance records exact identities/roles, artifacts and outcomes; deployment acceptance additionally records actual environment/date/FE+BE revisions/migrations/provider/device cases. Never infer any level from a contract, mockup, migration, endpoint or neighboring layer.

Track five independent fields for each row when work starts: **contract/decision; backend; frontend; integrated workflow; deployed E2E**. Initial field values: existing referenced C1–C7 contract/backend foundations are complete at merged-source level; no new FE row below is complete; integrated and deployed acceptance are unverified. New governance contract/backend fields are missing or decision-dependent. F7-FE-01 needs no new BE contract. Decision rows have FE/BE fields not applicable until their scope is approved. Mark `Complete — merged/source verified` only after the exact slice is merged and its source/tests verified; use `Complete — deployed/E2E verified` only with actual deployed evidence. Keep source completion after failed deployment and record deployment separately.


#### Imported matrix: 1. Deliverables and prerequisites



#### Imported matrix: 2. Acceptance, tests, closure evidence and PR boundaries

CLOSE-1 applies to every implementation row; the tests cell adds task-specific evidence. Each ordinary FE row is one proposed bounded Draft PR. Governance rows explicitly marked as containers require approved contracts and then subordinate PR-sized execution children before coding; they are not authorization for a broad implementation PR. No implementation starts in this documentation PR.



#### Imported matrix: 3. Dependency order and decisions

Critical path: **F7-FE-01 → 02/03 → 04 → 05; 06 → 07 and 08 → 09 → 12; 11/13 → G4 representative review/approval/continuity → applicable G4 governance and reviewed catalog/legacy gate → D10-GATE → D10-FE-01 → 02 → 03 → 04 → 05 → 06/07 → 08 → D10-E2E-01 → deployed acceptance**. The list is a dependency graph, not an instruction to execute all work in one PR. F7-FE-06 can follow 02 while Universal save/submit work proceeds; manual proposal/review is a branch for absent stored localities. G4 decision/contract work can proceed alongside isolated Creator development. A catalog entry and a reviewed Local fixture are necessary for real selection tests; an empty initial catalog is not proof the API is missing.

Implementation prerequisites differ from activation gates. Existing stored/manual API paths allow Creator/Admin development without C6b-2 Mapbox permanent storage. Deployment G0–G6, human route review and §20.3 are not automatically a ban on isolated F7 development. However, architecture §20.2 explicitly gates **D10 integration/activation**, and FE #121 found no non-public exception. Every D10 FE row stays blocked until D10-GATE is recorded satisfied or the PO explicitly clarifies/amends the governing scope. This plan creates no hidden-route/feature-flag waiver.

| Decision key | Required decision/evidence | Blocks |
| --- | --- | --- |
| PO-GATE | Identify satisfied Creator/Admin, reviewed catalog, safety/readiness and compatibility prerequisites under §20.2. If requesting bounded D10 integration before full governance, explicitly resolve the architecture/report discrepancy in a separately reviewed decision. | D10-GATE; not F7-FE-01. |
| PO-SAFETY | G4-DEC-01: required route/access evidence and independent review responsibilities; validity, expiry, re-review, operating conditions, publish/start and existing-Hunt consequences. | New G4 governance BE/FE; applicable D10 prerequisites and public activation. |
| PO-LEGACY | Explicit legacy/Signal transition, reviewed Local catalog and staged activation without silent classification or snapshot rewrite. Historical remediation and reinstatement remain deferred unless separately approved. | D10 compatibility/readiness and public activation; not basic category authoring. |
| PO-FEEDBACK | Version-bound request-changes narrative, visibility/retention and whether required for full workflow acceptance. Existing decision-state correction can proceed. | G4-BE-03/G4-FE-07; no invented comment API. |
| PO-PROVIDER | Account-specific Mapbox permanent storage/sharing/backup/post-termination retention, attribution and locality coverage evidence. No temporary Search Box results through manual proposal. | C6b-2 only and dependent permanent-provider work; stored/manual path remains available. |
| Existing §5 / P1–P6 | Parallel pilot exception, team/membership/recovery allocation details, GPS fallback, suspension/terminal/global closure, rankings/rewards as scoped in architecture. Approved automatic five-minute recovery and +100 once are retained; do not reopen or implement new rules here. | Dependent H–N work and live stages; not isolated read-only Creator navigation. |

Architecture §20.1a/§21 and its remaining §20.2 list still say C7 backend pending. This is a **verified stale status discrepancy** after BE #89, not a design change: this control plan corrects current progress while leaving architecture v3.6 untouched for separate documentation synchronization. The stricter Creator/Admin/compatibility integration rule remains binding. Architecture's legacy “approved content not directly editable” means immutable approved content is never modified in place; C5/C6b-5 create a new candidate and retain old authority. Historical Local compatibility is not new selection eligibility. One-way Template suspension is not runtime checkpoint suspension I13 or incident resolution J.


#### Imported matrix: 4. Remaining H–N execution audit

All original A–N IDs, labels, actions, order and G0–G6 rows remain in Master §4. No task was found unmappable to the architecture's named phase/task sections, including B1.1. `C1–C7` in backend foundation reports are **F7 subordinate backend slices**, not Phase C1–C4 Hunt-domain tasks; gate **G4 — Variable teams** is not task **G4 — Separate Universal/Local governance**. Likewise architecture Mapbox **M4/M5/M6** are map-stage labels, not Phase M1–M5 long-term-profile IDs. Those namespace collisions must never close unrelated tasks.

Current BE app.ts mounts no authoritative enrollment/team/readiness/start/recovery, answer/progress/score/FinishPoint, live incident or result runtime. Existing membership models, FE readiness/gameplay/monitor/results prototypes and Users & Roles controls are foundations only. No new merged H–N runtime was found in the pinned source/tree. H1 code lookup remains a bounded source-complete foundation; the rest retain §4 statuses. This audit is source/route-surface verification, not a claim to have rerun every historical acceptance suite.

The following subordinate IDs make broad register entries executable without promoting deferred features. Each row is a sequence container; its `.1` is the next bounded contract/verification task when prerequisites clear. Define additional immutable-storage/API/UI PR children during its approved contract, not by silently widening the parent. CLOSE-1 applies to future implementation children; decision/contract `.1` closes on reviewed contract/examples, scoped API/storage/authorization/race tests and explicit follow-on slices, not on an implemented endpoint. Execution order follows architecture §20.3's staged Solo A → two-account Team B → variable Team C proof; minimum live safety J and results K accompany each live stage rather than waiting until the end of all gameplay.


All H–N parents remain individually traceable in Master §4 even when a container spans related tasks. No deferred I14/J9/K4–K6/M–N is silently required for the first pilot. L4/L5 remain original not-started tasks, not reclassified as delivered or formally deferred by their decision child. The content supply-chain prerequisite and explicit P1 approval for a parallel legacy pilot are preserved.

### E4. Discrepancies and unresolved decisions

- **Verified stale F7-FE-01 status:** old dashboard/next-action/matrix say ready and old PR register/report say Draft/unmerged. GitHub #123 is merged. §C corrects only its FE source dimension. Report test executions remain attributed, not freshly run. Parent F1/F7 and D10 acceptance remain open.
- **F7-FE-01 acceptance wording:** matrix says creation entries “reach explicit forthcoming-flow explanations”; final merged source uses visible descriptions on noninteractive Coming soon cards. Preserve both facts. Do not silently add click-through flows, reopen the merged task, or declare full classified creation accepted. Product Owner resolves any demand beyond the bounded merged result.
- **Architecture stale C7/Mechanics Library progress:** architecture still describes C7 backend and navigation as pending. BE #89 and FE #123 provide bounded source completion; architecture design, §20.2 gates and v3.6 remain unchanged. Synchronize progress separately if needed; no architecture redesign is implied.
- **Governance decisions remain open:** PO-GATE, PO-SAFETY, PO-LEGACY, PO-FEEDBACK and PO-PROVIDER above are not resolved here. No implicit non-public D10 exception, safety certification, narrative feedback API, reinstatement or historical remediation.
- **H–N `.1` ambiguity:** matrix introduces 23 exact IDs and also calls their next actions `.1`; no such suffixed rows exist. Preserve the 23 named IDs and their contract/verification/decision scope. Any additional child requires Product Owner approval and registration. Do not implement the container's entire feature or invent a suffix.
- **Dependency graph shorthand/cycle:** the prose critical path places “11/13 → G4” while F7-FE-13 acceptance explicitly needs G4-FE-01–05. Use each exact task's development prerequisites: Creator submissions provide representative G4 artifacts, G4 behavior then participates in F7-FE-13 acceptance. Do not treat shorthand as a new requirement to complete all Creator integration before developing representative G4 review. Record a conflict if a request relies on a different interpretation; no priority is changed here.
- **Historical acceptance disagreements:** architecture records E13/E16/E17 deployed onboarding, while Master verification qualification withholds a fresh deployed claim; architecture K/M/N “not started” versus Master decision/deferred describes implementation versus execution authorization. Preserve dated evidence and both dimensions; this consolidation neither revokes historical acceptance nor invents current re-verification or scope approval.
- **Policy-key mismatch:** matrix references P1–P6, while architecture also names P10 for scoring/ranking. Preserve keys in their governing context; do not renumber or infer a policy. The approved five-minute recovery/+100-once rule is settled, while dependent allocation/GPS/suspension/terminal/ranking details remain open.
- **Unverified L1 gap:** proposal-only creator/reviewer deletion may encounter restrictive locality-proposal FKs rather than retire. Existing D03 scope stays complete; L1-VERIFY-1 must verify that later case before a full coverage claim.

These conflicts do not prevent faithful recording; they prevent unsupported implementation/acceptance decisions. Product Owner review is required for changes to governance, priority, scope or architecture, not for preserving these discrepancies.

## F. Implementation history and evidence

This section preserves historical PR status wording and reported tests at their original review dates. It is an immutable evidence ledger, not another current task register. Current status is §C. In particular, historical Draft/unmerged wording for #123 is superseded by actual GitHub merge metadata below without rewriting the past. PR numbers remain repository-specific; contract closure never implies implementation.

### F1. Current merge addendum — FE #123

GitHub confirms `merged=true`, merge timestamp `2026-10-30T00:19:05Z`, merge SHA `ab54a3e0c776ed8843a2ae5d103f6313677aab2b`, final head `7798b6d8c1f25ddb01c3149d9e5aebe90570cf5d`. Read navigation source, guarded-route tests and the [F7-FE-01 report](F7_FE_01_Implementation_Report.md). Source complete only: four entries, two active, two noninteractive Coming soon cards, read-only supported-mechanics guidance, retained owned list and legacy chooser. Existing tests/typecheck/build/browser checks are report evidence; no fresh runtime verification was performed here. F7 remains partial, D10 blocked, integration/deployment unverified.

BE #89 merge was rechecked: `merged=true`, `2026-10-29T23:34:41Z`, `bcf1fda4153cc8ea787c4d7e5922f4cb4b34ee32`. Read its pinned C7 implementation report. Reported 89 C7/248 focused/1,255 full tests overlap and are not new executions here. The [D10 readiness report](D10_Organizer_Integration_Readiness_Report.md) remains binding on its explicit integration stop. Both repositories' open PR collections were empty at consolidation review; recheck before future implementation.

<details>
<summary>Frozen original PR register, closing loop and dated evidence</summary>

### F2. Preserved original Master PR register and remaining sequence

Original §6 — frozen historical record:

Use one row per actual PR. Status below refers only to each bounded slice, not completion of its parent A–N workflow. FE and BE PR numbers are repository-specific. Merge metadata and source were checked at the pinned heads in §9; test totals below are historical PR reports, not fresh runs in this reconciliation.

| PR / task IDs | Implemented scope | Reconciled state | Source/test evidence and limits |
| --- | --- | --- | --- |
| [FE #123](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/123) / F7-FE-01 | Four Creator Studio entries and read-only Mechanics Library; noninteractive Universal/Local Coming soon cards; existing My Templates and legacy chooser preserved | Implemented — Draft, pending ChatGPT review; not merged | [Implementation report](F7_FE_01_Implementation_Report.md): 281 Vitest tests / 14 files, Node runner 35 passing file entries; typecheck/build and Chromium 320–1440px checks passed, zero skips. Contract/BE unchanged; FE pending review; integrated/deployed acceptance unverified. Universal/Local creation and full F7/D10 remain pending. |
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

### F3. Preserved original closing loop

Original closing-loop requirements (use this authoritative register):

At the end of each implementation PR (not only at the end of the whole project):

- Record merged PR number, FE/BE commit SHA, affected A–N task IDs and exact implemented scope.

- Update task status only for verified behavior; distinguish source tests, CI, deployed verification and multi-user E2E.

- Update API/schema/contract references, acceptance evidence and any known limitations.

- Keep approved decisions, unresolved policies, audit history and immutable Template/Hunt semantics intact.

- Reconcile this v3 control register with the repository Master Architecture Plan and companion Audit/Critical Path; document deferred work explicitly.

- Submit any documentation synchronization as a separate small Draft PR when appropriate; Product Owner reviews and merges.

### F4. Original evidence and dated reconciliations

Historical sections below preserve all original evidence, limitations and conflicting status observations. Old “next action” and “current” labels belong only to their dated source snapshot. §C and §G govern current selection; no historical instruction authorizes another PR or deployment.

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

</details>

## G. Next task selection protocol

### When the Product Owner says “next”

1. Read §C and the preserved sequence/dependencies in §E, plus current architecture requirements. Never start from a historical dashboard or PR body.
2. Enumerate existing authorized executable IDs in documented order; exclude parent aggregates, completed source slices and unapproved future children. Decisions/verification may execute only their recorded bounded action.
3. Verify every development prerequisite against recorded and current evidence. Check activation requirements separately; D10's explicit integration gate is a development restriction, not merely a deployment condition.
4. Fetch actual open PRs/branches/ongoing work in the affected repository and match Task IDs. Resume or review existing work rather than open a duplicate.
5. If eligible, produce one bounded Codex prompt containing repository/base, authorized Task ID, exact deliverable, explicit exclusions, prerequisites with evidence, acceptance/tests/security/legacy checks, reporting and Draft PR/ChatGPT review stop.
6. If blocked, explain the named constraint and identify the next eligible task allowed by the documented dependency graph. Do not silently reorder Product Owner priorities or resolve a scope/governance conflict. If no existing task qualifies, report that fact; never invent work to maintain progress.
7. At this snapshot F7-FE-02 is the first candidate after merged F7-FE-01; F7-FE-03 is the recorded sibling branch. This is a derived candidate, not authorization to implement either in this documentation PR.

### When the Product Owner says “check PR”

1. Fetch the actual GitHub PR, complete patch and relevant discussion/test evidence.
2. Match it to an existing authorized Task ID, exact scope and prerequisites.
3. Review correctness, scope, tests, security, authorization, regression risks, legacy/Signal compatibility and evidence limits.
4. For frontend tasks explicitly review **Simplicity & Ergonomics**: visible relevance/availability, progressive disclosure, input preservation, loading/error/retry, keyboard/focus/history and responsive behavior. Do not solve usability by adding unauthorized features.
5. Recommend merge or corrections based on evidence. Product Owner controls merge; no automatic merge/deployment.

### After a PR is merged

1. Verify GitHub `merged=true`, timestamp and merge/head SHAs; do not infer from a title, closed state or old Draft text.
2. Append exact PR/merge/scope/test evidence to §F.
3. Update only the affected §C task and verified dimension; preserve completed history and independent contract/BE/FE/integration/deployment acceptance.
4. Reevaluate dependencies and derive §B from §C. Record any newly found blocker; no automatic child, priority change or activation.
5. Reconcile architecture/API/audit references in narrowly scoped documentation work as needed. Deployment and deployed verification remain separate authorized actions.

## H. Migration and traceability

The [reconciliation report](TedixHunt_Execution_Plan_Reconciliation.md) maps every original §4 row, both expanded matrix tables, all H–N entries and every source section/line interval. Original documents remain at their existing paths with only a supersession notice added after reconciliation checks pass. Original content is retained verbatim after that notice. No application source, contracts, migrations, runtime tests or architecture decisions change.

The new register is the sole current execution status authority; original documents and §F's dated history are evidence only. Scope/dependency/acceptance requirements in the imported matrix narrative remain authoritative, except explicitly recorded stale progress text. Resolve conflicts through the Product Owner rather than silently rewriting either requirement.

**Documentation-only Draft PR for ChatGPT review. Stop here. Do not merge or deploy.**

<details>
<summary>Frozen source dashboard, reading rules and retired next action</summary>

### H1. Source context retained for reconciliation

Frozen source context, not current selection instructions; stale statements are identified in §E4.

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

# 8. Next action

**NEXT CODEX TASK: F7-FE-01 — Creator dashboard/navigation and read-only Mechanics Library.** Base implementation on freshly verified latest FE main in a separate bounded Draft PR. This documentation PR implements none of it.

Verified prerequisites: persisted active Creator guard/session and existing Studio; shared supported gameplay vocabulary/configuration contract (BE checkpointGameplay/C2, FE checkpointGameplay/editor); architecture F1/F7 four-entry information architecture. Implement Mechanics Library, My Templates, Create Universal Template and Create Local Template navigation with truthful staged destinations and short supported-authoring explanations. Existing My Templates remains usable; planned creation is not falsely routed to unclassified creation. Do not add a new mechanic, runtime or persistence contract. The [matrix capability boundary](TedixHunt_Execution_Dependency_Matrix.md#capability-boundary-and-first-task-prerequisites) constrains availability claims; unresolved future configuration fields remain decisions, not prerequisites invented for this read-only slice.

Closure: keyboard/focus/back navigation and responsive interaction tests, Creator-route authorization and session-error handling, no mutation from browsing, legacy Studio/starter reachability regression, relevant FE tests/typecheck/build and documented results/screenshots or equivalent review evidence. Record PR/merge SHA and exact implemented scope under F7-FE-01; do not mark F7 complete or D10 unblocked from this slice.

Execution order and critical path are in the [dependency matrix](TedixHunt_Execution_Dependency_Matrix.md#3-dependency-order-and-decisions): Creator type context and Universal create/save/submit; approved Universal reuse plus standalone Local; stored/manual locality binding and Local editor/revisions; independent category-specific Admin review with retained authority/suspension; applicable missing governance, reviewed catalog and legacy/compatibility decisions; D10 readiness gate; then dependent Organizer FE and integrated/deployed acceptance. Product/governance contract work can proceed alongside isolated Creator development. New narrative feedback requires its own reviewed contract; existing decision-state correction can proceed.

C6b-4/#85, C6b-5/#87, C7 contract/#88 and C7 backend/#89 are complete only at their bounded merged-source levels; do not reissue them. C6b-2 permanent provider persistence remains blocked by licensing; stored/manual work can proceed. D10 remains explicitly blocked under architecture §20.2 and FE #121 until its prerequisites are satisfied or PO records a specific scope clarification; no hidden integration exception is inferred. Runtime H–N sequencing, G0–G6 and explicit PO approval for a parallel pilot remain unchanged. No application, deployment, release or merge is authorized by this documentation PR.


</details>
