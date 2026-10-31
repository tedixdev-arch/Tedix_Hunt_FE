import { TeamChallengeAuthoring } from './TeamChallengeAuthoring'
import type { PersonalCreationContext } from './creationContext'
import { PersonalChallengeAuthoring } from './PersonalChallengeAuthoring'
import { authorPrototype } from './persistenceAdapter'
import { useState } from 'react'
import type { CheckpointGameplay } from '../checkpointGameplay'
import { CheckpointGameplayEditor } from '../CheckpointGameplayEditor'
import { checkpointExercises } from '../../../data/templateOne'
import { independentExercise, personalTypes, prototypes, teamNames, type Exercise, type TeamType, typeName, validateExercise } from './catalog'
import { ExerciseContentEditor } from './ExerciseContentEditor'
import { ExercisePreview } from './ExercisePreview'
import { control } from './ExerciseRenderer'
import { savedExercise } from './savedExercises'

import { hasExperiment, selectedAssignment, viewExercise, persistenceExplanation, type AuthoringDraft } from './experimentDrafts'
export type { AuthoringDraft, AuthoringDrafts } from './experimentDrafts'

function ExistingChallengeAuthoring({ field, value, onChange, draft = { source: 'saved', assignment: 'predefined' }, onDraftChange }: {
  field: 'kind' | 'teamKind'; value: CheckpointGameplay; onChange: (value: CheckpointGameplay) => void
  draft?: AuthoringDraft; onDraftChange: (draft: AuthoringDraft) => void
}) {
  const [conversionError, setConversionError] = useState('')
  const [preview, setPreview] = useState(false)
  const saved = savedExercise({ ...value, customExercises: undefined }, field)
  const active = draft.source === 'saved' ? saved : draft.source === 'custom' ? draft.custom : draft.exercise
  const team = field === 'teamKind'
  const create = (exercise: Exercise) => {
    // Choosing another type must not silently erase authored content for the previous type.
    const customByType = { ...draft.customByType, ...(draft.custom ? { [draft.custom.type]: draft.custom } : {}) }
    let custom: Exercise
    try { custom = customByType[exercise.type] ?? authorPrototype(independentExercise(exercise)); setConversionError('') } catch (error) { setConversionError(error instanceof Error ? error.message : 'Cannot convert this content'); return }
    onDraftChange({ ...draft, source: 'custom', custom, customByType: { ...customByType, [custom.type]: custom }, assignment: draft.custom ? selectedAssignment(draft) : 'custom' })
  }
  const errors = active ? validateExercise(active) : []
  return <section className="mt-4 min-w-0 space-y-4" aria-label={`${team ? 'Team' : 'Personal'} Challenge authoring`}>
    <div className="flex rounded-xl bg-slate-100 p-1"><button type="button" className={`${control} flex-1 ${draft.source !== 'custom' ? 'bg-white shadow' : 'border-transparent bg-transparent'}`} aria-pressed={draft.source !== 'custom'} onClick={() => onDraftChange(viewExercise(draft, 'saved'))}>Predefined</button><button type="button" className={`${control} flex-1 ${draft.source === 'custom' ? 'bg-white shadow' : 'border-transparent bg-transparent'}`} aria-pressed={draft.source === 'custom'} onClick={() => draft.custom ? onDraftChange(viewExercise(draft, 'custom')) : create(team ? active ?? savedExercise({ teamKind: 'scrambled-word' }, 'teamKind')! : active && personalTypes.some(row => row[0] === active.type) ? active : prototypes[0])}>Create Your Own</button></div>
    {draft.source !== 'custom' ? <>
      {!team && <label className="block text-sm font-bold">Exercise catalog<select className={`${control} mt-2 w-full`} value={draft.source === 'example' ? draft.exercise?.id : 'saved'} onChange={e => { if (e.target.value === 'saved') onDraftChange(viewExercise(draft, 'saved')); else { const example = prototypes.find(p => p.id === e.target.value); if (example) create(example) } }}><option value="saved">Saved assignment / existing Signal instances</option><optgroup label="Local prototype examples · not approved database records">{personalTypes.map(([type, name, difficulty]) => <option key={type} value={`local-example:${type}`}>{difficulty} · {name}</option>)}</optgroup></select></label>}
      {draft.source === 'saved' && <CheckpointGameplayEditor fields={[field]} value={value} onChange={onChange} />}
      {active && <div className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm"><p className="text-xs font-bold uppercase text-indigo-700">{draft.source === 'example' ? 'Local example · not approved · choose Create Your Own to use' : 'Existing saved / Signal instance'}</p><p className="font-bold">{typeName(active.type)} · {active.title}</p><p className="whitespace-pre-wrap">{active.instructions}</p><details><summary className="min-h-11 cursor-pointer py-3 font-bold">Content, answer, hint and solution</summary><dl className="space-y-2 break-words"><dt className="font-bold">Configured content and answer</dt><dd><pre className="whitespace-pre-wrap break-all text-xs">{JSON.stringify(active.data, null, 2)}</pre></dd><dt className="font-bold">Hint</dt><dd>{active.hint}</dd><dt className="font-bold">Solution</dt><dd className="whitespace-pre-wrap">{active.solution}</dd></dl></details></div>}
    </> : <>
      <p role="note" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-950">Independent Template-owned custom instance. {persistenceExplanation}</p>
      <label className="block text-sm font-bold">Exercise type<select className={`${control} mt-2 w-full`} value={draft.custom?.type} onChange={e => {
        const next = team ? savedExercise({ teamKind: e.target.value }, 'teamKind') : prototypes.find(p => p.type === e.target.value)
        if (next) create(next)
      }}>{team ? Object.entries(teamNames).map(([id, name]) => <option key={id} value={id}>{name}</option>) : personalTypes.map(([id, name, difficulty]) => <option key={id} value={id}>{difficulty} · {name}</option>)}{!team && active?.type === 'legacy-fields' && <option value="legacy-fields">Saved Signal content</option>}</select></label>
      {draft.custom && <ExerciseContentEditor exercise={draft.custom} onChange={custom => onDraftChange({ ...draft, custom })} />}
    </>}
    {hasExperiment(draft) && <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm" aria-label="Experiment status">
      <p>{persistenceExplanation}</p>
      <p className="font-bold" aria-label="Selected exercise assignment">Saving: {selectedAssignment(draft) === 'custom' ? 'Custom exercise' : 'Predefined assignment'}</p>
      <p>Viewing a tab does not change the selected assignment. Retained custom variants are kept in this session.</p>
      {draft.source === 'saved' ? <button type="button" className={control} onClick={() => {
        if (selectedAssignment(draft) === 'custom' && !window.confirm('Replace this custom exercise with the predefined assignment in the next saved version? Your custom content will stay in this session.')) return
        onDraftChange({ ...draft, assignment: 'predefined' })
      }}>Use predefined assignment</button> : <button type="button" className={control} disabled={!draft.custom} onClick={() => onDraftChange({ ...draft, assignment: 'custom' })}>Use this custom exercise</button>}
      <button type="button" className={control} onClick={() => {
        if (window.confirm('Discard this custom draft and all its type variants, and use the predefined assignment in the next saved version?')) onDraftChange({ source: 'saved', assignment: 'predefined' })
      }}>Discard custom draft and use predefined</button>
    </div>}
    {conversionError && <p role="alert">{conversionError}</p>}
    <p className="text-sm text-slate-600">Use Save draft to persist this exercise with its Template. Custom exercises can be reviewed, but live Hunts containing them cannot be published yet.</p>
    <button type="button" className={`${control} font-bold`} disabled={!active || errors.length > 0} onClick={() => setPreview(true)}>Preview Exercise</button>
    {active && errors.length > 0 && draft.source === 'saved' && <p role="note" className="text-sm text-amber-900">This saved payload cannot be simulated safely: {errors.join(' ')} Its stored content is preserved.</p>}
    {!active && <p className="text-sm text-slate-600">Select an existing exercise to preview. Unsupported saved identifiers are preserved.</p>}
    {preview && active && <ExercisePreview exercise={active} onClose={() => setPreview(false)} />}
  </section>
}
// Naming is a Creator UI layer; the seven stored team identifiers remain unchanged.
export const teamCatalog = checkpointExercises.map(row => ({ id: row.teamKind as TeamType, title: row.title }))

export function ChallengeAuthoring(props: Parameters<typeof ExistingChallengeAuthoring>[0] & { context?: PersonalCreationContext }) {
  return props.field === 'kind' ? <PersonalChallengeAuthoring {...props} /> : <TeamChallengeAuthoring {...props} legacy={<ExistingChallengeAuthoring {...props} />} />
}
