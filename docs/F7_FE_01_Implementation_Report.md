# F7-FE-01 — Creator Studio navigation and Mechanics Library

Status: implemented in a Draft PR, pending ChatGPT review. Do not merge or deploy. F7 remains partial; Universal/Local creation, full F1/F7 acceptance and D10 remain pending.

## Baseline and scope

Base: latest verified FE `main`, `0fd70935cd7ffa3f9656dfc3eeaadf01de0fa2c1` (PR #122). The initial local checkout was `2173853`; GitHub comparison confirmed only three documentation files changed between those heads. Those exact latest documents were read and synchronized before implementation. Shell fetch failed at the configured proxy; GitHub connector provides the authoritative remote base and delivery.

Read architecture F1/F7 and §20.2, Master Control Plan and Execution Dependency Matrix. This implements only the four-entry navigation/read-only guidance acceptance boundary; no new API or configuration fields.

## Screens, routes and interaction

- `/creator` retains the existing guarded Studio, owned list, counters, loading/empty/error/retry states, edit/view/delete actions and legacy creation/starter chooser. Legacy creation is labeled beside My Templates and is separate from the four cards. No existing Template is reclassified.
- Mechanics Library opens `/creator?studio=mechanics`; Universal and Local forthcoming-flow guidance use `?studio=universal` and `?studio=local`. These are native modal dialogs within the same guarded route, with a Back control, Escape, focus containment/restoration and browser history support. My Templates focuses and scrolls to the owned-list heading.
- Universal explicitly says creation is pending F7-FE-03. Local explains approved Universal reuse and independent scratch creation as future paths, with provenance and separate review. Neither screen exposes creation, copy or binding controls.
- Cards use four columns on desktop, two on tablet and one on mobile. Dialogs fit the viewport and scroll vertically.

## Mechanics and inspected source references

| Guidance | Existing source and boundary |
| --- | --- |
| Personal and Team Challenge choices, navigation modes | `src/features/creator/checkpointGameplay.ts` (`supportedGameplay`, hydration/serialization/validation), `CheckpointGameplayEditor.tsx` (`gameplayPresentation`) and `src/data/templateOne.ts` canonical vocabulary. Library labels derive from the same existing choices. No speculative mechanics are added. |
| Checkpoints and FinishPoint | `src/pages/CreatorStudio.tsx` count bounds 1–20, optional Personal/Team choices and terminal role; `checkpointGeography.ts`, `finishPoint.ts`, `FinishPointEditor.tsx` for positions/radii and terminal authoring. |
| Preview, GPS arrival and progression | `ParticipantPreview.tsx`, `participantPreview.ts`: geography and saved activities are inspectable; arrival/completion/progression are manual simulation. No authoritative answer evaluation, location arrival, score, rewards or Hunt progress are recorded. Bearings/distances/clues are not generated. |
| Hints/scoring | Existing Signal content and `GameplayScoring` preserve existing rules; no custom scoring or hint engine is introduced. Authoritative hints/scoring/progression/FinishPoint behavior remains future runtime work. |
| Planned features | Matrix capability boundary: no configurable Shadows/Shields, variable-team compatibility, team allocation/recovery or executable custom mechanics are advertised. Route inspection does not certify safety. |

## Files changed

- `src/pages/CreatorStudio.tsx`: insert navigation, label and reposition existing legacy creation, expose My Templates focus target.
- `src/features/creator/CreatorStudioNavigation.tsx`: four cards and read-only guidance dialogs.
- `tests/creatorStudioNavigation.test.tsx`: behavior, read-only browsing, history, focus, loading/retry/session errors and actual Creator route guard tests.
- `tests/signalClujDraft.test.tsx`: scope prior single-dialog assertion to the retained legacy chooser trigger.
- `tests/browser/creatorStudio.html`, `creatorStudio.preview.tsx`, `creatorStudio.verify.mjs`: local-only fixture and reproducible Chromium interaction/layout verification.
- This report and the exact F7-FE-01 row in the Master Control Plan register.

## Verification

- `npm run typecheck`: passed.
- `npm test`: passed; Node runner reports 35 passing test-file entries, zero failures/skips; Vitest reports 281 tests in 14 files, zero failures/skips. Initial run failed one obsolete assertion that only one dialog trigger exists; updated to assert the retained legacy trigger and reran successfully.
- `npx vitest run tests/creatorStudioNavigation.test.tsx tests/creatorTemplateDeletion.test.tsx tests/signalClujDraft.test.tsx`: 58 passed before the final legacy-button relocation; the final complete suite above includes those cases.
- `npm run build`: passed, including TypeScript and PWA generation. Vite warns about the large existing application bundle (over 500 kB); no build failure.
- `PLAYWRIGHT_MODULE=/opt/codex/cua_node/lib/node_modules/playwright/index.mjs node tests/browser/creatorStudio.verify.mjs`: passed with system Chromium at widths 1440, 768, 390 and 320. Confirmed 4/2/1/1 card columns, no page/dialog horizontal overflow, Enter activation, Tab/Shift+Tab containment, Escape and focus restoration, and My Templates focus. Zero browser errors or mutation requests. Initial browser run exposed native dialog focus timing; restoration now runs in a microtask and final browser verification passed. Local screenshots/results are generated under `work/creator-studio-browser/`.
- `git diff --check`: passed.

Browser fixture uses no real account/backend; the Vitest tests render the application's actual guarded `/creator` element and cover guest, unauthenticated, revoked-role and session-bootstrap denial plus list 401/403 and retry behavior. Existing API/auth/legacy/starter suites are included in the complete run. No tests were intentionally skipped. Real-device, deployed, multi-account integration and authoritative runtime acceptance were not performed.

## Review boundary

No backend/database, Admin/Organizer workflow, gameplay runtime, Signal content, persistence contracts, approval/publication rules or architecture sequencing changes. Existing creation remains legacy/unclassified; classified Universal/Local creation and copying/binding remain pending their own slices. No merge, deployment or public activation. Contract/decision and existing backend foundation unchanged; frontend pending review; integrated workflow and deployed E2E unverified.
