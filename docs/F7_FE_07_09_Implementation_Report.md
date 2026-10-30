# F7-FE-07–09 — Local creation and version locality binding

30 October 2026 (Europe/Bucharest). [Draft PR #128](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/128), branch `codex/f7-fe-07-09`. One Draft PR for ChatGPT review; do not merge or deploy.

## Evidence dimensions

| Dimension | Result |
| --- | --- |
| FE source | Implemented; separate commits for F7-FE-07, F7-FE-08 and F7-FE-09; awaiting review |
| Backend contract | Verified against BE main `a7df0f963feb8b431dfa83913eeca0facc43c116`: C2, C4, C6b-1 and C6b-4 contracts and actual Creator/geography routes and Template model |
| Integrated workflow | Unverified; FE fixtures do not prove live cross-account ownership, PostgreSQL transactions or independent Admin review |
| Deployed acceptance | Unverified; no deployment, real-account mutations, DB changes or backend suite execution |

## Preparation and base

FE main verified through GitHub at `62b3479ec9a8887b35424cb5d2bb8c288df8b510`, including merged PR #127 and its F7-FE-03–06 prerequisites. Read the Master Execution Plan, frozen reconciliation and architecture v3.6, particularly F7, G4, lifecycle and staged gates. FE and BE open PR searches were empty before delivery.

The environment's Git transport cannot connect to its configured proxy. PR #127 was materialized through the GitHub connector on the existing #125 workspace. Every top-level file and directory Git hash matches remote main, including complete src, tests, docs and public trees; no source approximation. The reconstruction commit and work/ scratch files are excluded from delivery. Remote commits are rooted in actual main; uploaded blob/tree hashes are checked against tested local Git objects.

## Task evidence

- [F7-FE-07](evidence/F7_FE_07.md): exact inspected Universal publication and destination key, independent Local draft handoff, stale selection rejection, duplicate click lock and uncertain response recovery.
- [F7-FE-08](evidence/F7_FE_08.md): inline two-choice Local entry and scratch Local category through the shared editor, progressive drafts, legacy/Signal preservation.
- [F7-FE-09](evidence/F7_FE_09.md): stored country/locality registry, UUID selection, immutable server snapshot display and explicit omission/rebinding/clearing.

## Separate source commits

| Task | Commit |
| --- | --- |
| F7-FE-07 | `981ef293b7e7d140d1bafceb147e0a1479af0d91` |
| F7-FE-08 | `dd57a830b437befe325e4be8b117f033a50f5e3d` |
| F7-FE-09 | `99c9d7f0df169d5292e58c3e788a7ae6a6d2585a` |

## Exact contract usage

| Action | API and envelope |
| --- | --- |
| Copy approved Universal | `POST /api/creator/templates/from-universal/{sourceKey}` with `{key,publishedReference:{templateId,version}}`; no content, approval, category, lineage or locality fields |
| Scratch Local | `POST /api/creator/templates` with `{key,content,category:"local"}` and optional sibling `localityId` |
| Save next Local version | `POST /api/creator/templates/{key}/versions` with complete `{content}` and optional sibling `localityId` |
| Read/recover | Existing owner list/detail; never read another Creator's private draft to resolve a publication |
| Countries | `GET /api/geography/countries` → `{countries:[{code,displayName}]}` |
| Search | `GET /api/geography/localities?countryCode=…&q=…` → active stored records; no provider parameters |
| Exact registry read | `GET /api/geography/localities/{id}`; inactive record remains readable |

C4 always starts unbound. The backend independently persists the copied approved JSON/provenance and returns Local draft v1; FE keeps server metadata and never constructs lineage or updates the source. Future saves retain the Local identity; no source subscription or propagation exists. Backend-only provenance that is not exposed by current responses is not invented in the UI.

On subsequent saves, omitted localityId inherits the predecessor's exact ID/snapshot, UUID explicitly rebinds or refreshes even the same place, and null clears in a new version. Binding-only changes force a new version even when content is identical. Saved snapshot and current registry facts are displayed separately; only the backend constructs snapshots. Country changes clear pending locality selection. Same-name results retain context, coordinates and references; no first-result or text-based identity selection.

400/404/locality-specific 409 saves preserve saved metadata and pending input. Stale/uncertain version writes require explicit reopen; uncertain creation points to My Templates before retry. Publication 409 requires Library refresh/reselection, while destination-key conflict allows correction. Synchronous locks reject duplicate mutations. The server remains the final race, ownership and authorization authority.

## Simplicity and ergonomics

Create Local → choose approved Universal or scratch → configure in the existing editor → Save draft. The chooser is inline; no new route, modal or duplicate editor. Geography sits between reusable setup and location features. Native labels/selects/buttons support keyboard use; country reset, empty catalog, inactive/current record, loading/error/retry and unsaved selection remain visible. Incomplete drafts are saveable without a Universal or locality; submit retains existing readiness and exact saved-version requirements. Local approval and Organizer availability are never inferred from source publication.

## Executed checks

| Check | Result |
| --- | --- |
| F7-FE-07 focused | 23 Vitest tests; exact-envelope/provenance Node test-file passed |
| F7-FE-08 focused | 50 creation/persistence/Signal Vitest tests; 14 navigation tests passed |
| F7-FE-09 focused | 31 locality/persistence/creation Vitest tests passed |
| Final `npm test` | 38 Node test-file entries; 411 Vitest tests / 24 files; zero failures/skips |
| `npm run typecheck` | Passed |
| `npm run build` | Passed; existing Vite large-bundle warning |
| `git diff --check` | Passed |
| Chromium 1440/768/390/320px | Both Local origins, save/reopen, explicit locality refresh/clear, exact copy reference, keyboard Enter/Tab/Shift+Tab and no horizontal overflow/page errors |
| Existing browser regressions | Creator navigation, Universal create/save/reopen/submit and Library republication passed at all four widths |
| Frozen history | Reconciliation unchanged; no new task IDs; G4/D10/C6b-2 states untouched |

Reproduce with a local Vite server and `PLAYWRIGHT_MODULE` pointing to Playwright: `node tests/browser/localAuthoring.verify.mjs`, `creatorStudio.verify.mjs`, `universalAuthoring.verify.mjs`, and `universalLibrary.verify.mjs` under tests/browser. Chromium defaults to `/usr/bin/chromium`. Local server and Chromium required execution permission for socket binding; checks succeeded. Browser fixtures make no real backend writes. [Machine-readable Local browser result](evidence/F7_FE_07_09_Browser_Results.json).

## PR #128 review correction

The Local submission preflight was incorrectly guarded by Universal-only classification, leaving its Local locality comparison unreachable. It now runs for both classified types before exact-version submission; failed/stale or uncertain classified requests require the existing reopen recovery. Local route readiness, persisted-role/owner authorization, draft-only submission and existing read-only lifecycle restrictions remain intact. This correction adds no F7-FE-11/12 workflow.

The new Local submission regression fixture completes the existing route review, preview and validation before attempting submission. Before the fix, 10 regression cases failed because owner preflight was skipped; afterward all 11 pass, covering a successful exact-version request, stale version, locality ID, saved snapshot, status and content, denied/conflicting owner reads, and readiness/submitted restrictions. Focused command: `npx vitest run tests/localSubmissionPreflight.test.tsx tests/universalSubmission.test.tsx tests/localPersistence.test.tsx tests/creatorFinishPoint.test.tsx` — 55 tests passed. Correction validation: full `npm test` passed 38 Node test-file entries and 411 Vitest tests / 24 files, zero failures/skips; typecheck, build and diff checks passed. Existing bundle-size warning remains. Earlier browser evidence applies to the original UI; no new browser acceptance is claimed for this two-condition correction.

The Master register now records F7-FE-03–06 as merged-source verified through PR #127, merge `62b3479`, and retains F7-FE-07–09 In review in Draft #128. The dashboard and obsolete #127 review-stop wording are corrected. All 169 task IDs/order and frozen reconciliation are preserved. Integration and deployment remain unverified; no merge or deployment.

## Remaining limits

No backend dependency is missing for these slices. The stored registry may be empty; no provider fallback or invented locality is used. C6b-2 stays blocked. Local revision/submission expansion (F7-FE-11/12), missing-place proposals (F7-FE-10), full route safety/evidence, independent Admin acceptance, G4/D10 activation and real multi-Creator integration remain separate. Existing Local read-only lifecycle restrictions remain. Client preflight does not replace backend transactional concurrency checks. No idempotency mechanism is invented; uncertain mutations require recovery. Canonical Signal, legacy classification, Universal publication, immutable old versions and Hunt snapshots are preserved.

Stop for ChatGPT review. Do not merge or deploy.
