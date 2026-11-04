import { apiClient, ApiError, type ApiClient } from './client.ts'
import type { CustomExercise } from '../../features/creator/exercises/persistenceTypes.ts'
export const contentCategories = ['Mathematics', 'History', 'Science', 'Mixed'] as const
export type LibraryGeography = { scope: 'universal' } | { scope: 'country'; countryCode: string } | { scope: 'region'; countryCode: string; admin1Code: string } | { scope: 'city'; countryCode: string; geographicId: string }
export interface LibraryDraft { exercise: CustomExercise; category: string | null; curriculum: { subject?: 'math'; grade?: string }; geography: LibraryGeography }
export interface LibraryReviewEvent { eventId: string; contentId: string; revisionId: string; actorUserId: string; decision: 'submitted' | 'approved' | 'changes_requested'; comment: string | null; decidedAt: string }
export interface LibraryContent extends LibraryDraft { contentId: string; revisionId: string; ownerId: string; version: number; status: 'draft' | 'submitted' | 'approved' | 'changes_requested' | 'archived'; createdAt: string; updatedAt: string; reviewEvents?: LibraryReviewEvent[] }
export interface LibraryPage { items: LibraryContent[]; nextAfter: string | null }
export class CreatorContentApi {
  constructor(private readonly client: ApiClient = apiClient) {}
  list(after?: string): Promise<LibraryPage> { return this.client.get(`/api/creator/content?${new URLSearchParams({ limit: '20', view: 'all', ...(after ? { after } : {}) })}`) }
  get(id: string): Promise<LibraryContent> { return this.client.get(`/api/creator/content/${encodeURIComponent(id)}`) }
  create(body: LibraryDraft): Promise<LibraryContent> { return this.client.post('/api/creator/content', body) }
  update(id: string, baseRevisionId: string, body: LibraryDraft): Promise<LibraryContent> { return this.client.put(`/api/creator/content/${encodeURIComponent(id)}`, { ...body, baseRevisionId }) }
  clone(id: string, baseRevisionId: string): Promise<LibraryContent> { return this.client.post(`/api/creator/content/${encodeURIComponent(id)}/revisions`, { baseRevisionId }) }
  submit(id: string, revisionId: string): Promise<LibraryContent> { return this.client.post(`/api/creator/content/${encodeURIComponent(id)}/revisions/${encodeURIComponent(revisionId)}/submit`, {}) }
  revision(id: string, revision: string): Promise<LibraryContent> { return this.client.get(`/api/creator/content/${encodeURIComponent(id)}/revisions/${encodeURIComponent(revision)}`) }
}
export const creatorContentApi = new CreatorContentApi()
export function contentError(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Unable to save or load this exercise. Please try again.'
  switch (error.status) {
    case 400: return 'Review the exercise and classification. Choose a valid catalog location.'
    case 401: return 'Sign in again to access your Library. Your edits are still here.'
    case 403: return 'Your account does not have permission to access this content.'
    case 404: return 'This exercise is unavailable.'
    case 409: return 'A newer version or status exists. Your edits are still here. Reload the saved version to continue.'
    case 413: return 'This exercise is too large. Shorten it before saving.'
    default: return 'The Library is unavailable. Your edits are still here. Please try again.'
  }
}
