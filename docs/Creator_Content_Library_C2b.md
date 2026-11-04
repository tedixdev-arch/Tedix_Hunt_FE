# Content Library C2b

Creators now save independent exercises through the existing authenticated API client, reopen their own Library drafts after refresh, and append revisions using the current `baseRevisionId`. The shared Personal/Team editor and canonical `toPersistence`/`fromPersistence` conversion remain authoritative. Library identity stays in the response envelope; Template identity is removed from Library payloads without changing the original exercise.

The primary action is Add Exercise or Save Changes. Success and View in Library appear only after backend confirmation. Saving disables duplicate submission and editing controls. Failed requests retain local content. A real 409 retains edits and offers an explicitly confirmed reload. Continuing submitted/approved history clones through the backend revision endpoint; if the following update fails, the cloned head is retained and local work stays dirty. Saving one mechanic does not mark other retained variants as saved.

Library lists the authenticated Creator's draft heads in compact rows with title, mechanic, category, grade, Draft and update time. Existing filters and protected Starter examples remain separate. Pagination follows `nextAfter`; View in Library also retrieves the just-saved draft if it falls outside the first page. Preview retrieves the exact revision. The list is not presented as a complete approved shared feed.

Category supports Mathematics, History, Science and Mixed, with optional classification. Mathematics uses only subject `math` and grades 5–12. Main/Unit/Lesson remain visibly unavailable. Geographic applicability uses existing country, region and GeoNames identifiers; Universal is explicit and default. Reopening city applicability retrieves its display details through the existing read-only city catalog endpoint. Missing catalog details retain the saved identifiers; no specific location is silently replaced by Universal. Backend foreign keys provide authoritative validation.

## Verification and evidence

Typecheck and production build passed. The full FE suite passed 271 Node and 1,063 React tests; the backend Content Library suite passed 49 tests. Existing shared-editor browser checks passed 90 Content/Template scenarios.

See [browser evidence and reproduction](evidence/c2b/README.md). Successful persistence tests use the merged C2a backend and disposable PostgreSQL 16, not a mocked save API. Test actors and the small geography catalog are seeded only in the isolated database. Transport/status failures are explicitly injected only for error UX checks. Unit/UI tests also use mocks for deterministic pending, failed and protected-revision scenarios.

No live development or production database writes, migrations, merge or deployment were performed. Template snapshots, allocation, gameplay, scoring, Legacy Templates and approval workflows are unchanged.

## Remaining C2 dependencies

- Agreed backend identifiers for Main/Unit/Lesson and further subject classifications.
- Canonical Navigation persistence contract; Navigation authoring stays in Templates and unsupported payloads are rejected.
- Exact-revision Admin review and approved shared-library discovery/allocation, outside this change.

STOP at the Draft PR for ChatGPT review. Do not merge or deploy.
