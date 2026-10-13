# Map-first Checkpoint Positions workspace

Feature 2 uses a wide Creator shell and a compact, expandable Hunt features menu. All nine features retain their order, completion marks and navigation callbacks; the previous shell and sidebar return on leaving Feature 2.

The desktop workspace allocates approximately 75% of its width to the map and 25% to a compact checkpoint list. Undo · Redo | Fit route · Deselect sit on the map's top edge. Search is a single overlay inside the map. The selected checkpoint has one inspector below the map with the only **Confirm position** action. Name, radius, coordinates, research and Reset position are in a native, initially collapsed Advanced settings disclosure. Selecting another checkpoint collapses it again.

At tablet/phone widths, the checkpoint list becomes a scrollable numbered strip above the map. Map actions move below it; Undo and Redo remain adjacent. The inspector follows, with confirmation above Advanced settings. Controls have 44px minimum touch targets. Reference coordinates remain display-only and cannot be confirmed. Confirmation and edits remain local until an explicit Template save, and confirmation never represents physical safety verification.

Positioning/history, marker dragging, camera fitting, confirmation restoration and persistence callbacks are reused from current main (`c9840f8`). No backend, schema, Directions, gameplay, story, scoring or existing Hunt changes are included.

## Actual validation

- `npm test`: **35 Node test files passed**, plus **202 component tests across 12 Vitest files passed**.
- `npm run typecheck`: passed.
- `npm run build`: passed; existing warning about chunks larger than 500kB remains.
- `git diff --check`: passed.
- Chromium using real CreatorTemplateEditorPage, RouteEditor, location search and Mapbox GL components: no page/main horizontal overflow at **320, 360, 390, 768, 1280 and 1440px**. Desktop map width measured approximately **74.9%** of the workspace. Every map action measured at least **44×44px**; Undo/Redo stayed adjacent.
- Browser interactions: search results were visible and hit-testable above the map at every width; typing kept confirmation disabled; keyboard retrieval positioned the selected checkpoint; confirmation and Undo/Redo restored session status. Real touch taps and selected marker touch dragging authored positions at 390 and 320px. The phone selector reached FinishPoint, Advanced settings opened with Enter, and the feature menu exposed all nine options and restored the standard layout on exit.
- Existing component/integration coverage remains for map clicks, drag click suppression, general search camera-only behavior, Fit route, Deselect, invalid/empty coordinates, reference reset, CP1–CP6 and FinishPoint history, metadata/confirmation safeguards, and save/reopen of original Signal and Signal Overload without changing research, story, scoring or gameplay.

[Browser geometry and error measurements](browser-measurements.json)

## Screenshots and limitations

These are **local browser fixture captures, not production visual verification**. The actual Creator page, editor and Mapbox GL renderer run with the existing Signal Overload research fixture. The basemap style is mocked as a neutral background because no usable Mapbox access token is configured in this environment. Search responses and Template API data are also mocked; live Mapbox service/token and authenticated backend behavior require a token-enabled environment. No external Template was written during browser checks.

| Viewport width | Screenshot |
| --- | --- |
| Desktop 1440px | [1440.png](1440.png) |
| Laptop 1280px | [1280.png](1280.png) |
| Tablet 768px | [768.png](768.png) |
| Mobile 390px | [390.png](390.png) |
| Mobile 320px | [320.png](320.png) |

Search results: [desktop](search-1440.png) · [320px phone](search-320.png).

Pins can overlap for nearby landmarks at narrow map scales, as in the existing map implementation; the numbered strip provides access to every checkpoint, including FinishPoint. History remains limited to the mounted editor session and is not persisted when leaving/reopening Feature 2. Confirmation does not automatically select the next checkpoint.

## Reproduce the browser check

The preview harness is isolated in `tests/browser/creatorPositions.html` and `creatorPositions.preview.tsx`; it is not a production application route or build entry. It renders the full Creator page and substitutes only Template data. The verification script intercepts Mapbox style/search requests and runs all responsive/interaction assertions.

With Playwright and Chromium available, start Vite from the repository:

```sh
VITE_MAPBOX_ACCESS_TOKEN=local-preview-token npm run dev -- --host 127.0.0.1
```

Then run:

```sh
node tests/browser/creatorPositions.verify.mjs
```

For an externally installed Playwright module or Chromium binary, set `PLAYWRIGHT_MODULE` to the module's absolute `index.mjs` path and `CHROMIUM_PATH` to the executable. The script defaults to the `playwright` package and `/usr/bin/chromium`. It writes the screenshots and measurements above. The fake preview token is used only with intercepted mock service responses.

No merge or deployment performed.
