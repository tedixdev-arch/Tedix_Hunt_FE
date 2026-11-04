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
export interface Locality extends LocalitySnapshot { active: boolean }
export interface Region { countryCode: string; admin1Code: string; displayName: string }
export interface RegionPage { regions: Region[]; regionLabel: string; metadataStatus: 'ready' | 'incomplete'; nextAfter: string | null }
export interface GeographicCity {
  geographicId: string; countryCode: string; countryDisplayName: string; name: string
  admin1Code: string; regionDisplayName: string | null; regionStatus: 'resolved' | 'missing_label' | 'unspecified'
  administrativeContext: string; latitude: number; longitude: number
  localityId: string | null; registeredActive: boolean; registrationState: string; nextAction: string
}
export interface CityPage { cities: GeographicCity[]; nextAfter: string | null }
export class GeographyApi {
  private readonly client: ApiClient
  constructor(client: ApiClient = apiClient) { this.client = client }
  regions(countryCode: string, after?: string): Promise<RegionPage> {
    return this.client.get(`/api/geography/regions?${new URLSearchParams({ countryCode, limit: '50', ...(after ? { after } : {}) })}`)
  }
  cities(countryCode: string, query: string, admin1Code?: string, after?: string): Promise<CityPage> {
    return this.client.get(`/api/geography/cities?${new URLSearchParams({ countryCode, ...(admin1Code ? { admin1Code } : {}), q: query.trim(), limit: '20', ...(after ? { after } : {}) })}`)
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
