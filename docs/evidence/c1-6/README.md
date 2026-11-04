# C1.6 Navigation mobile preview

Base: `c16d31b` (main, including merged PR #170). FE only; no new dependencies.

## UX result

One automatic, read-only Navigation preview replaces the Creator Note and dark example panels in both Approved component and Create new. Personal, Team and Navigation share `ParticipantPreviewShell`; each retains its own renderer. Navigation uses a 340px maximum width and the existing challenge typography, brand header, palette, borders and mobile treatment.

The preview reacts to the current checkpoint's canonical navigation mode and saved `direction`, `distance`, `navigationClue`, and `nextLocation` strings. Destination falls back to the next configured checkpoint's name (or FinishPoint). Missing readings and clues are explicitly identified. It does not borrow Signal example route data.

Existing selectors, approved options, validation, saved checkpoint fields, Template versions, prototype draft lifetime and FinishPoint disabling remain intact. No changes to maps, geography, route verification, scoring, organizer behavior, APIs or snapshots.

## Verification

- `npm run typecheck`: passed.
- `npm test`: 271 Node tests and 963 Vitest tests passed (52 Vitest files).
- `npm run build`: passed; existing bundle-size warning remains.
- `node tests/browser/navigationPreview.verify.mjs`: actual Chromium, 1440px, 390px and 320px; all passed, no page errors. See [browser-results.json](browser-results.json).
- Existing Personal Challenge browser suite: 12 scenarios passed at 1440, 768, 390 and 320px, no page errors.
- Existing Team Challenge browser suite: 28 scenarios passed at 1440, 768, 390 and 320px, no page errors.
- Final focused regression run: 49 tests passed.
- Regression tests cover canonical navigation modes, omitted/unknown values, data updates, configured compass direction, prototype content, read-only controls and preservation of saved gameplay/configuration/scoring when saving from Create new.

Browser checks use deterministic FE fixtures and mocked persistence, without real accounts or backend writes. They check automatic rendering, every dropdown option, immediate mode changes, switching checkpoints, distinct values retained after Save draft, disabled FinishPoint, Create new instructions and both existing Challenge editors. Horizontal overflow is checked at each capture. Screenshots were opened and inspected, including the 320px compass, wrapped destinations and labels, signal placeholder, prototype instructions and disabled FinishPoint. The selector retains its existing horizontal scrolling; FinishPoint captures scroll that selector to show the disabled item.

Screenshots capture the actual article at the specified width, using an 1800px-high browser viewport so the complete content is visible. Ordinary shorter viewports scroll vertically.

## Evidence

[Before Compass, desktop](before/compass-1440.png) · [390px](before/compass-390.png) · [320px](before/compass-320.png)

[After Compass, desktop](after/compass-1440.png) · [390px](after/compass-390.png) · [320px](after/compass-320.png)

The `after/` directory includes each supported navigation type (compass, landmark, decoded-route, signal-strength, none), unconfigured state, a change back to Compass, checkpoint 2, FinishPoint disabled, Create new and Personal/Team regression captures at all three widths.

## Missing participant-navigation capabilities

The existing Template participant journey only simulates navigation and does not generate bearings, distances or clues. The legacy Signal navigation screen contains sensor access and timed simulated arrival/signal behavior and is unsuitable for read-only reuse. This change reuses the challenge visual shell instead.

No live GPS, device heading, signal readings, verified walking directions, route calculation, arrival detection or participant progress are provided here. The compass shows only an explicitly saved cardinal story direction. Landmark imagery is unavailable through the current checkpoint authoring contract, so it has a labeled placeholder. Signal bars are empty placeholders and never animate. The existing Open in Maps action is visually represented but disabled in this preview. Create new remains a temporary, unsaved prototype.

Stop for ChatGPT review. Do not merge or deploy.
