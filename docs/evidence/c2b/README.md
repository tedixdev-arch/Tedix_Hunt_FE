# C2b evidence

Base: FE main `69351f02dd10798c19d9264ea4b3b27aba4a68fd` (merged #172). Backend: merged C2a main `92365a6367c33c6049c0cb530c5d0eb8645dcd9c` (#118).

Successful browser saves use the real merged backend and disposable PostgreSQL 16. Catalog entries and two Creator actors are isolated fixtures. The browser routes actual API requests to localhost; source modules are not intercepted. No save success is mocked. Only 400/401/403/404/413/500/network error UX uses explicit fault injection. The 409 is produced by a genuine competing backend update.

Screenshots compare the unchanged main branch with this change using the same Creator Studio styles and shared editor. All eight requested states are captured at 1440, 390 and 320 pixels. No horizontal page overflow was observed.

| Width | Before Create | After Create | Before Library | Saved drafts |
|---|---|---|---|---|
| 1440 | [before](before/create-1440.png) | [after](after/create-1440.png) | [before](before/library-1440.png) | [after](after/library-1440.png) |
| 390 | [before](before/create-390.png) | [after](after/create-390.png) | [before](before/library-390.png) | [after](after/library-390.png) |
| 320 | [before](before/create-320.png) | [after](after/create-320.png) | [before](before/library-320.png) | [after](after/library-320.png) |

Additional states, each at all three widths, are in `after/`: `saving`, `confirmation`, `reopen`, `revision`, `validation`, `conflict`. [Results](results.json) record actual content IDs for the disposable run, every supported mechanic, ownership, pagination and injected failures.

## Reproduction

1. Install FE dependencies and clone/install the merged BE into `work/backend`.
2. Start disposable PostgreSQL 16 on localhost port 55432 (user postgres, password c2b-disposable). Keep this isolated from any live database.
3. Start FE Vite on 5173. For before screenshots, start a clean main checkout on 5174.
4. From the FE root run `work/backend/node_modules/.bin/tsx tests/integration/content-library/backend.ts`. It creates a uniquely named database, applies the BE migrations, seeds two Creator actors and a small complete geography catalog, and starts localhost:3002. SIGINT/SIGTERM closes the server and drops its database. `C2B_BACKEND`, `TEST_DATABASE_URL` and `C2B_ACTORS` can override local paths/connection details; remote database hosts are rejected.
5. Run `node tests/browser/contentPersistence.verify.mjs`. Override `C2B_EVIDENCE` to keep committed evidence unchanged. Actor tokens stay in `work/actors.json` and are not committed.
6. Run `npm run typecheck`, `npm test -- --maxWorkers=2`, and `npm run build`.

The browser script covers save confirmation/loading, full refresh and exact reopening, category/grade/city restoration, immutable old revisions, concurrent writes, safe reload, all 15 Personal and seven Team mechanics, ownership, UI pagination and contextual errors. Canonical payload tests additionally check complete answers, hints, feedback, solution and LaTeX retention and rejection of unsupported categories, grades, Navigation and unresolved location labels.

The existing Template completion browser script times out on its `Country *` selector on both this branch and unchanged main; see the paired logs under `checks/`. This is a baseline test failure, not a passing check.

The existing shared Personal editor browser regression also passed all **90** Content/Template scenarios (15 mechanics × two contexts × three widths), including answers, hints, feedback, solutions, LaTeX modes, retained variants and overflow checks. Its detailed results are in [checks/personal-contextual-results.json](checks/personal-contextual-results.json). Creator Studio and Template context browser regressions passed at their existing viewport matrices.

## Final checks

- Typecheck and production build: passed.
- Full FE suite: **271 Node tests + 1,063 React tests across 55 React test files**, all passed, none skipped.
- Merged BE Content Library contract/PostgreSQL integration: **49 passed**, none skipped.
- Real PostgreSQL browser persistence matrix: passed, including all 22 supported mechanics.
- Existing Creator Studio, Template context, challenge allocation and 90-scenario shared Personal editor browser regressions: passed.
- Existing Template completion browser: same baseline selector timeout on unchanged main and this branch, documented above.

[Machine-readable check summary](checks/summary.json) · [FE test log](checks/fe-tests.log) · [PostgreSQL browser log](checks/postgres-browser.log)
