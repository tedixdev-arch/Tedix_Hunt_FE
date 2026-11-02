# PO-GATE — D10 bounded Organizer development (proposed)

Date: 3 November 2026 (Europe/Bucharest). Target: `tedixdev-arch/Tedix_Hunt_FE`; BE reference is read-only.
**Status: PROPOSED — awaiting explicit Product Owner approval. Not an authorization to implement, merge, deploy or activate Hunts.**

## Decision requested and effect

**Authorize D10 Organizer FE development and isolated testing, but not public activation.**

On explicit PO approval recorded against this document/revision, clarify PO-GATE and architecture §20.2 only for the bounded development scope below: incomplete full Creator/Admin integration, production catalog/compatibility rollout and safety/validity governance cease to be blanket prerequisites to isolated D10 development. They remain prerequisites to applicable integrated acceptance and public activation. This resolves the integration/development discrepancy identified in the D10 readiness report; it does not declare those prerequisites satisfied.

[Master Plan §A.7 and §E](../TedixHunt_Master_Execution_Plan.md#e-dependencies-and-decision-gates) reserve governance changes for the PO and require a specific clarification before any D10 slice. [Reconciliation PO-GATE and D10-GATE](../TedixHunt_Execution_Plan_Reconciliation.md#detail-d10-gate) permit an explicit approved scope clarification, not an inferred non-public exception. Accordingly, both governing plans remain unchanged in this PR; §6 contains reviewable proposed amendments. Drafting or merging documentation alone is not PO approval. Until explicit approval, all current D10 blocking rules remain effective. D10-FE-01 is not implemented here.

## 1. Current rules and verified evidence

[Architecture §20.2](../TedixHunt_Prototype_Architecture_Implementation_Plan.md#202-staged-workstreams-before-participant-runtime) requires Creator category/reuse/location flows, representative independent Admin review, reviewed Local catalog, compatibility and applicable readiness before D10 integration/activation, and explicitly preserves stricter prerequisites. [D10 readiness report](../D10_Organizer_Integration_Readiness_Report.md) therefore stopped implementation; hidden routes, flags and no-deploy promises do not waive the rule.

Reviewed FE main `eaa21a7b8b1305fcf11c19e11a7b01538c7402d5` (#154), current governing documents, merged PR metadata and referenced source/reports. GitHub confirms the PRs below are merged. Implementation evidence is separate from integrated acceptance.

| Area | Merged implementation/evidence | Current acceptance boundary |
| --- | --- | --- |
| Creator F7 | FE [#123](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/123), [#125](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/125), [#127](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/127), [#128](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/128), [#129](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/129) cover F7-FE-01–12: categories, Universal reuse, standalone Local, geography, proposals, revisions and exact submission. #129 merge: `02ac108f22bdfca3b71223de922842518eca8f09`. | The old D10 report's pending-category statements are historical, not current source status. [#133](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/133), merge `902da16a1897f49ef0ef604e341f941109d6d22a`, records F7-FE-13 regression, with real integration BLOCKED. |
| Current Creator integration readiness | FE [#153](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/153) audit and [#154](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/154) disposable harness are merged. [Harness evidence](../qa/CUX-05B-1-Integration-Harness.md) explicitly says authenticated execution has not run. | Prepared adapter/browser infrastructure is not a passed UI or real-account workflow. CUX-05B-2 needs its authorized disposable DB, migrations, accounts, locality and managed browser; broader negative/concurrent coverage remains. |
| Admin G4 | FE [#130](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/130), merge `a113eb2d6c8073c4867f5940f90266950532e1fa`, implements G4-FE-01–05: exact inspection, independent decisions, retained Local approval, explicit suspension and locality review. | Source and fixtures do not complete G4. Real independent-actor acceptance, full evidence/validity governance, G4-DEC-01 and dependent BE/FE remain open. |
| BE C7 | BE [#89](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/89), merge `bcf1fda4153cc8ea787c4d7e5922f4cb4b34ee32`: discovery, allowlisted preview and atomic exact-version draft selection; current route and implementation report inspected read-only. | Reported disposable PostgreSQL/source checks are bounded BE evidence, not D10 FE acceptance or safety certification. BE [#92](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/92) also explicitly leaves genuine independent-account integration blocked. |

Later Organizer setup changes ([FE #140](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/140), [#143](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/143)) are existing builder foundations, not evidence of completed C7 FE integration. The current Hunts API still exposes legacy template-key selection. Reuse existing `src/pages/OrganizerSetupFlow.tsx` and `src/pages/CustomHuntEditor.tsx`; do not create a second builder. No integrated, deployed or production-ready ecosystem claim follows from these merges.

## 2. Bounded scope after approval

- Use the existing authenticated Organizer workflow, API/session client and builder, preserving backend persisted-role and Hunt-specific authority.
- Integrate existing BE C7 Local Hunt discovery, read-only preview and exact-version selection: GET `/api/organizer/local-templates`, GET `/api/organizer/local-templates/{templateId}/versions/{version}`, PUT `/api/hunts/{id}/local-template` with only `{templateId, version, countryCode, localityId}`.
- Use approved Local Hunt fixtures in explicitly identified disposable environments. Real integration fixtures must pass existing Creator submission and independent Admin approval; mocks must be labeled and cannot count as integrated acceptance. Never forge approvals or safety evidence.
- Permit local tests and non-public integration verification against isolated FE/BE/DB services, with recorded revisions, migrations, independent actors, fixture identities/versions and cleanup boundary. Missing setup leaves execution blocked, not waived.
- Preserve existing task IDs, bounded slice scopes and dependency order. Approval removes only this blanket development blocker; verify each slice's own prerequisites before work. It neither implements D10-FE-01 nor authorizes unrelated G4/H–N work.
- No deployment, shared-environment rollout or public activation is authorized. Existing test infrastructure may be reused within its documented scope; the Creator-only harness is not evidence of Organizer coverage.

Restrictions: no backend eligibility or independent-approval bypass; no production data modifications; no fabricated safety certification; no real Hunt publication/start authorization; no silent legacy migration; no new authorization exceptions or hidden feature flags; no modification of immutable approved versions. All public routes and existing publish/start policies retain their current authority. A future implementation that needs a wider contract or permission must stop at that boundary.

C7 discovery remains advisory and the backend makes the final eligibility decision. Use exact server references, never “latest,” client snapshots or automatic replacement. On stale selection, clear the choice, refresh and require explicit reselection. Keep saved locality snapshots distinct from current registry facts; disclose no private approval evidence, answers or suspension reasons through Organizer preview. Stored/manual catalog use does not authorize temporary-provider persistence or resolve C6b-2 rights.

## 3. Intended Organizer experience

**Choose Country/City → Select Local Hunt → Configure Event → Review and Launch.**

“City” is user-facing language for the backend locality identity, including other supported locality types. Show only backend-supported countries/localities; preserve locality UUID/context internally. This journey is a UX target, not launch authorization. Launch stays subject to existing readiness/safety gates and remains unavailable for real Hunts under this decision.

Use a simple, useful, intuitive and ergonomic flow with minimum decisions/screens and progressive disclosure. Reuse the current configuration editor. Show readable Local Hunt cards and a read-only Hunt/map preview; keep technical version references internal with no version picker. Do not duplicate Creator authoring. Provide clear loading, empty, error, retry, saving and saved states; preserve input and handle stale/auth failures. Report success only after the relevant server commit, with no simulated save, publication or launch messages. Keyboard and responsive use remain acceptance requirements.

## 4. Legacy compatibility

Explicitly preserve both existing legacy Signal Hunts: **canonical Signal v1** and **Signal Overload Cluj-Napoca**.

No forced Universal/Local classification, automatic conversion, snapshot rewriting, inferred eligibility or approval backfill. Existing historical Hunts remain accessible under existing authorization; immutable versions, provenance, reviews and Hunt snapshots remain intact. Classified C7 selection must not silently remove historical legacy access. Any legacy activation, transition, migration or staged rollout remains separately governed by **PO-LEGACY**. Compatibility regression tests are permitted; this decision does not approve a transition.

## 5. Acceptance and production requirements remain separate

| Dimension | What this proposal would permit | What remains required |
| --- | --- | --- |
| D10 development authorization | After explicit recorded PO approval only: isolated FE implementation/local tests/non-public verification within §2. | Per-slice contracts, backend authority, reviewed disposable fixtures and actual test setup; no blanket task completion. |
| D10 integrated acceptance | Collect bounded real FE→BE→PostgreSQL evidence in disposable environments. | Actual independent Creator/Admin/Organizer actors, exact FE/BE SHAs and versions, both Local origins/cross-Creator reuse where applicable, selection/persistence/reopen, denied/stale/suspension/geography/concurrency and immutable legacy/snapshot outcomes. Record only exercised cases; mocked suites and harness preparation cannot close F7/G4/D10. Full acceptance remains open until all applicable criteria pass. |
| D10 public activation | None. D10-GATE is not fully complete. | Complete applicable Creator/Admin/content-chain acceptance, reviewed production Local catalog and compatibility rollout; PO-LEGACY; G4-DEC-01/PO-SAFETY and dependent enforcement; separately authorized deployment, deployed supply-chain E2E and release gates. |

**G4-DEC-01 is not resolved by this narrow decision.** It still requires a written PO decision distinguishing Universal content approval, Local geographic approval and physical safety; proportional route/access evidence and qualified independent review responsibilities; validity/expiry/re-review triggers, operating conditions, failure behavior, publish/start enforcement and existing-Hunt consequences. Review safe/blocked/expired and historical/Signal examples before claiming closure; implement and verify applicable G4 governance contracts afterward.

PO-FEEDBACK visibility/retention and full-workflow consequences remain separately governed. PO-PROVIDER/C6b-2 rights remain mandatory for provider persistence; stored/manual-only verification does not satisfy them. Reinstatement/historical remediation remain deferred unless separately approved. G0–G6, architecture §20.3–20.4, live-stage safety/operations, migrations/provider/device evidence and any explicit parallel-pilot approval remain applicable; this proposal creates no pilot exception.

## 6. Proposed minimal plan amendments — review text only

Apply only after explicit PO approval referencing this decision/revision. Do not change the frozen reconciliation baseline or historical evidence. No new task IDs, reordered work or wholesale status resets.

1. **Master Execution Plan §E, first bullet:** replace its development/integration clarification with:

   > Development versus activation: D10 remains blocked until explicit PO approval of PO_D10_Bounded_Development. Once recorded, that decision clarifies architecture §20.2 and the D10 readiness report solely to permit existing D10 FE slices and isolated/non-public verification within its bounded scope, subject to each slice's prerequisites. Full Creator/Admin integration, production reviewed catalog/compatibility and safety/validity governance remain acceptance/activation requirements. D10-GATE is partially clarified for development only, not fully complete; no deployment, public activation or legacy transition is authorized.

2. **Master §C D10-GATE and affected D10 blockers, with derived §B/§G wording only:** record the approval reference/date and “Development scope authorized — bounded; integrated acceptance unverified; public activation blocked.” Remove only the blanket development stop for eligible slices; do not mark slices implemented/merged/integrated. Keep D10 parent and full gate incomplete, all production blockers linked, unrelated statuses/order unchanged. Task selection still verifies exact dependencies.
3. **Reconciliation, “Dependency order and decisions,” PO-GATE row and D10-GATE detail:** append the same approved bounded clarification and separate development/integrated/public dimensions. Supersede only the blanket statement “Blocks every D10 FE implementation slice” within this scope; retain original frozen/history text with a dated superseding reference. PO-GATE is resolved only for bounded development, not full ecosystem readiness. PO-LEGACY, PO-SAFETY/G4-DEC-01 and every unaffected requirement remain open.
4. **Architecture/report conflict:** the approved decision must explicitly serve as the narrow §20.2 scope clarification; preserve full integration/activation requirements and the original report as historical evidence. Any later architecture synchronization should reference that approval, not silently reinterpret the report or treat this draft as governing.

## 7. Review record and delivery boundary

PO disposition: **PENDING**. Approver, approval date, reviewed revision and approval reference: **not recorded**. Requested outcome: approve or reject the bounded scope and proposed amendments; no safety/legacy or production approval is requested.

This PR adds only this decision document. No governing plan, application code, tests, backend, migrations, runtime configuration, flags or deployment changes. Documentation validation covers links, exact evidence references, whitespace and the one-file PR boundary; no fresh runtime/integration/E2E test results are claimed. Existing reports' test results are attributed evidence only. Git shell fetch failed at the configured proxy; GitHub connector reads supplied current-main and merge verification and documentation delivery. Stop at Draft PR for review; do not merge or deploy.
