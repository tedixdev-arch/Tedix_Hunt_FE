# Signal Cluj research in Creator geography

Creator Studio reads the existing `content.routeResearch.proposal` from
[BE #65](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/65), merged as
`5ff05031fb8fe8b2b5c044f7c670aa5d90db1eae`. Schema version 1 carries its source
registry, ordered normal/terminal candidates and walking assessment. The FE
does not maintain a landmark catalog or fetch a new API. The test-only fixture
is copied from `src/domain/templates/signalClujRouteProposal.ts` at that merge.

The Proposed Signal Route panel appears in Checkpoint Positions and Final
Checkpoint when the loaded content contains a supported proposal. It displays
CP1–CP6 and terminal FinishPoint, with expandable address, exterior arrival area,
confidence, pending physical verification, unresolved issues and source links.
Walking research includes the Unirii crossing survey, CP5/CP6 separation and
possible discovery-radius overlap, the tower approach, accessibility and field
inspection. These are desk-researched candidates, not verified arrival locations.

Selecting research does not select a gameplay checkpoint. It moves the existing
Mapbox camera only when coordinates are finite, in range, explicitly scoped as
`landmark-reference-only`, marked `arrivalLocation: false`, and refer to a
supporting source in the proposal and candidate. The blue **R** pin is labelled
as a landmark reference. It has no discovery circle, placement action or
confirmation action. Missing or unsupported coordinates display **No researched
reference coordinate available.** The existing Mapbox search remains manual and
moves only the camera; candidate addresses are never automatically geocoded.

Creators select a normal checkpoint (or use the separate FinishPoint editor),
inspect research, choose a public exterior arrival area, deliberately click the
map, review name/coordinates/radius and save. Candidate inspection never changes
positions, radii or temporary session confirmations. It never promotes FinishPoint
to checkpoint 7. Mapbox walking estimates do not certify physical safety.

## Persistence and runtime dependency

The existing content spread and immutable-version save flow retain the original
proposal without rebuilding, flattening or editing it. Research remains separate
from `configuration.checkpointPositions` and `configuration.finishPoint`.
Mission objects, gameplay, Personal/Team Challenges, answers, hints, solutions,
scoring, fictional navigation, starter provenance and unknown research fields are
covered by the save/reload integration test. Journey preview uses authored
geography and retains metadata without making a save or submission request.
Session confirmations still reset on reload and are not physical verification.

Production requires a deployed BE containing #65 and a newly created starter
whose response includes the proposal. Merge is confirmed; deployed starter
responses were not exercised with a live Creator account. Existing drafts do not
receive proposals retroactively. Templates without proposals retain their usual
editors; unsupported proposal schemas remain in saved content but are not rendered.
Real Mapbox inspection/search also requires the existing public Mapbox token and
network access. Tests use the actual BE contract and mocked Mapbox/API responses;
no physical route inspection or live map rendering was performed.

## Validation

Base: current FE `main`, `7b3061fcf5ae2ae0c7975615c208ef8f83612620`.
An initial sandboxed fetch could not reach the proxy. The connector reconstruction
matched main's tree `ffa073e48cb2a6385a1869b4d88626d0dee36abd`; Git fetch then
succeeded with sandbox network access and the feature branch starts directly at
the real main commit.

- Focused research, Creator Mapbox, FinishPoint and save/reload UI tests: 34 passed.
- Research contract checks: 3 passed when executed directly with Node.
- Full `npm test`: 32 passing Node test files, plus 153 Vitest tests in 11 files;
  no failures or skips.
- `npm run typecheck`, `npm run build`, `git diff --check`: passed.
- Build retains Vite's large-bundle warning (main JS approximately 2.57 MB).

No BE, participant runtime, Organizer setup, approval semantics, merge or
deployment changes are included.
