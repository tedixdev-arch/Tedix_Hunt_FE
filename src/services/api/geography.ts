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
export class GeographyApi {
  private readonly client: ApiClient
  constructor(client: ApiClient = apiClient) { this.client = client }
  countries(): Promise<{ countries: Country[] }> { return this.client.get('/api/geography/countries') }
  search(countryCode: string, query: string): Promise<{ localities: Locality[]; providerStatus: 'not_requested' }> {
    return this.client.get(`/api/geography/localities?${new URLSearchParams({ countryCode, q: query.trim() })}`)
  }
  get(id: string): Promise<Locality> { return this.client.get(`/api/geography/localities/${encodeURIComponent(id)}`) }
}
export const geographyApi = new GeographyApi()
