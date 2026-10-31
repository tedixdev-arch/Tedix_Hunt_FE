import type { CheckpointGameplay } from './checkpointGameplay.ts'
import { validateCustomExercises } from './exercises/persistenceValidation.ts'
import { serializeMission } from './mission.ts'
import { createCheckpointDrafts } from './checkpointGeography.ts'
import { gameplayValidation } from './checkpointGameplay.ts'
import { finishPointValidation } from './finishPoint.ts'
import { ApiError } from '../../services/api/client.ts'
import type { CreatorTemplate, CreatorTemplateContent, CreatorTemplatesApi } from '../../services/api/creatorTemplates.ts'
import type { CheckpointDraft, CreatorGeographyConfiguration } from './checkpointGeography.ts'

export function normalizeTemplateKey(name: string): string {
  return name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function templateContentEqual(current: CreatorTemplateContent, persisted: CreatorTemplateContent): boolean {
  const canonical = (value: unknown): unknown => Array.isArray(value) ? value.map(canonical)
    : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, v]) => [key, canonical(v)])) : value
  return JSON.stringify(canonical({ ...current, version: persisted.version })) === JSON.stringify(canonical(persisted))
}

/** A custom save is confirmed only by a complete, correctly owned authoritative response. */
export function verifyCustomSave(sent: CreatorTemplateContent, saved: CreatorTemplate): CreatorTemplate {
  if (!saved?.content) throw new Error('Saving could not be confirmed: the server returned no Template content.')
  const before = sent.checkpoints as CheckpointGameplay[], after = saved.content.checkpoints as CheckpointGameplay[]
  const issues = validateCustomExercises(saved.content)
  if (issues.length) throw new Error('Saving could not be confirmed: the server returned invalid custom content.')
  for (const cp of before) for (const slot of ['personal', 'team'] as const) {
    const expected = cp.customExercises?.[slot]
    if (!expected) continue
    const destination = after.find(row => cp.role === 'terminal' ? row.role === 'terminal' : row.role !== 'terminal' && (row.checkpoint ?? row.checkpointNumber) === (cp.checkpoint ?? cp.checkpointNumber))
    const actual = destination?.customExercises?.[slot]
    if (!actual?.id || actual.owner?.templateKey !== saved.key || actual.owner.version !== saved.version) throw new Error('Saving could not be confirmed: custom exercise identity or ownership is missing from the server response.')
    const data = (e: typeof expected) => { const { id: _id, owner: _owner, ...rest } = e; return rest }
    if (!templateContentEqual({ ...sent, checkpoints: [data(expected)] }, { ...sent, checkpoints: [data(actual)] })) throw new Error('Saving could not be confirmed: the server response differs from the authored exercise. Your draft is kept.')
  }
  return saved
}

export async function persistCreatorTemplate(api: Pick<CreatorTemplatesApi, 'create' | 'createVersion'>, current: CreatorTemplateContent, persisted: CreatorTemplate | null, category?: 'universal' | 'local', localityId?: string | null): Promise<CreatorTemplate> {
  const issues = validateCustomExercises(current)
  if (issues.length) throw new Error(issues.map(issue => `${issue.path}: ${issue.message}`).join('\n'))
  const revision = persisted?.category && ['approved', 'changes_requested'].includes(persisted.status)
  if (!revision && localityId === undefined && persisted && templateContentEqual(current, persisted.content)) return persisted
  current = { ...current, mission: serializeMission(current.mission) }
  const validation = finishPointValidation(current.configuration) || gameplayValidation(current)
  if (validation) throw new Error(validation)
  if (!persisted) return verifyCustomSave(current, await (category ? api.create({ ...current, version: 1 }, category, ...(localityId !== undefined ? [localityId] as const : [])) : api.create({ ...current, version: 1 })))
  if (!revision && localityId === undefined && templateContentEqual(current, persisted.content)) return persisted
  return verifyCustomSave(current, await api.createVersion(persisted.key, { ...current, key: persisted.key, version: persisted.version + 1 }, ...(localityId !== undefined ? [localityId] as const : [])))
}

