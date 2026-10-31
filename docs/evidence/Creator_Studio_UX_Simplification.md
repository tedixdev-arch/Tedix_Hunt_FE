# Creator Studio UX simplification

30 October 2026 (Europe/Bucharest). Bounded correction within existing Creator Studio scope, prepared for one Draft FE PR and ChatGPT review. No new task ID; frozen reconciliation and all 169 task IDs/order preserved. F7-FE-13 remains incomplete, real integration BLOCKED and deployed acceptance unverified. No merge or deployment.

## Preparation and verified base

Read the Master Execution Plan, frozen reconciliation, F7-FE-01/03–06/07–09/10–12 implementation evidence, G4-FE-01–05/readable-inspection evidence and current F7-FE-13 regression/BE verification request. Inspected CreatorStudio, CreatorStudioNavigation, TemplateCreationChooser, existing API clients, lifecycle/read context, route guards, unit tests and browser fixtures. No AGENTS.md found. Only `tedixdev-arch/Tedix_Hunt_FE` accessed.

Latest GitHub main was `902da16a1897f49ef0ef604e341f941109d6d22a` (#133). Git transport could not connect to the configured proxy; GitHub connector supplied the four documentation changes since local `4cc23da`. Synchronized local baseline tree exactly matches remote tree `57603ff24c158c2b81db12bfb8b4938d0c7f8724`. Delivery commits are rooted in actual remote main; the local documentation synchronization checkpoint is excluded.

## Before / after

| Before | After |
| --- | --- |
| Competition Templates header, four navigation cards, separate Library entry and prominent legacy creation explanation | Creator Studio; “Create and manage Hunt templates.”; one primary “+ Create Template” action and one secondary Library entry |
| Duplicate My Templates card and four large status counters before the list | Owned templates directly below the header/navigation; no counters or extra dashboard widgets |
| Universal/Local entry points exposed alongside compatibility creation | One lightweight native dialog: Universal or Local; Local offers approved Universal or scratch |
| Primary-looking unclassified creation/catalog | Collapsed Legacy compatibility section after the list, with secondary Create Legacy Template entry |
| Empty list only states absence | Empty state directs the Creator to Create Template |

TemplateReadContext and existing actions are reused unchanged: name, Universal/Local/Legacy type, current status/version, submitted/publication/retained approval context, Edit/View/Revise and permitted Delete. No automatic reclassification, loss of records or change to immutable lifecycle. Extra approval context remains truthful rather than inferred from candidate versions. No new filters are needed for this bounded simplification.

## Routing and preservation

- Guarded `/creator` remains the same route. Primary chooser state uses `?studio=create`; Local step uses existing `?studio=local`; other search parameters survive transitions. Browser back/forward restores these views.
- Universal opens existing `/create?category=universal`; scratch Local opens existing `/create?category=local`. Opening or changing choices performs no draft mutation or starter catalog request.
- Approved Universal opens the existing `?studio=library` UniversalLibrary, retaining its selection/detail/copy workflow. Exact `{templateId,version}` publication reference and destination-key behavior are unchanged; no second Library or copy implementation.
- Existing owned records still open `/create?template=<encoded key>`. Existing Creator guard, immutable submitted versions, reviewed revisions, approval and independent Admin rules remain authoritative.
- Existing TemplateCreationChooser, unclassified `/create`, starter catalog/allowlist and starter-copy API remain unchanged and accessible through Legacy compatibility. Existing `?studio=mechanics` deep link remains readable, with no separate top-level Mechanics entry.
- Native dialog provides a named title, initial focus, Tab/Shift+Tab wrap including links, Escape, Cancel, Back between choices and restoration to the connected invoking control. No nested dialog or extra editor.

## Actual verification

- `npm run typecheck`: passed.
- `npm run build`: passed, including PWA generation; existing >500 kB bundle warning remains.
- `npm test`: passed, 42 Node test-file entries and 506 Vitest tests / 31 files, zero failures/skips.
- Focused navigation/legacy/deletion/list run: 94 tests / 4 files passed before final full regression.
- Chromium: updated creatorStudio and localAuthoring, existing universalAuthoring, universalLibrary and creatorCompletion passed at 1440/768/390/320px. [Machine-readable results](Creator_Studio_UX_Results.json).
- Creator Studio browser checks cover empty/loading/error/populated lists, Universal/Local/Legacy labels, hidden secondary compatibility entry, both choice steps, native keyboard/focus wrapping/restoration, Escape, cancellation, actual browser back/forward and no overflow/page errors. No network mutation requests.
- Local browser regression now clicks the Universal entry into the shared editor without creating a draft, and exercises scratch Local save/reopen/locality snapshots plus exact approved Universal copy at version 2. Universal/lifecycle fixtures verify protected submissions, reviewed revisions, retained approval and exact v4 submission. Unit suites retain denial, retry/error, Legacy editing/catalog/deletion and version-protection coverage.
- First full run identified obsolete counter/entry-label assertions; those were updated to verify retained record status and the secondary Legacy entry. Initial socket-bound server execution was denied by the sandbox; permitted localhost/Chromium execution succeeded. Initial browser-history check revealed the old MemoryRouter fixture did not exercise browser history; it now uses BrowserRouter. These initial failures are not claimed as passes.
- Screenshots of empty/populated mobile and Local choice desktop were visually inspected. All screenshots are fixture output, not deployed acceptance.
- `git diff --check`: passed. Baseline and final task IDs/order compared; frozen reconciliation unchanged.

## Deployment and version evidence

Inspected `.github/workflows/frontend.yml`, `vite.config.ts`, `src/buildInfo.ts`, `public/version.json`, API configuration/session clients and committed deployment tests. No infrastructure modified or deployment triggered.

Development deployment runs only after successful validation on a push to main. It builds with dev API `https://tedixhunt-be-dev.anainfo.ai`, injects `VITE_BUILD_SHA`, generates `public/version.json` from GITHUB_SHA and rsyncs dist to deploy@62.238.112.85:/var/www/Tedix_Hunt_FE/dist. It checks the remote file, then public `https://tedixhunt-fe-dev.anainfo.ai/version.json` equals the expected commit and verifies a route marker in the served JS. A Draft branch/PR does not meet the deployment condition. Manual production workflow_dispatch is separate and was not run.

A reliable commit marker mechanism exists for the development deployment when these checks pass. The checked-in marker is `development`; a plain local/production build is not proof of a deployed commit. `buildInfo.ts` defines a VITE_BUILD_SHA fallback but currently has no application consumer, so no in-app commit display is established. The production job does not generate the commit marker or inject the SHA: deployment/version parity is a separate follow-up.

Confirmed FE-owned gap: Workbox excluded version.json from precache but its navigation fallback had no denylist. A service-worker-controlled navigation to an unavailable marker could therefore receive index.html. Added only `/^\/version\.json$/` to navigateFallbackDenylist; deployment regression checks the exclusion and generated `dist/sw.js` contains the denylist. It leaves the marker network-only and does not fabricate commit data. This does not prove the original observed response came from Workbox. An ordinary HTTP request receiving HTML can still indicate missing/stale artifact, reverse-proxy document root or SPA rewrite configuration. That needs a deployment/operator check; no server configuration was changed. Current public FE endpoint is outside this task's configured custom network allowlist and no authenticated deployment/version observation is available. Live deployed commit/endpoint remain unverified.

## One draft versus zero templates: read-only investigation

No screenshots, correlated session identities, environment URLs, request responses or record keys accompanied this request. No configured real Creator/Admin credentials are available. No private storage, tokens, live records or backend data were inspected or modified.

Demonstrated source behavior: the owned list is fetched from `/api/creator/templates` using the configured API base URL and current bearer session. Browser auth is origin-local (`tedix-hunt.session`); different browser profiles/origins/accounts can use different sessions. Loading and list errors are distinct from a successful empty list; 401/403/404 clear cached private cards. Merely opening creation or editing an unsaved draft does not persist a record. The old creatorStudio browser fixture intentionally returned `[]`, while authoring fixtures store synthetic drafts in fixture-only sessionStorage. Thus different fixture screens can intentionally show different counts; this is not evidence about the real backend.

Possible explanations for the reported sessions include account/owner scope, API environment/build differences, an unsaved editor draft versus persisted record, fixture versus live data, or a legitimate list change. None is established as the explanation for those particular screenshots. No data-loss defect demonstrated. Follow-up needs matching FE URL and deployed SHA, API environment, safe account identifiers and owner-list HTTP status/body for each session (without tokens), plus the relevant saved template key/version. Compare those before inferring disappearance. Existing real FE→BE authorization/persistence/independent-review acceptance remains blocked per F7-FE-13; mocked tests do not close it.

Stop for ChatGPT PR review. No backend/API/database/Admin policy/Organizer editor changes, D10 activation, new task, merge or deployment.

## Hunt Setup and city camera — 31 October 2026

Creator Studio now starts classified authoring with **Hunt Setup**, before Template Setup and Hunt Features. A Local Creator chooses Country and City, then uses **Continue to Hunt builder**. The button validates the destination and focuses Template Setup. Geographic checkpoint positioning remains unavailable until a Local destination has been selected. Incomplete drafts can still be saved through the existing save flow. Universal authoring has no Country/City fields, registry requests or locality requirement. Existing legacy/Signal creation, read-only submitted versions and revision eligibility retain their established paths.

### Contracts inspected, read-only

FE baseline: `2bebebb0d5ee2ac57e9091ade142fad79956681f` (current main when work began). BE baseline: [`4e6cb521ba6ac930d28cd513935d83367ee80f91`](https://github.com/tedixdev-arch/Tedix_Hunt_BE/tree/4e6cb521ba6ac930d28cd513935d83367ee80f91). Inspected Creator/Template API and models, route/checkpoint/FinishPoint editors, Mapbox Search Box, existing tests, BE Creator routes/domain/model, geography routes/model, schema and C6a/C6b/C7 contracts. Backend files are unchanged.

- Country options come from `GET /api/geography/countries`. City search calls the existing `GET /api/geography/localities?countryCode=…&q=…` registry. Results are scoped to the selected country, active only, deduplicated by UUID, and distinguished by administrative context. Same-name distinct cities remain separate choices. No hardcoded production country catalog or first-result auto-selection.
- The implemented registry returns `providerStatus: not_requested`; the broader provider-resolution proposal in C6a is not an implemented permanent Mapbox storage entitlement. Registry selection establishes the existing stable UUID. The public representative coordinates are already supported catalog data and are used for camera positioning, never copied into checkpoint coordinates.
- Saves use the existing top-level `localityId` only. Omission preserves the preceding server snapshot; null clears it in a new version; an explicit active UUID requests a server-built snapshot. FE never sends `localitySnapshot`, country facts, provider metadata or city coordinates as binding authority. Saved snapshots remain distinct from current registry facts. Country changes clear the working City; they do not rewrite old versions.
- C4 Universal-to-Local copies still use the exact selected publication and begin without destination locality. Hunt Setup requires the Local destination without modifying the source or inheriting unrelated Signal data. Legacy content is not reclassified or migrated.
- C6b approval/revision and C7 exact-version/locality eligibility remain governed by existing backend gates. This change does not alter approval pointers, immutable approved versions, Organizer selection or Participant gameplay.

### Curriculum/Grade contract gap

Current BE Creator POST accepts only `key`, `content`, optional `category` and `localityId`; version POST accepts only `content` and `localityId`. There are **no supported Curriculum or Grade fields, enums, persistence validation, projections or copy/revision semantics** in the current domain/model/OpenAPI contract. `content.configuration` can carry existing miscellaneous fields, but that is not an approved educational metadata contract. The existing legacy `configuration.category` and `ageRange` are preserved; neither is reinterpreted as Curriculum or Grade.

Accordingly, Curriculum and Grade are optional, disabled, and labelled **not available yet**. Their empty option is distinct from `mixed`; the requested Mathematics/Mixed and Grade 9–12/Mixed grades choices are defined but cannot be selected or saved. No new JSON metadata mechanism, learning fields, taxonomy or content filtering is introduced. Enabling these controls requires an explicit BE contract for persisted field names, allowed values versus unset, validation, reads, revisions and exact-source copies. That missing contract blocks the educational portion of the final acceptance criterion; the supported geographic flow is implemented.

### Camera and city changes

- A selected registry city starts at its representative coordinates and city-level zoom 12. Opening an existing authored route instead fits all valid checkpoint positions plus positioned FinishPoint, with toolbar-aware padding and a capped zoom. Unpositioned points are excluded.
- The Mapbox instance records camera state only in an editor-session ref. Pan/zoom, unrelated renders and switching Hunt Features preserve it, including when the map remounts. Reopening the page starts from the persisted route/city again. No camera state enters Template JSON or browser storage.
- **Recenter map** returns to the selected city. **Show all checkpoints** remains a separate bounds action. With no selected city, Recenter uses the existing displayed route/reference bounds. Existing Signal research camera context is retained; unrelated unbound contexts use a neutral world view, without inventing a city or checkpoint position.
- Changing locality with existing positioned checkpoints or FinishPoint asks for confirmation before mutating the selection. Cancelling preserves the country, city and coordinates. Accepting a Country-to-City change asks once for that change flow, moves the camera to the new city, and retains every authored coordinate for explicit review/repositioning. A later city change asks again. Approval still requires the existing exact saved content/locality validation.
- Registry/search failure retains the chosen City and offers Retry. Invalid city coordinates show a clear message and **Retry city location**, which resolves the exact saved/selected registry identity. No fallback Cluj coordinates are invented. Retry responses from an obsolete locality selection are ignored. Searches run on input/country/retry changes, not ordinary rerenders.
- Existing temporary Mapbox Search Box camera navigation remains separate from stable locality selection and explicit checkpoint placement. Its provider results are not persisted by this change.

### Verification and evidence

The full regression command `npm test` passed: **42 Node test files and 758 Vitest tests in 36 component suites**. The affected-suite follow-up passed **112 tests**; the final camera/toolbar follow-up passed **77 tests**. The final browser pass also checks that search does not cover toolbar controls. Recenter sits above the map, and route review reminders are collapsed under “Before placing checkpoints”. `npm run typecheck`, `npm run build` and `git diff --check` passed. The build retains its existing large-bundle warning.

New `huntSetup.test.tsx` and added Mapbox cases cover the required Local/Universal differences, optional unavailable learning controls, mixed versus unset, country invalidation, copied Local destination, UUID-only save/server snapshot hydration, legacy compatibility, city centering, checkpoint/FinishPoint bounds, manual camera retention across feature unmounts, repeatable recenter, safe city changes, invalid coordinates, recoverable search/lookup failure and no geocoding on rerender. Existing suites cover create/revise/copy, challenge authoring, both Signal starters, numbering/FinishPoint semantics, submissions and locality/version eligibility. Existing tests that assumed the first input was Template name now identify the Template Setup input, and map-action tests account for the required initial bounds fit and added Recenter action.

Browser verification uses **real Creator Studio, RouteEditor and Mapbox GL components**, with deterministic fixture API/registry responses and an intercepted blank Mapbox background style. It is **not authenticated backend integration and does not demonstrate live basemap tiles or provider entitlement**. No credentials or production content were used. The test asserts camera coordinates/zoom, route bounds including FinishPoint, keyboard city selection, manual pan and feature switching, Recenter, Country change cancel/accept and unchanged saved checkpoint coordinates.

Reproduce with a local Vite server using `VITE_MAPBOX_ACCESS_TOKEN=pk.browser-fixture-token`, then `PLAYWRIGHT_MODULE=<installed-playwright-index.mjs> node tests/browser/huntSetup.verify.mjs` (optional `TEDIX_BROWSER_URL`). The script intercepts Mapbox style requests. Browser results and screenshots are in [`hunt-setup/results.json`](hunt-setup/results.json). At each of **1440, 768, 390 and 320 px**, the evidence set contains Local Setup, Country/City results, city camera, Recenter, Universal Setup with optional controls, and existing checkpoint/FinishPoint route. Screenshots show the fixture's blank background, not a live geographic basemap.

| View | Desktop | Narrow mobile |
| --- | --- | --- |
| Local Hunt Setup / optional fields | [1440](hunt-setup/local-1440.png) | [320](hunt-setup/local-320.png) |
| Country / City selection | [1440](hunt-setup/selection-1440.png) | [320](hunt-setup/selection-320.png) |
| Universal Hunt Setup | [1440](hunt-setup/universal-1440.png) | [320](hunt-setup/universal-320.png) |
| City-centered map | [1440](hunt-setup/city-map-1440.png) | [320](hunt-setup/city-map-320.png) |
| Recenter | [1440](hunt-setup/recenter-1440.png) | [320](hunt-setup/recenter-320.png) |
| Existing route and FinishPoint | [1440](hunt-setup/existing-route-1440.png) | [320](hunt-setup/existing-route-320.png) |

Remaining limitations: Curriculum/Grade require the BE contract above; the registry only offers supported countries and approved stored cities, with the existing manual-proposal workflow available under City options. No new provider resolution or permanent Mapbox storage is enabled. Live authenticated save/reload/approval and live Mapbox tiles require separate integration verification with suitable account configuration. No BE changes, merge, deployment or new Master Execution Plan IDs.

### PR #140 correction — Continue gates new Local authoring

For a **new Local** Hunt, the entire subsequent builder (Template Setup, Hunt Features, save controls and Review & Submit) is hidden and disabled until a Country-scoped City is explicitly selected **and Continue to Hunt builder is clicked**. Selection alone does not unlock it. Continue validates the existing locality UUID/snapshot and country, then unlocks the builder and scrolls/focuses Template Setup after React commits the visible controls. The navigation state is session-only; it is not locality authority, is not serialized, and adds no backend field.

A reopened Local draft remains editable without repeating Continue. Valid saved locality supplies geographic context even if current registry lookup fails. A saved draft missing locality still exposes non-geographic editing and save/recovery, so a registry outage cannot trap its author; geographic positioning and submission retain the existing locality gates. Universal Continue needs no Country/City, and Universal/Legacy editing remains available.

After Continue, changing or clearing City does not lock the whole builder again. Existing confirmation still runs before changing locality around positioned checkpoints/FinishPoint; coordinates remain unchanged. Clearing locality hides geographic positioning and existing submission validation requires a valid, explicitly saved destination. Non-geographic work and draft saves remain available. Map camera memory, bounds, Recenter, persistence and backend eligibility/revision safeguards are unchanged.

Regression coverage now asserts new Local controls remain hidden/disabled even after City selection until Continue, Continue focus/scroll, existing saved Local editing during registry failure, saved missing-locality recovery, Universal locality-free Continue, and direct City changes/country clearing after Continue with cancellation and unchanged checkpoint coordinates. Creation/challenge tests now perform the required setup before testing new Local authoring. Browser fixtures also exercise registry outages for saved bound and unbound drafts; all evidence still uses mocked registry/API responses and a mocked Mapbox background style, not authenticated integration.

Correction verification: `npm run typecheck`, `npm run build`, `git diff --check`, and full `npm test` passed (**42 Node test files; 763 component tests in 36 suites**). The affected setup/creation/context follow-up passed 34 tests; setup/FinishPoint follow-up passed 54 tests. Refreshed browser checks passed all four widths, produced 24 screenshots and zero page errors, and record `explicitContinueGate`, `continueFocus` and `savedDraftRegistryRecovery` in the existing results JSON. Backend checkout remains unchanged. Existing PR #140 is the only delivery; no merge or deployment.

## Team Challenge game-first authoring — 31 October 2026

The modern Team Challenge editor now uses one seven-mechanic selector, Predefined / Create Your Own, and an immediately interactive mobile participant canvas. The previous modern experience exposed a second type dropdown, a long configuration form and a separate preview dialog. Create Your Own now defaults to **Edit with Preview**. Contextual pencils update the same draft as the five-stage **Step by Step** editor: mission, team information, shared answer, hints/feedback, and simulation. The canvas opens the relevant guided information step directly. No Personal Challenge authoring was rewritten.

| Mechanic | Participant simulation | Contextual editing | Guided editing |
| --- | --- | --- | --- |
| Scrambled Word (`scrambled-word`) | Combine fragments; submit reconstructed word | Title, instructions | Contributions, word, case sensitivity, hints, feedback, solution |
| Distributed Information (`distributed-information`) | Switch one-fact player views; combine information; choose shared conclusion | Title, mission/shared objective, selected player's fact, answer options, correct-answer settings; add/remove facts/options | Same content, hints, feedback, solution |
| Hypothesis (`hypothesis`) | Combine packets, use decoder key, submit decoded answer | Title, instructions | Packets, decoder key, answer, case sensitivity, hints, feedback, solution |
| Assemble Machine (`assemble-machine`) | Combine instructions and choose a frequency | Title, instructions | Contributions, frequency labels/values, correct frequency, hints, feedback, solution |
| Clue Synthesis (`clue-synthesis`) | Read fragments/pattern and submit answer | Title, instructions | Clues, pattern, answer, case sensitivity, hints, feedback, solution |
| Filter Noise (`filter-noise`) | Select trusted signals together | Title, instructions | Signals, trusted selection, hints, feedback, solution |
| Shared Final Key (`shared-final-key`) | Arrange contributions, enter combined key; both order and key checked | Title, mission instructions, contributions, ordering objective, final key and order settings; add/remove contributions | Same content, hints, feedback, solution |

All seven use existing canonical identifiers, closed schemas, `Exercise.authored`, `toPersistence` / `fromPersistence`, and `AuthoringDraft` / Template persistence. There is no second persisted model. The answer checker is the existing Creator-only authored checker. Reset clears only local interaction, feedback, hint and solution visibility; preview state never enters the Template.

**Perspective boundary:** the current Distributed Information contract contains `facts` (2–16) and options, with no participant-assignment field. The UI explicitly simulates one fact per local player position, A through P. Individual player views never render the other facts; changing perspective preserves the shared attempt. Solution reveal is omitted from this mechanic's player simulation. Mission instructions carry the Creator's shared objective; no unsupported objective or membership field was invented. Shared Final Key contributions are shared, as supported by its contract, and are not presented as private participant assignments. Its answer settings are an explicit Creator disclosure separate from participant information. All of this is local simulation, not secure or synchronized gameplay.

**Selection and context:** both modern paths offer the same seven mechanics. Examples are standalone neutral examples rather than Signal defaults. Predefined examples are read-only and locally selectable/previewable. They have no approved predefined wire identity, so assigning an example requires its independent **Create Your Own** copy and **Apply Team Challenge**, followed by the existing overall **Save draft**. Browsing examples never changes the saved assignment or source. `category` from the server remains the authority: Universal/Local uses modern authoring, explicit Legacy keeps the existing Signal editor and assignments, and omitted classification requires an explicit session editor choice. IDs never classify a Template. New modern Templates remain empty until selected; legacy saved content is preserved without silent conversion.

**Persistence:** changing mechanic retains per-type drafts; the previously applied exercise stays selected until explicit replacement. Switching modes or checkpoints preserves draft content. Editing an already-applied custom instance updates that assignment; independently browsing another type does not replace it. Cancelled replacement does not change the saved selection. The existing version-owned server identity, immutable revision, copy allocation and exact-version submission contracts are unchanged. Unapplied type variants are session-only, matching the existing storage contract. The UI explains Apply and Save draft. No per-field save operations were introduced.

**Inspection:** reviewed Creator Studio/checkpoint and FinishPoint integration, Personal authoring/canvas/guided components, the seven existing Team renderers, Legacy Signal defaults, authoritative creation contexts, draft hydration/application/reconciliation, custom schemas/adapters/validation, Template persistence and existing evidence/tests. Read-only backend inspection at `4e6cb521ba6ac930d28cd513935d83367ee80f91` confirms the two priority schemas match the FE snapshot and `/hunts/:id/publish` retains the `422 hunt_not_ready` readiness gate for custom exercises. Backend files and Participant APIs were not changed.

**Validation:** `npm run typecheck`, `npm run build`, and `git diff --check` pass. The build retains its existing large-bundle warning. Full `npm test`: 42 Node test files and 780 component tests across 37 suites passed on the exact PR branch rebased onto merged PR #140. This includes the 17-test Team builder suite and its empty-information recovery / 16-player-limit regression. Existing Personal, Signal, copy/ownership, version, FinishPoint, context and persistence regressions pass; updated integration helpers use the Team title pencil while preserving the original save/reload, rejected replacement, approved revision and exact submit assertions.

Actual Creator Studio browser verification: **28 scenarios** (seven mechanics × 1440, 768, 390, 320 px), with zero page errors and no document/editor horizontal overflow. Every scenario covers neutral read-only example play, independent custom content, default preview, keyboard pencil focus/return, shared guided edits, failure/success/reset, save/reload, checkpoint retention, a new Template revision and FinishPoint custom assignment. Distributed Information additionally checks A/B private-fact separation and fact-pencil editing; Shared Final Key checks objective-pencil editing and code/order completion. [Results](team-challenge-ux/results.json) and [108 screenshots](team-challenge-ux) are committed beside this evidence. Browser operations use **mocked Template API responses with actual Creator Studio components**, not authenticated backend E2E. Existing component/API fixture tests cover copy and submission contracts; no live database copy, submit, multiplayer or publication was performed.

**Limitations / Workstream B:** persistable participant membership and private-clue allocation, real-time synchronization, Participant-safe projections, authoritative server answer checking, scoring and controlled hints/solutions remain backend/Participant work. Custom-bearing Hunts remain unpublishable. Remaining five mechanics use contextual title/instructions plus direct guided mechanic editing; they have working local interactions rather than decorative placeholders. Predefined catalog examples require a custom copy to persist because approved predefined assignment identities do not exist. No new Master Execution Plan IDs, BE changes, merge or deployment. Stop for ChatGPT PR review.

## Personal Challenge visual editors — Task 4

Base: `898a1f6cb12e058976486913ef24dbe8f58ffa1a` (merged PR #141), including PR #140 Hunt Setup and the Team authoring components. The existing `tap-pair`, `single-choice`, and `fill-blank` visual editors remain on their original path. The remaining twelve now default to Edit with Preview with contextual pencils and a mobile canvas. The five guided stages edit the same exercise object: title/instructions, content, answer, hints/feedback/solution, and simulation. Common fields appear once for the new editors.

| New mechanic | Visual authoring and correct-answer controls | Existing local simulation |
| --- | --- | --- |
| `true-false` | Statement pencil and truth buttons | Select True/False |
| `memory-card` | Recall-card and accepted-answer pencils, reveal delay, case matching | Recall, timed reveal, submit |
| `number-line` | Bounds, tick spacing, target slider/numeric pencil, tolerance | Position slider; minimum works with pointer and keyboard |
| `multiple-choice` | Option cards, bounded add/remove, correct-answer checkboxes | Multiple selection |
| `match-columns` | Left/right card pencils, bounded pairs, atomic relationship swaps | Match each left card to a right card |
| `drag-drop` | Item/target cards, bounded add/remove, placement controls | Drag items into zones or use keyboard-accessible target selectors |
| `sequence` | Item pencils, bounded add/remove, correct-order up/down controls | Assemble and revise ordered selection |
| `find-mistake` | Step and correction cards; choose incorrect step and explanation | Two-stage error identification and explanation |
| `build-problem` | Piece and position cards; assemble/reorder the expected construction | Assemble a solution from inventory |
| `number-pattern` | Number pencils, add/remove terms, move the missing position, expected number | Complete the missing term |
| `shape-pattern` | Shape-label pencils, sequence choices, move missing position, expected shape | Select the missing shape |
| `rule-discovery` | Input/output example pencils, rule cards, prediction and answer controls | Select a rule and predict output |

All controls write the canonical `authored.activity`/`authored.expected` contract. No second model, engine, answer checker, backend schema, permission or publication path was added. Every simulation uses `ExerciseRenderer`/`checkAuthoredAnswer`. Local attempts stay mounted when switching editing modes, and reset when mechanic content or answers change. Reset clears attempts, hints, reveal and feedback. Applying, saving and hydration use the existing adapters; preview state is excluded from persistence.

**Accessibility:** pencils open a focused control; Escape and Done return focus to the pencil. Numeric pencils retain empty/invalid input for validation. Add/remove operations return focus to a remaining edit control. Reordering uses labeled up/down buttons. Dragging retains the existing keyboard-accessible placement selectors. Canonical array limits, stable identities, matching bijections, the single missing-pattern position and ownership boundaries are retained. An incomplete construction or invalid answer blocks Apply and Play rather than inventing a solution.

**Persistence and isolation:** regression coverage includes all 15 choices and read-only previews, independent custom copies, unsaved variants, Apply, save/reload, normal and FinishPoint assignments, checkpoint switching, approved revisions and destination-owned Universal-to-Local copies. Browser verification consumes a mocked copy result and edits/reloads the destination without changing its source; the existing API regression separately checks the from-Universal request contract. Creation context remains the authority from PR #139: no identifier-based Legacy detection or silent Signal migration. Protected starters and Team authoring are unchanged. Custom exercise publication restrictions remain intact.

**Browser evidence:** [results](personal-visual-editors/results.json) and [screenshots](personal-visual-editors/) cover each new mechanic at 1440, 768, 390 and 320 pixels. Each scenario selects the mechanic, creates/applies a custom copy, changes content and a correct answer, traverses guided editing, verifies retained edits, simulates incorrect/correct/reset, saves/reloads and switches checkpoints. Representative approved revision, FinishPoint and mocked copy flows are also exercised. The original three Personal editors and all seven Team mechanics are rerun separately. Screenshots use the actual Creator Studio and exercise renderer; Template API responses are mocked. These results do **not** establish authenticated BE end-to-end behavior.

**Contract limitations / Workstream B:** Memory Card supports one recall card, not a deck; Number Line supports one selected value with bounds/step, not authored marker collections; Find Mistake supports selectable step/explanation choices, not free-form correction grading. Shapes remain canonical text labels (including Unicode), not uploaded assets. Numerical patterns and rule predictions use authored answers and existing local validation, not a new mathematical inference engine. Production Participant gameplay, authoritative secure answer checking, scoring, multiplayer, safe hint/solution projection and publication enablement remain later FE/BE work. No BE edits, merge or deployment.

**Validation results:** all 48 new-mechanic browser scenarios pass with zero page errors and no horizontal overflow, including the representative approved revision, FinishPoint and mocked copy flow; 96 screenshots are recorded. Original Personal browser regression: 12/12 scenarios. Team browser regression: 28/28 scenarios. Browser command: `PLAYWRIGHT_MODULE=<installed-playwright-module> node tests/browser/personalVisualEditors.verify.mjs` against `npm run dev -- --host 127.0.0.1`; the original Personal and Team scripts use the same setup. The older Personal fixture now supplies geography and completes PR #140's Hunt Setup before entering the Local builder. Generated unchanged-workstream screenshots were not included in this change.

`npm test` passes: 42 Node test entries and 810 component tests across 38 files. `npm run typecheck`, `npm run build` and `git diff --check` pass. The build retains its large-bundle warning. The 40-pair boundary interaction test has an explicit 20-second timeout after its five-second default was exceeded under concurrent browser verification; all boundary assertions remain intact. No existing failing tests were suppressed.

### PR #142 review correction: moving a pattern gap

Shape Pattern now captures the newly hidden term's shape as the expected answer while restoring the previous gap from the previous expected shape. Number Pattern uses the same transfer and retains its numeric behavior. Term IDs and the canonical single-missing-term structure are preserved. New regressions move the gap five times for each mechanic, including revisiting previous positions, applying the assignment and checking persistence/hydration fidelity after every move. The Shape Pattern regression failed before the fix; Number Pattern passed before and after it.

Revalidation: affected authoring/persistence tests 148/148; full suite 42 Node test entries and 812 component tests across 38 files; typecheck, build and diff checks pass. The build retains its large-bundle warning. Existing browser evidence above belongs to the original implementation run. This correction changes no BE, Legacy, Team or publication safeguards.
