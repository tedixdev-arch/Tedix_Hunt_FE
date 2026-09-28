import { apiClient, type ApiClient } from './client.ts'

export interface CreatorApplicationInput {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export type CreatorApplicationStatus = 'pending' | 'approved' | 'rejected'

export interface CreatorApplication {
  id: string
  name: string
  email: string
  status: CreatorApplicationStatus
  createdAt: string
  updatedAt?: string
  reviewedAt?: string | null
  reviewedBy?: string | null
  userId?: string | null
}

export interface CreatorApplicationDecision {
  application: CreatorApplication
}

/** Signals that the Admin action queue may have changed after a review decision. */
export const creatorApplicationsPendingChangedEvent = 'tedixhunt:creator-applications-pending-changed'

export function notifyCreatorApplicationsPendingChanged(): void {
  window.dispatchEvent(new Event(creatorApplicationsPendingChangedEvent))
}

export class CreatorApplicationsApi {
  private readonly client: ApiClient

  constructor(client: ApiClient = apiClient) {
    this.client = client
  }

  create(input: CreatorApplicationInput): Promise<CreatorApplication> {
    return this.client.post<CreatorApplication>('/api/creator-applications', input, { authenticated: false })
  }

  list(status?: CreatorApplicationStatus): Promise<CreatorApplication[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : ''
    return this.client.get<CreatorApplication[]>(`/api/creator-applications${query}`)
  }

  approve(id: string): Promise<CreatorApplicationDecision> {
    return this.client.post<CreatorApplicationDecision>(`/api/creator-applications/${encodeURIComponent(id)}/approve`)
  }

  reject(id: string): Promise<CreatorApplicationDecision> {
    return this.client.post<CreatorApplicationDecision>(`/api/creator-applications/${encodeURIComponent(id)}/reject`)
  }
}

export const creatorApplicationsApi = new CreatorApplicationsApi()
