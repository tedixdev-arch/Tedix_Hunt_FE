import { apiClient } from './client.ts'
import type { Hunt } from './hunts.ts'
export interface Country { countryCode: string; displayName: string }
export interface Region { regionId: string; countryCode: string; label: string }
/** Catalog city; localityId is null until an Admin registers the city as a locality. */
export interface City { geographicId: string; localityId: string | null; countryCode: string; name: string; regionId: string; regionDisplayName: string | null; countryDisplayName: string; attribution: string }
export interface LocalHunt { templateId: string; key: string; version: number; displayName: string; theme: string; localityId: string }
export interface LocalPreview extends LocalHunt { configuration: Record<string, unknown> }
export interface Selection { templateId: string; version: number; countryCode: string; localityId: string }
export interface Page<T> { items: T[]; nextCursor: string | null }
export const organizerLocalApi = {
  async page<T>(kind: 'countries' | 'regions' | 'cities' | 'templates', filters: Record<string, string>, cursor?: string): Promise<Page<T>> {
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
