# Simple Organizer setup: safe frontend foundation

FE #157 is merged (3e80e4238e7906c36a1282a90bca40a6666761e9).
This change is deliberately blocked at Location, per the task's safety fallback.
It does not implement working Local Hunt selection or event creation.

The public Set the Hunt CTA keeps its existing working setup URL and copy,
including independent mode. CustomHuntEditorPage and saved draft routing are
unchanged. Even the former `setup=local` query renders the existing builder.

The four-step foundation is isolated in
`src/features/organizer/LocalSetupFoundation.tsx`. It has no application route,
public link, query switch or runtime import. Tests render it directly. It retains
Location → Choose Hunt → Configure Event → Review and the responsive location
card for future integration. Its disabled fields are never a public CTA target.

No draft migration, source-version mutation, activation or deployment occurs.

## Exact backend dependency

Inspected BE main 1525d9fdeafdecd8316b8fb00a3e5b37ac29514b:
`src/routes/organizerLocalTemplates.ts`, `src/routes/geography.ts`,
`docs/Geographic_Catalog.md` and C7 contract/report.

Existing C7 APIs require a country and canonical locality UUID before discovery:
- GET /api/organizer/local-templates?countryCode=RO&localityId=<UUID>&limit=20[&cursor=...]
- GET /api/organizer/local-templates/<templateId>/versions/<version>?countryCode=RO&localityId=<UUID>
- PUT /api/hunts/<id>/local-template with templateId, version, countryCode, localityId.

Missing: an authenticated Organizer eligible-only geographic discovery contract
for countries, regions within a country, and canonical cities within a region.
All three levels must restrict results server-side to locations with at least one
currently C7-eligible approved Local artifact, BEFORE pagination. Define stable
country/region identity, region label, canonical locality UUID, pagination,
empty/error behavior and treatment of unassigned regions. No endpoint names are
invented by this frontend. Preserve Organizer authorization and private no-store.

General /api/geography/countries, /regions and /cities are catalog discovery,
not eligible-only inventory. A city's hasApprovedLocalTemplate advisory flag
does not make a paginated catalog an eligible geographic hierarchy. Do not fetch
these as a substitute, filter incomplete pages, enumerate all cities, resolve or
register cities, or infer identity from names.

After that contract exists, integrate the isolated foundation in the existing builder, clear downstream
location/Hunt/preview state on upstream changes, ignore stale responses, page
server-authoritative choices, reuse exact-version C7 preview and selection,
and expose only persisted Organizer event settings/rewards. Revalidate selection
on writes and keep immutable versions and existing draft snapshots intact.

This foundation has no async location state to clear and makes no deployed
integration or Mapbox verification claim. The remaining three steps require the
backend contract and subsequent FE integration; they cannot be reached here.
