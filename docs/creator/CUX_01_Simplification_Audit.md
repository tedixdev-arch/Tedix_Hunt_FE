# CUX-01 — Creator Studio simplification audit

Analysis only, 2 November 2026. No application, API, data or test changes. **STOP for ChatGPT review; do not merge or deploy.**

## Evidence and limits

Inspected the FE checkout at `1228843ea39a6cdb3cc05806f7e8edf0eb5c57d9` (PR #143), then compared it with GitHub `main` at `10c80d5f6dbdef9d6be9aed202df970232d18f00`. The relevant setup, navigation, locality and persistence files are unchanged; inspected newer Personal Challenge authoring and formula documentation through the connector. PR base is the latter commit. No backend repository, deployed OpenAPI or live database was inspected; findings describe the FE-consumed contract, not proof that no additional backend capability exists.

Sources: `src/pages/CreatorStudio.tsx`; the Creator files and API modules listed below; existing tests; `docs/evidence/Creator_Studio_UX_Simplification.md`, `docs/evidence/Creator_Challenge_Library.md`, `docs/Admin_Template_Geographic_Preview.md`, `docs/TedixHunt_API_Integration_Guide.md`, Master Execution/Control plans, `docs/personal-challenge-latex.md`, and `docs/contextual-latex-authoring.md`. Older evidence says educational controls are disabled; current code and `huntSetup.test.tsx` show enabled controls and conditional JSON writes. Code is the current behavior authority.

## Current Creator structure

- **Dashboard `/creator`:** Create Template → Universal/Local; Local → approved Universal Library or scratch. My Templates exposes lifecycle-dependent Edit/View/Revise and protected deletion. Universal Library is also directly accessible. Legacy compatibility disclosure opens a separate scratch/starter chooser. `studio=create|local|library|mechanics` query states drive navigation; Mechanics Library remains a direct-query guidance dialog.
- **Classified builder `/create`:** Hunt Setup → Template Setup → Hunt Features → Review & Submit. Local setup selects Country then City; Universal has no geography. Curriculum/Grade appear for both. Development-only Cluj preset replaces the normal registry selector when all three environment guards match.
- **Template Setup:** Template details; Use requirements; Mission template & story; Template status. Details include difficulty; requirements include participant/team ranges, format, accessibility and equipment. Status is informational, although presented as a completion step.
- **Hunt Features:** seven entries after filtering `positions` and `final`: Number of Checkpoints (with embedded positions and FinishPoint details), Personal Challenge, Team Challenge, Next Checkpoint / Navigation, Mission History, Results Display, Rewards. Count is 1–20 normal checkpoints; UI shows 2–21 including the separate terminal FinishPoint.
- **Challenges:** modern Personal/Team editors use Predefined examples and Create Your Own, contextual Edit with Preview/guided controls, explicit assignment, then whole-Template Save draft. Personal formula editing is part of the current flow. Legacy/unresolved contexts have compatibility paths; examples are not approved database assignments. Navigation's Create new is a session-only prototype.
- **Review:** walking-route inspection for geographic Templates, manual full-journey preview, validation and exact-saved-version submission. Save draft and final feature completion can persist. Progress/safety confirmations and preview attempts are session state, not approval evidence.

## Proposed simplified structure

1. **Dashboard:** Create Template; My Templates; Universal Library. Keep Legacy compatibility collapsed and accessible.
2. **Template details:** name, description, Creator-owned content difficulty, theme/story, audience/use requirements. Local-only Location ultimately requires **Country → County / State → City**; Universal stays location-independent. Keep saved locality/history and recovery available in a disclosure.
3. **Checkpoints & challenges:** count/positions/FinishPoint, Personal Challenge, Team Challenge, onward navigation. Retain existing editors, Apply semantics, formula tools and previews.
4. **Advanced** (collapsed): Special Awards boundary/prototype, Mission History and Results Display; platform scoring as read-only explanation. Do not imply these are implemented runtime features.
5. **Review & submit:** one authoritative status/version context, preview, validation, Save draft, Submit for Admin review. Preserve approval/publication/suspension context and errors.

This is the target grouping, not a proposal to rewrite routing or persistence in one PR. Stable feature IDs must survive label/group changes; Legacy completion behavior must not depend on opening optional Advanced sections.

## Keep / Rename / Move / Hide / Remove decisions

| Control / section | Current classification | Decision and boundary |
| --- | --- | --- |
| Create Template, Universal/Local chooser, My Templates, Library | Active | **Keep**; preserve typed creation and exact-publication copy. |
| Legacy chooser / supported starter catalog | Legacy-only active path | **Keep / Hide** in existing compatibility disclosure; never delete or reclassify existing Templates. |
| Hunt Setup and Template Setup | Active, overlapping names; different tasks | **Rename / Group** as Template details with Local Location; preserve setup gating and focus. |
| Curriculum / Grade | Active, optionally persisted | **Remove UI only**; retain saved JSON, absence and unknown values. CUX-02 scope below. |
| Category and Age range | Active separate metadata | **Keep**; do not reinterpret as Curriculum/Grade or erase them. |
| Template difficulty | Active Creator editor, default `Organizer sets` | **Keep / Rename** to Content difficulty; Creator owns it. Replace new-content default only after explicit compatibility decision; preserve old values. |
| Prototype difficulty; catalog difficulty labels | Session-only / fixed examples | **Hide** prototype path under Advanced; do not confuse either with persisted editable challenge difficulty. |
| Special Awards / Rewards | Creator proposal prototype; Organizer allocation active elsewhere | **Move / Rename** to Advanced → Special Awards; explain no Creator proposal is saved. Retain Organizer/Admin responsibility text. |
| Number of Checkpoints + embedded positions | Active | **Rename / Group** as Checkpoints & locations; keep total-vs-normal semantics and FinishPoint. |
| Personal / Team Challenge, FinishPoint activities | Active | **Keep** all mechanics, contextual editors and explicit replacement/discard safeguards. |
| Next Checkpoint / Navigation | Active saved mode + prototype Create new | **Rename** to Onward navigation; **Hide** unsaved prototype behind Advanced, retain warning. |
| Mission History / Results Display | Selection indices persisted; custom-name/behavior inputs unwired | **Move** to Advanced; label limitations; do not claim selection indices implement live behavior. |
| Template status setup step | System-managed display, redundant context | **Move** into Review; retain version/publication/Local approval and suspension distinctions. |
| Platform scoring / GameplayScoring | System-defined/read-only | **Group** explanation; preserve arbitrary saved scoring and `scoring.selections`. |
| Locality saved/current details, refresh, clear/keep, proposals | Active recovery/registry workflow | **Hide** details in a disclosure; **Keep** every recovery action and explicit registry refresh. |
| Route inspection, preview, validation, submit | Distinct active actions | **Keep** separate; none certifies field safety or grants approval. |

### Duplicate terminology and action semantics

- Short description and Hunt mission both edit **`details.summary` → `configuration.summary`**: consolidate to one Description control. `mission` story fields and `configuration.briefing` are distinct persisted fields; do not merge them by label alone.
- Hunt Features / Template Builder / Hunt builder describe the same editing workspace; use **Template builder** consistently. Final Checkpoint and FinishPoint refer to the terminal stop; use **FinishPoint**, retaining stored `role: terminal` and IDs.
- Personal **Apply to Hunt**, Team **Apply Team Challenge**, and compatibility **Use this custom exercise** all select an assignment in working content; use **Apply challenge** with existing confirmation rules. They are not Save draft.
- **Save & continue** in setup only advances session progress; intermediate feature buttons also advance, while **Complete Hunt Features** persists. Rename non-saving actions **Continue**; use truthful save wording for persistence. Do not collapse all callbacks into a single action.
- **Start from Template** in the Legacy chooser uses starter endpoints; **Start from an approved Universal** copies a pinned publication. Preserve separate semantics and label the former **Start from starter Template**.
- Exercise play/preview and **Preview full journey** are different simulations; distinguish **Try challenge** from **Preview journey**.

## API and persistence compatibility

### Explicit County / State contract finding

**No structured County / State contract exists in the inspected FE model/API.** `src/services/api/geography.ts` exposes Country `{code, displayName}` and Locality/Snapshot `{id, countryCode, countryDisplayName, name, administrativeContext, latitude, longitude}` (plus `active` for current records). `administrativeContext` can display a county/state name, e.g. Cluj, but is free text: there is no administrative-area identity, country-scoped area list, or area-filtered city search. Search sends only `countryCode` and `q`; get uses locality ID. Locality proposals also accept only free-text `administrativeContext`.

Therefore Country → County / State → City is **not safely implementable by relabeling City or splitting that string**, nor by grouping one paginated/partial name-search result into a fabricated county catalog. Confirm backend/OpenAPI support first; otherwise add an additive contract for country-scoped area identities/listing and area-filtered localities, including countries without this tier. FE selector, proposal and Admin review projections must agree. Preserve old snapshots and locality IDs; do not backfill or require an area on historical records. The Cluj development preset currently has no county control and must eventually obey the agreed hierarchy too.

### Local binding and approved versions

`CreatorTemplatesApi.create/createVersion` sends `localityId` as a sibling of `content`; it never manufactures a snapshot. **Omitted** locality means preserve the saved binding/snapshot, **null** means explicitly clear, and an explicit UUID requests server capture (including refreshing the same locality). Saved versions retain `localitySnapshot`; current registry corrections do not rewrite them. There is no separate locality-version number in this FE contract: it is a snapshot attached to a Template version.

Approval belongs to a specific Template version, not whatever registry row/latest candidate is visible. Owner projections distinguish `localApprovedVersion`, `localApproval.version/authority/independentEvidence/localityBound`, and `localSuspension`; latest content is not approval authority. Preserve this metadata and exact-version submission, including historical/integrity-restricted states. Local preflight checks current active identity and matching country/coordinates; registry drift requires explicit refresh/new save, not silent rebinding. Approved Universal-to-Local copy sends `publishedReference: {templateId, version}`; preserve source provenance and independent destination ownership/Local review. Never infer classification from keys or convert null/omitted categories silently.

### Curriculum / Grade

`CreatorStudio.tsx` hydrates `configuration.curriculum/grade`; `learningEdited` conditionally spreads both into outgoing configuration. Untouched new drafts omit them. Existing configuration is retained through hydration/serialization, so values can survive a save even when untouched. This proves FE JSON persistence intent and mocked round trips; it does not establish an approved backend educational taxonomy. Remove controls/learning state and conditional writes, **not** fields from existing `templateConfiguration` or whole-content passthrough. Preserve absent vs existing values, including unexpected legacy values, on save/revision/copy. No migration or backend change is needed for UI removal.

### Difficulty and awards

Template difficulty is authored in Template details and saved as free-form `configuration.difficulty`; current initial value is `Organizer sets`, options Easy/Medium/Advanced/Organizer sets. Prototype editor difficulty is local React state. Catalog levels are fixed labels; custom exercise schema/adapter has no editable difficulty field. Creator ownership of Template content metadata can use the existing envelope; per-challenge difficulty would require a separate closed-schema FE/BE contract change. Organizer Hunt difficulty is a different runtime setting (`src/services/api/hunts.ts`, pilot `easy | null`): removing/changing it requires separate Organizer/backend analysis, not a Creator cleanup.

`RewardBoundary` has uncontrolled proposal inputs and no submit handler or Template serialization. Actual Special Award definitions come from `/api/reward-options`; Organizer allocations use `/api/hunts/:id/rewards/special` with `definitionKey`. Definitions are system-provided; allocations are Organizer-owned; Creator proposal ownership is aspirational UI only. Admin inventory/approval is explanatory here. Moving this UI to Advanced needs no API change; implementing Creator award proposals would need a supported contract. Calculation/eligibility enforcement remains deferred in project plans.

Other safeguards: retain unknown content/configuration/scoring, immutable revisions, submission locks, uncertain-save recovery, custom exercise schema/version-owned IDs, unsupported saved gameplay, and server approval history. Collapsing or unmounting editors can lose session drafts; grouping must preserve state and focus. Do not alter shared `organizerFeatures` globally just to simplify Creator navigation.

## Exact affected files and merge boundaries

**CUX-01 actual change:** only `docs/creator/CUX_01_Simplification_Audit.md`.

**CUX-02 smallest independently mergeable scope:** remove Curriculum/Grade controls and their now-unused props/state/conditional writes only. Production files: `src/features/creator/HuntSetup.tsx`, `src/pages/CreatorStudio.tsx`. Future test adjustments: `tests/huntSetup.test.tsx` (replace control-selection assertions with absence and preservation assertions); retain/extend the omission checks in `tests/browser/huntSetup.verify.mjs`. Add save/reopen/revision coverage for pre-existing educational values in that focused suite. No other navigation, difficulty defaults, awards, locality contract, API, schema, data or migration changes. Acceptance: both classified types lack these controls; unknown/saved configuration survives; fresh content does not acquire learning defaults; existing Local/Universal/Legacy behavior is unchanged. This audit changes none of those tests.

**Later presentation-only slices:** `src/pages/CreatorStudio.tsx` (summary deduplication, grouping, action/status labels, Advanced); `src/features/creator/CreatorStudioNavigation.tsx`, `src/features/creator/TemplateCreationChooser.tsx` (creation terminology); `src/features/creator/exercises/PersonalChallengeAuthoring.tsx`, `src/features/creator/exercises/TeamChallengeAuthoring.tsx`, `src/features/creator/exercises/ChallengeAuthoring.tsx` (assignment terminology). Preserve `ParticipantPreview.tsx` and exercise/formula functionality; only change preview wording there if needed. Update their relevant tests separately.

**Contract-dependent geography slice:** `src/services/api/geography.ts`, `src/services/api/localityProposals.ts`, `src/services/api/adminLocalityProposals.ts`, `src/features/creator/LocalGeographySelector.tsx`, `src/features/creator/DevelopmentLocationSelector.tsx`, `src/features/creator/developmentLocation.ts`, `src/features/creator/LocalityProposals.tsx`, `src/features/admin/LocalityProposalReview.tsx`, `src/features/creator/HuntSetup.tsx`, `src/pages/CreatorStudio.tsx`; assess `src/features/creator/localValidation.ts` after contract approval. Backend file scope cannot be determined from this FE audit.

**Compatibility boundaries to retain:** `src/services/api/creatorTemplates.ts`, `src/features/creator/templatePersistence.ts`, `src/features/creator/templateLifecycle.ts`, `src/features/creator/TemplateReadContext.tsx`, `src/features/creator/exercises/templateExercises.ts`, `src/features/creator/exercises/persistenceAdapter.ts`, `src/features/creator/exercises/persistenceTypes.ts`, `src/features/creator/exercises/persistenceSchema.ts`. No changes required by CUX-02.

## Regression test checklist

- [ ] `tests/huntSetup.test.tsx`, `tests/browser/huntSetup.verify.mjs`: controls absent; fresh omission; saved learning/unknown values preserved through unrelated edits, reopen and new revisions; Local continuation/city-change confirmation, unavailable-registry recovery, development preset; Universal has no location requests.
- [ ] `tests/localityRegistry.test.ts`, `tests/localGeography.test.tsx`, `tests/localityProposals.test.ts`, `tests/localityProposals.test.tsx`, `tests/localTemplates.test.ts`: exact endpoints/envelopes, stale/wrong-country/inactive results, omit/null/UUID semantics, explicit snapshot refresh; historical snapshots never auto-rewritten.
- [ ] `tests/localCreation.test.tsx`, `tests/localPersistence.test.tsx`, `tests/localSubmission.test.tsx`, `tests/localSubmissionPreflight.test.tsx`, `tests/localValidation.test.ts`, `tests/templateRevisions.test.tsx`, `tests/creatorTemplateContext.test.tsx`: version locks, approval/history/suspension integrity, drift and conflicts, exact saved-version submit.
- [ ] `tests/universalCreation.test.tsx`, `tests/universalPersistence.test.tsx`, `tests/universalSubmission.test.tsx`, `tests/universalLibrary.test.ts`, `tests/universalLibrary.test.tsx`, `tests/localCopy.test.tsx`: location independence, pinned publication, source unchanged, destination-owned exercises and Local approval separation.
- [ ] `tests/creatorTemplates.test.ts`, `tests/creatorStudioNavigation.test.tsx`, `tests/starterCatalog.test.ts`, `tests/creatorTemplateDeletion.test.tsx`, `tests/signalClujDraft.test.tsx`, `tests/signalOverload.test.ts`: Legacy/starter access, lifecycle actions, protected deletion and preserved Signal content.
- [ ] `tests/customExercisePersistence.test.tsx`, `tests/personalCreationContext.test.tsx`, `tests/personalChallengeBuilder.test.tsx`, `tests/personalVisualEditors.test.tsx`, `tests/teamChallengeBuilder.test.tsx`, `tests/formulaEditor.test.tsx`, `tests/mathText.test.tsx`: assignment vs browsing, retained session variants, all mechanics, Apply/Save distinction, identity/schema and formula-string preservation.
- [ ] `tests/creatorFinishPoint.test.tsx`, `tests/checkpointGameplay.test.ts`, `tests/participantPreview.test.ts`, `tests/participantPreview.test.tsx`, `tests/organizerSnapshotContract.test.ts`, `tests/rewards.test.ts`: FinishPoint/count, manual preview isolation, immutable Hunt snapshots and Organizer reward boundary.
- [ ] For future UI slices: keyboard/focus return, collapsed-section recovery, 320/390px overflow, truthful Continue/Save labels and no unintended mutation when navigating. Run focused suites, then repository `npm test`, typecheck/build as appropriate. Do not weaken compatibility assertions to accommodate grouping.

## Blockers and unresolved decisions

- County/State selector is blocked on confirmed structured area/list/filter contracts and semantics for countries without that tier; free-text administrative context is insufficient. Existing drafts must remain openable without retroactive hierarchy requirements.
- Creator owns content difficulty (approved); choose a new default and handling of saved `Organizer sets`/unknown strings without rewriting existing versions. Per-challenge levels and Organizer runtime changes are outside CUX-02.
- Special Awards belong in Advanced (approved); decide whether the unsaved proposal form should remain explicitly marked prototype or become explanatory guidance. Do not invent a Creator submission endpoint.
- Advanced must not remain a mandatory completion gate. Existing Legacy progress counts and persisted completion metadata need a separate compatibility design before removing/reordering steps.
- These do not block educational-control removal. CUX-02 must not claim to complete the full simplification or the required geography hierarchy.

Audit validation: source/test/document review and remote base comparison only; no runtime suite or authenticated save/approval was run for this documentation-only change. Existing tests were inspected, not edited. No Template data was read or mutated, and no backend operation, merge or deployment was performed.
