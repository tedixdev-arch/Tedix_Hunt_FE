import { meetsPasswordPolicy, PASSWORD_POLICY_MESSAGE } from '../features/auth/passwordPolicy.ts'
import type { CreatorApplicationInput } from '../services/api/creatorApplications.ts'

export type CreatorApplicationFormValues = CreatorApplicationInput
export type CreatorApplicationFormErrors = Partial<Record<keyof CreatorApplicationFormValues, string>>

export function validateCreatorApplication(values: CreatorApplicationFormValues): CreatorApplicationFormErrors {
  const errors: CreatorApplicationFormErrors = {}
  if (!values.name.trim()) errors.name = 'Name is required.'
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = 'Enter a valid email address.'
  if (!values.password) errors.password = 'Password is required.'
  else if (!meetsPasswordPolicy(values.password)) errors.password = PASSWORD_POLICY_MESSAGE
  if (!values.confirmPassword) errors.confirmPassword = 'Confirm your password.'
  else if (values.confirmPassword !== values.password) errors.confirmPassword = 'Passwords do not match.'
  return errors
}

export function toCreatorApplicationInput(values: CreatorApplicationFormValues): CreatorApplicationInput {
  // Workflow state and roles are intentionally server-controlled.
  return { name: values.name.trim(), email: values.email.trim(), password: values.password, confirmPassword: values.confirmPassword }
}
