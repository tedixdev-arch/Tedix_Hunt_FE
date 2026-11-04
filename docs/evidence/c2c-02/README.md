# C2c-02 browser evidence

Real Chromium captures at 1440, 390 and 320px. The Creator and Admin pages use the existing workspace shells, shared editor, authenticated client and challenge renderer. All 34 workflow screenshots and nine unchanged-main comparison screenshots were visually inspected; screenshot checks also reject horizontal page overflow. Mobile review has a separate capture of the decisions below the playable challenge.

The comparison led to collapsed My Content filters and feedback retained beside the revised Draft. Category/classification and saved payloads remain intact after submission. Admin solutions remain hidden until explicitly requested.

| State | 1440px | 390px | 320px |
| --- | --- | --- | --- |
| Creator Draft | [Screenshot](creator-draft-1440.png) | [Screenshot](creator-draft-390.png) | [Screenshot](creator-draft-320.png) |
| Submit for Approval | [Screenshot](submit-for-approval-1440.png) | [Screenshot](submit-for-approval-390.png) | [Screenshot](submit-for-approval-320.png) |
| Submitted | [Screenshot](submitted-1440.png) | [Screenshot](submitted-390.png) | [Screenshot](submitted-320.png) |
| Approved | [Screenshot](approved-1440.png) | [Screenshot](approved-390.png) | [Screenshot](approved-320.png) |
| Changes Requested and feedback | [Screenshot](changes-requested-1440.png) | [Screenshot](changes-requested-390.png) | [Screenshot](changes-requested-320.png) |
| Revised Draft with feedback | [Screenshot](revised-draft-1440.png) | [Screenshot](revised-draft-390.png) | [Screenshot](revised-draft-320.png) |
| Admin queue | [Screenshot](admin-queue-1440.png) | [Screenshot](admin-queue-390.png) | [Screenshot](admin-queue-320.png) |
| Admin playable review | [Screenshot](admin-review-1440.png) | [Screenshot](admin-review-390.png) | [Screenshot](admin-review-320.png) |
| Admin review decisions | [Screenshot](admin-review-actions-1440.png) | [Screenshot](admin-review-actions-390.png) | [Screenshot](admin-review-actions-320.png) |
| Request Changes comment | [Screenshot](request-changes-1440.png) | [Screenshot](request-changes-390.png) | [Screenshot](request-changes-320.png) |
| Empty queue | [Screenshot](empty-queue-1440.png) | [Screenshot](empty-queue-390.png) | [Screenshot](empty-queue-320.png) |

[Team review at 320px](admin-team-review-320.png) · [Machine-readable workflow results](results.json).

Unchanged-main comparisons are in `before/`: `creator-{width}.png`, `library-{width}.png` and `admin-{width}.png`. They show the existing Creator layout and Admin Template Review design; Content Review did not exist on main. Baseline Creator screenshots use an empty authentication/template fixture for presentation only.

## Reproduce

1. Install FE dependencies. Clone merged BE #119 into `work/backend`, then run `npm ci` there.
2. Start disposable PostgreSQL 17 on localhost port 55432, user `postgres`, password `c2c-disposable`. Use no live database.
3. Start Vite on localhost:5173.
4. Run `work/backend/node_modules/.bin/tsx tests/integration/content-library/reviewBackend.ts`. It creates a uniquely named database, applies the merged migrations and seeds four isolated actors. It listens on localhost:3002; SIGTERM/SIGINT closes the server and drops only that owned database. Signed test tokens remain in ignored `work/review-actors.json`.
5. Run `C2C_EVIDENCE=work/c2c-reproduction node tests/browser/contentReview.verify.mjs`. This exercises real backend calls through the existing browser API client; no successful save/submission/decision is mocked. The script creates Personal and Team fixtures in the disposable database and tests a real competing-Admin conflict.
6. Run `npm test -- --maxWorkers=2`, `npm run typecheck` and `npm run build`.

Overrides: `C2C_BACKEND`, `C2C_ACTORS`, `C2C_EVIDENCE`, `CHROMIUM_PATH` and `TEST_DATABASE_URL` (local hosts only). The browser harness intentionally routes API traffic to the disposable localhost backend, never the inherited development URL.

## Checks

See `checks/` for the full FE, typecheck/build, PostgreSQL contract, real browser, C2b, Creator and Admin logs, plus the 90-scenario shared-editor results. The Admin governance failure is reproduced on unchanged main; both paired logs are retained. No backend source, live environment, Template snapshot or deployed application was modified.
