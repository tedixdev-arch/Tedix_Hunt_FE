# Organizer Local event setup

Prerequisites verified merged on 2026-11-03:
- FE #158: `4508ffe60d883f7929d6387368570eee74cfcda4`.
- BE #115: `0dd703571fcf54cedd63e4b913a12cff126dec9f`.

The registered Organizer setup entry uses Location → Choose Hunt → Configure
Event → Review & Create. Independent setup and legacy drafts keep the existing
editor. Saved C7 Local drafts resume event configuration with their persisted
source identity; no latest-version substitution or snapshot migration occurs.

Location uses BE #115 eligible-only geography with opaque cursor pagination.
Only explicit City selection advances. Parent changes clear downstream choices;
request lifetimes prevent late results from replacing current choices. Discovery,
preview and selection use the canonical locality UUID, never names or GeoNames IDs.

Hunt cards use the C7 display name and theme (the available short description).
Preview uses the exact approved version and the existing read-only map component.
Use this Hunt creates a backend draft and captures the exact C7 source. The saved
draft URL is retained if selection fails. Repeated actions reuse the same draft.

Configure exposes supported event fields. Team/four, invitation-only, Easy and
recommended route are verified against the existing options contract. Unsupported
Solo or variable-size gameplay is not offered. Required contact and duration are
retained because backend publishing requires them. Optional duration/timezone
settings are under More options. Rewards reuse the existing persisted allocations
editor; only saved allocations enter review.

Review refreshes the saved Hunt and rewards. Create Hunt revalidates C7 eligibility
through the existing locked selection endpoint before publishing. Stale eligibility
returns to selection and requires an explicit choice. Backend publish errors retain
the draft and review. Success requires a matching published Hunt response. The
participant URL uses only the existing access endpoint's returned code; access
failure offers an independent retry without republishing. No generated code,
simulated success, new backend endpoint, Creator/Admin changes or deployment.

## Validation boundaries

Component integration tests mock the existing API objects and exercise full setup,
errors, eligibility expiry, saved drafts, back navigation and compatibility.
They establish FE orchestration, not a live backend creation claim. The development
geography endpoint responds 401 to unauthenticated requests. This environment has
no authenticated Organizer session or configured login credentials, so live
Romania inventory and persisted creation/sharing require an authorized test session.

Local Chromium browser checks also exercise the mocked API flow at 390×844 and
1440×1000, including final access response and no horizontal overflow in event
configuration. These do not replace authenticated deployment verification.

Final validation:
- Node test runner: 43 test files passed.
- Full UI suite: 44 files / 940 tests passed with
  `npx vitest run --maxWorkers=1 --testTimeout=30000`.
- Focused Organizer suite: 17 tests passed.
- `npm run typecheck`, `npm run build`, `git diff --check`: passed.
- Chromium mocked flow: mobile 390×844 and desktop 1440×1000 passed.

An earlier concurrent full UI run had 14 Creator test failures (timeouts and
following assertion failures). The serial full rerun above passed all tests;
no Creator code or test changes were made. Build retains bundle-size/plugin-time
warnings. No live authenticated end-to-end pass is claimed.
