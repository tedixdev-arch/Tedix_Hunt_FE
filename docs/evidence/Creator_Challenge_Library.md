# Creator challenge library and interactive exercise preview

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

## Personal Challenge game builder — 31 October 2026

This section supersedes the Personal authoring presentation described above. Base: current `main`, `3d64b5b46d52067974bf45d1d662429a78309e5f` (merged FE #137). Reviewed merged FE #136/#137 and merged BE #93, the existing evidence above, CreatorStudio, challenge/content/preview/rendering components, checkpoint gameplay hydration/serialization, typed adapters and existing component/browser lifecycle tests. No AGENTS.md was present. Backend implementation, Team editor, frozen task inventory and execution plan are unchanged. This is one Draft FE PR for ChatGPT review; do not merge or deploy.

### Selection and predefined content

Personal authoring has Predefined / Create Your Own and one **Personal Challenge** dropdown. All 15 friendly mechanic names/difficulties are present in both modes. Existing Signal story choices remain in a separate option group in that same Predefined dropdown, preserving their previous selection capability and exact content; there is no second Exercise Catalog selector. Existing checkpoint story context remains read-only. No JSON or developer provenance labels appear in the new Personal shell. The retained-draft overview is collapsed by default.

`predefinedPersonal.ts` converts exactly one complete existing example for each of the 15 mechanics into the BE #93 content contract and validates each at initialization. All 15 examples on this base convert and validate successfully, including rule discovery's explicit prediction input; no prototype correction or protected Signal data edit was necessary. Their item identities are deterministic; definitions should be treated as immutable. A future changed definition needs explicit preset versioning rather than silently changing an existing assigned snapshot.

Predefined selection displays a read-only content overview, hints/solution disclosure and inline testing through the existing renderer. **Use this challenge** selects its complete content for the current checkpoint. Browsing candidates does not choose what will be saved. Assigned candidates remain visible but disabled and labeled with their checkpoint, including FinishPoint. The duplicate guard is scoped to this Template's current version/working draft and is checked again when composing the save payload. To reassign, explicitly replace/remove the existing assignment, then use the released challenge at the target checkpoint. No silent move or cross-Template restriction is introduced.

### Persistence representation and confirmation

A ready-to-use definition is a complete instance, not a mechanic reference. Its complete, validated content is embedded in the existing `customExercises.personal` slot and receives authoritative backend identity/ownership through the existing Template operation. It never changes legacy Signal `kind`, answers or content. **Important boundary:** these new predefined snapshots consequently share BE #93's custom-bearing Hunt publication restriction; “ready to play” means ready for authoring assignment/testing, not approved live participant delivery. The UI states that saving/submitting for review is supported and live publication is not yet available.

The optional checkpoint extension `personalChallengePreset` records the selected ready-to-use definition key beside existing checkpoint fields, within the same Template snapshot. It does not add a field to the closed custom-exercise wire schema, create an independent record or introduce a persistence system. BE #93 preserves these checkpoint extension fields. FE hydration recognizes a preset only if its complete content also matches the canonical snapshot. A custom copy has fresh item identities and no preset key, so independently authored exercises of the same mechanic remain unrestricted, including mechanics without item collections. A save response that drops, changes or unexpectedly retains the preset selection cannot be acknowledged as saved. Actual deployed round-trip retention still requires the live acceptance below; mock results are not proof of it.

For a chosen custom challenge the preset extension is removed; for a legacy story challenge the Personal custom slot and preset extension are removed. Other fields and Team/other checkpoint slots remain intact. New instances omit backend ID/owner. Same-slot revision references, new version allocation, copies, approved version immutability, conflict/ambiguous-outcome handling, whole-content limits and exact persisted submission remain in the existing flow. After any save, selected snapshots and retained variants rebase only their identity metadata to the authoritative same-slot result, preserving newer edits. No custom validation/schema rule has been weakened.

### Custom editing and testing

**Apply to Hunt** selects the valid challenge for the Template working draft. It makes no backend call and does not claim persistence. The existing Template **Save draft** action persists the whole selected Hunt through create/create-version and waits for authoritative confirmation. Merely opening Custom, switching mechanic or viewing a retained variant does not replace the selected challenge. Replacements require confirmation; cancellation preserves the selected snapshot and retained content. Discard changes confirms before restoring this checkpoint's saved challenge. The global retained-draft discard continues to restore the exact saved slot.

The new guided and visual editors support **Tap & Pair**, **Single Choice**, and **Fill in the Blank**. They share the same authored draft and contract adapter. Common title/question fields remain visible; Step by Step has three logical tasks: content, hints/feedback, review/test. Back/Next and an accessible current-step indicator provide progression. The content step uses the same relationship-aware controls as visual editing rather than asking for duplicate answer mappings.

- Tap & Pair: directly editable paired cards, atomic add/remove, keyboard Up/Down reorder. Text/order changes retain item IDs and pairing relationships.
- Single Choice: directly editable option cards, correct-answer radio, add/remove/reorder. Correct answers reference stable IDs; removing the correct option requires choosing a replacement.
- Fill in the Blank: editable questions and accepted answers, add/remove/reorder and case sensitivity. Insert blank replaces a selected word/phrase with `___` and captures that text as the accepted answer; it can also insert at the caret. Question/answer relationships retain their IDs.
- Hints: ordered hints with add/remove; solution and both feedback messages remain editable. Friendly validation and field feedback are shown; invalid drafts cannot be tested/applied. Backend validation remains authoritative.
- Edit with Preview defaults to Edit. Test Challenge temporarily presents the existing interactive renderer; Return to Edit restores the unchanged draft. Play attempts, hints, solutions and reset remain local to the renderer and reset when a new test starts. Keyboard focus follows the Test / Return transition. Reordering has button alternatives and does not require drag-and-drop.

The remaining 12 mechanics retain their full detailed content editor, contract validation, inline preview/test and persistence in the same simplified selection shell. They are explicitly labeled as awaiting visual editing. No new Organizer editor or permission behavior is introduced; the reusable mechanic editor accepts only exercise/onChange props.

Checkpoint buttons retain navigation and now show compact assigned/incomplete/unsaved indicators, with a readable status below the selected checkpoint name. FinishPoint is visibly named and remains the existing unnumbered terminal slot. Navigation departure from FinishPoint remains disabled.

### Verification for this redesign

The final automated counts and browser results are recorded below. New coverage in `tests/personalChallengeBuilder.test.tsx` checks all 15 valid/read-only definitions, one dropdown, shared draft state, stable item/answer relationships, add/remove/reorder, invalid content, selected-text blank creation, independent testing, explicit/cancelled replacements, duplicate prevention/release, independent custom copies and Template scope, saved provenance hydration and authoritative identity/selection confirmation. Existing Creator lifecycle tests retain save/reopen/revise/copy/submit, removed checkpoints, FinishPoint, errors/conflicts, Personal/Team independence and protected Signal checks; their presentation interactions now use the new controls.

Browser scripts:

- `personalChallengeBuilder.verify.mjs`: 3 redesigned mechanics × 4 widths (1440/768/390/320), predefined read-only selection/test/assignment, duplicate-disabled options after reload, guided/visual shared edits, keyboard reorder, inline correct-answer/reset behavior, custom save/reload, preserved unrelated checkpoints and overflow checks. Four screenshots per mechanic/width: predefined, guided editing, visual editing and testing.
- `customPersistence.verify.mjs`: all 22 mechanics × 4 widths, complete editor/answer/hint/solution/reset/save/reload checks. Personal now uses inline testing; Team retains its modal keyboard/focus checks.
- `checkpointFeatures.verify.mjs`: four-width regression covering seven features, count/position resizing, normal/FinishPoint Personal and Team choices, terminal navigation restriction and horizontal overflow.

All browser Template operations are mocked using the existing fixture, which allocates response identities. No authenticated Creator/Admin account or disposable database binding is provided. Live FE–BE/database acceptance and deployed acceptance remain unverified. In addition to the manual acceptance above, verify that a real saved/reloaded predefined snapshot retains `personalChallengePreset`; reject a dropped extension without claiming save success, verify same-Template duplicate disabling after reload, and verify independent Local copy/revision identities. Backend publication must remain blocked for these custom-bearing snapshots.

[Builder browser results](Personal_Challenge_Builder_Browser_Results.json) · [All-mechanic regression results](Personal_Challenge_All_Mechanics_Browser_Results.json) · [Checkpoint regression results](Personal_Challenge_Checkpoint_Browser_Results.json).

Representative screenshots (all 48 captures are in `personal-challenge-builder/`):

| Mechanic | Predefined (1440) | Guided (768) | Visual (390) | Test (320) |
| --- | --- | --- | --- | --- |
| Tap & Pair | [View](personal-challenge-builder/tap-pair-1440-predefined.png) | [View](personal-challenge-builder/tap-pair-768-step-by-step.png) | [View](personal-challenge-builder/tap-pair-390-visual-edit.png) | [View](personal-challenge-builder/tap-pair-320-test.png) |
| Single Choice | [View](personal-challenge-builder/single-choice-1440-predefined.png) | [View](personal-challenge-builder/single-choice-768-step-by-step.png) | [View](personal-challenge-builder/single-choice-390-visual-edit.png) | [View](personal-challenge-builder/single-choice-320-test.png) |
| Fill in the Blank | [View](personal-challenge-builder/fill-blank-1440-predefined.png) | [View](personal-challenge-builder/fill-blank-768-step-by-step.png) | [View](personal-challenge-builder/fill-blank-390-visual-edit.png) | [View](personal-challenge-builder/fill-blank-320-test.png) |

Final verification for this redesign:

- Full `npm test`: **42 Node test-file entries and 714 Vitest tests across 34 files passed**, zero failures/skips.
- `npm run build` (includes TypeScript checking): passed. Existing bundle-size warning remains non-failing.
- Builder Chromium: **12 scenarios passed**, three redesigned mechanics × four widths, zero page errors or page/editor horizontal overflow; **48 screenshots** captured.
- All-mechanic Chromium regression: **88 scenarios passed**, 15 Personal + seven Team × four widths, zero page errors or horizontal overflow.
- Checkpoint Chromium regression: **four viewport workflows passed**, zero page errors/overflow.
- `git diff --check`: passed. No live integration pass, production data change, merge or deployment is claimed.

Browser tooling was installed under ignored/uncommitted `work/browser-tools` and invoked via `PLAYWRIGHT_MODULE`, using the environment's `/usr/bin/chromium`; this adds no application dependency. Intermediate build/test logs and tooling are not part of the PR. Committed screenshots/results use mocked operations and are review evidence only.
