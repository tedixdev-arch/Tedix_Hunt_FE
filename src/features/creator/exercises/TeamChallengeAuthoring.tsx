import type { CheckpointGameplay } from '../checkpointGameplay'
import type { PersonalCreationContext } from './creationContext'
import { modernContext } from './creationContext'
import type { AuthoringDraft } from './experimentDrafts'
import { independentExercise, validateExercise, type Exercise } from './catalog'
import { authorPrototype, fromPersistence } from './persistenceAdapter'
import { savedExercise } from './savedExercises'
import { teamExample, teamMechanics } from './teamExamples'
import { TeamMechanicEditor } from './TeamMechanicEditor'
import { TeamChallengeCanvas } from './TeamChallengeCanvas'
import { ExerciseRenderer, control } from './ExerciseRenderer'
import './personalChallenge.css'

type Props = { value: CheckpointGameplay; onChange: (v: CheckpointGameplay) => void; context?: PersonalCreationContext; draft?: AuthoringDraft; onDraftChange: (d: AuthoringDraft) => void; legacy: React.ReactNode }
export function TeamChallengeAuthoring({ value, onChange, context = modernContext, draft = { source: 'saved', assignment: 'predefined' }, onDraftChange, legacy }: Props) {
  if (context.mode === 'legacy' || context.mode === 'unresolved' && draft.contextChoice === 'compatibility') return <>{legacy}</>
  const change = (patch: Partial<AuthoringDraft>) => onDraftChange({ ...draft, ...patch })
  if (context.mode === 'unresolved' && !draft.contextChoice) return <section className="mt-4 space-y-3" aria-label="Team Challenge authoring"><p>Template type information is unavailable. Saved Team Challenges are preserved. Choose an editor for this session.</p><button type="button" className={control} onClick={() => change({ contextChoice: 'compatibility' })}>Edit existing challenges</button><button type="button" className={control} onClick={() => change({ contextChoice: 'modern' })}>Use modern challenge editor</button></section>
  const customMode = draft.source === 'custom'
  const saved = savedExercise({ ...value, customExercises: undefined }, 'teamKind')
  const active = draft.emptySelection ? undefined : customMode ? draft.custom : draft.source === 'example' ? draft.exercise : saved
  const create = (type: string) => {
    const variants = { ...draft.customByType, ...(draft.custom ? { [draft.custom.type]: draft.custom } : {}) }
    const custom = variants[teamExample(type).type] ?? authorPrototype(independentExercise(teamExample(type)))
    change({ source: 'custom', custom, emptySelection: false, customByType: { ...variants, [custom.type]: custom }, appliedCustom: draft.assignment === 'custom' ? draft.appliedCustom ?? draft.custom : draft.appliedCustom })
  }
  const update = (custom: Exercise) => change({ custom, ...(draft.appliedCustom?.id === custom.id ? { appliedCustom: custom } : {}), customByType: { ...draft.customByType, [custom.type]: custom } })
  const errors = active ? validateExercise(active) : []
  const apply = () => {
    if (errors.length) return
    if ((draft.assignment === 'custom' || saved) && !window.confirm('Replace this Team Challenge? Custom drafts stay in this session until discarded.')) return
    if (draft.emptySelection) { const next = { ...value }; delete next.teamKind; onChange(next); change({ assignment: 'predefined' }); return }
    if (customMode && active) change({ assignment: 'custom', appliedCustom: active })
    else if (draft.source === 'saved') change({ assignment: 'predefined' })
  }
  return <section className="mt-4 min-w-0 space-y-4" aria-label="Team Challenge authoring">
    {context.mode === 'unresolved' && <button type="button" className={control} onClick={() => change({ contextChoice: undefined })}>Choose editor</button>}
    <label className="block text-sm font-bold">Team Challenge<select aria-label="Team Challenge" className={`${control} mt-2 w-full bg-white`} value={active && (customMode || draft.source === 'example') ? active.type : ''} onChange={event => {
      const type = event.target.value
      if (!type) change({ emptySelection: true })
      else if (customMode) create(type)
      else change({ source: 'example', emptySelection: false, exercise: structuredClone(teamExample(type)) })
    }}><option value="">{saved && draft.source === 'saved' && !draft.emptySelection ? 'Saved assignment (preserved)' : 'No challenge (optional)'}</option>{Object.entries(teamMechanics).map(([type, label]) => <option key={type} value={type}>{label}</option>)}</select></label>
    <div className="challenge-mode">{['Predefined', 'Create Your Own'].map((label, i) => <button type="button" key={label} aria-pressed={customMode === !!i} onClick={() => i ? draft.custom && (draft.source === 'saved' || !active || draft.custom.type === active.type) ? change({ source: 'custom', emptySelection: false }) : create(active?.type ?? 'scrambled-word') : change({ source: 'example', emptySelection: false, exercise: structuredClone(teamExample(active?.type ?? 'scrambled-word')) })}>{label}</button>)}</div>
    <p className="text-sm text-slate-600">{customMode ? 'Changes belong to this Template. Apply your challenge, then Save draft.' : 'Try a read-only example, then choose Create Your Own to adapt it.'} Creator simulation only; custom challenges cannot be published in live Hunts yet.</p>
    {active && customMode ? <TeamMechanicEditor key={active.id} exercise={active} onChange={update} /> : active?.authored ? <TeamChallengeCanvas key={active.id} exercise={active} /> : active ? <div className="challenge-canvas"><ExerciseRenderer key={active.id} exercise={active} /></div> : <p>Choose a Team Challenge to begin.</p>}
    {(saved || draft.custom) && draft.source !== 'saved' && <button type="button" className={control} onClick={() => change({ source: 'saved', emptySelection: false })}>View saved challenge</button>}
    {(customMode && active || draft.emptySelection || draft.source === 'saved') && <button type="button" className={`${control} w-full bg-emerald-500 font-bold`} disabled={errors.length > 0} onClick={apply}>{draft.emptySelection ? 'Remove Team Challenge' : customMode ? 'Apply Team Challenge' : 'Use saved Team Challenge'}</button>}
    <p role="status" aria-label="Selected exercise assignment" className="text-sm text-slate-600">{draft.assignment === 'custom' ? 'Custom Team Challenge assigned' : value.teamKind ? 'Saved Team Challenge assigned' : 'No Team Challenge assigned'}</p>
    {draft.custom && <button type="button" className={control} onClick={() => {
      if (!window.confirm('Discard custom Team Challenge changes and return to the saved assignment?')) return
      const persisted = value.customExercises?.team
      onDraftChange(persisted ? { contextChoice: draft.contextChoice, source: 'custom', assignment: 'custom', custom: fromPersistence(persisted) } : { contextChoice: draft.contextChoice, source: 'saved', assignment: 'predefined' })
    }}>Discard changes</button>}
  </section>
}
