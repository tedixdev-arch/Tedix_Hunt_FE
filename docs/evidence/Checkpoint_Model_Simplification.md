# Creator checkpoint model and seven Hunt Features

30 October 2026 (Europe/Bucharest). Bounded FE UX correction within existing F7-FE-01–12 implementation scope. One Draft FE PR for ChatGPT review; no merge or deployment. F7-FE-13 remains incomplete, real integration BLOCKED and deployed acceptance unverified. No task ID or frozen reconciliation changes.

## Preparation and actual old representation

Read the Master Execution Plan, reconciliation, relevant F7-FE-03–06/07–09/10–12 implementation reports, F7-FE-12 and current F7-FE-13 evidence. Inspected CreatorStudio hydration, count/feature state, gameplay editors, route/FinishPoint editors, validation, persistence/API serialization, starter catalog, legacy editable copies, Universal/Local paths and their tests. No AGENTS.md found. Only the FE repository was accessed.

Before source changes, the representation was recorded in the working notes. The actual storage is **not a unified array of physical locations**:

| Existing field | Existing meaning; unchanged after this PR |
| --- | --- |
| `configuration.normalCheckpointCount` | 1–20 regular locations, excluding FinishPoint |
| `configuration.checkpointPositions` | Numbered regular geographic locations |
| `configuration.finishPoint` | Separate terminal geography, including saved radius/name/coordinates |
| `checkpoints` | Gameplay entries: numbered regular entries and optional unnumbered `role: terminal` entry |
| `scoring`, mission/research and unknown supported content | Existing persistence and immutable-copy behavior |

Actual old UI was nine steps for Local/Legacy and eight for Universal, because Universal omitted Checkpoint Positions. The request's eight-step presentation therefore did not describe every path. Both now have exactly the requested seven named steps. Shared organizer feature definitions remain unchanged for Organizer flows; Creator filters Positions and Final Checkpoint from its own numbered list.

## New presentation and compatibility

The Creator count displays `normalCheckpointCount + 1`. An entered total is clamped to the translated existing bounds **2–21**, then converted back to regular count by subtracting one. State, geography resizing, hydration, serialization and API envelopes retain their existing meanings. Increasing the count does not invent coordinates; new physical locations remain unpositioned until explicitly placed.

The preview numbers every location, ending `07 🚩` for six regular checkpoints. Personal and Team Challenge steps each show the terminal selector and reuse the existing approved component selector, optional challenge choices, prototype Create new form, story and participant previews. Terminal writes use the existing `terminalGameplay` state, preserving the other challenge, terminal role, unknown saved content and scoring. Prototype custom authoring remains explicitly temporary/nonpersistable, as before; no new BE mechanism is invented. An existing draft missing terminal gameplay can explicitly configure the role without either optional challenge.

Navigation shows the numbered terminal selector disabled and muted with “The FinishPoint has no next checkpoint.” Switching from a terminal challenge to Navigation selects a regular checkpoint. The last regular checkpoint retains the existing navigation choices leading to FinishPoint. Saved terminal navigation fields remain untouched for backward compatibility; the UI exposes no terminal onward-navigation editor.

Existing RouteEditor is retained immediately below the count and route preview inside Feature 1 for geographic Templates. The initial below-features layout was corrected during PR #135 review. Its map, ordering, research references, naming, arrival notes, confirmation/history, camera controls and safety reminders are unchanged. The existing supplementary FinishPoint location editor remains available through “FinishPoint location details”; it is mounted on request. Scoring remains visible through the existing read-only component. Validation review links focus positioning or the appropriate gameplay step. Universal continues to omit geographic authoring. Route session-readiness remains an independent Legacy gate.

No API service, data seed, canonical Signal asset, starter identity, challenge payload, lifecycle/approval policy or backend file is changed. Persisted untouched canonical gameplay continues to reuse the original array, preserving its order. Existing hydrate/serialize functions retain a separate unnumbered terminal entry; the new UI does not append an extra regular checkpoint. Unchanged saves reuse the saved version through existing equality logic.

## Progress investigation

New drafts initialize an empty in-memory confirmation set. Visible Signal defaults are not confirmations; opening a step never completes it. Continue confirms its stable feature ID. Reopening a saved template restores completed sections from the persisted record, rather than a persisted per-step confirmation array. This explains the prior 0 of 8/0% despite defaults. The same semantics now use seven feature IDs and a seven-step denominator; the UI explains confirmation/restoration. Positioning remains separately subject to the existing route readiness/validation gate. Optional terminal challenges are never required. Universal/Local submission eligibility and independent approval rules are unchanged.

## Verification

