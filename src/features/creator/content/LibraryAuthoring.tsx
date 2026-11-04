import { useBlocker } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { PersonalChallengeAuthoring } from '../exercises/PersonalChallengeAuthoring'
import { TeamChallengeAuthoring } from '../exercises/TeamChallengeAuthoring'
import type { AuthoringDraft } from '../exercises/experimentDrafts'
import { independentExercise, prototypes } from '../exercises/catalog'
import { authorPrototype } from '../exercises/persistenceAdapter'
import { teamExample } from '../exercises/teamExamples'
import { control } from '../exercises/ExerciseRenderer'
export function LibraryAuthoring({ team, onClose }: { team: boolean; onClose: () => void }) {
  useBlocker(() => !window.confirm('Leave Content and discard this unsaved library exercise?'))
  const [draft, setDraft] = useState<AuthoringDraft>(() => ({ source: 'custom', assignment: 'predefined', custom: authorPrototype(independentExercise(team ? teamExample('scrambled-word') : prototypes[0])) }))
  useEffect(() => { const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }; window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn) }, [])
  return <section aria-label="Library exercise draft" className="mt-5 min-w-0 rounded-xl border p-4"><h3 className="text-lg font-bold">Create exercise</h3><p role="status" className="mt-2 text-sm">Unsaved library draft · closing or leaving discards changes. Library saving and approval will be available in C2.</p>
    {team ? <TeamChallengeAuthoring standalone value={{}} onChange={() => {}} draft={draft} onDraftChange={setDraft} legacy={null} /> : <PersonalChallengeAuthoring standalone value={{}} onChange={() => {}} draft={draft} onDraftChange={setDraft} />}
    <button type="button" className={`${control} mt-4`} onClick={() => { if (window.confirm('Discard this unsaved library exercise?')) onClose() }}>Close and discard draft</button>
  </section>
}
