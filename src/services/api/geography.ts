import { apiClient, type ApiClient } from './client.ts'
export interface Country { code: string; displayName: string }
export interface LocalitySnapshot {
  id: string
  countryCode: string
  countryDisplayName: string
  name: string
  administrativeContext: string
  latitude: number
  longitude: number
}
export interface Locality extends LocalitySnapshot {
  active: boolean
  /** Linked GeoNames city, or null for a manual Locality created from an approved proposal. */
  geographicId?: string | null
  /** Region of the Locality (`unspecified` when it has none). Older responses may omit it. */
  admin1Code?: string
  regionDisplayName?: string | null
  /** Official admin2 subdivision of the linked city (`unspecified` when it has none, and for manual Localities). */
  admin2Code?: string
  subregionDisplayName?: string | null
}
/** Region `unspecified` groups cities and manual Localities without a first-level region. */
export const UNSPECIFIED_REGION = 'unspecified'
export interface Region { countryCode: string; admin1Code: string; displayName: string; labelStatus?: 'resolved' | 'missing_label' | 'unspecified' }
/** Subregion `unspecified` groups the region's cities that match no official subdivision record. */
export const UNSPECIFIED_SUBREGION = 'unspecified'
/** Optional admin2 level (County, District, Commune, Department…) between Region and City. */
export interface Subregion { countryCode: string; admin1Code: string; admin2Code: string; displayName: string; labelStatus?: 'resolved' | 'unspecified' }
/** An empty list means the region has no named subdivisions: skip the level and list the whole region. */
export interface SubregionList { subregions: Subregion[]; regionLabel: string; subregionLabel: string }
export interface RegionPage { regions: Region[]; regionLabel: string; metadataStatus: 'ready' | 'incomplete'; nextAfter: string | null }
export interface GeographicCity {
  /** GeoNames ID; null for a manual Locality (`source: 'registry'`). */
  geographicId: string | null; countryCode: string; countryDisplayName: string; name: string
  admin1Code: string; regionDisplayName: string | null; regionStatus: 'resolved' | 'missing_label' | 'unspecified'
  admin2Code?: string; subregionDisplayName?: string | null
  administrativeContext: string; latitude: number; longitude: number
  localityId: string | null; registeredActive: boolean; registrationState: string; nextAction: string
  source?: 'geonames' | 'registry'; hasApprovedLocalTemplate?: boolean
}
export interface CityPage { cities: GeographicCity[]; registryLocalities?: GeographicCity[]; nextAfter: string | null }
/** Stable key of a city choice: the GeoNames ID, or the Locality UUID for a manual Locality. */
export const cityKey = (city: Pick<GeographicCity, 'geographicId' | 'localityId'>) => city.geographicId ?? `registry:${city.localityId}`
/** Every choice of one region, or of one of its subregions (all pages, manual Localities included), sorted by name for a dropdown. */
export async function loadRegionCities(api: Pick<GeographyApi, 'browse'>, countryCode: string, admin1Code: string, live: () => boolean = () => true, admin2Code?: string) {
  const all = new Map<string, GeographicCity>()
  let after: string | undefined
  for (let pages = 0; pages < 100; pages++) {
    const page = admin2Code ? await api.browse(countryCode, admin1Code, after, admin2Code) : await api.browse(countryCode, admin1Code, after)
    if (!live()) return []
    for (const city of [...page.cities, ...(page.registryLocalities ?? [])]) if (city.countryCode === countryCode) all.set(cityKey(city), city)
    after = page.nextAfter ?? undefined
    if (!after) break
  }
  return [...all.values()].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) || cityKey(a).localeCompare(cityKey(b)))
}
/** Message for a city that cannot be used ('' when usable). */
export function registrationMessage(city: Pick<GeographicCity, 'registrationState' | 'source'>) {
  // Any listed city can be used; selecting one links or creates its Locality automatically. Only a Locality that was
  // switched off in the registry is unavailable.
  if (city.registrationState !== 'registered_inactive') return ''
  return 'This place is currently unavailable. Choose another city.'
}
export class GeographyApi {
  private readonly client: ApiClient
  constructor(client: ApiClient = apiClient) { this.client = client }
  regions(countryCode: string, after?: string): Promise<RegionPage> {
    return this.client.get(`/api/geography/regions?${new URLSearchParams({ countryCode, limit: '50', ...(after ? { after } : {}) })}`)
  }
  cities(countryCode: string, query: string, admin1Code?: string, after?: string): Promise<CityPage> {
    return this.client.get(`/api/geography/cities?${new URLSearchParams({ countryCode, ...(admin1Code ? { admin1Code } : {}), q: query.trim(), limit: '20', ...(after ? { after } : {}) })}`)
  }
  /** Official subdivisions of one concrete region, with the country's level labels. */
  subregions(countryCode: string, admin1Code: string): Promise<SubregionList> {
    return this.client.get(`/api/geography/subregions?${new URLSearchParams({ countryCode, admin1Code })}`)
  }
  /** Every city of one region (no query), optionally of one subregion, for dropdowns. The first page also carries manual Localities (whole region or `unspecified` subregion only). */
  browse(countryCode: string, admin1Code: string, after?: string, admin2Code?: string): Promise<CityPage> {
    return this.client.get(`/api/geography/cities?${new URLSearchParams({ countryCode, admin1Code, ...(admin2Code ? { admin2Code } : {}), limit: '50', ...(after ? { after } : {}) })}`)
  }
  city(id: string): Promise<GeographicCity> { return this.client.get(`/api/geography/cities/${encodeURIComponent(id)}`) }
  resolveCity(id: string): Promise<GeographicCity> { return this.client.post(`/api/geography/cities/${encodeURIComponent(id)}/resolve`, {}) }

  countries(): Promise<{ countries: Country[] }> { return this.client.get('/api/geography/countries') }
  search(countryCode: string, query: string): Promise<{ localities: Locality[]; providerStatus: 'not_requested' }> {
    return this.client.get(`/api/geography/localities?${new URLSearchParams({ countryCode, q: query.trim() })}`)
  }
  get(id: string): Promise<Locality> { return this.client.get(`/api/geography/localities/${encodeURIComponent(id)}`) }
}
export const geographyApi = new GeographyApi()
