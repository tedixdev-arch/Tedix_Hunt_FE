# Creator checkpoint positioning

Select a checkpoint, click the map or select a search result, inspect and confirm its arrival area, then explicitly save the Template.

- One bottom-anchored teardrop pin per available checkpoint location, numbered 1–6 and terminal F. Authored coordinates take precedence over research coordinates. References remain display-only and unconfirmed.
- Only the active checkpoint moves. Only its selected pin is draggable. Marker selection and drag completion suppress the associated map click.
- Search typing changes no coordinates. Selecting a result positions the active checkpoint; with no selection it only moves the camera. The current coordinates and status appear separately from the search input.
- Reset clears the selected authored coordinates and session confirmation, restores its researched display location, and keeps names and radii in the local editor. It never saves automatically. No reference means Reset is disabled with an explanation.
- The camera fits references once on opening. Selection, placement, confirmation and Reset do not refit. Fit route explicitly fits current display positions.
- No straight-line route overlays in this editor. Existing read-only walking inspection and other map consumers retain their behavior.
- Desktop uses a sticky map beside controls; mobile stacks a 540px search/map area above controls. Search stays above the canvas so it cannot cover pins. Research, arrival notes, safety reminders and the three-step HowTo are expandable.

## Validation

- Focused Mapbox/editor tests: 36 passed.
- Full FE suite: 35 Node test files passed; 192 Vitest tests passed across 12 files.
- Typecheck, production build, and `git diff --check`: passed.
- Chromium preview: seven pins at 1440px and 390px; document width equals viewport width at both sizes.
- Both Signal starters have save/reopen integration coverage, including custom names/radii, confirmed positions, unchanged story/scoring/research, and reference-only draft saves. Resetting saved FinishPoint geography produces an incomplete draft without an invalid or fabricated FinishPoint.

## Screenshots and limits

[Desktop](desktop.png) and [mobile](mobile.png) show the real RouteEditor and Mapbox renderer in a local fixture preview. The Mapbox style response is replaced with a neutral background because live basemap access/token configuration is unavailable. They are not authenticated production screenshots. Live Mapbox search is tested through mocked Search Box API responses.

Confirmation remains a temporary session check under the existing schema; it is not persisted physical-verification evidence. Missing references produce no fabricated pin. Nearby or identical coordinates may overlap until the Creator zooms in. No directions, route distances, backend/schema changes, merge, or deployment are included.
