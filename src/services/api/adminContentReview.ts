import { apiClient, ApiError, type ApiClient } from './client.ts'
import type { CustomType } from '../../features/creator/exercises/persistenceTypes.ts'
import type { LibraryContent, LibraryDraft } from './creatorContent.ts'

export interface ContentReviewItem {
  contentId: string; revisionId: string; version: number; status: 'submitted'; title: string
  classification: 'personal' | 'team'; type: CustomType; category: string | null
  curriculum: LibraryDraft['curriculum']; geographicScope: LibraryDraft['geography']['scope']
  countryCode: string | null; admin1Code: string | null; geographicId: string | null; submittedAt: string
}
export interface ContentReviewPage { items: ContentReviewItem[]; nextAfter: string | null }
export type ContentDecision = 'approve' | 'request-changes'
export function reviewCommentValid(value: string) {
  const comment = value.trim()
  return comment.length >= 3 && comment.length <= 1000 && /[\p{L}\p{N}]/u.test(comment)
}
export class AdminContentReviewApi {
  constructor(private readonly client: ApiClient = apiClient) {}
  list(after?: string): Promise<ContentReviewPage> { return this.client.get(`/api/admin/content/review?${new URLSearchParams({ limit: '20', ...(after ? { after } : {}) })}`) }
  detail(id: string, revision: string): Promise<LibraryContent> { return this.client.get(this.path(id, revision)) }
  decide(id: string, revision: string, decision: ContentDecision, comment?: string): Promise<LibraryContent> {
    return this.client.post(`${this.path(id, revision)}/${decision}`, decision === 'request-changes' ? { comment: comment?.trim() } : {})
  }
  private path(id: string, revision: string) { return `/api/admin/content/review/${encodeURIComponent(id)}/revisions/${encodeURIComponent(revision)}` }
}
export const adminContentReviewApi = new AdminContentReviewApi()
export function reviewError(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Content Review is unavailable. Please try again.'
  switch (error.status) {
    case 400: return 'Check the exercise and provide a comment of 3–1000 characters containing a letter or number.'
    case 401: return 'Sign in again to review content.'
    case 403: return error.message === 'content_self_review_forbidden' ? 'You cannot review your own exercise. Another Admin must review it.' : 'You do not have permission to review this exercise.'
    case 404: return 'This submission is no longer available. The queue has been refreshed.'
    case 409: return 'This submission has already changed or been reviewed. The queue has been refreshed.'
    default: return 'Content Review is unavailable. No decision was confirmed. Please try again.'
  }
}
