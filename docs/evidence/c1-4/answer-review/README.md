# PR #172 — Close answer configuration by default

All 15 Personal mechanics now share a compact **Edit correct answer** pencil. The closed Edit with Preview canvas shows exercise content without correct-answer lists, selected truth values, accepted answers, tolerance values, mappings or solved constructions. Opening the pencil reveals the existing answer and validation controls. Content and Template continue to use the same authoring components and values.

Number Line range/spacing settings are attached to the visible number line; its default marker no longer reveals the correct target. Matching cards use independent activity columns rather than arranging cards by correct pairs. Memory Card conceals its unrevealed card content and opens recall timing inside the card editor. Hints, feedback and solution remain in their existing collapsed disclosure.

## Audit of all 15 mechanics

| Mechanic | Default content | Creator answer editor |
| --- | --- | --- |
| Tap & Pair | Independent left/right card columns; no correct pairing layout. | Matching choices with atomic swaps; card/pair editing and removal retained. |
| Single Choice | Options without the correct-answer badge. | Correct-option radios; the option pencil also retains its contextual correct-answer action. |
| True / False | Unselected truth choices. | Correct truth value. |
| Memory Card | Concealed recall card. | Accepted answer and case sensitivity; card pencil retains card content and reveal timing. |
| Number Line | Range/marker without target or tolerance. | Correct position, correct value and accepted distance. |
| Multiple Choice | Options without selected correct choices. | Correct-option checkboxes; contextual option actions also retained. |
| Match Columns | Independent columns without correct pairing layout. | Correct matching choices and atomic swaps. |
| Drag & Drop | Items and destinations without assignments. | Item-to-target mappings. |
| Fill in Blank | Questions with blanks, without accepted answers. | All accepted answers and case sensitivity. |
| Sequence | Exercise items without the solved sequence. | Complete correct sequence and reordering controls. |
| Find Mistake | Worked steps and explanation choices, without selected correct IDs. | Incorrect-step and correct-explanation choices. |
| Build Problem | Pieces and available spaces, without construction. | Correct construction, ordering, removal and additions. |
| Number Pattern | Visible pattern with its missing element left blank. | Missing number. |
| Shape Pattern | Visible pattern and shape choices without the selected answer. | Missing shape. |
| Rule Discovery | Examples, rule choices and prediction input without the selected rule/output. | Correct rule and predicted output. |

No exercise schemas, type identifiers, validation semantics, scoring, ownership, persistence or mechanic-variant contracts were changed. Complex / LaTeX retains its existing answer step and fields. Try Challenge still uses the unmodified `ExerciseRenderer` and validation engine. No Predefined preview changes.

## Verification and screenshots

[Every closed/open screenshot](screenshots.md) · [90-scenario results](results.json) · [Check logs](checks/)

- Actual Chromium: **15 mechanics × Content/Template × 1440/390/320px = 90 passed scenarios**. Each captures the initial canvas closed and the corresponding answer editor opened. No overflow or page errors.
- Each scenario also edits content, exercises structural and answer controls, solves the actual exercise, returns to Edit, switches Complex / LaTeX and mechanic variants, and verifies authored/support-content retention.
- **180 closed/open screenshots** plus 15 representative Try Challenge states. All 180 closed/open captures were inspected in mechanic-by-mechanic contact sheets covering both entry points and all widths; all 15 desktop pairs were also opened at larger resolution.
- Added **30 invariance regressions** across all mechanics and both entry configurations: changing only the canonical answer cannot change the closed exercise preview. Existing contextual, structural, formula, validation and persistence tests remain.
- Focused tests, full suite, typecheck and production build passed: **43 Node tests and 1,025 Vitest tests across 53 files**. Build retains the existing large-chunk warning.
- The existing Personal browser suite also passed all 12 scenarios. The extended Personal browser suite also passed all 48 scenarios, including answer editing, validation, save/reload and copied-Template isolation.

## Priority comparisons

The earlier PR screenshots are retained as the before state for this review correction.

| Mechanic | Before correction (320px) | Closed (320px) | Answer editor open (320px) |
| --- | --- | --- | --- |
| Sequence | [Before](../after/template-sequence-edit-320.png) | [Closed](template-sequence-closed-320.png) | [Open](template-sequence-answer-320.png) |
| Number Line | [Before](../after/template-number-line-edit-320.png) | [Closed](template-number-line-closed-320.png) | [Open](template-number-line-answer-320.png) |
| Drag & Drop | [Before](../after/template-drag-drop-edit-320.png) | [Closed](template-drag-drop-closed-320.png) | [Open](template-drag-drop-answer-320.png) |
| Build Problem | [Before](../after/template-build-problem-edit-320.png) | [Closed](template-build-problem-closed-320.png) | [Open](template-build-problem-answer-320.png) |
| Number Pattern | [Before](../after/template-number-pattern-edit-320.png) | [Closed](template-number-pattern-closed-320.png) | [Open](template-number-pattern-answer-320.png) |
| Shape Pattern | [Before](../after/template-shape-pattern-edit-320.png) | [Closed](template-shape-pattern-closed-320.png) | [Open](template-shape-pattern-answer-320.png) |

Browser fixtures use mocked APIs; this is not authenticated live-backend testing. Mobile widths were tested in Chromium, not physical devices or Safari. Long authored collections and expanded answer editors may still scroll vertically; supported fields and limits remain.

**Update to existing Draft PR #172 only. STOP for review; do not merge or deploy.**
