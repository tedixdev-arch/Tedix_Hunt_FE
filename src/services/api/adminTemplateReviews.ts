import { apiClient, type ApiClient } from './client.ts'
import type { CreatorTemplateContent, CreatorTemplateStatus } from './creatorTemplates.ts'

export interface AdminTemplateReview {
  key: string
  version: number
  status: CreatorTemplateStatus
  origin: string
  creator: {
    id: string
    name: string
    email: string
  }
  content: CreatorTemplateContent
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

  approve(key: string): Promise<AdminTemplateReview> {
    return this.client.post(`/api/admin/templates/review/${encodeURIComponent(key)}/approve`)
  }

  requestChanges(key: string): Promise<AdminTemplateReview> {
    return this.client.post(`/api/admin/templates/review/${encodeURIComponent(key)}/request-changes`)
  }
}

export const adminTemplateReviewsApi = new AdminTemplateReviewsApi()
