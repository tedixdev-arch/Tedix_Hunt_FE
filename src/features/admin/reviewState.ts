import { ApiError } from '../../services/api/client.ts'
import type { AdminTemplateReview } from '../../services/api/adminTemplateReviews.ts'
export const reviewCategories = ['Universal', 'Local', 'Locality proposals', 'Legacy'] as const
export type ReviewCategory = typeof reviewCategories[number]
export function reviewCategory(review: AdminTemplateReview): ReviewCategory {
  return review.category === 'universal' ? 'Universal' : review.category === 'local' ? 'Local' : 'Legacy'
}
export function reviewError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Your session has expired. Sign in again to review.'
    if (error.status === 403) return 'Admin access is required, or this decision is not permitted for your account.'
    if (error.status === 404) return 'This item is unavailable for review. It may have changed, already been reviewed, or no longer be accessible. Refresh the queue.'
    if (error.status === 409) return 'This item changed. Refresh inspection before making a new decision.'
  }
  return 'The review could not be loaded or saved. Please retry.'
}
