# Creator map regression and restoration

Branch base: latest fetched `main`, `9c93ea0` (PR #169). Compared PR #160 (`0ef1bd5`, merge `fdd37f3`) with its parent `40cb60a` and current main. No merge or deployment is authorized by this change.

## Why the map disappeared

Before #160, `HuntSetup.tsx` rendered `CreatorGeographicSelector`, which supplied a real canonical locality and snapshot through `onChange`/`onSelect`. `CreatorStudio.tsx` required `setupReady` before rendering the entire `#checkpoint-positions` section, including `RouteEditor` and `TedixMap`. `setupReady` requires no pending city search, a locality ID, a country-bearing city snapshot, and matching snapshot/locality IDs.

#160 replaced the functional selector with `PrototypeLocationSelector`. Its Romania / Cluj / Cluj-Napoca labels supply no ID, coordinates or selection callbacks. #160 let Continue unlock the builder through `setupContinuation`, but retained the separate `setupReady` render gate around checkpoint positions. A fresh Local Template could reach the builder while the entire map workspace remained absent from the DOM. This is a rendering/authority coupling, not a hidden Mapbox layer, missing stylesheet or zero-height canvas.

Subsequent commit `212f16d` added `resolveCreatorClujLocation` in `clujLocality.ts`. Current main attempts to find/resolve Cluj through the real catalog and verifies the returned active locality ID. That can satisfy `setupReady` when successful, but failure still hides the map. It also leaves the functional selector inaccessible. `RouteEditor` previously used Cluj camera context only for recognized Signal names/proposals; a blank new Local Template would otherwise open at world coordinates if the gate alone were removed.

Inspected `CreatorStudio.tsx`, `HuntSetup.tsx`, `RouteEditor.tsx`, `TedixMap.tsx`, `CreatorGeographicSelector.tsx`, `PrototypeLocationSelector.tsx`, `clujLocality.ts`, checkpoint/FinishPoint and Local binding validation, and associated tests.

## After

- Continue to Template builder → Checkpoints & Challenges displays the existing positioning workspace even when the catalog fails. Locality resolution is no longer a map display prerequisite.
- New unresolved Local Templates opt into the existing `CLUJ_NAPOCA_VIEW` camera constants. Camera context supplies no locality UUID, snapshot, checkpoint coordinates or confirmation. Existing saved positions, proposals and remembered camera state retain priority.
- Hunt Setup exposes the existing canonical geographic selector, including its search, stale-response protections, explicit locality-change confirmation and recovery controls. Choosing it cancels the automatic prototype resolution intent. Saved authoritative locations are displayed instead of unrelated fixed Cluj labels.
- Real catalog selections retain authoritative IDs and coordinates, recentering through the existing camera request path. `clujLocality.ts` and backend contracts are unchanged.
- The same `RouteEditor` remains mounted across Creator sections and features; its pending inspector edits, selection, map mode, confirmation and undo/redo survive. Existing WebGL release/reopen behavior uses session camera memory. There is one active positioning map.
- Mapbox failures expose Retry map. Retry replaces the failed renderer, retaining camera and authored parent/session state; it also permits retry after constructor/WebGL failure. Existing map/search, placement, drag, FinishPoint, route safety and geographic validation remain in use.
- Save, Local binding validation, exact-version submission, independent approval and publication controls are unchanged. A provisional view cannot satisfy canonical locality validation. Draft behavior remains the existing backend contract.
- No Content Library, Personal/Team Challenge, exercise/scoring, Legacy migration, Template snapshot, route proposal or Organizer code was changed.

## Real Chromium evidence

`node tests/browser/creatorMapRestore.verify.mjs` exercises the actual Creator editor and Mapbox GL renderer (no component map mock) at 1440px and 390px. API data is supplied by the existing FE browser fixture; Mapbox style/search responses are controlled. The environment has no Mapbox token binding or Mapbox network allowlist, so these images intentionally show a simple fixture background. They do not establish live imagery/search service availability or live backend save/approval.

Both widths pass: new Local opening/continuation; failed catalog resolution with provisional Cluj camera; search; explicit map placement; draggable pins; undo/redo and confirmation; map/satellite; FinishPoint; route-safety controls; section navigation preserving unsaved coordinates and camera; canonical selector and Paris authoritative centering; existing saved positions; invalid geography blocked from submission; visible Mapbox error and successful renderer retry. Browser page errors: zero.

`BEFORE=1 BASE_URL=http://127.0.0.1:5174 node tests/browser/creatorMapRestore.verify.mjs` against an unmodified main worktree confirms `#checkpoint-positions` is absent at both widths. `before-*.png` captures that state; `after-*.png` captures the restored workspace; `positioned-*.png` shows an unsaved placed pin.

The existing `creatorPositions.verify.mjs` also passes at 1440, 1280, 768, 390, 360 and 320px, including responsive layout, keyboard/touch search, position editing, confirmation and history. A separate older `checkpointCamera.verify.mjs` harness stops before interacting because it tries to scroll to the positions section while Creator is on Setup; the new regression harness explicitly navigates sections and verifies camera restoration.

Reproduce with `VITE_MAPBOX_ACCESS_TOKEN=pk.browser-fixture npm run dev -- --host 127.0.0.1`; the token is a nonfunctional fixture label, never a production credential.

## Automated checks

Typecheck and production build passed. Full `npm test`: 271 Node tests and 959 Vitest tests (51 files) passed. An additional focused regression checks invalid saved camera coordinates without rebinding or authoring geography. Existing tests asserting that missing locality must hide positions or that a saved Paris draft displays Cluj labels were updated to the restored behavior. Canonical persistence and submission tests remain intact.

STOP for ChatGPT review. Do not merge or deploy.

| Width | Before | Restored workspace | Unsaved positioned pin |
| --- | --- | --- | --- |
| Desktop, 1440px | [Before](before-1440.png) | [After](after-1440.png) | [Positioned](positioned-1440.png) |
| Mobile, 390px | [Before](before-390.png) | [After](after-390.png) | [Positioned](positioned-390.png) |
