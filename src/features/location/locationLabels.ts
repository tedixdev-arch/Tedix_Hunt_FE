/**
 * Wording for every Country → Region → (optional) Subregion → City field (Creator, Organizer, Create Content, Admin).
 * Before a country is chosen the generic names are shown; afterwards `levelLabels` uses the catalog's own names
 * for the country (RO County → Commune, US State → County, IN State → District, FR Region → Department).
 */
export const locationLabels = {
  country: 'Country',
  region: 'County/Region',
  city: 'City',
  chooseCountry: 'Choose Country',
  chooseRegion: 'Choose County/Region',
  chooseCity: 'Choose City',
  subregion: 'District/County',
  universal: 'Universal',
} as const

/** Country-specific names of the region and subregion levels; falls back to the generic names. */
export function levelLabels(regionLabel?: string | null, subregionLabel?: string | null) {
  const region = regionLabel?.trim() || locationLabels.region
  const subregion = subregionLabel?.trim() || locationLabels.subregion
  return { region, subregion, chooseRegion: `Choose ${region}`, allOf: (regionName: string) => `All of ${regionName}` }
}
