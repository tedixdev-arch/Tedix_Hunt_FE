# Signal Cluj landmark prefill and provisional map pins

Based on current main `f141235`. The backend's existing
`content.routeResearch.proposal` remains the sole research source. No new
research catalog, backend fields, secrets, Directions requests, or gameplay
changes were introduced.

On Template hydration, missing/default geographic names receive the proposal's
six normal landmark labels and terminal FinishPoint label. Existing positioned
entries (even with a default-looking name), custom labels, coordinates and radii
are retained. Existing app default labels are recognized only during initial
hydration. There is no render-time prefill effect, so subsequent Creator edits
remain authoritative. Research descriptions use `arrivalArea` as read-only
context because geography has no persisted description field. Original research
metadata and approved starter content are never mutated.

A name-only prefilled FinishPoint remains local context until the Creator edits
or places it; it cannot cause an invalid `configuration.finishPoint` to enter a
Save draft payload. Explicit FinishPoint edits still use the existing validation.
Normal unpositioned names likewise have no separate persisted geography field;
they are deterministically prefilled again on reload and are saved with authored
positions through the existing domain configuration builder.

## References and sequence

| Entry | Available on opening | Source |
| --- | --- | --- |
| CP1 Piața Unirii — Matthias Corvinus monument | Unresolved | Research has no coordinates; square address is insufficient to locate the monument |
| CP2 Piarist Church — exterior | Unresolved | Research has no coordinates |
| CP3 Babeș-Bolyai University — main building exterior | Unresolved | Research has no coordinates |
| CP4 Colegiul Academic — exterior | Unresolved | Research has no coordinates |
| CP5 Saint George statue | Unresolved | Research has no coordinates |
| CP6 Reformed Church — exterior | 46.7683841, 23.5955112 | Existing sourced landmark reference |
| F Tailors' Tower — exterior | 46.768014, 23.5975153 | Existing sourced landmark reference |

Amber numbered reference badges are selectable, offset to distinguish them from
green authored arrival pins, and cannot be dragged or confirmed. F references
are square; authored terminal F remains violet. Card, reference, arrival marker
and research selection share the editor's existing active checkpoint state.
Reference selection moves the camera but never writes draft geography. Both
layers are retained when an arrival is placed.

The amber dashed proposed sequence connects adjacent available candidates only.
Initially only CP6 → F is drawn. Missing intermediate candidates break the line;
the legend labels the sequence incomplete and explicitly excludes verified
walking directions. The existing grey authored checkpoint-order line remains
separate. Coordinates are collapsed under Advanced coordinates; radius stays
visible in the selected form. Research notes stay collapsed.

## Optional Mapbox address resolution

The existing public `VITE_MAPBOX_ACCESS_TOKEN` is reused for the supported
[Geocoding v6 forward API](https://docs.mapbox.com/api/search/geocoding/).
This API resolves addresses, not landmark POIs. The explicit **Resolve missing
address references** action uses each candidate's researched address and Romanian
country/Cluj-Napoca context, retaining its landmark name as the display label.
It does not mix POI names into an address-only query or pretend that an address
verifies landmark identity. CP1's unnumbered square remains unavailable.

Only one exact result with matched street, number and place, matching researched
address text, valid coordinates and Cluj context is accepted. Multiple results,
weak matches, wrong addresses/cities, malformed coordinates, unavailable tokens,
timeouts, API errors and rate limits remain unresolved. Accepted results are
clearly labelled **Geocoded address reference · landmark identity unverified**.
Lookups run sequentially, stop on a rate limit and cache successes/failures in
memory for the page session; rerenders and repeat clicks do not repeat requests.
Reloading starts a new session. Nothing is persisted in research or geography.

No live geocoding was used to claim additional reference locations: this
execution environment has no configured public Mapbox token. CP1–CP5 therefore
remain unresolved in the reviewed fixture. Actual address coverage, token scope,
live basemap rendering and browser drag gestures require a token-enabled review.
Mocked API/Mapbox tests verify behavior but do not certify a safe arrival area.

## Validation and screenshots

- Focused research/prefill/geocoding contract tests: 6 passed.
- Full suite: 220 Node tests and 194 Vitest tests passed (12 Vitest files).
- Typecheck, production build and `git diff --check`: passed.
- Build retains the existing large-bundle warning (main JS approximately 2.59 MB).
- Chromium: desktop 1440 px and mobile 390 px, seven cards, no horizontal overflow,
  500/360 px map area, collapsed Advanced coordinates, card/research selection,
  and no browser exceptions.

The screenshots use an isolated RouteEditor with the existing backend research
fixture and actual map-unavailable fallback. They validate layout, not live pins.

| Desktop | Mobile |
| --- | --- |
| ![Desktop editor](desktop.png) | ![Mobile editor](mobile.png) |
