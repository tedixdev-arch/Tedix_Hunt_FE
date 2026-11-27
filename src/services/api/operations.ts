import { apiClient, type ApiClient } from './client.ts'

export interface MonitorParticipant {
  participantId: string; displayName: string; rank: number; score: number
  joinedAt: string; startedAt: string | null; finishedAt: string | null; lastActivityAt: string | null
  checkpointsCompleted: number; checkpointsTotal: number
  current: { checkpointId: string; ordinal: number; kind: 'regular' | 'finish'; accessState: 'not_yet_accessible' | 'eligible_for_proximity' | 'proximity_verified' } | null
}
export interface HelpRequest { id: string; participantId: string; displayName: string; kind: 'help' | 'emergency'; message: string; status: 'open' | 'resolved'; createdAt: string; resolvedAt: string | null }
export interface HuntMonitor {
  settings?: { organizerCheckInEnabled: boolean }
  hunt: { id: string; name: string; status: string; capacity: number | null; durationMinutes: number | null; startDate: string | null; startTime: string | null; timezone: string | null }
  totals: { participants: number; started: number; finished: number; openHelpRequests: number }
  participants: MonitorParticipant[]
  helpRequests: HelpRequest[]
  activity: Array<{ participantId: string; displayName: string; ordinal: number; stage: 'personal' | 'team'; correct: boolean; at: string }>
}

export class HuntOperationsApi {
  constructor(private readonly client: ApiClient = apiClient) {}
  monitor(huntId: string) { return this.client.get<HuntMonitor>(`/api/hunts/${encodeURIComponent(huntId)}/monitor`) }
  checkIn(huntId: string, participantId: string, checkpointId: string) {
    return this.client.post(`/api/hunts/${encodeURIComponent(huntId)}/participants/${encodeURIComponent(participantId)}/checkpoints/${encodeURIComponent(checkpointId)}/check-in`)
  }
  resolveHelp(huntId: string, requestId: string) {
    return this.client.post(`/api/hunts/${encodeURIComponent(huntId)}/help-requests/${encodeURIComponent(requestId)}/resolve`)
  }
}
export const huntOperationsApi = new HuntOperationsApi()

export interface AdminDashboard {
  users: number; hunts: number; liveHunts: number; participants: number; finishedParticipants: number
  templatesInReview: number; approvedTemplates: number; pendingOrganizerApplications: number; pendingCreatorApplications: number
  openAlerts: number; openCustomRequests: number
}
export interface AdminAlert { id: string; huntId: string; huntName: string; displayName: string; kind: 'help' | 'emergency'; message: string; status: 'open' | 'resolved'; createdAt: string; resolvedAt: string | null }
export type CustomRequestStatus = 'new' | 'in_review' | 'assigned' | 'in_progress' | 'completed' | 'rejected' | 'closed'
/** What the Organizer sees. */
export type CustomRequestProgress = 'in_work' | 'done' | 'rejected' | 'closed'
export interface CustomRequestTemplate {
  key: string; status: 'draft' | 'submitted' | 'changes_requested' | 'approved'; submittedVersion: number | null; approvedVersion: number | null
  displayName: string | null; locality: { id: string; name: string; administrativeContext: string; countryCode: string; countryDisplayName: string } | null
}
interface CustomRequestBase {
  id: string; organizationId: string | null; organizationName: string | null; city: string | null; preferredDate: string | null
  participantCount: number | null; details: string; status: CustomRequestStatus; createdAt: string; updatedAt: string; completedAt: string | null
}
export interface CustomHuntRequest extends CustomRequestBase {
  contactName: string; contactEmail: string; adminNote: string | null; organizerNote: string | null; submittedByUserId: string | null
  assignedCreator: { id: string; name: string | null; email: string } | null; assignedAt: string | null; template: CustomRequestTemplate | null
}
/** Creator brief: no contact details or internal notes. */
export interface CreatorCustomRequest extends CustomRequestBase { assignedAt: string | null; template: CustomRequestTemplate | null }
export interface OrganizerCustomRequest extends CustomRequestBase { progress: CustomRequestProgress; note: string | null; hunt: CustomRequestTemplate | null }
export interface CustomHuntRequestInput {
  contactName: string; contactEmail: string; details: string
  organizationId?: string; organizationName?: string; city?: string; preferredDate?: string; participantCount?: number
}

