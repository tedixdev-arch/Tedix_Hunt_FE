# Creator challenge library and interactive exercise preview

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
