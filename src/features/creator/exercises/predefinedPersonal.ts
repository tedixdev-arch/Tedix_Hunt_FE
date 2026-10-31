import { prototypes, type Exercise } from './catalog'
import { authorPrototype, fromPersistence, toPersistence } from './persistenceAdapter'
import type { CheckpointGameplay } from '../checkpointGameplay'
import type { AuthoringDrafts } from './experimentDrafts'

/** Complete version-owned snapshots, not mechanic references or shared database records. */
export const predefinedPersonal: readonly Exercise[] = prototypes.map(prototype => {
  const converted = authorPrototype(prototype)
  // Stable content identities make the predefined snapshot deterministic across reloads.
  const identities = new Map<string, string>()
  const stable = (value: any): any => {
    if (Array.isArray(value)) return value.map(stable)
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, v]) => [key, stable(v)]))
    if (typeof value === 'string' && value.startsWith('item-')) {
      if (!identities.has(value)) identities.set(value, `preset-${prototype.type}-${identities.size + 1}`)
      return identities.get(value)
    }
    return value
  }
  const exercise = { ...converted, id: `predefined:${prototype.type}`, authored: stable(converted.authored) }
  toPersistence(exercise) // Fail visibly if any example ceases to satisfy the contract.
  return exercise
})
export const predefinedFor = (key: string) => predefinedPersonal.find(e => e.type === key)
export function isPredefinedSnapshot(key: unknown, exercise: Exercise): boolean {
  const preset = typeof key === 'string' && predefinedFor(key)
  if (!preset) return false
  const snapshot = (e: Exercise) => { const { id: _id, owner: _owner, ...content } = toPersistence(e); return content }
  return JSON.stringify(snapshot(preset)) === JSON.stringify(snapshot(exercise))
}
/** Pending selections override saved assignments. Scoped to this Template's normal/terminal slots. */
export function predefinedAssignments(checkpoints: CheckpointGameplay[], drafts: AuthoringDrafts): Record<string, string> {
  const assigned: Record<string, string> = {}
  for (const cp of checkpoints) {
    const slot = cp.role === 'terminal' ? 'terminal' : String(Number(cp.checkpoint ?? cp.checkpointNumber) - 1)
    const draft = drafts[`kind:${slot}`]
    const key = draft ? draft.assignment === 'predefined' ? draft.predefinedKey : undefined : cp.personalChallengePreset
    if (typeof key === 'string') assigned[key] = slot
  }
  for (const [slotKey, draft] of Object.entries(drafts)) {
    if (slotKey.startsWith('kind:') && draft.assignment === 'predefined' && draft.predefinedKey) assigned[draft.predefinedKey] = slotKey.slice(5)
  }
  return assigned
}

export function personalChallengeStatus(cp: CheckpointGameplay | undefined, draft?: AuthoringDrafts[string]): string {
  const selected = draft?.assignment === 'custom' ? draft.appliedCustom ?? draft.custom : draft?.predefined
  if (selected) {
    try {
      const { id: _id, owner: _owner, ...content } = toPersistence(selected)
      const savedExercise = cp?.customExercises?.personal
      const { id: _savedId, owner: _savedOwner, ...saved } = savedExercise ? toPersistence(fromPersistence(savedExercise)) : {} as any
      return JSON.stringify(content) === JSON.stringify(saved) ? 'Challenge assigned' : 'Unsaved changes'
    } catch { return 'Challenge incomplete' }
  }
  if (draft?.custom) return 'Unsaved changes'
  return cp?.kind || cp?.customExercises?.personal ? 'Challenge assigned' : 'No challenge assigned'
}
