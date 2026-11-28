import { apiClient } from './client.ts'
import type { Hunt } from './hunts.ts'
export interface Country { countryCode: string; displayName: string }
/** levelLabel names the region level for the country (County, State, …). */
export interface Region { regionId: string; countryCode: string; label: string; labelStatus?: 'resolved' | 'missing_label' | 'unspecified'; levelLabel?: string }
/** Optional admin2 level of a region; subregionId `<regionId>:unspecified` groups cities matching no official subdivision. */
export interface Subregion { subregionId: string; regionId: string; subregionCode: string | null; label: string; labelStatus?: 'resolved' | 'unspecified'; level?: 'admin2'; levelLabel?: string }
/**
 * A city choice. GeoNames cities have a geographicId; localityId stays null until a Creator first uses the city
 * (no Local Hunts can exist there before that). Manual Localities (approved proposals) have geographicId null and source `registry`.
 */
export interface City { geographicId: string | null; localityId: string | null; countryCode: string; name: string; regionId: string; subregionId?: string; regionDisplayName: string | null; countryDisplayName: string; attribution: string | null; source?: 'geonames' | 'registry'; registeredActive?: boolean }
/** Stable dropdown key for a City. */
export const cityChoiceKey = (city: Pick<City, 'geographicId' | 'localityId'>) => city.geographicId ?? `registry:${city.localityId}`
/** Any listed city can be chosen; only a Locality that was switched off in the registry is unavailable. */
export const cityUsable = (city: Pick<City, 'localityId' | 'registeredActive'>) => !city.localityId || city.registeredActive !== false
export interface LocalHunt { templateId: string; key: string; version: number; displayName: string; theme: string; localityId: string; exclusive?: boolean}
export interface LocalPreview extends LocalHunt { configuration: Record<string, unknown> }
export interface Selection { templateId: string; version: number; countryCode: string; localityId: string }
export interface Page<T> { items: T[]; nextCursor: string | null }
export const organizerLocalApi = {
  async page<T>(kind: 'countries' | 'regions' | 'subregions' | 'cities' | 'templates', filters: Record<string, string>, cursor?: string): Promise<Page<T>> {
    const query = new URLSearchParams({ ...filters, limit: '20', ...(cursor ? { cursor } : {}) })
    const path = kind === 'templates' ? 'local-templates' : `geography/${kind}`
    const response = await apiClient.get<Record<string, T[]> & { nextCursor: string | null }>(`/api/organizer/${path}?${query}`)
    if (!Array.isArray(response[kind])) throw new Error('Location choices are unavailable. Please retry.')
    return { items: response[kind], nextCursor: response.nextCursor }
  },
  preview(selection: Selection, signal?: AbortSignal) {
    const { templateId, version, countryCode, localityId } = selection
    return apiClient.get<LocalPreview>(`/api/organizer/local-templates/${encodeURIComponent(templateId)}/versions/${version}?${new URLSearchParams({ countryCode, localityId })}`, { signal })
  },
  select(id: string, selection: Selection) {
    return apiClient.put<Hunt>(`/api/hunts/${encodeURIComponent(id)}/local-template`, selection)
  },
}
