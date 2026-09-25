import { ApiError } from '../../services/api/client.ts'

function errorCode(error: ApiError): string | undefined {
  if (!error.details || typeof error.details !== 'object') return undefined
  const details = error.details as { code?: unknown; error?: unknown }
  return typeof details.code === 'string' ? details.code : typeof details.error === 'string' ? details.error : undefined
}

export function organizerActivationErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return 'We couldn\'t activate your Organizer account. Please try again.'

  const code = errorCode(error)
  if (code === 'activation_token_expired' || code === 'organizer_activation_expired') return 'This activation link has expired.'
  if (code === 'activation_token_used' || code === 'activation_already_used' || code === 'organizer_already_activated') return 'This activation link has already been used and is no longer valid.'
  if (code === 'invalid_activation_token' || code === 'organizer_activation_invalid' || error.kind === 'unauthorized') return 'This activation link is invalid.'
  if (code === 'invalid_password' || code === 'password_validation_failed' || error.kind === 'bad_request') return 'That password was not accepted. Check the requirements and try again.'
  if (error.kind === 'conflict') return 'This activation link is no longer valid. Try signing in or submit a new application.'
  return 'We couldn\'t activate your Organizer account. Please try again.'
}
