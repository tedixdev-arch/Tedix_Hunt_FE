import { ApiError } from '../../services/api/client.ts'

export const PASSWORD_POLICY_MESSAGE = 'Password must be at least 8 characters and include a letter, a number, and a special character.'
export const PASSWORD_REQUIREMENT_TEXT = 'At least 8 characters, including a letter, a number, and a special character.'

export function meetsPasswordPolicy(password: string) {
  return password.length >= 8
    && /[A-Za-z]/.test(password)
    && /[0-9]/.test(password)
    && /[^A-Za-z0-9]/.test(password)
}

export function isPasswordPolicyError(error: unknown) {
  if (!(error instanceof ApiError) || !error.details || typeof error.details !== 'object') return false
  const details = error.details as { code?: unknown; error?: unknown }
  if (details.code === 'password_policy_not_met' || details.error === 'password_policy_not_met') return true
  return Boolean(details.error && typeof details.error === 'object'
    && 'code' in details.error
    && (details.error as { code?: unknown }).code === 'password_policy_not_met')
}
