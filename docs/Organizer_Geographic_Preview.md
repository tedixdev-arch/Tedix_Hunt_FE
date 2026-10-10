# Organizer geographic inspection (D8 / Mapbox M2)

FE integration starts from current main `77bc77d48d011d145333bffac9cdb20f08677454`,
which includes Organizer preview PR #83 and shared Admin G3 PR #82. Pre-creation
approved geography and post-creation persisted snapshot inspection are implemented.
Deployed authenticated backend/Mapbox E2E verification remains separate.

## Approved Template authority

Quick Setup's authenticated `GET /api/hunt-templates` remains a metadata catalog
(`key`, `version`, `displayName`, `theme`). The separate **Template to inspect** chooser
requests `GET /api/hunt-templates/:key/geography` through the existing authenticated
API client, with an encoded key and abort signal. No version override or privileged
Creator/Admin endpoint is used.

[Merged BE #63](https://github.com/tedixdev-arch/Tedix_Hunt_BE/pull/63) defines the
response `{ key, version, configuration }`. Configuration optionally contains saved
`normalCheckpointCount`, `checkpointPositions` and `finishPoint`; nested points
optionally contain `name`, `latitude`, `longitude`, `radiusMeters`, and checkpoints
also contain `checkpointNumber`. Missing fields stay missing, partial/empty legacy
geography stays partial/empty, and malformed present stored fields return 409.
The merged contract and deployed `/api/docs.json` Swagger were inspected.

Approval is resolved anew on each request. The response must match the exact selected
catalog key **and** version before any geography is passed to the shared preview.
An identity mismatch displays a changed-approval explanation, **Refresh approved
Templates**, and retry. Refresh uses the existing Quick Setup catalog loader; the
Organizer then chooses an identity to inspect again. Retrying the old identity can
never silently accept a newer version. 404 explains missing/withdrawn approval and
offers the same refresh path. 401 asks the Organizer to sign in again, then retry;
409 and other failures explain unavailable geography and allow retry.

Selecting an inspection identity makes no geography request. Clicking **Inspect Hunt
geography** begins the authenticated read-only request; Mapbox mounts only once valid
content is available in the open inspection. Identity
changes remount inspection; close/switch/unmount abort the geography request and
ignore late success or failure. Closing discards loaded content. Reopening fetches
approval again, compares it with the same catalog identity, and starts without route
metrics. Empty approved catalogs and invalid/partial legacy geography are explicit
states, with no inferred coordinates or geographic repairs.

Inspection never changes the Competition Template, saves Organizer setup, creates
or modifies a Hunt, edits approved content, or changes a Template version. Existing
selection/loading/retry/empty-catalog and explicit Quick Setup saves are preserved.

## Persisted Hunt snapshot authority

After creation, only existing Hunt GET/save responses supply geography through
`templateSnapshot.configuration`. Snapshot key/version must match the Hunt's saved
`templateKey` and `templateVersion`. Saved review uses its refreshed Hunt GET;
published review uses the persisted response; Hunt details load the requested Hunt.
Catalog geography is never requested as a replacement for a saved Hunt snapshot,
including when catalog approvals change or saved snapshots are missing/legacy.
Simulated monitor locations and local setup state never supply preview geography.

The snapshot authority inspected in PR #83 is unchanged:
- [snapshot selection and Hunt GET](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/94326226cf735b308a3b4e3ffcafbf6815857a34/src/routes/hunts.ts)
- [persisted snapshot mapping](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/94326226cf735b308a3b4e3ffcafbf6815857a34/src/models/Hunt.ts)

## Shared map lifecycle

Both sources reuse `HuntMapInspection`, `HuntMapPreview`, `inspectHuntGeography`,
`TedixMap`, geographic validation and existing walking Directions utilities.
The inspection shell accepts optional async feedback and an open/close callback;
Admin G3 defaults and persisted snapshot behavior remain compatible.

Valid previews show CP1..CPn, separate terminal FinishPoint, saved names, coordinates,
radii, discovery circles and straight-line overview. No map is mounted for unavailable
or invalid geography. Closing/switching removes Mapbox resources and aborts pending
directions. Walking distance/duration appear only after **Estimate walking route**;
late results and provider/token failures never invent metrics. Preview has no editing
or lifecycle callbacks. Human safety/accessibility verification remains separate.

## Validation and remaining verification

- `npm test`: passed, 30 Node test files and 8 Vitest files / 138 tests, none skipped.
- `npm run typecheck`: passed.
- `npm run build`: passed; existing large-chunk warning remains.
- `git diff --check`: passed.

Coverage includes authenticated API/encoded keys/abort signal, exact identity alignment,
key/version rejection and refresh/retry, 401/404/409, legacy/partial geography, loading,
rapid switching/stale responses, close/unmount/reopen, lazy Mapbox mount and cleanup,
explicit walking estimates and pending-route cancellation, independent selection,
no Hunt mutation, persisted snapshot isolation, Admin G3 and Quick Setup regressions.
DOM tests use the actual shared preview with mocked Mapbox/Directions.

Live authenticated Organizer flows, real Mapbox/Directions and real mobile-browser
layout checks were not performed. Swagger inspection does not establish deployed E2E
verification. No backend, Personal Hunt, participant runtime, GPS, scoring, rewards,
supervisor allocation or other domain implementation is included.