export function hydratePersistedGeography(configuration: CreatorGeographyConfiguration): {
  checkpointDrafts: CheckpointDraft[]
  verifiedPositions: Set<number>
  routeSafety: Set<string>
} {
  return {
    checkpointDrafts: configuration.normalCheckpointCount === undefined
      ? (configuration.checkpointPositions ?? []).map(position => ({ ...position }))
      : createCheckpointDrafts(configuration.normalCheckpointCount, []).map(draft => {
        const saved = configuration.checkpointPositions?.find(point => point.checkpointNumber === draft.checkpointNumber)
        return saved ? { ...saved } : draft
      }),
    // The current Template content contract stores positions, not Creator verification or route-safety confirmation.
    verifiedPositions: new Set(),
    routeSafety: new Set(),
  }
}

export function creatorTemplateError(error: unknown, operation: 'save' | 'submit' | 'load' | 'starter' | 'delete'): string {
  if (!(error instanceof ApiError)) return error instanceof Error ? error.message : 'The backend is unavailable. Please try again.'
  const payload = error.details && typeof error.details === 'object' ? error.details as { error?: string; details?: { path: string; message: string }[] } : {}
  if (payload.error === 'invalid_custom_exercises') return `Custom exercise validation failed. ${payload.details?.map(issue => `${issue.path}: ${issue.message}`).join(' ') ?? 'Check schema version, mechanic, checkpoint assignment, and same-slot ownership, then save again.'}`
  if (error.status === 409 && operation === 'save') return 'This Template version changed or is immutable. Your edits are kept; reopen the latest version before saving again.'
  if (operation === 'save' && (error.status === null || error.status >= 500)) return 'Saving could not be confirmed. Your work is kept. Check My Templates and reopen the latest version before retrying.'
  if (error.status === 401) return 'Your session has expired. Please sign in again.'
  if (error.status === 403) return 'Your Creator account is not authorized to perform this action.'
  if (operation === 'delete') {
    if (error.status === 404) return 'This Template was not found or is no longer owned by your account. Cancel and refresh My Templates before trying again.'
    const code = error.details && typeof error.details === 'object' && 'error' in error.details ? error.details.error : undefined
    if (error.status === 409 && code === 'template_not_deletable') return 'This Template can no longer be deleted in its current status. Only drafts and changes requested Templates can be deleted. Cancel and refresh My Templates.'
    if (error.status === 409 && code === 'template_in_use') return 'This Template is in use by a Hunt or has protected dependencies and cannot be deleted. Cancel and keep this Template, or contact support.'
    return 'Deletion could not be confirmed. Cancel and refresh My Templates to check its current state, or retry.'
  }
  if (operation === 'load' && (error.status === 400 || error.status === 409)) return 'The Template list could not be loaded. Retry to refresh its current state.'
  if (operation === 'starter' && error.status === 404) return 'This starter is unavailable in the deployed backend. No alternative starter was created. Please try again when it is available.'
  if (error.status === 404) return 'This Creator Template could not be found. Return to Creator Studio and reopen it.'
  if (operation === 'starter' && error.status === 409) return 'The selected starter could not be created because of a conflict. Return to the dashboard and check your drafts before retrying.'
  if (operation === 'starter' && (error.status === null || error.status >= 500)) return 'Starter creation could not be confirmed. Check your drafts before retrying to avoid creating a duplicate.'
  if (error.status === 409) return operation === 'save'
    ? 'That Template key is already in use or this version can no longer be changed. Choose a distinct Template name and try again.'
    : 'This Template cannot be submitted in its current lifecycle state.'
  if (error.status === 400) return operation === 'save'
    ? 'The Template content or key is invalid. Check the required fields and try again.'
    : 'The latest saved version could not be submitted. Check FinishPoint geography and gameplay, supported activity types, and normal checkpoint numbering; save the corrected version and retry.'
  return error.message || `The Template could not be ${operation === 'load' ? 'loaded' : operation === 'save' ? 'saved' : 'submitted'}. Please try again.`
}
