# Creator reference checkpoint camera verification

Started from current main `54993f30ccbaba274132204cbd8c83b0d06a8065` (PR #103).

## Confirmed root cause

Reproduced in Chromium on current main using the actual Signal Overload Template research fixture, its `candidateGps` structure and the existing sourced Signal reference supplements. All seven reference pins rendered at their expected coordinates. Starting at camera `[24, 47]`, zoom 10, clicking CP3 and Show all both left those exact camera coordinates and zoom unchanged.

`RouteEditor.select` sent only draft coordinates to `focusPosition`, although marker rendering already resolved authored coordinates first and Template references second. `TedixMap` explicitly filtered reference pins out of Show all. Thus reference-only locations were available for display but excluded from navigation. Confirmation, stale checkpoint data and React selection identity were not the cause of the reproduced failure. Repeated authored selections already created fresh requests. The former visibility check could skip recentering; explicit selection now always recenters.

## Files changed

- `src/features/creator/RouteEditor.tsx`: selection uses the resolved display pin; the latest explicit camera action supersedes pending earlier actions; the known Signal/Cluj area is available when all locations are missing.
- `src/components/TedixMap.tsx`: Show all includes valid reference and authored pins, including FinishPoint. Existing overlay padding and maximum zoom 16.5 apply. Requests wait for Mapbox/style readiness, run once, and are not overwritten by initial reference fitting or replayed by style switching. Reference pins are amber, authored unconfirmed pins slate, confirmed pins green.
- `tests/creatorMapbox.test.tsx`: replaces authored-only expectations and adds actual Signal Template regressions, authored priority, missing locations, area fallback, repeated navigation, readiness, latest pending action, style switching, unchanged edits/history/confirmation and 15 m defaults.
- `tests/browser/referenceCheckpointCamera.verify.mjs`: seven-location Signal acceptance with real Mapbox GL and Chromium.
- `tests/browser/checkpointCamera.verify.mjs`: existing authored-position browser assertions updated for reference navigation.
- This directory: camera/marker measurements and desktop/mobile screenshots.

Camera actions never call placement, persistence or confirmation callbacks. Reference positions remain provisional. Existing placement/drag, confirm/deselect, search-only navigation, undo/redo and saved-radius regressions remain in place.

## Results

- `npm test`: passed — 35 Node test files and all 263 Vitest tests across 12 files, including 70 Creator Mapbox tests.
- `npm run typecheck`: passed.
- `npm run build`: passed; existing large-bundle warning remains.
- Signal reference browser acceptance: passed at 1280, 768, 390, 360 and 320 px in Map and Satellite modes. From far away, CP3 focuses Saint George statue; panning away and repeating works. CP1 focuses Tailors' Tower and FinishPoint focuses its reference. Show all and repeated Show all display seven locations clear of toolbar/search. Tests inspect actual camera center/zoom, projected marker bounds and the geographic position at the padded camera center. Reference coordinates/status, disabled confirmation and history remain unchanged. Style switching preserves the camera and one map instance, with no page errors or horizontal overflow.
- Existing authored-position browser flow: passed at the same five widths in both modes, covering placement, confirmation/deselection, repeated focus, overview, reduced motion, unchanged geography/history and overlay spacing.

See [browser-measurements.json](browser-measurements.json) for actual camera centers, zooms, projected positions and visibility checks.

## Screenshots

| Width / mode | CP3 focus | Show all seven locations |
| --- | --- | --- |
| Desktop 1280 / Map | [CP3](screenshots/1280-map-cp3.png) | [Show all](screenshots/1280-map-all.png) |
| Mobile 390 / Map | [CP3](screenshots/390-map-cp3.png) | [Show all](screenshots/390-map-all.png) |
| Desktop 1280 / Satellite | [CP3](screenshots/1280-satellite-cp3.png) | [Show all](screenshots/1280-satellite-all.png) |
| Mobile 390 / Satellite | [CP3](screenshots/390-satellite-cp3.png) | [Show all](screenshots/390-satellite-all.png) |

## Live verification limitation

Chromium uses the real Mapbox GL library, WebGL renderer, camera and marker projection. HTTP styles use deterministic background-only fixtures, so screenshots demonstrate camera/marker/UI behavior, not live street or satellite imagery. This environment has no configured live Mapbox token and does not allow Mapbox hosts. Live token authorization, imagery and deployed Template data require a deployed-environment check. No merge or deployment was performed.

Run a local Vite server with `VITE_MAPBOX_ACCESS_TOKEN=test-public-token npm run dev`, then run `PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser/referenceCheckpointCamera.verify.mjs` and `tests/browser/checkpointCamera.verify.mjs`. Chromium defaults to `/usr/bin/chromium`; generated outputs default to `work/`.
