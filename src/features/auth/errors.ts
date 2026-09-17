import { ApiError } from '../../services/api/client.ts'

export function authErrorMessage(error: unknown, action: 'login' | 'register' | 'guest' | 'logout' = 'login') {
  if (!(error instanceof ApiError)) return 'Something went wrong. Please try again.'
  if (error.kind === 'network') return 'Service unavailable. Please try again.'
  if (error.kind === 'conflict') return 'An account with this email already exists.'
  if (error.kind === 'unauthorized') return action === 'logout' ? 'You have been signed out.' : 'Email or password is incorrect.'
  if (error.kind === 'bad_request') return 'Check your information and try again.'
  return 'Unable to complete your request. Please try again.'
}
