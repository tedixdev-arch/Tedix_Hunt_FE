# D10 Organizer integration — readiness blocker report

Review date: 30 October 2026 (Europe/Bucharest). Stopped before frontend implementation as requested. Draft for ChatGPT review; do not merge or deploy.

## Decision and governing gate

C7 is implemented and merged in BE #89, main `bcf1fda4153cc8ea787c4d7e5922f4cb4b34ee32`. FE main is `2173853d25cc6564df9efe87d0a872b4987df10d` (#120). The FE plans' claims that C7 implementation has not started are historical and now stale. This does not close the other prerequisites.

[Architecture §20.2](TedixHunt_Prototype_Architecture_Implementation_Plan.md#202-staged-workstreams-before-participant-runtime) explicitly states:

> D10 frontend Organizer integration, subject to the existing Creator/Admin, reviewed catalog, compatibility and readiness gates above.

> Any requirement that gates D10 must be satisfied before that integration/activation; this sequence does not defer a stricter existing prerequisite.

[Control Plan §8](TedixHunt_Master_Implementation_Control_Plan_v3.md#8-next-action) preserves “§20.2's stricter Creator/Admin/compatibility prerequisites.”

Interpretation: this is an integration prerequisite, not only a public rollout gate. No documented exception for a hidden/non-public D10 implementation was found. The task explicitly instructs stopping when such a gate exists. Consequently no hidden route, new feature flag, authorization policy or classified legacy path is introduced.

## Outstanding prerequisites

| Dependency | Evidence and remaining boundary |
| --- | --- |
| Creator F7 category/reuse | Architecture §20.2 rows 3–4 and F7 retain category/community/location FE as pending. CreatorStudio still authors generic content; its subject “Category” field is not Universal/Local classification. Required category/reuse/location flows are not integrated. |
| Admin G4 review | §20.2 row 5 requires category-specific review after representative Creator submissions, exact Local route/evidence and validity/operating conditions. Generic exact review/geographic inspection and BE independent approval are foundations, not completion of this gate. |
| Catalog/compatibility rollout | Row 6 requires reviewed Local catalog, compatibility rollout and geography contracts. C7 implements exact Local selection integrity, while explicit legacy transition/staged activation remains unresolved in §20.2. No waiver or completed rollout decision was found. |
| G4 safety/readiness | Evidence quality, validity/expiry/re-review, operating conditions and publish/start policy remain incomplete. C7 eligibility is not physical safety certification. The plan requires any applicable D10 prerequisites to be resolved before integration. |
| Provider persistence | C6b-2 Mapbox permanent storage entitlement remains unresolved. Stored/manual catalog APIs can avoid that provider dependency; this alone does not block a future stored/manual implementation. No temporary provider result may be persisted through that path. |
| Pilot and deployed acceptance | Control Plan G0–G6 and architecture §20.3 remain unchanged. No parallel pilot approval, current deployment acceptance or supply-chain E2E is established by this review. These rollout gates are separate from the integration stop above. |

Resume only after review records satisfaction of the applicable prerequisites or explicitly revises their scope for a bounded non-public integration. This report does not grant an exception or introduce a new approval process.

## Verified merged API shapes

Inspected BE main C7 contract, implementation report, routes/organizerLocalTemplates.ts, models/OrganizerLocalTemplate.ts, domain/huntTemplates.ts and routes/geography.ts. References: [C7 contract](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/bcf1fda4153cc8ea787c4d7e5922f4cb4b34ee32/docs/C7_Organizer_Local_Template_Eligibility_Contract.md), [implementation report](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/bcf1fda4153cc8ea787c4d7e5922f4cb4b34ee32/docs/C7_Implementation_Report.md), [routes](https://github.com/tedixdev-arch/Tedix_Hunt_BE/blob/bcf1fda4153cc8ea787c4d7e5922f4cb4b34ee32/src/routes/organizerLocalTemplates.ts).

- GET /api/geography/countries returns { countries: [{ code, displayName }] }.
- GET /api/geography/localities requires countryCode and nonempty trimmed q (input maximum 100 characters), returns { localities, providerStatus: 'not_requested' }, at most 50 active stored records. It is search, not an unfiltered locality list. Exact GET /api/geography/localities/{id} can return inactive records.
- GET /api/organizer/local-templates requires uppercase two-letter countryCode and locality UUID. Optional limit is 1–50 (default 20); cursor is opaque and filter-scoped. Returns { templates, nextCursor }. Metadata is templateId, key, version, displayName, theme, localityId, localitySnapshot.
- GET /api/organizer/local-templates/{templateId}/versions/{version} requires the same geography filters. Returns metadata plus configuration and separate currentLocality. It only resolves the currently eligible exact approval, not arbitrary historical versions.
- Geographic configuration allowlist: normalCheckpointCount; checkpointPositions with checkpointNumber, name, latitude, longitude, radiusMeters; finishPoint with name, latitude, longitude, radiusMeters. No gameplay answers, private review evidence, provenance or suspension reasons.
- Saved localitySnapshot contains id, countryCode, countryDisplayName, name, administrativeContext, latitude, longitude. Current locality is separate and includes active; never replace saved labels with current registry labels.
- PUT /api/hunts/{id}/local-template accepts exactly { templateId, version, countryCode, localityId }; version is a positive integer up to 2147483647. Returns the authorized Hunt with additive templateId, templateLocalityId, templateLocalitySnapshot and existing server source snapshot. Active non-guest Organizer plus Hunt-specific organizer authority and draft status are required. No client snapshot or templateKey selection for classified content.
- GET failures: 400 invalid_input (including unsupported country), 404 not_found (including missing/wrong-country locality and indistinguishable unavailable/stale details), 409 locality_unavailable; 401/403 authorization. PUT additionally returns 409 invalid_hunt_state, template_not_eligible, template_selection_stale, locality_geography_changed. Do not disclose suspension/private reasons from an ambiguous 404.
- All C7 responses are private/no-store. Discovery is advisory. Stale confirmation must clear the choice, refresh inventory and require explicit reselection; no automatic version substitution.

## Existing frontend integration point and future journey

Inspected OrganizerSetupFlow.tsx, CustomHuntEditor.tsx, generalSetup.ts, router.tsx, AuthProvider/API client and existing Hunt/snapshot/geography tests. Existing authenticated ApiClient handles sessions/refresh and ApiError status/details. HuntsApi creates a draft, patches General Setup, and uses legacy templateKey selection. The existing editor persists organization/name first and retains roles, reward configuration and scheduling. Reuse that flow after the gate is resolved; do not create a second builder.

Intended future journey: Create Hunt → backend Country → country-filtered stored Locality search → eligible Local cards (name/theme/saved location) → exact allowlisted read-only preview → explicit exact-version PUT into authorized draft → existing configuration. Technical versions are internal references, never Organizer controls. Existing OrganizerHuntGeography/shared TedixMap provide a preview foundation; safe C7 wiring was not implemented or validated. A truthful read-only checkpoint/location summary remains the permitted fallback if needed.

## Changes, verification and reachability

Only this report changes. No frontend code/tests, backend/migrations, runtime flags, publication/start gates or deployment changes.

No new D10 journey is reachable through this PR. Current deployed FE/BE revisions and authenticated endpoint availability were not verified; merged source is not deployment evidence. Existing legacy/Signal behavior remains unchanged.

No application checks were run after the mandatory readiness stop; TypeScript/build/D10 test results are therefore not claimed. The C7 implementation report records 1,255 backend tests passing with no failures/skips, typecheck/build passing; those are report evidence, not independently executed here. Frontend D10 acceptance tests remain unimplemented. Future coverage must include filtering, preview allowlist, exact request, stale explicit reselection, loading/empty/error/auth states, existing creation regression and responsive navigation.

Git fetch was unavailable because the configured shell proxy could not be reached. GitHub connector reads verified current main and were used for documentation delivery. No E2E acceptance or production readiness is claimed.
