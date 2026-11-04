# C2c-02 Content approval UX

Base: FE main `c1dae953d11ea33b243c3e8de2b282d678cd5d7a` (merged #173).
Contract and integration target: BE main `a56ae6452f93fa14ba5a7e9c881c063899cb3763` (merged #119), including its OpenAPI route definitions.

Creators save using the existing shared Personal/Team editor, then submit the exact confirmed Content/revision pair. Unsaved edits disable submission; missing categories produce an actionable message. Submitted, approved and archived records open a playable read-only view. My Content requests `view=all`, shows all current statuses and review feedback, and follows the existing Content cursor. Changes Requested starts a cloned Draft directly; Approved offers cloning as a secondary action. Previous feedback remains visible beside the cloned Draft during the editing session. Original revisions and their events are never updated by cloning or saving.

Admin Content Review lives in the existing guarded Admin workspace. Its compact queue follows the backend revision cursor. Opening a row retrieves that exact submitted revision and reuses the student challenge engine. All hints and the solution are inspectable in a collapsed disclosure; answers are not overlaid on the preview. Approve waits for server confirmation. Request Changes opens one comment field and validates the backend's 3–1000 character rule. Neither decision accepts exercise edits. Busy refs block duplicate requests. A 404/409 clears the stale inspection and reloads the authoritative queue. Unknown transport outcomes also recheck the exact submission before another attempt. Self-review controls are disabled when the authenticated identity is the owner; backend 403 remains authoritative.

My Content filters are collapsed initially to keep mobile rows visible. Starter examples and the existing shared-library picker remain independent. A secondary New Exercise action preserves confirmation for unsaved retained mechanic variants. Content and revision UUIDs are confined to API calls, never rendered as ordinary labels.

## Backend operations

- Own heads: `GET /api/creator/content?view=all&limit=20[&after=...]`.
- Submit: `POST /api/creator/content/:id/revisions/:revisionId/submit`, empty object.
- Revise: existing `POST /api/creator/content/:id/revisions`, `{baseRevisionId}`.
- Queue: `GET /api/admin/content/review?limit=20[&after=...]`.
- Inspect: `GET /api/admin/content/review/:id/revisions/:revisionId`.
- Decide: `POST` to that exact revision's `/approve` or `/request-changes`; the latter sends the trimmed comment.

Existing authentication, canonical persistence adapters, optimistic concurrency and append-only Draft saves are reused. No new operations, lifecycle statuses or ownership model were introduced.

## Verification

| Check | Result |
| --- | --- |
| Full FE suite | 271 Node tests and 1,104 React tests passed; none skipped |
| Typecheck / production build | Passed; existing bundle-size advisory remains |
| Merged BE Content API, domain and migration contracts | 60 passed on disposable PostgreSQL 17 |
| Real PostgreSQL browser workflow | Passed at 1440, 390 and 320px; 34 screenshots |
| Existing C2b real persistence regression | Passed, including all 15 Personal and seven Team mechanics |
| Existing shared Personal editor | 90 Content/Template browser scenarios passed; no page errors |
| Existing Creator Studio browser | Passed at 1440, 768, 390 and 320px |
| Existing Admin readable inspection browser | Passed at 1440, 768, 390 and 320px |
| Existing Admin governance browser | Unchanged baseline selector failure; paired logs included |

The new FE tests cover confirmed exact-revision submission, unsaved changes, category validation, protected states, feedback escaping, cloning, every current status, both preview classifications, exact decisions, meaningful comments, duplicate clicks, pagination, 400/401/403/404/409/network failures, and client/backend self-review handling. Existing retained-variant, save failure, stale-save and pagination assertions are retained and extended.

The integrated browser test uses actual merged BE routes and a uniquely named disposable database. It verifies saved payload/revision equality, immutable approved envelopes after cloning, feedback and revised Drafts, Team play, real self-review 403, simultaneous independent Admin decisions returning 200/409, and exactly one persisted approval event. Successful browser persistence and review responses are not mocked. Unit/UI tests use deterministic mocks for pending and error states; transport/status failures are tested without presenting them as successful integration runs.

### Baseline and run notes

`adminGovernance.verify.mjs` times out finding an exact accessible name `Universal`; the unchanged fixture exposes `Universal1` because of its pending badge. It fails at the same selector on unchanged main and this branch. The separate Admin readable-inspection regression and the new integrated Content Review regression pass. No existing timeout or assertion was relaxed to conceal this failure.

One FE run during concurrent browser QA exceeded the existing 5-second timeout in an unrelated Signal Cluj test. The final suite is rerun after source stabilization; no timeout configuration was changed.

[Visual evidence, logs and reproduction](evidence/c2c-02/README.md).

All migrations and data writes in verification target disposable local PostgreSQL only. Backend source, exercise schemas, Template assets/allocation, participant gameplay/scoring, maps/routes, Organizer workflows and Legacy Templates are unchanged. No live database writes, merge or deployment. Stop at the Draft PR for ChatGPT review.

## Pre-merge UX corrections

Exact geographic applicability now resolves country, region and city names from the authoritative catalog with identifier-preserving fallbacks. Approve is hidden during Request Changes; Cancel restores both decisions. [Correction verification and 21 inspected screenshots](evidence/c2c-02/corrections/README.md). Relevant tests (34), typecheck and production build passed.
