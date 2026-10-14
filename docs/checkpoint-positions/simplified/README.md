# Simplified Creator checkpoint positioning

Based on current main `7032630` (PR #99). The nine-feature sidebar, map above the list/editor, mobile stacking, Arrival verification and Previous / Save & continue remain in place.

The toolbar has only mirrored Undo/Redo icons (44×44px, native tooltips and accessible labels) and blue Deselect. Fit route is absent. Desktop list rows measure 34px; mobile rows measure 44px. Selection uses blue list styling and a blue pin outline; green pin fill and confirmation ticks mean actual session confirmation.

The inspector defaults to Name, Detection radius (meters), Coordinates and Notes as readable values. Pencil Edit opens one local form; Save changes validates and applies to draft state, while Cancel discards staged field changes. Deselect preserves staged edits when the same checkpoint is reselected. Reference coordinates are display-only until explicitly placed or authored. Existing arrival-area notes use the existing research candidate persistence callback; no new schema or research records are introduced. Unrelated research metadata survives save/reopen.

Reset clears authored coordinates and session confirmation without touching names, radii, notes or other checkpoints. It works without a researched reference, and asks for explicit browser confirmation when the checkpoint has saved coordinates (including coordinate clearing through Edit). Reset is reversible through existing global position history. Confirm validates authored coordinates without saving or advancing selection. CP1–CP6 and FinishPoint share these controls.

Both research report sections and Advanced settings are removed from this feature's presentation. Reference data and backend records remain intact. The six Arrival verification checks retain their existing session completion logic.

## Search investigation and verification limits

The existing result callback called `onSearchPosition` **instead of** `flyTo` when a checkpoint was selected. It authored coordinates but never moved the camera. The callback now always moves the camera and only authors coordinates when a selection exists. Typing never authors coordinates; a changed result creates one history entry and never automatically confirms.

Search Box keeps its suggest/retrieve session token and debounced, abortable requests. Suggestions are biased toward the map's supplied geographic context. Results render above the map and toolbar, mouse/touch pointer handling keeps the input focus through result activation, and keyboard navigation supports both arrow directions. HTTP 401/403 and 429 show explicit authorization/rate-limit messages; empty, generic error and malformed-coordinate responses remain visible and never author invalid coordinates.

**No real Mapbox access token is configured in this workspace. Live Mapbox API suggestions, token restrictions, place coverage and results for `piata mihai` were not verified.** There is no evidence here that any production token or API coverage issue is fixed. A token-enabled live check remains necessary before treating the reported production search issue as fully verified.

The browser checks use the actual Creator page, RouteEditor, search component and Mapbox GL renderer with **mocked Mapbox style/search responses and Template API data**. The neutral basemap is intentional. No existing remote Hunt or Template was modified.

## Actual validation

- Full `npm test`: 225 Node tests and 217 Vitest component/integration tests across 12 files passed.
- `npm run typecheck`: passed.
- `npm run build`: passed, with the existing large-bundle warning.
- `git diff --check`: passed.
- Chromium at 1440, 1280, 768, 390, 360 and 320px: no page/main horizontal overflow; original map/list/editor arrangement; three toolbar actions with ≥44px targets; four read-only fields and one Edit form; desktop 34px/mobile 44px rows; absent research sections; six retained Arrival verification checks.
- Browser interactions: keyboard and touch search selection, hit-testable dropdown, typing without authoring, selected placement, camera-only deselected search, confirmation/history restoration, canceled local edits, FinishPoint editing, mobile map tapping and touch marker dragging.
- Component/integration tests cover custom names/radius/coordinate validation, notes save/reopen, saved reset acceptance/cancellation, unsaved reset, Undo/Redo after Reset, confirmation safeguards/restoration and both Signal starter variants.

[Browser measurements](browser-measurements.json) record the actual geometry and page errors.

| Width | View mode | Edit mode |
| --- | --- | --- |
| Desktop 1440px | [View](view-1440.png) | [Edit](edit-1440.png) |
| Laptop 1280px | [View](view-1280.png) | [Edit](edit-1280.png) |
| Mobile 390px | [View](view-390.png) | [Edit](edit-390.png) |

Search dropdown: [Desktop](search-1440.png) · [Mobile](search-390.png).

To reproduce, start Vite with a fixture-only token, then run the existing isolated verifier:

```sh
VITE_MAPBOX_ACCESS_TOKEN=local-preview-token npm run dev -- --host 127.0.0.1
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser/creatorPositions.verify.mjs
```

The verifier intercepts Mapbox requests; this is not a live API check. No backend, API contract, Directions, gameplay, scoring or other Creator feature changes. No merge or deployment.
