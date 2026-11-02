# CUX-04C — Creator Studio regression and UX verification

Date: 2 November 2026. Base: `197ee2c` (main, merged PR #151).
Scope: QA and regression hardening; no API, schema, gameplay, approval or routing redesign.

## Verification boundaries

The local checkout was fast-forwarded from PR #148 to latest main after a successful remote fetch. Read CUX-01, CUX-04A and CUX-04B. No AGENTS.md was present. The implementation and fixtures use actual React components with deterministic API projections. They do not establish authenticated FE/BE persistence or real Admin approval.

**Authenticated integration: BLOCKED.** The configured development backend answered a read-only HEAD request with HTTP 200. No authorized disposable Creator account, independent reviewer account, or disposable backend/database was provided. Environment readiness listed no secret bindings or outbound identities. No production Templates, production Admin credentials, real Template mutations, merge or deployment were used.

Mapbox HTTP/style responses are intercepted in browser fixtures; lifecycle unit tests mock WebGL objects. Live tiles, physical route safety and real-device GPU behavior are not certified.

## Reproducible defects and fixes

1. **CUX-04C-01 — Advanced feature entries visible outside Advanced (P2, fixed).** Open a saved Template, choose Checkpoints & Challenges. All seven feature buttons were visible, including Mission History, Results Display and Special Awards. `hidden` on each button was overridden by its Tailwind `flex` utility. A narrowly scoped CSS selector now hides hidden feature buttons. The navigation browser script asserts exactly four ordinary entries and three Advanced entries at 320, 390, 768 and 1440px. Retained editors remain mounted; no persistence change.
2. **CUX-04C-02 — historical acknowledgements labeled content completion (P2, fixed).** Reopen a saved Legacy Template with unconfirmed positions: the header displayed “7 of 7 complete” although positions remained unconfirmed. Counters and Legacy review items now say “acknowledged.” Hydration, required IDs, save validators, route safety and submission gates are unchanged. Focused regression assertions cover this distinction.
3. **CUX-04C-03 — obsolete browser navigation and actions (test infrastructure, fixed/verified per results below).** Scripts tried saving or validating from hidden sections, used the former Description/authoring labels, assumed panels unmounted, or assumed all seven feature buttons were visible. Shared browser helpers now open public primary sections before feature editing/saving. Scripts preserve assertions about version identity, data, overflow and save/reopen. The assignment fixture now exercises current classified editors; compatibility replacement/discard coverage remains in the full unit suite.
4. **CUX-04C-04 — Mapbox drag test can target an offscreen or covered marker (test infrastructure).** Diagnostics captured a drag start at x=1423 in a 1280px window. The fixture now puts the target below the mobile search overlay before recording its camera-preservation baseline, and asserts map bounds and pointer hit-testing before dragging. No production map behavior was changed.

## Journey and state evidence

| Area | Evidence and limits |
| --- | --- |
| Universal | Scratch creation, location independence, content editing, save/reopen, exact saved-version submission: Universal browser fixture and persistence/submission suites. Challenge/FinishPoint assignment and preview are covered by the corresponding Creator/participant preview suites. |
| Local | Country/City, explicit Continue, approved-Universal pinned copy, locality snapshot refresh/clear, save/reopen, positions/FinishPoint and route preservation: Local authoring, Hunt Setup and positions fixtures plus Local validation/persistence/submission suites. Revision fixture checks exact v4 submission, retained v2 approval and suspension. |
| Legacy | Existing configuration, explicit historical acknowledgements, compatibility save, unknown configuration/scoring passthrough, unchanged checkpoint identities and reopen: Creator FinishPoint, Signal, template persistence and revision suites. No claim of a real historical database round trip. |
| Approved | Local/Universal revision suites assert retained approved/publication versions and exact new-candidate submission. Read-only/submitted browser projections expose no Template content editor. Approved library copy uses an explicit pinned version and does not mutate the source. |
| Unsaved Personal/Team work | Retained editor DOM and text across sections: Creator FinishPoint tests. Browser assignment/persistence suites cover authored content across Review/save/reopen and checkpoint changes. |
| Answers, hints, solutions | Full authoring/schema/persistence suites; consolidated browser persistence checks serialized answers/hints, and visual authoring checks edited answers plus simulation isolation. |
| Pending formula | Creator FinishPoint regression retains the same dialog and pending formula without insertion during forced section changes. Native modal focus requires ordinary users to finish/cancel before navigation. |
| Unconfirmed positions/notes | Mapbox lifecycle regression retains unconfirmed inspector edits/camera while releasing inactive map resources. Positions browser verifies confirm/cancel, touch, history and FinishPoint. |
| Advanced | Navigation browser checks unfinished prototype text, Special Award name/rule, and History/Results selection retention without extra save calls. These prototype inputs remain session-only, as labeled. |

## UX assessment

Primary section names, current state, keyboard activation and document overflow are checked at 320, 390, 768 and 1440px. Screenshots were inspected for narrow checkpoint editing and read-only submission context. Ordinary editing does not require opening Advanced; Legacy acknowledgements remain explicit in Review. Continue acknowledges/advances, Apply selects working content, Save draft creates a backend version in the fixture, and Submit sends the exact saved version. They retain distinct actions.

Validation recovery opens its target section. A missing city directs the Creator back to setup; locality proposal state distinguishes pending approval from a selectable registered city. Historical approvals and suspension remain separate from current candidate state. Position confirmation explicitly remains a session check, not evidence of physical verification. No subjective layout redesign was introduced.

## Commands and results

Results are recorded separately in the final validation table. Browser runs require a local Vite server, a placeholder public Mapbox token, an installed Playwright module and Chromium. Disable the environment-specific Cluj preset for normal registry fixtures:

```sh
VITE_DEVELOPMENT_LOCATION_PRESET= VITE_MAPBOX_ACCESS_TOKEN=pk.browser-fixture-token npm run dev -- --host 127.0.0.1
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser/creatorNavigation.verify.mjs
npm test -- --maxWorkers=2
npm run typecheck
npm run build
```

Runtime restrictions required supported escalation for GitHub access, localhost binding and Chromium. Initial sandbox launch/connection failures are infrastructure failures, not product regressions. Early fixture attempts under the Cluj preset and attempts interrupted by Vite source reloads are excluded from passing evidence. Retain failures and final rerun logs in the evidence archive.

## Remaining acceptance boundary

Do not treat fixture success as integrated release approval. Re-run the four journeys in a disposable FE/BE deployment with authorized Creator and independent reviewer accounts, comparing saved JSON, locality snapshots, routes and immutable approved versions. Integrated acceptance remains BLOCKED until that evidence exists. No merge or deployment is performed by this task.

## Validation results

| Check | Result |
| --- | --- |
| Initial full suite on merged main | PASS: 43 Node tests + 906 Vitest tests |
| Focused Creator/completion/FinishPoint/Mapbox/setup/revision suite | PASS: 178 tests |
| Final full suite after both production fixes | PASS: 43 Node tests + 906 Vitest tests; `npm test -- --maxWorkers=2 --testTimeout=15000` |
| Final typecheck | PASS |
| Final production build | PASS; existing large-chunk warning remains |
| Creator Studio, context, navigation, completion | PASS at 320/390/768/1440px |
| Universal and Local authoring; approved Universal Library | PASS at 320/390/768/1440px |
| Hunt Setup and locality/route preservation | PASS at 320/390/768/1440px |
| Checkpoint positions | PASS at 320/360/390/768/1280/1440px |
| Checkpoint features and nullable-category compatibility context | PASS at 320/390/768/1440px |
| Assignment browsing/apply/save/reopen | PASS: 16 Personal/Team × normal/FinishPoint × viewport cases |
| Consolidated custom exercise persistence | PASS: 60 Personal scenarios + 28 Team canvas scenarios |
| Original Personal challenge UX | PASS: 12 scenarios |
| Extended Personal visual authoring | PASS: 48 scenarios |
| Mapbox real-browser search/style/drag/camera fixture | PASS at 1280/390/320px; real Chromium camera, mouse/keyboard/touch search, confirm/undo/redo, style preservation, visible-target drag and error handling with mocked Mapbox responses |
| Authenticated disposable FE/BE integration | BLOCKED — accounts and disposable backend/database unavailable |
| Real external basemap/device GPU/field safety | Not verified |

The first final default-timeout run had 904 passes and two Signal save/reopen tests exceeding 5 seconds while browser jobs were active. The final rerun used a command-line 15-second per-test limit, kept all 906 assertions/tests, and passed. Repository timeout settings were not changed. The baseline full run had also passed all 906 with the default timeout.

`personalChallengeBuilder.verify.mjs` imports the original Personal UX suite. `exerciseLibrary.verify.mjs` and `experimentSaving.verify.mjs` import consolidated custom persistence. Their shared implementation was verified through those canonical entry points rather than counting duplicate alias runs as extra coverage. Administrative browser fixtures are outside this Creator workstream.

## Draft PR publication verification

Re-ran the existing implementation on `fix/cux-04c-creator-regression`, directly based on remote main `197ee2cf283bbf1ddc8006387fb98a6a12324de7` (merged PR #151). The production and test implementation was unchanged during publication preparation. Fresh results:

- Focused Creator/completion/FinishPoint/Mapbox/setup/revision tests: **178 passed** (`--maxWorkers=2 --testTimeout=15000`).
- Full suite: **949 passed — 43 Node tests + 906 Vitest tests** (`npm test -- --maxWorkers=2 --testTimeout=15000`). The focused tests are a subset, not additional to this total.
- All **16 canonical Creator browser entry points passed**, including consolidated 60 Personal + 28 Team persistence scenarios, 16 assignment cases, 12 original Personal UX cases and 48 visual-authoring cases. Journey/responsive fixtures and the 1280/390/320px Mapbox browser fixture also passed. Alias entry points use the canonical suites as described above.
- Typecheck, production build and `git diff --check`: **passed**. Existing large-chunk build warning remains.

**Authenticated FE/BE integration remains BLOCKED — authorized disposable accounts and an appropriate integrated test environment are unavailable.** Mocked fixtures are not authenticated end-to-end verification. No backend APIs, migrations, dependencies, gameplay rules, persisted Template contracts, Organizer design or Creator functionality were changed by publication preparation. Scratch logs and generated screenshots are excluded from the commit.

Prepared for Draft PR review. **STOP for ChatGPT review. Do not merge or deploy.** No production Template mutation or production deployment was performed.
