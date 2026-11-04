# C1.5 — Content creation

Based on main `5e37d0e` (merged PR #167). Content uses a compact Content type dropdown, followed by Category, collapsed Classification & Location, the existing mechanic selector and shared authoring editor, and one primary Add Exercise action. Existing category values include Mathematics, History, Science, Mixed, Language and Tourism; the default is explicitly unclassified. Mathematics shows all four curriculum levels disabled because no selectable curriculum catalog is available. Geography uses the existing hierarchical catalog component and defaults to Universal.

PersonalChallengeAuthoring and TeamChallengeAuthoring are reused directly by Content and Template. Only the standalone selector label changes to Exercise type; Template behavior is unchanged. No alternate editor, renderer, schema, LaTeX support or validation implementation was introduced. Starter sources are independently copied as before. No Content or Template persistence contract changed.

Add Exercise calls the existing exercise validator and checks applicable category and geography hierarchy. A successful result retains a snapshot of the exercise and metadata in session state and explicitly says **Exercise prepared for this session. Not saved to Library.** Editing invalidates that feedback. Unclassified and Universal drafts are permitted. Metadata changes participate in existing unsaved-draft protection. Personal and Team drafts remain independent across workflow and type switches; Discard resets the selected draft and metadata.

## Verification

- `npm run typecheck`: passed.
- `npm test -- --maxWorkers=2`: passed, 43 Node files and 959 Vitest tests across 51 files.
- `npm run build`: passed, including PWA precaching. Existing large-chunk warning remains.
- `node tests/browser/contentCreation.verify.mjs`: passed at 1440px, 390px and 320px; no horizontal overflow or browser errors. Covers metadata hierarchy, default Preview, shared LaTeX draft, independent type drafts, navigation cancellation, invalid and valid preparation, unsupported standalone Navigation Hint, collapsed Starter and direct Template Create Your Own comparison.
- Regression tests cover metadata-only navigation protection, validation failure, session-only preparation, stale feedback invalidation, optional unclassified drafts, visible disabled curriculum and retained independent drafts. Existing tests continue checking source immutability and unchanged assignment/persistence behavior.

[Check logs](evidence/c1-5/checks/) · [Browser results](evidence/c1-5/after/results.json)

## Actual screenshots

These are Chromium captures of production components mounted in the existing Content browser fixture, with explicitly mocked geography responses. They are component-workflow verification, not an authenticated live backend end-to-end run. The fixture page scrolls normally so full-page captures include the complete editor. Before captures use the main Content workflow; after captures use this change. The fixture's existing Template route supplies the direct shared-editor comparison.

| State | 1440px | 390px | 320px |
|---|---|---|---|
| Before default | [View](evidence/c1-5/before/default-1440.png) | [View](evidence/c1-5/before/default-390.png) | [View](evidence/c1-5/before/default-320.png) |
| After default | [View](evidence/c1-5/after/default-1440.png) | [View](evidence/c1-5/after/default-390.png) | [View](evidence/c1-5/after/default-320.png) |
| Mathematics expanded | [View](evidence/c1-5/after/mathematics-1440.png) | [View](evidence/c1-5/after/mathematics-390.png) | [View](evidence/c1-5/after/mathematics-320.png) |
| Content Preview | [View](evidence/c1-5/after/preview-1440.png) | [View](evidence/c1-5/after/preview-390.png) | [View](evidence/c1-5/after/preview-320.png) |
| Content LaTeX | [View](evidence/c1-5/after/latex-1440.png) | [View](evidence/c1-5/after/latex-390.png) | [View](evidence/c1-5/after/latex-320.png) |
| Team authoring | [View](evidence/c1-5/after/team-1440.png) | [View](evidence/c1-5/after/team-390.png) | [View](evidence/c1-5/after/team-320.png) |
| Library collapsed Starter | [View](evidence/c1-5/after/library-1440.png) | [View](evidence/c1-5/after/library-390.png) | [View](evidence/c1-5/after/library-320.png) |
| Invalid exercise | [View](evidence/c1-5/after/validation-1440.png) | [View](evidence/c1-5/after/validation-390.png) | [View](evidence/c1-5/after/validation-320.png) |
| Prepared session draft | [View](evidence/c1-5/after/prepared-1440.png) | [View](evidence/c1-5/after/prepared-390.png) | [View](evidence/c1-5/after/prepared-320.png) |
| Template Preview | [View](evidence/c1-5/after/template-preview-1440.png) | [View](evidence/c1-5/after/template-preview-390.png) | [View](evidence/c1-5/after/template-preview-320.png) |
| Template LaTeX | [View](evidence/c1-5/after/template-latex-1440.png) | [View](evidence/c1-5/after/template-latex-390.png) | [View](evidence/c1-5/after/template-latex-320.png) |

Visual review at 320px confirms wrapping controls, the same mobile exercise canvas and contextual pencils as Template, and the primary CTA below the editor. Mechanics retain their existing visuals; detailed correction remains C1.4.

## Remaining C2 dependencies

- Backend reusable-content creation, stable exercise/revision identifiers, immutable revisions and approval lifecycle.
- Persistence of category, curriculum associations and geographic applicability with backend validation.
- Canonical curriculum catalog records; disabled controls must receive real values before selection becomes available.
- Future variant/revision relationships and approved library feed; no fake library records or backend writes are introduced here.

Git transport was unavailable because the configured proxy could not connect. The GitHub connector supplied the main comparison; all changed text sources were synchronized for local validation. The PR commit is built directly on the actual main commit/tree, so synchronization changes and existing evidence are excluded from the PR diff.

STOP for ChatGPT PR review. Do not merge or deploy.
