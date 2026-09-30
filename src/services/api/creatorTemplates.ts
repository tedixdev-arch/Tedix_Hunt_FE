import { apiClient, type ApiClient } from './client.ts'
import type { CreatorGeographyConfiguration } from '../../features/creator/checkpointGeography.ts'

export type CreatorTemplateStatus = 'draft' | 'submitted' | 'approved' | 'changes_requested'

export interface CreatorTemplateContent {
  key: string
  version: number
  displayName: string
  theme: string
  mission: string
  configuration: CreatorGeographyConfiguration & Record<string, unknown>
  scoring: Record<string, unknown>
  checkpoints: unknown[]
  [key: string]: unknown
}

export interface CreatorTemplate {
  key: string
  version: number
  status: CreatorTemplateStatus
  content: CreatorTemplateContent
  submittedVersion?: number | null
}

export class CreatorTemplatesApi {
  private readonly client: ApiClient

  constructor(client: ApiClient = apiClient) {
    this.client = client
  }

  list(): Promise<CreatorTemplate[]> {
    return this.client.get('/api/creator/templates')
  }

  get(key: string): Promise<CreatorTemplate> {
    return this.client.get(`/api/creator/templates/${encodeURIComponent(key)}`)
  }

  create(content: CreatorTemplateContent): Promise<CreatorTemplate> {
    return this.client.post('/api/creator/templates', { key: content.key, content })
  }

  createVersion(key: string, content: CreatorTemplateContent): Promise<CreatorTemplate> {
    return this.client.post(`/api/creator/templates/${encodeURIComponent(key)}/versions`, { content })
  }

  submit(key: string, version: number): Promise<CreatorTemplate> {
    return this.client.post(`/api/creator/templates/${encodeURIComponent(key)}/submit`, { version })
  }
}

export const creatorTemplatesApi = new CreatorTemplatesApi()
