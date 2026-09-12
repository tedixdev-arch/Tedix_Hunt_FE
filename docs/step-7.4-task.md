# Step 7.4 — Frontend API foundation

## Scoped task

Add a centralized TypeScript API client, public API-base configuration, predictable
errors, and session handling compatible with BE step 7.3. Preserve the approved UI;
real login screen/provider integration is step 7.5. No database credentials in FE.

Implement only the scope described. Do not redesign unrelated modules, introduce
speculative abstractions, or migrate additional prototype functionality unless
explicitly requested.

## Contract and usage

Import the singleton `api` from `src/shared/api`. Construction sends no requests.
The current screens/provider remain prototype code and do not use it until 7.5.

- `api.register({email, password, displayName?})` and `api.login({email, password})`
  return an `ApiUser` and retain the access token only in memory.
- `api.restore()` rotates the HTTP-only refresh cookie and restores identity;
  returns null on 401. Network errors remain errors, not a false successful login.
- `api.logout()` clears memory and requests server revocation. Failure is surfaced;
  the UI must say revocation is unconfirmed and offer retry. The server cookie may
  remain valid after a failed logout; do not claim all sessions are revoked.
- `api.request<T>('/auth/me')` sends a protected request. Generic requests default
  to authenticated; use `{auth: false}` only for public endpoints. This generic
  type is not runtime domain validation; future feature modules validate their data.
- `api.getUser()` / `api.subscribe(listener)` allow a later React provider to consume
  session state. Do not store access/refresh tokens in localStorage/sessionStorage.

Use `VITE_API_BASE_URL=/api` for the proposed same-origin deployment. For local
development against BE, set an ignored `.env.local` to
`VITE_API_BASE_URL=http://localhost:3001/api` and BE `WEB_ORIGIN` to the FE origin.
Rebuild FE to apply configuration changes. Absolute production URLs require HTTPS.
All VITE variables are public browser configuration: never put DATABASE_URL,
PostgreSQL passwords, SSH credentials or JWT secrets here.

Requests include credentials and the required CSRF header on writes. Auth endpoints
are handled only through the serialized methods. API redirects are rejected to avoid
sending credentials to an unintended destination. Paths cannot escape the configured
API base. Errors expose status/code plus safe messages rather than raw server HTML.
The default timeout is 15 seconds; feature requests can pass an AbortSignal.

## Concurrency and retry rules

- Concurrent requests in one singleton share one refresh. A protected GET retries
  once after 401; if another request already refreshed, it uses that newer token.
- Writes are never automatically replayed. A 401 on a write must be handled by the
  feature UI before the user resubmits. Network errors are never automatically retried.
- Login/register/refresh/logout are serialized within the client and through Web
  Locks across same-origin tabs. Instantiate one singleton and configure the same
  API base in all tabs. Without Web Locks, use a single tab for authentication.
- BE rotates access tokens too. One tab refreshing can invalidate another tab's
  in-memory access token; its next GET can recover via the same lock and cookie.
- Logout invalidates pending local authentication results, so a delayed refresh
  cannot restore a locally signed-out session. Failed refresh clears local identity.
- SameSite=Strict requires FE and BE on the same site, preferably via `/api` proxy.
  Authenticated API responses must never be cached by the reverse proxy or PWA.
  The default `/api` path is excluded from the PWA navigation fallback. If deployment
  selects another same-origin API path, update the fallback exclusion accordingly.

## Validation and handoff

Test configuration, request headers, login/register contracts, cookie restore,
single refresh, one-time GET retry, no write replay, logout races/failures, malformed
responses, unsafe paths, cancellation and timeout. Build and review the actual diff
before preparing one FE PR. CI tests the client with controlled HTTP responses;
real FE-to-BE browser login and deployment verification belong to step 7.5.

See [server database handoff](server-database-handoff.md). Deployment remains pending
server access; no database data or server configuration was changed in this step.
