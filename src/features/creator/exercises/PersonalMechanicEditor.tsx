import { useRef, useState } from 'react'
import { PersonalChallengeCanvas } from './PersonalChallengeCanvas'
import { personalMechanics } from './persistenceSchema'
import { ChallengeCanvas, PencilField } from './ChallengeCanvas'
import { PersonalVisualSurface } from './PersonalVisualSurface'
import { ExerciseContentEditor } from './ExerciseContentEditor'
import type { Exercise } from './catalog'
import { validateExercise } from './catalog'
import { control } from './ExerciseRenderer'

export const originalVisualMechanics = ['tap-pair', 'single-choice', 'fill-blank']
export const visualMechanics = Object.keys(personalMechanics)
type Props = { exercise: Exercise; onChange: (e: Exercise) => void }
export function friendlyIssues(errors: string[]): string[] {
  return [...new Set(errors.map(error => {
    if (/title/i.test(error)) return 'Add a title with up to 200 characters.'
    if (/instructions/i.test(error)) return 'Add instructions or a question with up to 4,000 characters.'
    if (/hints/i.test(error)) return 'Complete each hint, or remove the ones you do not need.'
    if (/solution/i.test(error)) return 'Add a solution explanation with up to 4,000 characters.'
    if (/feedback/i.test(error)) return 'Complete both feedback messages with up to 2,000 characters each.'
    if (/optionId/i.test(error)) return 'Mark one option as the correct answer.'
    if (/options/i.test(error)) return 'Use 2–40 options and add text to each one (up to 2,000 characters).'
    if (/left|right|pairs/i.test(error)) return 'Use 2–40 pairs and complete both cards in every pair.'
    if (/blanks|values/i.test(error)) return 'Complete every question and accepted answer. Answers can have up to 500 characters.'
    return 'Check your challenge content. Use plain text and complete every required field.'
  }))]
}
const fresh = () => `item-${crypto.randomUUID()}`

