# Creator challenge library and interactive exercise preview

30 October 2026 (Europe/Bucharest). Draft FE source for ChatGPT review. No merge or deployment. Custom exercise persistence and live FE–BE integration remain blocked/unverified.

## Inspected sources and scope

Implementation is based on FE main `87cc8afeb17625b342973966ca88e45d6c966ef8` (merged #135), including its seven-feature Creator presentation, total-count translation and terminal checkpoint selector. The initial workspace was older; the working branch was rebased onto current main and conflicts were resolved preserving #135's numbering, geography, navigation and regression coverage.

Read the Master Execution Plan and frozen reconciliation, current CreatorStudio, CheckpointGameplayEditor/StoryPreview, checkpointGameplay hydration/serialization/validation, templatePersistence and lifecycle/local validation, creatorTemplates API types/calls, organizerTemplates, immutable checkpointExercises, participant exercise visuals/team controls and existing browser/unit/Signal starter regressions. No AGENTS.md was present. No backend repository was modified or checked out.

The supplied request is the available canonical 15-name/difficulty reference. No separate full 15-type specification was supplied or found in the FE tree; no additional definitions are attributed to a missing document. Exact supplied names/levels are retained. The reference repository `tedixdev-arch/tedix-variable-rewards` was inspected through the authenticated GitHub connector at `29e34f924feac7f5fe330d200dc1f00d94f0ad71`: lesson types and validators, grade-five/six-eight exercise definitions, TapAndPairPage, findTheMistakeState and memoryCardCountdown. The pure recall countdown helpers are reused with source attribution. Tap/pair follows concept/example matching with face-down cards. Memory card follows recall then delayed reveal (not a replacement matching game). Find the mistake follows target selection then explanation; reward/progression dependencies are omitted from this standalone simulator. Numeric-pattern content reuses the reference's 3 → 12 → 48 → 192 → 768 example. Existing Signal visuals inform the saved-instance adapters; no Participant Hunt screen is copied.

## Bounded implementation

- `exercises/catalog.ts`: stable story-independent type IDs, 15 concrete local prototypes, mechanic-specific field schemas and relational validation; fixed answer checking without executable rules or evaluation.
- `ExerciseContentEditor`: schema-specific controls for each mechanic, common title/instructions/assistance/feedback fields, validation errors. Boolean, numeric, mapping, list, ordered-step, construction and multi-answer editors expose different content schemas. Changing type starts an independent copy of that type's example.
- `ExerciseRenderer`: face-down pair cards, single/multiple choices, truth selection, recall/reveal, numeric slider, column mapping, actual drag/drop plus keyboard/touch select alternative, blank inputs, ordered piece assembly, mistake/explanation stages, number/shape patterns and rule-plus-output checking.
- `ExercisePreview`: shared native modal, generic phone proportions, constrained width/height, internal scrolling, close/Escape, focus trapping/restoration. It receives the current draft and never calls persistence/runtime services. Hint, solution, checking and Reset work independently of the editor.
- `ChallengeAuthoring`: Predefined / Create Your Own, saved-instance inspection, clearly labeled local examples, independent custom copies. Per-checkpoint/per-challenge session drafts live outside serialized Template content and survive preview, checkpoint and feature switches. Returning to saved assignments enables supported saving; custom copies remain available during the editor session. An explicit global return-to-saved action handles multiple or no-longer-visible checkpoint drafts. Reloading/leaving the editor does not persist these drafts.
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

**Gate outcome:** unsupported custom and local-example saving is disabled, with explanations in the panel and at Template level. Both Template persistence and submit handlers additionally reject active unsupported drafts. No new API field, database, localStorage persistence or silent fallback assignment is introduced. Selecting Predefined → Saved assignment explicitly returns to the existing supported assignment; a retained custom draft is not claimed to be saved. Supported assignments and opaque existing payloads continue to use the current serialization/hydration path. Existing starter creation remains server-backed and creates independent editable copies.

## Exact backend work required before enabling custom persistence

This is a required contract proposal, not an implemented wire schema:

1. Define and version an exercise instance contract with stable instance ID, canonical mechanic/type ID and schema version, title/instructions, type-specific content, answer/validation data, hints, solution and feedback. Distinguish database-approved instances from creator-owned drafts and local examples.
2. Define normal-checkpoint and unnumbered terminal assignment references (or explicit immutable inline instance snapshots), including owner/authorization and lifecycle constraints. Preserve legacy `kind`/`teamKind` handling and opaque historical content; do not reinterpret it as a new canonical type.
3. Validate all 15 personal and seven existing team content/answer schemas server-side. Reject unknown mechanics, executable rules, invalid mappings/options/order, unreachable numeric targets and unsupported schema versions with actionable errors. Specify size/length limits and normalization.
4. Specify create/version/GET/submit response behavior: persist and return the complete exercise snapshot/reference without dropping content or leaking correct-answer payloads into unauthorized participant reads. Bind approval to the exact Template/exercise version and define catalog revision behavior without mutating existing snapshots.
5. Ensure gameplay consumers resolve and run the authored mechanics/content; merely storing arbitrary JSON is insufficient. Define checkpoint/FinishPoint completion compatibility and keep existing scoring/terminal contracts.
6. Add real persistence and permission acceptance: both starters, Legacy/Universal/Local versions, custom payload create → save → reopen → revise → submit/approval, no-edit save equality, independent copies, unauthorized access, terminal assignments and runtime resolution against the actual BE/database. FE fixtures do not close this gate.

No end-to-end completion is claimed. Frozen 169-task reconciliation and unrelated execution-plan statuses remain unchanged.

## Verification

Browser tests use the real FE components with explicitly mocked Template APIs, not live FE–BE integration.

- `npm run typecheck`: passed.
- `npm run build`: passed; existing Vite large-bundle warning remains (a CSS plugin timing warning also appeared in one local build).
- Full `npm test`: **42 Node test-file entries and 597 Vitest tests across 32 files passed**, zero failures/skips. This includes 78 exercise-library tests and updated Creator regressions for all seven independent draft slots, terminal save/reopen, blocked custom saving, supported assignment preservation, existing starters and lifecycle behavior.
- Chromium `tests/browser/exerciseLibrary.verify.mjs`: **60 Personal exercise scenarios** (all 15 types × 1440/768/390/320 px), plus four width-specific independent-custom/checkpoint/FinishPoint/Team workflows. All correct/incorrect checks, hint/solution/reset, native drag/drop and keyboard alternative, focus trap/return, Escape/close, unsaved preview, explicit saving block, unchanged fixture records and no horizontal overflow passed. Zero page errors or fixture persistence calls. [Machine-readable results](Creator_Challenge_Library_Browser_Results.json).
- Existing Chromium `tests/browser/checkpointFeatures.verify.mjs`: **4 viewport workflows passed**, preserving all seven Hunt Features, Feature 1 positioning/count resizing, terminal Personal/Team selectors, disabled terminal navigation and checkpoint-six departure. Only replaced authoring labels/region expectations were updated. Zero page errors/overflow.
- Mobile and desktop screenshots were inspected. The initial screenshot exposed a primary-button utility color conflict; the final pass verifies the corrected visible Check answer control. [Desktop](creator-challenge-preview/desktop.png) · [Mobile](creator-challenge-preview/mobile.png).
- `git diff --check`: passed. Frozen reconciliation, immutable Signal data/defaults, API services, gameplay serialization/hydration, and template persistence source remain byte-identical to the inspected main base.

Initial verification found outdated old-authoring expectations, a browser selector ambiguity from the number-line output's implicit status role, duplicate construction-piece selector ambiguity, and textarea label matching. These were corrected and rerun. Rebase-related selectors were reconciled with #135; final results above supersede those interim failures. No live backend/database/custom persistence test or deployed acceptance was performed.
