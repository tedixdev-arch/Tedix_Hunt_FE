import { apiClient, ApiError, type ApiClient } from './client.ts'
export interface ParticipantHuntContext {
  huntId: string; participantId: string; joinedAt: string
  huntStatus: 'published' | 'active' | 'paused'; templateVersion: number
  enrollmentPolicy: 'organizer_invitation'; proximityPolicy: 'unresolved'
  checkpoints: Array<{ checkpointId: string; kind: 'regular' | 'finish'; accessState: 'not_yet_accessible' | 'eligible_for_proximity' | 'proximity_verified'; gameplayCompleted: false; mayAccessGameplay: false; verifiedAt: string | null }>
}
export class ParticipantEnrollmentApi {
  constructor(private readonly client: ApiClient = apiClient) {}
  enroll(id: string, accessCode?: string): Promise<ParticipantHuntContext> {
    return this.client.post(`/api/hunts/${encodeURIComponent(id)}/participants/enroll`, accessCode ? { accessCode } : {})
  }
  context(id: string): Promise<ParticipantHuntContext> {
    return this.client.get(`/api/hunts/${encodeURIComponent(id)}/participants/me`)
  }
}
export const participantEnrollmentApi = new ParticipantEnrollmentApi()
// Navigation hint only. Membership/progress must always be confirmed by the server.
export function rememberHunt(userId: string, huntId: string, name: string) {
  try { localStorage.setItem(`tedix-hunt.entry.${userId}`, JSON.stringify({ huntId, name })) } catch { /* Optional storage. */ }
}
export function recallHunt(userId: string): { huntId: string; name: string } | null {
  try {
    const value = JSON.parse(localStorage.getItem(`tedix-hunt.entry.${userId}`) ?? 'null')
    return value && typeof value.huntId === 'string' && typeof value.name === 'string' ? value : null
  } catch { return null }
}
export function enrollmentError(error: unknown): string {
  if (error instanceof ApiError) {
    const code = (error.details as { error?: unknown } | undefined)?.error
    if (error.status === 401) return 'Your session has expired. Please sign in again.'
    if (error.kind === 'network') return "Couldn't connect. Try again."
    if (error.status === 404) return "This invitation isn't valid or is no longer available."
    if (code === 'hunt_capacity_exceeded') return 'This Hunt is full.'
    if (code === 'invalid_hunt_state') return 'This Hunt is no longer accepting players.'
    if (error.status === 429) return 'Please wait a moment and try again.'
  }
  return "Couldn't join this Hunt. Try again or contact your Organizer."
}
