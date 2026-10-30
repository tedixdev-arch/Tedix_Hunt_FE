# G4-FE-01–05 — Admin FE governance batch

30 October 2026 (Europe/Bucharest). [Draft PR #130](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/130), `codex/g4-admin-governance`. Stop for ChatGPT review; do not merge or deploy.

| Task | Delivered commit | Evidence |
| --- | --- | --- |
| G4-FE-01 | `cd08647` | [Review categories and exact inspection](evidence/G4_FE_01.md) |
| G4-FE-02 | `f1f1c92` | [Independent exact decisions](evidence/G4_FE_02.md) |
| G4-FE-03 | `a9e4781` | [Local binding/retained inspection](evidence/G4_FE_03.md) |
| G4-FE-04 | `4589ca3` | [Explicit suspension](evidence/G4_FE_04.md) |
| G4-FE-05 | This task commit | [Manual locality decisions and shared regression](evidence/G4_FE_05.md) |

## Source and contract basis

Read Master Execution Plan, frozen reconciliation G4 acceptance/dependencies and architecture v3.6 lifecycle/compatibility/gate rules. Base is verified latest FE main `02ac108f22bdfca3b71223de922842518eca8f09`, merged #129. Inspected actual BE routes `adminTemplateReviews.ts`, `adminTemplateEligibility.ts`, `localityProposals.ts`, plus HuntTemplate/LocalityProposal models at BE main `a7df0f963feb8b431dfa83913eeca0facc43c116`. No missing backend dependency for this bounded batch; no invented fields or filters.

Git transport could not reach its configured proxy. The complete main source was retrieved through the GitHub connector; its local tree equals GitHub tree `56afee77cd2209140febb0a78aa35349f579ec70`. Each delivered task tree is compared with the tested local tree. Delivered commits are rooted in actual main; the local reconstruction checkpoint is not included in the PR.

## Simplicity and behavior

One existing guarded Admin workspace: **Choose category → Select item → Inspect → Decide**. Universal / Local / Locality proposals / Legacy are filters, not new routes/pages. Existing review routes render the same workspace, side by side at desktop widths and stacked at narrow widths. Existing Admin guards, authenticated API client, persisted-value renderer and read-only maps are reused. No Creator editor duplication, modal confirmation, wizard, checklist click ritual, autosave, new provider record or narrative Template feedback.

Exact submitted GET content owns inspection. Universal omits geographic controls. Local shows saved positions and FinishPoint, locality snapshot versus current registry and retained exact approved content versus candidate facts. The submitted-only queue has no approved-only list contract; Local key lookup permits retained inspection during revisions. Missing/inactive/material drift and historical evidence/binding/integrity exceptions remain explicit; no data repair or implicit authority.

Classified decisions send `{version}`; Legacy omits the body. User identity blocks self-approval even with both roles; backend remains authoritative. Self-request-changes is allowed by the actual backend. 409 refreshes inspection and requires a new action; mutations never retry automatically. Repeated clicks are locked. 401/403 clear private review content.

Suspension is a distinct disclosure within retained inspection, uses that exact version and required nonblank reason ≤1,000 characters, and displays server audit. Historical resolvable retained approvals may be suspended under the verified backend contract; unresolved pins cannot. Suspension excludes **NEW Organizer selection** and does not terminate existing Hunts. No reinstatement/reset control.

Locality approval/rejection requires independent human review and a reason of 10–1,000 characters. Registry results are only possible duplicates for inspection. Duplicate 409 stays pending; no merge or provider-derived creation. Pending queue and decision response are independent of Template decisions.

## Executed validation

- `npm test`: **41 Node test-file entries passed; 485 Vitest tests across 29 files passed**, zero failures/skips.
- `npm run typecheck`, `npm run build`, `git diff --check`: passed. Existing Vite bundle-size warning remains.
- Rendered/API tests: mixed queues/Legacy, exact request versions, repeated clicks, 409 new explicit decision, unauthorized/revoked access, combined-role self-approval/self-proposal denial, retained authority in revisions, saved label versus numeric drift, inactive/missing locality, unresolved historical pins, exact suspension/reason/audit, concurrent proposal decision, duplicate-pending, approved/rejected states and returned locality identity.
- Existing Admin geography/Signal and Creator/Universal/Local, snapshots, gameplay, auth and compatibility suites pass. Older Admin tests now supply auth context and assert preserved read-only map/decision behavior without a removed checklist.
- Chromium **1440/768/390/320px**: native Tab/Shift+Tab/Enter category navigation, selected exact geography and FinishPoint, retained v2 versus candidate v7, 409 explicit recovery, combined-role self-approval denial, suspension v2 request/audit/consequence, duplicate-pending and manual locality approval, no page errors/horizontal overflow. [Machine-readable evidence](evidence/G4_FE_Browser_Results.json). Browser screenshots were inspected; narrow-screen verification found and fixed saved expanded desktop sidebar behavior in the existing Admin shell.
- All **169 task IDs and order preserved**; frozen reconciliation is byte-identical. F7-FE-10–12 are merged-source via #129. G4-FE-01–05 are In review; F7-FE-13 remains Not started.

## Acceptance boundaries

| Dimension | Recorded result |
| --- | --- |
| FE source | Implemented for Draft review |
| Backend contracts | Existing source verified; no BE changes or new completion claim |
| Real integrated workflow | **Unverified** |
| Deployed acceptance | **Unverified** |

Fixtures do not establish real multi-account authorization/transactions, C7 list/PUT exclusion after suspension, persistence of existing Hunt snapshots, approved-proposal availability to a real Creator, or live provider behavior. No suitable real review accounts were configured; no live account/registry mutations were performed. Map fixtures exercise saved details and missing-token handling, not real provider rendering. No D10/F7-FE-13 acceptance, G4-BE-01/02/03, G4-DEC policy work, full route safety/validity/feedback contract, merge, migration or deployment was performed or promoted.
