# CUX-05A — Creator integration readiness

Audit date: 2026-11-02. Documentation only; no tests against services, account creation, database changes, deployment or merge performed.

## Decision: BLOCKED for CUX-05B execution

Product APIs and disposable PostgreSQL tests exist. No supplied disposable integrated database/backend, authorized login credentials, or verified isolated staging target establishes permission and readiness to run the complete authenticated browser journey. Do not interpret this as missing product infrastructure. GO for preparing an integration harness; execution requires the gates below and ChatGPT review.

## Audited baseline and evidence

FE main: `a4e53c14f7a68155e0e8f378090d6f6dba7efc88`, the verified merge commit of PR #152. BE main: `528b3a144d0cfaea91b9091083c98186f0a89153`. Repository trees were enumerated, including test and migration paths; no AGENTS.md appeared. Source reads, rather than the outdated BE README introductory claim that PostgreSQL is not connected, establish current capabilities.

Evidence links below resolve against these audited commits:

- [FE API adapters](https://github.com/tedixdev-arch/Tedix_Hunt_FE/tree/a4e53c14f7a68155e0e8f378090d6f6dba7efc88/src/services/api): auth.ts, client.ts, creatorTemplates.ts, adminTemplateReviews.ts.
- [BE Creator routes](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/528b3a144d0cfaea91b9091083c98186f0a89153/src/routes/creatorTemplates.ts), [review routes](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/528b3a144d0cfaea91b9091083c98186f0a89153/src/routes/adminTemplateReviews.ts), [authorization](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/528b3a144d0cfaea91b9091083c98186f0a89153/src/middleware/auth.ts).
- [Persistence model](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/528b3a144d0cfaea91b9091083c98186f0a89153/src/models/HuntTemplate.ts), migrations 016, 018–023, 026–029 and 031.
- [Creator PostgreSQL suite](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/528b3a144d0cfaea91b9091083c98186f0a89153/src/routes/creatorTemplates.integration.test.ts), adminTemplateReviews.integration.test.ts, customExercises.integration.test.ts, checkpointRadius.integration.test.ts, and src/db Local approval/authority suites.
- [CUX-04C evidence](../CUX-04C-creator-regression.md), FE tests/browser and tests/templateRevisions.test.tsx.
- Both repositories' package.json, .env.example and .github/workflows were reviewed. BE config/environment.ts enforces signing configuration.

## Readiness matrix

| Capability | Finding | Remaining gate |
| --- | --- | --- |
| Native Creator/Admin login | Implemented; FE role-specific login, bearer injection, shared refresh flight and rotation | Exercise real login with disposable credentials |
| Backend authority | Access-token type/sub verified; database user reloaded; blocked/retired rejected; guest reduced to participant; persisted roles required | Verify role matrix through HTTP |
| Universal persistence/publication | Create, append version, submit and independent approval; retained publishedVersion | Integrated evidence |
| Local copy and binding | Exact publishedReference copy; independent Local draft, immutable lineage; locality snapshot validation | Active disposable registry fixture |
| Review | Exact submitted_version; classified decisions require inspected version; independent reviewer enforced | Separate reviewer identity |
| Revisions | New immutable rows; retained Universal publication/Local approval distinct from candidate | Compare database snapshots |
| BE integration infrastructure | Vitest/Supertest + PostgreSQL 17 CI; unique suite databases and teardown | Dedicated CREATEDB test service |
| FE browser coverage | Extensive real components with mocked API/Mapbox responses | Add real-login, unmocked product API harness |
| Environments | Workflows define dev FE/BE and production deployments | No verified disposable staging DB or account inventory |
| Mapbox | Public token build setting and intercepted browser fixtures exist | Restricted test-origin token for live-map smoke |

## Existing behavior and dependencies

Creator operations use /api/creator/templates: POST creation with {key,content,category}, GET list/detail, POST /:key/versions with {content,localityId}, and POST /:key/submit with {version}. Copy uses POST /from-universal/:sourceKey with {key,publishedReference:{templateId,version}}. Obtain the reference from the approved Universal library response, never invent its database UUID or use latest candidate version.

Admin uses GET /api/admin/templates/review, GET /:key, POST /:key/approve and /:key/request-changes with {version}. GET /:key?view=approved retrieves retained Local authority while candidate state can differ. Approval records reviewer/version/decision/time atomically without creating content versions.

Locality selection is an active registry UUID, not free text or a Mapbox search result. Save snapshots registry data; submission/approval revalidate binding. Missing locality returns locality_required (400); unavailable locality or changed geography can conflict. Locality proposals and independent Admin decisions already exist in src/routes/localityProposals.ts; a proposal is not immediately a selectable locality. Use an existing active fixture for the minimum journey. Proposal approval is an additional test, not a missing endpoint.

No missing core creation/submission/approval endpoint was identified. Arbitrary historical owner-version reads are not exposed by the owner adapter; use retained approval/library views plus read-only SQL for immutable-history assertions. Do not add an endpoint just for this audit.

BE tests often insert users and sign access tokens directly. They cover authorization and persistence but bypass password login, FE session handling, transport and CORS. They cannot alone satisfy authenticated Creator → FE → BE → DB → Admin acceptance.

## Minimum resources

Minimum full matrix: four reusable disposable identities: Creator A, independent Admin B, Creator C (cross-owner attacks), participant D (wrong-role operations). No account is needed for anonymous requests. A may additionally hold Admin solely to test self-approval denial; B must remain a different user. Guest, blocked and retired variants require additional pre-existing fixtures or separately authorized future isolated fixture setup. Accounts must have working native passwords and active persisted roles; JWT role claims do not grant authority. No accounts were created here.

Required services: Node.js 24, FE Vite/browser, BE Express, PostgreSQL 17, Chromium and a Playwright module. FE package.json does not declare Playwright; existing scripts load an installed module using PLAYWRIGHT_MODULE. Pin its version/browser in CUX-05B rather than relying on an undocumented workstation install.

Configuration names only:

- FE: VITE_API_BASE_URL, VITE_MAPBOX_ACCESS_TOKEN; VITE_DEPLOYMENT_ENVIRONMENT, VITE_DEVELOPMENT_LOCATION_PRESET and VITE_BUILD_SHA for environment/build labeling.
- BE: DATABASE_URL, JWT_SECRET, WEB_ORIGIN, API_HOST, API_PORT, NODE_ENV; JWT_EXPIRES_IN and REFRESH_EXPIRES_IN optional lifetime settings.
- PostgreSQL suites: TEST_DATABASE_URL, with CREATEDB authority only in the isolated test cluster.
- Browser fixture tools: PLAYWRIGHT_MODULE and, where supported, PREVIEW_URL.
- TEDIX_BOOTSTRAP_ADMIN_PASSWORD is an existing bootstrap input, not permission to bootstrap here.
- Deployment-only secrets (not needed for local tests): FE DEPLOY_SSH_KEY_FE, DEPLOY_SSH_KEY_FE_PRODUCTION; BE DEPLOY_SSH_KEY, DEPLOY_SSH_KEY_PRODUCTION.
- AUTH_ABUSE_ENABLED, AUTH_TRUSTED_PROXIES and AUTH_ABUSE_* budgets are existing optional controls; preserve operator policy and record rate-limit interference without disabling shared protections.

Credentials must come from a protected runner secret store. No repository-standard Creator E2E credential variable names were established; choose and document runner-specific bindings during harness implementation. Never place passwords, refresh/access tokens, connection strings or signing keys in reports, traces or PRs.

Fixtures: unique run-prefixed keys; valid location-independent Universal content; valid Personal and Team custom exercises including answers/hints/solutions; one or more normal checkpoints and a terminal FinishPoint; valid geographic configuration and radii; active country/locality with stable coordinates; separate reviewer. Reuse src/test/customExercises.ts and the Creator integration suite snapshot shape as contract examples. Preserve unrelated configuration/scoring and checkpoint identities. No real route safety is certified by synthetic geography.

## Setup and isolation procedure (future authorized execution)

1. Pin both audited SHAs, or explicitly record newly reviewed main SHAs. Install with npm ci in each repo; use Node 24.
2. Operator supplies an entirely disposable PostgreSQL 17 cluster/database and identifies ownership, allowed reset scope and expiry. Confirm host/database identity privately. Never default to the committed development API URL.
3. For a future empty test database only, follow backend CI: apply src/db/pre_migration_baseline.sql, build, then npm run migrate. This report does not run migrations or authorize changes to persistent databases.
4. Configure BE privately using the names above, a securely generated signing key meeting environment.ts validation, exact WEB_ORIGIN, and the disposable DATABASE_URL. Start with npm run dev (or build/start).
5. Configure FE VITE_API_BASE_URL explicitly to that BE. Disable VITE_DEVELOPMENT_LOCATION_PRESET for normal registry fixtures; use a separate Cluj-preset run only if intended. Start npm run dev on a matching origin.
6. Confirm health, version/build provenance, DB target and successful role-specific login. Use isolated browser contexts for A/B/C/D. Do not route-mock product APIs or seed bearer tokens into storage for the acceptance journey.
7. Baseline checks: FE npm run typecheck, npm run build, npm test; BE npm run build and npm test with TEST_DATABASE_URL configured. Assert DB suites ran rather than skipped. No fresh test results are claimed by this audit.
8. Existing BE suites create/drop uniquely named databases; their beforeAll loads baseline/migrations. Full-suite migration tests may reset the supplied database public schema (README warning), so even TEST_DATABASE_URL itself must be disposable. Do not point it at staging or dev data.
9. For browser runs, restore a known disposable database snapshot or drop/recreate only the explicitly owned per-run database after closing pools. Track created database names for crash recovery. Do not bulk-delete shared users or truncate shared schemas. Creator DELETE intentionally refuses approved/reviewed/in-use artifacts; use database lifecycle cleanup rather than weakening deletion rules. Verify cleanup and revoke runner sessions.

Development URLs are configured in workflows: https://tedixhunt-fe-dev.anainfo.ai and https://tedixhunt-be-dev.anainfo.ai. Production targets also exist. These prove configured targets, not their current deployed revision, database isolation or authorized test access. No live environment was mutated or certified by this audit. No dedicated disposable staging environment was established from repository evidence.

Mapbox: use a public pk. token restricted to the test origins with required style/tile access; never supply a secret token to Vite. Permit required Mapbox resources for the live-map smoke. Existing intercepted style/search tests remain deterministic regression checks, separate from live access. Mapbox geography does not establish locality approval or independent proposal evidence.

## Executable acceptance cases

These are ordered manual/API test cases suitable for direct automation in CUX-05B; no new executable test files are included. Each captures status, sanitized JSON, version/key and before/after DB content snapshots. R = /api/creator/templates; Q = /api/admin/templates/review. Successful reads are 200. Check no rows/pins changed after every rejected mutation.

| ID | Action | Expected result |
| --- | --- | --- |
| 01 | A logs in through Creator login; creates Universal via UI and POST R with category universal and valid content v1; save another edit via /versions | 201 per save; unique owned row, immutable v1/v2; no locality; draft, publishedVersion null |
| 02 | A submits exact saved Universal version; B inspects Q/:key and approves with that version | Submit/approve 200; review content equals saved JSON; publishedVersion pins exact approved row; independent reviewer evidence |
| 03 | A selects approved Universal library artifact; POST R/from-universal/:sourceKey with returned reference and new key | 201 Local draft v1; source snapshot copied, lineage pinned; no source mutation or inherited Local approval |
| 04 | A binds registered locality; assigns normal checkpoints, Personal and Team Challenges, terminal FinishPoint and valid geographic configuration; Apply then Save | 201 new version; selected custom exercises, answers, hints, positions/radii and terminal semantics persist |
| 05 | Hard reload and reopen Local via owner list/detail | Same key/version/JSON/locality snapshot and assignment IDs; unsaved editor state is not substituted |
| 06 | Make unsaved edit, verify Submit disabled; save; submit exact returned version n | POST R/:key/submit {version:n} returns 200; submittedVersion n; review shows saved artifact |
| 07 | B inspects exact candidate and POST Q/:key/approve {version:n} | 200; Local approval n, independentEvidence and localityBound true; one matching review row |
| 08 | Compare saved approved JSON/locality and review DB rows before/after reload and attempted stale writes | Approved row unchanged; no in-place mutation; retained approved view resolves n |
| 09 | A appends revision n+1, then submits it; B requests changes, A saves correction and resubmits | Candidate advances independently; old approval n/content/snapshot unchanged throughout; old Universal source also unchanged |
| 10 | B approves corrected candidate | Exact new pin replaces authority only after decision; prior immutable rows/review history retained |

Negative matrix:

| Case | Expected result |
| --- | --- |
| Missing/invalid/expired bearer; refresh token as bearer | 401; no protected data/mutation |
| Participant D/guest calls Creator or Admin operations | 403; UI visibility is not authorization |
| Creator C reads, saves or submits A's private key | 404 owner-scoped result; no leak or write |
| Creator without Admin approves; A with combined Creator/Admin self-approves | 403; self case template_self_approval_forbidden |
| Blocked/retired identity with formerly valid token | 401 after DB account reload |
| Duplicate creation key | 409 template_key_conflict; existing content unchanged |
| Submit older saved version | 409; latest remains unchanged |
| Approve missing/stale classified decision version or obsolete review candidate | 409 template_not_reviewable; no decision/pin change |
| Copy stale publishedReference | 409 stale_published_reference; no destination rows |
| Copy unpublished/non-Universal source | 404; no draft |
| Inject category/owner/origin/lineage on version save | 400; immutable metadata unchanged |
| Malformed exercises, coordinates, radii or content | 400 at validation boundary; no new version |
| Local submission without locality | 400 locality_required |
| Inactive/unavailable locality or changed saved geography | 409 at binding/transition; save a valid refreshed version before retry |
| Missing required checkpoint/FinishPoint configuration | Submission 400; distinguish draft-save tolerance from submission completeness |
| Repeat decision after approval | 409; no duplicate review |
| Network/save failure or concurrent candidate replacement | No false saved/submitted confirmation; reopen authoritative state, require exact version before retry |

Use raw API requests with automatic refresh disabled for explicit 401 assertions; otherwise the FE may correctly refresh and retry. Add expired-token/rotation cases with controlled disposable lifetimes, never log tokens. DB immutability probes, if included, run only in rollback transactions inside the disposable database; ordinary acceptance compares committed snapshots without direct writes.

## Missing prerequisites and effort

| Work | Estimate | Completion evidence |
| --- | --- | --- |
| Operator confirms disposable service/DB, credentials and reset boundary | 0.5–1 day, access dependent | Target ownership, four identity roles and successful native login; no secret values |
| Build real-login browser harness and fixture lifecycle | 1–2 days | Product APIs unmocked, contexts isolated, deterministic fixtures |
| Implement journey and negative/concurrency assertions with SQL comparison | 1–2 days | Saved/submitted/approved JSON and historical rows compared |
| Run, investigate, cleanup and publish sanitized evidence | 0.5–1 day | Logs, versions, failures, cleanup record |

Estimated engineering effort: 3–6 working days after access readiness, excluding product defects discovered during execution and operator wait time. No FE/BE behavior change is currently justified solely by this audit.

CUX-05B remains **BLOCKED** until the target is proven disposable, authorized accounts and live-map test configuration are supplied, harness dependencies are reproducible, and ChatGPT reviews this preparation. Existing backend suites can support the work; they do not remove these execution gates.

**STOP for ChatGPT review. Do not merge or deploy.**
