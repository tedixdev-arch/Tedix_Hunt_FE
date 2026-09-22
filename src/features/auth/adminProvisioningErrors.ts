import { ApiError } from '../../services/api/client.ts'

function errorCode(error: ApiError): string | undefined {
  if (!error.details || typeof error.details !== 'object') return undefined
  const details = error.details as { code?: unknown; error?: unknown }
  return typeof details.code === 'string' ? details.code : typeof details.error === 'string' ? details.error : undefined
}

export function provisioningErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const code = errorCode(error)
    if (code === 'admin_activation_already_pending') return 'This Admin already has an active invitation. Use the existing activation link or wait for it to expire.'
    if (code === 'guest_promotion_not_allowed') return 'Guest accounts cannot be promoted directly to Admin.'
  }
  return 'Unable to add this Admin. Please check the details and try again.'
}
