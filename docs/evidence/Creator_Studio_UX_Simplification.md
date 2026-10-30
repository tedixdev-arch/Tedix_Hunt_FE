# Creator Studio UX simplification

30 October 2026 (Europe/Bucharest). Bounded correction within existing Creator Studio scope, prepared for one Draft FE PR and ChatGPT review. No new task ID; frozen reconciliation and all 169 task IDs/order preserved. F7-FE-13 remains incomplete, real integration BLOCKED and deployed acceptance unverified. No merge or deployment.

## Preparation and verified base

Read the Master Execution Plan, frozen reconciliation, F7-FE-01/03–06/07–09/10–12 implementation evidence, G4-FE-01–05/readable-inspection evidence and current F7-FE-13 regression/BE verification request. Inspected CreatorStudio, CreatorStudioNavigation, TemplateCreationChooser, existing API clients, lifecycle/read context, route guards, unit tests and browser fixtures. No AGENTS.md found. Only `tedixdev-arch/Tedix_Hunt_FE` accessed.

Latest GitHub main was `902da16a1897f49ef0ef604e341f941109d6d22a` (#133). Git transport could not connect to the configured proxy; GitHub connector supplied the four documentation changes since local `4cc23da`. Synchronized local baseline tree exactly matches remote tree `57603ff24c158c2b81db12bfb8b4938d0c7f8724`. Delivery commits are rooted in actual remote main; the local documentation synchronization checkpoint is excluded.

## Before / after

| Before | After |
| --- | --- |
| Competition Templates header, four navigation cards, separate Library entry and prominent legacy creation explanation | Creator Studio; “Create and manage Hunt templates.”; one primary “+ Create Template” action and one secondary Library entry |
| Duplicate My Templates card and four large status counters before the list | Owned templates directly below the header/navigation; no counters or extra dashboard widgets |
| Universal/Local entry points exposed alongside compatibility creation | One lightweight native dialog: Universal or Local; Local offers approved Universal or scratch |
| Primary-looking unclassified creation/catalog | Collapsed Legacy compatibility section after the list, with secondary Create Legacy Template entry |
| Empty list only states absence | Empty state directs the Creator to Create Template |

TemplateReadContext and existing actions are reused unchanged: name, Universal/Local/Legacy type, current status/version, submitted/publication/retained approval context, Edit/View/Revise and permitted Delete. No automatic reclassification, loss of records or change to immutable lifecycle. Extra approval context remains truthful rather than inferred from candidate versions. No new filters are needed for this bounded simplification.

## Routing and preservation

- Guarded `/creator` remains the same route. Primary chooser state uses `?studio=create`; Local step uses existing `?studio=local`; other search parameters survive transitions. Browser back/forward restores these views.
- Universal opens existing `/create?category=universal`; scratch Local opens existing `/create?category=local`. Opening or changing choices performs no draft mutation or starter catalog request.
- Approved Universal opens the existing `?studio=library` UniversalLibrary, retaining its selection/detail/copy workflow. Exact `{templateId,version}` publication reference and destination-key behavior are unchanged; no second Library or copy implementation.
- Existing owned records still open `/create?template=<encoded key>`. Existing Creator guard, immutable submitted versions, reviewed revisions, approval and independent Admin rules remain authoritative.
- Existing TemplateCreationChooser, unclassified `/create`, starter catalog/allowlist and starter-copy API remain unchanged and accessible through Legacy compatibility. Existing `?studio=mechanics` deep link remains readable, with no separate top-level Mechanics entry.
- Native dialog provides a named title, initial focus, Tab/Shift+Tab wrap including links, Escape, Cancel, Back between choices and restoration to the connected invoking control. No nested dialog or extra editor.

## Actual verification

- `npm run typecheck`: passed.
- `npm run build`: passed, including PWA generation; existing >500 kB bundle warning remains.
- `npm test`: passed, 42 Node test-file entries and 506 Vitest tests / 31 files, zero failures/skips.
- Focused navigation/legacy/deletion/list run: 94 tests / 4 files passed before final full regression.
- Chromium: updated creatorStudio and localAuthoring, existing universalAuthoring, universalLibrary and creatorCompletion passed at 1440/768/390/320px. [Machine-readable results](Creator_Studio_UX_Results.json).
- Creator Studio browser checks cover empty/loading/error/populated lists, Universal/Local/Legacy labels, hidden secondary compatibility entry, both choice steps, native keyboard/focus wrapping/restoration, Escape, cancellation, actual browser back/forward and no overflow/page errors. No network mutation requests.
- Local browser regression now clicks the Universal entry into the shared editor without creating a draft, and exercises scratch Local save/reopen/locality snapshots plus exact approved Universal copy at version 2. Universal/lifecycle fixtures verify protected submissions, reviewed revisions, retained approval and exact v4 submission. Unit suites retain denial, retry/error, Legacy editing/catalog/deletion and version-protection coverage.
- First full run identified obsolete counter/entry-label assertions; those were updated to verify retained record status and the secondary Legacy entry. Initial socket-bound server execution was denied by the sandbox; permitted localhost/Chromium execution succeeded. Initial browser-history check revealed the old MemoryRouter fixture did not exercise browser history; it now uses BrowserRouter. These initial failures are not claimed as passes.
- Screenshots of empty/populated mobile and Local choice desktop were visually inspected. All screenshots are fixture output, not deployed acceptance.
- `git diff --check`: passed. Baseline and final task IDs/order compared; frozen reconciliation unchanged.

## Deployment and version evidence

Inspected `.github/workflows/frontend.yml`, `vite.config.ts`, `src/buildInfo.ts`, `public/version.json`, API configuration/session clients and committed deployment tests. No infrastructure modified or deployment triggered.

Development deployment runs only after successful validation on a push to main. It builds with dev API `https://tedixhunt-be-dev.anainfo.ai`, injects `VITE_BUILD_SHA`, generates `public/version.json` from GITHUB_SHA and rsyncs dist to deploy@62.238.112.85:/var/www/Tedix_Hunt_FE/dist. It checks the remote file, then public `https://tedixhunt-fe-dev.anainfo.ai/version.json` equals the expected commit and verifies a route marker in the served JS. A Draft branch/PR does not meet the deployment condition. Manual production workflow_dispatch is separate and was not run.

A reliable commit marker mechanism exists for the development deployment when these checks pass. The checked-in marker is `development`; a plain local/production build is not proof of a deployed commit. `buildInfo.ts` defines a VITE_BUILD_SHA fallback but currently has no application consumer, so no in-app commit display is established. The production job does not generate the commit marker or inject the SHA: deployment/version parity is a separate follow-up.

Confirmed FE-owned gap: Workbox excluded version.json from precache but its navigation fallback had no denylist. A service-worker-controlled navigation to an unavailable marker could therefore receive index.html. Added only `/^\/version\.json$/` to navigateFallbackDenylist; deployment regression checks the exclusion and generated `dist/sw.js` contains the denylist. It leaves the marker network-only and does not fabricate commit data. This does not prove the original observed response came from Workbox. An ordinary HTTP request receiving HTML can still indicate missing/stale artifact, reverse-proxy document root or SPA rewrite configuration. That needs a deployment/operator check; no server configuration was changed. Current public FE endpoint is outside this task's configured custom network allowlist and no authenticated deployment/version observation is available. Live deployed commit/endpoint remain unverified.

## One draft versus zero templates: read-only investigation

No screenshots, correlated session identities, environment URLs, request responses or record keys accompanied this request. No configured real Creator/Admin credentials are available. No private storage, tokens, live records or backend data were inspected or modified.

Demonstrated source behavior: the owned list is fetched from `/api/creator/templates` using the configured API base URL and current bearer session. Browser auth is origin-local (`tedix-hunt.session`); different browser profiles/origins/accounts can use different sessions. Loading and list errors are distinct from a successful empty list; 401/403/404 clear cached private cards. Merely opening creation or editing an unsaved draft does not persist a record. The old creatorStudio browser fixture intentionally returned `[]`, while authoring fixtures store synthetic drafts in fixture-only sessionStorage. Thus different fixture screens can intentionally show different counts; this is not evidence about the real backend.

Possible explanations for the reported sessions include account/owner scope, API environment/build differences, an unsaved editor draft versus persisted record, fixture versus live data, or a legitimate list change. None is established as the explanation for those particular screenshots. No data-loss defect demonstrated. Follow-up needs matching FE URL and deployed SHA, API environment, safe account identifiers and owner-list HTTP status/body for each session (without tokens), plus the relevant saved template key/version. Compare those before inferring disappearance. Existing real FE→BE authorization/persistence/independent-review acceptance remains blocked per F7-FE-13; mocked tests do not close it.

Stop for ChatGPT PR review. No backend/API/database/Admin policy/Organizer editor changes, D10 activation, new task, merge or deployment.
