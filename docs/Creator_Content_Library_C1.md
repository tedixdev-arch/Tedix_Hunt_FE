# Creator Content Library — C1

Creator Studio now exposes Content at `/creator?studio=content`, under the existing Creator access guard. Template creation, My Templates, Universal Library and Legacy retain their routes and persistence behavior.

## Available Starter content

The read-only adapter imports the 15 canonical `personalExamples` and 7 `teamExamples`; it does not duplicate exercise payloads or add mechanics. Navigation Hints has no standalone Starter records. Template navigation modes and checkpoint-bound clues are not independent reusable hint records and are deliberately not repackaged.

No integrated curriculum catalog or official Unit/Lesson IDs exist in this FE. Every Starter has an empty curriculum association list. Domain (Math), Grade (5–12), and Main (Algebra/Geometry) selectors exclude unassociated records when constrained. Mix means no constraint and is never stored as a curriculum entity. Unit/Lesson selectors are disabled with an explanation until real data is integrated. Search matches title or mechanic ID. Reset restores the full category.

## Reusable boundaries

- `content/catalog.ts`: typed library envelope, source adapter, pure filter predicate. Identity, category, mechanic, associations, collection, provenance, approval and revision are distinct from the exercise payload. Repository revision IDs are source locators, not immutable backend revisions or approval authority.
- `ContentLibrary`: read-only browser accepting records as props; only selection, filters and temporary preview state live in React memory.
- `ExercisePreview` → `ExerciseRenderer` → existing authored renderer: same interaction and validation engine as authoring, including feedback, hints and math rendering. Preview state disappears on close.
- Existing `PersonalChallengeAuthoring`, `PersonalMechanicEditor`, `TeamChallengeAuthoring`, `FormulaEditor` and `FormulaScope` remain unchanged. Edit with Preview stays the authoring default; Complex LaTeX retains its current implementation. Content introduces no parallel authoring UI.
- `independentExercise`, `toPersistence`/`fromPersistence`, and the existing immutable Template-owned custom-exercise model are the future copy boundary. C1 does not call them to assign, modify or save Content.

## Missing capabilities and recommended C2 contracts

Backend capabilities still needed: library storage and ownership, immutable revisions, approval/rejection authority and audit, curriculum catalog/association validation, collection management, access controls, approved-revision lookup and pagination. No speculative endpoint, migration, shared localStorage store or fake write operation is added.

Agree C2 schemas before integration: stable content ID plus immutable revision ID; category-specific discriminated payload using the current supported mechanic vocabulary and authored schema version; collection/package ID; source/provenance and optional source revision; approval status bound to an exact revision; canonical curriculum entity IDs with valid parent relationships. Mix belongs only in query scope. Navigation Hints needs an agreed standalone payload before it gains records.

A later explicit selection operation should resolve an approved exact revision, copy its payload into a new independently identified Template/Hunt-owned custom exercise, retain provenance separately, and persist through the existing immutable custom-exercise contract. Editing that copy must never change the shared source or other Templates. Authorization, approved-revision verification, concurrency and stale/revoked approvals require backend enforcement. This assignment path is intentionally absent from C1.

## Verification

Run `npm run typecheck`, `npm test`, `npm run build`. Focused coverage extends `creatorStudioNavigation.test.tsx` for Content navigation/deep-link authorization, category switching, shared previews, curriculum empty results, search, reset and unchanged creation links/no mutations. Existing Creator route, authoring, LaTeX and persistence tests provide regression coverage.

Browser evidence: `node tests/browser/contentLibrary.verify.mjs` uses the existing isolated Creator Studio fixture (no real account/backend), checks all 22 previews at 1440/390/320px, filters, missing hint records, original Template creation links, horizontal overflow, runtime errors and mutation requests. Screenshots and machine-readable results are in `docs/evidence/content-library-c1/`. No production gameplay, backend persistence or live account verification is claimed.

### Recorded implementation results

- `npm run typecheck`: passed.
- `npm test -- --maxWorkers=2`: passed, 271 Node tests and 925 Vitest tests across 45 files. Bounded workers were used after default worker startup stalled in this environment. Existing jsdom `scrollTo` notices were non-failing.
- `npm run build`: passed (existing large-chunk advisory remains).
- Browser run: passed, 22 previews per viewport at 1440/390/320px, no horizontal overflow, runtime errors or mutation requests. Desktop/mobile screenshots were visually inspected. This uses fixtures rather than production accounts.
- `git diff --check`: passed.

Review remains a Draft PR checkpoint. No merge or deployment was performed.
