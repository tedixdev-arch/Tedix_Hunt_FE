# C1.1 Content and Template UX

Content retains Personal Challenges, Team Challenges and Navigation Hints, with protected Starter previews and session-only exercise creation. My Content and Approved Content actions are omitted until real backend records exist. No library create/update/delete/approval calls or success claims are added.

## Reuse and ownership

- `ContentPicker` is the same individual-exercise browser in Content and modern Personal → Predefined: searchable cards, Category/geographic metadata and playable preview. Template cards select a cloned exercise for local simulation through “Try example”; no selection assigns an approved library revision. The original mechanic shortcut remains available for compatibility. `ContentSelection` provides the shared filtering controls.
- `classification.ts` owns the existing Template Setup values: Mathematics, History, Science, Mixed. `All` is only a filter operation. Existing `Mixed` is preserved as an existing Template value; no new category identifiers are created. Language and Tourism have extension points but are not fabricated selectable Template values.
- `PersonalChallengeAuthoring` and `TeamChallengeAuthoring` gain an opt-in standalone boundary. They retain their existing mechanic selectors, per-type drafts, validation and editors. Standalone suppresses checkpoint assignment, save guidance, and persisted-assignment controls. Existing Template behavior defaults remain unchanged.
- `PersonalMechanicEditor`, `PersonalChallengeCanvas`, `TeamMechanicEditor`, `TeamChallengeCanvas`, `FormulaScope` and the existing `ExerciseRenderer` engine are reused. Personal editing retains Edit with Preview, contextual pencils and Complex / LaTeX. Team retains its existing Edit with Preview and Step by Step mechanics; no new Team LaTeX capability is claimed.
- `independentExercise` and `authorPrototype` create independent session drafts. Protected Starter objects are never passed as editable state. Preview uses the existing `ExercisePreview` / `ExerciseRenderer` engine.
- Library drafts have no save button. Section changes, close/replacement prompts, router navigation blocking and beforeunload guard make discard explicit. Classification/filter state is session-only and does not alter Template locality.

## Data limitations

Starter examples have no category, curriculum or geographic associations. All/Universal can browse them; constrained filters exclude unknown metadata. Mathematics keeps Grade → Main → Unit → Lesson visible. Options are derived only from supplied curriculum associations, with each child dependent on its selected parents. Parent changes reset descendants. The current Starter set has no curriculum catalog, so levels show Unavailable with one concise explanation; no selectable official records or IDs are fabricated. Other categories display no irrelevant filters. No curriculum API is invented.

`ContentGeography` reuses geography API models and existing read endpoints, with Country → Region → City selection and Universal defaults. Changing parents clears children; requests ignore stale responses. It intentionally does not reuse the locality-binding selector, whose resolve/registration and Template-save semantics do not represent applicability. Country and region catalogs paginate; city search shows the first returned page, narrowed by search. There are no resolve, registration, proposal or locality-binding writes.

## C2 requirements

Implement creator-owned library drafts and server-owned approval transitions, real classification/curriculum associations, applicability metadata, pagination, immutable approved revision IDs and authorization. A Template selection must identify the exact approved revision, fetch it, and deep-copy exercise content into a Template-owned schema/identity. Further Template edits must never update the source revision. Repository source locators are not approved revisions and cannot be assigned to published Hunts. Existing example simulation and publication guards remain intact.

No backend/schema, scoring, gameplay validation, permissions, legacy Hunt, Mapbox persistence, or Template version/save behavior changes.

## Verification (PR #163 follow-up)

- Full FE `npm run typecheck`, `npm test`, `npm run build`.
- `node tests/browser/contentUnified.verify.mjs` against local Vite: 1440, 390, 320px. Browser fixtures are explicitly isolated under `tests/browser`; they are not production geography fallback data.
- Screenshots: Content, Mathematics hierarchy, Template individual-exercise picker, standalone Personal and standalone Team at every requested width in `screenshots/`.
- Browser assertions cover Universal defaults, parent resets, city selection, Category filter reset, unavailable taxonomy, Starter preview, default Edit with Preview, Complex / LaTeX, no assignment/save controls, navigation cancellation and no horizontal overflow.
- Focused `contentPicker.test.tsx` coverage: individual records with the same mechanic, instruction search, playable preview, Template record selection/publication guard, independent drafts, mode preservation, cancel/confirm section switching, same-section draft replacement, actual-data hierarchy/reset and absent-catalog behavior. Existing canonical mechanics, source immutability, geography and Template Personal/Team suites also pass.

Stop for ChatGPT review. Do not merge or deploy.

## Selected-exercise copying follow-up

An explicit picker selection (or mechanic example selection) records session-only copy intent. Create Your Own copies that exact exercise with a new identity instead of reusing an older draft by mechanic. Replacing a same-mechanic custom draft requires confirmation; Cancel retains all state, and Resume previous draft returns to the older work without replacing it. Merely switching tabs after copying resumes the current draft. The selected applied checkpoint exercise remains separate until Apply challenge is explicitly used.

Regression coverage uses two distinct library records with the same canonical mechanic, an edited and assigned first draft, canceled replacement, explicit resume, confirmed independent copying, unchanged applied persistence, source immutability and subsequent tab switching.
