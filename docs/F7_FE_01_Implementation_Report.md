# F7-FE-01 — Creator Studio navigation and Mechanics Library

Status: implemented in [Draft PR #123](https://github.com/tedixdev-arch/Tedix_Hunt_FE/pull/123), pending ChatGPT review. Do not merge or deploy. F7 remains partial; Universal/Local creation, full F1/F7 acceptance and D10 remain pending.

## Baseline and scope

Base: latest verified FE `main`, `0fd70935cd7ffa3f9656dfc3eeaadf01de0fa2c1` (PR #122). The initial local checkout was `2173853`; GitHub comparison confirmed only three documentation files changed between those heads. Those exact latest documents were read and synchronized before implementation. Shell fetch failed at the configured proxy; GitHub connector provides the authoritative remote base and delivery.

Read architecture F1/F7 and §20.2, Master Control Plan and Execution Dependency Matrix. This implements only the four-entry navigation/read-only guidance acceptance boundary; no new API or configuration fields.

## Screens, routes and interaction

- `/creator` retains the existing guarded Studio, owned list, counters, loading/empty/error/retry states, edit/view/delete actions and legacy creation/starter chooser. Legacy creation is labeled beside My Templates and is separate from the four cards. No existing Template is reclassified.
- Mechanics Library opens `/creator?studio=mechanics` in the existing native dialog with Back, Escape, focus containment/restoration and browser history support. My Templates focuses and scrolls to the owned-list heading. Old `?studio=universal` and `?studio=local` links no longer open dialogs.
- Universal and Local are subdued noninteractive cards labeled Coming soon, with short descriptions. Local mentions the approved Universal and scratch paths. They have no button/link role, click handler or tab stop. No unavailable-flow modal or Creator-facing implementation identifier remains.
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
- `src/features/creator/CreatorStudioNavigation.tsx`: four cards and read-only Mechanics Library dialog and noninteractive coming-soon cards.
- `tests/creatorStudioNavigation.test.tsx`: behavior, inactive cards/old deep links, read-only browsing, history, focus, loading/retry/session errors and actual Creator route guard tests.
- `tests/signalClujDraft.test.tsx`: scope prior single-dialog assertion to the retained legacy chooser trigger.
- `tests/browser/creatorStudio.html`, `creatorStudio.preview.tsx`, `creatorStudio.verify.mjs`: local-only fixture and reproducible Chromium interaction/layout verification.
- This report and the exact F7-FE-01 row in the Master Control Plan register.

## Verification

- `npm run typecheck`: passed.
- `npm test`: passed; Node runner reports 35 passing test-file entries, zero failures/skips; Vitest reports 281 tests in 14 files, zero failures/skips. Initial run failed one obsolete assertion that only one dialog trigger exists; updated to assert the retained legacy trigger and reran successfully.
- `npx vitest run tests/creatorStudioNavigation.test.tsx tests/creatorTemplateDeletion.test.tsx tests/signalClujDraft.test.tsx`: 58 passed after the UX corrections; the complete suite above includes those cases.
- `npm run build`: passed, including TypeScript and PWA generation. Vite warns about the large existing application bundle (over 500 kB); no build failure.
- `PLAYWRIGHT_MODULE=/opt/codex/cua_node/lib/node_modules/playwright/index.mjs node tests/browser/creatorStudio.verify.mjs`: passed with system Chromium at widths 1440, 768, 390 and 320. Confirmed four cards with only two actionable entries, 4/2/1/1 columns, no page/dialog horizontal overflow, inactive-card clicks open nothing, Tab skips inactive cards, Enter activation, Tab/Shift+Tab containment, Escape and focus restoration, and My Templates focus. Zero browser errors or mutation requests. Initial browser run exposed native dialog focus timing; restoration now runs in a microtask and final browser verification passed. Local screenshots/results are generated under `work/creator-studio-browser/`.
- `git diff --check`: passed.

Browser fixture uses no real account/backend; the Vitest tests render the application's actual guarded `/creator` element and cover guest, unauthenticated, revoked-role and session-bootstrap denial plus list 401/403 and retry behavior. Existing API/auth/legacy/starter suites are included in the complete run. No tests were intentionally skipped. Real-device, deployed, multi-account integration and authoritative runtime acceptance were not performed.

## Review boundary

No backend/database, Admin/Organizer workflow, gameplay runtime, Signal content, persistence contracts, approval/publication rules or architecture sequencing changes. Existing creation remains legacy/unclassified; classified Universal/Local creation and copying/binding remain pending their own slices. No merge, deployment or public activation. Contract/decision and existing backend foundation unchanged; frontend pending review; integrated workflow and deployed E2E unverified.

## UX corrections requested before review

Updated the same Draft PR #123. Before: unavailable creation buttons opened explanatory dialogs and the library used long paragraphs. After: Universal/Local are visibly subdued Coming soon cards; only Mechanics Library and My Templates are interactive. The library uses three direct questions, short lists and one Preview only note, retaining labels from the existing gameplay contract. No tabs, accordions, navigation layers or new dialogs were added.

Correction files: `CreatorStudioNavigation.tsx`, `creatorStudioNavigation.test.tsx`, `creatorStudio.verify.mjs`, this report and the existing F7-FE-01 register row. The page, auth, owned-list and legacy creation code are unchanged by this correction. All requested checks passed with zero failures/skips on this correction run; the build retains its large-bundle warning. Desktop and mobile screenshots were inspected locally. Remaining UX limitation: the library scrolls vertically on narrow screens to keep every supported choice visible; the existing legacy creation workflow retains its separate chooser. No deployed or real-device verification claimed.
