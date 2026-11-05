# C2e-02 — approved Content in Creator Templates

FE base: `ccaaaf2` (latest main, merged #175). Contract and integrated backend: `a0826e8` (merged BE #121), `docs/Template_Content_Allocation.md`.

## Implementation

The old `ChallengeAllocation` held mode, filters and selected ID in local component state, read starter/catalog records, and had no assignment callback. Team Predefined used examples. Neither path produced checkpoint `libraryAllocations`.

The existing Personal/Team authoring controls now browse approved discovery in place. Selecting an exercise loads and verifies its exact approved detail, retains the revision metadata in the editor draft, writes only the exact Content/Revision pair to that checkpoint slot, and immediately uses the shared mobile playable surface. Examples remain available as independent Create Your Own starting content; they cannot be selected as approved Library records.

Random writes an unresolved request with optional supported filters. It has no representative exercise preview or FE selection algorithm. Only a confirmed immutable-version save produces “Exercise allocated” and a frozen preview. Counts describe loaded eligible discovery results (`N+` when another page exists); the API does not provide a total count.

Serialization extends the existing checkpoint model. It preserves checkpoint identity, order, route fields, the other slot, and the unnumbered `role: terminal` FinishPoint. Retained allocations echo the full returned provenance and canonical payload unchanged. Explicit replacement/reroll removes only that slot's previous source/payload pair. No other save, navigation or preview operation rerolls Random.

Template academic category and specific grade constrain discovery exactly; Mixed is not an all-category shortcut. Geographic scope comes from Template locality. Catalog lookup accepts only an explicit matching locality UUID and country binding. If unavailable, discovery conservatively offers Universal/Country content; no city/region identifiers are inferred. There is no alternate Library location override or invented curriculum hierarchy.

Personal uniqueness uses Content ID across normal checkpoints and FinishPoint. Specific choices already used elsewhere are disabled, and save validation also rejects duplicate identities. Backend matching remains responsible for unresolved Random collisions and shortages. Team reuse has no new uniqueness rule.

Library payloads are excluded from custom-draft hydration. Viewing Create Your Own preserves the selected Library allocation; applying custom content explicitly removes its Library provenance in the new version. Selecting Library content preserves retained custom drafts and uses the existing replacement confirmation. New Library selections also participate in unsaved-change protection.

### Save confirmation and concurrency

The save response is validated for complete resolved provenance, canonical payload and correct Template instance ownership. Allocation saves then read the owner GET and verify the same version, status and content before acknowledging success. This is necessary because current mutation responses omit publication/submission fields present in GET; storing the partial projection made the existing strict preflight reject a subsequent save. Saves without allocations retain their previous path and strict conflict checks.

Newer local selections and unrelated edits made during a save remain unsaved; only unchanged same-slot selections receive returned frozen metadata. Late discovery/detail responses cannot overwrite a new mode or context. Save errors are visible from Review & Submit and preserve working selections.

If a mutation or its confirming GET has an uncertain outcome, the existing recovery flow retains working content and asks the Creator to reopen the latest version. It does not claim success or automatically retry an unresolved Random request.

## Verification

| Check | Result |
| --- | --- |
| Full FE suite | 43 Node test entries + 60 Vitest files / 1,182 tests passed; no skips |
| Typecheck | Passed |
| Production build/PWA generation | Passed; existing large-chunk warning remains |
| BE integration regressions | 149 passed: allocation (49), approved discovery (31), Content Library (35), custom exercises (34) |
| Real Creator browser workflow | Chromium at 1440, 390 and 320; real FE API client, real BE #121, disposable PostgreSQL 17 |
| Approved Content Library browser regression | Real backend workflow passed at 1440/390/320; 36 captures under `work/approved-library-browser` |
| Creator Studio / Template context browser regressions | Passed at 1440/768/390/320; no browser errors, mutation requests or overflow (fixture projections) |
| Admin review browser regression | 21 fixture screenshots; geography and exclusive-decision assertions passed; this fixture test is not persistence evidence |

`tests/templateAllocation.test.tsx` adds allocation selection, serialization, frozen restoration, pending/resolved Random, explicit reroll/cancel, uniqueness, stale requests, pagination, geographic/category/grade eligibility, FinishPoint slots, custom independence, mode switches, retry, owner-read confirmation and in-flight reconciliation coverage. `tests/challengeAllocation.test.tsx` replaces obsolete session-only/demo/alternate-geography expectations with approved-discovery and authoritative-context regressions. Custom editor play/reset/copy assertions remain in the existing builder suites.

The real browser runner records 39 browser version-save requests, including intentional validation failures. It asserts exact IDs submitted, frozen exercise reload, immutable approved revision despite a newer draft, explicit ID-free reroll, unchanged pins after an unrelated edit, Personal duplicate prevention, Specific+Random shortage, empty-pool retry, Universal exclusions, exact Local city matching, FinishPoint Personal and Team, and preserved source/payload after viewing Create Your Own.

Category/grade/location error rendering is exercised by altering an outbound test request to emulate stale/ineligible context. The backend returns real validation errors; no successful persistence response is synthesized. Separate API error probes check exact backend error codes. Vitest response fixtures test FE behavior only and are not used as persistence evidence.

90 visual captures (45 viewport + 30 complete allocation panels + 15 error close-ups) and machine-readable results are in [../evidence/c2e-02](../evidence/c2e-02/README.md). All screenshots were captured with Chromium. Allocation and error close-ups supplement viewport captures because the existing application uses an internal scroll container. Layout was compared with the existing Creator controls and shared preview styles; no new stylesheet or navigation workflow was introduced.

## Reproduce integrated verification

Use a fresh disposable local PostgreSQL 17 instance and the merged backend checkout. Do not point these commands at the development deployment. The existing backend harness creates a uniquely named database, migrates it, seeds isolated actors/catalog fixtures, and drops its own database on SIGTERM/SIGINT. Its actor file contains temporary tokens and must stay under `work/`.

```sh
# Backend checkout (BE main including #121)
npm ci
npm run build

# FE checkout; start the disposable backend fixture in a separate terminal.
mkdir -p work
TEST_DATABASE_URL='postgres://USER:PASSWORD@127.0.0.1:PORT/tedix_test' \
C2C_BACKEND='/absolute/path/to/Tedix_Hunt_BE' \
node --import /absolute/path/to/Tedix_Hunt_BE/node_modules/tsx/dist/loader.mjs \
  tests/integration/content-library/reviewBackend.ts

# FE checkout; separate terminal.
node tests/integration/content-allocation/serve.mjs

# FE checkout; requires /usr/bin/chromium and the fixture actor file.
node tests/browser/templateAllocation.verify.mjs

# Optional Admin fixture browser regression (no persistence claims).
C2C_CORRECTIONS_EVIDENCE=work/admin-review-browser \
  node tests/browser/contentReviewCorrections.verify.mjs
```

Restart the disposable backend fixture for each complete allocation browser run so approved pool identities are deterministic. The verification runner restricts its backend target to loopback. `C2E_BACKEND_URL`, `C2E_FRONTEND_URL`, `C2C_ACTORS`, and `C2E_EVIDENCE` can override local harness locations. Stop the fixture process and remove its disposable container after testing.

## Scope and review boundary

FE only. No BE files, APIs, migrations, exercise schemas, approval workflow, Participant delivery/scoring, Mapbox placement, Organizer workflows, published snapshots or legacy Template migration changed. Existing custom-exercise publication/gameplay gates remain. One feature branch and one Draft PR; STOP for ChatGPT review. No merge or deployment.
