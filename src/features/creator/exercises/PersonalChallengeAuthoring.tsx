import { PredefinedChallengeContent } from './PredefinedChallengeContent'
import { supportedGameplay } from '../checkpointGameplay'
import { gameplayPresentation } from '../CheckpointGameplayEditor'
import { CheckpointStoryPreview } from '../CheckpointStoryPreview'
import { useState } from 'react'
import type { CheckpointGameplay } from '../checkpointGameplay'
import { independentExercise, personalTypes, prototypes, validateExercise, type Exercise } from './catalog'
import { authorPrototype, fromPersistence } from './persistenceAdapter'
import { exampleFor, exampleContentKey } from './personalExamples'
import type { AuthoringDraft } from './experimentDrafts'
import { savedExercise } from './savedExercises'
import { control, ExerciseRenderer } from './ExerciseRenderer'
import { ExerciseContentEditor } from './ExerciseContentEditor'
import { PersonalMechanicEditor, visualMechanics } from './PersonalMechanicEditor'

type Props = { value: CheckpointGameplay; draft?: AuthoringDraft; onChange: (cp: CheckpointGameplay) => void; onDraftChange: (d: AuthoringDraft) => void }
export function PersonalChallengeAuthoring({ value, onChange, draft = { source: 'saved', assignment: 'predefined' }, onDraftChange }: Props) {
  const [testing, setTesting] = useState(false), [testRun, setTestRun] = useState(0)
  const customMode = draft.source === 'custom'
  const exampleMode = draft.source === 'example'
  const saved = savedExercise({ ...value, customExercises: undefined }, 'kind')
  const active = customMode ? draft.custom : exampleMode ? draft.exercise : savedExercise({ ...value, kind: draft.legacyKind ?? value.kind, customExercises: undefined }, 'kind')
  const errors = active ? validateExercise(active) : []
  const changeView = (patch: Partial<AuthoringDraft>) => { setTesting(false); onDraftChange({ ...draft, ...patch }) }
  const create = (type: string, fromExample = false) => {
    const example = prototypes.find(e => e.type === type) ?? prototypes[0]
    const customByType = { ...draft.customByType, ...(draft.custom ? { [draft.custom.type]: draft.custom } : {}) }
    if (fromExample && customByType[example.type] && !window.confirm('Start a new custom draft from this example? Your retained draft for this mechanic will be replaced. The assigned challenge stays selected until you apply the new draft.')) return
    const custom = fromExample ? authorPrototype(independentExercise(example)) : customByType[example.type] ?? authorPrototype(independentExercise(example))
    // Browsing examples and opening their editable copies never changes the selected assignment.
    changeView({ source: 'custom', appliedCustom: draft.assignment === 'custom' ? draft.appliedCustom ?? draft.custom : draft.appliedCustom, custom, customByType: { ...customByType, [custom.type]: custom } })
  }
  const apply = () => {
    // Complete examples have no publication-safe predefined wire representation. Fail closed.
    if (exampleMode || errors.length || (!active && draft.legacyKind !== '')) return
    if (!customMode && draft.legacyKind && !supportedGameplay.kind.includes(draft.legacyKind)) return
    const changed = customMode ? draft.assignment !== 'custom' || !!(draft.appliedCustom && draft.appliedCustom.id !== active?.id) : draft.assignment !== 'predefined' || draft.legacyKind !== undefined
    if (changed && (draft.assignment === 'custom' || saved) && !window.confirm('Replace this checkpoint’s challenge? Your custom drafts will be kept until you discard them.')) return
    if (customMode) { onDraftChange({ ...draft, assignment: 'custom', appliedCustom: active! }); return }
    const next = { ...value }
    if (draft.legacyKind !== undefined) { if (draft.legacyKind) next.kind = draft.legacyKind; else delete next.kind }
    onChange(next)
    onDraftChange({ ...draft, assignment: 'predefined' })
  }
  const update = (custom: Exercise) => onDraftChange({ ...draft, custom, ...(draft.appliedCustom?.id === custom.id ? { appliedCustom: custom } : {}), customByType: { ...draft.customByType, [custom.type]: custom } })
  return <section className="mt-4 min-w-0 space-y-5" aria-label="Personal Challenge authoring">
    <div className="flex rounded-xl bg-slate-100 p-1">{['Predefined', 'Create Your Own'].map((name, index) => <button type="button" key={name} className={`${control} flex-1 ${customMode === !!index ? 'bg-white font-bold shadow' : 'border-transparent bg-transparent'}`} aria-pressed={customMode === !!index} onClick={() => index ? draft.custom ? changeView({ source: 'custom' }) : create(active?.type ?? 'tap-pair') : changeView({ source: draft.exercise ? 'example' : 'saved' })}>{name}</button>)}</div>
    {!customMode && <CheckpointStoryPreview friendly value={value} />}
    <section aria-label="Checkpoint gameplay"><label className="block text-sm font-bold">Personal Challenge<select aria-label="Personal Challenge" className={`${control} mt-2 w-full bg-white`} value={customMode ? draft.custom?.type : exampleMode ? draft.exercise?.type : draft.legacyKind ?? value.kind ?? ''} onChange={e => customMode ? create(e.target.value) : changeView(supportedGameplay.kind.includes(e.target.value) || e.target.value === '' ? { source: 'saved', legacyKind: e.target.value } : { source: 'example', exercise: structuredClone(exampleFor(e.target.value)) })}>
      {!customMode && <optgroup label="Signal assignments · existing Hunt contract"><option value="">No challenge (optional)</option>{supportedGameplay.kind.map(kind => <option key={kind} value={kind}>{gameplayPresentation('kind', kind).name}</option>)}</optgroup>}
      {customMode ? personalTypes.map(([type, label, difficulty]) => <option key={type} value={type}>{label} · {difficulty}</option>) : <optgroup label="Examples · preview or customize only">{personalTypes.map(([type, label, difficulty]) => <option key={type} value={type}>{label} · {difficulty} · Example</option>)}</optgroup>}
    </select></label></section>
    {exampleMode && <p role="note" className="text-sm text-slate-700">Example for preview and authoring only. It cannot be assigned as a published Hunt challenge. Open the custom editor to save an independent draft for review.</p>}
    {customMode && active ? <section aria-label={`${active.type} content editor`} className="space-y-4">
      <p role="note" className="text-sm text-slate-700">{exampleContentKey(active) ? 'This custom draft matches example content. ' : ''}Custom challenges can be saved and submitted for review, but are not available in published Hunts.</p>
      {visualMechanics.includes(active.type) ? <><div className="space-y-4">{(['title', 'instructions'] as const).map(key => <label key={key} className="block text-sm font-bold">{key === 'title' ? 'Title' : 'Instructions / Question'}<textarea aria-label={key === 'title' ? 'Title' : 'Instructions / Question'} required aria-invalid={!active[key].trim()} maxLength={key === 'title' ? 200 : 4000} className={`${control} mt-2 w-full`} value={active[key]} onChange={e => update({ ...active, [key]: e.target.value })} /></label>)}</div><PersonalMechanicEditor key={active.type} exercise={active} onChange={update} /></> : <><p className="text-sm text-slate-600">Step by Step · Detailed editor. Visual editing for this challenge is coming later.</p><ExerciseContentEditor exercise={active} onChange={update} /><button type="button" className={control} disabled={errors.length > 0} onClick={() => { setTestRun(testRun + 1); setTesting(true) }}>Test Challenge</button>{testing && <div className="space-y-3 rounded-xl border p-4"><button type="button" className={control} onClick={() => setTesting(false)}>Return to Edit</button><ExerciseRenderer key={testRun} exercise={active} /></div>}</>}
    </section> : active ? <div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-800">{exampleMode ? 'Example · preview only' : 'Signal challenge'}</p><h4 className="mt-2 text-xl font-bold">{active.title}</h4><p className="mt-2 whitespace-pre-wrap text-sm">{active.instructions}</p></div><button type="button" className={control} disabled={errors.length > 0} onClick={() => { setTestRun(testRun + 1); setTesting(!testing) }}>{testing ? 'Return to Edit' : 'Test Challenge'}</button>{!testing && <PredefinedChallengeContent exercise={active} />}{testing && <div className="rounded-xl bg-white p-3"><ExerciseRenderer key={`${active.id}:${testRun}`} exercise={active} /></div>}{errors.length > 0 && <p role="alert" className="text-sm">This saved challenge cannot be tested safely. Its content is preserved.</p>}</div> : <p className="text-sm text-slate-600">Choose a Signal assignment or preview an example.</p>}
    {exampleMode && active ? <button type="button" className={`${control} font-bold`} onClick={() => create(active.type, true)}>Open custom editor</button> : (active || draft.legacyKind === '') && <button type="button" className={`${control} bg-emerald-500 px-5 font-bold`} disabled={errors.length > 0} onClick={apply}>{customMode ? 'Apply to Hunt' : 'Use this challenge'}</button>}
    {!customMode && !exampleMode && <p className="text-sm text-slate-500">Signal assignments use the existing Hunt contract. Publication still requires an eligible Template and complete Hunt setup. This preview does not verify live Participant delivery.</p>}
    <p role="status" aria-label="Selected exercise assignment" className="text-sm text-slate-600">{draft.assignment === 'custom' ? 'Custom challenge assigned. Published Hunt gameplay is unavailable.' : saved ? 'Current challenge assigned.' : 'No challenge assigned.'} Use Save draft to save your Hunt.</p>
    {draft.custom && <button type="button" className={`${control} text-slate-600`} onClick={() => {
      if (!window.confirm('Discard your changes and restore this checkpoint’s saved challenge?')) return
      const persisted = value.customExercises?.personal
      onDraftChange(persisted ? { source: 'custom', assignment: 'custom', custom: fromPersistence(persisted) } : { source: 'saved', assignment: 'predefined' })
    }}>Discard changes</button>}
  </section>
}
