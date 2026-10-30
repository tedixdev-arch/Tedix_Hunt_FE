# F7-FE-03–06 — Accelerated Creator FE batch

[Draft PR #127](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/127), `codex/f7-fe-03-06`, 30 October 2026. Implemented source awaiting ChatGPT review. No merge or deployment. Integration, live-account/multi-account, real-device and deployed acceptance remain unverified.

## Task completion and source separation

| Task | Implemented result | Source commit | Separate evidence/tests |
| --- | --- | --- | --- |
| F7-FE-03 | Shared editor creates classified route-free Universal drafts; duplicate clicks and uncertain creation handled; legacy scratch unchanged | `1994fc18af0017d7465c94152b20e76d600a89c1` | [Evidence](evidence/F7_FE_03.md); universalCreation and CreatorTemplates tests |
| F7-FE-04 | Explicit immutable saves and owner-detail reopen; persisted response hydration; full story/gameplay/terminal preservation; stale/failed-save recovery; submitted lock | `163328d8eaa6a742594b8f5f3b59d6b031cdb389` | [Evidence](evidence/F7_FE_04.md); universalPersistence tests |
| F7-FE-05 | Submit exact saved latest Universal; unsaved edits blocked; counted gameplay/terminal validation; independent Admin review | `b5b6bd5b70d8dddf8a32f96a4f0ac8c05e3ffb9e` | [Evidence](evidence/F7_FE_05.md); universalSubmission tests |
| F7-FE-06 | Inline read-only approved Library; authoritative published references, cross-Creator attribution, exact approved detail, stale/denied/missing states | `38697c2e0e095b74943c8f0ef2271fc1db8270a6` | [Evidence](evidence/F7_FE_06.md); universalLibrary API/UI/browser tests |

Shared race/compatibility/responsive verification: `1bc85bcd980b725952393fac2788ca8a3508af16`. Final documentation commit records this report and affected Master register rows. Source candidate status does not imply merged, integrated or deployed completion.

## Prerequisite and contract evidence

GitHub PR #125 verified `merged=true`, merged 30 October 2026 at 01:34:45 UTC, merge/main `b6b6c3a24bd5a756a5d26650ca53ccbbcb3f66c8`, head `68ceade0e1adfa7c626afb13bee02a7665cb496d`. Main contains F7-FE-02. No competing open F7-FE PR was found before this PR was opened.

Read the authoritative Master Execution Plan, frozen detailed reconciliation and relevant architecture v3.6 hierarchy/Universal/Local/shared-engine/governance requirements. Existing C2/C3/C5/F7-BE-01 documentation and actual Creator routes/Library model were inspected at BE main `a7df0f963feb8b431dfa83913eeca0facc43c116`. No API/dependency blocker or new backend contract was needed. Existing persisted Creator authorization and ownership checks remain the security boundary.

Git CLI transport could not reach its configured proxy. Main was materialized from connector blobs; all 293 tracked files matched remote main exactly. Delivered commits are rooted in actual remote main, and every uploaded tree matched its tested local Git tree. The temporary local source-reconstruction commit and work/ scratch files are excluded from the PR. CI deployment jobs are restricted to main pushes or manual dispatch; neither was invoked.

## Exact API usage

| Operation | Method/path | Envelope / authority |
| --- | --- | --- |
| Universal creation | `POST /api/creator/templates` | `{key, content, category:"universal"}`; omitted category retained for legacy scratch. No ownership/state/origin/provenance envelope fields. |
| Save immutable candidate | `POST /api/creator/templates/{key}/versions` | `{content}` containing complete next key/version snapshot. Category/owner inherited by backend. |
| Reopen and stale-state preflight | `GET /api/creator/templates/{key}` | Existing private owner detail; compare saved version/status/content before a Universal mutation. |
| Uncertain-create recovery | `GET /api/creator/templates` | Existing My Templates owner list; manually reopen saved identity before creating again. |
| Submit | `POST /api/creator/templates/{key}/submit` | `{version}` for the exact saved latest draft; no implicit save/approve/publish. |
| Browse approved products | `GET /api/creator/universal-library` | `{items:[{id,key,displayName,theme,creator:{id,name},publishedReference:{templateId,version}}]}`. |
| Approved detail | `GET /api/creator/universal-library/{key}` | Same allowlisted product projection plus exact approved `content`. Current publication is re-resolved; no history selector or private-owner fallback. |

Keys are URL-encoded. Successful persistence responses supply identity, content, version and candidate status. Candidate approval/status and newest version never substitute for the Library publication reference. An approved Universal may create a new immutable draft under C5; submitted content remains locked. New corrections require a saved draft before submission. Library approval covers reusable content and does not certify a Local route or Organizer eligibility.

## Behavior and ergonomics

One shared editor and gameplay engine. Direct Universal entry adds no chooser/modal; geography/Local safety reminders are hidden for Universal, while supported story, challenge, normal checkpoint and terminal gameplay controls are reused. Explicit Save draft is distinct from local Continue navigation. No autosave or save per keystroke. Optional saved fields and unknown supported narrative/scoring/gameplay/configuration survive reopen unchanged. Backend-normalized fields rehydrate after save.

A synchronous lock rejects duplicate mutations. Unsaved content cannot be submitted. Owner-detail preflight catches stale state; the server's immutable version/state checks remain the final race boundary. 400 content validation, 403 authorization and 409 state conflicts remain distinct. Failed input stays available. Uncertain creation prevents blind retry and points to My Templates; stale/uncertain saves require explicit reopen with a discard-edits label.

Library uses existing card/action styling inline in Studio. Only C3/C5 products are read; no owner-list enrichment, private drafts, edit/copy/history controls or candidate-status inference. Loading, empty, error, retry, denied and missing states remain distinct. Refresh clears stale detail; out-of-order/unmounted reads cannot restore stale content. Current republication replaces the selected old reference. Detail heading receives keyboard focus; closing returns focus to the trigger.

## Validation actually executed

| Check | Result |
| --- | --- |
| Slice 03 focused creation/navigation/Signal | 44 Vitest tests passed; Creator API Node test-file passed; typecheck passed |
| Slice 04 focused persistence/creation/Signal | 43 Vitest tests passed before proceeding to 05; typecheck passed |
| Slice 05 focused submission/persistence/Signal | 48 Vitest tests passed; typecheck passed |
| Independent Library | 14 Vitest tests and its API Node test-file passed |
| Library/navigation integration | 28 Vitest tests passed before final race additions |
| Final `npm test` | 36 Node test-file entries and 361 Vitest tests across 19 files passed; zero failures/skips |
| Final `npm run typecheck` | Passed |
| Final `npm run build` | Passed; existing Vite large-bundle warning |
| `git diff --check` | Passed |
| Chromium 1440/768/390/320px | Authoring, Library and Studio navigation passed; no horizontal overflow/page errors; keyboard Tab/Shift+Tab/Enter and focus verified; screenshots inspected |
| Register/frozen history | 169 task rows; only F7-FE-02–06 task records updated; frozen reconciliation unchanged |

Authoring browser fixture verifies create → explicit v2 save → reopen → exact v2 submission, dirty-submit prevention and read-only submitted state. Library fixture verifies current v3 replacing selected v1, cross-Creator content, keyboard detail focus and no mutation requests. Existing full suite retains Local/legacy/Signal: Cluj-Napoca behavior and auth/navigation regressions. Browser fixtures use local API stubs, not real backend mutations.

Reproduce browser checks with a local Vite server and `PLAYWRIGHT_MODULE` pointing to Playwright: `node tests/browser/universalAuthoring.verify.mjs`, `node tests/browser/universalLibrary.verify.mjs`, `node tests/browser/creatorStudio.verify.mjs`. Chromium defaults to `/usr/bin/chromium`.

## Remaining limitations

No live FE/BE integration, actual multi-account independent review, backend DB suite rerun, real-device or deployed acceptance was performed. Existing prototype-only custom mechanics remain nonpersistable; no unsupported engine fields were invented. No idempotency key contract exists, so uncertain creation uses owned-list recovery; preflight cannot replace backend transactional race checks. Reopening after stale/uncertain save explicitly discards the local edits. Optional geographic values already saved on a Universal are preserved, without certifying route safety.

Local authoring/copy, Universal history selection, governance changes and G4/D10 activation are outside this batch. Frozen reconciliation, immutable old versions, canonical Signal, legacy classification and Hunt snapshots remain untouched. **Stop for ChatGPT review. Do not merge or deploy.**
