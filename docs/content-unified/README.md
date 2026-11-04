# C1.1 Content and Template UX

Content retains Personal Challenges, Team Challenges and Navigation Hints, with protected Starter previews and session-only exercise creation. My Content and Approved Content actions are omitted until real backend records exist. No library create/update/delete/approval calls or success claims are added.

## Reuse and ownership

- `ContentSelection` shares Category, search and geographic applicability conventions between Content and modern Personal → Predefined. The existing mechanic selector remains the example-selection entry point; filtering never assigns an example.
- `classification.ts` owns the existing Template Setup values: Mathematics, History, Science, Mixed. `All` is only a filter operation. Existing `Mixed` is preserved as an existing Template value; no new category identifiers are created. Language and Tourism have extension points but are not fabricated selectable Template values.
- `PersonalChallengeAuthoring` and `TeamChallengeAuthoring` gain an opt-in standalone boundary. They retain their existing mechanic selectors, per-type drafts, validation and editors. Standalone suppresses checkpoint assignment, save guidance, and persisted-assignment controls. Existing Template behavior defaults remain unchanged.
- `PersonalMechanicEditor`, `PersonalChallengeCanvas`, `TeamMechanicEditor`, `TeamChallengeCanvas`, `FormulaScope` and the existing `ExerciseRenderer` engine are reused. Personal editing retains Edit with Preview, contextual pencils and Complex / LaTeX. Team retains its existing Edit with Preview and Step by Step mechanics; no new Team LaTeX capability is claimed.
- `independentExercise` and `authorPrototype` create independent session drafts. Protected Starter objects are never passed as editable state. Preview uses the existing `ExercisePreview` / `ExerciseRenderer` engine.
- Library drafts have no save button. Close/replacement prompts, router navigation blocking and beforeunload guard make discard explicit. Classification/filter state is session-only and does not alter Template locality.

## Data limitations

Starter examples have no category, curriculum or geographic associations. All/Universal can browse them; constrained filters exclude unknown metadata. Mathematics has ordered Grade → Main → Unit → Lesson extension points, but no available official records or IDs, so disabled/fabricated curriculum selectors are omitted. Other categories display no irrelevant filters. No curriculum API is invented.

`ContentGeography` reuses geography API models and existing read endpoints, with Country → Region → City selection and Universal defaults. Changing parents clears children; requests ignore stale responses. It intentionally does not reuse the locality-binding selector, whose resolve/registration and Template-save semantics do not represent applicability. Country and region catalogs paginate; city search shows the first returned page, narrowed by search. There are no resolve, registration, proposal or locality-binding writes.

## C2 requirements

Implement creator-owned library drafts and server-owned approval transitions, real classification/curriculum associations, applicability metadata, pagination, immutable approved revision IDs and authorization. A Template selection must identify the exact approved revision, fetch it, and deep-copy exercise content into a Template-owned schema/identity. Further Template edits must never update the source revision. Repository source locators are not approved revisions and cannot be assigned to published Hunts. Existing example simulation and publication guards remain intact.

No backend/schema, scoring, gameplay validation, permissions, legacy Hunt, Mapbox persistence, or Template version/save behavior changes.

## Verification

- Full FE `npm run typecheck`, `npm test`, `npm run build`.
- `node tests/browser/contentUnified.verify.mjs` against local Vite: 1440, 390, 320px. Browser fixtures are explicitly isolated under `tests/browser`; they are not production geography fallback data.
- Screenshots: Content, standalone Personal and standalone Team at every requested width in `screenshots/`.
- Browser assertions cover Universal defaults, parent resets, city selection, Category filter reset, unavailable taxonomy, Starter preview, default Edit with Preview, Complex / LaTeX, no assignment/save controls, navigation cancellation and no horizontal overflow.
- Unit regression coverage includes canonical mechanics, source immutability, geographic matching, standalone draft discard, and existing Template Personal/Team authoring suites.

Stop for ChatGPT review. Do not merge or deploy.
