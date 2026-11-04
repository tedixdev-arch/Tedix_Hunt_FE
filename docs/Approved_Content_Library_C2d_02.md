# C2d-02 Approved Content Library

Base: FE main `36cac6613c65716e23db73b2a218c5b4b6fd86f3`, including merged #174. Backend: merged #120, main `92970d6`.

Creator Content retains Create Content and Library. Library defaults to My Content, with a compact Approved Exercises toggle. My Content retains its existing status, editing, submission, feedback, cloning and Starter behavior. The unused disconnected approved-feed placeholder is removed from the Starter picker.

Approved Exercises requests lightweight metadata through the existing authenticated API client. Compact rows show title, Personal/Team, mechanic, category, grade and shared geographic applicability labels, with Preview as their only action. Another Creator’s content has no authoring route or mutation action in this view.

The existing ContentSelection controls accept a discovery mode: canonical category, every supported Personal/Team mechanic, Mathematics grades 5–12 or explicit Unspecified, literal search, and the existing country/region/city selector. No Main/Unit/Lesson identifiers are invented. Discovery sends filters to the backend and does not filter a downloaded feed locally. City queries send countryCode and geographicId, never admin1Code together; the canonical catalog resolves hierarchy. Failed/mismatched city lookup retains the selection and blocks discovery until retry succeeds.

Preview fetches only the exact listed Content/revision pair through the approved revision endpoint, checks returned identity and approved status, and opens the existing mobile ExercisePreview/shared playable renderer. Hints, solution, LaTeX and real attempts use existing controls. It is labelled read-only; correct answers stay concealed until requested. Retrieval failure never falls back to an own head, a newer revision or a Starter example.

Opaque nextAfter pagination repeats filters and offers Load More. Request generations reject stale list/page/preview results; changing filters immediately hides prior results and starts from page one. Busy refs prevent repeated page and preview clicks. Errors remain distinct from empty results. Refresh search discards an expired/tampered cursor and starts again, while preserving filters. Public messages cover invalid requests, sign-in, role, exact revision unavailable and connectivity failures without exposing backend identifiers or error payloads.

## Verification

- Full FE suite: 43 Node test files and 1,157 React tests passed; no skipped React tests. The new focused suite contributes 45 tests. Worker count was bounded to two without changing test timeouts/assertions.
- Typecheck and production build passed. The existing large-bundle advisory remains.
- 91 merged backend discovery, Content API, domain and migration tests passed against disposable PostgreSQL 17, including cross-Creator access, all 22 mechanics, geography eligibility/exclusions, explicit versus unspecified grades, literal search, immutable approved history, signed cursor validation and access control.
- Real backend Chromium discovery passed at 1440/390/320px: another Creator’s approved feed, exact approved revision despite newer Draft, Personal/Team, Mathematics, region/city eligibility, pagination, empty results, injected service failure and recovery. Successful responses were not mocked.
- Existing real PostgreSQL approval browser regression passed at all three widths: saved revision submission, read-only states, changes feedback/cloning, Team preview, self-review 403 and competing independent Admin decisions with one persisted approval.
- Creator Content regression suite passed after the final picker cleanup (59 tests). Existing persistence browser regression covers save/reload across all 15 Personal and seven Team mechanics, draft revision history, own pagination and ownership.
- [36 inspected screenshots, baseline comparison, logs and reproduction](evidence/c2d-02/README.md).

Mocked FE tests cover pending/duplicate actions, stale search and pagination races, catalog lookup failure/retry, expired/tampered cursor recovery, 400/401/403/404/network errors, revision mismatch refusal, all mechanics, canonical filters and absence of cross-Creator edit controls. Backend integration and successful browser reads are real; UI error injection is explicitly separated from successful integration.

No unrelated baseline test failures remain in completed checks. Browser harness selectors follow the requested Library navigation, and repeated approval-regression runs use unique fixture titles. No assertions were weakened. Backend source is an uncommitted verification checkout under work/; no backend API/database migration, exercise schema, Template/Hunt snapshots, allocation, gameplay, scoring, Mapbox, Organizer or Legacy Template changes are included.

One branch and one Draft PR. Stop for ChatGPT review; no merge or deployment.