export type SettingValue = number | boolean | string
export interface PlatformSetting {
  key: string; group: 'gps' | 'checkpoints' | 'scoring' | 'gameplay' | 'safety' | 'sessions'
  label: string; help: string; kind: 'integer' | 'boolean' | 'text' | 'choice'; unit?: string
  min?: number; max?: number; maxLength?: number; choices?: string[]; public?: boolean
  value: SettingValue; defaultValue: SettingValue; customized: boolean; updatedAt: string | null; updatedByUserId: string | null
}
export type AuditCategory = 'users' | 'applications' | 'templates' | 'hunts' | 'safety' | 'settings' | 'requests' | 'account'
export interface AuditEvent {
  id: string; occurredAt: string; actor: { userId: string | null; label: string | null; roles: string[] }
  action: string; category: AuditCategory; targetType: string | null; targetId: string | null; summary: string; details: Record<string, unknown>
}

export class AdminOperationsApi {
  constructor(private readonly client: ApiClient = apiClient) {}
  dashboard() { return this.client.get<AdminDashboard>('/api/admin/dashboard') }
  /** Help requests, open first; huntId limits them to one Hunt. Hunt lists live in adminHunts.ts. */
  alerts(huntId?: string) { return this.client.get<{ alerts: AdminAlert[] }>(`/api/admin/alerts${huntId ? `?huntId=${encodeURIComponent(huntId)}` : ''}`) }
  resolveAlert(alert: AdminAlert) { return this.client.post(`/api/hunts/${encodeURIComponent(alert.huntId)}/help-requests/${encodeURIComponent(alert.id)}/resolve`) }
  settings() { return this.client.get<{ settings: PlatformSetting[] }>('/api/admin/settings') }
  updateSettings(values: Record<string, SettingValue>) { return this.client.put<{ changed: string[]; settings: PlatformSetting[] }>('/api/admin/settings', { values }) }
  audit(filter: { category?: string; actor?: string; q?: string; cursor?: string }) {
    const query = new URLSearchParams(Object.entries({ ...filter, limit: '50' }).filter(([, v]) => v) as [string, string][])
    return this.client.get<{ events: AuditEvent[]; nextCursor: string | null }>(`/api/admin/audit?${query}`)
  }
  customRequests() { return this.client.get<{ requests: CustomHuntRequest[] }>('/api/admin/custom-hunt-requests') }
  updateCustomRequest(id: string, change: { status?: 'new' | 'in_review' | 'closed'; adminNote?: string | null; organizerNote?: string | null }) {
    return this.client.patch<CustomHuntRequest>(`/api/admin/custom-hunt-requests/${encodeURIComponent(id)}`, change)
  }
  assignCustomRequest(id: string, creatorUserId: string) {
    return this.client.post<CustomHuntRequest>(`/api/admin/custom-hunt-requests/${encodeURIComponent(id)}/assign`, { creatorUserId })
  }
  rejectCustomRequest(id: string, organizerNote: string) {
    return this.client.post<CustomHuntRequest>(`/api/admin/custom-hunt-requests/${encodeURIComponent(id)}/reject`, { organizerNote })
  }
}
export const adminOperationsApi = new AdminOperationsApi()

export const customHuntRequestsApi = {
  submit: (input: CustomHuntRequestInput) => apiClient.post<{ id: string; status: string }>('/api/custom-hunt-requests', input, { retryOnUnauthorized: false }),
  /** Requests the signed-in Organizer submitted or that belong to their organizations. */
  mine: () => apiClient.get<{ requests: OrganizerCustomRequest[] }>('/api/custom-hunt-requests/mine').then(r => r.requests),
}

export const creatorCustomRequestsApi = {
  list: () => apiClient.get<{ requests: CreatorCustomRequest[] }>('/api/creator/custom-requests').then(r => r.requests),
  linkTemplate: (id: string, key: string) => apiClient.put<CreatorCustomRequest>(`/api/creator/custom-requests/${encodeURIComponent(id)}/template`, { key }),
}
