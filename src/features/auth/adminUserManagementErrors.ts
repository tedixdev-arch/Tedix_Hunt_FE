import { ApiError } from '../../services/api/client.ts'

const messages: Record<string, string> = {
  last_active_admin: 'This change would remove the last active Admin and is not allowed.',
  self_admin_removal_not_allowed: 'You cannot remove your own Admin capability.',
  admin_password_change_not_allowed: "Another Admin's password cannot be changed here.",
  self_password_change_use_account_security: 'Use Account Security to change your own password.',
  user_has_protected_dependencies: 'This user cannot be deleted because they have protected business or history dependencies.',
  self_delete_not_allowed: 'You cannot delete your own account.',
  user_not_found: 'This user no longer exists. Refresh the list and try again.',
  email_already_exists: 'An account with this email already exists.',
  duplicate_email: 'An account with this email already exists.',
  user_blocked: 'This account is blocked.',
  account_blocked: 'This account is blocked.',
}

function codeFrom(error: ApiError) {
  if (!error.details || typeof error.details !== 'object') return undefined
  const details = error.details as { code?: unknown; error?: unknown }
  if (typeof details.code === 'string') return details.code
  if (typeof details.error === 'string') return details.error
  if (details.error && typeof details.error === 'object' && 'code' in details.error) {
    const nested = (details.error as { code?: unknown }).code
    return typeof nested === 'string' ? nested : undefined
  }
}

export function adminUserManagementError(error: unknown) {
  if (!(error instanceof ApiError)) return 'Unable to complete this action. Please try again.'
  const code = codeFrom(error)
  if (code && messages[code]) return messages[code]
  if (error.status === 404) return messages.user_not_found
  if (error.status === 409) return 'This change conflicts with the current account state. Refresh and try again.'
  if (error.status === 400) return 'Check the entered details and try again.'
  return error.status === null ? 'The service is unavailable. Please try again.' : 'Unable to complete this action. Please try again.'
}
