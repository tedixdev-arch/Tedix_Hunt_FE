import { PredefinedChallengeContent } from './PredefinedChallengeContent'
import { supportedGameplay } from '../checkpointGameplay'
import { gameplayPresentation } from '../CheckpointGameplayEditor'
import { CheckpointStoryPreview } from '../CheckpointStoryPreview'
import { useState } from 'react'
import type { CheckpointGameplay } from '../checkpointGameplay'
import { independentExercise, personalTypes, prototypes, validateExercise, type Exercise } from './catalog'
import { authorPrototype, fromPersistence } from './persistenceAdapter'
import { predefinedFor, isPredefinedSnapshot } from './predefinedPersonal'
import type { AuthoringDraft } from './experimentDrafts'
import { savedExercise } from './savedExercises'
import { control, ExerciseRenderer } from './ExerciseRenderer'
import { ExerciseContentEditor } from './ExerciseContentEditor'
import { PersonalMechanicEditor, visualMechanics } from './PersonalMechanicEditor'

type Props = { value: CheckpointGameplay; draft?: AuthoringDraft; onChange: (cp: CheckpointGameplay) => void; onDraftChange: (d: AuthoringDraft) => void; unavailablePredefined?: Record<string, string> }
export function PersonalChallengeAuthoring({ value, onChange, draft = { source: 'saved', assignment: 'predefined' }, onDraftChange, unavailablePredefined = {} }: Props) {
  const [testing, setTesting] = useState(false), [testRun, setTestRun] = useState(0)
  const customMode = draft.source === 'custom'
  const saved = savedExercise({ ...value, customExercises: undefined }, 'kind')
  const active = customMode ? draft.custom : draft.legacyKind !== undefined ? savedExercise({ ...value, kind: draft.legacyKind, customExercises: undefined }, 'kind') : draft.source === 'example' ? draft.exercise : draft.predefined ?? saved
  const errors = active ? validateExercise(active) : []
  const blocked = !customMode && draft.legacyKind === undefined && (draft.source === 'example' || !!draft.predefined) && !!unavailablePredefined[active?.type ?? '']
  const changeView = (patch: Partial<AuthoringDraft>) => { setTesting(false); onDraftChange({ ...draft, ...patch }) }
  const create = (type: string) => {
    const example = prototypes.find(e => e.type === type) ?? prototypes[0]
    const customByType = { ...draft.customByType, ...(draft.custom ? { [draft.custom.type]: draft.custom } : {}) }
    const custom = customByType[example.type] ?? authorPrototype(independentExercise(example))
    // Opening or changing an editor never selects its content for persistence.
    changeView({ source: 'custom', appliedCustom: draft.assignment === 'custom' ? draft.appliedCustom ?? draft.custom : draft.appliedCustom, custom, customByType: { ...customByType, [custom.type]: custom } })
  }
  const apply = () => {
    if ((!active && draft.legacyKind !== '') || errors.length || blocked) return
    const changed = draft.legacyKind !== undefined || (customMode ? draft.assignment !== 'custom' || !!(draft.appliedCustom && draft.appliedCustom.id !== active?.id) : draft.assignment !== 'predefined' || draft.predefinedKey !== (draft.source === 'example' ? active?.type : draft.predefinedKey))
    if (changed && (draft.assignment === 'custom' || draft.predefined || saved) && !window.confirm('Replace this checkpoint’s challenge? Your custom drafts will be kept until you discard them.')) return
    if (!customMode && draft.legacyKind !== undefined) {
      const next = { ...value }; if (draft.legacyKind) next.kind = draft.legacyKind; else delete next.kind
      onChange(next); onDraftChange({ ...draft, assignment: 'predefined', predefined: undefined, predefinedKey: undefined }); return
    }
    onDraftChange(customMode ? { ...draft, assignment: 'custom', appliedCustom: active! } : { ...draft, assignment: 'predefined', predefined: draft.source === 'example' ? structuredClone(active) : draft.predefined, predefinedKey: draft.source === 'example' ? active?.type : draft.predefinedKey })
  }
  const update = (custom: Exercise) => onDraftChange({ ...draft, custom, ...(draft.appliedCustom?.id === custom.id ? { appliedCustom: custom } : {}), customByType: { ...draft.customByType, [custom.type]: custom } })
  return <section className="mt-4 min-w-0 space-y-5" aria-label="Personal Challenge authoring">
    <div className="flex rounded-xl bg-slate-100 p-1">{['Predefined', 'Create Your Own'].map((name, index) => <button type="button" key={name} className={`${control} flex-1 ${customMode === !!index ? 'bg-white font-bold shadow' : 'border-transparent bg-transparent'}`} aria-pressed={customMode === !!index} onClick={() => index ? draft.custom ? changeView({ source: 'custom' }) : create(active?.type ?? 'tap-pair') : changeView({ source: draft.exercise ? 'example' : 'saved' })}>{name}</button>)}</div>
    {!customMode && <CheckpointStoryPreview friendly value={value} />}
    <section aria-label="Checkpoint gameplay"><label className="block text-sm font-bold">Personal Challenge<select aria-label="Personal Challenge" className={`${control} mt-2 w-full bg-white`} value={customMode ? draft.custom?.type : draft.legacyKind ?? (draft.source === 'example' ? draft.exercise?.type : draft.predefinedKey ?? value.kind ?? 'current')} onChange={e => customMode ? create(e.target.value) : changeView(e.target.value === 'current' ? { source: 'saved', legacyKind: undefined } : supportedGameplay.kind.includes(e.target.value) || e.target.value === '' ? { source: 'saved', legacyKind: e.target.value } : { source: 'example', legacyKind: undefined, exercise: structuredClone(predefinedFor(e.target.value)) })}>
      {!customMode && <option value="current">{saved || draft.predefined ? 'Current challenge' : 'Choose a challenge'}</option>}
      {personalTypes.map(([type, label, difficulty]) => <option key={type} value={type} disabled={!customMode && !!unavailablePredefined[type]}>{label} · {difficulty}{!customMode && unavailablePredefined[type] ? ` · Used at ${unavailablePredefined[type]}` : ''}</option>)}
      {!customMode && <optgroup label="Hunt story challenges"><option value="">No challenge (optional)</option>{supportedGameplay.kind.map(kind => <option key={kind} value={kind}>{gameplayPresentation('kind', kind).name}</option>)}</optgroup>}
    </select></label></section>
    {customMode && active ? <section aria-label={`${active.type} content editor`} className="space-y-4">
      {visualMechanics.includes(active.type) ? <><div className="space-y-4">{(['title', 'instructions'] as const).map(key => <label key={key} className="block text-sm font-bold">{key === 'title' ? 'Title' : 'Instructions / Question'}<textarea aria-label={key === 'title' ? 'Title' : 'Instructions / Question'} required aria-invalid={!active[key].trim()} maxLength={key === 'title' ? 200 : 4000} className={`${control} mt-2 w-full`} value={active[key]} onChange={e => update({ ...active, [key]: e.target.value })} /></label>)}</div><PersonalMechanicEditor key={active.type} exercise={active} onChange={update} /></> : <><p className="text-sm text-slate-600">Step by Step · Detailed editor. Visual editing for this challenge is coming later.</p><ExerciseContentEditor exercise={active} onChange={update} /><button type="button" className={control} disabled={errors.length > 0} onClick={() => { setTestRun(testRun + 1); setTesting(true) }}>Test Challenge</button>{testing && <div className="space-y-3 rounded-xl border p-4"><button type="button" className={control} onClick={() => setTesting(false)}>Return to Edit</button><ExerciseRenderer key={testRun} exercise={active} /></div>}</>}
    </section> : active ? <div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-800">Ready to play</p><h4 className="mt-2 text-xl font-bold">{active.title}</h4><p className="mt-2 whitespace-pre-wrap text-sm">{active.instructions}</p></div><button type="button" className={control} disabled={errors.length > 0} onClick={() => { setTestRun(testRun + 1); setTesting(!testing) }}>{testing ? 'Return to Edit' : 'Test Challenge'}</button>{!testing && <PredefinedChallengeContent exercise={active} />}{testing && <div className="rounded-xl bg-white p-3"><ExerciseRenderer key={`${active.id}:${testRun}`} exercise={active} /></div>}{errors.length > 0 && <p role="alert" className="text-sm">This saved challenge cannot be tested safely. Its content is preserved.</p>}</div> : <p className="text-sm text-slate-600">Choose a complete challenge to try it here.</p>}
    {(active || draft.legacyKind === '') && <button type="button" className={`${control} bg-emerald-500 px-5 font-bold`} disabled={errors.length > 0 || blocked} onClick={apply}>{customMode ? 'Apply to Hunt' : 'Use this challenge'}</button>}
    <p role="status" aria-label="Selected exercise assignment" className="text-sm text-slate-600">{draft.assignment === 'custom' ? 'Custom challenge assigned.' : draft.predefined ? `${draft.predefined.title} assigned.` : saved ? 'Current challenge assigned.' : 'No challenge assigned.'} Use Save draft to save your Hunt.</p>
    {active?.authored && <p className="text-sm text-slate-500">Save and submit these challenges for review. Publishing them in a live Hunt is not available yet.</p>}
    {draft.custom && <button type="button" className={`${control} text-slate-600`} onClick={() => {
      if (!window.confirm('Discard your changes and restore this checkpoint’s saved challenge?')) return
      const persisted = value.customExercises?.personal
      if (!persisted) { onDraftChange({ source: 'saved', assignment: 'predefined' }); return }
      const exercise = fromPersistence(persisted)
      onDraftChange(isPredefinedSnapshot(value.personalChallengePreset, exercise)
        ? { source: 'saved', assignment: 'predefined', predefined: exercise, predefinedKey: String(value.personalChallengePreset) }
        : { source: 'custom', assignment: 'custom', custom: exercise })
    }}>Discard changes</button>}
  </section>
}
