# C1.4 — Contextual Personal Challenge editing

The shared Personal editor now keeps ordinary content editing in the mobile preview. Both Content → Create Content and Template → Personal Challenge → Create Your Own use `PersonalChallengeAuthoring` → `PersonalMechanicEditor`; no independent editor was added.

Audited the existing controls before making changes. Reused their activity/answer updates and stable references. The original three mechanics already had contextual option/card/blank structure controls, so those were retained. Predefined previews, schemas, gameplay, validation semantics, scoring, ownership and persistence were not changed.

## Corrections

- One Title/Instructions surface in Edit with Preview. The original three mechanics retain their common fields exclusively in Complex / LaTeX, backed by the same exercise values.
- Reusable contextual choice/number/structure control with Escape, accessible labels, initial input focus, focus restoration and inline numeric errors. Escape also works when a structural action disables its own focused button.
- Remove/reorder/answer controls live beside the selected card or inside its editor. Add controls remain short and visible. Build Problem spaces and construction additions open contextually.
- Pattern values appear as a compact series. “Make this the blank” and removal appear only inside the selected item. Existing atomic missing-answer transfers remain intact.
- All 15 mechanics share contextual hints, success/failure feedback and solution editing. Hint removal is inside its pencil editor.
- Personal authoring previews use a centered maximum width of 340px, responsive spacing and 44px pencil targets. Styling is scoped to Personal authoring, preserving Predefined, Team and Navigation shells.
- Try Challenge continues to use the existing `ExerciseRenderer` and validation. Draft content remains owned by the existing parent and survives Edit/Try, advanced-mode and mechanic-variant switching.

| Mechanic | Audit outcome / correction |
| --- | --- |
| Tap & Pair | Existing card/pair editing retained; removed duplicate common fields; shared support pencils. |
| Single Choice | Existing option, correct-answer and removal editors retained; same shared corrections. |
| True / False | Existing statement and truth-value controls retained; shared support and sizing. Two truth values are fixed by the mechanic. |
| Memory Card | Existing recall content/answer/timing controls retained; numeric inline validation, shared support and sizing. One recall card is fixed by the mechanic. |
| Number Line | Existing range, spacing, target and tolerance controls retained; contextual numeric validation, shared support and sizing. |
| Multiple Choice | Correct-answer checkboxes and removal moved into each option pencil. |
| Match Columns | Pair removal moved into card editor; matching choice opens beside its visible answer. |
| Drag & Drop | Item/target removal moved into card editors; correct destinations open contextually. |
| Fill in Blank | Existing question/accepted-answer/removal controls retained; duplicate common fields removed; shared support. |
| Sequence | Item removal and answer reordering open contextually; existing answer references retained. |
| Find Mistake | Step/correction removal and correct-step/explanation choices open contextually. |
| Build Problem | Piece removal, spaces, construction reordering/removal and construction additions open contextually. |
| Number Pattern | Compact values, contextual blank/removal, inline numeric edit/validation. |
| Shape Pattern | Compact shapes, contextual blank/removal and correct-shape choice; shape editing retained. |
| Rule Discovery | Input/output examples, example removal, rule removal and correct-rule choice open contextually. |

## Browser verification

[Machine-readable 90-scenario results](after/results.json) · [Complete screenshot index](screenshots.md) · [Verification logs](checks/)

Actual headless Chromium at **1440, 390 and 320px**, every mechanic, both Content and Template: initial Edit, content editing, structural editing, correct-answer configuration, successful gameplay, return to Edit, advanced-mode round trip, hints/feedback/solution retention and mechanic-variant retention. True / False has no variable structure; its fixed answer choices were checked. Memory timing and Number Line range were adjusted as their structural controls. Drag/drop was exercised with pointer drag and the existing accessible destination selectors.

Captured 90 initial states, 90 edited states and 90 solved Try Challenge states, plus nine before captures and seven detailed contextual/validation/LaTeX captures. Inspected all 90 Edit captures in side-by-side desktop images and mobile contact sheets; opened before comparisons, detailed editors and representative Try states at full resolution. No clipped controls, misplaced pencils or horizontal overflow were observed. Build Problem still has the longest editor, but its permanent spaces/removal/reorder clutter is removed.

Existing browser regressions also passed: Personal 12 scenarios, extended Personal 48, Team 28, Creator navigation 4 widths, Content visual/draft protection 4 widths. These include Template save/reload, checkpoint/FinishPoint retention, approved-version editing and copied-Template isolation through the existing mocked persistence fixtures. A real Chromium check also confirmed Journey Preview restores focus with a contextual title editor left open.

## Before / after

| Mechanic | Before (320px) | After (320px) | Contextual actions |
| --- | --- | --- | --- |
| Number Pattern | [Before](before/number-pattern-320.png) | [After](after/template-number-pattern-edit-320.png) | [Selected item](details/pattern-actions-320.png) |
| Build Problem | [Before](before/build-problem-320.png) | [After](after/template-build-problem-edit-320.png) | [Spaces](details/build-spaces-320.png) |
| Match Columns | [Before](before/match-columns-320.png) | [After](after/template-match-columns-edit-320.png) | Matching pencils replace permanent selects. |

Before captures were taken from the main source snapshot including merged PR #171, before this change. Desktop and 390px comparisons are also indexed.

[Option + correct-answer editor](details/option-answer-320.png) · [Inline numeric error](details/inline-number-error-320.png) · [Support editing](details/support-content-320.png) · [Rendered formula](details/formula-preview-320.png) · [LaTeX dialog](details/latex-dialog-320.png)

## Technical checks

Typecheck and production build passed. `npm test -- --maxWorkers=1` passed: 43 Node tests and all 995 Vitest tests across 53 files. Final logs are recorded in `checks/`. The production build retains the existing large-chunk warning. Added 32 focused tests for both entry configurations across all 15 mechanics, hidden structural controls, support/state retention and Escape after a disabling action. Existing boundary, atomic reference, formula, ownership and persistence assertions were retained; tests now open the appropriate contextual editors instead of assuming permanent form controls.

## Remaining limits

- Browser fixtures use deterministic mocked APIs. This is not authenticated live-backend or publication testing; no backend/database writes or deployments were performed.
- Viewports were tested in Chromium, not on physical touch devices or Safari. Accessible fallback selectors remain available for gameplay drag/drop.
- Large authored exercises can still scroll vertically; supported collection limits and fields were preserved.
- True / False and Memory Card retain their fixed cardinalities. Adding different structures would require a separate schema/mechanic change.

**Draft PR only. Stop for ChatGPT review; do not merge or deploy.**
