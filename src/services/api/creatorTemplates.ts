import type { TemplateMission } from '../../features/creator/mission.ts'
import { apiClient, type ApiClient } from './client.ts'
import type { CreatorGeographyConfiguration } from '../../features/creator/checkpointGeography.ts'

export type CreatorTemplateStatus = 'draft' | 'submitted' | 'approved' | 'changes_requested'

export interface CreatorTemplateContent {
  key: string
  version: number
  displayName: string
  theme: string
  mission: TemplateMission
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
  origin?: unknown
  // C2 classification and C6b-5 private owner projections. Omitted on legacy/older responses.
  category?: 'universal' | 'local' | null
  // F7-BE-01: Universal owner GETs only. Null means never published; omission means unavailable.
  publishedVersion?: number | null
  localApprovedVersion?: number | null
  localApproval?: {
    version: number | null
    authority: 'approved' | 'historical' | 'integrity_exception' | 'none'
    independentEvidence: boolean
    localityBound: boolean
  }
  localSuspension?: { at: string; byUserId: string; reason: string; version: number } | null
  submittedVersion?: number | null
}

export interface StarterTemplate {
  key: string
  displayName: string
  description: string
  createdAt?: string | null
  creationPath: string
}

// This allowlist validates supported operations; the catalog owns availability and presentation.
export function isSupportedStarter(starter: StarterTemplate): boolean {
  return ['signal-cluj-napoca', 'signal-overload-cluj-napoca'].includes(starter.key)
    && starter.creationPath === `/api/creator/templates/starters/${starter.key}`
}

export class CreatorTemplatesApi {
  private readonly client: ApiClient

  constructor(client: ApiClient = apiClient) {
    this.client = client
  }

  private starterRequest?: Promise<CreatorTemplate>

  createSignalClujDraft(): Promise<CreatorTemplate> {
    return this.createStarterDraft({ key: 'signal-cluj-napoca', creationPath: '/api/creator/templates/starters/signal-cluj-napoca', displayName: '', description: '' })
  }

  listStarters(): Promise<{ items: StarterTemplate[] }> {
    return this.client.get('/api/creator/templates/starters')
  }

  createStarterDraft(starter: StarterTemplate): Promise<CreatorTemplate> {
    if (!isSupportedStarter(starter)) return Promise.reject(new Error('Unsupported starter creation endpoint.'))
    if (this.starterRequest) return this.starterRequest
    this.starterRequest = this.client.post<CreatorTemplate>(starter.creationPath)
      .finally(() => { this.starterRequest = undefined })
    return this.starterRequest
  }

  createSignalOverloadClujDraft(): Promise<CreatorTemplate> {
    return this.createStarterDraft({ key: 'signal-overload-cluj-napoca', creationPath: '/api/creator/templates/starters/signal-overload-cluj-napoca', displayName: '', description: '' })
  }

  list(): Promise<CreatorTemplate[]> {
    return this.client.get('/api/creator/templates')
  }

  get(key: string): Promise<CreatorTemplate> {
    return this.client.get(`/api/creator/templates/${encodeURIComponent(key)}`)
  }

  delete(key: string): Promise<void> {
    return this.client.delete(`/api/creator/templates/${encodeURIComponent(key)}`)
  }

  create(content: CreatorTemplateContent, category?: 'universal'): Promise<CreatorTemplate> {
    return this.client.post('/api/creator/templates', { key: content.key, content, ...(category ? { category } : {}) })
  }

  createVersion(key: string, content: CreatorTemplateContent): Promise<CreatorTemplate> {
    return this.client.post(`/api/creator/templates/${encodeURIComponent(key)}/versions`, { content })
  }

  submit(key: string, version: number): Promise<CreatorTemplate> {
    return this.client.post(`/api/creator/templates/${encodeURIComponent(key)}/submit`, { version })
  }
}

export const creatorTemplatesApi = new CreatorTemplatesApi()
