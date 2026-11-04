# Geographic hierarchy correction

Library eligibility now consumes the existing read-only city catalog lookup separately from saved exercise metadata. The catalog city ID and country must match the selected city. A region match additionally requires resolved region metadata with the exact admin1 identifier. Display names and the filter's previous region are never used to infer membership.

For Cluj-Napoca, Universal, Romania, Cluj-region and exact-city records are eligible. Another Romanian region and another city are excluded. While the lookup is pending, fails, mismatches the selected city/country, or lacks resolved region metadata, all region-scoped records remain excluded. Universal, matching-country and exact-city eligibility remain valid.

C2a city payloads still contain only scope, countryCode and geographicId. Catalog resolution does not modify Category, curriculum, the exercise, dirty-state metadata or the saved geography. Starter examples retain their existing independent behavior.

Verification:

- Typecheck and production build passed.
- 66 relevant tests passed across six files, including 15 new hierarchy/restoration regressions.
- Real browser checks against the existing merged C2a backend and disposable PostgreSQL 16 passed. The isolated catalog includes Cluj and a second Romanian region/city. All content creation, retrieval and editor saves use the actual API/database; only the failed city-detail GET is injected as a 503.
- Saved city restoration and saving preserve the complete canonical exercise, Mathematics/grade 7 classification and city geography. Pending/failed city resolution excludes regional records; Starter examples remain available.

[Results](results.json) · [Resolved hierarchy](resolved.png) · [Failed resolution](unresolved.png) · [Tests](tests.log) · [Browser log](browser.log)

Reproduce using the existing [disposable harness instructions](../README.md#reproduction), then run `node tests/browser/contentGeographicHierarchy.verify.mjs`. The script writes to `work/hierarchy-browser` by default; `C2B_HIERARCHY_EVIDENCE` changes its output directory.
