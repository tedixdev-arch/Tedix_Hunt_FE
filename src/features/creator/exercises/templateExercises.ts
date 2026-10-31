import type { CreatorTemplateContent } from '../../../services/api/creatorTemplates.ts'
import type { CheckpointGameplay } from '../checkpointGameplay.ts'
import type { AuthoringDrafts } from './experimentDrafts.ts'
import { experimentLabel, selectedAssignment } from './experimentDrafts.ts'
import { authorPrototype, fromPersistence, toPersistence } from './persistenceAdapter.ts'

export function hydrateExerciseDrafts(content: CreatorTemplateContent): AuthoringDrafts {
  const drafts: AuthoringDrafts = {}
  for (const cp of content.checkpoints as CheckpointGameplay[]) for (const [field, slot] of [['kind', 'personal'], ['teamKind', 'team']] as const) {
    const e = cp.customExercises?.[slot]
    if (e) drafts[`${field}:${cp.role === 'terminal' ? 'terminal' : Number(cp.checkpoint ?? cp.checkpointNumber) - 1}`] = { source: 'custom', custom: fromPersistence(e), assignment: 'custom' }
  }
  return drafts
}
export function applyExerciseDrafts(checkpoints: unknown[], drafts: AuthoringDrafts) {
  const result = structuredClone(checkpoints) as CheckpointGameplay[], errors: string[] = []
  for (const [key, draft] of Object.entries(drafts)) {
    const [field, index] = key.split(':'), slot = field === 'teamKind' ? 'team' : 'personal'
    const cp = result.find(cp => index === 'terminal' ? cp.role === 'terminal' : cp.role !== 'terminal' && cp.checkpoint === Number(index) + 1)
    const selected = draft.custom ?? draft.exercise
    if (!cp) { if (selected && selectedAssignment(draft) === 'custom') errors.push(`${experimentLabel(key)}: checkpoint was removed. Discard its exercise or restore the checkpoint count.`); continue }
    if (selectedAssignment(draft) === 'predefined') {
      if (cp.customExercises) { delete cp.customExercises[slot]; if (!Object.keys(cp.customExercises).length) delete cp.customExercises }
      continue
    }
    if (!selected) { errors.push(`${experimentLabel(key)}: select or create a custom exercise before saving.`); continue }
    try {
      const converted = toPersistence(selected.authored ? selected : authorPrototype(selected))
      if (converted.classification !== slot) throw new Error('Exercise classification does not match this slot.')
      cp.customExercises = { ...cp.customExercises, [slot]: converted }
    } catch (error) { errors.push(`${experimentLabel(key)}: ${error instanceof Error ? error.message : 'Invalid exercise content'}`) }
  }
  return { checkpoints: result, errors }
}
/** A response acknowledges only its sent snapshot; newer drafts keep their data, with refreshed same-slot ownership. */
export function reconcileExerciseDrafts(current: AuthoringDrafts, sent: AuthoringDrafts, saved: CreatorTemplateContent): AuthoringDrafts {
  const acknowledged = hydrateExerciseDrafts(saved), next = { ...current }
  for (const [key, draft] of Object.entries(current)) {
    const persisted = acknowledged[key]?.custom
    const custom = draft.custom
    const identity = persisted?.persistedIdentity
    const customByType = Object.fromEntries(Object.entries(draft.customByType ?? {}).map(([type, variant]) => [type, { ...variant, persistedIdentity: identity }]))
    next[key] = { ...draft, customByType, ...(custom ? { custom: { ...custom, persistedIdentity: identity } } : {}) }
    if (!custom || !sent[key]?.custom || !persisted) continue
    if (JSON.stringify(draft) === JSON.stringify(sent[key])) next[key] = { ...draft, custom: { ...persisted, id: custom.id }, customByType: { ...customByType, [persisted.type]: { ...persisted, id: custom.id } } }
    else next[key] = { ...next[key], custom: { ...custom, persistedIdentity: persisted.persistedIdentity } }
  }
  return next
}
