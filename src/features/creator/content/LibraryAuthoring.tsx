import { useState } from 'react'
import { validateExercise } from '../exercises/catalog'
import { categoryFilters } from './classification'
import type { ContentScope } from './ContentGeography'
import { PersonalChallengeAuthoring } from '../exercises/PersonalChallengeAuthoring'
import { TeamChallengeAuthoring } from '../exercises/TeamChallengeAuthoring'
import type { AuthoringDraft } from '../exercises/experimentDrafts'
import { control } from '../exercises/ExerciseRenderer'

/** The Content parent owns retained drafts and navigation protection. */
export function LibraryAuthoring({ team, draft, metadata, onDraftChange, onDiscard }: { team: boolean; metadata: { category: string; scope: ContentScope }; draft: AuthoringDraft; onDraftChange: (draft: AuthoringDraft) => void; onDiscard: () => void }) {
  const [result, setResult] = useState<{ snapshot: string; issues: string[] } | null>(null)
  const snapshot = JSON.stringify({ draft, metadata })
  const prepare = () => {
    const issues = draft.emptySelection || !draft.custom ? ['Choose an exercise type.'] : validateExercise(draft.custom).length ? ['Review the highlighted exercise fields.'] : []
    if (metadata.category && !(metadata.category in categoryFilters)) issues.push('Choose an available category or leave the draft unclassified.')
    if (metadata.scope.region && !metadata.scope.country || metadata.scope.city && !metadata.scope.region) issues.push('Choose the parent location first.')
    setResult({ snapshot, issues })
  }
  return <section aria-label="Library exercise draft">
    {team ? <TeamChallengeAuthoring standalone value={{}} onChange={() => {}} draft={draft} onDraftChange={onDraftChange} legacy={null} /> : <PersonalChallengeAuthoring standalone value={{}} onChange={() => {}} draft={draft} onDraftChange={onDraftChange} />}
    <button type="button" className={`${control} mt-4 w-full bg-emerald-500 font-bold`} onClick={prepare}>Add Exercise</button>
    {result?.snapshot === snapshot && <p role={result.issues.length ? 'alert' : 'status'} className="mt-3 text-sm">{result.issues.length ? result.issues.join(' ') : 'Exercise prepared for this session. Not saved to Library.'}</p>}
    <p className="mt-2 text-xs text-slate-600">Unsaved session drafts are kept while switching sections. Leaving or reloading loses them.</p>
    <button type="button" className={`${control} mt-4`} onClick={() => { if (window.confirm('Discard this unsaved session draft and its mechanic variants?')) onDiscard() }}>Discard session draft</button>
  </section>
}
