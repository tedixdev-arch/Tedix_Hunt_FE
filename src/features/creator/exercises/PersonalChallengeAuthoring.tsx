import { PredefinedChallengeContent } from './PredefinedChallengeContent'
import { gameplayPresentation } from '../CheckpointGameplayEditor'
import { CheckpointStoryPreview } from '../CheckpointStoryPreview'
import type { CheckpointGameplay } from '../checkpointGameplay'
import { independentExercise, personalTypes, prototypes, validateExercise, type Exercise } from './catalog'
import { authorPrototype, fromPersistence } from './persistenceAdapter'
import { exampleFor } from './personalExamples'
import type { AuthoringDraft } from './experimentDrafts'
import { savedExercise } from './savedExercises'
import { control } from './ExerciseRenderer'
import { PersonalMechanicEditor, friendlyIssues, originalVisualMechanics } from './PersonalMechanicEditor'
import { modernContext, type PersonalCreationContext } from './creationContext'

type Props = { value: CheckpointGameplay; context?: PersonalCreationContext; draft?: AuthoringDraft; onChange: (cp: CheckpointGameplay) => void; onDraftChange: (d: AuthoringDraft) => void }
export function PersonalChallengeAuthoring({ value, context = modernContext, onChange, draft = { source: 'saved', assignment: 'predefined' }, onDraftChange }: Props) {
  const customMode = draft.source === 'custom', exampleMode = draft.source === 'example', existingMode = context.mode === 'legacy' || context.mode === 'unresolved' && draft.contextChoice === 'compatibility'
  const saved = savedExercise({ ...value, customExercises: undefined }, 'kind')
  const active = draft.emptySelection ? undefined : customMode ? draft.custom : exampleMode ? draft.exercise : savedExercise({ ...value, kind: existingMode ? draft.legacyKind ?? value.kind : value.kind, customExercises: undefined }, 'kind')
  const errors = active ? validateExercise(active) : []
  const changeView = (patch: Partial<AuthoringDraft>) => onDraftChange({ ...draft, ...patch })
  const create = (type: string) => {
    const example = prototypes.find(e => e.type === type) ?? prototypes[0]
    const customByType = { ...draft.customByType, ...(draft.custom ? { [draft.custom.type]: draft.custom } : {}) }
    const custom = customByType[example.type] ?? authorPrototype(independentExercise(example))
    changeView({ source: 'custom', emptySelection: false, appliedCustom: draft.assignment === 'custom' ? draft.appliedCustom ?? draft.custom : draft.appliedCustom, custom, customByType: { ...customByType, [custom.type]: custom } })
  }
  const apply = () => {
    // Catalog examples have no publication-safe predefined wire representation. Fail closed.
    if (exampleMode && !draft.emptySelection || errors.length || !active && !draft.emptySelection) return
    const changed = draft.emptySelection ? !!saved || draft.assignment === 'custom' : customMode ? draft.assignment !== 'custom' || !!(draft.appliedCustom && draft.appliedCustom.id !== active?.id) : draft.assignment !== 'predefined' || draft.legacyKind !== undefined && draft.legacyKind !== value.kind
    if (changed && (draft.assignment === 'custom' || saved) && !window.confirm('Replace this checkpoint’s challenge? Your custom drafts will be kept until you discard them.')) return
    if (customMode && active) { onDraftChange({ ...draft, assignment: 'custom', appliedCustom: active }); return }
    const next = { ...value }
    if (draft.emptySelection) delete next.kind
    else if (existingMode && draft.legacyKind !== undefined) { if (draft.legacyKind) next.kind = draft.legacyKind; else delete next.kind }
    onChange(next); onDraftChange({ ...draft, assignment: 'predefined' })
  }
  const update = (custom: Exercise) => onDraftChange({ ...draft, custom, ...(draft.appliedCustom?.id === custom.id ? { appliedCustom: custom } : {}), customByType: { ...draft.customByType, [custom.type]: custom } })
  const legacyKinds = context.mode !== 'modern' ? [...new Set([...context.kinds, ...(value.kind ? [value.kind] : [])])] : []
  const select = (type: string) => {
    if (!type) { changeView({ emptySelection: true }); return }
    if (existingMode) { changeView({ source: 'saved', emptySelection: false, legacyKind: type }); return }
    if (customMode) create(type)
    else changeView({ source: 'example', emptySelection: false, exercise: structuredClone(exampleFor(type)) })
  }
  if (context.mode === 'unresolved' && !draft.contextChoice) return <section className="mt-4 min-w-0 space-y-4" aria-label="Personal Challenge authoring">
    <p role="note">Template type information is unavailable. Your saved challenges are preserved. Choose an editor for this session.</p>
    <div className="flex flex-wrap gap-2"><button type="button" className={control} onClick={() => changeView({ contextChoice: 'compatibility' })}>Edit existing challenges</button><button type="button" className={control} onClick={() => changeView({ contextChoice: 'modern' })}>Use modern challenge editor</button></div>
    {savedExercise(value, 'kind') && <PredefinedChallengeContent exercise={savedExercise(value, 'kind')!} />}
  </section>
  return <section className="mt-4 min-w-0 space-y-5" aria-label="Personal Challenge authoring">
    {context.mode === 'unresolved' && <button type="button" className={control} onClick={() => changeView({ contextChoice: undefined })}>Choose editor</button>}
    <div className="flex rounded-xl bg-slate-100 p-1">{['Predefined', 'Create Your Own'].map((name, index) => <button type="button" key={name} className={`${control} min-w-0 flex-1 ${customMode === !!index ? 'bg-white font-bold shadow' : 'border-transparent bg-transparent'}`} aria-pressed={customMode === !!index} onClick={() => index ? draft.custom ? changeView({ source: 'custom', emptySelection: false }) : create(active?.type ?? 'tap-pair') : changeView({ source: !existingMode && (draft.custom || draft.exercise) ? 'example' : 'saved', ...(!existingMode && (draft.custom || draft.exercise) ? { exercise: structuredClone(exampleFor((draft.custom ?? draft.exercise)!.type)) } : {}), emptySelection: false })}>{name}</button>)}</div>
    {existingMode && !customMode && <CheckpointStoryPreview friendly value={value} />}
    <section aria-label="Checkpoint gameplay"><label className="block text-sm font-bold">Personal Challenge<select aria-label="Personal Challenge" className={`${control} mt-2 w-full bg-white`} value={draft.emptySelection ? '' : existingMode ? draft.legacyKind ?? value.kind ?? '' : customMode ? draft.custom?.type ?? '' : exampleMode ? draft.exercise?.type ?? '' : ''} onChange={e => select(e.target.value)}>
      <option value="">No challenge (optional)</option>{existingMode ? legacyKinds.map(kind => <option key={kind} value={kind}>{gameplayPresentation('kind', kind).name}</option>) : personalTypes.map(([type, label]) => <option key={type} value={type}>{label}</option>)}
    </select></label></section>
    {(!existingMode || customMode) && <p role="note" className="text-sm text-slate-600">{!customMode && !exampleMode && saved ? 'Choose a mechanic to create a replacement. Your current challenge stays assigned until you apply a change.' : <>{customMode ? 'Save your own challenge for review. ' : 'Try an example, then choose Create Your Own to adapt it. '}These challenges are not available in published Hunts yet.</>}</p>}
    {!existingMode && !customMode && exampleMode && saved && <button type="button" className={control} onClick={() => changeView({ source: 'saved', emptySelection: false })}>View saved challenge</button>}
    {customMode && active ? <section aria-label={`${active.type} content editor`} className="space-y-4">
      <div className="space-y-3">{(originalVisualMechanics.includes(active.type) ? ['title', 'instructions'] as const : []).map(key => <label key={key} className="block text-sm font-bold">{key === 'title' ? 'Title' : 'Instructions / Question'}<textarea aria-label={key === 'title' ? 'Title' : 'Instructions / Question'} required aria-invalid={!active[key].trim()} maxLength={key === 'title' ? 200 : 4000} className={`${control} mt-2 w-full`} value={active[key]} onChange={e => update({ ...active, [key]: e.target.value })} /></label>)}</div>
      <PersonalMechanicEditor key={active.id} exercise={active} onChange={update} />
    </section> : active ? <><PredefinedChallengeContent key={active.id} exercise={active} />{errors.length > 0 && <p role="alert" className="text-sm text-red-800">{friendlyIssues(errors).join(' ')} Saved content is preserved.</p>}</> : <p className="text-sm text-slate-600">Choose a Personal Challenge to begin.</p>}
    {!(exampleMode && !draft.emptySelection) && (active || draft.emptySelection) && <button type="button" className={`${control} w-full bg-emerald-500 px-5 font-bold`} disabled={errors.length > 0} onClick={apply}>{customMode && active ? 'Apply to Hunt' : draft.emptySelection ? 'Remove challenge' : existingMode ? 'Use this challenge' : 'Use saved challenge'}</button>}
    <p role="status" aria-label="Selected exercise assignment" className="text-sm text-slate-600">{draft.assignment === 'custom' || value.kind ? draft.assignment === 'custom' ? 'Custom challenge assigned' : 'Current challenge assigned' : 'No challenge assigned'}{draft.custom && ' · Save draft to keep your changes'}</p>
    {draft.custom && <button type="button" className={`${control} text-slate-600`} onClick={() => {
      if (!window.confirm('Discard your changes and restore this checkpoint’s saved challenge?')) return
      const persisted = value.customExercises?.personal
      onDraftChange(persisted ? { contextChoice: draft.contextChoice, source: 'custom', assignment: 'custom', custom: fromPersistence(persisted) } : { contextChoice: draft.contextChoice, source: 'saved', assignment: 'predefined' })
    }}>Discard changes</button>}
  </section>
}
