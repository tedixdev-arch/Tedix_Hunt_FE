# Admin Template geographic preview (G3)

The existing Admin review detail offers **Inspect Hunt geography**. Opening mounts
`HuntMapPreview`; closing unmounts its `TedixMap` and aborts pending walking directions.
Reopening starts with no walking estimate. Review decisions remain explicit actions
using the existing authenticated Admin endpoints and backend responses.

## Shared interface and version authority

`HuntMapPreview({ configuration })` accepts the existing Template geography contract,
with no mutation callbacks, service access, or generic map-object schema.
`HuntMapInspection` adds the optional open/close lifecycle. D8 can later pass its
authoritative approved-version or Hunt-snapshot configuration; D8 is not implemented.

Admin passes `review.content.configuration` from
`GET /api/admin/templates/review/:key`, whose `version` is the exact submitted version
under review. No Creator draft request, local working state, Signal coordinates,
alternate Template, new endpoint or persisted preview state is involved.

`inspectHuntGeography` validates count, CP1..CPn numbering and array order, saved names,
coordinates and discovery radii. FinishPoint remains separate and terminal. Invalid
or missing geography produces a warning without sorting, repair or invented locations.
Legacy reviews remain available through their original submitted content; a complete
geographic map requires valid normal geography and FinishPoint.

## Presentation and integrity

TedixMap renders saved numbered markers, discovery circles, a separate FinishPoint,
and dashed straight-line connections fitted to the complete journey. Stop details
show names, coordinates and radii. No placement handler, location search, marker
dragging, gameplay operation, decision action or Template write is exposed by the
preview. Existing review content and checklist remain alongside it.

**Estimate walking route** calls the existing Mapbox walking utility only on demand,
through all normal stops to FinishPoint. Metrics and the blue line come only from a
validated provider response. Token, network and unusable-route failures show an error
without metrics. Human safety and accessibility verification remain separate.

## Validation limits

Automated tests cover artifact authority, invalid/legacy geography, ordering, terminal
role, details, read-only map wiring, resource cleanup, reopen, routing, cancellation,
provider failures and existing explicit review decisions. Responsive wrapping and
minimum-width constraints are checked in DOM tests. Real browser mobile layout and
live authenticated Mapbox/backend E2E verification require deployed verification;
the automated provider tests use mocks. No Mapbox token is bundled with this change.
