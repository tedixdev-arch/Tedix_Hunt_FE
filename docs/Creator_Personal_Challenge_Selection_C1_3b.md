# C1.3b Personal Challenge selection

Branched from main `91d321835b4e794500a9ad5f67d6360470fb6615`, including merged #165. This is a new PR; #165 is unchanged.

Predefined keeps all 15 canonical mechanics and offers Random matching exercise (default) / Choose specific exercise. One independent, collapsed Refine exercise pool section contains the protected Starter preset, existing academic categories, geographic applicability and category-specific curriculum controls. Template Category and Location flow from the current Creator setup, including unsaved location changes. Universal overrides the inherited location. An inherited locality is resolved against real geography records by locality ID; unresolved metadata fails closed for approved previews without asking for location reentry.

Mathematics always shows Grade → Main → Unit → Lesson. Missing levels are disabled, with no invented options. The existing model has no distinct Master level. Parent/category changes clear dependent choices.

Random offers an optional eligible approved-exercise simulation, or a labeled Starter demonstration that may not match the pool. It never allocates an exercise. Specific offers search, an approved-record selector and selected-exercise preview; the current disconnected feed produces an honest empty state. Only approved backend revisions outside the Starter collection are eligible. No random selection, assignment callbacks, persisted allocation settings, backend/database changes or new publication capability were added. Saved challenge inspection is collapsed for modern Predefined; Legacy and Custom editing retain their existing paths, mechanics, validation and publication guards.

## Verification

- Typecheck passes.
- Full suite: 271 Node tests and 955 component tests (51 files) pass; component workers bounded to two for this environment.
- Component regressions cover disabled hierarchy, cascading resets, eligibility, selected previews, Template defaults, Universal, unresolved geography and assignment/scoring preservation.
- `node tests/browser/challengeAllocation.verify.mjs` passes at 1440, 390 and 320 px, checks all 15 mechanics, Custom editor entry, no overflow, no browser errors and unchanged saved assignments.
- Screenshots under `docs/evidence/c1-3b/` show default random, Mathematics expanded, specific selection/empty state and Starter demonstration. The selected-approved-record screenshots explicitly use an injected test record, not live backend data. The default production source remains Starter-only with no approved feed.
- Visual review: stacked touch targets at mobile widths, bounded desktop column, one refinement toggle, disabled controls remain visible, optional playable preview, no Starter grid. The saved challenge is collapsed to avoid an oversized initial screen.
- `npm run build` reaches bundle generation but fails PWA precaching: application JS is about 3.17 MB, exceeding the existing 3 MiB limit. Unchanged main reproduces the failure (3.16 MB). No PWA/deployment settings were changed in this UX PR.

Browser fixtures use real production components with isolated read-only catalog fixtures; no live API mutations. Reproduction: `npm run dev -- --host 127.0.0.1`, then run the browser script. Screenshots regenerate into `work/selection-browser/`.

Draft only. STOP for ChatGPT review. Do not merge or deploy.
