# Locations, Template Details and Creator flow: behaviour and open questions

Backend standard and API: `Tedix_Hunt_BE/docs/Location_Data_Standard.md`.

## One location pattern everywhere

Creator (Local Template), Organizer (Local Hunt and custom Hunt), Create Content and Admin → Locations use the same three fields (`features/location/locationLabels.ts`):

| Field | Label | Placeholder |
|---|---|---|
| Country | Country | Choose Country (Create Content: Universal) |
| County/Region | County/Region | Choose County/Region |
| City | City | Choose City |

- All three are plain native dropdowns. Typing a letter jumps to the first entry starting with it. There is no text input, autocomplete or separate filter/search box.
- No location is preselected (the former Cluj / Romania pilot defaults are removed). A saved draft still reopens on its saved location.
- Changing Country clears County/Region and City; changing County/Region clears City.
- City options are plain names, and **every listed city can be used**. There is no City registration step, no "requires Admin registration" warning and no request flow. The only exception is a Locality that was switched off directly in the database: it shows "This place is currently unavailable. Choose another city." (`registrationMessage` in `services/api/geography.ts`).
- The catalog still returns each country's own level name (County, State…). The UI deliberately shows "County/Region" for every country.

## Admin → Locations (`/#/admin/locations`)

- Shows only **Locality proposals** (`features/admin/LocalityProposalReview.tsx`): approve or reject places missing from the city list. The review shows the region and warns when same-name cities already exist. Approval is refused with `catalog_city_exists` if the place is listed. The former City registration screen was removed.

## Creator: Local Template location (`features/creator/CreatorGeographicSelector.tsx`)

- An explicit City choice calls `POST /api/geography/cities/{id}/resolve`, which links or creates the city's Locality automatically, then binds its UUID.
- Approved manual Localities (from proposals) are listed in their County/Region and bind directly.
- "Can't find your locality?" (`LocalityProposals.tsx`) is only for places missing from the City list. It needs the selected County/Region when the country has regions.

## Organizer: Hunt location (`features/organizer/LocalSetupFoundation.tsx`)

- Same fields. Any city can be chosen and **Choose Hunt** is enabled. A city with no approved Local Hunts yet shows "No approved Local Hunts are available in {city} yet."

## Create Content location (`features/creator/content/ContentGeography.tsx`)

- Default **Universal**: County/Region is a disabled dropdown showing Universal, and City is a disabled dropdown showing Universal. No warnings are shown.
- Choosing a country enables County/Region ("Choose County/Region") and then City ("Choose City"), loaded for that country and county/region. Both reset when the country changes.
- Leaving County/Region or City unchosen scopes the content to the whole country or county/region. These were already valid scopes.
- Any listed city can be chosen; there is no warning and no submission block.
- Only GeoNames catalog cities are offered, because content matching uses GeoNames IDs. Manual Localities and the "region not specified" group are not offered here.

## Template Details (`features/creator/templateDetailRules.ts`, `TemplateDetailFields.tsx`)

Values keep their existing stored text form (`ageRange` "12–16" / "18+", `participants` "16–40", `teamSize` "4" or "3–5", `durationMinutes` number), so saved Templates stay compatible.

| Field | Choices | Rule |
|---|---|---|
| Age range | 6–9, 10–12, 12–16, 16–18, 18+ (adults), Custom range | 4–99 years, min ≤ max |
| Duration (minutes) | number field | whole minutes, 15–480 |
| Participant range | 2–10, 10–30, 16–40, 30–60, 60–120, Custom range | 1–1000, min ≤ max |
| Team size range | minimum / maximum | 2–10; max ≤ participant max; for "Team Hunters" the team min ≤ participant min (one full team must fit); not applicable for "Single Hunters" |

- Errors show inline. **Continue** on that step, **Save draft** and **Submit** are blocked while an entered value is invalid.
- A blank field is allowed (see Q-A below). A blank duration is no longer saved as `0`.
- Backend: no change. The backend stores these as free-form configuration and does not validate them (see recommendations).

## Creator flow review

- Review & Submit now warns, without blocking, when a checkpoint or the FinishPoint has neither a Personal nor a Team challenge (`challengeCoverage.ts`; B-02 / FR-15).

## Questions for client confirmation

- **Q-A** Must age range, duration, participant range and team size be filled before a Template can be submitted? Today blank is allowed and only entered values are validated.
- **Q-B** Are the limits right? Age 4–99, duration 15–480 min, participants 1–1000, team size 2–10. The live pilot plays only teams of 4 (`huntOptions.teamSizes`).
- **Q-C (Q-04)** Minimum challenge content per checkpoint: Personal, Team, or at least one of either? Should it block submission (currently only a warning)?
- **Q-D** Personal Challenge vs Team Challenge with the Template format: should "Single Hunters" Templates hide or forbid Team challenges, and should "Team Hunters" Templates require one? How are participants assigned to teams (by the Organizer, automatically, or self-selected), and does the Template team-size range limit what the Organizer can choose (today the Organizer flow is fixed to teams of 4)?
- **Q-F** Should Create Content allow scoping to an approved manual Locality? Content matching currently uses GeoNames city IDs only.
