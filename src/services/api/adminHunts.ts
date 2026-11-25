import { apiClient, type ApiClient } from './client.ts'
import type { Hunt, HuntLifecycleAction, HuntStatus } from './hunts.ts'

export interface AdminHuntFilters {
  q?: string; status?: HuntStatus | ''; organizationId?: string; organizerId?: string; city?: string; country?: string
  startFrom?: string; startTo?: string; createdFrom?: string; createdTo?: string
  sort?: 'created' | 'start' | 'name' | 'status'; order?: 'asc' | 'desc'
}
export interface AdminHuntRow {
  id: string; name: string; status: HuntStatus; city: string | null; country: string | null
  startDate: string | null; startTime: string | null; timezone: string | null; durationMinutes: number | null; capacity: number | null
  createdAt: string; updatedAt: string; templateName: string | null
  organization: { id: string; name: string; independent: boolean }
  organizer: { id: string; name: string | null; email: string | null } | null
  participants: number; activeParticipants: number; finished: number; openAlerts: number
}
export interface AdminHuntPage { hunts: AdminHuntRow[]; total: number; page: number; pageSize: number }
export interface ReadinessIssue { field: string; section: 'general' | 'template' | 'options'; message: string }
export interface AdminHuntDetail extends AdminHuntRow {
  hunt: Hunt & { invitationEnabled?: boolean }
  helpRequests: { open: number; resolved: number }
  startedAt: string | null; endedAt: string | null
  allowedActions: HuntLifecycleAction[]
  readiness: { ready: boolean; issues: ReadinessIssue[] } | null
}
export interface HuntHistoryEvent {
  id: string; occurredAt: string; actor: { userId: string | null; label: string | null; roles: string[] }
  action: string; category: string; summary: string; details: Record<string, unknown>
}
export interface AdminHuntFilterOptions {
  organizations: Array<{ id: string; name: string; independent: boolean }>
  organizers: Array<{ id: string; name: string | null; email: string | null }>
}

/** Query string for the shared list/export filters; empty values are omitted. */
export function adminHuntQuery(filters: AdminHuntFilters, extra: Record<string, string | number> = {}) {
  const entries = Object.entries({ ...filters, ...extra }).filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
  return new URLSearchParams(entries.map(([k, v]) => [k, String(v).trim()])).toString()
}

export class AdminHuntsApi {
  constructor(private readonly client: ApiClient = apiClient) {}
  list(filters: AdminHuntFilters, page: number, pageSize: number) {
    return this.client.get<AdminHuntPage>(`/api/admin/hunts?${adminHuntQuery(filters, { page, pageSize })}`)
  }
  filterOptions() { return this.client.get<AdminHuntFilterOptions>('/api/admin/hunts/filters') }
  export(filters: AdminHuntFilters) {
    return this.client.get<{ filename: string; csv: string; rows: number; truncated: boolean }>(`/api/admin/hunts/export?${adminHuntQuery(filters)}`)
  }
  detail(id: string) { return this.client.get<AdminHuntDetail>(`/api/admin/hunts/${encodeURIComponent(id)}`) }
  history(id: string) { return this.client.get<{ events: HuntHistoryEvent[] }>(`/api/admin/hunts/${encodeURIComponent(id)}/history`).then(r => r.events) }
  createAccess(id: string) { return this.client.post<{ huntId: string; code: string; enabled: boolean }>(`/api/admin/hunts/${encodeURIComponent(id)}/access`) }
  lifecycle(id: string, action: HuntLifecycleAction, reason: string) {
    return this.client.post<Hunt>(`/api/admin/hunts/${encodeURIComponent(id)}/lifecycle`, { action, reason })
  }
}
export const adminHuntsApi = new AdminHuntsApi()
