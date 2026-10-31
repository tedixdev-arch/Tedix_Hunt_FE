# Creator challenge library and interactive exercise preview

**Current UX correction:** [Clean creation contexts and mobile visual authoring](#personal-challenge-ux-correction--31-october-2026). The sections below retain historical evidence.

**PR #138 architecture baseline:** [Signal assignments, preview-only examples and explicit Custom authoring](#personal-challenge-architecture-correction--pr-138). Earlier implementation sections are historical where superseded.

**Current status:** Template-owned custom exercise persistence is integrated against BE #93. See “Current integration” below for authoritative behavior, evidence and remaining live-database acceptance. The FE #136 sections that follow are historical evidence; their experimental save/submission gate has been retired.

31 October 2026 (Europe/Bucharest). Existing Draft FE PR #136, stabilized for ChatGPT review. No merge or deployment. Custom exercise persistence and live FE–BE integration remain blocked/unverified. Supported template settings can be saved after explicit confirmation that experimental drafts are excluded.

## Inspected sources and scope

Implementation is based on FE main `87cc8afeb17625b342973966ca88e45d6c966ef8` (merged #135), including its seven-feature Creator presentation, total-count translation and terminal checkpoint selector. The initial workspace was older; the working branch was rebased onto current main and conflicts were resolved preserving #135's numbering, geography, navigation and regression coverage.

Read the Master Execution Plan and frozen reconciliation, current CreatorStudio, CheckpointGameplayEditor/StoryPreview, checkpointGameplay hydration/serialization/validation, templatePersistence and lifecycle/local validation, creatorTemplates API types/calls, organizerTemplates, immutable checkpointExercises, participant exercise visuals/team controls and existing browser/unit/Signal starter regressions. No AGENTS.md was present. No backend repository was modified or checked out.

The supplied request is the available canonical 15-name/difficulty reference. No separate full 15-type specification was supplied or found in the FE tree; no additional definitions are attributed to a missing document. Exact supplied names/levels are retained. The reference repository `tedixdev-arch/tedix-variable-rewards` was inspected through the authenticated GitHub connector at `29e34f924feac7f5fe330d200dc1f00d94f0ad71`: lesson types and validators, grade-five/six-eight exercise definitions, TapAndPairPage, findTheMistakeState and memoryCardCountdown. The pure recall countdown helpers are reused with source attribution. Tap/pair follows concept/example matching with face-down cards. Memory card follows recall then delayed reveal (not a replacement matching game). Find the mistake follows target selection then explanation; reward/progression dependencies are omitted from this standalone simulator. Numeric-pattern content reuses the reference's 3 → 12 → 48 → 192 → 768 example. Existing Signal visuals inform the saved-instance adapters; no Participant Hunt screen is copied.

## Bounded implementation

- `exercises/catalog.ts`: stable story-independent type IDs, 15 concrete local prototypes, mechanic-specific field schemas and relational validation; fixed answer checking without executable rules or evaluation.
- `ExerciseContentEditor`: schema-specific controls for each mechanic, common title/instructions/assistance/feedback fields, validation errors. Boolean, numeric, mapping, list, ordered-step, construction and multi-answer editors expose different content schemas. First selecting a type starts an independent copy of that type's example; switching back restores its authored session variant until explicit discard.
- `ExerciseRenderer`: face-down pair cards, single/multiple choices, truth selection, recall/reveal, numeric slider, column mapping, actual drag/drop plus keyboard/touch select alternative, blank inputs, ordered piece assembly, mistake/explanation stages, number/shape patterns and rule-plus-output checking.
- `ExercisePreview`: shared native modal, generic phone proportions, constrained width/height, internal scrolling, close/Escape, focus trapping/restoration. It receives the current draft and never calls persistence/runtime services. Hint, solution, checking and Reset work independently of the editor.
- `ChallengeAuthoring`: Predefined / Create Your Own, saved-instance inspection, clearly labeled local examples, independent custom copies. Per-checkpoint/per-challenge session drafts live outside serialized Template content and survive preview, checkpoint and feature switches. Supported saving is independent of experimental state and requires exclusion confirmation whenever experiments are retained. Viewing Predefined does not erase drafts or clear submission intent. Explicit per-slot Discard Experiment actions also cover no-longer-visible checkpoints; there is no bulk replacement with saved assignments. Reloading/leaving the editor does not persist these drafts.
- Team UI naming is applied only to the Creator selector/authoring layer; existing persisted identifiers and Signal-specific labels, narratives, clues and answers remain available. Seven original Team mechanics are reused, including the existing frequency-choice behavior for `assemble-machine`.
- Main's total-count translation, seven Hunt Features, checkpoint selector/FinishPoint flag, Feature 1 Mapbox positioning, Feature 4 terminal navigation restriction, terminal role, scoring, notes and template lifecycle remain unchanged. Main's existing full journey preview remains separate.

## Persistence contract gate

| Requirement | FE evidence and supported boundary |
| --- | --- |
| Exercise type | `checkpointGameplay.supportedGameplay` derives seven legacy Personal/Team values from immutable Signal checkpoints. New personal catalog IDs are never substituted into `kind`. |
| Exercise instance identifier | Existing Signal records have `id`, but the FE assignment contract establishes `kind`/`teamKind`; there is no proven separate catalog-instance-reference contract. Existing fields/IDs are preserved without conversion. |
| Custom content payload | `CreatorTemplateContent.checkpoints: unknown[]` and `CheckpointGameplay`'s record index permit opaque saved content in FE, but are not proof of BE acceptance, storage, validation or runtime consumption of new custom payloads. |
| Correct answer / validation | Existing payloads such as `correctAnswers`, `teamAnswer`, optional nested challenge records and unknown fields remain intact. No established new 15-type answer schema or BE validator is present. |
| Hint / solution | Existing saved values are retained; preview adapters prefer explicit saved overrides to Signal defaults. Unknown/incomplete saved configurations are preserved and preview is disabled if they cannot be simulated safely. |
| Per-checkpoint assignment | Supported existing flat identifiers remain independently assignable via current normal gameplay entries. |
| FinishPoint assignment | Existing unnumbered `role: terminal` entry is updated separately; other challenge fields and terminal metadata are preserved. |
| Versioning / approval | Existing explicit create/createVersion/submit calls, equality/no-op behavior, immutable versions, revision permissions and approval rules are reused. No autosave, migration or new approval state. |

**Gate outcome after stabilization:** saving experimental payloads remains unsupported. Saving **supported template configuration** is allowed, even with experimental drafts. Every such save first opens an accessible exclusion warning listing all retained experiment slots, including inactive and preview-only drafts. Cancel/Escape performs no write. Explicit “Save supported settings only” consent covers the current supported snapshot and experiment state only; changed state requires new confirmation. Successful saving reports that experiments were excluded, leaves their content and submission intent intact, and preserves the existing equality/no-op, immutable version, permission, stale-read and conflict checks. Failed saves keep both kinds of working data and never claim success.

Session-only `AuthoringDrafts` is stored separately from `CreatorTemplateContent`. It is never passed to create/createVersion/submit, merged into checkpoints or written to localStorage. There is no new endpoint or API payload. Existing opaque saved content is preserved by the existing serializer; the gate does not delete historical fields. “Discard Experiment” removes only the chosen checkpoint/classification slot. The supported assignment remains its separate working configuration; discarding is an explicit action, not a silent fallback during save.

Submission has a separate **intent gate**. New custom/local-example experiments default to intended for submission. Browsing Predefined or confirming an exclusion-only save does not clear this intent. Each retained experiment has an explicit checkbox to mark it preview only; submission can then use supported assignments subject to all original validation/version/approval gates. Intended experiments on other checkpoints, Team slots or FinishPoint still block submission. No experimental draft is presented as saved or approved. Leaving/reloading the editor loses session-only drafts, and the warning states this explicitly.

## Exact FE data requirements for future backend integration

**Product Owner architecture, 31 October 2026:** a custom exercise instance belongs exclusively to the Hunt Template version in which it is created. It is not initially a shared catalog record. A shared exercise library is deferred and is not a dependency for this integration. The following are logical data requirements for the BE design, **not an implemented wire schema, endpoint or claim of BE support**. No new backend fields/types are added to FE service calls in this task.

| Required attribute | Required meaning and FE constraints |
| --- | --- |
| Exercise instance ID | Opaque stable identity within its owning Template version, distinct from the mechanic ID and temporary `custom:` session ID. The backend must return the authoritative ID; current session IDs are not proof of persisted identity. |
| Exercise type | Stable story-independent mechanic identifier and content-schema version. Preserve all 15 canonical Personal types and seven existing Team identifiers. Do not reinterpret legacy Signal identifiers as new canonical IDs. |
| Personal / Team classification | Explicit classification, validated against the type whitelist; a Personal instance cannot be assigned as a Team challenge or vice versa. |
| Title and instructions | Authored text, round-tripped exactly within agreed length/normalization limits. No executable markup/code/rules. |
| Type-specific interaction data | Structured options/cards/pairs/blanks/steps/pieces/ranges/examples/patterns/contributions, with stable item identities and display order where needed. See the mechanic matrix below; it must support the actual interactive engine. |
| Correct answers and validation rules | Data-only references/values/mappings/orders/tolerances appropriate to the mechanic, including every required stage. No JavaScript, expressions to evaluate or arbitrary interaction engine overrides. |
| Hints and solution | Ordered hint text and solution explanation/steps, preserved without loss. The prototype's single hint/solution text needs an agreed lossless adapter if the backend uses arrays/structured steps. |
| Feedback | Correct and incorrect feedback text, plus any explicitly supported stage feedback. |
| Checkpoint assignment | Reference to this version-owned instance plus classification and checkpoint role. Normal checkpoints retain existing numbering 1…normal count. FinishPoint uses the existing unnumbered `role: terminal` assignment; Creator-visible checkpoint 7 must not become a seventh normal entry. |
| Template version ownership | Owning Template identity and authoritative version on each instance/assignment. The instance is not freely reusable across Templates/versions. Copies/revisions require independent, destination-version-owned snapshots/identities and must not mutate the source. No automatic migration of existing templates. |

The backend must define exact names, envelope shape, validation limits and identity allocation before FE serialization is enabled. If instance IDs are version-scoped, the owner identity/version is part of their unique reference. Copying a Template must yield independent owned instances in the destination version; it cannot retain a mutable reference into the source version. Exact clone-ID allocation is a BE contract decision, not a client-generated ownership assertion.

### Required interaction/answer data by mechanic

| Mechanic(s) | Interaction data | Answer / validation data |
| --- | --- | --- |
| Tap & pair the relevant | Concept/example cards, card identities and pair identities | Complete valid pairing; distinguish both sides of each pair |
| Single choice / Multiple choice | Identified options and display order | One option ID / set of option IDs, respectively |
| True / False | Statement in instructions | Correct boolean |
| Memory card | Recall prompt/card content, supported reveal delay | Recall answer and fixed reveal behavior; delay is mechanic-specific, not a Hunt timer |
| Number line | Finite min/max, tick interval | Reachable numeric target and nonnegative bounded tolerance |
| Match the columns | Identified left/right items | Complete valid mapping |
| Drag & drop | Identified draggable items and targets | Valid target assignment per item |
| Fill in the blank | Ordered prompts and identified blanks | Expected answer per blank |
| Sequence | Identified elements | Valid complete element order |
| Find the mistake | Ordered identified steps and explanation options | First incorrect step identity and correct explanation identity |
| Build the problem (LEGO-like) | Identified pieces and construction slots | Valid construction/order using the allowed piece inventory |
| Number pattern / Shape pattern | Ordered terms/shapes with identified missing slot, available shape choices where needed | Missing term/shape |
| Rule discovery | Input/output examples and allowed rule choices | Correct rule identity and predicted output; no executable custom rule |
| Word Reconstruction (`scrambled-word`) | Team letter contributions | Reconstructed word |
| Shared Information Puzzle (`distributed-information`) | Shared facts and existing choices | Correct conclusion/choice |
| Collaborative Deduction (`hypothesis`) | Message packets and decoder key | Decoded answer |
| Sequence Assembly (`assemble-machine`) | Existing machine contributions/frequency choices | Correct frequency using the existing mechanic |
| Clue Synthesis (`clue-synthesis`) | Clue fragments and answer pattern | Riddle answer |
| Information Filtering (`filter-noise`) | Identified named signals | Set of trusted signal identities |
| Shared Code Assembly (`shared-final-key`) | Digit contributions and ordering instructions | Combined code |

Further contract requirements: server-side schema validation and permission checks; full create/version/read round-trip without silent field dropping; creator-authorized answer access and controlled participant projection; approval tied to the exact immutable Template/exercise snapshot; existing completion/scoring/terminal contracts retained; and gameplay consumers that actually resolve these owned instances. Persisting arbitrary JSON alone is insufficient. Existing starter, Legacy/Universal/Local, copy/revision, no-edit save, submit/approval and unauthorized-access acceptance must use the actual BE/database before enabling custom persistence. No shared-library endpoint, global exercise approval workflow, migration or backend implementation is proposed by this FE stabilization.

No end-to-end completion is claimed. Frozen 169-task reconciliation and unrelated execution-plan statuses remain unchanged.

## Initial catalog verification — 30 October 2026

Browser tests use the real FE components with explicitly mocked Template APIs, not live FE–BE integration.

- `npm run typecheck`: passed.
- `npm run build`: passed; existing Vite large-bundle warning remains (a CSS plugin timing warning also appeared in one local build).
- Full `npm test`: **42 Node test-file entries and 597 Vitest tests across 32 files passed**, zero failures/skips. This includes 78 exercise-library tests and updated Creator regressions for all seven independent draft slots, terminal save/reopen, blocked custom saving, supported assignment preservation, existing starters and lifecycle behavior.
- Chromium `tests/browser/exerciseLibrary.verify.mjs`: **60 Personal exercise scenarios** (all 15 types × 1440/768/390/320 px), plus four width-specific independent-custom/checkpoint/FinishPoint/Team workflows. All correct/incorrect checks, hint/solution/reset, native drag/drop and keyboard alternative, focus trap/return, Escape/close, unsaved preview, explicit saving block, unchanged fixture records and no horizontal overflow passed. Zero page errors or fixture persistence calls. [Machine-readable results](Creator_Challenge_Library_Browser_Results.json).
- Existing Chromium `tests/browser/checkpointFeatures.verify.mjs`: **4 viewport workflows passed**, preserving all seven Hunt Features, Feature 1 positioning/count resizing, terminal Personal/Team selectors, disabled terminal navigation and checkpoint-six departure. Only replaced authoring labels/region expectations were updated. Zero page errors/overflow.
- Mobile and desktop screenshots were inspected. The initial screenshot exposed a primary-button utility color conflict; the final pass verifies the corrected visible Check answer control. [Desktop](creator-challenge-preview/desktop.png) · [Mobile](creator-challenge-preview/mobile.png).
- `git diff --check`: passed. Frozen reconciliation, immutable Signal data/defaults, API services, gameplay serialization/hydration, and template persistence source remain byte-identical to the inspected main base.

Initial verification found outdated old-authoring expectations, a browser selector ambiguity from the number-line output's implicit status role, duplicate construction-piece selector ambiguity, and textarea label matching. These were corrected and rerun. Rebase-related selectors were reconciled with #135; final results above supersede those interim failures. No live backend/database/custom persistence test or deployed acceptance was performed.


## Stabilization verification — 31 October 2026

This section supersedes the initial blanket-save restriction and its corresponding test assertions. Browser APIs remain explicit FE fixtures, not live backend persistence or integration evidence.

- `npm run typecheck` and `npm run build`: passed. Existing Vite large-bundle warning remains.
- Full `npm test`: **42 Node test-file entries and 604 Vitest tests across 32 files passed**, zero failures/skips. The exercise/Creator suites contain **115 passing tests** in this full run. New coverage includes confirmed exclusions for both challenge classifications, cancellation/Escape, stale confirmation, explicit reconfirmation, unchanged-save version equality, save failure retention, selected-slot discard, inactive retained drafts, type-switch content retention, submission intent and preview-only decisions. Existing Signal starter, approval/version and supported terminal save/reopen tests remain intact.
- Chromium `experimentSaving.verify.mjs`: **4 viewport workflows passed** at 1440/768/390/320 px, zero page errors/overflow. Each covers a supported save and editor reopen through the mock server; Personal/Team/FinishPoint session drafts; current unsaved preview; cancel and Escape without writes; confirmation focus trapping/restoration; explicit supported-only save; payload exclusion; retained draft content and intent after saving; targeted discard; submission blocking and explicit preview-only intent; and no duplicate immutable version for unchanged supported data. [Results](Creator_Challenge_Stabilization_Browser_Results.json).
- Existing Chromium exercise suite: **60 scenarios passed** (15 types × four widths), plus its four independent-draft/checkpoint/Team workflows. Its Save draft assertion now expects saving to be available. Existing checkpoint browser suite: **4 viewport workflows passed**. Zero page errors/overflow in either suite.
- Desktop/mobile exclusion-confirmation screenshots inspected: [Desktop](creator-experiment-saving/desktop.png) · [Mobile](creator-experiment-saving/mobile.png).
- `git diff --check` passed. Catalog, mechanic renderers/editors/preview, API services, immutable Signal data/defaults, gameplay hydration/serialization, persistence/lifecycle source and frozen reconciliation are unchanged from initial PR #136 head `c827252`.

Interim test corrections: the save fixture was updated to return category metadata like the real Template response; the browser's initial supported save remains part of its mutation count; editor reopen preserves the mock backend record instead of resetting its module with a whole-page navigation. These fixture corrections do not establish real backend persistence. Final results above supersede interim assertion failures. No backend implementation, localStorage persistence, new PR, merge or deployment.


## Current integration: Template-owned custom exercises (31 October 2026)

This section supersedes the experimental persistence/submission restrictions described above. Base FE main: `7f9b3d05820774df33be7d5c6574e0f37a8a83a3` (merged #136). Authoritative contract: merged BE [#93](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/93), merge `4e6cb521ba6ac930d28cd513935d83367ee80f91`. The backend checkout was inspected read-only: persistence documentation, schemas, domain validation/allocation, Creator routes, generated OpenAPI and real-database test sources. No backend code, schema, endpoint, publication guard or execution-plan reconciliation was changed.

### Schema mapping and authoring

`persistenceTypes.ts` defines the closed discriminated union for all 15 Personal and seven Team mechanics. FE `Exercise.id` remains a temporary session ID. `Exercise.authored` holds typed mechanic content (`mechanic`, `activity`, `expected`, ordered `hints`); `persistedIdentity` holds backend-issued instance ID/owner separately. `persistenceAdapter.ts` converts explicitly between the old label-based examples and this identified content and projects only the validated, closed wire fields. Prototype `data` objects are never sent. Unsupported mechanics, versions, extra fields, invalid relations, nonfinite numbers and unconvertible examples produce explicit errors.

| FE prototype content | Persistence representation / lossless editor |
| --- | --- |
| Label-based single/multiple choices | Identified options and selected IDs; duplicate visible labels are distinguishable by position |
| Corresponding pair lists | Original left/right collection order plus explicit bijective ID pairs |
| Drag targets | Item/target collections and item-to-target assignments |
| Blank prompts/answers | Identified prompts and one answer per blank, including case sensitivity |
| Sequence/construction | Identified inventory, complete order, independent duplicate pieces and authored slot labels |
| Recall answer | Independent reveal-card text, 1–60-second delay and case-sensitive answer validation |
| Numeric range/pattern | Finite numeric values, tick grid/tolerance, identified missing term |
| Shapes/rule discovery | Identified shapes/rules, identified missing term, numeric input/output examples, explicit prediction input |
| Find mistake | Independent identified step and explanation choices, two-stage preview |
| Team mechanics | Identified contributions/facts/packets/clues/signals, decoder key/pattern, labeled numeric frequencies, trusted IDs and digit contributions/order/code |
| Single old hint | Zero or one ordered hint; full editor supports 0–10 ordered hints |
| Solution/feedback | Exact text, including whitespace, newlines and Unicode |

The content editor exposes every supported contract field through text, number, boolean, ordered collection and reference-choice controls. It never accepts executable engine configuration. Generated item IDs remain stable when labels or collection order change. New collection entries receive fresh client-owned item IDs; these are distinct from backend-owned exercise instance IDs. Pattern terms can explicitly omit their value/shape for the missing position. Type variants stay in session state until explicitly discarded. Team examples inherited from Signal may need correction (e.g. contribution text must actually reconstruct the authored word; final-key contributions must contain digits and ordering instructions). These are explicit validation errors, never inferred from prose or silently replaced with unrelated content.

`persistenceSchema.ts` and `persistenceValidation.ts` are browser-compatible contract snapshots from BE #93. Validation includes closed fields, bounded traversal, 100-KiB complete content, numbering/terminal constraints, paired identity fields, all mechanic relations and exact backend text/collection limits. Server validation remains authoritative. Contract changes require an explicit snapshot/types/adapter update. Read-only deployed `/api/docs.json` verification found all 22 variants exactly equal to the local exercise schemas.

### Saving, reload, revision and copying

Selected content is embedded only in `checkpoints[].customExercises.personal|team`. Each checkpoint supports independent optional slots, including the existing unnumbered terminal FinishPoint. Existing predefined kind/teamKind, navigation, geography, scoring, reward and unknown legacy fields remain intact. Selecting an example for actual authoring creates an independent custom instance. No shared exercise library, approval claim, new persistence system, endpoint or localStorage store was introduced.

Save draft validates the complete intended payload, calls the existing create or create-version operation, and waits for the authoritative response. New instances omit ID/owner. Revisions echo the most recently returned same-slot identity; the backend allocates fresh identities and destination ownership for each immutable version. Response verification rejects missing/dropped/changed custom content or missing/wrong ownership, so uncertain results cannot be reported as saved. Successful saves hydrate returned identities. Comparison ignores object key ordering while preserving array order and exact values.

The editor rechecks server lifecycle/version before mutation, preserves edits on rejection/conflict/network failure, and blocks blind retries after an ambiguous outcome. No extra Template is automatically created. A response acknowledges only its sent snapshot: newer working edits and inactive type variants are retained, with same-slot metadata rebased to the returned version. Only chosen content is persisted; preview-only and inactive variants remain session drafts. Unsaved intended changes block submission. Unload/reload and link navigation warn about unsaved content/session variants where browser APIs permit. No guarantee is made for process termination or every browser Back/Forward navigation.

Reducing checkpoint count requires explicit confirmation. Surviving slots retain their checkpoint assignment. Retained intended custom drafts for removed checkpoints block saving until restored or explicitly discarded; content is never moved to another slot. FinishPoint is not added to normal checkpoint numbering.

Approved Universal/Local revision behavior is unchanged: create a new draft candidate without modifying prior approved content. Existing `from-universal` copying stays server-owned; the returned Local destination has independent instance IDs/ownership and is hydrated into independent FE state. No automatic migration of existing Templates occurs. Legacy and both Signal starters retain their predefined payloads and lifecycle behavior.

### Submission and publication boundary

The old blanket custom-exercise submission restriction and save-exclusion confirmation are removed. Submission requires valid content equal to the latest saved version and sends that exact version through the existing Admin workflow. Local locality/geography and existing Universal/Legacy checks remain in force. API errors preserve path/message details for `invalid_custom_exercises`, and access, conflict, immutability, network and ambiguous outcomes remain explicit.

Custom exercises can be saved and submitted for review. **Hunts containing custom exercises still cannot be published.** Creator preview is a simulator, with no claim of live participant delivery or authoritative answer validation. Remaining BE/Participant work: authenticated checkpoint projections, controlled hint/solution release, server-side validation of every mechanic and multi-stage/team contribution behavior, and resolution of the correct version-owned slots before the backend publication gate can be reconsidered. No answer keys were added to Participant endpoints.

### Verification and remaining acceptance

Current automated results are recorded below after verification. `tests/customExercisePersistence.test.tsx` includes all 22 lossless round-trips, invalid contracts, real editor item identity, answer checks, independent snapshots, revision/identity rebasing, response integrity and retained newer edits. Creator workflow tests cover save/reopen/exact-version submit, terminal custom saving, count removal and failed-save retention. Existing Universal/Local/Legacy, Signal, navigation, scoring and starter tests remain included in the full suite.

Browser verification uses real Creator Studio/editor/preview components with mocked Template operations. It is not live FE–BE/database integration. `tests/browser/customPersistence.verify.mjs` replaces the prototype-only and exclusion-confirmation scripts (their old entry points forward to it). Across 1440/768/390/320 px it verifies every mechanic's correct/incorrect interaction, hints, solution, reset, modal initial focus/trap/return/Escape, save/authoritative identity/reopen, checkpoint navigation and horizontal overflow.

**Live persistence acceptance blocker:** this environment provides the deployed API URL, but no authenticated Creator/Admin test account or disposable integration database binding. The deployed OpenAPI was checked read-only; no production data was changed. Do not treat mock-backed tests or the BE PR's historical database results as a live FE integration result.

Manual acceptance against a permitted test database/account:

1. Sign in as Creator against the deployed BE #93 contract. Create a Universal draft (then repeat for a Local draft bound to a valid active locality with complete route geography). In Personal/Team authoring create each supported mechanic and supply valid content, including all hints, answer stages and contributions. Preview correct/incorrect answers, hint, solution and reset before saving.
2. Save and inspect the real create/version request: custom slots must be complete, new IDs/owners absent, predefined/navigation/geography/scoring unchanged. Inspect the response and database `hunt_template_versions.content`: UUIDv4 IDs and exact destination key/version ownership must be present. Compare all authored fields exactly.
3. Leave and reopen from My Templates, switch checkpoints/classifications and reopen the preview. Verify exact content, stable item IDs and one unnumbered FinishPoint. Save a FinishPoint custom slot. Reduce checkpoint count and verify explicit removal handling without reassignment.
4. Submit the exact saved version; approve it using an authorized test Admin. Revise as Creator, change one custom exercise and save. Verify fresh version-owned IDs, unchanged previous approved row and no changed publication authority until the established review completes.
5. Copy a published Universal using Use as Local. Verify destination-owned independent IDs and no mutable/source references; change destination content and confirm source content/database row remain unchanged.
6. In two sessions create a version conflict; reject malformed/schema/foreign-owner data; expire authentication; interrupt a save response after server commit. Verify retained work, meaningful errors, exact-version submit blocking and no duplicate create/retry. Reopen My Templates to reconcile ambiguous outcomes.
7. Recheck both Signal starters and a pre-existing Legacy Template without custom slots: no automatic custom migration and unchanged checkpoint/geography/scoring/reward/navigation data. Repeat on all four viewport widths.
8. Select a custom-bearing approved Template into a test Organizer draft. Publication must still fail backend readiness (`422 hunt_not_ready`); no client-completed participant challenge or answer-authority bypass is introduced.

No Master Execution Plan task IDs were added; the frozen 169-task reconciliation is unchanged. One Draft FE PR only; stop for ChatGPT PR review. Do not merge or deploy.

### Results for this FE integration

- `npm run typecheck`: passed.
- `npm run build`: passed; existing large-bundle warning remains non-failing.
- Full `npm test`: **42 Node test-file entries and 681 Vitest tests across 33 files passed**, zero failures/skips.
- Chromium custom persistence: **88 scenarios passed** (22 mechanics × 1440/768/390/320 px), zero page errors or page/modal horizontal overflow. [Results](Creator_Custom_Exercise_Persistence_Browser_Results.json).
- Existing checkpoint Chromium regression: **four viewport workflows passed**, covering all seven features, count resizing, terminal challenges, disabled terminal navigation and checkpoint-six departure. [Results](Creator_Custom_Exercise_Persistence_Checkpoint_Results.json).
- Deployed read-only OpenAPI: all **22 variants exactly match** the local closed schema snapshots. This checks the deployed contract, not authenticated persistence.
- `git diff --check`: passed. Backend checkout and the Master Execution Plan are unchanged.

Browser screenshots are in `creator-custom-exercise-persistence/`. API/database writes are mocked in browser/component suites. Live authenticated Creator/Admin/database acceptance remains blocked as described above; no live database integration pass is claimed. Earlier verification runs exposed obsolete gate assertions, JSON key-order comparison, incomplete mocked response headers, and source-edit HMR interruptions during browser execution. Those were corrected; the results above describe the final completed runs.

GitHub Actions [Frontend validation #281](https://github.com/tedixdev-arch/Tedix_Hunt_FE/actions/runs/41194097088) passed on implementation source `86e95a640f2ec1881c32a6824b6f6078e95b63b3`: clean install, typecheck, build and the full suite. Both deployment jobs were skipped. The follow-up adds three focused copy/error/reorder acceptance tests, explicitly strips persisted identity when cloning an independent FE instance, and adds this CI record; latest-head CI evidence is linked from [Draft PR #137](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/137). No deployment is requested or performed.

## PR #137 selection correction for ChatGPT re-review

This section supersedes earlier descriptions of the intent checkbox and of changing assignments merely by choosing an editor tab or editing the predefined dropdown.

`AuthoringDraft` now separates three concerns: `source` is only the viewed editor tab; required `assignment: 'predefined' | 'custom'` is the active assignment for the next saved Template; `custom`, `exercise` and `customByType` retain authored session content. The former `intendedForSubmission` flag is removed. Serialization reads the explicit assignment and never infers it from the viewed tab or the presence of a retained custom object.

| Creator action | Viewed tab | Assignment to save | Retained custom content |
| --- | --- | --- | --- |
| Reopen a persisted custom slot | Custom | Custom | Hydrated from that exact saved instance |
| View Predefined while Custom is selected | Predefined | Custom, unchanged | Preserved |
| Return to an existing Custom editor | Custom | Unchanged | Restored exactly, including unsaved edits |
| Edit predefined candidate dropdown | Predefined | Unchanged | Preserved; changing a candidate is separate from activating it |
| Click Use predefined assignment, then cancel confirmation | Predefined | Custom, unchanged | Preserved |
| Click Use predefined assignment and confirm replacement | Predefined | Predefined | Preserved in this session |
| Inspect/edit retained Custom after selecting Predefined | Custom | Predefined, unchanged | Preserved; edits do not silently reactivate it |
| Click Use this custom exercise | Custom | Custom | Uses the retained authored content |
| Start a new custom exercise when no custom draft exists | Custom | Custom | Independent content |
| Choose another mechanic/example with a retained custom draft | Custom | Unchanged | Current content and other type variants retained; Use this custom exercise activates it |
| Confirm Discard custom draft and use predefined | Predefined | Predefined | Explicitly discards only this slot's custom variants |
| Confirm Discard unsaved draft in the slot summary | Saved editor for this slot | Saved assignment restored | Discards this slot's unsaved variants; cancellation leaves them intact |

The panel explicitly displays `Saving: Custom exercise` or `Saving: Predefined assignment`. Viewing tabs alone never confirms replacement or discards anything. Both discard actions require confirmation. Replacement confirmation preserves the custom content; discarding and selecting are distinct operations.

For a Predefined assignment, `applyExerciseDrafts()` removes only that checkpoint/classification's `customExercises` entry, even while the Custom editor is open and holds authored variants. It removes the enclosing object only when both custom slots are absent. It never serializes retained custom objects or inactive variants into that selected predefined slot, and it never fabricates an existing Signal assignment when none is configured. The existing explicit predefined fields remain the selected candidate; an unconfigured optional slot remains unconfigured. Other Personal, Team, normal-checkpoint and FinishPoint assignments remain unchanged.

For a Custom assignment, serialization validates and converts the selected authored instance, independently of the viewed tab. A missing selected custom instance is an explicit validation error. Reconciliation preserves the active assignment and all unrelated session variants after saving, while replacing/clearing backend identity only according to the authoritative saved slot. After saving a predefined replacement, the next immutable version has no custom instance in that slot; returning to retained Custom in the same session restores authored content, and Use this custom exercise can activate it again. A page reload reconstructs only persisted assignments, never an inactive session variant. Prior approved versions remain untouched.

Submission still requires working selected content to equal the exact persisted Template version. Inactive retained variants may remain in the session without leaking into the submitted artifact. Selected unsaved changes still block submission.

Regression coverage now includes the ten requested cases: view-only switching without loss; explicit predefined selection/save/reload; approved persisted-custom replacement in a new version; predefined-to-custom save/reload; Personal/Team independence; terminal independence; exact submitted version/selection; absence of hidden custom serialization; unchanged approved artifacts; and survival of inactive unsaved variants after saving. A four-case real-component lifecycle matrix covers Personal/Team × normal/FinishPoint, including cancellation of replacement, and a separate test covers cancellation of discard. Browser operations use real Creator Studio components with mocked Template operations; no live FE–BE/database pass is claimed.

Verification results for this correction are recorded below. Backend code and the frozen execution plan remain unchanged. Update existing Draft PR #137 only; stop for ChatGPT re-review, with no merge or deployment.

### Selection-correction verification

- `npm run typecheck`: passed.
- `npm run build`: passed; existing bundle-size warning only.
- Full `npm test`: **42 Node test-file entries and 687 Vitest tests across 33 files passed**, zero failures/skips. This includes the selection lifecycle matrix, retained inactive variants, confirmed/cancelled replacement and confirmed/cancelled discard.
- New Chromium selection suite: **16 scenarios passed** (Personal/Team × normal/FinishPoint × 1440/768/390/320 px), zero page errors or horizontal overflow. [Results](Creator_Exercise_Selection_Browser_Results.json); current selection screenshots are in `creator-exercise-selection/`.
- Existing Chromium mechanic persistence suite: **88 scenarios passed** (all 22 mechanics at four widths), zero page errors. Existing checkpoint browser regression: **4 viewport workflows passed**, zero page errors or horizontal overflow. Existing backend/database acceptance limitations remain unchanged.
- `git diff --check`: passed. Latest source CI evidence is linked from existing Draft PR #137; no second PR is created.

The first lifecycle run exposed an invalid newly seeded Team word fixture: its existing Signal prose contributions do not reconstruct a word under BE #93. The inverse-transition test now explicitly selects the valid distributed-information mechanic rather than weakening validation or substituting saved content. Final results above supersede that fixture failure.

## Personal Challenge architecture correction — PR #138

**Current behavior (31 October 2026):** only the seven legacy Signal choices are assignable in Personal **Predefined** mode. The 15 complete mechanic examples remain selectable for read-only preview, simulation and explicit custom authoring; they cannot be assigned directly as publication-safe predefined instances. All three visual editors remain available. This section supersedes the initial PR #138 architecture at `8efd928`, which incorrectly treated example snapshots as ready-to-use predefined assignments. Update existing Draft PR #138 only; stop for ChatGPT re-review, no backend change, merge or deployment.

### Actual contracts inspected

FE base `main`: `3d64b5b46d52067974bf45d1d662429a78309e5f` (merged #137). BE source inspected read-only through GitHub at `4e6cb521ba6ac930d28cd513935d83367ee80f91` (merged #93). No backend checkout was edited and no database write or authenticated production operation was performed.

- BE `src/domain/checkpointGameplay.ts`, `creatorTemplates.ts`, `customExerciseSchemas.ts`, `customExercises.ts`, `huntReadiness.ts`; `models/HuntTemplate.ts`; `routes/creatorTemplates.ts`, `hunts.ts`, `huntAccess.ts`; `app.ts`, custom integration tests and `docs/Custom_Exercise_Persistence.md`.
- FE `checkpointGameplay.ts`, `templatePersistence.ts`, adapters/authoring/preview, `data/templateOne.ts`, `pages/template-one/TemplateOneExperience.tsx`, `hooks/useTemplateOneMission.ts`, the older `pages/student/CheckpointChallenge.tsx`, API services and existing lifecycle/Team tests.
- Read-only deployed `/api/docs.json`: 70 paths, **no checkpoint delivery, exercise delivery or answer-submission endpoint**. This verifies the documented route surface, not authenticated persistence or database behavior.

### What can be published today

| Category | Representation | Save/review | Hunt publication and Participant boundary |
| --- | --- | --- | --- |
| Existing supported Signal assignments | Original checkpoint `kind`, answers, hints, story and existing terminal role; no Personal `customExercises` slot | Existing Template operations | Does not trigger the custom-exercise publication block. Existing eligibility, approval, geography, Hunt setup and pilot requirements still apply. |
| Fifteen complete mechanic examples | Creator example content only; no direct predefined assignment action | Preview without writing. **Open custom editor**, then **Apply to Hunt**, then Template **Save draft** explicitly saves an independent custom instance | Not available as publication-safe predefined instances. No legacy identifier is invented or substituted. |
| Independently authored Custom exercises, including customized examples and older saved example snapshots | `checkpoints[].customExercises.personal` with the authoritative UUID/owner returned by BE #93 | Save and submit for review supported | Backend returns `422 hunt_not_ready` when publishing a custom-bearing Hunt; custom snapshots are withheld from non-organizer Hunt readers. |

The only accepted flat Personal `kind` values are **`hidden-rule`, `find-sabotage`, `square`, `build-key`, `radial`, `identify-signal`, `shared-final-key`**. BE derives these from canonical Signal content; the FE uses the same vocabulary. These values are not interchangeable aliases for the 15 example snapshots. For example, a custom Single Choice snapshot is not made publication-safe by writing `identify-signal`; its options/content still require the custom contract.

The Participant Signal experience renders the seven canonical exercises from imported `checkpointExercises`, with local checks in `useTemplateOneMission`. It does not consume Creator `customExercises` or the generic authored renderer. The older student challenge also reads static `eventData`. Thus a passing no-custom publication readiness result is **not proof of dynamic delivery of arbitrary Creator edits**. This PR preserves supported Signal assignments and never promotes a catalog entry or Creator simulator into Participant authority.

Authoritative sources: [BE publication readiness](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4e6cb521ba6ac930d28cd513935d83367ee80f91/src/domain/huntReadiness.ts), [legacy vocabulary](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4e6cb521ba6ac930d28cd513935d83367ee80f91/src/domain/checkpointGameplay.ts), [custom allocation/projection](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4e6cb521ba6ac930d28cd513935d83367ee80f91/src/domain/customExercises.ts), [existing persistence model](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/4e6cb521ba6ac930d28cd513935d83367ee80f91/src/models/HuntTemplate.ts).

### Exact remaining integration gap

All 15 examples—Tap & Pair, Single Choice, True / False, Memory Card, Number Line, Multiple Choice, Match the Columns, Drag & Drop, Fill in the Blank, Sequence, Find the Mistake, Build the Problem, Number Pattern, Shape Pattern and Rule Discovery—have valid custom persistence schemas. They do **not** have a supported predefined-instance registry/reference contract, a publication-safe mapping of their complete content into legacy `kind`, or generic Participant consumption of those version-owned snapshots.

Required follow-up: an explicit version-owned predefined/example identity and provenance policy if shared predefined-instance uniqueness is required; authenticated checkpoint-specific delivery and controlled hint/solution projection; server-authoritative answer validation for every mechanic/stage; Participant rendering/resolution of the selected version-owned slot; and acceptance against existing scoring, rewards, FinishPoint, eligibility and permissions. Publication policy can be reconsidered only when that integration is implemented and verified. This FE correction implements none of those backend changes and preserves every current guard.

### Honest selection, authoring and save semantics

The redesigned Personal shell keeps **one dropdown**. In Predefined it contains two clearly labeled, disjoint groups: **Signal assignments · existing Hunt contract** and **Examples · preview or customize only**. Each choice appears once; the duplicate “Current challenge” alias is removed. All 15 examples remain visible/selectable in both authoring paths. No raw JSON or misleading “Ready to play” label appears in the Personal experience.

Selecting a Signal candidate only changes the viewed candidate. **Use this challenge** explicitly selects the existing flat assignment and removes only the selected Personal custom slot when the working Template is composed. It preserves every unrelated Personal/Team field and the unnumbered FinishPoint. Eligibility and delivery are not promised by the preview.

Selecting an example displays a read-only overview, a nearby capability notice and the real Creator simulator. It offers **Open custom editor**, never **Use this challenge**. Browsing/testing it produces no persistence call and does not replace the selected challenge. Opening it initializes a fresh independent custom draft. Replacing a retained same-mechanic draft requires confirmation, and the previous assigned snapshot stays selected until confirmed **Apply to Hunt**. The main Create Your Own tab can still resume retained drafts.

**Apply to Hunt** selects a valid Custom candidate in the Template working draft; it is not backend persistence. The existing Template **Save draft** operation creates the immutable version and waits for authoritative content/identity confirmation. Custom capability is visible beside its editor and selected-assignment status. Saving, revising, copying, exact-version submission, failed-save retention and conflict/ambiguous-outcome handling continue to use BE #93's existing contract. No new persistence store or API endpoint is introduced.

Tap & Pair, Single Choice and Fill in the Blank retain shared Step by Step / Edit with Preview drafts, direct card/option/question editing, stable IDs, relationship-aware add/remove, keyboard reorder, hints/feedback, selected-text blank insertion and separate Test / Return play state. The other 12 mechanics keep detailed authoring, validation, inline preview and persistence and are explicitly labeled as awaiting visual editing. The Team editor and its seven mechanic identifiers are unchanged.

### Metadata retention and duplicate prevention

`personalChallengePreset` is **not a declared BE provenance field**. Current source accepts it as an ordinary checkpoint extension: `isTemplateContent` checks known fields without stripping checkpoint extensions, `allocateCustomExercises` clones the whole snapshot, the model inserts complete content JSONB, and the read routes return that content. The pinned allocator was executed and retained the field for all 15 samples. This is source-level retention evidence; no authenticated deployed save/reload or database round-trip is claimed.

The corrected FE does **not read, create, rewrite or depend on that marker**. Existing marker values are carried as uninterpreted legacy checkpoint data. All saved Personal custom snapshots hydrate as Custom, whether the marker is valid, missing, forged or changed. Optional content recognition only says that a custom draft *matches example content*; it never infers provenance or publication rights. A missing marker no longer prevents acknowledging an otherwise exact, correctly owned saved snapshot. Missing/changed exercise content or invalid server ownership still rejects confirmation. A backend rejection retains the complete draft, with no automatic retry that strips content or attempts publication.

The old same-preset-key assignment rule is replaced by capability gating: there is **no direct example/predefined assignment path to duplicate before or after reload**. Each dropdown entry appears once; older saved example snapshots remain custom. Explicit customization creates independent instances, which may repeat a mechanic or even its content. Text equality is not treated as shared instance identity, especially for True / False and Memory Card, whose schemas contain no item-ID collections. Duplicating a saved custom UUID into another checkpoint or FinishPoint still fails the complete-payload duplicate-ID validator and BE same-slot ownership rules, independently of preset metadata. A future shared predefined-instance rule needs the missing authoritative BE identity/provenance contract; the UI does not fabricate one.

### Verification and limitations

[Executed pinned BE contract checks](Personal_Challenge_Contract_Investigation.json): canonical Signal passes `isTemplateContent` and Hunt readiness with valid other fields. All 15 **actual FE example payloads** pass custom allocation/validation, retain generic metadata in source allocation, fail Hunt publication readiness with or without that metadata, and are withheld from non-organizer snapshot reads. Substituting each example type into legacy `kind` is rejected by the typed checkpoint contract. These are executions of unchanged pure BE source functions in scratch, **not database tests or live API integration**.

New/updated FE regressions cover all 15 example-only selections and explicit Custom conversion; seven Signal choices and FinishPoint; no duplicate menu or direct example assignment path after save/reload; missing/forged/rejected metadata; unchanged complete content and authoritative identity checks; independent repeated Custom instances; duplicate saved UUID rejection; cancelled replacement; the three visual editors and shared draft/test state; and unchanged Team slots. Existing full lifecycle and all 22 mechanic tests remain included.

Browser evidence uses the real Creator components with mocked Template operations, not live FE–BE persistence. The three redesigned mechanics are verified at 1440/768/390/320 px, with all 48 screenshots refreshed to show the corrected example/custom boundary. The all-mechanic and checkpoint regressions remain available:

- [Builder results](Personal_Challenge_Builder_Browser_Results.json)
- [All 22 mechanics](Personal_Challenge_All_Mechanics_Browser_Results.json)
- [Checkpoint/FinishPoint workflows](Personal_Challenge_Checkpoint_Browser_Results.json)

| Mechanic | Example selection (1440) | Guided Custom editor (768) | Visual Custom editor (390) | Custom test (320) |
| --- | --- | --- | --- | --- |
| Tap & Pair | [View](personal-challenge-builder/tap-pair-1440-predefined.png) | [View](personal-challenge-builder/tap-pair-768-step-by-step.png) | [View](personal-challenge-builder/tap-pair-390-visual-edit.png) | [View](personal-challenge-builder/tap-pair-320-test.png) |
| Single Choice | [View](personal-challenge-builder/single-choice-1440-predefined.png) | [View](personal-challenge-builder/single-choice-768-step-by-step.png) | [View](personal-challenge-builder/single-choice-390-visual-edit.png) | [View](personal-challenge-builder/single-choice-320-test.png) |
| Fill in the Blank | [View](personal-challenge-builder/fill-blank-1440-predefined.png) | [View](personal-challenge-builder/fill-blank-768-step-by-step.png) | [View](personal-challenge-builder/fill-blank-390-visual-edit.png) | [View](personal-challenge-builder/fill-blank-320-test.png) |

No authenticated Creator/Admin account or disposable database binding was supplied. Deployed metadata round-trip retention, live Participant delivery and deployed acceptance remain unverified. No backend, permission, scoring/reward, execution-plan or frozen inventory changes. Existing Draft PR #138 only; STOP for ChatGPT re-review, no merge or deployment.

Final correction verification:

- `npm run typecheck`: passed.
- `npm run build`: passed; existing bundle-size warning only.
- Full `npm test`: **42 Node test-file entries and 723 Vitest tests across 34 files passed**, zero failures/skips.
- Focused capability suite: **36 tests passed**, including every example, all seven Signal assignments, FinishPoint, metadata loss/rejection, and duplicate UUID rejection.
- Chromium: **12 builder scenarios**, **88 all-mechanic scenarios**, and **four checkpoint workflows** passed at 1440/768/390/320 px, with zero page errors or horizontal overflow; 48 refreshed screenshots.
- Pinned pure BE checks: canonical Signal readiness passed; all **15 actual FE examples** accepted only as custom snapshots, blocked from Hunt publication and withheld from non-organizer reads. Generic checkpoint metadata retention verified in source allocation, not in a live database.
- Deployed read-only OpenAPI: 70 paths; no checkpoint/exercise delivery or answer-submission endpoint.
- `git diff --check`: passed. No live FE–BE/database acceptance, backend change, merge or deployment is claimed.


## Personal Challenge UX correction — 31 October 2026

### Inspected baseline and backend boundary

Based on FE `eed6717ca46eb3f87e5aa5ee577b9af55ac0cf27`, current main after merged #136, #137 and #138. Inspected their PR descriptions and the actual merged implementation: CreatorStudio, PersonalChallengeAuthoring, PersonalMechanicEditor, PredefinedChallengeContent, ExerciseRenderer/AuthoredExerciseRenderer, ExerciseContentEditor/AuthoredContentEditor, personalExamples, templateExercises, experimentDrafts, starter/Universal-copy operations, checkpoint gameplay, API/persistence adapters, lifecycle tests and browser fixtures. BE #93 and `docs/Custom_Exercise_Persistence.md` at `4e6cb521ba6ac930d28cd513935d83367ee80f91` were inspected read-only. No backend files, protected Signal data, publication checks, scoring rules or reward rules changed.

The existing BE contract is unchanged: the server allocates exercise UUIDs and version ownership; saved custom snapshots live in one Personal/Team slot per checkpoint; new immutable versions and explicit Universal copies allocate independent identities. Custom-bearing Hunts cannot be published. Creator simulation does not establish Participant delivery or server answer checking. Full catalog examples still have no publication-safe predefined wire identity, so **there is no predefined-example assignment button**. This also prevents assigning one shared predefined instance twice. Independent custom copies can reuse a mechanic; persisted instance UUID duplication remains rejected by full-payload validation and backend ownership checks.

### Exact Signal leak and creation isolation

The leak was not just a dropdown. `CreatorTemplateEditorPage` cleared the name/mission fields for `blankNew` but unconditionally initialized `normalGameplay` through `createNormalGameplay(6)`. That helper inserted six canonical Signal `kind`, `teamKind` and `navigationMode` assignments. Geographic checkpoint drafts also unconditionally used `normalCheckpointNames`, which selected Signal names. Those working values reached `serializeGameplay` and the create/version payload. A second isolation risk was that changing the route from a saved Template to scratch creation reused the existing React editor state. Separately, PersonalChallengeAuthoring always appended all seven Signal choices to every Predefined selector.

New Universal and Local scratch initialization now uses clean numbered gameplay with no activities, generic checkpoint names, no positions, an empty story and one unnumbered terminal entry. The old unclassified `/create` scratch URL also starts a clean Local draft; the compatibility chooser directs scratch creation to the explicit Local URL. `createNormalGameplay` defaults to clean modern data; canonical defaults require the explicit legacy context. New classified creation never runs Signal geographic prefill. A loaded record hydrates its own complete content, not new-template defaults. The complete editor is keyed by the saved Template key or new creation category, so navigating between records/creation paths cannot carry the previous context, story, route or challenge draft into the destination. The route-transition regression exercises Legacy → new Local → new Universal without remounting the surrounding router.

`personalCreationContext` supplies explicit session context to CheckpointEditor/ChallengeAuthoring. All new creation is modern. Existing records with explicit flat legacy assignments (including supported old component indexes interpreted by the existing hydration adapter), or an unclassified Legacy record, retain Legacy context. Actual saved identifiers are the evidence, never a checkpoint name, Template display name, city or a count of seven. Historically classified records already containing legacy assignments are preserved rather than silently migrated. The Legacy selector contains only identifiers already present in that Template, plus the optional unconfigured state. Its original payload stays intact, including unknown fields and original checkpoint ordering. Existing custom snapshots in these records remain editable; explicit custom authoring and assignment do not migrate their original flat content.

Local-from-Universal still uses the existing `fromUniversal(source.key, destination, publishedReference)` API, pinned to the explicitly selected publication. The destination hydrates only the returned content and independent destination identities. No source default or unrelated Signal fallback is introduced. Existing copy/lifecycle tests and new destination-isolation tests cover this path; this is frontend fixture evidence, not a claim about a live database operation.

### One selector and shared draft

Modern Predefined and Create Your Own share one **Personal Challenge** selector: the 15 requested friendly labels plus **No challenge (optional)**. It has no optgroups, mechanic IDs, difficulty suffixes or legacy choices. Switching tabs retains the currently selected modern mechanic. Predefined shows the complete, immediately playable read-only example through the existing engine. Gameplay inputs are temporary attempt state, not editing controls. Create Your Own creates or restores an independent editable copy and retains session variants by type.

Assignment remains explicit. Browsing another mechanic, an example or another tab never replaces the selected exercise. Apply to Hunt confirms replacement when there is an existing assignment; cancellation retains it. Removing a challenge is also explicit. `appliedCustom` preserves the selected instance while a replacement is drafted. Existing same-slot save reconciliation, authoritative ownership, revision, submission and conflict handling are unchanged. One concise contextual publication notice replaces repeated architecture explanations; an unsaved indicator and relevant errors remain.

### Mobile canvas and contextual editing

**Edit with Preview** is the default. Its prominent segmented control sits immediately below the common title/instructions. The centered canvas is at most 390px wide on desktop and uses the available width without another phone frame on small screens. It displays title, instructions, cards/options/blanks and assistance content in the participant-style layout.

Tap & Pair, Single Choice and Fill in the Blank have real contextual pencil controls. Opening a pencil reveals only that element's compact live editor. Text changes render immediately. Escape/Done closes the panel and restores pencil focus. Item addition/removal moves focus to a surviving/new edit control. Pair/card relationships and option/blank answers use stable identities rather than label matching. Removing the correct option requires choosing another. Blank accepted answers and case matching remain editable.

The **Edit | Play** control separates answer-key authoring from gameplay. Play uses the existing ExerciseRenderer/AuthoredExerciseRenderer and its existing validation, hint, solution and reset behavior. There is no duplicated answer-validation engine and no Test Challenge button in Personal authoring. Reset clears only simulation state. Switching back to Edit or changing editor modes preserves the same authored draft.

### Guided editing and remaining work

For the three priority mechanics, Step by Step presents one pair, option or blank question at a time, followed by separate hint, feedback, solution and play tasks. Task count follows the actual item count. Back/Next, local required-field validation and inline messages guide the Creator; unrelated incomplete later items do not block reaching them. Existing keyboard reorder controls and selected-text blank insertion remain available here. Both editing modes write the same parent-owned exercise; checkpoint and feature navigation retain that state.

The other twelve mechanics keep their full detailed editors under **Step by Step** and inline engine play under **Edit with Preview**. The shell explicitly says to use Step by Step for content changes; it does not describe those conventional editors as finished visual editors. Common fields are not duplicated in the detailed form. Friendly content/answer labels replace reference-field terminology. Remaining work: add contextual visual editing and per-task guided flows for those twelve mechanics, after this PR; Participant delivery and server answer authority remain backend integration work outside this PR.

### Map investigation only

`RouteEditor` currently chooses its initial center from saved checkpoint/FinishPoint positions, positioned working drafts, or route-research references. It identifies Cluj context only from the existing Signal/research handling. If none exist, it falls back to Cluj's existing app center **at zoom 3**, a Europe-wide overview. The selected registry locality is held by `LocalGeographySelector`/CreatorStudio and is not a RouteEditor camera input. `TedixMap.initialOptions` is captured once in a ref, so a later city selection alone cannot correct the initial view. This explains the observed selected-city/wide-zoom mismatch without inventing checkpoint coordinates.

Smallest follow-up: pass the already validated selected/saved registry locality as optional **initial camera context**, after authored/route positions in the precedence chain; use its actual coordinates and the existing city zoom or actual known bounds. Apply it only before user camera interaction, or through an explicit “Show selected city” action. Do not write it into checkpoint drafts, use Template names as locality authority, recreate the map on every edit, or override a panned camera. New unsaved locality selection currently returns only its ID, so that callback contract must also expose the validated registry record. No map code or coordinates changed here; existing camera regressions are retained.

### Verification for this correction

- Full final `npm test`: **42 Node test-file entries + 732 Vitest tests across 35 files passed**, zero failures/skips. The final route/context/FinishPoint/navigation subset also passed 60 tests. `git diff --check` passed.
- Typecheck and production build: passed; existing large-bundle warning remains.
- Focused component coverage includes all 15 modern selectors and examples; three visual mechanics; stable identities, correct-answer changes, item addition/removal, pencil focus/Escape, guided local validation/reordering, shared drafts, simulation isolation, assignment replacement, immutable versions, rejection/conflict handling, protected Signal data and creation/copy isolation.
- New real Chromium UX workflow: **12 scenarios**, three priority mechanics at **1440, 768, 390 and 320px**. Clean Local payload, selector contents, immediately playable examples, visual/pencil/guided editing, keyboard focus, item removal, correct-answer selection, assignment, save/reload and checkpoint retention passed, with no page errors or horizontal overflow. [Results](personal-challenge-ux/results.json).
- Existing real-component all-mechanic browser suite: **88 scenarios** (all 15 Personal and seven Team mechanics at all four widths), including correct/incorrect answers, hint/solution/reset, detailed-editor availability, same-slot save/reload and checkpoint navigation. [Results](Personal_Challenge_UX_All_Mechanics_Browser_Results.json).
- Existing checkpoint browser regression: **4 workflows** at all requested widths passed, including terminal Personal/Team assignments, disabled onward navigation at FinishPoint and checkpoint-count changes, with no page errors/overflow. [Results](Personal_Challenge_UX_Checkpoint_Browser_Results.json).
- [Clean Local, desktop](personal-challenge-ux/clean-local-1440.png) · [Modern selector](personal-challenge-ux/modern-selector-1440.png) · [Predefined](personal-challenge-ux/tap-pair-predefined-1440.png) · [Visual canvas](personal-challenge-ux/tap-pair-visual-1440.png) · [Pencil editor](personal-challenge-ux/single-choice-pencil-1440.png) · [Guided flow](personal-challenge-ux/fill-blank-guided-1440.png) · [390px](personal-challenge-ux/tap-pair-visual-390.png) · [320px](personal-challenge-ux/fill-blank-visual-320.png).

Browser/component Template operations use mocked frontend API fixtures and actual rendered components. **No authenticated FE–BE or database integration pass is claimed.** Existing version ownership/publication safeguards remain intact. No merge or deployment. One Draft PR; stop for ChatGPT PR review.