Actual final run: `npm test` passed **42 Node test-file entries and 515 Vitest tests in 31 files**, zero failures/skips. Typecheck and build (TypeScript/Vite/PWA) passed; existing bundle-size warning remains. Chromium checkpointFeatures, Universal/Local authoring and Creator completion passed at **1440/768/390/320px**. Positioning passed **1440/1280/768/390/360/320px**, including view/edit, keyboard/touch search, explicit placement, deselection, confirmation and undo/redo. Reference-camera tests passed **1280/768/390/360/320px** in Map/Satellite, with repeated regular/terminal focus and seven-location Show all; saved references/history unchanged. No page errors or overflow in passing assertions. Desktop and mobile terminal-editor screenshots were inspected. `git diff --check` passed; task ID order and frozen reconciliation preservation were verified.

Reproduce with `npm run dev -- --host 127.0.0.1`, a dummy `VITE_MAPBOX_ACCESS_TOKEN` for mocked Mapbox fixtures, and `PLAYWRIGHT_MODULE=/opt/codex/runtimes/cua/lib/node_modules/playwright/index.mjs node tests/browser/<name>.verify.mjs`. Browser names: checkpointFeatures, localAuthoring, universalAuthoring, creatorCompletion, creatorPositions and referenceCheckpointCamera. HTTP Mapbox responses are fixture stubs, not external route verification.

Results are FE source/mocked checks only. See [machine-readable results](Checkpoint_Model_Results.json). Regression coverage includes six regular plus terminal loading as seven, exact unchanged route/challenge save, translated min/max saves, flagged terminal, Personal/Team terminal editing and reload, all six regular Navigation selectors with disabled terminal, last regular departure to FinishPoint, seven-step direct/Previous/Continue progress, Universal/Local creation and existing lifecycle paths. Existing tests retain both protected starters, immutable/editable copies, notes/research, Signal positioning, preview and scoring.

Initial full-suite failures were obsolete step-number and separate-FinishPoint-editor assumptions; tests were updated to the new UI while keeping their persistence assertions. Initial new browser selectors matched two Previous buttons; they are now scoped to the Hunt Features control. The existing map browser fixture also had preexisting outdated expectations (three toolbar controls and search placing a checkpoint); it now verifies the current six controls and camera-only search followed by explicit placement, plus deselection after confirmation. Local socket/Chromium execution needed permitted execution after sandbox EPERM. No application map behavior was changed to satisfy those expectations.

## Delivery baseline and remaining dependencies

Local checkout began at `4cc23da`; current GitHub main was `40b6373413155dbf9e72e4c3e256a771c1f2be0d`, including #134 navigation simplification and #133 F7-FE-13 evidence. Git transport could not reach its configured proxy. The GitHub connector supplied changed files; reconstructed baseline tree exactly matched remote `4ed1b2b4a7b35928fe3c29596b36fb477bbc49f1`. Remote delivery is rooted in that actual main, excluding the local synchronization checkpoint and work files.

No demonstrated BE contract incompatibility requires a BE change. Real disposable accounts, current deployed contracts and persisted FE→BE outcomes remain unverified under existing F7-FE-13 blockers. This PR does not close that task, promote D10/Admin/provider/safety gates, migrate Legacy content, or claim integrated/deployed acceptance.

## Delivery authorization status

Implementation and verification are complete locally. Automatic approval review rejected the GitHub create-tree upload because the request in the uploaded text was not recognized as trusted authorization to export source/documentation to `tedixdev-arch/Tedix_Hunt_FE`. No remote tree, branch or PR was created by that rejected action. The user subsequently explicitly authorized uploading the completed FE source, tests and documentation to this repository and creating one Draft PR, without merging or deploying. Delivery proceeds under that authorization.

## PR #135 narrow correction — positioning inside Feature 1

Reviewer-requested change: Local and Legacy geographic Templates now render the existing RouteEditor immediately after the total count and route preview in Number of Checkpoints. The supplementary FinishPoint location details entry remains in that section. The standalone below-features positioning section is removed; there is one RouteEditor instance in the active Feature 1. Universal displays only count and preview. No new positioning component, API field or geographic rule was added.

Continue still confirms only the feature ID; it neither verifies coordinates nor records physical route/safety verification. Moving to Personal Challenge does not require route verification. Existing geographic save, explicit validation and submission gates are unchanged. Local error-review actions first select Feature 1, then focus its positioning section. Existing count/geography state and FinishPoint state remain in the parent editor; leaving and returning to Feature 1 retains authored data. The same save-lock fieldset surrounds the editor.

Changed application file: `src/pages/CreatorStudio.tsx`. Focused tests and browser checks updated in `tests/creatorFinishPoint.test.tsx`, `tests/signalClujDraft.test.tsx`, and `tests/browser/checkpointFeatures.verify.mjs`; this evidence and its results JSON are updated. Existing starter tests exercise both Signal and Signal Overload editable-copy routes, notes, scoring and gameplay round trips. No backend/API, serialization/hydration, seed, classification, lifecycle, approval, terminal-gameplay or reward code changed.

Correction validation results are recorded in `Checkpoint_Model_Results.json` under `narrowCorrection`. Source/mocked checks do not close F7-FE-13 or establish real integration/deployed acceptance. Existing Draft PR #135 only; stop for ChatGPT re-review, no merge or deployment.