/** Direct content manipulation. IDs and answers are updated together, never derived from labels. */
export function PersonalMechanicSurface({ exercise, onChange, onlyIndex }: Props & { onlyIndex?: number }) {
  const blankInputs = useRef<Record<string, HTMLInputElement | null>>({})
  const authored = exercise.authored!
  const activity: any = authored.activity, expected: any = authored.expected
  const change = (a: any, e = expected) => onChange({ ...exercise, authored: { ...authored, activity: a, expected: e } as Exercise['authored'] })
  const text = (name: string, value: string, update: (v: string) => void, blankId?: string) => <label className="block min-w-0 text-sm font-bold">{name}<input ref={node => { if (blankId) blankInputs.current[blankId] = node }} maxLength={name.startsWith('Accepted answer') ? 500 : 2000} className={`${control} mt-2 w-full bg-white`} required aria-invalid={!value.trim()} value={value} onChange={e => update(e.target.value)} />{!value.trim() && <span className="mt-1 block text-xs text-red-800">Add text here.</span>}</label>
  const reorder = (items: any[], index: number, offset: number) => { const next = [...items]; [next[index], next[index + offset]] = [next[index + offset], next[index]]; return next }
  const moves = (index: number, count: number, move: (offset: number) => void, remove: () => void, minimum: number) => <div className="flex flex-wrap gap-2"><button type="button" className={control} aria-label={`Move row ${index + 1} up`} disabled={!index} onClick={() => move(-1)}>↑</button><button type="button" className={control} aria-label={`Move row ${index + 1} down`} disabled={index === count - 1} onClick={() => move(1)}>↓</button><button type="button" className={control} aria-label={`Remove row ${index + 1}`} disabled={count <= minimum} onClick={remove}>Remove</button></div>
  if (exercise.type === 'tap-pair') return <div className="space-y-3" aria-label="Pair cards editor"><p className="text-sm text-slate-600">Each row is a matching pair. Click either card to change its text.</p>{expected.pairs.map((pair: any, index: number) => onlyIndex !== undefined && onlyIndex !== index ? null : <div key={pair.leftId} className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3"><div className="grid min-w-0 gap-3 sm:grid-cols-2">{(['left', 'right'] as const).map(side => {
    const id = pair[`${side}Id`], item = activity[side].find((x: any) => x.id === id)
    return <div key={side} className="min-w-0 rounded-xl bg-white p-3 shadow-sm">{text(`${side === 'left' ? 'Card' : 'Matching card'} ${index + 1}`, item?.text ?? '', value => change({ ...activity, [side]: activity[side].map((x: any) => x.id === id ? { ...x, text: value } : x) }))}</div>
  })}</div>{moves(index, expected.pairs.length, offset => {
    const pairs = reorder(expected.pairs, index, offset)
    change({ ...activity, left: pairs.map(p => activity.left.find((x: any) => x.id === p.leftId)), right: pairs.map(p => activity.right.find((x: any) => x.id === p.rightId)) }, { pairs })
  }, () => change({ ...activity, left: activity.left.filter((x: any) => x.id !== pair.leftId), right: activity.right.filter((x: any) => x.id !== pair.rightId) }, { pairs: expected.pairs.filter((p: any) => p.leftId !== pair.leftId) }), 2)}</div>)}<button type="button" className={control} disabled={expected.pairs.length >= 40} onClick={() => {
    const leftId = fresh(), rightId = fresh()
    change({ left: [...activity.left, { id: leftId, text: '' }], right: [...activity.right, { id: rightId, text: '' }] }, { pairs: [...expected.pairs, { leftId, rightId }] })
  }}>Add pair</button></div>
  if (exercise.type === 'single-choice') return <div className="space-y-3" aria-label="Answer options editor"><p className="text-sm text-slate-600">Edit the options and mark the correct answer.</p>{activity.options.map((option: any, index: number) => onlyIndex !== undefined && onlyIndex !== index ? null : <div key={option.id} className={`space-y-3 rounded-2xl border p-4 ${expected.optionId === option.id ? 'border-emerald-400 bg-emerald-50' : 'bg-slate-50'}`}>{text(`Option ${index + 1}`, option.text, value => change({ options: activity.options.map((x: any) => x.id === option.id ? { ...x, text: value } : x) }))}<label className="flex min-h-11 items-center gap-3 text-sm font-bold"><input type="radio" name={`correct-${exercise.id}`} checked={expected.optionId === option.id} onChange={() => change(activity, { optionId: option.id })} />Correct answer</label>{moves(index, activity.options.length, offset => change({ options: reorder(activity.options, index, offset) }), () => change({ options: activity.options.filter((x: any) => x.id !== option.id) }, { optionId: expected.optionId === option.id ? '' : expected.optionId }), 2)}</div>)}<button type="button" className={control} disabled={activity.options.length >= 40} onClick={() => change({ options: [...activity.options, { id: fresh(), text: '' }] })}>Add option</button></div>
  return <div className="space-y-3" aria-label="Blank questions editor"><p className="text-sm text-slate-600">Write a sentence. Use “Insert blank” where the answer belongs.</p>{activity.blanks.map((blank: any, index: number) => onlyIndex !== undefined && onlyIndex !== index ? null : <div key={blank.id} className="space-y-3 rounded-2xl border bg-slate-50 p-4">{text(`Question ${index + 1}`, blank.prompt, prompt => change({ blanks: activity.blanks.map((x: any) => x.id === blank.id ? { ...x, prompt } : x) }), blank.id)}<button type="button" className={control} onClick={() => {
    const input = blankInputs.current[blank.id], start = input?.selectionStart ?? blank.prompt.length, end = input?.selectionEnd ?? start
    const selected = blank.prompt.slice(start, end)
    change({ blanks: activity.blanks.map((x: any) => x.id === blank.id ? { ...x, prompt: `${x.prompt.slice(0, start)}___${x.prompt.slice(end)}` } : x) }, { ...expected, values: expected.values.map((v: any) => v.blankId === blank.id && selected.trim() ? { ...v, value: selected } : v) })
  }}>Insert blank in question {index + 1}</button>{text(`Accepted answer ${index + 1}`, expected.values.find((v: any) => v.blankId === blank.id)?.value ?? '', value => change(activity, { ...expected, values: expected.values.map((v: any) => v.blankId === blank.id ? { ...v, value } : v) }))}{moves(index, activity.blanks.length, offset => change({ blanks: reorder(activity.blanks, index, offset) }), () => change({ blanks: activity.blanks.filter((x: any) => x.id !== blank.id) }, { ...expected, values: expected.values.filter((v: any) => v.blankId !== blank.id) }), 1)}</div>)}<button type="button" className={control} disabled={activity.blanks.length >= 40} onClick={() => {
    const id = fresh(); change({ blanks: [...activity.blanks, { id, prompt: '___' }] }, { ...expected, values: [...expected.values, { blankId: id, value: '' }] })
  }}>Add blank</button><label className="flex min-h-11 items-center gap-3"><input type="checkbox" checked={expected.caseSensitive} onChange={e => change(activity, { ...expected, caseSensitive: e.target.checked })} />Match upper and lower case exactly</label></div>
}

