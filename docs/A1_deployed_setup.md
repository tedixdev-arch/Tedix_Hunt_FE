# A1 — Deployed setup

**Status: verification tools are ready; A1 is not complete.**

The frontend and operator database connection work. The backend currently returns HTTP 503, so its deployed version, database connection and frontend access still need server-side confirmation.

## What was checked

Checked on 14 September 2026, around 19:00 UTC.

- [Frontend](https://tedixhunt.anainfo.ai/): HTTP 200; the browser shows “Welcome back” login. Its HTML references `/assets/index-DfZmO4Lb.js`.
- [Frontend source reviewed](https://github.com/tedixdev-arch/Tedix_Hunt_FE/tree/2364e615d1988b427d7fba65315a585f9c62428b): `src/main.tsx` starts the expanded mockup router. The live entry screen differs. Deployment version, CDN and service-worker state need checking; the cause is not established.
- [Backend health](https://tedixhuntbe.anainfo.ai/api/health), [API schema](https://tedixhuntbe.anainfo.ai/api/docs.json) and anonymous `GET /api/auth/me`: HTTP 503 with HTML, not the expected API JSON. Responses reported server `hcdn`; this does not identify the underlying failure.
- [Swagger page](https://tedixhuntbe.anainfo.ai/api/docs/): previously visible, but a fresh reload also returned 503. The earlier page is not evidence of current health.
- Login CORS preflight: timed out during the checker run. Browser access is **unverified**, not diagnosed as a CORS configuration bug.
- PostgreSQL: a read-only operator connection to `tedix_hunt` succeeded on PostgreSQL 18.6. The four public tables are `users`, `organizations`, `organization_members` and `refresh_tokens`. This does **not** prove the deployed backend uses that database.
- [Backend source reviewed](https://github.com/tedixdev-arch/Tedix_Hunt_BE/tree/6dcc58338fba105e3885439ea9dcf921e7b3d925): version 0.1.0, JWT auth and PostgreSQL models. Its exact deployed commit is unknown.

No accounts, database records, schema or server settings were changed.

## Run the read-only checks

Use Node.js 24 from the FE repository root. No dependency installation is needed.

```sh
node scripts/check-deployment.mjs
node --test scripts/check-deployment.test.mjs
```

For another environment, pass the frontend and backend **origins**, without paths or credentials:

```sh
node scripts/check-deployment.mjs https://frontend.example https://backend.example
```

The checker uses GET and OPTIONS only. It checks frontend HTML, API response shapes, anonymous rejection and the CORS headers needed by the current bearer-token API. It never submits login, sends secrets or changes data. Each request has a ten-second timeout. Exit code 1 means at least one check failed; fix or investigate that result before signing off A1.

An all-pass result is only a public-response check. It does not establish deployed commits, the backend database target, browser cookie behavior or real login. Credentialed cookie checks belong to the agreed A4/A5 contract.

On restricted Windows environments where Node cannot spawn test workers, use:
`node --test --test-isolation=none scripts/check-deployment.test.mjs`.

## Server checks needed from the deployment owner

1. **Backend availability:** inspect hosting/proxy and application logs for the 503. Confirm the upstream process, listener and routing. Record the cause and correction; do not guess a restart command or disable access protection.
2. **Deployed versions:** record the FE and BE release/commit from the actual serving directories or release system. A repository main commit or package version alone is not proof of deployment.
3. **Database target:** confirm the running BE's effective database name and server using its own connection. Verify credentials after reconnect, especially after the password change. Report only non-secret connection details; do not paste `DATABASE_URL`.
4. **Website access:** verify `WEB_ORIGIN` matches `https://tedixhunt.anainfo.ai`, rerun the checker, then observe a request from the actual frontend origin in a browser. Current FE login is still mocked; connecting real login remains A5/A6.
5. **Frontend mismatch:** compare the serving release with the intended FE source. Check CDN/service-worker caching after confirming the deployed files. Do not clear unrelated browser data.

Server-access details and the team's existing deployment instructions were not available for this check.

## Deployment process to record and validate

Use the team's existing process. No deployment automation is present in the reviewed FE tree; the BE workflow validates builds/tests but does not deploy.

The repository commands establish these build steps:
- FE: `npm ci`, then `npm run build`; static output is `dist/`.
- BE: `npm ci`, `npm run build`, `npm test` against a disposable database; runtime entry is `npm start`.
- BE configuration names: `DATABASE_URL`, `WEB_ORIGIN`, `API_HOST`, `API_PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `REFRESH_EXPIRES_IN`, `NODE_ENV`. Keep secret values on the server.

The current BE starts with schema-creation SQL. These commands are **not** an instruction to start it against the shared database during A1. Tracked migrations/readiness are A2; auth changes are A4.

Before A1 sign-off, replace this checklist with the confirmed deployment record:
- [ ] Deployment owner and hosting/release mechanism identified.
- [ ] FE publish directory and exact release selection recorded.
- [ ] BE process manager/service and exact release/restart procedure recorded.
- [ ] Server-side configuration source recorded without secret values.
- [ ] Previous-release rollback procedure recorded.
- [ ] FE mismatch and backend 503 resolved, with evidence.
- [ ] BE database target verified from the running application.
- [ ] Public checks and browser-origin request verified after release.

Do not mark A1 complete or begin A2 server changes solely because this PR is merged.
