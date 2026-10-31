import { prototypes, type Exercise } from './catalog'
import { authorPrototype, fromPersistence, toPersistence } from './persistenceAdapter'
import type { CheckpointGameplay } from '../checkpointGameplay'
import type { AuthoringDrafts } from './experimentDrafts'

/** Complete Creator examples only. No corresponding legacy assignment or Participant delivery contract exists.
 * Stable content IDs support recognizing old example snapshots, never publication authority.
 */
export const personalExamples: readonly Exercise[] = prototypes.map(prototype => {
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
export const exampleFor = (key: string) => personalExamples.find(e => e.type === key)
export function matchesExampleContent(key: unknown, exercise: Exercise): boolean {
  const preset = typeof key === 'string' && exampleFor(key)
  if (!preset) return false
  const snapshot = (e: Exercise) => { const { id: _id, owner: _owner, ...content } = toPersistence(e); return content }
  return JSON.stringify(snapshot(preset)) === JSON.stringify(snapshot(exercise))
}
/** Content recognition is advisory and independent of the uncontracted checkpoint metadata.
 * It describes matching example CONTENT, never the origin/identity of an independently authored copy.
 */
export function exampleContentKey(exercise: Exercise): string | undefined {
  try { return personalExamples.find(example => matchesExampleContent(example.type, exercise))?.type } catch { return undefined }
}

export function personalChallengeStatus(cp: CheckpointGameplay | undefined, draft?: AuthoringDrafts[string]): string {
  const selected = draft?.assignment === 'custom' ? draft.appliedCustom ?? draft.custom : undefined
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
