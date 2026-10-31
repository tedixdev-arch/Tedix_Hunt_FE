import type { Exercise, Mechanic } from './catalog.ts'

/** Session-only state. This structure is never part of CreatorTemplateContent. */
export interface AuthoringDraft {
  source: 'saved' | 'example' | 'custom'
  exercise?: Exercise
  custom?: Exercise
  customByType?: Partial<Record<Mechanic, Exercise>>
  intendedForSubmission?: boolean
}
export type AuthoringDrafts = Record<string, AuthoringDraft>
export const hasExperiment = (draft: AuthoringDraft) => !!(draft.custom || draft.exercise || draft.source !== 'saved')
export const experimentalEntries = (drafts: AuthoringDrafts) => Object.entries(drafts).filter(([, draft]) => hasExperiment(draft))
export const intendedExperiments = (drafts: AuthoringDrafts) => experimentalEntries(drafts).some(([, draft]) => draft.intendedForSubmission !== false)
export function experimentLabel(key: string) {
  const [field, checkpoint] = key.split(':')
  return `${field === 'teamKind' ? 'Team Challenge' : 'Personal Challenge'} · ${checkpoint === 'terminal' ? 'FinishPoint' : `Checkpoint ${Number(checkpoint) + 1}`}`
}
export function discardExperiment(drafts: AuthoringDrafts, key: string): AuthoringDrafts {
  const next = { ...drafts }
  delete next[key]
  return next
}
export const persistenceExplanation = 'Custom exercises are saved with this Template version. Other type variants stay in this session. Save draft before leaving or submitting.'
export const submissionExplanation = 'Save all intended custom exercises before submitting the exact persisted Template version.'
