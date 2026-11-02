Temporary development Hunt setup
===============================

The actual `.github/workflows/frontend.yml` deploy-dev job runs on push to main and uses `npm run build` (Vite production mode). Its existing build step now explicitly sets:

```
VITE_DEPLOYMENT_ENVIRONMENT=development
VITE_DEVELOPMENT_LOCATION_PRESET=cluj
VITE_API_BASE_URL=https://tedixhunt-be-dev.anainfo.ai
```

All three values must match to enable the preset. The production deployment explicitly sets `production`, an empty preset, and the production API URL. The preset cannot activate against that API even if its flag is accidentally set. No mode override or new deployment workflow is needed. `.env.development` is only a local-dev convenience.

After ChatGPT review and the normal approval/merge process (not performed by this PR):

1. Follow BE PR #108's `scripts/development/README.md` in the independently verified development pgAdmin connection. Reuse an existing active Cluj locality or apply the reviewed manual reference only if absent. No BE runtime deployment is needed for that SQL; the normal registry API already supports it. Do not import GeoNames or manufacture approvals.
2. The normal push-to-main FE development deployment builds with the explicit environment above, the existing public Mapbox token, and the build SHA; it syncs the artifact and verifies `version.json`. No repository/environment variable needs to be added manually.
3. After that authorized deployment, check `https://tedixhunt-fe-dev.anainfo.ai/version.json` matches the deployed commit, reload to activate the existing PWA update, sign in as Creator, open Local Hunt Setup, verify Romania / Cluj-Napoca and Mixed / Mixed, Continue, and verify the map centers on Cluj. Save and reopen a draft to verify the real UUID/server snapshot. Existing saved localities remain unchanged.
4. Sign in as Organizer, verify the same geographic defaults and Save & continue. Continue only with a genuinely eligible approved Template in the existing workflow; geography never grants approval or eligibility.

Evidence: `tests/developmentDeployment.test.ts` reads the actual development and production job build values and compiles the preset module with Vite in production mode; it asserts activation for the dev artifact and rejection for production, missing opt-in and the wrong API. UI tests exercise Continue and Cluj map positioning under production mode with the development-deployment values. Full frontend tests/build are also required. No deployed website or database has been changed by this PR.

Retirement: remove `VITE_DEVELOPMENT_LOCATION_PRESET` from deploy-dev and the local development env to restore the normal selector. Reconcile any catalog entry to the existing registered UUID; do not replace saved IDs or approval/version metadata.
