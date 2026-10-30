# TedixHunt execution-plan reconciliation

Documentation-only consolidation, 30 October 2026 (Europe/Bucharest). [Authoritative Master Execution Plan](TedixHunt_Master_Execution_Plan.md). One Draft PR; stop for ChatGPT review. No merge, deployment, implementation or architecture change.

## Provenance and verification boundary

Latest FE main was read through the authenticated GitHub connector at `ab54a3e0c776ed8843a2ae5d103f6313677aab2b`, including merged #123. The complete recursive tree was read (`truncated=false`); it contains no AGENTS.md. The local checkout was older (`2173853`) and shell fetch failed because the configured proxy was unreachable; it was not used as current status evidence. GitHub connector reads and tree-based delivery preserve the latest remote base.

Both planning documents and architecture v3.6 were inspected, together with F7-FE-01 and D10 readiness reports. Read pinned BE #89's C7 report and actual GitHub merge metadata; inspected merged FE navigation source and guarded-route test assertions. Existing historical source/CI/test evidence is retained with its original attribution. No runtime suite, deployment, live DB, provider entitlement, real-device GPS or integrated/deployed E2E was verified in this docs-only change.

Both FE and BE `/pulls?state=open&per_page=100` collections returned `[]` before opening this Draft PR. Recheck live work before future task selection.

| Source at pinned FE base | Git blob SHA | Lines | SHA-256 of preserved UTF-8 source |
| --- | --- | --- | --- |
| [TedixHunt_Master_Implementation_Control_Plan_v3.md](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md) | de1c7459dbef3aa7b1d6b5d7d2d8eb2d2baaaa68 | 520 | a3e9b2c7ef3ba6dc016aee6b67051e676f993042883a0c80735a893ab4639715 |
| [TedixHunt_Execution_Dependency_Matrix.md](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md) | d8afecfac556131069edc8f607a364228b77d9fd | 166 | a82628606769ca6b6f9af58d4d2184ec4b2abce090eb9c149edef992be02de5c |

## Computed counts and counting policy

Counts were parsed from actual Markdown table contents, joining by stable IDs. They do not reuse the old document's asserted totals.

| Measure | Count / rule |
| --- | --- |
| Original Master Plan A–N rows | 109 |
| Expanded Dependency Matrix unique IDs | 58 |
| Matrix primary F7/G4/D10 IDs | 35 |
| Matrix companion acceptance rows | 35 |
| Additional H–N execution/verification/decision IDs | 23 |
| Total matrix task-row occurrences | 93 |
| Original rows retained as parent workstreams | 57 |
| Original standalone executable/control entries | 52 |
| Existing additional provider task C6b-2 | 1 |
| Unique executable/control task records after consolidation | 111 |
| Total unique current register records, including parents | 168 |
| Missing original task IDs | 0 |
| Duplicate authoritative register IDs | 0 |
| Expected repeated matrix IDs before joining | 35 |
| Missing original register/matrix scope cells | 0 |
| Missing matrix narrative requirement lines | 0 |
| Broken relative file references | 0 |
| Broken internal task anchors | 0 |
| Markdown table width errors | 0 |


Arithmetic: `109 − 57 + 58 + 1 = 111` executable/control records; `111 + 57 = 168` total records. The 111 includes existing verification, decision, gate and contract/container entries, not 111 implementation-ready features. The 23 H–N containers permit only their recorded next contract/verification/decision action. Governance containers retain their own contract-first restrictions. No `.1` or future implementation children were invented. Completed backend slices and D01–D07 stay in the preserved PR history; they are not counted again as new pending tasks. C6b-4/5/C7 remaining-scope rows are historical aliases of those foundation records.

The 57 parents are the three explicitly expanded F7/G4/D10 workstreams and 54 H–N original rows named by the matrix. Every H–N row remains separately traceable, including rows grouped under one container. The other 52 A–N entries keep their original verification/build/decision scope; they were not split into artificial tasks. The 14 phase headings A–N, seven G0–G6 readiness gates, original Master sequence containers 04–09, decision keys and PR rows are preserved without counting them as additional features.

## Reconciliation checks performed

Re-run after simplification: 109 original rows, 58 expanded IDs and 168 current records retain identical ID order and record kinds. Every old dependency, deliverable, status/dimension qualifier, evidence, acceptance and blocker field is preserved verbatim in the frozen detail records below, with only local links retargeted to the operational plan. Original architecture rows and both matrix task tables are compared cell by cell against those records. Compact status labels have an explicit per-record before/after mapping; no execution state or acceptance dimension is promoted or reset.

The operational register links each of its 168 rows to its exact detail record. Shared matrix narrative requirements are preserved in the shared detail section; historical PR evidence and Master section bodies remain at their original archived paths and are mapped below. No historical dashboard or obsolete next-task instruction is embedded in the operational plan.

Checks cover unique authoritative IDs, order, record kinds, all dependency/acceptance cells, source prose, source-body blob hashes, relative file/fragment targets, table widths, fences and whitespace. The detailed record's Status field is frozen audit data at PR #124's pre-correction head, not another live status register. Current progress is maintained only in the compact plan.

## Verified F7-FE-01 / FE #123 evidence

