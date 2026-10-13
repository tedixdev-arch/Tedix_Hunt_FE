# Checkpoint positioning toolbar and history

The map now has one compact toolbar: Undo · Redo | Fit route · Deselect | Confirm position. The selected checkpoint's name, coordinates and session status appear above it. Undo/Redo use identical Lucide undo-2 SVG paths with Redo horizontally reflected. On small screens their text is hidden while accessible labels and tooltips remain. The existing Reset control stays in the expanded checkpoint card, outside the toolbar.

Position history covers CP1–CP6 and terminal FinishPoint through map clicks, drag completion, search-result placement, advanced coordinate edits and the existing reference reset. It stores authored coordinates (including undefined/unpositioned states) and session confirmation. Undo/Redo selects the affected checkpoint and announces it. Names, radii, safety reminders, research and camera state are preserved. Name/radius edits cannot revive stale confirmation through position history. Identical-coordinate placement is a no-op and does not clear confirmation or Redo. A new coordinate change after Undo clears Redo.

Fit route uses the shared map's existing bounds fitting over every visible pin, including reference pins and FinishPoint, without changing data or creating history. Initial fit and stable camera behavior remain. Deselect keeps positions, confirmations and history and returns search to camera-only mode. One green Confirm position button serves normal checkpoints and FinishPoint; reference-only or invalid drafts cannot be confirmed. These operations update local editing state only; saving still requires the existing explicit Template save.

## Actual validation

- Focused editor/Mapbox and Signal integration suite: 50 tests passed.
- Full `npm test`: 35 Node test files passed; 201 Vitest tests passed across 12 files.
- `npm run typecheck`, `npm run build`, and `git diff --check`: passed. Build retains the existing large-bundle warning.
- Chromium browser preview: no page or toolbar horizontal overflow at 320, 360, 390, 768 and 1440px; every toolbar button at least 44×44px; Undo/Redo adjacent at every width; no browser runtime errors. Controls wrap to two rows at 390px and three at 320/360px; one row at 768/1440px in this fixture.

| Requested coverage | Evidence |
| --- | --- |
| Toolbar, mirrored icons, disabled history, centralized confirmation | `tests/creatorMapbox.test.tsx`: toolbar rendering and identical SVG geometry/style assertions |
| Successive Undo/Redo, global history, new edit clears Redo | Seven checkpoint sequence returning to reference-only state and replaying all 14 edits; cross-checkpoint branch test |
| Click, drag, search and coordinate edits | Single-entry click/drag/search checks, drag click suppression, reversible empty/invalid coordinate inputs |
| Selection, pan, zoom, fit, deselect and general search | Camera-only behavior, unchanged data/confirmation/history, current bounds checks; existing initial fit includes FinishPoint |
| Authored-coordinate requirement and confirmation integrity | Reference-only disabled confirmation, movement clears confirmation, Undo restores prior confirmation, Redo captures later session confirmation, metadata safeguards |
| FinishPoint support | Reference/authored/confirmed/undone/redone FinishPoint sequence independent of normal checkpoints |
| Save/reopen and reference safeguards | `tests/signalClujDraft.test.tsx`: both original Signal and Signal Overload save/reopen after Undo/Redo; incomplete/reference-only saves; unchanged research/story/scoring |
| Responsive layout | Real Chromium rectangle/overflow assertions across five widths and screenshots below |

## Screenshots and limitations

[Desktop, 1440px](desktop.png) · [Mobile, 390px](mobile.png)

Screenshots use the actual RouteEditor and Mapbox renderer with existing Signal fixtures. The basemap style response is replaced with a neutral background; these are local component previews, not authenticated production screenshots. Search API behavior is verified with mocked Mapbox responses rather than a live token/service.

History lives for the mounted Checkpoint Positions editor session and is not persisted across leaving/reopening that feature or reloading. Coordinate input changes create individual meaningful history steps; dragging creates one step at dragend. Confirmation is an existing temporary session check, not persisted evidence of physical verification. No backend, schema, Directions, story, scoring or existing Hunt changes are included. No merge or deployment.
