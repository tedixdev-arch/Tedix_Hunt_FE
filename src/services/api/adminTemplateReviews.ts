import { apiClient, type ApiClient } from './client.ts'
import type { CreatorTemplate, CreatorTemplateContent, CreatorTemplateStatus } from './creatorTemplates.ts'

export interface AdminTemplateReview {
  key: string
  version: number
  status: CreatorTemplateStatus
  category?: 'universal' | 'local' | null
  localityId?: string | null
  localitySnapshot?: import('./geography.ts').LocalitySnapshot | null
  currentLocality?: import('./geography.ts').Locality | null
  localApprovedVersion?: number | null
  localApproval?: CreatorTemplate['localApproval']
  localSuspension?: CreatorTemplate['localSuspension']
  origin: string
  creator: {
    id: string
    name: string | null
    email: string | null
  }
  content: CreatorTemplateContent
}

export interface RetainedLocalReview extends Omit<AdminTemplateReview, 'version' | 'content'> {
  version: number | null
  content: CreatorTemplateContent | null
  candidateVersion: number | null
  candidateStatus: CreatorTemplateStatus
  submittedVersion: number | null
}

interface AdminTemplateReviewsResponse {
  templates: AdminTemplateReview[]
}

export class AdminTemplateReviewsApi {
  private readonly client: ApiClient

  constructor(client: ApiClient = apiClient) {
    this.client = client
  }

  async list(): Promise<AdminTemplateReview[]> {
    const response = await this.client.get<AdminTemplateReviewsResponse>('/api/admin/templates/review')
    if (!Array.isArray(response?.templates)) throw new Error('Invalid Template review response.')
    return response.templates
  }

  get(key: string): Promise<AdminTemplateReview> {
    return this.client.get(`/api/admin/templates/review/${encodeURIComponent(key)}`)
  }

  approved(key: string): Promise<RetainedLocalReview> {
    return this.client.get(`/api/admin/templates/review/${encodeURIComponent(key)}?view=approved`)
  }

  suspend(key: string, version: number, reason: string): Promise<{ key: string; localApprovedVersion: number | null; localSuspension: NonNullable<CreatorTemplate['localSuspension']> }> {
    return this.client.post(`/api/admin/templates/${encodeURIComponent(key)}/suspend`, { version, reason })
  }

  approve(key: string, version?: number): Promise<AdminTemplateReview> {
    return this.client.post(`/api/admin/templates/review/${encodeURIComponent(key)}/approve`, version === undefined ? undefined : { version })
  }

  requestChanges(key: string, version?: number): Promise<AdminTemplateReview> {
    return this.client.post(`/api/admin/templates/review/${encodeURIComponent(key)}/request-changes`, version === undefined ? undefined : { version })
  }
}

export const adminTemplateReviewsApi = new AdminTemplateReviewsApi()