[FE #123](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/123) returned `state=closed`, `merged=true`, `draft=false`, `merged_at=2026-10-30T00:19:05Z`, merge SHA `ab54a3e0c776ed8843a2ae5d103f6313677aab2b`, final head `7798b6d8c1f25ddb01c3149d9e5aebe90570cf5d`.

Merged navigation source and its tests match the bounded four-entry/read-only scope. [F7-FE-01 report](F7_FE_01_Implementation_Report.md) reports 281 Vitest tests/14 files, 35 Node file entries, typecheck/build and Chromium widths 1440/768/390/320 passing, zero failures/skips. These are historical reported executions, not new runs here. Two active entries and two noninteractive Coming soon cards preserve truthful availability. Current status is **Merged — source verified** for this FE slice only; F1/F7 remain partial, integrated/deployed acceptance unverified, D10 blocked.

BE #89 also returned merged=true with merge `bcf1fda4153cc8ea787c4d7e5922f4cb4b34ee32`, timestamp `2026-10-29T23:34:41Z`; C7 remains backend-only source completion. No backend merge closes FE or E2E acceptance.

## Unresolved discrepancies / Product Owner decisions

These discrepancies remain constraints on the operational plan; no Product Owner decision is resolved by simplification.

1. Old F7-FE-01 ready/Draft/unmerged progress wording is stale; GitHub merge corrects current source status, without rewriting historical reports.
2. Matrix forthcoming-flow wording and merged noninteractive Coming soon cards differ. Preserve the bounded merged outcome; Product Owner decides any remaining expectation. No new clickable flow is authorized.
3. Architecture's C7/navigation-pending progress remains stale; architecture design/gates are unchanged. No source-completion evidence waives D10 integration requirements.
4. PO-GATE, PO-SAFETY, PO-LEGACY, PO-FEEDBACK and PO-PROVIDER remain unresolved. Preserve route/access evidence quality, validity/expiry/re-review, operating conditions, publish/start/existing-Hunt consequences, legacy/Signal activation, narrative-feedback visibility/retention, Mapbox rights, reinstatement and historical-remediation limits.
5. Matrix `.1` child wording has no registered suffixed IDs. Only existing named entries are preserved; Product Owner must approve any additional task before registration.
6. Critical-path shorthand around F7-FE-13/G4 is not a replacement for exact development prerequisites. Representative submissions permit G4 review development; integrated Creator acceptance then uses G4 flows. No all-Creator-before-all-Admin prerequisite is invented.
7. Historical onboarding deployed claims versus Master fresh-verification limits, and runtime-not-started versus deferred execution authorization, remain separately attributed. No historical acceptance is revoked or newly claimed.
8. Policy-key references P1–P6/P10 retain context; no policies are renumbered or invented. Approved five-minute recovery/+100 once remains settled; dependent team/GPS/terminal/global-closure/ranking details stay gated.
9. Proposal-only account deletion/retirement remains an unverified L1 concern; original D03 completion is preserved for its bounded scope.

No unresolved architectural/Product Owner decision was resolved by consolidation. These discrepancies are recorded rather than hidden; they constrain future work and acceptance.

## Preserved originals and source-section destinations

Only a supersession notice is added to each original planning document after successful coverage checks. Their original bodies, PR statuses, headings and relative links remain intact. The following section mapping covers non-task requirements and historical evidence, in addition to the per-row table below.

| Original source range | Operational / preserved destination | Handling |
| --- | --- | --- |
| Master title/dashboard; §§1–2 | Plan §A; archived [TedixHunt_Master_Implementation_Control_Plan_v3.md](TedixHunt_Master_Implementation_Control_Plan_v3.md) | Old selection instructions remain only in the archived original; operational rules retained |
| Master §3 | Plan §E; archived Master §3 | All G0–G6/parallel-pilot requirements remain binding by reference |
| Master §4, all 109 rows | Plan §C1; frozen detail records below | Exact label/action/priority/qualification retained; explicit parent mapping |
| Master §5 | Plan §E; archived Master §5 | Exact product decisions and exceptions retained by reference |
| Master §6, all PR and remaining-scope rows | [TedixHunt_Master_Implementation_Control_Plan_v3.md §6](TedixHunt_Master_Implementation_Control_Plan_v3.md#6-implementation-pr-control-register) | Complete historical PR statuses/evidence and 04–09 sequence preserved unchanged |
| Master §7 | Plan §A/§G; archived Master §7 | Mandatory closing loop remains binding |
| Master §8 | Archived [TedixHunt_Master_Implementation_Control_Plan_v3.md §8](TedixHunt_Master_Implementation_Control_Plan_v3.md#8-next-action) | Historical instructions retained only there; operational candidate defined once in plan §G |
| Master §§9–10 | [TedixHunt_Master_Implementation_Control_Plan_v3.md](TedixHunt_Master_Implementation_Control_Plan_v3.md) | Complete dated merge ledgers, tests/CI, phase evidence and limitations unchanged |
| Matrix context/capability/closure conventions | Shared details below; Plan §C/§E | Exact narrative requirements retained; stale progress remains a dated discrepancy |
| Matrix §1 + §2, 35 keyed pairs | Plan §C2; frozen detail records below | Exact scope/prerequisite/acceptance/tests/security/legacy/PR boundary preserved |
| Matrix §3 including decisions | Plan §E/§G; shared details below | Dependency graph and all decision rows preserved; no priority change |
| Matrix §4 audit/prose and 23 entries | Plan §C3/§E; frozen/shared details below | Full H–N scope, parent mappings, staged order and contract-first restrictions retained |

## Every original task/workstream destination

Source line numbers below refer to the pinned pre-notice source, not the shifted historical files in this PR.

| Pinned source row(s) | Original ID | Record kind | Destination | Reconciliation |
| --- | --- | --- | --- | --- |
| [Master §4 L75](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L75) | A1 | Executable | [§C A1](TedixHunt_Master_Execution_Plan.md#task-a1) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L76](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L76) | A2 | Executable | [§C A2](TedixHunt_Master_Execution_Plan.md#task-a2) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L77](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L77) | A3 | Executable | [§C A3](TedixHunt_Master_Execution_Plan.md#task-a3) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L78](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L78) | A4 | Executable | [§C A4](TedixHunt_Master_Execution_Plan.md#task-a4) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L79](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L79) | A5 | Executable | [§C A5](TedixHunt_Master_Execution_Plan.md#task-a5) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L80](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L80) | A6 | Executable | [§C A6](TedixHunt_Master_Execution_Plan.md#task-a6) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L86](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L86) | B1 | Executable | [§C B1](TedixHunt_Master_Execution_Plan.md#task-b1) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L87](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L87) | B1.1 | Executable | [§C B1.1](TedixHunt_Master_Execution_Plan.md#task-b1-1) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L88](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L88) | B2 | Executable | [§C B2](TedixHunt_Master_Execution_Plan.md#task-b2) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L89](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L89) | B3 | Executable | [§C B3](TedixHunt_Master_Execution_Plan.md#task-b3) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L90](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L90) | B4 | Executable | [§C B4](TedixHunt_Master_Execution_Plan.md#task-b4) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L91](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L91) | B5 | Executable | [§C B5](TedixHunt_Master_Execution_Plan.md#task-b5) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L92](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L92) | B6 | Executable | [§C B6](TedixHunt_Master_Execution_Plan.md#task-b6) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L98](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L98) | C1 | Executable | [§C C1](TedixHunt_Master_Execution_Plan.md#task-c1) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L99](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L99) | C2 | Executable | [§C C2](TedixHunt_Master_Execution_Plan.md#task-c2) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L100](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L100) | C3 | Executable | [§C C3](TedixHunt_Master_Execution_Plan.md#task-c3) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L101](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L101) | C4 | Executable | [§C C4](TedixHunt_Master_Execution_Plan.md#task-c4) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L107](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L107) | D1 | Executable | [§C D1](TedixHunt_Master_Execution_Plan.md#task-d1) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L108](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L108) | D2 | Executable | [§C D2](TedixHunt_Master_Execution_Plan.md#task-d2) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L109](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L109) | D3 | Executable | [§C D3](TedixHunt_Master_Execution_Plan.md#task-d3) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L110](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L110) | D4 | Executable | [§C D4](TedixHunt_Master_Execution_Plan.md#task-d4) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L111](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L111) | D5 | Executable | [§C D5](TedixHunt_Master_Execution_Plan.md#task-d5) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L112](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L112) | D6 | Executable | [§C D6](TedixHunt_Master_Execution_Plan.md#task-d6) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L113](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L113) | D7 | Executable | [§C D7](TedixHunt_Master_Execution_Plan.md#task-d7) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L114](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L114) | D8 | Executable | [§C D8](TedixHunt_Master_Execution_Plan.md#task-d8) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L115](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L115) | D9 | Executable | [§C D9](TedixHunt_Master_Execution_Plan.md#task-d9) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L116](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L116) | D10 | Parent | [§C D10](TedixHunt_Master_Execution_Plan.md#task-d10) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L122](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L122) | E1 | Executable | [§C E1](TedixHunt_Master_Execution_Plan.md#task-e1) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L123](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L123) | E2 | Executable | [§C E2](TedixHunt_Master_Execution_Plan.md#task-e2) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L124](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L124) | E3 | Executable | [§C E3](TedixHunt_Master_Execution_Plan.md#task-e3) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L125](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L125) | E4 | Executable | [§C E4](TedixHunt_Master_Execution_Plan.md#task-e4) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L126](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L126) | E5 | Executable | [§C E5](TedixHunt_Master_Execution_Plan.md#task-e5) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L127](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L127) | E6 | Executable | [§C E6](TedixHunt_Master_Execution_Plan.md#task-e6) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L128](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L128) | E7 | Executable | [§C E7](TedixHunt_Master_Execution_Plan.md#task-e7) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L129](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L129) | E8 | Executable | [§C E8](TedixHunt_Master_Execution_Plan.md#task-e8) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L130](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L130) | E9 | Executable | [§C E9](TedixHunt_Master_Execution_Plan.md#task-e9) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L131](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L131) | E10 | Executable | [§C E10](TedixHunt_Master_Execution_Plan.md#task-e10) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L132](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L132) | E11 | Executable | [§C E11](TedixHunt_Master_Execution_Plan.md#task-e11) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L133](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L133) | E12 | Executable | [§C E12](TedixHunt_Master_Execution_Plan.md#task-e12) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L134](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L134) | E13 | Executable | [§C E13](TedixHunt_Master_Execution_Plan.md#task-e13) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L135](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L135) | E14 | Executable | [§C E14](TedixHunt_Master_Execution_Plan.md#task-e14) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L136](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L136) | E15 | Executable | [§C E15](TedixHunt_Master_Execution_Plan.md#task-e15) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L137](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L137) | E16 | Executable | [§C E16](TedixHunt_Master_Execution_Plan.md#task-e16) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L138](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L138) | E17 | Executable | [§C E17](TedixHunt_Master_Execution_Plan.md#task-e17) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L144](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L144) | F1 | Executable | [§C F1](TedixHunt_Master_Execution_Plan.md#task-f1) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L145](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L145) | F2 | Executable | [§C F2](TedixHunt_Master_Execution_Plan.md#task-f2) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L146](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L146) | F3 | Executable | [§C F3](TedixHunt_Master_Execution_Plan.md#task-f3) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L147](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L147) | F4 | Executable | [§C F4](TedixHunt_Master_Execution_Plan.md#task-f4) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L148](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L148) | F5 | Executable | [§C F5](TedixHunt_Master_Execution_Plan.md#task-f5) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L149](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L149) | F6 | Executable | [§C F6](TedixHunt_Master_Execution_Plan.md#task-f6) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L150](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L150) | F7 | Parent | [§C F7](TedixHunt_Master_Execution_Plan.md#task-f7) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L156](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L156) | G1 | Executable | [§C G1](TedixHunt_Master_Execution_Plan.md#task-g1) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L157](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L157) | G2 | Executable | [§C G2](TedixHunt_Master_Execution_Plan.md#task-g2) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L158](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L158) | G3 | Executable | [§C G3](TedixHunt_Master_Execution_Plan.md#task-g3) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L159](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L159) | G4 | Parent | [§C G4](TedixHunt_Master_Execution_Plan.md#task-g4) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L165](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L165) | H1 | Parent | [§C H1](TedixHunt_Master_Execution_Plan.md#task-h1) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L166](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L166) | H2 | Parent | [§C H2](TedixHunt_Master_Execution_Plan.md#task-h2) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L167](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L167) | H3 | Parent | [§C H3](TedixHunt_Master_Execution_Plan.md#task-h3) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L168](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L168) | H4 | Parent | [§C H4](TedixHunt_Master_Execution_Plan.md#task-h4) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L169](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L169) | H5 | Parent | [§C H5](TedixHunt_Master_Execution_Plan.md#task-h5) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L170](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L170) | H6 | Parent | [§C H6](TedixHunt_Master_Execution_Plan.md#task-h6) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L171](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L171) | H7 | Parent | [§C H7](TedixHunt_Master_Execution_Plan.md#task-h7) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L172](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L172) | H8 | Parent | [§C H8](TedixHunt_Master_Execution_Plan.md#task-h8) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L178](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L178) | I1 | Parent | [§C I1](TedixHunt_Master_Execution_Plan.md#task-i1) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L179](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L179) | I2 | Parent | [§C I2](TedixHunt_Master_Execution_Plan.md#task-i2) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L180](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L180) | I3 | Parent | [§C I3](TedixHunt_Master_Execution_Plan.md#task-i3) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L181](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L181) | I4 | Parent | [§C I4](TedixHunt_Master_Execution_Plan.md#task-i4) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L182](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L182) | I5 | Parent | [§C I5](TedixHunt_Master_Execution_Plan.md#task-i5) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L183](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L183) | I6 | Parent | [§C I6](TedixHunt_Master_Execution_Plan.md#task-i6) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L184](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L184) | I7 | Parent | [§C I7](TedixHunt_Master_Execution_Plan.md#task-i7) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L185](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L185) | I8 | Parent | [§C I8](TedixHunt_Master_Execution_Plan.md#task-i8) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L186](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L186) | I9 | Parent | [§C I9](TedixHunt_Master_Execution_Plan.md#task-i9) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L187](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L187) | I10 | Parent | [§C I10](TedixHunt_Master_Execution_Plan.md#task-i10) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L188](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L188) | I11 | Parent | [§C I11](TedixHunt_Master_Execution_Plan.md#task-i11) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L189](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L189) | I12 | Parent | [§C I12](TedixHunt_Master_Execution_Plan.md#task-i12) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L190](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L190) | I13 | Parent | [§C I13](TedixHunt_Master_Execution_Plan.md#task-i13) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L191](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L191) | I14 | Parent | [§C I14](TedixHunt_Master_Execution_Plan.md#task-i14) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L197](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L197) | J1 | Parent | [§C J1](TedixHunt_Master_Execution_Plan.md#task-j1) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L198](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L198) | J2 | Parent | [§C J2](TedixHunt_Master_Execution_Plan.md#task-j2) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L199](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L199) | J3 | Parent | [§C J3](TedixHunt_Master_Execution_Plan.md#task-j3) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L200](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L200) | J4 | Parent | [§C J4](TedixHunt_Master_Execution_Plan.md#task-j4) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L201](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L201) | J5 | Parent | [§C J5](TedixHunt_Master_Execution_Plan.md#task-j5) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L202](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L202) | J6 | Parent | [§C J6](TedixHunt_Master_Execution_Plan.md#task-j6) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L203](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L203) | J7 | Parent | [§C J7](TedixHunt_Master_Execution_Plan.md#task-j7) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L204](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L204) | J8 | Parent | [§C J8](TedixHunt_Master_Execution_Plan.md#task-j8) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L205](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L205) | J9 | Parent | [§C J9](TedixHunt_Master_Execution_Plan.md#task-j9) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L211](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L211) | K1 | Parent | [§C K1](TedixHunt_Master_Execution_Plan.md#task-k1) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L212](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L212) | K2 | Parent | [§C K2](TedixHunt_Master_Execution_Plan.md#task-k2) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L213](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L213) | K3 | Parent | [§C K3](TedixHunt_Master_Execution_Plan.md#task-k3) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L214](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L214) | K4 | Parent | [§C K4](TedixHunt_Master_Execution_Plan.md#task-k4) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L215](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L215) | K5 | Parent | [§C K5](TedixHunt_Master_Execution_Plan.md#task-k5) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L216](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L216) | K6 | Parent | [§C K6](TedixHunt_Master_Execution_Plan.md#task-k6) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L222](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L222) | L1 | Parent | [§C L1](TedixHunt_Master_Execution_Plan.md#task-l1) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L223](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L223) | L2 | Parent | [§C L2](TedixHunt_Master_Execution_Plan.md#task-l2) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L224](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L224) | L3 | Parent | [§C L3](TedixHunt_Master_Execution_Plan.md#task-l3) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L225](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L225) | L4 | Parent | [§C L4](TedixHunt_Master_Execution_Plan.md#task-l4) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L226](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L226) | L5 | Parent | [§C L5](TedixHunt_Master_Execution_Plan.md#task-l5) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L227](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L227) | L6 | Parent | [§C L6](TedixHunt_Master_Execution_Plan.md#task-l6) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L233](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L233) | M1 | Parent | [§C M1](TedixHunt_Master_Execution_Plan.md#task-m1) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L234](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L234) | M2 | Parent | [§C M2](TedixHunt_Master_Execution_Plan.md#task-m2) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L235](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L235) | M3 | Parent | [§C M3](TedixHunt_Master_Execution_Plan.md#task-m3) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L236](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L236) | M4 | Parent | [§C M4](TedixHunt_Master_Execution_Plan.md#task-m4) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L237](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L237) | M5 | Parent | [§C M5](TedixHunt_Master_Execution_Plan.md#task-m5) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L243](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L243) | N1 | Parent | [§C N1](TedixHunt_Master_Execution_Plan.md#task-n1) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L244](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L244) | N2 | Parent | [§C N2](TedixHunt_Master_Execution_Plan.md#task-n2) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L245](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L245) | N3 | Parent | [§C N3](TedixHunt_Master_Execution_Plan.md#task-n3) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L246](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L246) | N4 | Parent | [§C N4](TedixHunt_Master_Execution_Plan.md#task-n4) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L247](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L247) | N5 | Parent | [§C N5](TedixHunt_Master_Execution_Plan.md#task-n5) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Master §4 L248](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Master_Implementation_Control_Plan_v3.md#L248) | N6 | Parent | [§C N6](TedixHunt_Master_Execution_Plan.md#task-n6) | Compact record → exact fields below; original label/action/priority/qualification preserved |
| [Matrix §1 + §2 L37, 79](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L37) | F7-FE-01 | Expanded execution entry | [§C F7-FE-01](TedixHunt_Master_Execution_Plan.md#task-f7-fe-01) | Both keyed rows joined; F7-FE-01 corrected from actual merge evidence |
| [Matrix §1 + §2 L38, 80](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L38) | F7-FE-02 | Expanded execution entry | [§C F7-FE-02](TedixHunt_Master_Execution_Plan.md#task-f7-fe-02) | Every cell preserved |
| [Matrix §1 + §2 L39, 81](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L39) | F7-FE-03 | Expanded execution entry | [§C F7-FE-03](TedixHunt_Master_Execution_Plan.md#task-f7-fe-03) | Every cell preserved |
| [Matrix §1 + §2 L40, 82](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L40) | F7-FE-04 | Expanded execution entry | [§C F7-FE-04](TedixHunt_Master_Execution_Plan.md#task-f7-fe-04) | Every cell preserved |
| [Matrix §1 + §2 L41, 83](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L41) | F7-FE-05 | Expanded execution entry | [§C F7-FE-05](TedixHunt_Master_Execution_Plan.md#task-f7-fe-05) | Every cell preserved |
| [Matrix §1 + §2 L42, 84](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L42) | F7-FE-06 | Expanded execution entry | [§C F7-FE-06](TedixHunt_Master_Execution_Plan.md#task-f7-fe-06) | Every cell preserved |
| [Matrix §1 + §2 L43, 85](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L43) | F7-FE-07 | Expanded execution entry | [§C F7-FE-07](TedixHunt_Master_Execution_Plan.md#task-f7-fe-07) | Every cell preserved |
| [Matrix §1 + §2 L44, 86](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L44) | F7-FE-08 | Expanded execution entry | [§C F7-FE-08](TedixHunt_Master_Execution_Plan.md#task-f7-fe-08) | Every cell preserved |
| [Matrix §1 + §2 L45, 87](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L45) | F7-FE-09 | Expanded execution entry | [§C F7-FE-09](TedixHunt_Master_Execution_Plan.md#task-f7-fe-09) | Every cell preserved |
| [Matrix §1 + §2 L46, 88](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L46) | F7-FE-10 | Expanded execution entry | [§C F7-FE-10](TedixHunt_Master_Execution_Plan.md#task-f7-fe-10) | Every cell preserved |
| [Matrix §1 + §2 L47, 89](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L47) | F7-FE-11 | Expanded execution entry | [§C F7-FE-11](TedixHunt_Master_Execution_Plan.md#task-f7-fe-11) | Every cell preserved |
| [Matrix §1 + §2 L48, 90](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L48) | F7-FE-12 | Expanded execution entry | [§C F7-FE-12](TedixHunt_Master_Execution_Plan.md#task-f7-fe-12) | Every cell preserved |
| [Matrix §1 + §2 L49, 91](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L49) | F7-FE-13 | Expanded execution entry | [§C F7-FE-13](TedixHunt_Master_Execution_Plan.md#task-f7-fe-13) | Every cell preserved |
| [Matrix §1 + §2 L50, 92](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L50) | G4-FE-01 | Expanded execution entry | [§C G4-FE-01](TedixHunt_Master_Execution_Plan.md#task-g4-fe-01) | Every cell preserved |
| [Matrix §1 + §2 L51, 93](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L51) | G4-FE-02 | Expanded execution entry | [§C G4-FE-02](TedixHunt_Master_Execution_Plan.md#task-g4-fe-02) | Every cell preserved |
| [Matrix §1 + §2 L52, 94](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L52) | G4-FE-03 | Expanded execution entry | [§C G4-FE-03](TedixHunt_Master_Execution_Plan.md#task-g4-fe-03) | Every cell preserved |
| [Matrix §1 + §2 L53, 95](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L53) | G4-FE-04 | Expanded execution entry | [§C G4-FE-04](TedixHunt_Master_Execution_Plan.md#task-g4-fe-04) | Every cell preserved |
| [Matrix §1 + §2 L54, 96](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L54) | G4-FE-05 | Expanded execution entry | [§C G4-FE-05](TedixHunt_Master_Execution_Plan.md#task-g4-fe-05) | Every cell preserved |
| [Matrix §1 + §2 L55, 97](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L55) | G4-DEC-01 | Expanded execution entry | [§C G4-DEC-01](TedixHunt_Master_Execution_Plan.md#task-g4-dec-01) | Every cell preserved |
| [Matrix §1 + §2 L56, 98](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L56) | G4-BE-01 | Expanded execution entry | [§C G4-BE-01](TedixHunt_Master_Execution_Plan.md#task-g4-be-01) | Every cell preserved |
| [Matrix §1 + §2 L57, 99](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L57) | G4-BE-02 | Expanded execution entry | [§C G4-BE-02](TedixHunt_Master_Execution_Plan.md#task-g4-be-02) | Every cell preserved |
| [Matrix §1 + §2 L58, 100](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L58) | G4-BE-03 | Expanded execution entry | [§C G4-BE-03](TedixHunt_Master_Execution_Plan.md#task-g4-be-03) | Every cell preserved |
| [Matrix §1 + §2 L59, 101](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L59) | G4-FE-06 | Expanded execution entry | [§C G4-FE-06](TedixHunt_Master_Execution_Plan.md#task-g4-fe-06) | Every cell preserved |
| [Matrix §1 + §2 L60, 102](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L60) | G4-FE-07 | Expanded execution entry | [§C G4-FE-07](TedixHunt_Master_Execution_Plan.md#task-g4-fe-07) | Every cell preserved |
| [Matrix §1 + §2 L61, 103](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L61) | D10-GATE | Expanded execution entry | [§C D10-GATE](TedixHunt_Master_Execution_Plan.md#task-d10-gate) | Every cell preserved |
| [Matrix §1 + §2 L62, 104](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L62) | D10-FE-01 | Expanded execution entry | [§C D10-FE-01](TedixHunt_Master_Execution_Plan.md#task-d10-fe-01) | Every cell preserved |
| [Matrix §1 + §2 L63, 105](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L63) | D10-FE-02 | Expanded execution entry | [§C D10-FE-02](TedixHunt_Master_Execution_Plan.md#task-d10-fe-02) | Every cell preserved |
| [Matrix §1 + §2 L64, 106](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L64) | D10-FE-03 | Expanded execution entry | [§C D10-FE-03](TedixHunt_Master_Execution_Plan.md#task-d10-fe-03) | Every cell preserved |
| [Matrix §1 + §2 L65, 107](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L65) | D10-FE-04 | Expanded execution entry | [§C D10-FE-04](TedixHunt_Master_Execution_Plan.md#task-d10-fe-04) | Every cell preserved |
| [Matrix §1 + §2 L66, 108](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L66) | D10-FE-05 | Expanded execution entry | [§C D10-FE-05](TedixHunt_Master_Execution_Plan.md#task-d10-fe-05) | Every cell preserved |
| [Matrix §1 + §2 L67, 109](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L67) | D10-FE-06 | Expanded execution entry | [§C D10-FE-06](TedixHunt_Master_Execution_Plan.md#task-d10-fe-06) | Every cell preserved |
| [Matrix §1 + §2 L68, 110](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L68) | D10-FE-07 | Expanded execution entry | [§C D10-FE-07](TedixHunt_Master_Execution_Plan.md#task-d10-fe-07) | Every cell preserved |
| [Matrix §1 + §2 L69, 111](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L69) | D10-FE-08 | Expanded execution entry | [§C D10-FE-08](TedixHunt_Master_Execution_Plan.md#task-d10-fe-08) | Every cell preserved |
| [Matrix §1 + §2 L70, 112](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L70) | D10-E2E-01 | Expanded execution entry | [§C D10-E2E-01](TedixHunt_Master_Execution_Plan.md#task-d10-e2e-01) | Every cell preserved |
| [Matrix §1 + §2 L71, 113](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L71) | D10-E2E-02 | Expanded execution entry | [§C D10-E2E-02](TedixHunt_Master_Execution_Plan.md#task-d10-e2e-02) | Every cell preserved |
| [Matrix §4 L142](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L142) | H1-VERIFY-1 | Bounded container entry | [§C H1-VERIFY-1](TedixHunt_Master_Execution_Plan.md#task-h1-verify-1) | Exact parent scope, next action, acceptance and blocking effect preserved |
| [Matrix §4 L143](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L143) | H2-EXEC-1 | Bounded container entry | [§C H2-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-h2-exec-1) | Exact parent scope, next action, acceptance and blocking effect preserved |
| [Matrix §4 L144](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L144) | H4-EXEC-1 | Bounded container entry | [§C H4-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-h4-exec-1) | Exact parent scope, next action, acceptance and blocking effect preserved |
| [Matrix §4 L145](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L145) | H5-EXEC-1 | Bounded container entry | [§C H5-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-h5-exec-1) | Exact parent scope, next action, acceptance and blocking effect preserved |
| [Matrix §4 L146](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L146) | H8-EXEC-1 | Bounded container entry | [§C H8-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-h8-exec-1) | Exact parent scope, next action, acceptance and blocking effect preserved |
| [Matrix §4 L147](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L147) | I1-EXEC-1 | Bounded container entry | [§C I1-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-i1-exec-1) | Exact parent scope, next action, acceptance and blocking effect preserved |
| [Matrix §4 L148](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L148) | I5-EXEC-1 | Bounded container entry | [§C I5-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-i5-exec-1) | Exact parent scope, next action, acceptance and blocking effect preserved |
| [Matrix §4 L149](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L149) | I7-EXEC-1 | Bounded container entry | [§C I7-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-i7-exec-1) | Exact parent scope, next action, acceptance and blocking effect preserved |
| [Matrix §4 L150](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L150) | I11-EXEC-1 | Bounded container entry | [§C I11-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-i11-exec-1) | Exact parent scope, next action, acceptance and blocking effect preserved |
| [Matrix §4 L151](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L151) | I12-EXEC-1 | Bounded container entry | [§C I12-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-i12-exec-1) | Exact parent scope, next action, acceptance and blocking effect preserved |
| [Matrix §4 L152](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L152) | I13-EXEC-1 | Bounded container entry | [§C I13-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-i13-exec-1) | Exact parent scope, next action, acceptance and blocking effect preserved |
| [Matrix §4 L153](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L153) | I10-EXEC-1 | Bounded container entry | [§C I10-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-i10-exec-1) | Exact parent scope, next action, acceptance and blocking effect preserved |
| [Matrix §4 L154](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L154) | I14-DEC-1 | Bounded container entry | [§C I14-DEC-1](TedixHunt_Master_Execution_Plan.md#task-i14-dec-1) | Exact parent scope, next action, acceptance and blocking effect preserved |
| [Matrix §4 L155](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L155) | J1-EXEC-1 | Bounded container entry | [§C J1-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-j1-exec-1) | Exact parent scope, next action, acceptance and blocking effect preserved |
| [Matrix §4 L156](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L156) | J5-EXEC-1 | Bounded container entry | [§C J5-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-j5-exec-1) | Exact parent scope, next action, acceptance and blocking effect preserved |
| [Matrix §4 L157](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L157) | J9-DEC-1 | Bounded container entry | [§C J9-DEC-1](TedixHunt_Master_Execution_Plan.md#task-j9-dec-1) | Exact parent scope, next action, acceptance and blocking effect preserved |
| [Matrix §4 L158](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L158) | K1-EXEC-1 | Bounded container entry | [§C K1-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-k1-exec-1) | Exact parent scope, next action, acceptance and blocking effect preserved |
| [Matrix §4 L159](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L159) | K4-DEC-1 | Bounded container entry | [§C K4-DEC-1](TedixHunt_Master_Execution_Plan.md#task-k4-dec-1) | Exact parent scope, next action, acceptance and blocking effect preserved |
| [Matrix §4 L160](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L160) | L1-VERIFY-1 | Bounded container entry | [§C L1-VERIFY-1](TedixHunt_Master_Execution_Plan.md#task-l1-verify-1) | Exact parent scope, next action, acceptance and blocking effect preserved |
| [Matrix §4 L161](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L161) | L2-EXEC-1 | Bounded container entry | [§C L2-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-l2-exec-1) | Exact parent scope, next action, acceptance and blocking effect preserved |
| [Matrix §4 L162](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L162) | L4-DEC-1 | Bounded container entry | [§C L4-DEC-1](TedixHunt_Master_Execution_Plan.md#task-l4-dec-1) | Exact parent scope, next action, acceptance and blocking effect preserved |
| [Matrix §4 L163](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L163) | M1-DEC-1 | Bounded container entry | [§C M1-DEC-1](TedixHunt_Master_Execution_Plan.md#task-m1-dec-1) | Exact parent scope, next action, acceptance and blocking effect preserved |
| [Matrix §4 L164](https://github.com/tedixdev-arch/Tedix_Hunt_FE/blob/ab54a3e0c776ed8843a2ae5d103f6313677aab2b/docs/TedixHunt_Execution_Dependency_Matrix.md#L164) | N1-DEC-1 | Bounded container entry | [§C N1-DEC-1](TedixHunt_Master_Execution_Plan.md#task-n1-dec-1) | Exact parent scope, next action, acceptance and blocking effect preserved |
| Master §6 remaining scope | C6b-2 | Existing provider task | [§C C6b-2](TedixHunt_Master_Execution_Plan.md#task-c6b-2) | Exact licensing blocker preserved; no unblocking |

## Delivery boundary

Changed paths: new `docs/TedixHunt_Master_Execution_Plan.md`, new `docs/TedixHunt_Execution_Plan_Reconciliation.md`, and additive supersession notices in the two original planning documents. No application code changed. Architecture and reports remain unchanged. No F7-FE-02 implementation, new API, Mapbox entitlement decision, D10 bypass, merge or deployment.

**Draft for ChatGPT review. Stop after this documentation PR.**

## Shared requirements and decision details

Requirements retained from the matrix at the pinned source revision. These constrain the linked operational tasks; dated status observations are audit context only. The operational plan is the current status authority. No archived next-task instruction is imported here.


### Requirement source: Verified implementation boundary

Pinned FE main: `fc43d2040700e44df0db9e5481f95964f597e6be` (FE #121). Pinned BE main: `bcf1fda4153cc8ea787c4d7e5922f4cb4b34ee32` (BE #89). GitHub recursive trees and PR merge metadata were read; local checkout is older and is not the source of current status. No AGENTS.md was present in either pinned tree. Shell git fetch/clone failed at the configured proxy; authenticated GitHub connector reads are the source of current evidence.

Creator inspection: `src/pages/CreatorStudio.tsx`, `src/features/creator/TemplateCreationChooser.tsx`, `checkpointGameplay.ts`, `src/services/api/creatorTemplates.ts`. Existing owned list, draft creation/save/submit, shared gameplay/geography/FinishPoint authoring and starter chooser are reusable. The current `configuration.category` subject field (Mathematics etc.) is **not** identity `category: universal|local`. The API client omits classified create/binding/library/copy projections. Studio makes every non-draft read-only and says revision is unavailable; backend classified revisions now exist. Current generic route/safety readiness UI cannot simply be reused as Universal submission requirements. F7 is partial, not complete.

Admin inspection: `src/pages/AdminConsole.tsx`, `src/pages/AdminTemplateReviews.tsx`, `src/services/api/adminTemplateReviews.ts`, BE `src/routes/adminTemplateReviews.ts`, `adminTemplateEligibility.ts`, `localityProposals.ts` and `src/models/HuntTemplate.ts`. Generic exact inspection exists, but FE approve/requestChanges sends no version body; classified C5/C6b-5 decisions require the inspected `{version}`. Category review, continuity/suspension projections and proposal review need FE slices. Request-changes currently persists a decision, not narrative feedback; no feedback text API is promised here. No complete route evidence, expiry/re-review or operating-condition enforcement was found in C7; do not represent its integrity eligibility as physical route safety.

Organizer inspection: `src/pages/OrganizerSetupFlow.tsx`, `CustomHuntEditor.tsx`, `generalSetup.ts`, merged [D10 readiness report](D10_Organizer_Integration_Readiness_Report.md). Existing draft-first builder and settings persist through HuntsApi/legacy templateKey selection. Reuse that builder and geographic preview components after the integration gate is satisfied. FE #121 adds a report only.

Backend evidence includes C1–C5/C6b reports/contracts, C7 contract/report, Creator/Universal/geography/proposal/Admin/Organizer/Hunt routes, `PublishedUniversal.ts`, `HuntTemplate.ts`, `OrganizerLocalTemplate.ts`, migration 028, binding/Local-approval/C7 PostgreSQL test assertions and `app.ts`. C7 mounts exact discovery/detail/selection, server snapshots and concurrency/authorization protections. **Complete — merged/source verified** applies to those bounded BE foundations, not full F7/G4/D10. Reported C7 tests: 89 C7 tests, 248 focused tests in 8 files, 1,255 complete-suite tests in 60 files; all zero failures/skips, typecheck/build passed. Totals overlap. They were reported by BE #89/report, not executed here; CI/deployment/E2E success is not inferred.


### Requirement source: Capability boundary and first task prerequisites

Historical status qualifier in this source paragraph is superseded by merged FE #123; supported-authoring requirements remain unchanged.

**F7-FE-01 is ready** only within the existing read-only supported-authoring boundary. BE `src/domain/checkpointGameplay.ts` derives allowed `kind`, `teamKind`, `navigationMode` from canonical Signal v1; FE `checkpointGameplay.ts` uses the matching Signal vocabulary, hydrates/serializes immutable content and existing gameplay editors configure it. C2 validates those types. Existing count bounds are 1–20 normal checkpoints with separate terminal authoring. This is evidence of supported configuration, not authoritative Participant runtime, new arbitrary mechanics, mode compatibility declarations or five-minute recovery implementation.

F7-FE-01 must explain authoring/preview availability versus planned runtime for Personal/Team Challenges, hints/scoring/progression, GPS arrival and FinishPoint. Do not advertise later Shadows/Shields, variable-team compatibility or executable custom components as configurable merely because architecture mentions them. If implementing a new control needs an unagreed configuration/availability contract, stop that control and record a decision; the read-only guidance/navigation slice does not create one. Four entries may reach truthful staged destinations until creation slices are delivered. That bounded result does not satisfy full F1/F7 acceptance or unlock D10.


### Requirement source: Matrix conventions and closure requirements

The two linked tables below form one matrix keyed by unique ID. Table 1 gives deliverable, current stable status and prerequisites; Table 2 gives acceptance, tests, proposed PR scope and blocking effect. Phase/workstream is explicit. All statuses are as of the pinned review. `Ready for implementation` means prerequisites for that slice are verified; `Not started` means no implementation of its deliverable found and named predecessor work remains. `Blocked` denotes an explicit architectural/contract/decision gate. Decision rows do not authorize code.

Every implementation row also requires **CLOSE-1**: required functionality in its acceptance cell; the named behavioral/API/integration tests; persisted-role, owner or Hunt-scope authorization checks as applicable, including denied/revoked/guest actors and no private-data leakage; relevant legacy category-null, Signal starter, exact review, immutable-version/copy/Hunt-snapshot regressions; applicable FE typecheck/build and focused test results with failures/skips disclosed; updated API/UX/limitation documentation and master register; PR URL/merge SHA, source refs, test commands/results and review evidence. Failure cases must preserve user input and must not report success before server commit. Loading, empty, retry, out-of-order response and 400/401/403/404/409 behavior belongs in each affected slice, not deferred entirely to a test-only PR. No UI role check substitutes for server authority. No new runtime tests or migrations are part of this documentation PR.

Decision rows close with a reviewed written decision and examples, not application tests. Future BE implementation rows require disposable DB/API/transaction tests in addition to CLOSE-1. Integration acceptance records exact identities/roles, artifacts and outcomes; deployment acceptance additionally records actual environment/date/FE+BE revisions/migrations/provider/device cases. Never infer any level from a contract, mockup, migration, endpoint or neighboring layer.

Track five independent fields for each row when work starts: **contract/decision; backend; frontend; integrated workflow; deployed E2E**. Initial field values: existing referenced C1–C7 contract/backend foundations are complete at merged-source level; no new FE row below is complete; integrated and deployed acceptance are unverified. New governance contract/backend fields are missing or decision-dependent. F7-FE-01 needs no new BE contract. Decision rows have FE/BE fields not applicable until their scope is approved. Mark `Complete — merged/source verified` only after the exact slice is merged and its source/tests verified; use `Complete — deployed/E2E verified` only with actual deployed evidence. Keep source completion after failed deployment and record deployment separately.


### Requirement source: 1. Deliverables and prerequisites



### Requirement source: 2. Acceptance, tests, closure evidence and PR boundaries

CLOSE-1 applies to every implementation row; the tests cell adds task-specific evidence. Each ordinary FE row is one proposed bounded Draft PR. Governance rows explicitly marked as containers require approved contracts and then subordinate PR-sized execution children before coding; they are not authorization for a broad implementation PR. No implementation starts in this documentation PR.



### Requirement source: 3. Dependency order and decisions

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


### Requirement source: 4. Remaining H–N execution audit

All original A–N IDs, labels, actions, order and G0–G6 rows remain in Master §4. No task was found unmappable to the architecture's named phase/task sections, including B1.1. `C1–C7` in backend foundation reports are **F7 subordinate backend slices**, not Phase C1–C4 Hunt-domain tasks; gate **G4 — Variable teams** is not task **G4 — Separate Universal/Local governance**. Likewise architecture Mapbox **M4/M5/M6** are map-stage labels, not Phase M1–M5 long-term-profile IDs. Those namespace collisions must never close unrelated tasks.

Current BE app.ts mounts no authoritative enrollment/team/readiness/start/recovery, answer/progress/score/FinishPoint, live incident or result runtime. Existing membership models, FE readiness/gameplay/monitor/results prototypes and Users & Roles controls are foundations only. No new merged H–N runtime was found in the pinned source/tree. H1 code lookup remains a bounded source-complete foundation; the rest retain §4 statuses. This audit is source/route-surface verification, not a claim to have rerun every historical acceptance suite.

The following subordinate IDs make broad register entries executable without promoting deferred features. Each row is a sequence container; its `.1` is the next bounded contract/verification task when prerequisites clear. Define additional immutable-storage/API/UI PR children during its approved contract, not by silently widening the parent. CLOSE-1 applies to future implementation children; decision/contract `.1` closes on reviewed contract/examples, scoped API/storage/authorization/race tests and explicit follow-on slices, not on an implemented endpoint. Execution order follows architecture §20.3's staged Solo A → two-account Team B → variable Team C proof; minimum live safety J and results K accompany each live stage rather than waiting until the end of all gameplay.


All H–N parents remain individually traceable in Master §4 even when a container spans related tasks. No deferred I14/J9/K4–K6/M–N is silently required for the first pilot. L4/L5 remain original not-started tasks, not reclassified as delivered or formally deferred by their decision child. The content supply-chain prerequisite and explicit P1 approval for a parallel legacy pilot are preserved.

## Frozen per-record preservation details

Snapshot from PR #124 pre-correction head `6d19d87335535d25c9109cdde13c6d3bafa36581`. These are preservation records for the compact register's linked requirements and audit of this simplification, not a second operational task manager. Fields retain exact wording, dimensions, parent/phase links, dependencies, evidence, acceptance/tests/PR boundaries and blockers. Only §C of the Master Execution Plan holds current execution status. Old section labels within these snapshots refer to the previous layout: historical phase evidence is at archived Master §9, decision/closure constraints are above, and architecture section references are unchanged.

<a id="detail-a1"></a>

### Preservation detail — A1

- **Task ID:** A1
- **Parent / Phase:** A — Platform foundation; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Deployment topology and verification; exact architecture scope retained
- **Dependencies:** [A1. Deployment topology and verification](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — deployment diagnostics exist; rollback/backup and current deployment verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for A; original qualification: Partially implemented — deployment diagnostics exist; rollback/backup and current deployment verification pending (§9).
- **Acceptance:** Full A1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-a2"></a>

### Preservation detail — A2

- **Task ID:** A2
- **Parent / Phase:** A — Platform foundation; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** PostgreSQL migration foundation; exact architecture scope retained
- **Dependencies:** [A2. PostgreSQL migration foundation](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for A; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full A2 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-a3"></a>

### Preservation detail — A3

- **Task ID:** A3
- **Parent / Phase:** A — Platform foundation; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** User normalization and compatibility; exact architecture scope retained
- **Dependencies:** [A3. User normalization and compatibility](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for A; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full A3 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-a4"></a>

### Preservation detail — A4

- **Task ID:** A4
- **Parent / Phase:** A — Platform foundation; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Core authentication; exact architecture scope retained
- **Dependencies:** [A4. Core authentication](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for A; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full A4 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair (security).
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-a5"></a>

### Preservation detail — A5

- **Task ID:** A5
- **Parent / Phase:** A — Platform foundation; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Frontend API/session layer; exact architecture scope retained
- **Dependencies:** [A5. Frontend API/session layer](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for A; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full A5 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-a6"></a>

### Preservation detail — A6

- **Task ID:** A6
- **Parent / Phase:** A — Platform foundation; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Existing real login flows; exact architecture scope retained
- **Dependencies:** [A6. Existing real login flows](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for A; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full A6 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-b1"></a>

### Preservation detail — B1

- **Task ID:** B1
- **Parent / Phase:** B — Identity and authorization; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Multi-role identity; exact architecture scope retained
- **Dependencies:** [B1. Multi-role identity](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for B; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full B1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-b1-1"></a>

### Preservation detail — B1.1

- **Task ID:** B1.1
- **Parent / Phase:** B — Identity and authorization; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Workspace/context model; exact architecture scope retained
- **Dependencies:** [B1.1 Workspace/context model](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for B; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full B1.1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-b2"></a>

### Preservation detail — B2

- **Task ID:** B2
- **Parent / Phase:** B — Identity and authorization; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Backend role authorization; exact architecture scope retained
- **Dependencies:** [B2. Backend role authorization](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for B; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full B2 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair (security).
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-b3"></a>

### Preservation detail — B3

- **Task ID:** B3
- **Parent / Phase:** B — Identity and authorization; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Frontend role guards; exact architecture scope retained
- **Dependencies:** [B3. Frontend role guards](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for B; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full B3 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-b4"></a>

### Preservation detail — B4

- **Task ID:** B4
- **Parent / Phase:** B — Identity and authorization; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Organizations and membership; exact architecture scope retained
- **Dependencies:** [B4. Organizations and membership](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for B; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full B4 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-b5"></a>

### Preservation detail — B5

- **Task ID:** B5
- **Parent / Phase:** B — Identity and authorization; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Hunt-context roles; exact architecture scope retained
- **Dependencies:** [B5. Hunt-context roles](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for B; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full B5 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-b6"></a>

### Preservation detail — B6

- **Task ID:** B6
- **Parent / Phase:** B — Identity and authorization; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Effective Hunt authority; exact architecture scope retained
- **Dependencies:** [B6. Effective Hunt authority — Mapbox M3 domain prerequisite](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for B; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full B6 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-c1"></a>

### Preservation detail — C1

- **Task ID:** C1
- **Parent / Phase:** C — Hunt domain; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Core Hunt records; exact architecture scope retained
- **Dependencies:** [C1. Core Hunt records](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for C; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full C1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-c2"></a>

### Preservation detail — C2

- **Task ID:** C2
- **Parent / Phase:** C — Hunt domain; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Hunt lifecycle; exact architecture scope retained
- **Dependencies:** [C2. Hunt lifecycle](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for C; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full C2 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-c3"></a>

### Preservation detail — C3

- **Task ID:** C3
- **Parent / Phase:** C — Hunt domain; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Organizer Hunt list; exact architecture scope retained
- **Dependencies:** [C3. Organizer Hunt list](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for C; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full C3 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-c4"></a>

### Preservation detail — C4

- **Task ID:** C4
- **Parent / Phase:** C — Hunt domain; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Publish-readiness authority; exact architecture scope retained
- **Dependencies:** [C4. Publish-readiness authority](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for C; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full C4 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-d1"></a>

### Preservation detail — D1

- **Task ID:** D1
- **Parent / Phase:** D — Organizer setup; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** General Setup; exact architecture scope retained
- **Dependencies:** [D1. General Setup](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for D; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full D1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-d2"></a>

### Preservation detail — D2

- **Task ID:** D2
- **Parent / Phase:** D — Organizer setup; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Template selection and snapshot; exact architecture scope retained
- **Dependencies:** [D2. Template selection + snapshot](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for D; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full D2 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-d3"></a>

### Preservation detail — D3

- **Task ID:** D3
- **Parent / Phase:** D — Organizer setup; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Supported pilot options; exact architecture scope retained
- **Dependencies:** [D3. Supported pilot options](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for D; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full D3 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-d4"></a>

### Preservation detail — D4

- **Task ID:** D4
- **Parent / Phase:** D — Organizer setup; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Rewards configuration; exact architecture scope retained
- **Dependencies:** [D4. Rewards configuration](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for D; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full D4 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-d5"></a>

### Preservation detail — D5

- **Task ID:** D5
- **Parent / Phase:** D — Organizer setup; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Review; exact architecture scope retained
- **Dependencies:** [D5. Review](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for D; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full D5 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-d6"></a>

### Preservation detail — D6

- **Task ID:** D6
- **Parent / Phase:** D — Organizer setup; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Publish; exact architecture scope retained
- **Dependencies:** [D6. Publish](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for D; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full D6 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-d7"></a>

### Preservation detail — D7

- **Task ID:** D7
- **Parent / Phase:** D — Organizer setup; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Access code/link; exact architecture scope retained
- **Dependencies:** [D7. Access code/link](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for D; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full D7 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-d8"></a>

### Preservation detail — D8

- **Task ID:** D8
- **Parent / Phase:** D — Organizer setup; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Organizer geographic preview; exact architecture scope retained
- **Dependencies:** [D8. Organizer geographic preview — Mapbox M2](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for D; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full D8 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-d9"></a>

### Preservation detail — D9

- **Task ID:** D9
- **Parent / Phase:** D — Organizer setup; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Allocate Supervisors; exact architecture scope retained
- **Dependencies:** [D9. Allocate Supervisors — Mapbox M3 frontend](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for D; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full D9 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-d10"></a>

### Preservation detail — D10

- **Task ID:** D10
- **Parent / Phase:** D — Organizer setup; Parent workstream; children: [D10-GATE](TedixHunt_Master_Execution_Plan.md#task-d10-gate), [D10-FE-01](TedixHunt_Master_Execution_Plan.md#task-d10-fe-01), [D10-FE-02](TedixHunt_Master_Execution_Plan.md#task-d10-fe-02), [D10-FE-03](TedixHunt_Master_Execution_Plan.md#task-d10-fe-03), [D10-FE-04](TedixHunt_Master_Execution_Plan.md#task-d10-fe-04), [D10-FE-05](TedixHunt_Master_Execution_Plan.md#task-d10-fe-05), [D10-FE-06](TedixHunt_Master_Execution_Plan.md#task-d10-fe-06), [D10-FE-07](TedixHunt_Master_Execution_Plan.md#task-d10-fe-07), [D10-FE-08](TedixHunt_Master_Execution_Plan.md#task-d10-fe-08), [D10-E2E-01](TedixHunt_Master_Execution_Plan.md#task-d10-e2e-01), [D10-E2E-02](TedixHunt_Master_Execution_Plan.md#task-d10-e2e-02)
- **Deliverable:** Map-first General Setup; exact architecture scope retained
- **Dependencies:** [D10. Organizer map-first General Setup — planned workstream](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Architecture dependency.
- **Status:** Aggregate only — Not started — FE absent; implementation blocked by §20.2 integration gates (FE #121), despite merged C7 BE #89. See D10-GATE. Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for D; original qualification: Not started — FE absent; implementation blocked by §20.2 integration gates (FE #121), despite merged C7 BE #89. See D10-GATE.
- **Acceptance:** Full D10 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build (separate track).
- **Blocker / Decision:** Retain original gate: Architecture dependency. §E decisions apply; no new priority or architecture decision.

<a id="detail-e1"></a>

### Preservation detail — E1

- **Task ID:** E1
- **Parent / Phase:** E — Professional accounts; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Organizer application; exact architecture scope retained
- **Dependencies:** [E1. Registered Organizer application](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full E1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-e2"></a>

### Preservation detail — E2

- **Task ID:** E2
- **Parent / Phase:** E — Professional accounts; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Organizer login; exact architecture scope retained
- **Dependencies:** [E2. Organizer login](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full E2 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-e3"></a>

### Preservation detail — E3

- **Task ID:** E3
- **Parent / Phase:** E — Professional accounts; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Organizer approval backend; exact architecture scope retained
- **Dependencies:** [E3. Organizer approval backend](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full E3 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-e4"></a>

### Preservation detail — E4

- **Task ID:** E4
- **Parent / Phase:** E — Professional accounts; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Organizer credential boundary; exact architecture scope retained
- **Dependencies:** [E4. Organizer credential and authorization boundary](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full E4 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair (security).
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-e5"></a>

### Preservation detail — E5

- **Task ID:** E5
- **Parent / Phase:** E — Professional accounts; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Admin backend login; exact architecture scope retained
- **Dependencies:** [E5. Real Admin backend login](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full E5 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-e6"></a>

### Preservation detail — E6

- **Task ID:** E6
- **Parent / Phase:** E — Professional accounts; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Bootstrap first Admin; exact architecture scope retained
- **Dependencies:** [E6. Bootstrap first Admin](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full E6 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-e7"></a>

### Preservation detail — E7

- **Task ID:** E7
- **Parent / Phase:** E — Professional accounts; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Admin frontend login; exact architecture scope retained
- **Dependencies:** [E7. Real Admin frontend login](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full E7 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-e8"></a>

### Preservation detail — E8

- **Task ID:** E8
- **Parent / Phase:** E — Professional accounts; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Protect Admin routes; exact architecture scope retained
- **Dependencies:** [E8. Protect Admin routes](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full E8 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-e9"></a>

### Preservation detail — E9

- **Task ID:** E9
- **Parent / Phase:** E — Professional accounts; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Admin account security; exact architecture scope retained
- **Dependencies:** [E9. Admin account security](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full E9 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair (security).
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-e10"></a>

### Preservation detail — E10

- **Task ID:** E10
- **Parent / Phase:** E — Professional accounts; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Additional Admin provisioning; exact architecture scope retained
- **Dependencies:** [E10. Additional Admin provisioning](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full E10 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-e11"></a>

### Preservation detail — E11

- **Task ID:** E11
- **Parent / Phase:** E — Professional accounts; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Organizer Applications Admin UI; exact architecture scope retained
- **Dependencies:** [E11. Organizer Applications Admin UI](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full E11 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-e12"></a>

### Preservation detail — E12

- **Task ID:** E12
- **Parent / Phase:** E — Professional accounts; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Organizer self-registration credentials; exact architecture scope retained
- **Dependencies:** [E12. Organizer self-registration credential lifecycle](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full E12 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-e13"></a>

### Preservation detail — E13

- **Task ID:** E13
- **Parent / Phase:** E — Professional accounts; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Organizer onboarding E2E; exact architecture scope retained
- **Dependencies:** [E13. Verify Organizer self-registration onboarding end-to-end](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — onboarding foundation exists; deployed onboarding E2E not verified (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for E; original qualification: Partially implemented — onboarding foundation exists; deployed onboarding E2E not verified (§9).
- **Acceptance:** Full E13 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-e14"></a>

### Preservation detail — E14

- **Task ID:** E14
- **Parent / Phase:** E — Professional accounts; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Creator provisioning; exact architecture scope retained
- **Dependencies:** [E14. Creator provisioning](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full E14 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-e15"></a>

### Preservation detail — E15

- **Task ID:** E15
- **Parent / Phase:** E — Professional accounts; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Creator activation; exact architecture scope retained
- **Dependencies:** [E15. Creator activation/account lifecycle](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full E15 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-e16"></a>

### Preservation detail — E16

- **Task ID:** E16
- **Parent / Phase:** E — Professional accounts; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Creator onboarding verification; exact architecture scope retained
- **Dependencies:** [E16. Admin-provisioned Creator onboarding verification](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — Creator onboarding foundation exists; deployed verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for E; original qualification: Partially implemented — Creator onboarding foundation exists; deployed verification pending (§9).
- **Acceptance:** Full E16 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-e17"></a>

### Preservation detail — E17

- **Task ID:** E17
- **Parent / Phase:** E — Professional accounts; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Creator self-registration/application; exact architecture scope retained
- **Dependencies:** [E17. Creator self-registration/application lifecycle](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for E; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full E17 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-f1"></a>

### Preservation detail — F1

- **Task ID:** F1
- **Parent / Phase:** F — Creator Templates; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Template hierarchy and Mechanics Library; exact architecture scope retained
- **Dependencies:** [F1. Authoritative Template hierarchy](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for F; original qualification: Partially implemented — existing foundation; full task verification pending (§9). FE #123 closes only F7-FE-01 navigation/guidance, not full F1 acceptance.
- **Acceptance:** Full F1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-f2"></a>

### Preservation detail — F2

- **Task ID:** F2
- **Parent / Phase:** F — Creator Templates; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Template persistence and immutable versions; exact architecture scope retained
- **Dependencies:** [F2. Creator Template persistence and immutable versioning](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for F; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full F2 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-f3"></a>

### Preservation detail — F3

- **Task ID:** F3
- **Parent / Phase:** F — Creator Templates; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Geographic checkpoint architecture; exact architecture scope retained
- **Dependencies:** [F3. Geographic checkpoint architecture](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for F; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full F3 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-f4"></a>

### Preservation detail — F4

- **Task ID:** F4
- **Parent / Phase:** F — Creator Templates; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Radius contract compatibility; exact architecture scope retained
- **Dependencies:** [F4. Radius contract compatibility — Mapbox M1a](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for F; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full F4 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-f5"></a>

### Preservation detail — F5

- **Task ID:** F5
- **Parent / Phase:** F — Creator Templates; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Shared map and Creator Map Editor; exact architecture scope retained
- **Dependencies:** [F5. Shared TedixMap and Creator Hunt Map Editor — Mapbox M1b](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for F; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full F5 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-f6"></a>

### Preservation detail — F6

- **Task ID:** F6
- **Parent / Phase:** F — Creator Templates; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** FinishPoint authoring and route validation; exact architecture scope retained
- **Dependencies:** [F6. FinishPoint configuration, route validation and Participant Preview — Mapbox M1c](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — authoring/route estimates/preview exist; deployed/provider/device verification pending; no runtime completion (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for F; original qualification: Partially implemented — authoring/route estimates/preview exist; deployed/provider/device verification pending; no runtime completion (§9).
- **Acceptance:** Full F6 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-f7"></a>

### Preservation detail — F7

- **Task ID:** F7
- **Parent / Phase:** F — Creator Templates; Parent workstream; children: [F7-FE-01](TedixHunt_Master_Execution_Plan.md#task-f7-fe-01), [F7-FE-02](TedixHunt_Master_Execution_Plan.md#task-f7-fe-02), [F7-FE-03](TedixHunt_Master_Execution_Plan.md#task-f7-fe-03), [F7-FE-04](TedixHunt_Master_Execution_Plan.md#task-f7-fe-04), [F7-FE-05](TedixHunt_Master_Execution_Plan.md#task-f7-fe-05), [F7-FE-06](TedixHunt_Master_Execution_Plan.md#task-f7-fe-06), [F7-FE-07](TedixHunt_Master_Execution_Plan.md#task-f7-fe-07), [F7-FE-08](TedixHunt_Master_Execution_Plan.md#task-f7-fe-08), [F7-FE-09](TedixHunt_Master_Execution_Plan.md#task-f7-fe-09), [F7-FE-10](TedixHunt_Master_Execution_Plan.md#task-f7-fe-10), [F7-FE-11](TedixHunt_Master_Execution_Plan.md#task-f7-fe-11), [F7-FE-12](TedixHunt_Master_Execution_Plan.md#task-f7-fe-12), [F7-FE-13](TedixHunt_Master_Execution_Plan.md#task-f7-fe-13)
- **Deliverable:** Universal/Local creation, community reuse and Country/Locality; exact architecture scope retained
- **Dependencies:** [F7. Universal/Local creation, reuse and Country/Locality — planned workstreams](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Architecture dependency.
- **Status:** Aggregate only — Partially implemented — BE C1–C5, C6b-1/3/4/5 foundations complete; C7 contract/backend complete at merged-source level (#88/#89); category/reuse/location FE and integrated chain pending (§6/§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for F; original qualification: Partially implemented — BE C1–C5, C6b-1/3/4/5 foundations complete; C7 contract/backend complete at merged-source level (#88/#89); category/reuse/location FE and integrated chain pending (§6/§9).
- **Acceptance:** Full F7 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build (separate track).
- **Blocker / Decision:** Retain original gate: Architecture dependency. §E decisions apply; no new priority or architecture decision.

<a id="detail-g1"></a>

### Preservation detail — G1

- **Task ID:** G1
- **Parent / Phase:** G — Admin Template governance; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Admin Template review; exact architecture scope retained
- **Dependencies:** [G1. Admin Template review](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for G; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full G1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-g2"></a>

### Preservation detail — G2

- **Task ID:** G2
- **Parent / Phase:** G — Admin Template governance; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Approved Template authority; exact architecture scope retained
- **Dependencies:** [G2. Organizer approved Template authority](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for G; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full G2 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-g3"></a>

### Preservation detail — G3

- **Task ID:** G3
- **Parent / Phase:** G — Admin Template governance; Original executable verification/build/decision entry; not a new slice
- **Deliverable:** Admin geographic preview; exact architecture scope retained
- **Dependencies:** [G3. Shared Admin geographic preview — Mapbox M2](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Foundation audit.
- **Status:** Outstanding verification: Not started; original foundation qualification retained: Partially implemented — existing foundation; full task verification pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for G; original qualification: Partially implemented — existing foundation; full task verification pending (§9).
- **Acceptance:** Full G3 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Foundation audit. §E decisions apply; no new priority or architecture decision.

<a id="detail-g4"></a>

### Preservation detail — G4

- **Task ID:** G4
- **Parent / Phase:** G — Admin Template governance; Parent workstream; children: [G4-FE-01](TedixHunt_Master_Execution_Plan.md#task-g4-fe-01), [G4-FE-02](TedixHunt_Master_Execution_Plan.md#task-g4-fe-02), [G4-FE-03](TedixHunt_Master_Execution_Plan.md#task-g4-fe-03), [G4-FE-04](TedixHunt_Master_Execution_Plan.md#task-g4-fe-04), [G4-FE-05](TedixHunt_Master_Execution_Plan.md#task-g4-fe-05), [G4-DEC-01](TedixHunt_Master_Execution_Plan.md#task-g4-dec-01), [G4-BE-01](TedixHunt_Master_Execution_Plan.md#task-g4-be-01), [G4-BE-02](TedixHunt_Master_Execution_Plan.md#task-g4-be-02), [G4-BE-03](TedixHunt_Master_Execution_Plan.md#task-g4-be-03), [G4-FE-06](TedixHunt_Master_Execution_Plan.md#task-g4-fe-06), [G4-FE-07](TedixHunt_Master_Execution_Plan.md#task-g4-fe-07)
- **Deliverable:** Separate Universal/Local governance; exact architecture scope retained
- **Dependencies:** [G4. Separate Universal/Local governance — planned extension](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Architecture dependency.
- **Status:** Aggregate only — Partially implemented — classified exact review, locality binding, Local continuity/suspension foundations complete; C7 backend complete (#89); category-specific Admin FE and full safety/evidence/validity incomplete (§6/§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for G; original qualification: Partially implemented — classified exact review, locality binding, Local continuity/suspension foundations complete; C7 backend complete (#89); category-specific Admin FE and full safety/evidence/validity incomplete (§6/§9).
- **Acceptance:** Full G4 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build (separate track).
- **Blocker / Decision:** Retain original gate: Architecture dependency. §E decisions apply; no new priority or architecture decision.

<a id="detail-h1"></a>

### Preservation detail — H1

- **Task ID:** H1
- **Parent / Phase:** H — Participant enrollment; Parent workstream; children: [H1-VERIFY-1](TedixHunt_Master_Execution_Plan.md#task-h1-verify-1)
- **Deliverable:** Resolve access code; exact architecture scope retained
- **Dependencies:** [H1. Resolve Hunt access code](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify.
- **Status:** Aggregate only — Complete — merged/source verified for public code resolution only; FE #17 / BE #24 (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for H; original qualification: Complete — merged/source verified for public code resolution only; FE #17 / BE #24 (§9). Public lookup source complete (FE #17 / BE #24); H1-VERIFY-1 is rollout re-verification, not missing lookup implementation.
- **Acceptance:** Full H1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision.

<a id="detail-h2"></a>

### Preservation detail — H2

- **Task ID:** H2
- **Parent / Phase:** H — Participant enrollment; Parent workstream; children: [H2-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-h2-exec-1)
- **Deliverable:** Persist Participant enrollment; exact architecture scope retained
- **Dependencies:** [H2. Participant enrollment](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Pilot critical.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for H; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full H2 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Pilot critical. §E decisions apply; no new priority or architecture decision.

<a id="detail-h3"></a>

### Preservation detail — H3

- **Task ID:** H3
- **Parent / Phase:** H — Participant enrollment; Parent workstream; children: [H2-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-h2-exec-1)
- **Deliverable:** Enrollment availability rules; exact architecture scope retained
- **Dependencies:** [H3. Enrollment availability rules](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for H; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full H3 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision.

<a id="detail-h4"></a>

### Preservation detail — H4

- **Task ID:** H4
- **Parent / Phase:** H — Participant enrollment; Parent workstream; children: [H4-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-h4-exec-1)
- **Deliverable:** Team creation/assignment; exact architecture scope retained
- **Dependencies:** [H4. Team creation/assignment](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for H; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full H4 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision.

<a id="detail-h5"></a>

### Preservation detail — H5

- **Task ID:** H5
- **Parent / Phase:** H — Participant enrollment; Parent workstream; children: [H5-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-h5-exec-1)
- **Deliverable:** Team lobby; exact architecture scope retained
- **Dependencies:** [H5. Team lobby](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for H; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full H5 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision.

<a id="detail-h6"></a>

### Preservation detail — H6

- **Task ID:** H6
- **Parent / Phase:** H — Participant enrollment; Parent workstream; children: [H5-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-h5-exec-1)
- **Deliverable:** Readiness; exact architecture scope retained
- **Dependencies:** [H6. Readiness](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for H; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full H6 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision.

<a id="detail-h7"></a>

### Preservation detail — H7

- **Task ID:** H7
- **Parent / Phase:** H — Participant enrollment; Parent workstream; children: [H5-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-h5-exec-1)
- **Deliverable:** Start gate; exact architecture scope retained
- **Dependencies:** [H7. Start gate](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for H; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full H7 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision.

<a id="detail-h8"></a>

### Preservation detail — H8

- **Task ID:** H8
- **Parent / Phase:** H — Participant enrollment; Parent workstream; children: [H8-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-h8-exec-1)
- **Deliverable:** Session recovery/reconnect; exact architecture scope retained
- **Dependencies:** [H8. Session recovery/reconnect](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for H; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full H8 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision.

<a id="detail-i1"></a>

### Preservation detail — I1

- **Task ID:** I1
- **Parent / Phase:** I — Checkpoint gameplay; Parent workstream; children: [I1-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-i1-exec-1)
- **Deliverable:** Checkpoint runtime model; exact architecture scope retained
- **Dependencies:** [I1. Checkpoint runtime model](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Pilot critical.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for I; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full I1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Pilot critical. §E decisions apply; no new priority or architecture decision.

<a id="detail-i2"></a>

### Preservation detail — I2

- **Task ID:** I2
- **Parent / Phase:** I — Checkpoint gameplay; Parent workstream; children: [I1-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-i1-exec-1)
- **Deliverable:** Participant progress state; exact architecture scope retained
- **Dependencies:** [I2. Participant progress state](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for I; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full I2 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision.

<a id="detail-i3"></a>

### Preservation detail — I3

- **Task ID:** I3
- **Parent / Phase:** I — Checkpoint gameplay; Parent workstream; children: [I1-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-i1-exec-1)
- **Deliverable:** Answer submission; exact architecture scope retained
- **Dependencies:** [I3. Answer submission](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Pilot critical.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for I; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full I3 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Pilot critical. §E decisions apply; no new priority or architecture decision.

<a id="detail-i4"></a>

### Preservation detail — I4

- **Task ID:** I4
- **Parent / Phase:** I — Checkpoint gameplay; Parent workstream; children: [I1-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-i1-exec-1)
- **Deliverable:** Backend validation; exact architecture scope retained
- **Dependencies:** [I4. Backend validation](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Pilot critical.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for I; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full I4 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Pilot critical. §E decisions apply; no new priority or architecture decision.

<a id="detail-i5"></a>

### Preservation detail — I5

- **Task ID:** I5
- **Parent / Phase:** I — Checkpoint gameplay; Parent workstream; children: [I5-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-i5-exec-1)
- **Deliverable:** Hint use; exact architecture scope retained
- **Dependencies:** [I5. Hint use](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for I; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full I5 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision.

<a id="detail-i6"></a>

### Preservation detail — I6

- **Task ID:** I6
- **Parent / Phase:** I — Checkpoint gameplay; Parent workstream; children: [I5-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-i5-exec-1)
- **Deliverable:** Personal and Team contribution; exact architecture scope retained
- **Dependencies:** [I6. Personal/team contribution](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Pilot critical.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for I; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full I6 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Pilot critical. §E decisions apply; no new priority or architecture decision.

<a id="detail-i7"></a>

### Preservation detail — I7

- **Task ID:** I7
- **Parent / Phase:** I — Checkpoint gameplay; Parent workstream; children: [I7-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-i7-exec-1)
- **Deliverable:** Score events; exact architecture scope retained
- **Dependencies:** [I7. Score events](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Pilot critical.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for I; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full I7 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Pilot critical. §E decisions apply; no new priority or architecture decision.

<a id="detail-i8"></a>

### Preservation detail — I8

- **Task ID:** I8
- **Parent / Phase:** I — Checkpoint gameplay; Parent workstream; children: [I7-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-i7-exec-1)
- **Deliverable:** Idempotency; exact architecture scope retained
- **Dependencies:** [I8. Idempotency](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Pilot critical.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for I; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full I8 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Pilot critical. §E decisions apply; no new priority or architecture decision.

<a id="detail-i9"></a>

### Preservation detail — I9

- **Task ID:** I9
- **Parent / Phase:** I — Checkpoint gameplay; Parent workstream; children: [I7-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-i7-exec-1)
- **Deliverable:** Restore progress; exact architecture scope retained
- **Dependencies:** [I9. Restore progress](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for I; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full I9 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision.

<a id="detail-i10"></a>

### Preservation detail — I10

- **Task ID:** I10
- **Parent / Phase:** I — Checkpoint gameplay; Parent workstream; children: [I10-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-i10-exec-1)
- **Deliverable:** All Signal checkpoints; exact architecture scope retained
- **Dependencies:** [I10. Extend to all Signal checkpoints](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for I; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full I10 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision.

<a id="detail-i11"></a>

### Preservation detail — I11

- **Task ID:** I11
- **Parent / Phase:** I — Checkpoint gameplay; Parent workstream; children: [I11-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-i11-exec-1)
- **Deliverable:** FinishPoint completion; exact architecture scope retained
- **Dependencies:** [I11. FinishPoint terminal checkpoint completion](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Pilot critical.
- **Status:** Aggregate only — Not started — terminal authoring exists; authoritative completion runtime absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for I; original qualification: Not started — terminal authoring exists; authoritative completion runtime absent (§9).
- **Acceptance:** Full I11 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Pilot critical. §E decisions apply; no new priority or architecture decision.

<a id="detail-i12"></a>

### Preservation detail — I12

- **Task ID:** I12
- **Parent / Phase:** I — Checkpoint gameplay; Parent workstream; children: [I12-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-i12-exec-1)
- **Deliverable:** Participant map; exact architecture scope retained
- **Dependencies:** [I12. Participant geographic runtime — Mapbox M4](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for I; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full I12 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision.

<a id="detail-i13"></a>

### Preservation detail — I13

- **Task ID:** I13
- **Parent / Phase:** I — Checkpoint gameplay; Parent workstream; children: [I13-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-i13-exec-1)
- **Deliverable:** Checkpoint suspension; exact architecture scope retained
- **Dependencies:** [I13. Runtime checkpoint suspension — prerequisite for Mapbox M5](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for I; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full I13 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision.

<a id="detail-i14"></a>

### Preservation detail — I14

- **Task ID:** I14
- **Parent / Phase:** I — Checkpoint gameplay; Parent workstream; children: [I14-DEC-1](TedixHunt_Master_Execution_Plan.md#task-i14-dec-1)
- **Deliverable:** Geographic gamification; exact architecture scope retained
- **Dependencies:** [I14. Geographic gamification — Mapbox M6](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision.
- **Status:** Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for I; original qualification: Decision/deferred — original scope decision retained.
- **Acceptance:** Full I14 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer.
- **Blocker / Decision:** Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision.

<a id="detail-j1"></a>

### Preservation detail — J1

- **Task ID:** J1
- **Parent / Phase:** J — Live operations; Parent workstream; children: [J1-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-j1-exec-1)
- **Deliverable:** Shared Hunt live state; exact architecture scope retained
- **Dependencies:** [J1. Shared Hunt live state](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for J; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full J1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision.

<a id="detail-j2"></a>

### Preservation detail — J2

- **Task ID:** J2
- **Parent / Phase:** J — Live operations; Parent workstream; children: [J1-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-j1-exec-1)
- **Deliverable:** Organizer Monitor; exact architecture scope retained
- **Dependencies:** [J2. Real Organizer Monitor](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for J; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full J2 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision.

<a id="detail-j3"></a>

### Preservation detail — J3

- **Task ID:** J3
- **Parent / Phase:** J — Live operations; Parent workstream; children: [J1-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-j1-exec-1)
- **Deliverable:** Lifecycle controls; exact architecture scope retained
- **Dependencies:** [J3. Live lifecycle controls](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for J; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full J3 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision.

<a id="detail-j4"></a>

### Preservation detail — J4

- **Task ID:** J4
- **Parent / Phase:** J — Live operations; Parent workstream; children: [J1-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-j1-exec-1)
- **Deliverable:** Supervisor access; exact architecture scope retained
- **Dependencies:** [J4. Supervisor operational access](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for J; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full J4 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision.

<a id="detail-j5"></a>

### Preservation detail — J5

- **Task ID:** J5
- **Parent / Phase:** J — Live operations; Parent workstream; children: [J5-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-j5-exec-1)
- **Deliverable:** Help request; exact architecture scope retained
- **Dependencies:** [J5. Help request](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Pilot critical.
- **Status:** Aggregate only — Not started — real delivery absent; FE #117 fixes simulation truthfulness only. Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for J; original qualification: Not started — real delivery absent; FE #117 fixes simulation truthfulness only.
- **Acceptance:** Full J5 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Pilot critical. §E decisions apply; no new priority or architecture decision.

<a id="detail-j6"></a>

### Preservation detail — J6

- **Task ID:** J6
- **Parent / Phase:** J — Live operations; Parent workstream; children: [J5-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-j5-exec-1)
- **Deliverable:** PANIC incident; exact architecture scope retained
- **Dependencies:** [J6. PANIC / safety incident](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Pilot critical.
- **Status:** Aggregate only — Not started — persisted real PANIC lifecycle absent; FE #117 is a simulation correction. Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for J; original qualification: Not started — persisted real PANIC lifecycle absent; FE #117 is a simulation correction.
- **Acceptance:** Full J6 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Pilot critical. §E decisions apply; no new priority or architecture decision.

<a id="detail-j7"></a>

### Preservation detail — J7

- **Task ID:** J7
- **Parent / Phase:** J — Live operations; Parent workstream; children: [J5-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-j5-exec-1)
- **Deliverable:** Acknowledge/resolve; exact architecture scope retained
- **Dependencies:** [J7. Acknowledge/resolve](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Pilot critical.
- **Status:** Aggregate only — Not started — demo dismissal is not real acknowledgement/resolution. Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for J; original qualification: Not started — demo dismissal is not real acknowledgement/resolution.
- **Acceptance:** Full J7 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Pilot critical. §E decisions apply; no new priority or architecture decision.

<a id="detail-j8"></a>

### Preservation detail — J8

- **Task ID:** J8
- **Parent / Phase:** J — Live operations; Parent workstream; children: [J5-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-j5-exec-1)
- **Deliverable:** Network-loss fallback; exact architecture scope retained
- **Dependencies:** [J8. Network-loss fallback](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for J; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full J8 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision.

<a id="detail-j9"></a>

### Preservation detail — J9

- **Task ID:** J9
- **Parent / Phase:** J — Live operations; Parent workstream; children: [J9-DEC-1](TedixHunt_Master_Execution_Plan.md#task-j9-dec-1)
- **Deliverable:** Live Operations Map; exact architecture scope retained
- **Dependencies:** [J9. Shared Live Hunt Operations Map — Mapbox M5](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision.
- **Status:** Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for J; original qualification: Decision/deferred — original scope decision retained.
- **Acceptance:** Full J9 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer.
- **Blocker / Decision:** Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision.

<a id="detail-k1"></a>

### Preservation detail — K1

- **Task ID:** K1
- **Parent / Phase:** K — Results and rewards; Parent workstream; children: [K1-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-k1-exec-1)
- **Deliverable:** Final score aggregation; exact architecture scope retained
- **Dependencies:** [K1. Final score aggregation](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Pilot critical.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for K; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full K1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Pilot critical. §E decisions apply; no new priority or architecture decision.

<a id="detail-k2"></a>

### Preservation detail — K2

- **Task ID:** K2
- **Parent / Phase:** K — Results and rewards; Parent workstream; children: [K1-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-k1-exec-1)
- **Deliverable:** Leaderboard; exact architecture scope retained
- **Dependencies:** [K2. Leaderboard](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for K; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full K2 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision.

<a id="detail-k3"></a>

### Preservation detail — K3

- **Task ID:** K3
- **Parent / Phase:** K — Results and rewards; Parent workstream; children: [K1-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-k1-exec-1)
- **Deliverable:** Final results; exact architecture scope retained
- **Dependencies:** [K3. Final results](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Pilot critical.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for K; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full K3 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Build.
- **Blocker / Decision:** Retain original gate: Pilot critical. §E decisions apply; no new priority or architecture decision.

<a id="detail-k4"></a>

### Preservation detail — K4

- **Task ID:** K4
- **Parent / Phase:** K — Results and rewards; Parent workstream; children: [K4-DEC-1](TedixHunt_Master_Execution_Plan.md#task-k4-dec-1)
- **Deliverable:** Special Awards; exact architecture scope retained
- **Dependencies:** [K4. Special Award calculation](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision.
- **Status:** Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for K; original qualification: Decision/deferred — original scope decision retained.
- **Acceptance:** Full K4 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer.
- **Blocker / Decision:** Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision.

<a id="detail-k5"></a>

### Preservation detail — K5

- **Task ID:** K5
- **Parent / Phase:** K — Results and rewards; Parent workstream; children: [K4-DEC-1](TedixHunt_Master_Execution_Plan.md#task-k4-dec-1)
- **Deliverable:** Reward assignment; exact architecture scope retained
- **Dependencies:** [K5. Reward assignment](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision.
- **Status:** Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for K; original qualification: Decision/deferred — original scope decision retained.
- **Acceptance:** Full K5 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer.
- **Blocker / Decision:** Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision.

<a id="detail-k6"></a>

### Preservation detail — K6

- **Task ID:** K6
- **Parent / Phase:** K — Results and rewards; Parent workstream; children: [K4-DEC-1](TedixHunt_Master_Execution_Plan.md#task-k4-dec-1)
- **Deliverable:** Physical-prize eligibility; exact architecture scope retained
- **Dependencies:** [K6. Physical-prize eligibility](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision.
- **Status:** Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for K; original qualification: Decision/deferred — original scope decision retained.
- **Acceptance:** Full K6 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer.
- **Blocker / Decision:** Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision.

<a id="detail-l1"></a>

### Preservation detail — L1

- **Task ID:** L1
- **Parent / Phase:** L — Admin operations; Parent workstream; children: [L1-VERIFY-1](TedixHunt_Master_Execution_Plan.md#task-l1-verify-1)
- **Deliverable:** Users and Roles; exact architecture scope retained
- **Dependencies:** [L1. Users & Roles](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify.
- **Status:** Aggregate only — Partially implemented — real Users & Roles controls; full operational auditability remains pending (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for L; original qualification: Partially implemented — real Users & Roles controls; full operational auditability remains pending (§9).
- **Acceptance:** Full L1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair (security).
- **Blocker / Decision:** Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision.

<a id="detail-l2"></a>

### Preservation detail — L2

- **Task ID:** L2
- **Parent / Phase:** L — Admin operations; Parent workstream; children: [L2-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-l2-exec-1)
- **Deliverable:** Hunt oversight; exact architecture scope retained
- **Dependencies:** [L2. Hunt oversight](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for L; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full L2 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision.

<a id="detail-l3"></a>

### Preservation detail — L3

- **Task ID:** L3
- **Parent / Phase:** L — Admin operations; Parent workstream; children: [L2-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-l2-exec-1)
- **Deliverable:** Safety Alerts; exact architecture scope retained
- **Dependencies:** [L3. Safety Alerts](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for L; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full L3 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision.

<a id="detail-l4"></a>

### Preservation detail — L4

- **Task ID:** L4
- **Parent / Phase:** L — Admin operations; Parent workstream; children: [L4-DEC-1](TedixHunt_Master_Execution_Plan.md#task-l4-dec-1)
- **Deliverable:** Physical Reward Inventory; exact architecture scope retained
- **Dependencies:** [L4. Physical Reward Inventory](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for L; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full L4 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision.

<a id="detail-l5"></a>

### Preservation detail — L5

- **Task ID:** L5
- **Parent / Phase:** L — Admin operations; Parent workstream; children: [L4-DEC-1](TedixHunt_Master_Execution_Plan.md#task-l4-dec-1)
- **Deliverable:** Platform Settings; exact architecture scope retained
- **Dependencies:** [L5. Platform Settings](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for L; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full L5 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision.

<a id="detail-l6"></a>

### Preservation detail — L6

- **Task ID:** L6
- **Parent / Phase:** L — Admin operations; Parent workstream; children: [L2-EXEC-1](TedixHunt_Master_Execution_Plan.md#task-l2-exec-1)
- **Deliverable:** Audit Log; exact architecture scope retained
- **Dependencies:** [L6. Audit Log](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Post-pilot / verify.
- **Status:** Aggregate only — Not started — required runtime/extension absent (§9). Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for L; original qualification: Not started — required runtime/extension absent (§9).
- **Acceptance:** Full L6 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Verify / repair.
- **Blocker / Decision:** Retain original gate: Post-pilot / verify. §E decisions apply; no new priority or architecture decision.

<a id="detail-m1"></a>

### Preservation detail — M1

- **Task ID:** M1
- **Parent / Phase:** M — Long-term Participant; Parent workstream; children: [M1-DEC-1](TedixHunt_Master_Execution_Plan.md#task-m1-dec-1)
- **Deliverable:** Hunt Passport; exact architecture scope retained
- **Dependencies:** [M1. Hunt Passport](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision.
- **Status:** Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for M; original qualification: Decision/deferred — original scope decision retained.
- **Acceptance:** Full M1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer.
- **Blocker / Decision:** Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision.

<a id="detail-m2"></a>

### Preservation detail — M2

- **Task ID:** M2
- **Parent / Phase:** M — Long-term Participant; Parent workstream; children: [M1-DEC-1](TedixHunt_Master_Execution_Plan.md#task-m1-dec-1)
- **Deliverable:** Mission History; exact architecture scope retained
- **Dependencies:** [M2. Mission History](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision.
- **Status:** Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for M; original qualification: Decision/deferred — original scope decision retained.
- **Acceptance:** Full M2 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer.
- **Blocker / Decision:** Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision.

<a id="detail-m3"></a>

### Preservation detail — M3

- **Task ID:** M3
- **Parent / Phase:** M — Long-term Participant; Parent workstream; children: [M1-DEC-1](TedixHunt_Master_Execution_Plan.md#task-m1-dec-1)
- **Deliverable:** Achievements; exact architecture scope retained
- **Dependencies:** [M3. Achievements](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision.
- **Status:** Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for M; original qualification: Decision/deferred — original scope decision retained.
- **Acceptance:** Full M3 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer.
- **Blocker / Decision:** Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision.

<a id="detail-m4"></a>

### Preservation detail — M4

- **Task ID:** M4
- **Parent / Phase:** M — Long-term Participant; Parent workstream; children: [M1-DEC-1](TedixHunt_Master_Execution_Plan.md#task-m1-dec-1)
- **Deliverable:** Collectibles and virtual rewards; exact architecture scope retained
- **Dependencies:** [M4. Collectibles / virtual rewards](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision.
- **Status:** Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for M; original qualification: Decision/deferred — original scope decision retained.
- **Acceptance:** Full M4 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer.
- **Blocker / Decision:** Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision.

<a id="detail-m5"></a>

### Preservation detail — M5

- **Task ID:** M5
- **Parent / Phase:** M — Long-term Participant; Parent workstream; children: [M1-DEC-1](TedixHunt_Master_Execution_Plan.md#task-m1-dec-1)
- **Deliverable:** Long-term profile; exact architecture scope retained
- **Dependencies:** [M5. Long-term participant profile](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision.
- **Status:** Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for M; original qualification: Decision/deferred — original scope decision retained.
- **Acceptance:** Full M5 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer.
- **Blocker / Decision:** Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision.

<a id="detail-n1"></a>

### Preservation detail — N1

- **Task ID:** N1
- **Parent / Phase:** N — Custom Hunt requests; Parent workstream; children: [N1-DEC-1](TedixHunt_Master_Execution_Plan.md#task-n1-dec-1)
- **Deliverable:** Persist custom request; exact architecture scope retained
- **Dependencies:** [N1. Persist custom request](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision.
- **Status:** Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for N; original qualification: Decision/deferred — original scope decision retained.
- **Acceptance:** Full N1 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer.
- **Blocker / Decision:** Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision.

<a id="detail-n2"></a>

### Preservation detail — N2

- **Task ID:** N2
- **Parent / Phase:** N — Custom Hunt requests; Parent workstream; children: [N1-DEC-1](TedixHunt_Master_Execution_Plan.md#task-n1-dec-1)
- **Deliverable:** Admin triage; exact architecture scope retained
- **Dependencies:** [N2. Admin triage](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision.
- **Status:** Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for N; original qualification: Decision/deferred — original scope decision retained.
- **Acceptance:** Full N2 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer.
- **Blocker / Decision:** Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision.

<a id="detail-n3"></a>

### Preservation detail — N3

- **Task ID:** N3
- **Parent / Phase:** N — Custom Hunt requests; Parent workstream; children: [N1-DEC-1](TedixHunt_Master_Execution_Plan.md#task-n1-dec-1)
- **Deliverable:** Assign Creator; exact architecture scope retained
- **Dependencies:** [N3. Assign Creator](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision.
- **Status:** Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for N; original qualification: Decision/deferred — original scope decision retained.
- **Acceptance:** Full N3 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer.
- **Blocker / Decision:** Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision.

<a id="detail-n4"></a>

### Preservation detail — N4

- **Task ID:** N4
- **Parent / Phase:** N — Custom Hunt requests; Parent workstream; children: [N1-DEC-1](TedixHunt_Master_Execution_Plan.md#task-n1-dec-1)
- **Deliverable:** Creator builds Template; exact architecture scope retained
- **Dependencies:** [N4. Creator builds requested template](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision.
- **Status:** Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for N; original qualification: Decision/deferred — original scope decision retained.
- **Acceptance:** Full N4 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer.
- **Blocker / Decision:** Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision.

<a id="detail-n5"></a>

### Preservation detail — N5

- **Task ID:** N5
- **Parent / Phase:** N — Custom Hunt requests; Parent workstream; children: [N1-DEC-1](TedixHunt_Master_Execution_Plan.md#task-n1-dec-1)
- **Deliverable:** Admin review; exact architecture scope retained
- **Dependencies:** [N5. Admin review](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision.
- **Status:** Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for N; original qualification: Decision/deferred — original scope decision retained.
- **Acceptance:** Full N5 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer.
- **Blocker / Decision:** Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision.

<a id="detail-n6"></a>

### Preservation detail — N6

- **Task ID:** N6
- **Parent / Phase:** N — Custom Hunt requests; Parent workstream; children: [N1-DEC-1](TedixHunt_Master_Execution_Plan.md#task-n1-dec-1)
- **Deliverable:** Return approved Template to Organizer; exact architecture scope retained
- **Dependencies:** [N6. Return approved template to Organizer](TedixHunt_Prototype_Architecture_Implementation_Plan.md); architecture §20.2–20.4 and §E. Original priority/gate: Later / decision.
- **Status:** Aggregate only — Decision/deferred — original scope decision retained. Integrated/deployed: unverified except separately dated historical evidence in §F.
- **PR / Evidence:** §F phase evidence for N; original qualification: Decision/deferred — original scope decision retained.
- **Acceptance:** Full N6 architecture requirements and acceptance; CLOSE-1 where applicable; preserve source/integrated/deployed boundaries. Original action: Decision / defer.
- **Blocker / Decision:** Retain original gate: Later / decision. §E decisions apply; no new priority or architecture decision.

<a id="detail-f7-fe-01"></a>

### Preservation detail — F7-FE-01

- **Task ID:** F7-FE-01
- **Parent / Phase:** F / Creator; original parent [F7](TedixHunt_Master_Execution_Plan.md#task-f7)
- **Deliverable:** Four-entry dashboard and read-only Mechanics Library
- **Dependencies:** Backend: Existing framework/gameplay contract; no new API. C2 typed authoring is merged. Frontend: Existing /creator guard, Studio and shared editor Governance: No new mechanic or availability policy. See capability boundary below. Correction: noninteractive Coming soon cards are the merged bounded result; no unavailable-flow dialog or classified creation is implied. See §E discrepancies.
- **Status:** Merged — source verified. Contract/BE: existing support unchanged; no new API. FE: Merged — source verified. Integrated workflow: unverified. Deployed E2E: unverified. F1/F7 remain partial; D10 stays blocked.
- **PR / Evidence:** [FE #123](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/123), merged=true, 2026-10-30T00:19:05Z; merge `ab54a3e0c776ed8843a2ae5d103f6313677aab2b`, final head `7798b6d8c1f25ddb01c3149d9e5aebe90570cf5d`. Navigation source and guarded-route test assertions inspected at main; [report](F7_FE_01_Implementation_Report.md) records 281 Vitest tests/14 files, 35 Node entries, typecheck/build and Chromium 320–1440px passing (reported, not rerun here).
- **Acceptance:** Show Mechanics Library, My Templates, Create Universal Template, Create Local Template. Reach guidance and owned list; creation entries reach explicit forthcoming-flow explanations until their slices ship, never generic unclassified creation masquerading as classified. Explain existing authorable components separately from planned runtime. Tests/closure: Keyboard/focus/back navigation; responsive views; no create/save requests on browsing; Creator guard and existing Studio entry regression. CLOSE-1 applies. PR boundary: Dashboard/navigation and read-only guidance only; no category mutations.
- **Blocker / Decision:** No new mechanic or availability policy. See capability boundary below. Correction: noninteractive Coming soon cards are the merged bounded result; no unavailable-flow dialog or classified creation is implied. See §E discrepancies. Blocking effect: Unblocks F7-FE-02/03; required for content chain; no public activation.

<a id="detail-f7-fe-02"></a>

### Preservation detail — F7-FE-02

- **Task ID:** F7-FE-02
- **Parent / Phase:** F / Creator; original parent [F7](TedixHunt_Master_Execution_Plan.md#task-f7)
- **Deliverable:** My Templates category, candidate and approval context
- **Dependencies:** Backend: GET /api/creator/templates and /{key}; C2/C5/C6b-5 private projections. Frontend: F7-FE-01 Governance: None; do not infer type on legacy NULL.
- **Status:** Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Show explicit Universal/Local/legacy-unclassified, candidate status/version and retained approval/publication separately; loading/empty/retry/401/403 and ownership-safe 404; no latest-as-approved assumption. Tests/closure: Projection fixtures for draft/submitted/changes_requested/approved, retained Local authority, suspension and integrity exception; revoked session; legacy list/delete regressions. CLOSE-1 applies. PR boundary: Typed read projections and owned-list UI only.
- **Blocker / Decision:** None; do not infer type on legacy NULL. Blocking effect: Unblocks F7-FE-04/08/11; required before workflow acceptance.

<a id="detail-f7-fe-03"></a>

### Preservation detail — F7-FE-03

- **Task ID:** F7-FE-03
- **Parent / Phase:** F / Creator; original parent [F7](TedixHunt_Master_Execution_Plan.md#task-f7)
- **Deliverable:** Create Universal draft in shared reusable editor
- **Dependencies:** Backend: POST /api/creator/templates {key,content,category:universal}; C2. Frontend: F7-FE-01; existing gameplay/checkpoint editor Governance: Use only currently supported typed configuration; no new framework fields.
- **Status:** Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Explicit Universal identity; no fixed Country/Locality/route requirement; reuse story/gameplay editor; no reserved ownership/provenance fields; persisted response is authority. Tests/closure: Exact POST envelope; progressive route-free draft; unsupported mechanics and 400/403/409; duplicate click/lost-response recovery via owned list; legacy scratch unchanged. CLOSE-1 applies. PR boundary: Classified Universal creation and type-relevant editor sections.
- **Blocker / Decision:** Use only currently supported typed configuration; no new framework fields. Blocking effect: Unblocks F7-FE-04; no G4/D10 bypass.

<a id="detail-f7-fe-04"></a>

### Preservation detail — F7-FE-04

- **Task ID:** F7-FE-04
- **Parent / Phase:** F / Creator; original parent [F7](TedixHunt_Master_Execution_Plan.md#task-f7)
- **Deliverable:** Edit, save and reopen Universal draft
- **Dependencies:** Backend: POST /api/creator/templates/{key}/versions {content}; GET owned detail; C2/C5. Frontend: F7-FE-02/03 Governance: None.
- **Status:** Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Explicit save creates immutable version; hydrate response/version; no save per keystroke; preserve mission/gameplay/terminal content; submitted remains locked. Tests/closure: Save/reopen round trip; failed save retains input; stale/server-state refresh; other-owner denial; old version and legacy persistence regression. CLOSE-1 applies. PR boundary: Universal draft persistence only.
- **Blocker / Decision:** None. Blocking effect: Unblocks F7-FE-05/11.

<a id="detail-f7-fe-05"></a>

### Preservation detail — F7-FE-05

- **Task ID:** F7-FE-05
- **Parent / Phase:** F / Creator; original parent [F7](TedixHunt_Master_Execution_Plan.md#task-f7)
- **Deliverable:** Submit saved Universal for independent review
- **Dependencies:** Backend: POST /api/creator/templates/{key}/submit {version}; C2. Frontend: F7-FE-04 Governance: None; approval is independent Admin action.
- **Status:** Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Submit exact saved latest candidate, surface validation without route-safety checklist for Universal; unsaved edits require save; submitted read-only; approval never promises Organizer availability. Tests/closure: Counted gameplay plus terminal validation; 400/409 stale or repeat submission; no direct approve/publish; legacy submit regression. CLOSE-1 applies. PR boundary: Universal submission and status UI.
- **Blocker / Decision:** None; approval is independent Admin action. Blocking effect: Provides representative Universal for G4-FE-01/02.

<a id="detail-f7-fe-06"></a>

### Preservation detail — F7-FE-06

- **Task ID:** F7-FE-06
- **Parent / Phase:** F / Creator; original parent [F7](TedixHunt_Master_Execution_Plan.md#task-f7)
- **Deliverable:** Browse approved Universal Library
- **Dependencies:** Backend: GET /api/creator/universal-library and /{key}; C3/C5. Frontend: F7-FE-01/02 Governance: None; shipped starters are separate.
- **Status:** Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Show one product per exact published reference, approved content/provenance allowlist and explicit empty/loading/error states; no private drafts or history selector. Tests/closure: Cross-Creator browse; missing/evidence-free/Local excluded; 401/403/404; source approval changes refresh details; starters unchanged. CLOSE-1 applies. PR boundary: Read-only community Universal chooser.
- **Blocker / Decision:** None; shipped starters are separate. Blocking effect: Unblocks F7-FE-07.

<a id="detail-f7-fe-07"></a>

### Preservation detail — F7-FE-07

- **Task ID:** F7-FE-07
- **Parent / Phase:** F / Creator; original parent [F7](TedixHunt_Master_Execution_Plan.md#task-f7)
- **Deliverable:** Copy approved Universal to independent Local draft
- **Dependencies:** Backend: POST /api/creator/templates/from-universal/{sourceKey} {key,publishedReference:{templateId,version}}; C4. Frontend: F7-FE-06 and shared editor Governance: None; never propagate later source edits.
- **Status:** Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Use exact inspected publication and new destination key; independent owned Local v1 with server provenance; stale source requires explicit refresh/reselect; no inferred Local approval. Tests/closure: Exact C4 envelope; cross-Creator independence, stale 409, invalid 400, authorization, duplicate key/lost response; unchanged source and starter path. CLOSE-1 applies. PR boundary: Copy action and independent Local handoff only.
- **Blocker / Decision:** None; never propagate later source edits. Blocking effect: Unblocks F7-FE-09; one Local origin for E2E.

<a id="detail-f7-fe-08"></a>

### Preservation detail — F7-FE-08

- **Task ID:** F7-FE-08
- **Parent / Phase:** F / Creator; original parent [F7](TedixHunt_Master_Execution_Plan.md#task-f7)
- **Deliverable:** Create Local independently from scratch
- **Dependencies:** Backend: POST /api/creator/templates {key,content,category:local}; C2. Frontend: F7-FE-02/03 reusable editor pattern Governance: None; Universal is optional.
- **Status:** Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Local start chooser offers approved Universal and scratch. Scratch creates independent Local with no source lineage, progressive drafts and separate reusable/location sections. Tests/closure: Exact Local category; no invented source; owner denial/duplicate handling; incomplete draft save allowed; legacy starter creation unchanged. CLOSE-1 applies. PR boundary: Local scratch entry and draft identity only.
- **Blocker / Decision:** None; Universal is optional. Blocking effect: Unblocks F7-FE-09; second Local origin for E2E.

<a id="detail-f7-fe-09"></a>

### Preservation detail — F7-FE-09

- **Task ID:** F7-FE-09
- **Parent / Phase:** F / Creator; original parent [F7](TedixHunt_Master_Execution_Plan.md#task-f7)
- **Deliverable:** Country/Locality selection and immutable binding
- **Dependencies:** Backend: GET geography countries/localities/{id}, search; C6b-1; Local create/save localityId, C6b-4. Frontend: F7-FE-07 or 08 Governance: Stored/manual only; C6b-2 stays blocked.
- **Status:** Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Country reset clears stale locality choice; query nonempty country-scoped search; use UUID, not text. Distinguish omission inheritance, explicit refresh UUID and null clearing on new versions; show saved snapshot versus current registry. Tests/closure: Same-name UUIDs, inactive/wrong-country/material drift, empty catalog, delayed search responses, save/reopen snapshot, 400/404/409; no client snapshot fields. CLOSE-1 applies. PR boundary: Selectors and server binding integration only; immutable means version snapshot, not ban on explicit new-version rebinding.
- **Blocker / Decision:** Stored/manual only; C6b-2 stays blocked. Blocking effect: Unblocks F7-FE-10/12; does not require provider storage.

<a id="detail-f7-fe-10"></a>

### Preservation detail — F7-FE-10

- **Task ID:** F7-FE-10
- **Parent / Phase:** F / Creator; original parent [F7](TedixHunt_Master_Execution_Plan.md#task-f7)
- **Deliverable:** Missing locality proposal and own decision status
- **Dependencies:** Backend: POST /api/geography/locality-proposals; GET /mine; C6b-3. Frontend: F7-FE-09; G4-FE-05 closes the later review loop (not a prerequisite to form development) Governance: Independent rights/evidence; semantic duplicates stay human decisions.
- **Status:** Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Creator submits name/context/coordinates/explanation/independent evidence; pending is not a selectable Locality. Approved UUID becomes discoverable; rejected/duplicate pending states explicit; no temporary Mapbox-derived persistence. Tests/closure: Validation, role/ownership denial, pending/approved/rejected, duplicate conflict and no provider payload; legacy geography unchanged. CLOSE-1 applies. PR boundary: Manual proposal form and own history only.
- **Blocker / Decision:** Independent rights/evidence; semantic duplicates stay human decisions. Blocking effect: Needed for empty-catalog manual path, not for existing stored-locality work.

<a id="detail-f7-fe-11"></a>

### Preservation detail — F7-FE-11

- **Task ID:** F7-FE-11
- **Parent / Phase:** F / Creator; original parent [F7](TedixHunt_Master_Execution_Plan.md#task-f7)
- **Deliverable:** Immutable revisions, request-changes state and resubmission
- **Dependencies:** Backend: Existing versions/submit; C5 Universal and C6b-5 Local continuity; owned detail. Frontend: F7-FE-02/04/05; Local binding/editor for Local cases Governance: Narrative review feedback needs G4-BE-03 decision/contract; current API exposes decision/state, not a feedback conversation.
- **Status:** Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Approved or changes_requested classified item creates new immutable candidate; submitted locked; previous published/approved authority visible; save then exact resubmit. Show current decision truthfully, never fabricate reviewer comments. Tests/closure: Universal and Local correction/resubmit; approval retained during candidate states; suspended remains suspended; old artifacts and copies stable; legacy lifecycle restrictions retained. CLOSE-1 applies. PR boundary: Supported revision lifecycle only; free-text feedback excluded pending separate contract.
- **Blocker / Decision:** Narrative review feedback needs G4-BE-03 decision/contract; current API exposes decision/state, not a feedback conversation. Blocking effect: Unblocks final Creator acceptance; narrative feedback remains tracked separately.

<a id="detail-f7-fe-12"></a>

### Preservation detail — F7-FE-12

- **Task ID:** F7-FE-12
- **Parent / Phase:** F / Creator; original parent [F7](TedixHunt_Master_Execution_Plan.md#task-f7)
- **Deliverable:** Local geography editor, validation and exact submission
- **Dependencies:** Backend: C2 Local completeness; C6b-4 binding and C6b-5 submission gates; versions/submit APIs. Frontend: F7-FE-09; reuse RouteEditor, FinishPointEditor, CheckpointGameplayEditor Governance: New route evidence/operating-condition fields wait G4-BE-01/02.
- **Status:** Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Visible Local-specific geography/adaptation area; count 1–20 numbered checkpoints and one complete FinishPoint/terminal gameplay; active matching stored binding. Progressive save allowed, complete saved artifact required for submission; route estimate never safety certification. Tests/closure: Scratch and copied Local save/reopen/submit; missing positions/terminal/binding and material registry drift rejection; exact saved version; existing Signal editor/preview regressions. CLOSE-1 applies. PR boundary: Local editor adaptation and submit; no new evidence schema.
- **Blocker / Decision:** New route evidence/operating-condition fields wait G4-BE-01/02. Blocking effect: Representative Local submissions unblock G4-FE-01/03; required content chain.

<a id="detail-f7-fe-13"></a>

### Preservation detail — F7-FE-13

- **Task ID:** F7-FE-13
- **Parent / Phase:** F / Creator; original parent [F7](TedixHunt_Master_Execution_Plan.md#task-f7)
- **Deliverable:** Creator workflow regression and integration acceptance
- **Dependencies:** Backend: C1–C6b-5 merged APIs in disposable integrated environment. Frontend: F7-FE-01 through 12; G4-FE-01 through 05 for review cases Governance: Feedback decision boundary recorded; provider path excluded.
- **Status:** Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Prove both Local origins, separate Universal/Local decisions, revise/resubmit and approval visibility; auth/error/loading/stale coverage across all slices. No frontend guard substitutes for BE authorization. Tests/closure: Real FE→BE flows with two Creators and independent Admin, including combined-role self-review denial; Signal starters, legacy NULL templates, deletion/save/preview regressions; typecheck/build and relevant FE suites. CLOSE-1 applies. PR boundary: Cross-slice acceptance tests and documented gaps, not gameplay runtime.
- **Blocker / Decision:** Feedback decision boundary recorded; provider path excluded. Blocking effect: Closes Creator integration evidence; feeds D10-GATE and D10-E2E-01.

<a id="detail-g4-fe-01"></a>

### Preservation detail — G4-FE-01

- **Task ID:** G4-FE-01
- **Parent / Phase:** G / Admin A; original parent [G4](TedixHunt_Master_Execution_Plan.md#task-g4)
- **Deliverable:** Separate Universal/Local queues and exact submitted inspection
- **Dependencies:** Backend: GET /api/admin/templates/review and /{key}; C2/C5/C6b-5. Frontend: F7-FE-05/12 representative submitted artifacts; existing Admin review UI Governance: None; client queue grouping only, no invented server filter.
- **Status:** Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Separate explicit categories and legacy group; inspect exact returned submitted version, never latest candidate; immutable content and private route inspected only by Admin. Tests/closure: Mixed categories/legacy, later candidate fixture, loading/empty/auth/error/ambiguous 404, revoked Admin; existing review regression. CLOSE-1 applies. PR boundary: Queue grouping, typed projections and read-only submitted detail.
- **Blocker / Decision:** None; client queue grouping only, no invented server filter. Blocking effect: Unblocks G4-FE-02/03; required Admin chain.

<a id="detail-g4-fe-02"></a>

### Preservation detail — G4-FE-02

- **Task ID:** G4-FE-02
- **Parent / Phase:** G / Admin A; original parent [G4](TedixHunt_Master_Execution_Plan.md#task-g4)
- **Deliverable:** Independent exact approval and request-changes
- **Dependencies:** Backend: POST /api/admin/templates/review/{key}/approve or /request-changes with {version}; C5/C6b-5. Frontend: G4-FE-01 Governance: No narrative feedback contract yet; G4-BE-03.
- **Status:** Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Send exact inspected version for both classified decisions; no self-approval even combined roles; stale decision refreshes inspection and requires new explicit action; no invented rejection state. Tests/closure: Capture exact request, stale/repeated 409, self-review/unauthorized denial, failed action no success UI; legacy optional-body behavior regression. CLOSE-1 applies. PR boundary: Decision mutations and state refresh only.
- **Blocker / Decision:** No narrative feedback contract yet; G4-BE-03. Blocking effect: Unblocks independent approval acceptance; not full safety governance.

<a id="detail-g4-fe-03"></a>

### Preservation detail — G4-FE-03

- **Task ID:** G4-FE-03
- **Parent / Phase:** G / Admin A; original parent [G4](TedixHunt_Master_Execution_Plan.md#task-g4)
- **Deliverable:** Local geographic/binding and retained-authority inspection
- **Dependencies:** Backend: GET review/{key}, ?view=approved; geography exact read; C6b-4/5. Frontend: G4-FE-01; F7-FE-09/12 Governance: Historical remediation is deferred; no backfill.
- **Status:** Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Show exact positions/FinishPoint and saved locality snapshot, separate current registry and candidate. Inspect retained Local approval while replacement is draft/submitted/changes_requested. Surface historical unbound/evidence-less/integrity exceptions without inferring valid authority. Tests/closure: Saved-label drift versus numeric drift, inactive locality, missing pins, old approval during revision, privacy and legacy preview; read-only map regression. CLOSE-1 applies. PR boundary: Local inspection/continuity UI using existing geography components.
- **Blocker / Decision:** Historical remediation is deferred; no backfill. Blocking effect: Unblocks G4-FE-04; required before catalog acceptance.

<a id="detail-g4-fe-04"></a>

### Preservation detail — G4-FE-04

- **Task ID:** G4-FE-04
- **Parent / Phase:** G / Admin A; original parent [G4](TedixHunt_Master_Execution_Plan.md#task-g4)
- **Deliverable:** Explicit suspension and consequences
- **Dependencies:** Backend: POST /api/admin/templates/{key}/suspend {version,reason}; C6b-5; C7 eligibility. Frontend: G4-FE-03 Governance: One-way only; reinstatement/reset requires separate decision.
- **Status:** Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Suspend exact inspected retained Local authority with nonblank reason ≤1,000 characters. Show audit and distinguish candidate approval from suspension. Explain exclusion from new selection; no claim existing Hunts or runtime are stopped. Tests/closure: Exact version conflict/reason validation, permission and repeated action, retained suspension after later approval; C7 list/PUT exclusion; existing Hunt snapshot unchanged. CLOSE-1 applies. PR boundary: Admin suspension action, consequences and evidence view.
- **Blocker / Decision:** One-way only; reinstatement/reset requires separate decision. Blocking effect: Required Admin operational boundary; runtime I13 remains separate.

<a id="detail-g4-fe-05"></a>

### Preservation detail — G4-FE-05

- **Task ID:** G4-FE-05
- **Parent / Phase:** G / Admin A; original parent [G4](TedixHunt_Master_Execution_Plan.md#task-g4)
- **Deliverable:** Independent manual Locality proposal review
- **Dependencies:** Backend: GET /api/admin/locality-proposals; POST /{id}/decision {decision,reason}; C6b-3. Frontend: F7-FE-10 for representative proposal; existing Admin guard Governance: Human place/evidence/rights check; no automatic duplicate merge.
- **Status:** Not started. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Not started. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Inspect full proposal; independent approved/rejected decision and required reason; approved creates stored UUID; duplicate conflict leaves pending. Template approval remains separate. Tests/closure: Self-review denial, concurrent/repeated decision, duplicate pending, empty/error/auth, approved UUID available to Creator; legacy review regression. CLOSE-1 applies. PR boundary: Proposal review only.
- **Blocker / Decision:** Human place/evidence/rights check; no automatic duplicate merge. Blocking effect: Completes manual-catalog branch; not required for existing stored fixtures.

<a id="detail-g4-dec-01"></a>

### Preservation detail — G4-DEC-01

- **Task ID:** G4-DEC-01
- **Parent / Phase:** G / Admin C; original parent [G4](TedixHunt_Master_Execution_Plan.md#task-g4)
- **Deliverable:** Product Owner safety/validity/operating and integration-gate decision
- **Dependencies:** Backend: No complete safety/validity governance contract in C7. Frontend: G4-FE-03 evidence examples; architecture §14/§20.2 and D10 readiness Governance: Define proportional route/access evidence, qualified review, validity/expiry/re-review, operating conditions, existing-Hunt consequences, publish/start enforcement and applicable D10 gates.
- **Status:** Deferred. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Deferred. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Written decision distinguishes Universal content approval, Local geographic approval and physical safety; names required evidence, owner, expiry triggers and failure behavior. Explicitly settle any bounded integration exception rather than infer one. Tests/closure: Review decision against sample safe/blocked/expired routes, historical legacy and Signal; no fabricated safety certification; document unresolved cases. CLOSE-1 applies. PR boundary: Decision document PR, no runtime code.
- **Blocker / Decision:** Define proportional route/access evidence, qualified review, validity/expiry/re-review, operating conditions, existing-Hunt consequences, publish/start enforcement and applicable D10 gates. Blocking effect: Blocks G4-BE-01/02 and D10-GATE; public activation blocked.

<a id="detail-g4-be-01"></a>

### Preservation detail — G4-BE-01

- **Task ID:** G4-BE-01
- **Parent / Phase:** G / Admin B; original parent [G4](TedixHunt_Master_Execution_Plan.md#task-g4)
- **Deliverable:** Safety evidence and operating-condition API contract then implementation
- **Dependencies:** Backend: G4-DEC-01 approved; new additive immutable-version evidence contract required. Frontend: Representative F7/G4 artifacts Governance: G4-DEC-01
- **Status:** Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** First contract PR defines storage/projection/access/version binding; subsequent bounded implementation PRs enforce required evidence and operating conditions server-side. Reuse exact review, never infer safety from coordinates/C7. Tests/closure: Disposable DB/API positive/negative/authorization/rollback/history tests; old snapshots unchanged; document migration/contract and acceptance. CLOSE-1 applies. PR boundary: Planning container: contract first, split storage/API and validation into child PRs after approved design; not one giant PR.
- **Blocker / Decision:** G4-DEC-01 Blocking effect: Blocks G4-FE-06 and full D10 readiness where applicable.

<a id="detail-g4-be-02"></a>

### Preservation detail — G4-BE-02

- **Task ID:** G4-BE-02
- **Parent / Phase:** G / Admin B; original parent [G4](TedixHunt_Master_Execution_Plan.md#task-g4)
- **Deliverable:** Validity, expiry/re-review and readiness enforcement
- **Dependencies:** Backend: G4-DEC-01; G4-BE-01 version/evidence contract; new governance APIs. Frontend: No FE prerequisite beyond fixtures Governance: Explicit temporal rules and publish/start/existing-Hunt consequences approved first.
- **Status:** Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Implement only approved validity/expiry/re-review gates and trustworthy server state; exact retained artifact/candidate distinction persists. No implicit historical revocation/backfill. Tests/closure: Boundary-time, expiry/approval/selection/publish races, auth, rollback and stable existing snapshots; legacy/Signal policy cases. CLOSE-1 applies. PR boundary: Contract then small authority/readiness implementation PRs; define execution children after decision.
- **Blocker / Decision:** Explicit temporal rules and publish/start/existing-Hunt consequences approved first. Blocking effect: Blocks G4-FE-06 and public activation; applicable D10 gates remain.

<a id="detail-g4-be-03"></a>

### Preservation detail — G4-BE-03

- **Task ID:** G4-BE-03
- **Parent / Phase:** G / Admin B; original parent [G4](TedixHunt_Master_Execution_Plan.md#task-g4)
- **Deliverable:** Narrative request-changes feedback contract and API
- **Dependencies:** Backend: Existing review records store decision; no supported end-to-end narrative feedback contract found. Frontend: G4-FE-02 and F7-FE-11 state-only flows Governance: PO decides required feedback fields, visibility, retention and exact-version linkage.
- **Status:** Deferred. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Deferred. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** If approved, persist/retrieve reviewer feedback tied to exact review/version, owner-scoped and Admin-authorized; correction resubmits new immutable version. Do not invent endpoints in FE. Tests/closure: Feedback visibility/auth, repeat/stale decision, retention and immutable history; legacy decision regression; contract examples. CLOSE-1 applies. PR boundary: Decision/contract first, then separate bounded BE implementation.
- **Blocker / Decision:** PO decides required feedback fields, visibility, retention and exact-version linkage. Blocking effect: Blocks G4-FE-07 narrative feedback only; not existing state-only correction.

<a id="detail-g4-fe-06"></a>

### Preservation detail — G4-FE-06

- **Task ID:** G4-FE-06
- **Parent / Phase:** G / Admin B; original parent [G4](TedixHunt_Master_Execution_Plan.md#task-g4)
- **Deliverable:** Safety, validity and operating-condition review controls
- **Dependencies:** Backend: G4-BE-01/02 merged and available. Frontend: G4-FE-01/02/03 Governance: G4-DEC-01 approved policies
- **Status:** Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Render authoritative evidence/expiry/conditions; prevent approval when required evidence missing; explicit re-review state and readiness explanation. Client does not certify route or compute authoritative expiry. Tests/closure: Required/missing/expired/re-review cases, auth/stale/races via integration, history/legacy compatibility, documented human route review. CLOSE-1 applies. PR boundary: Split evidence UI and validity controls into separately reviewed children after API is approved.
- **Blocker / Decision:** G4-DEC-01 approved policies Blocking effect: Blocks full G4 closure and D10-GATE as applicable.

<a id="detail-g4-fe-07"></a>

### Preservation detail — G4-FE-07

- **Task ID:** G4-FE-07
- **Parent / Phase:** G / Admin B; original parent [G4](TedixHunt_Master_Execution_Plan.md#task-g4)
- **Deliverable:** Exact review feedback authoring and Creator display
- **Dependencies:** Backend: G4-BE-03 approved and merged. Frontend: G4-FE-02; F7-FE-11 Governance: Feedback visibility/retention approved first.
- **Status:** Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Admin records supported feedback; Creator sees it on exact requested-changes candidate and can save/resubmit correction; no fabricated comments on older reviews. Tests/closure: Exact linkage/privacy/stale action and correction loop; legacy reviews without text; UI errors retain input. CLOSE-1 applies. PR boundary: Feedback FE only; split by Admin/Creator if independently reviewable.
- **Blocker / Decision:** Feedback visibility/retention approved first. Blocking effect: Closes narrative feedback gap, subject to approved scope.

<a id="detail-d10-gate"></a>

### Preservation detail — D10-GATE

- **Task ID:** D10-GATE
- **Parent / Phase:** D / Organizer; original parent [D10](TedixHunt_Master_Execution_Plan.md#task-d10)
- **Deliverable:** Recorded satisfaction of architecture §20.2 integration prerequisites
- **Dependencies:** Backend: C7 #89 merged; applicable G4 governance BE complete or explicit approved scope clarification. Frontend: F7 integrated category/reuse/location; representative independent G4 review; reviewed Local catalog; compatibility rollout decision Governance: PO-GATE/PO-LEGACY below; no hidden/non-public exception inferred.
- **Status:** Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Record each applicable prerequisite with source/test evidence and reviewed catalog; resolve full safety/validity requirements that gate integration. A deploy restriction alone is not a development ban; this architecture is an explicit integration gate. Tests/closure: Checklist review against §20.2 and FE #121; no waiver from elapsed time, merged C7 or feature flag. CLOSE-1 applies. PR boundary: Documentation readiness checkpoint, no new flow.
- **Blocker / Decision:** PO-GATE/PO-LEGACY below; no hidden/non-public exception inferred. Blocking effect: Blocks every D10 FE implementation slice and public activation.

<a id="detail-d10-fe-01"></a>

### Preservation detail — D10-FE-01

- **Task ID:** D10-FE-01
- **Parent / Phase:** D / Organizer; original parent [D10](TedixHunt_Master_Execution_Plan.md#task-d10)
- **Deliverable:** Create Hunt → Country
- **Dependencies:** Backend: GET /api/geography/countries; existing HuntsApi draft creation; C7. Frontend: D10-GATE; existing OrganizerSetupFlow/CustomHuntEditor Governance: Resolved integration gate
- **Status:** Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Reuse existing draft-first builder; render backend countries, currently RO reference, no inferred worldwide catalog/residence restriction; changing country clears dependent selection. Tests/closure: Country loading/empty/retry/401/403, selected reset, draft creation failure/lost response, existing general setup regression. CLOSE-1 applies. PR boundary: Country step and client types only.
- **Blocker / Decision:** Resolved integration gate Blocking effect: Unblocks D10-FE-02; no activation by this slice.

<a id="detail-d10-fe-02"></a>

### Preservation detail — D10-FE-02

- **Task ID:** D10-FE-02
- **Parent / Phase:** D / Organizer; original parent [D10](TedixHunt_Master_Execution_Plan.md#task-d10)
- **Deliverable:** Country-scoped stored/manual Locality search
- **Dependencies:** Backend: GET geography/localities?countryCode&q and /{id}; C6b-1/3. Frontend: D10-FE-01 Governance: No provider storage; Organizer cannot submit Creator-only manual proposals.
- **Status:** Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Search stored approved manual entries with nonempty q ≤100; max 50; UUID/context selection, delayed-request protection and empty/unavailable states. No pending proposal or raw text treated as locality; clear cards/preview when changed. Tests/closure: Same-name UUIDs, wrong country/inactive 404/409, no result, out-of-order responses, auth; no proposal/provider mutation. CLOSE-1 applies. PR boundary: Locality search/select only.
- **Blocker / Decision:** No provider storage; Organizer cannot submit Creator-only manual proposals. Blocking effect: Unblocks D10-FE-03.

<a id="detail-d10-fe-03"></a>

### Preservation detail — D10-FE-03

- **Task ID:** D10-FE-03
- **Parent / Phase:** D / Organizer; original parent [D10](TedixHunt_Master_Execution_Plan.md#task-d10)
- **Deliverable:** Eligible Local cards and pagination
- **Dependencies:** Backend: GET /api/organizer/local-templates; C7 list. Frontend: D10-FE-02 Governance: No FE eligibility rules.
- **Status:** Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Use countryCode/localityId and limit 1–50/default20; render name/theme/saved location; opaque filter-scoped nextCursor reset on filter change; versions internal only; empty/error explicit. Tests/closure: Exact filters/cursor, pagination/duplicate loading, 400/404/409, cancellation and no private metadata/technical version controls. CLOSE-1 applies. PR boundary: Discovery API and cards only.
- **Blocker / Decision:** No FE eligibility rules. Blocking effect: Unblocks D10-FE-04.

<a id="detail-d10-fe-04"></a>

### Preservation detail — D10-FE-04

- **Task ID:** D10-FE-04
- **Parent / Phase:** D / Organizer; original parent [D10](TedixHunt_Master_Execution_Plan.md#task-d10)
- **Deliverable:** Automatic read-only exact geographic preview
- **Dependencies:** Backend: GET organizer/local-templates/{templateId}/versions/{version} with same filters; C7. Frontend: D10-FE-03; existing OrganizerHuntGeography/TedixMap Governance: Mapbox runtime access distinct from permanent-storage entitlement.
- **Status:** Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Automatic preview of exact selected card via normalCheckpointCount, checkpointPositions and finishPoint allowlist. Saved localitySnapshot separate from currentLocality; no answers/private evidence or editing. Truthful read-only location summary on map failure. Tests/closure: Allowlist/answer exclusion, stale indistinguishable 404, provider failure, old response race, keyboard/mobile and existing geographic preview regression. CLOSE-1 applies. PR boundary: Preview only; no source snapshot authored by client.
- **Blocker / Decision:** Mapbox runtime access distinct from permanent-storage entitlement. Blocking effect: Unblocks D10-FE-05.

<a id="detail-d10-fe-05"></a>

### Preservation detail — D10-FE-05

- **Task ID:** D10-FE-05
- **Parent / Phase:** D / Organizer; original parent [D10](TedixHunt_Master_Execution_Plan.md#task-d10)
- **Deliverable:** Explicit selection into existing draft Hunt
- **Dependencies:** Backend: PUT /api/hunts/{id}/local-template {templateId,version,countryCode,localityId}; C7. Frontend: D10-FE-04; existing authorized draft Governance: No technical version chooser.
- **Status:** Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Select inspected exact reference; backend captures full source tuple. Existing draft required; do not PATCH templateKey or submit client content/locality snapshots. Configure Hunt using returned server state. Tests/closure: Exact four-field payload, draft-only and Hunt-specific organizer denial, forged data rejection, failed selection leaves source/settings unchanged, no optimistic success. CLOSE-1 applies. PR boundary: Selection mutation and handoff to existing configuration only.
- **Blocker / Decision:** No technical version chooser. Blocking effect: Unblocks D10-FE-06/07.

<a id="detail-d10-fe-06"></a>

### Preservation detail — D10-FE-06

- **Task ID:** D10-FE-06
- **Parent / Phase:** D / Organizer; original parent [D10](TedixHunt_Master_Execution_Plan.md#task-d10)
- **Deliverable:** Stale selection and explicit reselection
- **Dependencies:** Backend: C7 409 template_selection_stale/template_not_eligible/locality_geography_changed/locality_unavailable; 404 preview. Frontend: D10-FE-05 Governance: None beyond gate; no automatic retry/replacement guarantee.
- **Status:** Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Invalidate attempted choice/preview, refresh inventory and require explicit reconfirmation. Preserve previously persisted Hunt source until successful new PUT; ambiguous 404 reveals no suspension/private reason. Tests/closure: Approval advance, suspension, inactive/material drift, concurrent choice, lost response refetch; never auto-select latest or retry as a new choice. CLOSE-1 applies. PR boundary: Stale/error recovery only.
- **Blocker / Decision:** None beyond gate; no automatic retry/replacement guarantee. Blocking effect: Required before D10-FE-08 and chain acceptance.

<a id="detail-d10-fe-07"></a>

### Preservation detail — D10-FE-07

- **Task ID:** D10-FE-07
- **Parent / Phase:** D / Organizer; original parent [D10](TedixHunt_Master_Execution_Plan.md#task-d10)
- **Deliverable:** Hunt settings and legacy/Signal compatibility
- **Dependencies:** Backend: Existing Hunt GET/PATCH plus C7 protected source tuple and publish readiness. Frontend: D10-FE-05/06 Governance: PO-LEGACY approved transition; no automatic classification.
- **Status:** Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Selection/reopen preserves organization, roles, name, schedule, rewards and supported options. Existing C7 source cannot be replaced/cleared by legacy templateKey PATCH. Legacy category-null/Signal creation works under approved compatibility policy. Tests/closure: Save/reopen, dates, settings before/after selection, competing PATCH/publish failure; old Hunt snapshots stable after source edits/approval/suspension. CLOSE-1 applies. PR boundary: Existing builder integration/compatibility only.
- **Blocker / Decision:** PO-LEGACY approved transition; no automatic classification. Blocking effect: Unblocks D10-FE-08; required public compatibility evidence.

<a id="detail-d10-fe-08"></a>

### Preservation detail — D10-FE-08

- **Task ID:** D10-FE-08
- **Parent / Phase:** D / Organizer; original parent [D10](TedixHunt_Master_Execution_Plan.md#task-d10)
- **Deliverable:** Frontend integration and authorization acceptance
- **Dependencies:** Backend: Merged C7 plus integrated disposable backend. Frontend: D10-FE-01 through 07 Governance: D10-GATE satisfied
- **Status:** Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Complete Create Hunt → Country → Locality → Eligible Local Templates → Preview → Select → Configure; auth/loading/error/empty/stale behavior across steps; no duplicate eligibility or authoritative client snapshots. Tests/closure: Real FE→BE tests plus contract/UI tests: 401/403, wrong-Hunt, revoked role, invalid_hunt_state, all C7 conflicts, cursor/filter races, answer-free preview and responsive/keyboard flow; relevant legacy/Signal suite, typecheck/build. CLOSE-1 applies. PR boundary: D10 test/evidence PR after behavior slices; no gameplay runtime.
- **Blocker / Decision:** D10-GATE satisfied Blocking effect: Unblocks D10-E2E-01; FE implementation completion only.

<a id="detail-d10-e2e-01"></a>

### Preservation detail — D10-E2E-01

- **Task ID:** D10-E2E-01
- **Parent / Phase:** D / Supply chain; original parent [D10](TedixHunt_Master_Execution_Plan.md#task-d10)
- **Deliverable:** Creator → Admin → Organizer integrated acceptance
- **Dependencies:** Backend: C1–C7 available in recorded test environment. Frontend: F7-FE-13; G4 supported flows and applicable full-governance slices; D10-FE-08 Governance: Recorded catalog/legacy/readiness decisions
- **Status:** Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Two Creators + independent Admin + authorized Organizer: approve Universal, cross-Creator copy Local and scratch Local, bind/review/approve separately, discover/preview/select/save/reopen Hunt; revisions, changes requested, suspension and existing snapshot stability. Tests/closure: Record identities/capabilities, exact source/candidate references, API outcomes and failing cases; denied combined-role self-review/other-Hunt selection; old Universal/copies/Hunts stable. Never call this deployed E2E from fixtures alone. CLOSE-1 applies. PR boundary: Integrated acceptance evidence; defects go to bounded follow-up PRs.
- **Blocker / Decision:** Recorded catalog/legacy/readiness decisions Blocking effect: Blocks whole-chain completion and deployed acceptance.

<a id="detail-d10-e2e-02"></a>

### Preservation detail — D10-E2E-02

- **Task ID:** D10-E2E-02
- **Parent / Phase:** D / Rollout; original parent [D10](TedixHunt_Master_Execution_Plan.md#task-d10)
- **Deliverable:** Deployed supply-chain and pilot readiness verification
- **Dependencies:** Backend: Reviewed deployment with actual migrated DB/API revisions; provider/device capability where applicable. Frontend: D10-E2E-01; recorded FE revision Governance: Applicable G0–G6, §20.3, human route review and explicit staged activation approval
- **Status:** Blocked. Contract/BE: only the referenced existing foundations are merged-source complete; this slice adds no automatic BE completion. FE: Blocked. Integrated workflow: unverified. Deployed E2E: unverified.
- **PR / Evidence:** No merged implementation evidence recorded for this exact deliverable; prerequisite evidence is not task completion. Open FE and BE PR lists were empty at consolidation review.
- **Acceptance:** Record environment/date/FE+BE SHAs/migration status, real accounts, both Local origins, real provider/mobile save/reopen/review/select cases, failure cases and legacy compatibility. Public/pilot readiness remains separate from source completion. Tests/closure: Actual deployed outcomes/evidence, real-device geography and human operating conditions; rollback/backup/readiness checks; no simulated safety acceptance. CLOSE-1 applies. PR boundary: Verification record after separately authorized deployment; this task does not authorize deploying.
- **Blocker / Decision:** Applicable G0–G6, §20.3, human route review and explicit staged activation approval Blocking effect: Blocks Complete — deployed/E2E verified and public activation.

<a id="detail-h1-verify-1"></a>

### Preservation detail — H1-VERIFY-1

- **Task ID:** H1-VERIFY-1
- **Parent / Phase:** [H1](TedixHunt_Master_Execution_Plan.md#task-h1); H1 source-complete public code lookup only
- **Deliverable:** Only original next bounded action: Reverify existing code lookup at rollout; no enrollment mutation.
- **Dependencies:** Reverify existing code lookup at rollout; no enrollment mutation. Content-chain, authority and stage gates in §E remain.
- **Status:** Not started. Source foundation: retain original parent qualification H1 source-complete public code lookup only. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified.
- **PR / Evidence:** §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only.
- **Acceptance:** Contract tests for public minimum identity/code/name/status, invalid code, no private geography or membership; record deployed result separately. CLOSE-1 and original container closure rules in §E.
- **Blocker / Decision:** Public lookup deployment claim, not missing H2 code. No broad implementation or undefined child ID authorized.

<a id="detail-h2-exec-1"></a>

### Preservation detail — H2-EXEC-1

- **Task ID:** H2-EXEC-1
- **Parent / Phase:** [H2](TedixHunt_Master_Execution_Plan.md#task-h2), [H3](TedixHunt_Master_Execution_Plan.md#task-h3); H2–H3 Not started
- **Deliverable:** Only original next bounded action: After content-chain gate and B6 authority contract: design persisted enrollment + authoritative eligibility/capacity/lifecycle transaction.
- **Dependencies:** After content-chain gate and B6 authority contract: design persisted enrollment + authoritative eligibility/capacity/lifecycle transaction. Content-chain, authority and stage gates in §E remain.
- **Status:** Not started. Source foundation: retain original parent qualification H2–H3 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified.
- **PR / Evidence:** §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only.
- **Acceptance:** Exact actor/Hunt membership, duplicate/retry/race/closed-capacity denial, no client eligibility; legacy code lookup preserved; contract then separately scoped persistence/API/UI children. CLOSE-1 and original container closure rules in §E.
- **Blocker / Decision:** H4–H8 admission and live Solo proof. No broad implementation or undefined child ID authorized.

<a id="detail-h4-exec-1"></a>

### Preservation detail — H4-EXEC-1

- **Task ID:** H4-EXEC-1
- **Parent / Phase:** [H4](TedixHunt_Master_Execution_Plan.md#task-h4); H4 Not started
- **Deliverable:** Only original next bounded action: H2/H3; P2 team size/membership/change policy; define formation/assignment contract.
- **Dependencies:** H2/H3; P2 team size/membership/change policy; define formation/assignment contract. Content-chain, authority and stage gates in §E remain.
- **Status:** Not started. Source foundation: retain original parent qualification H4 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified.
- **PR / Evidence:** §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only.
- **Acceptance:** Real independent accounts, uneven/no-fragment-compatible formation, join/leave/replacement races, capacity and scoped authority; no fixed-four rule. Contract evidence before implementation. CLOSE-1 and original container closure rules in §E.
- **Blocker / Decision:** Team lobby/start; not automatic approval for unresolved P2. No broad implementation or undefined child ID authorized.

<a id="detail-h5-exec-1"></a>

### Preservation detail — H5-EXEC-1

- **Task ID:** H5-EXEC-1
- **Parent / Phase:** [H5](TedixHunt_Master_Execution_Plan.md#task-h5), [H6](TedixHunt_Master_Execution_Plan.md#task-h6), [H7](TedixHunt_Master_Execution_Plan.md#task-h7); H5–H7 Not started
- **Deliverable:** Only original next bounded action: Enrollment, formation, supported Solo/Team compatibility and B6/D9 authority; contract lobby/readiness/start boundaries.
- **Dependencies:** Enrollment, formation, supported Solo/Team compatibility and B6/D9 authority; contract lobby/readiness/start boundaries. Content-chain, authority and stage gates in §E remain.
- **Status:** Not started. Source foundation: retain original parent qualification H5–H7 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified.
- **PR / Evidence:** §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only.
- **Acceptance:** Real persisted membership/readiness, atomic start and admission/role/lifecycle races; Solo A/Team B without simulated members; preserve mode contract and authorized views. CLOSE-1 and original container closure rules in §E.
- **Blocker / Decision:** Real Hunt start. No broad implementation or undefined child ID authorized.

<a id="detail-h8-exec-1"></a>

### Preservation detail — H8-EXEC-1

- **Task ID:** H8-EXEC-1
- **Parent / Phase:** [H8](TedixHunt_Master_Execution_Plan.md#task-h8); H8 Not started
- **Deliverable:** Only original next bounded action: Above persisted states; define restore/reconnect including membership revisions.
- **Dependencies:** Above persisted states; define restore/reconnect including membership revisions. Content-chain, authority and stage gates in §E remain.
- **Status:** Not started. Source foundation: retain original parent qualification H8 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified.
- **PR / Evidence:** §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only.
- **Acceptance:** Refresh/reconnect/backend restart, revoked/stale member denial, accepted contributions preserved and no private data leak; client disconnect does not silently change membership. CLOSE-1 and original container closure rules in §E.
- **Blocker / Decision:** Reliable runtime/live acceptance. No broad implementation or undefined child ID authorized.

<a id="detail-i1-exec-1"></a>

### Preservation detail — I1-EXEC-1

- **Task ID:** I1-EXEC-1
- **Parent / Phase:** [I1](TedixHunt_Master_Execution_Plan.md#task-i1), [I2](TedixHunt_Master_Execution_Plan.md#task-i2), [I3](TedixHunt_Master_Execution_Plan.md#task-i3), [I4](TedixHunt_Master_Execution_Plan.md#task-i4); I1–I4 Not started
- **Deliverable:** Only original next bounded action: H membership/start plus content snapshots; first authoritative one-normal-checkpoint engine contract.
- **Dependencies:** H membership/start plus content snapshots; first authoritative one-normal-checkpoint engine contract. Content-chain, authority and stage gates in §E remain.
- **Status:** Not started. Source foundation: retain original parent qualification I1–I4 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified.
- **PR / Evidence:** §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only.
- **Acceptance:** Persist checkpoint/progress, server-only answers/validation, actor/Hunt/activity scope and exact snapshot; no client result authority. Contract/storage/API/UI children; normal and terminal share engine. CLOSE-1 and original container closure rules in §E.
- **Blocker / Decision:** I5–I9 and Solo A. No broad implementation or undefined child ID authorized.

<a id="detail-i5-exec-1"></a>

### Preservation detail — I5-EXEC-1

- **Task ID:** I5-EXEC-1
- **Parent / Phase:** [I5](TedixHunt_Master_Execution_Plan.md#task-i5), [I6](TedixHunt_Master_Execution_Plan.md#task-i6); I5–I6 Not started
- **Deliverable:** Only original next bounded action: I1-EXEC-1 contract; approved §3.3 semantics, P2 unresolved allocation/membership details settled as needed.
- **Dependencies:** I1-EXEC-1 contract; approved §3.3 semantics, P2 unresolved allocation/membership details settled as needed. Content-chain, authority and stage gates in §E remain.
- **Status:** Not started. Source foundation: retain original parent qualification I5–I6 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified.
- **PR / Evidence:** §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only.
- **Acceptance:** Hint authority and Personal/Team activity distinct from fragments; fixed fragments, 2+2/2+1+1/1+1+1+1/six with two none, all-required pre-recovery; legitimate recovery after five minutes, no vote or invented completion. Privacy and stale allocation cases required. CLOSE-1 and original container closure rules in §E.
- **Blocker / Decision:** Team B/C gameplay acceptance. No broad implementation or undefined child ID authorized.

<a id="detail-i7-exec-1"></a>

### Preservation detail — I7-EXEC-1

- **Task ID:** I7-EXEC-1
- **Parent / Phase:** [I7](TedixHunt_Master_Execution_Plan.md#task-i7), [I8](TedixHunt_Master_Execution_Plan.md#task-i8), [I9](TedixHunt_Master_Execution_Plan.md#task-i9); I7–I9 Not started
- **Deliverable:** Only original next bounded action: I1/I6 authoritative outcomes; define score/idempotency/restore transaction and API.
- **Dependencies:** I1/I6 authoritative outcomes; define score/idempotency/restore transaction and API. Content-chain, authority and stage gates in §E remain.
- **Status:** Not started. Source foundation: retain original parent qualification I7–I9 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified.
- **PR / Evidence:** §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only.
- **Acceptance:** +100 exactly once for successful Team Challenge including recovery, zero otherwise; no individual partial Team points; retries/conflicting replay/concurrent final answers/backend restart and private restore. Record real DB proof, old snapshots unchanged. CLOSE-1 and original container closure rules in §E.
- **Blocker / Decision:** Results authority and reliable Team proof. No broad implementation or undefined child ID authorized.

<a id="detail-i11-exec-1"></a>

### Preservation detail — I11-EXEC-1

- **Task ID:** I11-EXEC-1
- **Parent / Phase:** [I11](TedixHunt_Master_Execution_Plan.md#task-i11); I11 Not started
- **Deliverable:** Only original next bounded action: Shared normal engine; terminal completion/global closure/suspension decisions where required.
- **Dependencies:** Shared normal engine; terminal completion/global closure/suspension decisions where required. Content-chain, authority and stage gates in §E remain.
- **Status:** Not started. Source foundation: retain original parent qualification I11 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified.
- **PR / Evidence:** §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only.
- **Acceptance:** One normal + FinishPoint resolves all required terminal activities before completion; arrival alone fails; one team finish does not end all teams. Solo A then Team B; persisted results consume true terminal state. CLOSE-1 and original container closure rules in §E.
- **Blocker / Decision:** Pilot finish/results; precedes I10 expansion. No broad implementation or undefined child ID authorized.

<a id="detail-i12-exec-1"></a>

### Preservation detail — I12-EXEC-1

- **Task ID:** I12-EXEC-1
- **Parent / Phase:** [I12](TedixHunt_Master_Execution_Plan.md#task-i12); I12 Not started
- **Deliverable:** Only original next bounded action: Authoritative checkpoint contract and approved GPS/fallback rules; existing map foundation only.
- **Dependencies:** Authoritative checkpoint contract and approved GPS/fallback rules; existing map foundation only. Content-chain, authority and stage gates in §E remain.
- **Status:** Not started. Source foundation: retain original parent qualification I12 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified.
- **PR / Evidence:** §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only.
- **Acceptance:** Persistent map/navigation/arrival through same engine, GPS accuracy/failure/reconnect/device evidence and privacy; local author preview never runtime acceptance. CLOSE-1 and original container closure rules in §E.
- **Blocker / Decision:** Live geographic proof; later map operations. No broad implementation or undefined child ID authorized.

<a id="detail-i13-exec-1"></a>

### Preservation detail — I13-EXEC-1

- **Task ID:** I13-EXEC-1
- **Parent / Phase:** [I13](TedixHunt_Master_Execution_Plan.md#task-i13); I13 Not started
- **Deliverable:** Only original next bounded action: Backend suspension/bypass and terminal/global-closure policy resolved before FE/operator controls.
- **Dependencies:** Backend suspension/bypass and terminal/global-closure policy resolved before FE/operator controls. Content-chain, authority and stage gates in §E remain.
- **Status:** Not started. Source foundation: retain original parent qualification I13 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified.
- **PR / Evidence:** §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only.
- **Acceptance:** Preserve completed activities/earned points; no automatic penalty or fabricated successful bypass. Authorization, race/restore and terminal fairness tests; contract first. CLOSE-1 and original container closure rules in §E.
- **Blocker / Decision:** J9 controls and suspension-dependent live stages. No broad implementation or undefined child ID authorized.

<a id="detail-i10-exec-1"></a>

### Preservation detail — I10-EXEC-1

- **Task ID:** I10-EXEC-1
- **Parent / Phase:** [I10](TedixHunt_Master_Execution_Plan.md#task-i10); I10 Not started
- **Deliverable:** Only original next bounded action: Stages A–C normal+terminal, J/K operations/results and compatibility proven.
- **Dependencies:** Stages A–C normal+terminal, J/K operations/results and compatibility proven. Content-chain, authority and stage gates in §E remain.
- **Status:** Not started. Source foundation: retain original parent qualification I10 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified.
- **PR / Evidence:** §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only.
- **Acceptance:** Expand existing Signal to all six normal checkpoints plus FinishPoint using same engine; no new mechanic; checkpoint-by-checkpoint restore/concurrency and legacy narrative regression. CLOSE-1 and original container closure rules in §E.
- **Blocker / Decision:** Full Signal seven-stop completion claim. No broad implementation or undefined child ID authorized.

<a id="detail-i14-dec-1"></a>

### Preservation detail — I14-DEC-1

- **Task ID:** I14-DEC-1
- **Parent / Phase:** [I14](TedixHunt_Master_Execution_Plan.md#task-i14); I14 Decision/deferred
- **Deliverable:** Only original next bounded action: Core engine/geographic operations proven; separate scope approval for Mapbox M6.
- **Dependencies:** Core engine/geographic operations proven; separate scope approval for Mapbox M6. Content-chain, authority and stage gates in §E remain.
- **Status:** Deferred. Source foundation: retain original parent qualification I14 Decision/deferred. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified.
- **PR / Evidence:** §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only.
- **Acceptance:** Decision records exact approved extension and tests; no implementation/runtime promotion now. CLOSE-1 and original container closure rules in §E.
- **Blocker / Decision:** Only later gamification. No broad implementation or undefined child ID authorized.

<a id="detail-j1-exec-1"></a>

### Preservation detail — J1-EXEC-1

- **Task ID:** J1-EXEC-1
- **Parent / Phase:** [J1](TedixHunt_Master_Execution_Plan.md#task-j1), [J2](TedixHunt_Master_Execution_Plan.md#task-j2), [J3](TedixHunt_Master_Execution_Plan.md#task-j3), [J4](TedixHunt_Master_Execution_Plan.md#task-j4); J1–J4 Not started
- **Deliverable:** Only original next bounded action: B6 Hunt authority/D9 assignment, H/I events; define minimum live state/monitor/control contract.
- **Dependencies:** B6 Hunt authority/D9 assignment, H/I events; define minimum live state/monitor/control contract. Content-chain, authority and stage gates in §E remain.
- **Status:** Not started. Source foundation: retain original parent qualification J1–J4 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified.
- **PR / Evidence:** §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only.
- **Acceptance:** Authorized actual Organizer/Supervisor views, no arbitrary-Hunt global capability, real lifecycle status and concurrent controls; prototype labels remain until connected. CLOSE-1 and original container closure rules in §E.
- **Blocker / Decision:** Minimum live operation per stage. No broad implementation or undefined child ID authorized.

<a id="detail-j5-exec-1"></a>

### Preservation detail — J5-EXEC-1

- **Task ID:** J5-EXEC-1
- **Parent / Phase:** [J5](TedixHunt_Master_Execution_Plan.md#task-j5), [J6](TedixHunt_Master_Execution_Plan.md#task-j6), [J7](TedixHunt_Master_Execution_Plan.md#task-j7), [J8](TedixHunt_Master_Execution_Plan.md#task-j8); J5–J8 Not started
- **Deliverable:** Only original next bounded action: Approved incident/operations contract and responsible recipients before live pilot.
- **Dependencies:** Approved incident/operations contract and responsible recipients before live pilot. Content-chain, authority and stage gates in §E remain.
- **Status:** Not started. Source foundation: retain original parent qualification J5–J8 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified.
- **PR / Evidence:** §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only.
- **Acceptance:** Real persisted HELP/PANIC send→receipt→acknowledge→resolve; pending/failure/retry/network fallback, permission/audit evidence; no false acknowledgement or automatic recovery resolution; FE #117 truthfulness retained. Split transport, lifecycle, UI/fallback PRs after contract. CLOSE-1 and original container closure rules in §E.
- **Blocker / Decision:** Every live Solo/Team stage; L3. No broad implementation or undefined child ID authorized.

<a id="detail-j9-dec-1"></a>

### Preservation detail — J9-DEC-1

- **Task ID:** J9-DEC-1
- **Parent / Phase:** [J9](TedixHunt_Master_Execution_Plan.md#task-j9); J9 Decision/deferred
- **Deliverable:** Only original next bounded action: I12/I13 and B6/D9/J incident lifecycle; explicit later scope approval.
- **Dependencies:** I12/I13 and B6/D9/J incident lifecycle; explicit later scope approval. Content-chain, authority and stage gates in §E remain.
- **Status:** Deferred. Source foundation: retain original parent qualification J9 Decision/deferred. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified.
- **PR / Evidence:** §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only.
- **Acceptance:** Shared operations map visibility and checkpoint consequences follow approved backend authority; Supervisors request/report unless separately authorized. No prototype operational claims. CLOSE-1 and original container closure rules in §E.
- **Blocker / Decision:** Later Mapbox M5 only. No broad implementation or undefined child ID authorized.

<a id="detail-k1-exec-1"></a>

### Preservation detail — K1-EXEC-1

- **Task ID:** K1-EXEC-1
- **Parent / Phase:** [K1](TedixHunt_Master_Execution_Plan.md#task-k1), [K2](TedixHunt_Master_Execution_Plan.md#task-k2), [K3](TedixHunt_Master_Execution_Plan.md#task-k3); K1–K3 Not started
- **Deliverable:** Only original next bounded action: Authoritative I7–I9/I11 outcomes; ranking/tie/cross-mode policy before dependent behavior.
- **Dependencies:** Authoritative I7–I9/I11 outcomes; ranking/tie/cross-mode policy before dependent behavior. Content-chain, authority and stage gates in §E remain.
- **Status:** Not started. Source foundation: retain original parent qualification K1–K3 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified.
- **PR / Evidence:** §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only.
- **Acceptance:** Idempotent final aggregation/results; +100 once and preserved earned points, no arrival-only finish; multi-team concurrency, restore, privacy and no fabricated ranks. Stage A results before expansion; contract then aggregation/read API/UI slices. CLOSE-1 and original container closure rules in §E.
- **Blocker / Decision:** Truthful pilot results and leaderboard acceptance. No broad implementation or undefined child ID authorized.

<a id="detail-k4-dec-1"></a>

### Preservation detail — K4-DEC-1

- **Task ID:** K4-DEC-1
- **Parent / Phase:** [K4](TedixHunt_Master_Execution_Plan.md#task-k4), [K5](TedixHunt_Master_Execution_Plan.md#task-k5), [K6](TedixHunt_Master_Execution_Plan.md#task-k6); K4–K6 Decision/deferred
- **Deliverable:** Only original next bounded action: Real K1–K3; separate award/assignment/physical eligibility decisions.
- **Dependencies:** Real K1–K3; separate award/assignment/physical eligibility decisions. Content-chain, authority and stage gates in §E remain.
- **Status:** Deferred. Source foundation: retain original parent qualification K4–K6 Decision/deferred. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified.
- **PR / Evidence:** §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only.
- **Acceptance:** Record rules, tie/eligibility/fulfillment boundary and allowed roles; configuration is not award/inventory; preserve existing reward settings. CLOSE-1 and original container closure rules in §E.
- **Blocker / Decision:** Later reward work only. No broad implementation or undefined child ID authorized.

<a id="detail-l1-verify-1"></a>

### Preservation detail — L1-VERIFY-1

- **Task ID:** L1-VERIFY-1
- **Parent / Phase:** [L1](TedixHunt_Master_Execution_Plan.md#task-l1); L1 Partially implemented
- **Deliverable:** Only original next bounded action: Verify Users & Roles/audit/dependency coverage at pinned BE; proposal-only deletion concern remains open.
- **Dependencies:** Verify Users & Roles/audit/dependency coverage at pinned BE; proposal-only deletion concern remains open. Content-chain, authority and stage gates in §E remain.
- **Status:** Not started. Source foundation: retain original parent qualification L1 Partially implemented. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified.
- **PR / Evidence:** §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only.
- **Acceptance:** Reproduce proposal-only Creator/reviewer retirement-vs-FK behavior in disposable DB before repair; role invariants/retained reviews/suspension attribution, no destructive history deletion; separate bounded fix if needed. CLOSE-1 and original container closure rules in §E.
- **Blocker / Decision:** Full account-history/audit claim; not F7-FE-01. No broad implementation or undefined child ID authorized.

<a id="detail-l2-exec-1"></a>

### Preservation detail — L2-EXEC-1

- **Task ID:** L2-EXEC-1
- **Parent / Phase:** [L2](TedixHunt_Master_Execution_Plan.md#task-l2), [L3](TedixHunt_Master_Execution_Plan.md#task-l3), [L6](TedixHunt_Master_Execution_Plan.md#task-l6); L2/L3/L6 Not started
- **Deliverable:** Only original next bounded action: B6/J real events/incident authority; define oversight, Safety Alerts and audit contracts.
- **Dependencies:** B6/J real events/incident authority; define oversight, Safety Alerts and audit contracts. Content-chain, authority and stage gates in §E remain.
- **Status:** Not started. Source foundation: retain original parent qualification L2/L3/L6 Not started. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified.
- **PR / Evidence:** §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only.
- **Acceptance:** Persisted authorized oversight, delivery/ack/resolve linked to actual incidents, immutable actor/time/evidence with privacy; demo cards do not qualify. Split oversight/alerts/audit after contract. CLOSE-1 and original container closure rules in §E.
- **Blocker / Decision:** Full operational governance, not basic read-only Creator development. No broad implementation or undefined child ID authorized.

<a id="detail-l4-dec-1"></a>

### Preservation detail — L4-DEC-1

- **Task ID:** L4-DEC-1
- **Parent / Phase:** [L4](TedixHunt_Master_Execution_Plan.md#task-l4), [L5](TedixHunt_Master_Execution_Plan.md#task-l5); L4/L5 Not started, approval/scope required
- **Deliverable:** Only original next bounded action: Inventory depends on approved reward fulfillment; settings need narrow platform policy/API.
- **Dependencies:** Inventory depends on approved reward fulfillment; settings need narrow platform policy/API. Content-chain, authority and stage gates in §E remain.
- **Status:** Not started; approval/scope required (parents L4/L5 remain Not started). Source foundation: retain original parent qualification L4/L5 Not started, approval/scope required. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified.
- **PR / Evidence:** §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only.
- **Acceptance:** Decide inventory/settings rules separately, authorization and audit requirements; no new product scope or prototype-as-implementation; implementation only after scoped contracts. CLOSE-1 and original container closure rules in §E.
- **Blocker / Decision:** Dependent inventory/settings capabilities only. No broad implementation or undefined child ID authorized.

<a id="detail-m1-dec-1"></a>

### Preservation detail — M1-DEC-1

- **Task ID:** M1-DEC-1
- **Parent / Phase:** [M1](TedixHunt_Master_Execution_Plan.md#task-m1), [M2](TedixHunt_Master_Execution_Plan.md#task-m2), [M3](TedixHunt_Master_Execution_Plan.md#task-m3), [M4](TedixHunt_Master_Execution_Plan.md#task-m4), [M5](TedixHunt_Master_Execution_Plan.md#task-m5); M1–M5 Decision/deferred
- **Deliverable:** Only original next bounded action: Persisted I/K completion/results and separately approved long-term rules.
- **Dependencies:** Persisted I/K completion/results and separately approved long-term rules. Content-chain, authority and stage gates in §E remain.
- **Status:** Deferred. Source foundation: retain original parent qualification M1–M5 Decision/deferred. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified.
- **PR / Evidence:** §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only.
- **Acceptance:** Map Passport/history/achievements/collectibles/profile to real source events, privacy/retention and no double credit; no balance or achievement inferred from chosen reward category. Decision-only now. CLOSE-1 and original container closure rules in §E.
- **Blocker / Decision:** Later long-term Participant work only. No broad implementation or undefined child ID authorized.

<a id="detail-n1-dec-1"></a>

### Preservation detail — N1-DEC-1

- **Task ID:** N1-DEC-1
- **Parent / Phase:** [N1](TedixHunt_Master_Execution_Plan.md#task-n1), [N2](TedixHunt_Master_Execution_Plan.md#task-n2), [N3](TedixHunt_Master_Execution_Plan.md#task-n3), [N4](TedixHunt_Master_Execution_Plan.md#task-n4), [N5](TedixHunt_Master_Execution_Plan.md#task-n5), [N6](TedixHunt_Master_Execution_Plan.md#task-n6); N1–N6 Decision/deferred
- **Deliverable:** Only original next bounded action: Approved request/orchestration contract and F/G/D content supply chain.
- **Dependencies:** Approved request/orchestration contract and F/G/D content supply chain. Content-chain, authority and stage gates in §E remain.
- **Status:** Deferred. Source foundation: retain original parent qualification N1–N6 Decision/deferred. Contract/BE/FE for future implementation not verified; integrated/deployed acceptance unverified.
- **PR / Evidence:** §F parent phase/history; no new implementation is inferred. H1 lookup, L1 account controls and FE #117 truthfulness are existing foundations only.
- **Acceptance:** Persist request→triage→assignment→Creator→independent exact Admin review→Organizer delivery; scoped roles, no self-approval, no invented pricing/deadlines/statuses/API. Decision/contract first; later each phase a bounded slice. CLOSE-1 and original container closure rules in §E.
- **Blocker / Decision:** Custom-request work only, not ordinary Local creation. No broad implementation or undefined child ID authorized.

<a id="detail-c6b-2"></a>

### Preservation detail — C6b-2

- **Task ID:** C6b-2
- **Parent / Phase:** F7/G4 provider branch; existing Master §6 row, not a new task
- **Deliverable:** Mapbox permanent-result persistence under verified account entitlement; do not alter provider architecture.
- **Dependencies:** PO-PROVIDER account-specific permanent storage, sharing, backups, post-termination retention, attribution and target settlement coverage evidence.
- **Status:** Blocked. Contract/entitlement: unverified; provider implementation: Not started; integration/deployment: unverified.
- **PR / Evidence:** Original Master §6 remaining-scope row and §9 blocker; no provider persistence or entitlement evidence recorded.
- **Acceptance:** Verify the exact account rights and approved contract before provider work; no temporary Search Box persistence or laundering through manual proposals.
- **Blocker / Decision:** Unresolved licensing/retention. Stored/manual Creator/Admin development remains available.

## Status display mapping

Every old status value is preserved in its frozen detail record; the compact column abbreviates it as below. This is presentation-only. No source, integration or deployment dimension changes. Parent kind is a separate column.

| Task ID | Compact status | Exact unchanged status/dimensions |
| --- | --- | --- |
| A1 | Partial foundation; verification not started | [A1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-a1) |
| A2 | Partial foundation; verification not started | [A2 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-a2) |
| A3 | Partial foundation; verification not started | [A3 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-a3) |
| A4 | Partial foundation; verification not started | [A4 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-a4) |
| A5 | Partial foundation; verification not started | [A5 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-a5) |
| A6 | Partial foundation; verification not started | [A6 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-a6) |
| B1 | Partial foundation; verification not started | [B1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-b1) |
| B1.1 | Partial foundation; verification not started | [B1.1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-b1-1) |
| B2 | Partial foundation; verification not started | [B2 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-b2) |
| B3 | Partial foundation; verification not started | [B3 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-b3) |
| B4 | Partial foundation; verification not started | [B4 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-b4) |
| B5 | Partial foundation; verification not started | [B5 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-b5) |
| B6 | Not started | [B6 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-b6) |
| C1 | Partial foundation; verification not started | [C1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-c1) |
| C2 | Partial foundation; verification not started | [C2 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-c2) |
| C3 | Partial foundation; verification not started | [C3 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-c3) |
| C4 | Partial foundation; verification not started | [C4 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-c4) |
| D1 | Partial foundation; verification not started | [D1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-d1) |
| D2 | Partial foundation; verification not started | [D2 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-d2) |
| D3 | Partial foundation; verification not started | [D3 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-d3) |
| D4 | Partial foundation; verification not started | [D4 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-d4) |
| D5 | Partial foundation; verification not started | [D5 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-d5) |
| D6 | Partial foundation; verification not started | [D6 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-d6) |
| D7 | Partial foundation; verification not started | [D7 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-d7) |
| D8 | Partial foundation; verification not started | [D8 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-d8) |
| D9 | Not started | [D9 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-d9) |
| D10 | Blocked; FE not started | [D10 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-d10) |
| E1 | Partial foundation; verification not started | [E1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-e1) |
| E2 | Partial foundation; verification not started | [E2 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-e2) |
| E3 | Partial foundation; verification not started | [E3 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-e3) |
| E4 | Partial foundation; verification not started | [E4 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-e4) |
| E5 | Partial foundation; verification not started | [E5 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-e5) |
| E6 | Partial foundation; verification not started | [E6 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-e6) |
| E7 | Partial foundation; verification not started | [E7 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-e7) |
| E8 | Partial foundation; verification not started | [E8 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-e8) |
| E9 | Partial foundation; verification not started | [E9 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-e9) |
| E10 | Partial foundation; verification not started | [E10 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-e10) |
| E11 | Partial foundation; verification not started | [E11 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-e11) |
| E12 | Partial foundation; verification not started | [E12 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-e12) |
| E13 | Partial foundation; verification not started | [E13 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-e13) |
| E14 | Partial foundation; verification not started | [E14 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-e14) |
| E15 | Partial foundation; verification not started | [E15 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-e15) |
| E16 | Partial foundation; verification not started | [E16 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-e16) |
| E17 | Partial foundation; verification not started | [E17 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-e17) |
| F1 | Partial foundation; verification not started | [F1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-f1) |
| F2 | Partial foundation; verification not started | [F2 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-f2) |
| F3 | Partial foundation; verification not started | [F3 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-f3) |
| F4 | Partial foundation; verification not started | [F4 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-f4) |
| F5 | Partial foundation; verification not started | [F5 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-f5) |
| F6 | Partial foundation; verification not started | [F6 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-f6) |
| F7 | Partial foundation; verification not started | [F7 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-f7) |
| G1 | Partial foundation; verification not started | [G1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-g1) |
| G2 | Partial foundation; verification not started | [G2 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-g2) |
| G3 | Partial foundation; verification not started | [G3 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-g3) |
| G4 | Partial foundation; verification not started | [G4 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-g4) |
| H1 | Merged — source verified (lookup only) | [H1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-h1) |
| H2 | Not started | [H2 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-h2) |
| H3 | Not started | [H3 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-h3) |
| H4 | Not started | [H4 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-h4) |
| H5 | Not started | [H5 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-h5) |
| H6 | Not started | [H6 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-h6) |
| H7 | Not started | [H7 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-h7) |
| H8 | Not started | [H8 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-h8) |
| I1 | Not started | [I1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-i1) |
| I2 | Not started | [I2 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-i2) |
| I3 | Not started | [I3 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-i3) |
| I4 | Not started | [I4 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-i4) |
| I5 | Not started | [I5 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-i5) |
| I6 | Not started | [I6 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-i6) |
| I7 | Not started | [I7 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-i7) |
| I8 | Not started | [I8 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-i8) |
| I9 | Not started | [I9 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-i9) |
| I10 | Not started | [I10 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-i10) |
| I11 | Not started | [I11 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-i11) |
| I12 | Not started | [I12 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-i12) |
| I13 | Not started | [I13 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-i13) |
| I14 | Deferred | [I14 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-i14) |
| J1 | Not started | [J1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-j1) |
| J2 | Not started | [J2 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-j2) |
| J3 | Not started | [J3 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-j3) |
| J4 | Not started | [J4 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-j4) |
| J5 | Not started | [J5 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-j5) |
| J6 | Not started | [J6 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-j6) |
| J7 | Not started | [J7 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-j7) |
| J8 | Not started | [J8 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-j8) |
| J9 | Deferred | [J9 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-j9) |
| K1 | Not started | [K1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-k1) |
| K2 | Not started | [K2 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-k2) |
| K3 | Not started | [K3 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-k3) |
| K4 | Deferred | [K4 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-k4) |
| K5 | Deferred | [K5 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-k5) |
| K6 | Deferred | [K6 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-k6) |
| L1 | Partial foundation; verification not started | [L1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-l1) |
| L2 | Not started | [L2 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-l2) |
| L3 | Not started | [L3 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-l3) |
| L4 | Not started | [L4 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-l4) |
| L5 | Not started | [L5 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-l5) |
| L6 | Not started | [L6 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-l6) |
| M1 | Deferred | [M1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-m1) |
| M2 | Deferred | [M2 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-m2) |
| M3 | Deferred | [M3 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-m3) |
| M4 | Deferred | [M4 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-m4) |
| M5 | Deferred | [M5 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-m5) |
| N1 | Deferred | [N1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-n1) |
| N2 | Deferred | [N2 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-n2) |
| N3 | Deferred | [N3 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-n3) |
| N4 | Deferred | [N4 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-n4) |
| N5 | Deferred | [N5 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-n5) |
| N6 | Deferred | [N6 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-n6) |
| F7-FE-01 | Merged — source verified | [F7-FE-01 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-f7-fe-01) |
| F7-FE-02 | Not started | [F7-FE-02 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-f7-fe-02) |
| F7-FE-03 | Not started | [F7-FE-03 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-f7-fe-03) |
| F7-FE-04 | Not started | [F7-FE-04 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-f7-fe-04) |
| F7-FE-05 | Not started | [F7-FE-05 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-f7-fe-05) |
| F7-FE-06 | Not started | [F7-FE-06 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-f7-fe-06) |
| F7-FE-07 | Not started | [F7-FE-07 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-f7-fe-07) |
| F7-FE-08 | Not started | [F7-FE-08 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-f7-fe-08) |
| F7-FE-09 | Not started | [F7-FE-09 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-f7-fe-09) |
| F7-FE-10 | Not started | [F7-FE-10 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-f7-fe-10) |
| F7-FE-11 | Not started | [F7-FE-11 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-f7-fe-11) |
| F7-FE-12 | Not started | [F7-FE-12 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-f7-fe-12) |
| F7-FE-13 | Not started | [F7-FE-13 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-f7-fe-13) |
| G4-FE-01 | Not started | [G4-FE-01 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-g4-fe-01) |
| G4-FE-02 | Not started | [G4-FE-02 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-g4-fe-02) |
| G4-FE-03 | Not started | [G4-FE-03 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-g4-fe-03) |
| G4-FE-04 | Not started | [G4-FE-04 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-g4-fe-04) |
| G4-FE-05 | Not started | [G4-FE-05 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-g4-fe-05) |
| G4-DEC-01 | Deferred | [G4-DEC-01 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-g4-dec-01) |
| G4-BE-01 | Blocked | [G4-BE-01 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-g4-be-01) |
| G4-BE-02 | Blocked | [G4-BE-02 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-g4-be-02) |
| G4-BE-03 | Deferred | [G4-BE-03 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-g4-be-03) |
| G4-FE-06 | Blocked | [G4-FE-06 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-g4-fe-06) |
| G4-FE-07 | Blocked | [G4-FE-07 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-g4-fe-07) |
| D10-GATE | Blocked | [D10-GATE baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-d10-gate) |
| D10-FE-01 | Blocked | [D10-FE-01 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-d10-fe-01) |
| D10-FE-02 | Blocked | [D10-FE-02 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-d10-fe-02) |
| D10-FE-03 | Blocked | [D10-FE-03 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-d10-fe-03) |
| D10-FE-04 | Blocked | [D10-FE-04 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-d10-fe-04) |
| D10-FE-05 | Blocked | [D10-FE-05 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-d10-fe-05) |
| D10-FE-06 | Blocked | [D10-FE-06 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-d10-fe-06) |
| D10-FE-07 | Blocked | [D10-FE-07 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-d10-fe-07) |
| D10-FE-08 | Blocked | [D10-FE-08 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-d10-fe-08) |
| D10-E2E-01 | Blocked | [D10-E2E-01 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-d10-e2e-01) |
| D10-E2E-02 | Blocked | [D10-E2E-02 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-d10-e2e-02) |
| H1-VERIFY-1 | Not started | [H1-VERIFY-1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-h1-verify-1) |
| H2-EXEC-1 | Not started | [H2-EXEC-1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-h2-exec-1) |
| H4-EXEC-1 | Not started | [H4-EXEC-1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-h4-exec-1) |
| H5-EXEC-1 | Not started | [H5-EXEC-1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-h5-exec-1) |
| H8-EXEC-1 | Not started | [H8-EXEC-1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-h8-exec-1) |
| I1-EXEC-1 | Not started | [I1-EXEC-1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-i1-exec-1) |
| I5-EXEC-1 | Not started | [I5-EXEC-1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-i5-exec-1) |
| I7-EXEC-1 | Not started | [I7-EXEC-1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-i7-exec-1) |
| I11-EXEC-1 | Not started | [I11-EXEC-1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-i11-exec-1) |
| I12-EXEC-1 | Not started | [I12-EXEC-1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-i12-exec-1) |
| I13-EXEC-1 | Not started | [I13-EXEC-1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-i13-exec-1) |
| I10-EXEC-1 | Not started | [I10-EXEC-1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-i10-exec-1) |
| I14-DEC-1 | Deferred | [I14-DEC-1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-i14-dec-1) |
| J1-EXEC-1 | Not started | [J1-EXEC-1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-j1-exec-1) |
| J5-EXEC-1 | Not started | [J5-EXEC-1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-j5-exec-1) |
| J9-DEC-1 | Deferred | [J9-DEC-1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-j9-dec-1) |
| K1-EXEC-1 | Not started | [K1-EXEC-1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-k1-exec-1) |
| K4-DEC-1 | Deferred | [K4-DEC-1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-k4-dec-1) |
| L1-VERIFY-1 | Not started | [L1-VERIFY-1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-l1-verify-1) |
| L2-EXEC-1 | Not started | [L2-EXEC-1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-l2-exec-1) |
| L4-DEC-1 | Not started; scope approval required | [L4-DEC-1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-l4-dec-1) |
| M1-DEC-1 | Deferred | [M1-DEC-1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-m1-dec-1) |
| N1-DEC-1 | Deferred | [N1-DEC-1 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-n1-dec-1) |
| C6b-2 | Blocked | [C6b-2 baseline](TedixHunt_Execution_Plan_Reconciliation.md#detail-c6b-2) |

## PR #124 correction verification

This update changes only the new operational plan and this reconciliation report. Original planning documents remain byte-identical to the previous PR head, including their supersession notices; all application, architecture, contract, report, migration and runtime-test paths remain unchanged. No task was added, renamed, removed, reordered, promoted or reset. One current next-candidate instruction remains in plan §G: F7-FE-02. F7-FE-01 retains merged-source completion; D10 and C6b-2 restrictions remain.

| Document | Before lines | After lines |
| --- | --- | --- |
| TedixHunt_Master_Execution_Plan.md | 3104 | 338 |
| TedixHunt_Execution_Plan_Reconciliation.md | 282 | 2732 |

Coverage: **109/109 original rows; 58/58 expanded IDs; 168/168 consolidated records; zero duplicate authoritative IDs, missing dependency/acceptance fields, broken references or unauthorized status changes.** Per-record/source-cell, status-map, exact-order, Markdown/reference and whitespace checks were re-run. GitHub committed-tree and compare checks verify the same two Markdown correction paths and the preserved four-document total PR boundary. No application tests were run for this documentation-only correction.

**Existing Draft PR #124 only. Stop for ChatGPT review; do not merge or deploy.**