export function PersonalMechanicEditor(props: Props) {
  return originalVisualMechanics.includes(props.exercise.type) ? <OriginalPersonalMechanicEditor {...props} /> : <PersonalChallengeCanvas {...props} />
}
function OriginalPersonalMechanicEditor({ exercise, onChange }: Props) {
  const [mode, setMode] = useState('visual'), [step, setStep] = useState(0), [playing, setPlaying] = useState(false)
  const priority = visualMechanics.includes(exercise.type)
  const errors = friendlyIssues(validateExercise(exercise))
  const activity: any = exercise.authored!.activity
  const count = exercise.type === 'tap-pair' ? activity.left.length : exercise.type === 'single-choice' ? activity.options.length : exercise.type === 'fill-blank' ? activity.blanks.length : 0
  const itemName = exercise.type === 'tap-pair' ? 'matching pair' : exercise.type === 'single-choice' ? 'answer option' : 'blank question'
  const tasks = [...Array.from({ length: count }, (_, i) => `Create ${itemName} ${i + 1}`), 'Hints', 'Feedback', 'Solution', 'Play your challenge']
  const current = Math.min(step, tasks.length - 1)
  const input = (key: 'solution' | 'correctFeedback' | 'incorrectFeedback', label: string) => <label className="block text-sm font-bold">{label}<textarea className={`${control} mt-2 w-full`} required maxLength={key === 'solution' ? 4000 : 2000} aria-invalid={!exercise[key].trim()} value={exercise[key]} onChange={e => onChange({ ...exercise, [key]: e.target.value })} /></label>
  const hints = <div className="space-y-3">{exercise.authored!.hints.map((hint, index) => <div key={index}><label className="block text-sm font-bold">Hint {index + 1}<textarea className={`${control} mt-2 w-full`} maxLength={2000} required aria-invalid={!hint.trim()} value={hint} onChange={e => onChange({ ...exercise, authored: { ...exercise.authored!, hints: exercise.authored!.hints.map((h, i) => i === index ? e.target.value : h) } })} /></label><button type="button" className={control} onClick={() => onChange({ ...exercise, authored: { ...exercise.authored!, hints: exercise.authored!.hints.filter((_, i) => i !== index) } })}>Remove hint {index + 1}</button></div>)}<button type="button" className={control} disabled={exercise.authored!.hints.length >= 10} onClick={() => onChange({ ...exercise, authored: { ...exercise.authored!, hints: [...exercise.authored!.hints, ''] } })}>Add hint</button></div>
  const expected: any = exercise.authored!.expected
  const complete = (value: unknown, max = 2000) => typeof value === 'string' && !!value.trim() && value.length <= max
  const pair = exercise.type === 'tap-pair' ? expected.pairs[current] : undefined
  const itemComplete = current >= count || (exercise.type === 'tap-pair' ? !!pair && complete(activity.left.find((item: any) => item.id === pair.leftId)?.text) && complete(activity.right.find((item: any) => item.id === pair.rightId)?.text) : exercise.type === 'single-choice' ? complete(activity.options[current]?.text) : complete(activity.blanks[current]?.prompt) && complete(expected.values.find((item: any) => item.blankId === activity.blanks[current]?.id)?.value, 500))
  const stepIssues = current < count ? itemComplete ? [] : ['Complete the text and answer for this item.'] : current === count ? errors.filter(error => /hint/i.test(error)) : current === count + 1 ? errors.filter(error => /feedback/i.test(error)) : current === count + 2 ? errors.filter(error => /solution/i.test(error)) : errors
  return <div className="space-y-5">
    <div className="challenge-mode" aria-label="Editing mode">{[['visual', 'Edit with Preview'], ['steps', 'Step by Step']].map(([id, label]) => <button key={id} type="button" aria-pressed={mode === id} onClick={() => { setMode(id); setPlaying(false) }}>{label}</button>)}</div>
    {mode === 'visual' ? <>
      {priority ? <div className="flex justify-center gap-2" aria-label="Canvas interaction">{['Edit', 'Play'].map(label => <button type="button" key={label} className={`${control} min-w-20 font-bold ${playing === (label === 'Play') ? 'border-emerald-600 bg-emerald-100' : ''}`} aria-pressed={playing === (label === 'Play')} disabled={label === 'Play' && errors.length > 0} onClick={() => setPlaying(label === 'Play')}>{label}</button>)}</div> : <p className="text-sm text-slate-600">Play below. To change this challenge, choose Step by Step.</p>}
      <ChallengeCanvas exercise={exercise} playing={!priority || playing}>
        <section className="space-y-5"><div className="text-2xl font-bold"><PencilField label="Title" value={exercise.title} maxLength={200} onChange={title => onChange({ ...exercise, title })} /></div><PencilField label="Instructions" value={exercise.instructions} maxLength={4000} onChange={instructions => onChange({ ...exercise, instructions })} /><PersonalVisualSurface exercise={exercise} onChange={onChange} />
          <details><summary className="min-h-11 cursor-pointer py-3 text-sm font-bold">Hints ✎</summary>{hints}</details>
          <div className="space-y-3 text-sm"><PencilField label="Correct feedback" value={exercise.correctFeedback} onChange={correctFeedback => onChange({ ...exercise, correctFeedback })} /><PencilField label="Try again feedback" value={exercise.incorrectFeedback} onChange={incorrectFeedback => onChange({ ...exercise, incorrectFeedback })} /><PencilField label="Solution" value={exercise.solution} maxLength={4000} onChange={solution => onChange({ ...exercise, solution })} /></div>
        </section>
      </ChallengeCanvas>
    </> : priority ? <section aria-label="Guided challenge editor" className="space-y-4 rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase text-emerald-800">Step {current + 1} of {tasks.length}</p><h4 aria-live="polite" tabIndex={-1} className="text-lg font-bold">{tasks[current]}</h4><p className="text-sm text-slate-600">{current < count ? `Complete one ${itemName}, then continue.` : current === count ? 'Give players a clue, if they need one.' : current === count + 1 ? 'Choose what players see after an answer.' : current === count + 2 ? 'Explain how to solve the challenge.' : 'Try the interaction before applying your challenge.'}</p>
      {current < count ? <PersonalMechanicSurface exercise={exercise} onChange={onChange} onlyIndex={current} /> : current === count ? hints : current === count + 1 ? <div className="space-y-3">{input('correctFeedback', 'Correct feedback')}{input('incorrectFeedback', 'Try again feedback')}</div> : current === count + 2 ? input('solution', 'Solution explanation') : <ChallengeCanvas exercise={exercise} />}
      {stepIssues.length > 0 && <ul role="alert" className="space-y-1 text-sm text-red-800">{stepIssues.map(issue => <li key={issue}>{issue}</li>)}</ul>}
      <div className="flex justify-between gap-2"><button type="button" className={control} disabled={!current} onClick={() => setStep(current - 1)}>Back</button>{current < tasks.length - 1 && <button type="button" className={`${control} bg-emerald-100 font-bold`} disabled={stepIssues.length > 0} onClick={() => setStep(current + 1)}>Next</button>}</div>
    </section> : <ExerciseContentEditor hideCommon exercise={exercise} onChange={onChange} />}
    {mode === 'visual' && errors.length > 0 && <ul role="alert" className="space-y-1 text-sm text-red-800">{errors.map(error => <li key={error}>{error}</li>)}</ul>}
  </div>
}
