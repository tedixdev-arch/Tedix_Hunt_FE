import { isPredefinedSnapshot } from './predefinedPersonal.ts'
import type { CreatorTemplateContent } from '../../../services/api/creatorTemplates.ts'
import type { CheckpointGameplay } from '../checkpointGameplay.ts'
import type { AuthoringDrafts } from './experimentDrafts.ts'
import { experimentLabel, selectedAssignment } from './experimentDrafts.ts'
import { authorPrototype, fromPersistence, toPersistence } from './persistenceAdapter.ts'

export function hydrateExerciseDrafts(content: CreatorTemplateContent): AuthoringDrafts {
  const drafts: AuthoringDrafts = {}
  for (const cp of content.checkpoints as CheckpointGameplay[]) for (const [field, slot] of [['kind', 'personal'], ['teamKind', 'team']] as const) {
    const e = cp.customExercises?.[slot]
    if (e) drafts[`${field}:${cp.role === 'terminal' ? 'terminal' : Number(cp.checkpoint ?? cp.checkpointNumber) - 1}`] = slot === 'personal' && isPredefinedSnapshot(cp.personalChallengePreset, fromPersistence(e)) ? { source: 'saved', predefined: fromPersistence(e), predefinedKey: String(cp.personalChallengePreset), assignment: 'predefined' } : { source: 'custom', custom: fromPersistence(e), assignment: 'custom' }
  }
  return drafts
}
export function applyExerciseDrafts(checkpoints: unknown[], drafts: AuthoringDrafts) {
  const result = structuredClone(checkpoints) as CheckpointGameplay[], errors: string[] = []
  for (const [key, draft] of Object.entries(drafts)) {
    const [field, index] = key.split(':'), slot = field === 'teamKind' ? 'team' : 'personal'
    const cp = result.find(cp => index === 'terminal' ? cp.role === 'terminal' : cp.role !== 'terminal' && cp.checkpoint === Number(index) + 1)
    const selected = selectedAssignment(draft) === 'predefined' ? draft.predefined : draft.appliedCustom ?? draft.custom ?? draft.exercise
    if (!cp) { if (selected) errors.push(`${experimentLabel(key)}: checkpoint was removed. Discard its exercise or restore the checkpoint count.`); continue }
    if (selectedAssignment(draft) === 'predefined' && !draft.predefined) {
      if (slot === 'personal') delete cp.personalChallengePreset
      if (cp.customExercises) { delete cp.customExercises[slot]; if (!Object.keys(cp.customExercises).length) delete cp.customExercises }
      continue
    }
    if (!selected) { errors.push(`${experimentLabel(key)}: select or create a custom exercise before saving.`); continue }
    try {
      const converted = toPersistence(selected.authored ? selected : authorPrototype(selected))
      if (converted.classification !== slot) throw new Error('Exercise classification does not match this slot.')
      cp.customExercises = { ...cp.customExercises, [slot]: converted }
      if (slot === 'personal') {
        if (draft.assignment === 'predefined' && draft.predefinedKey && isPredefinedSnapshot(draft.predefinedKey, selected)) cp.personalChallengePreset = draft.predefinedKey
        else delete cp.personalChallengePreset
      }
    } catch (error) { errors.push(`${experimentLabel(key)}: ${error instanceof Error ? error.message : 'Invalid exercise content'}`) }
  }
  const used = new Set<string>()
  for (const cp of result) {
    if (typeof cp.personalChallengePreset !== 'string') continue
    if (used.has(cp.personalChallengePreset)) errors.push('This predefined challenge is already assigned to another checkpoint. Replace or remove that assignment first.')
    used.add(cp.personalChallengePreset)
  }
  return { checkpoints: result, errors }
}
/** A response acknowledges only its sent snapshot; newer drafts keep their data, with refreshed same-slot ownership. */
export function reconcileExerciseDrafts(current: AuthoringDrafts, _sent: AuthoringDrafts, saved: CreatorTemplateContent): AuthoringDrafts {
  const acknowledged = hydrateExerciseDrafts(saved)
  return Object.fromEntries(Object.entries(current).map(([key, draft]) => {
    const identity = (acknowledged[key]?.custom ?? acknowledged[key]?.predefined)?.persistedIdentity
    const rebase = (exercise: typeof draft.custom) => exercise ? { ...exercise, persistedIdentity: identity } : undefined
    return [key, { ...draft, custom: rebase(draft.custom), appliedCustom: rebase(draft.appliedCustom), predefined: rebase(draft.predefined),
      customByType: Object.fromEntries(Object.entries(draft.customByType ?? {}).map(([type, exercise]) => [type, rebase(exercise)])) }]
  }))
}
