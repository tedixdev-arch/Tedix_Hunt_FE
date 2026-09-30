import { ApiError } from '../../services/api/client.ts'
import type { CreatorTemplate, CreatorTemplateContent, CreatorTemplatesApi } from '../../services/api/creatorTemplates.ts'

export function normalizeTemplateKey(name: string): string {
  return name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function templateContentEqual(current: CreatorTemplateContent, persisted: CreatorTemplateContent): boolean {
  return JSON.stringify({ ...current, version: persisted.version }) === JSON.stringify(persisted)
}

export async function persistCreatorTemplate(api: Pick<CreatorTemplatesApi, 'create' | 'createVersion'>, current: CreatorTemplateContent, persisted: CreatorTemplate | null): Promise<CreatorTemplate> {
  if (!persisted) return api.create({ ...current, version: 1 })
  if (templateContentEqual(current, persisted.content)) return persisted
  return api.createVersion(persisted.key, { ...current, key: persisted.key, version: persisted.version + 1 })
}

export function creatorTemplateError(error: unknown, operation: 'save' | 'submit' | 'load'): string {
  if (!(error instanceof ApiError)) return 'The backend is unavailable. Please try again.'
  if (error.status === 401) return 'Your session has expired. Please sign in again.'
  if (error.status === 403) return 'Your Creator account is not authorized to perform this action.'
  if (error.status === 404) return 'This Creator Template could not be found. Return to Creator Studio and reopen it.'
  if (error.status === 409) return operation === 'save'
    ? 'That Template key is already in use or this version can no longer be changed. Choose a distinct Template name and try again.'
    : 'This Template cannot be submitted in its current lifecycle state.'
  if (error.status === 400) return operation === 'save'
    ? 'The Template content or key is invalid. Check the required fields and try again.'
    : 'The latest saved version could not be submitted. Refresh and try again.'
  return error.message || `The Template could not be ${operation === 'load' ? 'loaded' : operation === 'save' ? 'saved' : 'submitted'}. Please try again.`
}
