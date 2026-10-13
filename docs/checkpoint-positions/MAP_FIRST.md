# Checkpoint Positions — approved sketch layout

Based on current main `a290636` (PR #98). The existing Creator shell, desktop nine-feature sidebar and mobile horizontal feature navigation are restored. No separate full-width Feature 2 shell or expandable feature grid remains.

The active feature follows the supplied text sketch: **Creator sidebar → full-width map → checkpoint list + selected checkpoint editor → safety reminders → Previous / Save & continue**. The map is 500px tall on desktop/tablet and 420px on phones. List and editor sit side by side below the map, stacking below 640px. The screenshots select CP3 · Saint George statue to match the sketch.

Undo/Redo remain adjacent with mirrored icons. All four actions sit compactly at the map's upper edge. Search occupies the upper-left corner; narrow map containers put it on a separate row below the actions so results remain selectable. Detection radius and notes are visible in the inspector. Name, coordinates, research context and Reset position remain in collapsed Advanced settings. One Confirm position action uses the existing validation; its disabled explanation is visible outside Advanced settings.

Notes edit the existing research candidate `arrivalArea` field and save only through the existing Template save controls. No Template contract fields are added. Unrelated research metadata is preserved. Templates without a matching research candidate show a disabled notes field with a contextual explanation; this change does not invent research records for legacy Templates.

Positioning, global checkpoint position history, confirmation restoration, FinishPoint, camera behavior, reference/authored distinction, safety completion and save flow are unchanged. No backend, schema, Directions, gameplay or scoring change.

## Validation

- `npm test`: 35 Node test files and 204 Vitest tests across 12 files passed.
- `npm run typecheck`: passed.
- `npm run build`: passed; existing bundle-size/plugin timing warnings remain.
- `git diff --check`: passed.
- Chromium checked 1440, 1280, 768, 390, 360 and 320px: no page or main horizontal overflow, full-width map above list/editor, side-by-side columns on larger screens, stacked columns on phones, one search field and Confirm action, and at least 44×44px map actions.
- Browser interaction checks cover visible/hit-testable search results, typing without GPS authoring, keyboard search placement, confirmation/history restoration, phone map taps and marker touch dragging, FinishPoint selection, keyboard Advanced settings, and switching to another Creator feature.
- Component/integration tests cover cross-checkpoint and FinishPoint history, reference/authored safeguards, coordinate/radius validation, confirmation invalidation/restoration, Fit route and Deselect behavior, Signal and Signal Overload save/reopen, notes save/reopen, and preserved research/gameplay metadata.

[Actual browser geometry and errors](browser-measurements.json)

## Screenshots and limitations

These capture the **actual Creator page, RouteEditor, Mapbox GL renderer and search component** using the local Signal Overload fixture. **Map tiles/style, Mapbox search responses and Template API data are mocked.** The neutral map background is deliberate. Live Mapbox token/service behavior and authenticated backend persistence are not verified by these captures. No external Template was written during browser checks.

| Width | Actual layout |
| --- | --- |
| Desktop 1440px | [1440.png](1440.png) |
| Laptop 1280px | [1280.png](1280.png) |
| Tablet 768px | [768.png](768.png) |
| Mobile 390px | [390.png](390.png) |
| Extra mobile 320px | [320.png](320.png) |

Search results: [desktop](search-1440.png) · [320px phone](search-320.png).

The captures use tall viewports to show the feature hierarchy, including the standard sidebar/title and safety/save controls. Nearby pins may overlap at narrow scales; the list provides access to every checkpoint and FinishPoint. Position history and confirmations retain their existing mounted-editor/session lifetime. Confirm does not save or advance selection.

## Reproduce

The existing isolated browser fixture is in `tests/browser/creatorPositions.html` and `creatorPositions.preview.tsx`; it is not a production route or build entry. With Chromium and Playwright available:

```sh
VITE_MAPBOX_ACCESS_TOKEN=local-preview-token npm run dev -- --host 127.0.0.1
node tests/browser/creatorPositions.verify.mjs
```

Set `PLAYWRIGHT_MODULE` to an externally installed module's absolute `index.mjs` path and `CHROMIUM_PATH` if needed. The fake token is used only with intercepted mock service responses. The verifier writes the screenshots and measurements above.

No merge or deployment performed.
