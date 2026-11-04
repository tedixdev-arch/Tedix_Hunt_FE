# C1.3b Personal Challenge selection

Branched from main `91d321835b4e794500a9ad5f67d6360470fb6615`, including merged #165. This is a new PR; #165 is unchanged.

Predefined keeps all 15 canonical mechanics and offers Random matching exercise (default) / Choose specific exercise. One independent, collapsed Refine exercise pool section contains the protected Starter preset, existing academic categories, geographic applicability and category-specific curriculum controls. Template Category and Location flow from the current Creator setup, including unsaved location changes. Universal overrides the inherited location. Hunt Setup retains its already-resolved geographic city record as session-only context. The pool reuses its geographicId/admin1Code only when the locality ID and country match the Template snapshot. ChallengeAllocation makes no name-based search or registry lookup. Saved snapshots contain only locality IDs; the current API supplies no locality-to-geographic-city conversion. When that context is absent or mismatched, the UI explains the limitation and fails closed for approved previews while retaining Universal and the labeled Starter demonstration. No geographic identifiers are invented or added to persistence.

Mathematics always shows Grade → Main → Unit → Lesson. Missing levels are disabled, with no invented options. The existing model has no distinct Master level. Parent/category changes clear dependent choices.

Random offers an optional eligible approved-exercise simulation, or a labeled Starter demonstration that may not match the pool. It never allocates an exercise. Specific offers search, an approved-record selector and selected-exercise preview; the current disconnected feed produces an honest empty state. Only approved backend revisions outside the Starter collection are eligible. No random selection, assignment callbacks, persisted allocation settings, backend/database changes or new publication capability were added. Saved challenge inspection is collapsed for modern Predefined; Legacy and Custom editing retain their existing paths, mechanics, validation and publication guards.

## Verification

- Typecheck passes.
- Full suite: 271 Node tests and 956 component tests (51 files) pass; component workers bounded to two for this environment.
- Component regressions cover disabled hierarchy, cascading resets, eligibility, selected previews, Template defaults, Universal, missing/mismatched geographic mappings, failed upstream catalog lookup and assignment/scoring preservation. Setup tests also verify only one initial city lookup and no geographicId added to saved payloads.
- `node tests/browser/challengeAllocation.verify.mjs` passes at 1440, 390 and 320 px, checks all 15 mechanics, Custom editor entry, no overflow, no browser errors and unchanged saved assignments.
- Screenshots under `docs/evidence/c1-3b/` show default random, Mathematics expanded, specific selection/empty state and Starter demonstration. The selected-approved-record screenshots explicitly use an injected test record, not live backend data. The default production source remains Starter-only with no approved feed.
- Visual review: stacked touch targets at mobile widths, bounded desktop column, one refinement toggle, disabled controls remain visible, optional playable preview, no Starter grid. The saved challenge is collapsed to avoid an oversized initial screen.
- `npm run build` passes. A minimal Rolldown group splits Mapbox into its own ~1.86 MB chunk, leaving ~1.30 MB of application JS. The existing 3 MiB Workbox cap, asset glob and validation remain enabled and unchanged. Service-worker generation precaches both chunks.
- `node tests/browser/productionPwa.verify.mjs` against `npm run preview -- --host 127.0.0.1 --port 4173` verifies both production chunks load with HTTP 200, no browser errors, and both are present in the service-worker precache. No deployment or unrelated architecture changes.
- Existing Custom-to-saved replacement is preserved: the Apply action remains available for explicitly replacing an assigned Custom exercise. Preview-only library browsing cannot allocate a record.

Browser fixtures use real production components with isolated read-only catalog fixtures; no live API mutations. Reproduction: `npm run dev -- --host 127.0.0.1`, then run the browser script. Screenshots regenerate into `work/selection-browser/`.

Draft only. STOP for ChatGPT review. Do not merge or deploy.
