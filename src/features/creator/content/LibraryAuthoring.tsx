import { PersonalChallengeAuthoring } from '../exercises/PersonalChallengeAuthoring'
import { TeamChallengeAuthoring } from '../exercises/TeamChallengeAuthoring'
import type { AuthoringDraft } from '../exercises/experimentDrafts'
import { control } from '../exercises/ExerciseRenderer'

/** The Content parent owns retained drafts and navigation protection. */
export function LibraryAuthoring({ team, draft, onDraftChange, onDiscard }: { team: boolean; draft: AuthoringDraft; onDraftChange: (draft: AuthoringDraft) => void; onDiscard: () => void }) {
  return <section aria-label="Library exercise draft">
    {team ? <TeamChallengeAuthoring standalone value={{}} onChange={() => {}} draft={draft} onDraftChange={onDraftChange} legacy={null} /> : <PersonalChallengeAuthoring standalone value={{}} onChange={() => {}} draft={draft} onDraftChange={onDraftChange} />}
    <button type="button" className={`${control} mt-4`} onClick={() => { if (window.confirm('Discard this unsaved session draft and its mechanic variants?')) onDiscard() }}>Discard session draft</button>
  </section>
}
