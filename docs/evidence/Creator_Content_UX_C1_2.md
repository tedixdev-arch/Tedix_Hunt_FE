# C1.2 Content UX simplification

Verified 2026-11-04 against the local FE with API fixtures. No deployment or merge.

- Templates and Content are separate primary sections with green selected buttons. Templates retains creation, owned records, Universal Library and Legacy compatibility.
- Content exposes one workflow at a time: Create Content or Library; Personal, Team and Navigation selections remain below them.
- Existing Personal (15 mechanics) and Team editors, preview, hints, solutions, validation and supported LaTeX paths are reused. Standalone edits are explicitly unsaved session drafts. Applying a standalone challenge updates the session only.
- Drafts survive primary section, workflow and category switches. Router departure (including history) requires confirmation; document unload uses the native unsaved-changes prompt. Explicit discard retains its existing confirmation.
- Library presents Country → County/Region → City, initially Universal, before content filtering. Location choices derive only from supplied approved records. No new geography records or endpoints.
- Canonical Starter examples are collapsed initially and remain separate from approved Available Exercises. Starters are never promoted to approved records. Individual playable previews use the existing preview dialog.
- Shared Category/search/curriculum controls and association matching are used by Library and modern Template Personal Predefined. Mathematics options derive from actual associations; Grade → Main → Unit → Lesson are dependent, compact advanced filters.
- No approved exercise feed or curriculum associations are present in the current canonical dataset. The default available collection is therefore empty, with no fabricated classification or location options. Navigation Hints has no safe standalone contract and directs authors to Templates.
- Template persistence/versioning, Legacy, custom exercise payloads and published Hunt assignment behavior are unchanged.

## Validation

- `npm run typecheck`: passed.
- `npm test -- --maxWorkers=4`: 271 Node tests and 927 Vitest tests passed (45 Vitest files). Worker count limits local resource usage; no tests excluded.
- `npm run build`: passed; existing large-bundle advisory remains.
- Chromium screenshots inspected at 1440×960, 390×960 and 320×960 for both workflows, including scrolled Library/editor content. No horizontal page overflow; selected navigation, collapsed Starter, available empty state, wrapped mobile controls and editor actions checked.
- Browser fixture checks confirmed correct Team/Personal editor selection and retained custom drafts after category and Templates/Content switches.
- Regression tests cover rejected route departure, collapsed collections, no mutations, preview, real-record location/curriculum filtering and dependent options. Browser/API checks use fixtures and do not claim real FE–BE integration.

Draft PR is intended for ChatGPT review. Do not merge or deploy.
