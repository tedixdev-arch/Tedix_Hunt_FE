# Organizer geographic inspection (D8 / Mapbox M2)

Started from FE main `0c9015aa75c0705d86fa4e59e0ee38480acf3ed0`, which merges
G3 PR #82. This is a partial D8 implementation: persisted Hunt snapshot geography
is supported; pre-creation approved Template geography is blocked by the current
metadata-only contract. No backend endpoint or speculative FE API was added.

## Approved Template authority and blocker

Quick Setup continues to select Templates through authenticated
`GET /api/hunt-templates`. Its existing response contains only `key`, `version`,
`displayName`, and `theme`. Backend `src/routes/huntTemplates.ts` and
`src/domain/huntTemplates.ts` confirm this projection. The repository query pins
approved Creator identities to their submitted version, but the Organizer response
does not expose that version's content or configuration. There is no Organizer
approved-version content/detail endpoint in the current contract.

The Mission template & story section now offers a separate **Template to inspect**
chooser and **Inspect Hunt geography** action. Browsing never changes the selected
Competition Template, saves a Template, or creates a Hunt. It shows the exact approved
key/version returned by the catalog and explicitly explains that geographic content
is unavailable. It never treats hypothetical extra catalog fields as an approved
content contract or calls privileged Admin/Creator APIs to bypass this blocker.

Full pre-creation D8 requires a backend-authorized contract exposing the exact approved
key/version's immutable `configuration.normalCheckpointCount`,
`configuration.checkpointPositions[]`, and `configuration.finishPoint`. Defining or
implementing that contract is separate backend work; this PR invents no endpoint.
The existing selection/loading/retry/empty-catalog and Quick Setup save behavior remains.

## Persisted Hunt snapshot authority

`GET /api/hunts/:id` returns `templateKey`, `templateVersion`, and `templateSnapshot`.
Backend `src/routes/hunts.ts` assigns the approved version's complete `template.content`
to the snapshot when selecting a Template, and `src/models/Hunt.ts` reads the persisted
`template_snapshot` without projecting out configuration. The FE snapshot type now
includes optional configuration and optional legacy checkpoint names. Backend OpenAPI
documents only the older snapshot metadata subset; its implementation returns the
complete persisted content. This documentation mismatch is not a missing endpoint.

Backend contract inspection used BE main
`94326226cf735b308a3b4e3ffcafbf6815857a34`:
- [approved catalog route](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/94326226cf735b308a3b4e3ffcafbf6815857a34/src/routes/huntTemplates.ts)
- [metadata projection](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/94326226cf735b308a3b4e3ffcafbf6815857a34/src/domain/huntTemplates.ts)
- [snapshot selection and Hunt GET](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/94326226cf735b308a3b4e3ffcafbf6815857a34/src/routes/hunts.ts)
- [persisted snapshot mapping](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/94326226cf735b308a3b4e3ffcafbf6815857a34/src/models/Hunt.ts)

Saved Hunt review uses its existing refreshed Hunt GET result; the published screen
uses the persisted Hunt response. The existing Hunt details/monitor screen separately
loads the requested Hunt through the same GET. Its simulated monitor locations never
supply geography. Loading/error/retry and stale/wrong-Hunt responses are handled
without hiding existing screen actions.

Before inspection, snapshot key/version must match the Hunt's saved key/version.
Only `templateSnapshot.configuration` is passed to G3. A missing snapshot, absent
configuration, identity mismatch, or invalid/legacy geography produces an explicit
unavailable warning. No catalog version, local setup state, simulated Signal route,
default coordinates, or reconstructed snapshot is substituted. Newer catalog versions
cannot change an existing Hunt's displayed snapshot.

## Shared rendering and read-only behavior

`HuntSnapshotGeographyInspection` uses the existing `HuntMapInspection` and
`HuntMapPreview`. The shared inspection adds an unavailable reason and source label;
the default remains compatible with Admin G3. The existing `inspectHuntGeography`
projection, `TedixMap`, walking-route utilities and metric formatting are reused.
There are no duplicate map frameworks, geographic validators or directions logic.

The preview shows CP1..CPn in saved order, separate terminal FinishPoint, saved names,
coordinates and discovery radii, discovery circles and a dashed straight-line overview.
Mapbox mounts only when opening valid geography. Closing removes resources and aborts
pending directions; reopening starts fresh. Walking estimates require the explicit
**Estimate walking route** action. Missing token/provider failures retain saved details
and never manufacture metrics. Safety/accessibility verification remains separate.

Inspection offers no dragging, position/radius/gameplay editing, approval actions,
Template writes, snapshot writes or Hunt lifecycle operations. Existing explicit
setup, review, publishing and participant-access actions remain outside inspection.
Independent local prototype setup and unrelated monitor prototypes remain as before.

## Verification scope

Organizer DOM tests exercise the real shared preview with mocked Mapbox and directions,
approved identity/contract blocking, selection separation, snapshot GET/save authority,
newer catalog isolation, ordered geographic details, read-only behavior, lazy mounting,
cleanup/reopen/cancellation, missing/invalid legacy geography and token/provider failures.
Existing G3 tests continue to cover Admin artifact authority and decision behavior.
Hunt API tests verify complete snapshot configuration survives the existing GET and
draft-selection responses and that only the Template key is sent by the FE.

Live authenticated backend/Mapbox E2E and real mobile-browser layout checks are not
performed here. Responsive G3 layout is reused. Pre-creation map rendering cannot be
implemented or tested against an authoritative approved-content API until the blocker
above is resolved. D8 remains partial; this PR does not claim deployed verification.
