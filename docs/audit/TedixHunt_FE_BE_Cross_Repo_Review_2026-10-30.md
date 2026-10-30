# TedixHunt FE + BE Cross-Repo Code Review

Oct 30, 2026 · @Tedix

Two problems need fixing first: users get logged out at random (reproduced with a test), and the backend has no rate limiting. Six more findings are places where the frontend and backend disagree.

## Scope

- **Repos:** `tedixdev-arch/Tedix_Hunt_FE` at `a113eb2` and `tedixdev-arch/Tedix_Hunt_BE` at `a7df0f9`, both merged on 30 Oct 2026.
- **Method:** every frontend API call was checked against the backend route it hits. Auth was reviewed on both sides. The logout bug was reproduced with a test.

## Must fix

### 1. Users get logged out at random (reproduced)

The backend's refresh tokens are single-use: `RefreshToken.consume` deletes the token the moment it is used. The frontend client (`client.ts`, `refreshSession`) has no protection against two refreshes running at once.

When the 15-minute access token expires and a page fires two requests in parallel, both get 401 and both refresh with the same token. One succeeds; the other gets `invalid_refresh` and calls `clearSession()`. The reproduction test returned `['fulfilled', 'rejected']` with the session `null` afterwards.

- **Where it hits:** `CustomHuntEditor.tsx:218` and `:455` both use `Promise.all`. Any organizer editing a hunt for more than 15 minutes is logged out on the next load.
- **Fix:** share one in-flight refresh promise across all requests (about 10 lines).

### 2. The backend has no rate limiting

- Login endpoints are open to password brute-forcing.
- Every unauthenticated call to `/api/auth/guest` inserts a user row, and so does a credentialless `/participant/register`. A simple loop can fill the database.
- **Fix:** add `express-rate-limit` on `/api/auth/*` and `/api/hunt-access`, plus a cleanup job for stale guest users.

## Frontend and backend disagree

| # | Finding | Where | Effect |
| --- | --- | --- | --- |
| 3 | Guest name is sent but ignored | FE `ParticipantJoinFlow.tsx:41`; BE `/api/auth/guest` never reads the body | Participant's typed name is silently lost |
| 4 | `registerCreator()` calls `/api/auth/creator/register`, which does not exist | FE `services/api/auth.ts`; test at `tests/api.test.ts:150` | Unused in the UI but returns 404; the mocked test still passes |
| 5 | `/join` ignores the entered code | FE `ParticipantJoinFlow.tsx` checks only length ≥ 4, never calls the backend, shows hardcoded "Signal: Cluj Napoca" | Default code `SIGNAL26` contains `I`, which the BE alphabet excludes, so it can never be real; testers think joining worked |
| 6 | Register with email but no password returns 201 | BE `/participant/register` | Creates an account with no credentials that can never log in; FE blocks it, the API should return 400 |
| 7 | Organizer local-template endpoints have no FE caller | BE `/api/organizer/local-templates`, `/api/hunts/:id/local-template` | Either unfinished or dead code — decide which |
| 8 | Guest sessions last 1 hour with no refresh | BE `/api/auth/guest` | Hunts over 60 minutes will drop guest players mid-game once gameplay is wired |

## Underlying cause

Findings 3 and 4 exist because the two repos share no contract and the frontend tests run against hand-written mocks. The backend already publishes its API description at `/api/docs.json`. Generate the frontend's types from it and add one contract check to CI; that removes this whole class of bug instead of relying on code reading to find it.

## Checked and fine

- Admin routes require the admin role.
- Hunt and reward endpoints check that the caller is the hunt's organizer or supervisor.
- Rewards can only be changed while the hunt is a draft.
- The JWT secret is validated at startup.
- Refresh tokens are consumed atomically on the backend.
- Postgres error details are kept out of responses.
- Hunt access codes have about 10¹² possible values, so guessing them is not practical.

## Not verified

The frontend's node tests pass (235 of 235). The frontend vitest suite, its type-check and all backend tests were not run, because npm install could not reach the package registry from the review environment. Backend CI runs the tests against Postgres, so confirm it is green.

## Next step

- [ ] Fix finding 1 with the reproduction as a regression test (PR on `Tedix_Hunt_FE`; needs push access approved)
