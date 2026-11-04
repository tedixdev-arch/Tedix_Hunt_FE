# C1.5a — Creator Studio visual correction

Based on `main` at `847898473c4ddc65509cb38fc1aefda9de315cb7` (merged PR #168).

The creation form is centered at a maximum of 720px within the existing 1152px workspace. Content type and Category share a desktop row and stack on mobile. Labels sit above controls with consistent alignment, spacing and weight. The duplicate Content heading is removed, leaving Creator Studio → Create Content as the heading hierarchy.

The existing exercise preview is centered at up to 340px. Within Content, editing-mode controls fit their labels instead of spanning the workspace. These overrides are scoped under `.content-studio`; Template retains its original preview width, shadow and editor-mode presentation. Mobile controls remain usable at 320px. Add Exercise aligns with the form and uses the primary action treatment; Discard session draft is tertiary.

Only presentation and its browser QA fixtures changed. All supported values, classification and geographic behavior, exercise schemas, editor mechanics, contextual pencils, hints, feedback, solutions, LaTeX, navigation, validation and persistence are unchanged. Add Exercise still prepares a session-only draft and explicitly says it is not saved to Library. Unsaved-work protection remains in place. No dependencies or backend changes.

## Verification

- `npm run typecheck`: passed.
- `npm test`: 271 Node tests passed; 51 Vitest files / 959 tests passed.
- `npm run build`: passed, including PWA generation. Existing large-chunk advisory remains.
- `node tests/browser/contentVisual.verify.mjs`: passed at 1440, 768, 390 and 320px. Checks label positioning, responsive field layout, form/preview widths, centered preview, compact mode controls, no page overflow, draft retention, honest preparation, validation and shared Template authoring.
- `node tests/browser/personalVisualEditors.verify.mjs`: 48 scenarios passed.
- `node tests/browser/personalChallengeUX.verify.mjs`: 12 scenarios passed.
- `node tests/browser/teamChallengeUX.verify.mjs`: 28 scenarios passed.

Browser checks use actual React components with explicit mocked API fixtures; they are not authenticated backend integration or live multiplayer tests. Full-page captures use an auto-height test shell so the entire form is visible. The Template comparison uses the shared authoring fixture; broader browser checks also exercise the actual Template editor, save/reload and checkpoint retention.

Actual screenshots were inspected at all four widths, including all required states. A wrapped desktop mode label and screenshots captured before layout settled were corrected before final evidence. No horizontal overflow, overlapping labels or clipped controls were observed in the final captures.

[Side-by-side screenshots](evidence/c1-5a/README.md) · [Check logs and browser results](evidence/c1-5a/checks)

## Reproducing the captures

Run `npm run dev -- --host 127.0.0.1`, then `node tests/browser/contentVisual.verify.mjs`. To recreate the baseline, run the same fixture and script with `--before` against the source at the base commit. The before flag changes the evidence destination and skips assertions about the corrected geometry; all behavioral assertions still run.

Draft PR only. Stop for ChatGPT review; do not merge or deploy.

## Scope correction after review

`personalChallenge.css` now matches the base `main` file exactly. Content-specific canvas width/shadow and compact editor-mode rules live only in `contentStudio.css` under `.content-studio`, including the small-mobile rule. Shared editor behavior is unchanged.

Content and Template were rechecked at 1440, 390 and 320px (also 768px). Pixel comparisons confirm that default Content and Team creation match the prior PR screenshots exactly, while Template Create Your Own in preview and Complex / LaTeX matches the original main screenshots exactly at all three requested widths. Updated Template screenshots replace the earlier after captures. The browser regression asserts Template's original 390px preview limit, full-width mode selector, 48px controls and original weight/shadow, alongside Content's existing geometry assertions.

Follow-up verification: typecheck and production/PWA build passed; 111 relevant tests passed across Content, Personal/Team authoring, visual editing and formula editing. All 60 Personal and 28 Team Challenge browser regression scenarios passed again. See `scope-*` evidence for the follow-up browser results and logs.
