# C2d-02 browser evidence

36 real Chromium screenshots at 1440, 390 and 320px, captured and visually inspected. Successful discovery, exact preview and geographic queries use merged BE #120 with disposable PostgreSQL 17. The API-error screenshot deliberately injects 503; successful responses are not mocked. No horizontal overflow or browser page errors. Existing Creator Studio styling, geography selectors and playable renderer are reused.

| State | 1440px | 390px | 320px |
|---|---|---|---|
| My Content default | [Screenshot](my-content-1440.png) | [Screenshot](my-content-390.png) | [Screenshot](my-content-320.png) |
| Approved Exercises | [Screenshot](approved-list-1440.png) | [Screenshot](approved-list-390.png) | [Screenshot](approved-list-320.png) |
| Playable exact Personal revision | [Screenshot](approved-preview-1440.png) | [Screenshot](approved-preview-390.png) | [Screenshot](approved-preview-320.png) |
| Team selection | [Screenshot](team-1440.png) | [Screenshot](team-390.png) | [Screenshot](team-320.png) |
| Playable Team revision | [Screenshot](team-preview-1440.png) | [Screenshot](team-preview-390.png) | [Screenshot](team-preview-320.png) |
| Mathematics and grade | [Screenshot](mathematics-1440.png) | [Screenshot](mathematics-390.png) | [Screenshot](mathematics-320.png) |
| Region applicability | [Screenshot](location-1440.png) | [Screenshot](location-390.png) | [Screenshot](location-320.png) |
| City eligibility | [Screenshot](city-1440.png) | [Screenshot](city-390.png) | [Screenshot](city-320.png) |
| Load More control | [Screenshot](load-more-control-1440.png) | [Screenshot](load-more-control-390.png) | [Screenshot](load-more-control-320.png) |
| Loaded next page | [Screenshot](load-more-1440.png) | [Screenshot](load-more-390.png) | [Screenshot](load-more-320.png) |
| Empty search | [Screenshot](empty-1440.png) | [Screenshot](empty-390.png) | [Screenshot](empty-320.png) |
| Error and recovery | [Screenshot](error-1440.png) | [Screenshot](error-390.png) | [Screenshot](error-320.png) |

Baseline comparisons from detached FE main `36cac661`: [1440px](before/library-1440.png) · [390px](before/library-390.png) · [320px](before/library-320.png). These use the existing ContentStudio browser harness and the disposable catalog/content data. Comparison confirms the same typography, controls and My Content actions; the disconnected Available Exercises placeholder is replaced by the new browsing tab.

[Machine-readable real discovery results](results.json) · [Verification logs](checks/). Opaque pagination tokens in the results log are redacted. The three Load More control captures were taken in a follow-up read-only pass against the same disposable backend after the approval regression added fixtures.

Reproduction:

1. Run `npm ci` and clone merged BE #120 into `work/backend`; run `npm ci` there.
2. Start disposable PostgreSQL 17 at localhost:55432 with postgres password `c2c-disposable`. Never use a live database.
3. Start FE Vite at localhost:5173.
4. Run `work/backend/node_modules/.bin/tsx tests/integration/content-library/reviewBackend.ts`; it creates and migrates a uniquely named disposable database and isolated actors. Its shutdown handler removes only that database.
5. Run `node tests/browser/approvedContent.verify.mjs`. Override screenshot output with `C2D_EVIDENCE`; actor input with `C2C_ACTORS`. This seeds all 22 mechanics, approves through an independent Admin, creates a newer Draft, then browses as another Creator.
6. Run `npm test -- --maxWorkers=2`, `npm run typecheck` and `npm run build`.

Existing approval and persistence browser checks use the same localhost backend. The persistence harness also requires detached main Vite at :5174 for before screenshots; its baseline button remains My Content while this branch uses Library.
