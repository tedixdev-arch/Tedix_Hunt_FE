import type { OrganizerApplicationInput, OrganizationType } from '../services/api/organizerApplications.ts'

export interface ApplicationFormValues {
  name: string
  email: string
  organizationName: string
  organizationType: OrganizationType | ''
  reason: string
  phone: string
  password: string
  confirmPassword: string
}

export type ApplicationFormErrors = Partial<Record<keyof ApplicationFormValues, string>>

export function validateOrganizerApplication(values: ApplicationFormValues): ApplicationFormErrors {
  const errors: ApplicationFormErrors = {}
  if (!values.name.trim()) errors.name = 'Name is required.'
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = 'Enter a valid email address.'
  if (!values.organizationName.trim()) errors.organizationName = 'Organization name is required.'
  if (!values.organizationType) errors.organizationType = 'Select an organization type.'
  if (!values.reason.trim()) errors.reason = 'Tell us briefly why you want to organize Tedix Hunts.'
  if (!values.password) errors.password = 'Password is required.'
  else if (values.password.length < 8) errors.password = 'Password must be at least 8 characters.'
  if (!values.confirmPassword) errors.confirmPassword = 'Confirm your password.'
  else if (values.confirmPassword !== values.password) errors.confirmPassword = 'Passwords do not match.'
  return errors
}

export function toOrganizerApplicationInput(values: ApplicationFormValues): OrganizerApplicationInput {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    organizationName: values.organizationName.trim(),
    organizationType: values.organizationType as OrganizationType,
    reason: values.reason.trim(),
    phone: values.phone.trim() || null,
    password: values.password,
    confirmPassword: values.confirmPassword,
  }
}
