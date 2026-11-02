# CUX-05B-1 — Authenticated integration harness preparation

Preparation date: 2026-11-02. FE base `b82b028a84fd12914e5f51db4a6dc0aaa5ec58c5` (main including PR #153); inspected BE main `528b3a144d0cfaea91b9091083c98186f0a89153`.
Reference: [CUX-05A readiness audit](CUX-05A-Creator-Integration-Readiness.md).

## Status

- **IMPLEMENTED:** Opt-in executable browser/API acceptance scenario, local service launcher, database ownership/identity gates, exact-version SQL assertions, whole disposable database cleanup, and negative safety tests.
- **VERIFIED:** FE typecheck/build/existing tests; BE build and tests without a database; harness typecheck, configuration/cleanup tests, source fixture compatibility and unauthenticated browser bootstrap. Detailed evidence below.
- **BLOCKED:** Authenticated integration has **not** been executed. No authorized disposable database, locality and native Creator/Admin credentials were supplied. Existing deployed environments were not tested or mutated. No authenticated test is added to normal CI.

## Architecture and reuse

`tests/integration/run.mjs` validates configuration before importing service dependencies or making connections. It connects only to an explicitly named, already prepared loopback PostgreSQL database. It verifies the database name, owner, operator-set ownership comment, exactly two active non-guest password identities with the required persisted roles, and absence of pre-existing Creator Templates, Hunts and organizations. A PostgreSQL advisory lock prevents overlapping harness runs.

The runner starts a child process using the existing compiled BE `createApp()` and PostgreSQL pool. The child independently checks its database binding and listens on a kernel-assigned loopback port. It uses the real product middleware and routes, without `includeErrorProbe`, signed-token fixtures or authorization overrides. It does not call `connectPostgres()` (which can initialize schema); the database must already be migrated. A fresh random signing key belongs only to this process. No existing deployed BE can be selected.

An ephemeral Vite server serves the FE adapter entry and proxies `/api` to that child. Repository config/.env files and inherited Vite service settings are excluded. The browser entry requires the dedicated runner flag, loopback origin and empty same-origin API base. Two nonpersistent Playwright contexts keep Creator/Admin sessions separate, authenticate through native login endpoints and use the existing FE `authApi`, `creatorTemplatesApi`, `universalLibraryApi`, `geographyApi` and `adminTemplateReviewsApi`. Product requests are real browser fetches through the FE client; no endpoint responses are mocked.

This is an **adapter-level browser acceptance harness**, not a Creator/Admin UI click-through or live Mapbox smoke. It exercises FE transport/session handling, HTTP authorization and backend persistence; existing component/browser scripts retain UI coverage. No Mapbox token is needed for this minimum scenario.

Infrastructure inspected before implementation:

| Existing infrastructure | Reuse / decision |
| --- | --- |
| FE Node tests, Vitest and `tests/browser/*.verify.mjs` | Keep current frameworks; use the same Playwright browser-library approach. Pin `playwright` and `playwright-core` to 1.56.1 in the lockfile. No second test framework. |
| FE `tests/fixtures/customExercises.ts` | Reuse `customTemplateFixture` and existing Personal/Team exercise fixtures; these mirror BE `src/test/customExercises.ts`. |
| BE Creator/Admin/custom exercise PostgreSQL suites | Reuse lifecycle pattern: isolated DB ownership, real version/review snapshots and drop after closing pools. Their JWT-signing actor helpers bypass login, so they are not used for browser authentication. |
| BE `src/db/pre_migration_baseline.sql`, `runMigrations`/migration discovery and CI workflow | Existing setup utilities remain the operator's empty-database setup route; no duplicate migrator or schema changes. |
| BE locality fixtures and Creator geographic snapshots | Use an existing active locality UUID and existing one-normal-checkpoint/terminal FinishPoint contract, with valid registered coordinates and radii. No registry or account creation in the runner. |
| Both repositories' validation/deployment workflows | Read for prerequisites and known shared targets. No workflow changes and no authenticated CI job. |

All implementation changes are in FE. BE code/contracts require no changes, so only an FE Draft PR is needed.

## Required configuration (names only)

Runner inputs:

```text
CUX_DISPOSABLE_ENVIRONMENT
CUX_TEST_DATABASE
CUX_DROP_DATABASE
CUX_DATABASE_URL
CUX_BE_DIRECTORY
CUX_CREATOR_EMAIL
CUX_CREATOR_PASSWORD
CUX_ADMIN_EMAIL
CUX_ADMIN_PASSWORD
CUX_LOCALITY_ID
```

Existing setup inputs, used privately while preparing the isolated BE/database:

```text
DATABASE_URL
JWT_SECRET
```

The runner supplies its child's `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV` and `CUX_TEST_DATABASE`. It preserves supplied `AUTH_ABUSE_*` and `AUTH_TRUSTED_PROXIES` policy settings. It selects an ephemeral FE/BE port itself. `VITE_API_BASE_URL`, `TEST_DATABASE_URL`, external FE/BE URLs and inherited signing settings are never fallback targets. Store passwords and the database URL in a protected runner environment, never committed files, shell tracing, reports or PR text.

## Safe setup for CUX-05B-2

1. Operator explicitly authorizes a dedicated disposable local PostgreSQL 17 service and destruction of the complete per-run database, including its two accounts and registry fixtures. Do not use a tunnel to a shared cluster. Remote URLs, including known dev/production services, are unsupported. Loopback alone is insufficient: the ownership and fresh-state checks below are mandatory.
2. Check out the recorded FE/BE revisions (or review and record newer ones). Use Node 24. Run `npm ci` in both repositories and `npm run build` in BE. Set `CUX_BE_DIRECTORY` to that BE checkout's absolute directory. The runner loads its existing `pg` dependency, not a duplicate FE database dependency.
3. In FE run `npx playwright install chromium` to install the browser revision paired with pinned Playwright 1.56.1. Install OS browser dependencies in the disposable runner image if required. The standard command uses this managed browser; the preparation smoke used the environment's existing Chromium and does not establish managed-browser readiness.
4. Generate a fresh UUID without hyphens. Name the empty per-run database `cux05b_` followed by its 32 lowercase hexadecimal digits. Set `CUX_TEST_DATABASE` and `CUX_DROP_DATABASE` to that exact name; the latter explicitly opts into whole-database deletion. Set `CUX_DISPOSABLE_ENVIRONMENT` to `authorized-disposable`.
5. Operator creates that database owned by the connection role on the dedicated local service. Set `CUX_DATABASE_URL` to its explicit PostgreSQL URL using host `127.0.0.1`; include the port if nondefault. Query strings, fragments, alternate hostnames and mismatched database names are rejected. The role must also be able to connect to the `postgres` maintenance database and drop its owned test database. Never use production credentials.
6. Apply BE `src/db/pre_migration_baseline.sql` to this **new empty database only**, then run BE `npm run migrate` with its explicit `DATABASE_URL` and a securely generated `JWT_SECRET`, following existing BE CI. No migrations are performed by the integration runner.
7. Operator provides exactly two authorized active native password accounts in this isolated database: Creator and an independent Admin, with persisted `user_roles`. Use existing approved provisioning/setup procedures. Set the four identity variables. The runner does not register, bootstrap, grant roles, seed tokens or create accounts. Supply an active registered locality through `CUX_LOCALITY_ID`.
8. Operator marks the owned database with PostgreSQL `COMMENT ON DATABASE`: the comment must be `cux05b-owned:` immediately followed by the exact database name. This explicit ownership claim must only be applied to the authorized newly created database. The runner rechecks it before execution and before cleanup; the name/URL label alone never authorizes cleanup.
9. Ensure the database has no existing Creator Templates, Hunts or organizations, and no users beyond the two fixtures. Close setup pools/tools so final non-forced DROP can succeed. Supply credentials through the protected environment without `set -x` or command echoing.
10. From FE run:

```sh
npm run test:creator-integration
```

The command exits nonzero with a bounded phase explanation if prerequisites or assertions fail. Missing input errors name the required setting without exposing its value. No silent fallback is possible. Successful setup arms cleanup: subsequent failure still removes the entire authorized owned database. Prepare a new database and fixtures for each run.

## Executable core scenario

1. Creator and independent Admin log in through their real role-specific endpoints. Check returned IDs against persisted fixtures and against each other.
2. Creator creates a uniquely run-prefixed Universal from the valid existing custom-exercise fixture, then saves an exact second version.
3. Creator submits that version; Admin fetches and compares its content, then approves the inspected version. SQL verifies its publication pin and independent exact-version review.
4. Creator reads the approved Universal library entry, copies its returned `publishedReference` to a unique Local key and verifies SQL lineage points at that exact source/version.
5. Creator selects the active registered locality, configures a normal checkpoint and terminal FinishPoint at its coordinates, and assigns existing Personal and Team Challenges. Save the next Local version; compare its content to PostgreSQL.
6. Reload the Creator page and reopen the Local through the owner API. Compare key, version, full content and locality snapshot with the saved response.
7. Submit the exact saved Local version; independent Admin inspects, compares and approves it. Compare retained approved content and locality snapshot.
8. SQL compares all version rows before/after approval, and verifies exactly one independent approved review at the saved version. Append a candidate revision, then verify old version rows/reviews and retained Local content/version remain unchanged. Verify Universal version rows also remain unchanged.
9. Revoke both sessions. Close browser/FE/BE/pools; remove only the explicitly owned disposable database and verify its disappearance.

No direct SQL writes create product Templates or approval decisions. SQL reads inspect committed persistence. Expected post-run evidence is a sanitized `work/creator-integration/cux05b-*.json` containing only run/key/version, completed steps, workflow state/failure phase and cleanup state. Passwords, tokens, connection strings, raw exceptions, traces, screenshots, browser storage and SQL diagnostics are not recorded. The directory is gitignored.

## Cleanup and recovery

No cleanup is armed when configuration, dependency, ownership, role or fresh-state checks fail. After isolation and exclusive-lock checks succeed, cleanup runs on normal completion and caught failures. It stops only spawned services, closes pools, reconnects to the same local service's maintenance database, rechecks the exact marker and database owner, then drops the strictly validated quoted per-run database. It never uses FORCE, terminates unrelated sessions, truncates a schema, bulk-deletes accounts or weakens the product's approved-Template deletion restrictions.

A missing/mismatched marker, foreign owner, occupied database or failed DROP retains data and produces nonzero exit plus a cleanup-blocked result. The operator must check the exact run database and remove it through the authorized isolated lifecycle. Abrupt termination, machine failure or SIGINT can also leave the database behind; inspect the runner's unique name/ownership marker and close only its remaining processes before manual cleanup. No automatic scavenger searches for similarly named databases.

## Validation evidence

Checks executed in this preparation, without authenticated integration:

| Check | Result |
| --- | --- |
| FE `npm run typecheck` | Passed |
| FE `npm run build` | Passed; existing large-chunk advisory remains |
| FE `npm test` | Passed: 270 Node tests and 906 Vitest tests / 42 files; jsdom scrollTo advisories |
| BE `npm run build` | Passed |
| BE `npm test` with database variables unset | Passed: 1,116 tests / 50 files; 537 tests / 24 database-dependent files skipped, explicitly not verified |
| `npm run typecheck:creator-integration` and Node syntax checks | Passed |
| `npm run test:creator-integration:config` | 33 passed; missing input, shared/remote/mismatched targets, URL host overrides, same identity, missing/foreign ownership and cleanup boundaries |
| FE fixture compatibility with compiled BE validators | Universal and Local accepted by `isTemplateContent`, `allocateCustomExercises` and `isTemplateContentSubmittable`; no DB/HTTP |
| Unauthenticated Chromium/Vite adapter-entry smoke | Entry loads with runner gate; inherited dev API ignored; no product API request, login or live environment access |
| `npm run test:creator-integration` without required setup | Expected exit 1, BLOCKED at configuration, cleanup not armed; no service connection |
| `git diff --check` | Passed |

## Remaining prerequisites

**CUX-05B-2 is BLOCKED** pending operator-authorized disposable PostgreSQL/database/reset boundary, prepared and owned migrated database, separate authorized native accounts, active locality fixture, managed Chromium installation, and review of this Draft PR. Then execute the scenario, inspect sanitized success/failure and cleanup evidence, and investigate any integration defects. Static preparation does not establish that real login, CORS/transport, product persistence or the authenticated journey passed. Additional cross-owner, wrong-role, stale-write and concurrency matrices from CUX-05A remain follow-up coverage.

Stop after opening the Draft PR for ChatGPT review. Do not merge or deploy.
