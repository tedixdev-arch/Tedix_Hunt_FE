# C1.3c — Automatic Personal Challenge preview

Based on main `dfee617e5e37c758a890214f24478bf6ef9b158e`, including merged #166. New branch; previous PRs are unchanged.

Predefined opens with Tap & Pair selected for browsing and an immediately playable Starter demonstration. This session default never changes the checkpoint assignment. Type changes immediately replace the preview. The existing `ChallengeCanvas` wraps the existing `ExerciseRenderer`, retaining student styling, interaction, hints, solutions and Reset. No renderer, validation or editing system was added.

Random mode shows the first eligible approved backend record as a representative preview, falling back to a labeled Starter demonstration. Specific mode starts with an empty preview and displays the chosen eligible record immediately. Approval, revision, mechanic, category, curriculum and geographic eligibility retain their existing checks. No random allocation is simulated. Pool controls remain session-only.

Template Details now says **Hunt Category** without changing its values or persistence. This initializes the pool filter; users can switch category or choose All categories. If no Template category is supplied, All categories allows approved records from any category. Specific selection controls belong immediately below Exercise allocation; collapsed refinement comes next, followed by the mobile preview. Mathematics retains Grade → Main → Unit → Lesson, disabling unavailable levels. Template location mapping and Universal override are unchanged.

## Verification

- `npm run typecheck`: passed.
- `npm test -- --maxWorkers=2`: passed; Node runner reports 43 test files, Vitest reports 958 tests across 51 files.
- `npm run build`: passed, including PWA generation and precaching. Existing large-chunk warnings remain.
- `node tests/browser/challengeAllocation.verify.mjs`: passed at 1440px, 390px and 320px, exercising all 15 mechanics. No horizontal overflow or browser errors; no preview toggle, pencils, structural editing or Apply action in Predefined. Play and Reset work; checkpoint kind and scoring remain unchanged after browsing.
- `node tests/browser/personalChallengeUX.verify.mjs`: passed 12 full Creator Studio scenarios at 1440px, 768px, 390px and 320px (Tap & Pair, Single Choice, Fill in the Blank). Verified contextual pencil editing, Complex / LaTeX shared drafts, play/reset, Custom apply/save/reopen, checkpoint retention and isolated simulation. [Results](evidence/c1-3c/studio/results.json). The test fixture now mocks auth bootstrap and the existing Cluj catalog resolution; production Hunt Setup was not changed.
- Component regressions cover approved-only selection, invalidation when the pool changes, inherited geography, Universal override, category changes, immediate preview switching, Custom/Legacy preservation and independent Custom copies. Existing serialization and publication gates were not changed; browsing produces no library assignment payload.

Command output is in [checks](evidence/c1-3c/checks/). Browser assertions and timestamps are in [after/results.json](evidence/c1-3c/after/results.json).

## Screenshot comparison

Actual Chromium screenshots use existing production components mounted by browser fixtures. Approved records are explicitly injected test fixtures, never fabricated production library records. Tests perform no live API mutations.

| State | 1440px | 390px | 320px |
|---|---|---|---|
| Before: default, preview hidden | [View](evidence/c1-3c/before/default-random-1440.png) | [View](evidence/c1-3c/before/default-random-390.png) | [View](evidence/c1-3c/before/default-random-320.png) |
| After: default, automatic mobile preview | [View](evidence/c1-3c/after/default-random-1440.png) | [View](evidence/c1-3c/after/default-random-390.png) | [View](evidence/c1-3c/after/default-random-320.png) |
| Tap & Pair / no approved exercise | [View](evidence/c1-3c/after/starter-demonstration-1440.png) | [View](evidence/c1-3c/after/starter-demonstration-390.png) | [View](evidence/c1-3c/after/starter-demonstration-320.png) |
| Switch to Single Choice | [View](evidence/c1-3c/after/type-single-choice-1440.png) | [View](evidence/c1-3c/after/type-single-choice-390.png) | [View](evidence/c1-3c/after/type-single-choice-320.png) |
| Mathematics expanded | [View](evidence/c1-3c/after/mathematics-expanded-1440.png) | [View](evidence/c1-3c/after/mathematics-expanded-390.png) | [View](evidence/c1-3c/after/mathematics-expanded-320.png) |
| Specific empty state | [View](evidence/c1-3c/after/specific-empty-1440.png) | [View](evidence/c1-3c/after/specific-empty-390.png) | [View](evidence/c1-3c/after/specific-empty-320.png) |
| Specific approved fixture | [View](evidence/c1-3c/after/specific-selection-fixture-1440.png) | [View](evidence/c1-3c/after/specific-selection-fixture-390.png) | [View](evidence/c1-3c/after/specific-selection-fixture-320.png) |
| Representative approved fixture | [View](evidence/c1-3c/after/approved-representative-fixture-1440.png) | [View](evidence/c1-3c/after/approved-representative-fixture-390.png) | [View](evidence/c1-3c/after/approved-representative-fixture-320.png) |
| Create Your Own, Edit with Preview | [View](evidence/c1-3c/after/create-your-own-1440.png) | [View](evidence/c1-3c/after/create-your-own-390.png) | [View](evidence/c1-3c/after/create-your-own-320.png) |
| Create Your Own, Complex / LaTeX | [View](evidence/c1-3c/after/create-your-own-latex-1440.png) | [View](evidence/c1-3c/after/create-your-own-latex-390.png) | [View](evidence/c1-3c/after/create-your-own-latex-320.png) |

Visual review compared the hidden-before state with the automatic-after state. The mobile canvas, interaction controls and source label are visible without expanding anything. At 320px allocation choices stack, source labels wrap, and all four curriculum levels remain visible. Predefined contains no editing pencils; the separate Create Your Own screenshots retain them. Saved challenge inspection stays collapsed and separately labeled.

Full Studio screenshots: [Hunt Category](evidence/c1-3c/studio/hunt-category-1440.png), [Predefined at 320px](evidence/c1-3c/studio/tap-pair-predefined-320.png), [Custom editing at 320px](evidence/c1-3c/studio/tap-pair-visual-320.png), [Custom play/reset at 320px](evidence/c1-3c/studio/tap-pair-play-320.png), [Complex / LaTeX at 320px](evidence/c1-3c/studio/tap-pair-guided-320.png).

## Remaining backend dependencies

- An approved exercise feed with stable backend exercise/revision identities and usable category, geography and curriculum metadata.
- A supported allocation contract for random pool settings or a specific approved revision, with save, validation, publication and runtime resolution.
- Canonical curriculum data for unavailable Grade/Main/Unit/Lesson values; no Master level or new IDs were invented.
- Canonical geographic city mapping for saved Template localities whose session mapping is unavailable; existing behavior fails closed and offers Universal.

Library allocation remains unavailable for publication. Existing assignments, versioning, scoring, gameplay, Hunt Setup and geographic registration are unchanged. No backend, API or database changes. STOP for ChatGPT review; do not merge or deploy.
