import type { Exercise, Mechanic } from './catalog'

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
export const persistenceExplanation = 'Experimental exercises are session drafts only. They are not saved or approved. You can save supported template settings after confirming that experiments will be excluded; your experiments stay in this editing session.'
export const submissionExplanation = 'Submission is blocked because an intended experimental exercise cannot be persisted yet. Discard that experiment or explicitly mark it preview only before submitting supported template settings.'
