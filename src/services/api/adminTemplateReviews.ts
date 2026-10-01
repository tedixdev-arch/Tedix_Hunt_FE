import { apiClient, type ApiClient } from './client.ts'
import type { CreatorTemplateContent, CreatorTemplateStatus } from './creatorTemplates.ts'

export interface AdminTemplateReview {
  key: string
  version: number
  submittedVersion: number
  status: CreatorTemplateStatus
  content: CreatorTemplateContent
  createdBy?: string
  submittedAt?: string
  reviewNotes?: string | null
}

export interface RequestTemplateChangesInput {
  notes: string
}

export class AdminTemplateReviewsApi {
  private readonly client: ApiClient

  constructor(client: ApiClient = apiClient) {
    this.client = client
  }

  list(): Promise<AdminTemplateReview[]> {
    return this.client.get('/api/admin/templates/review')
  }

  get(key: string): Promise<AdminTemplateReview> {
    return this.client.get(`/api/admin/templates/review/${encodeURIComponent(key)}`)
  }

  approve(key: string): Promise<AdminTemplateReview> {
    return this.client.post(`/api/admin/templates/review/${encodeURIComponent(key)}/approve`)
  }

  requestChanges(key: string, input: RequestTemplateChangesInput): Promise<AdminTemplateReview> {
    return this.client.post(`/api/admin/templates/review/${encodeURIComponent(key)}/request-changes`, input)
  }
}

export const adminTemplateReviewsApi = new AdminTemplateReviewsApi()
