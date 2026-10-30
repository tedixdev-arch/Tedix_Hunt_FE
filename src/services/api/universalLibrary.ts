import { apiClient, type ApiClient } from './client.ts'
import type { CreatorTemplateContent } from './creatorTemplates.ts'

/** C3/C5 public-to-Creators projection, separate from private owner drafts. */
export interface PublishedUniversal {
  id: string
  key: string
  displayName: string
  theme: string
  creator: { id: string; name: string | null }
  publishedReference: { templateId: string; version: number }
}
export interface PublishedUniversalDetail extends PublishedUniversal {
  content: CreatorTemplateContent
}

export class UniversalLibraryApi {
  private readonly client: ApiClient

  constructor(client: ApiClient = apiClient) { this.client = client }

  list(): Promise<{ items: PublishedUniversal[] }> {
    return this.client.get('/api/creator/universal-library')
  }

  get(key: string): Promise<PublishedUniversalDetail> {
    return this.client.get(`/api/creator/universal-library/${encodeURIComponent(key)}`)
  }
}

export const universalLibraryApi = new UniversalLibraryApi()
