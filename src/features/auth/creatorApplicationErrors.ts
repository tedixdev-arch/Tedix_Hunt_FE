import { ApiError } from '../../services/api/client.ts'
import { PASSWORD_POLICY_MESSAGE } from './passwordPolicy.ts'

function containsCode(value: unknown, code: string): boolean {
  if (value === code) return true
  if (!value || typeof value !== 'object') return false
  return Object.values(value).some(item => containsCode(item, code))
}

export function creatorApplicationErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "We couldn't submit your application. Please try again."
  if (containsCode(error.details, 'password_policy_not_met')) return PASSWORD_POLICY_MESSAGE
  if (containsCode(error.details, 'password_confirmation_mismatch')) return 'Passwords do not match.'
  if (containsCode(error.details, 'creator_application_conflict')) return 'A Creator application or account already exists for this email.'
  if (containsCode(error.details, 'invalid_input')) return 'Please check the application details and try again.'
  return error.status === 400 ? 'Please check the application details and try again.' : "We couldn't submit your application. Please try again."
}

export function creatorDecisionErrorMessage(error: unknown): string {
  if (error instanceof ApiError && containsCode(error.details, 'application_already_decided')) return 'This application has already been reviewed. Refreshing its current status.'
  if (error instanceof ApiError && containsCode(error.details, 'application_not_found')) return 'This application no longer exists. Refreshing the list.'
  if (error instanceof ApiError && error.status === 401) return 'Your session has expired. Please sign in again.'
  if (error instanceof ApiError && error.status === 403) return 'Admin access is required to review applications.'
  return 'Unable to update this application. Please try again.'
}
