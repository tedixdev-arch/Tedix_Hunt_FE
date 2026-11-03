# Temporary prototype location

Both editable Local location steps display Romania → Cluj → Cluj-Napoca through `PrototypeLocationSelector`. The component has no API calls, IDs, coordinates, or persistence effects. Creator continuation only unlocks the existing Template builder; canonical locality and route validation remain separate. Organizer continuation always opens Choose Hunt, even with no approved Hunts or unavailable event metadata.

No backend, API contract, database, migration, geographic catalog, or approval changes are included. Existing saved locality UUIDs/snapshots and authored checkpoint data remain authoritative. Event updates preserve saved location labels. Universal and independent flows keep their existing builders.

## Separate canonical locality blocker

The existing Organizer discovery contract requires both countryCode and a canonical locality UUID (`docs/D10_Organizer_Integration_Readiness_Report.md`, C7 endpoint description). A fresh prototype session has no such UUID. Choose Hunt therefore displays an empty state and explains the unavailable canonical reference, without making an invalid request or claiming backend approval. A saved Cluj draft's server reference can still drive discovery, exact preview, and eligibility revalidation. Other saved drafts retain their original server selection and event data.

Creator draft saves retain the existing request and server validation. The fixed labels do not bind a new Local draft to a canonical locality. Canonical binding remains required by Local validation/submission; geographic positioning remains unavailable without a valid saved locality. Backend rejections are retained as save/validation errors. No persistence is simulated.

## Verification

- Production build and TypeScript check.
- Vitest coverage for immediate navigation, absent geography requests, absent navigation mutations, saved draft preservation, canonical persistence/submission, metadata outage, and saved Organizer exact eligibility/publish behavior.
- `node tests/browser/prototypeLocation.verify.mjs`: real Chromium at 1440, 390, and 320 pixels for both flows, with actual API requests blocked. Both transitions passed; zero geography API calls, zero mutation calls, zero page errors, no horizontal overflow. Results are in `browser-results.json`.
- Browser tests use FE fixtures. They do not claim live backend persistence, approval, or deployment verification.

Remove the temporary component and restore canonical selectors/continuation when the prototype phase ends. The reusable canonical selector components and API implementations remain intact.
