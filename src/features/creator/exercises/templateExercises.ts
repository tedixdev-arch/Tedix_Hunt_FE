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
    const selected = selectedAssignment(draft) === 'custom' ? draft.appliedCustom ?? draft.custom : undefined
    if (!cp) { if (selected) errors.push(`${experimentLabel(key)}: checkpoint was removed. Discard its exercise or restore the checkpoint count.`); continue }
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
export function reconcileExerciseDrafts(current: AuthoringDrafts, _sent: AuthoringDrafts, saved: CreatorTemplateContent): AuthoringDrafts {
  const acknowledged = hydrateExerciseDrafts(saved)
  return Object.fromEntries(Object.entries(current).map(([key, draft]) => {
    const identity = acknowledged[key]?.custom?.persistedIdentity
    const rebase = (exercise: typeof draft.custom) => exercise ? { ...exercise, persistedIdentity: identity } : undefined
    return [key, { ...draft, custom: rebase(draft.custom), appliedCustom: rebase(draft.appliedCustom),
      customByType: Object.fromEntries(Object.entries(draft.customByType ?? {}).map(([type, exercise]) => [type, rebase(exercise)])) }]
  }))
}
