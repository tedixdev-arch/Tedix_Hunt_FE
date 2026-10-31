import { useEffect, useRef, useState } from 'react'
import type { Exercise } from './catalog'
import { validateExercise } from './catalog'
import { control, ExerciseRenderer } from './ExerciseRenderer'

export const visualMechanics = ['tap-pair', 'single-choice', 'fill-blank']
type Props = { exercise: Exercise; onChange: (e: Exercise) => void }
function friendlyIssues(errors: string[]): string[] {
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
export function PersonalMechanicSurface({ exercise, onChange }: Props) {
  const blankInputs = useRef<Record<string, HTMLInputElement | null>>({})
  const authored = exercise.authored!
  const activity: any = authored.activity, expected: any = authored.expected
  const change = (a: any, e = expected) => onChange({ ...exercise, authored: { ...authored, activity: a, expected: e } as Exercise['authored'] })
  const text = (name: string, value: string, update: (v: string) => void, blankId?: string) => <label className="block min-w-0 text-sm font-bold">{name}<input ref={node => { if (blankId) blankInputs.current[blankId] = node }} maxLength={name.startsWith('Accepted answer') ? 500 : 2000} className={`${control} mt-2 w-full bg-white`} required aria-invalid={!value.trim()} value={value} onChange={e => update(e.target.value)} />{!value.trim() && <span className="mt-1 block text-xs text-red-800">Add text here.</span>}</label>
  const reorder = (items: any[], index: number, offset: number) => { const next = [...items]; [next[index], next[index + offset]] = [next[index + offset], next[index]]; return next }
  const moves = (index: number, count: number, move: (offset: number) => void, remove: () => void, minimum: number) => <div className="flex flex-wrap gap-2"><button type="button" className={control} aria-label={`Move row ${index + 1} up`} disabled={!index} onClick={() => move(-1)}>↑</button><button type="button" className={control} aria-label={`Move row ${index + 1} down`} disabled={index === count - 1} onClick={() => move(1)}>↓</button><button type="button" className={control} aria-label={`Remove row ${index + 1}`} disabled={count <= minimum} onClick={remove}>Remove</button></div>
  if (exercise.type === 'tap-pair') return <div className="space-y-3" aria-label="Pair cards editor"><p className="text-sm text-slate-600">Each row is a matching pair. Click either card to change its text.</p>{expected.pairs.map((pair: any, index: number) => <div key={pair.leftId} className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3"><div className="grid min-w-0 gap-3 sm:grid-cols-2">{(['left', 'right'] as const).map(side => {
    const id = pair[`${side}Id`], item = activity[side].find((x: any) => x.id === id)
    return <div key={side} className="min-w-0 rounded-xl bg-white p-3 shadow-sm">{text(`${side === 'left' ? 'Card' : 'Matching card'} ${index + 1}`, item?.text ?? '', value => change({ ...activity, [side]: activity[side].map((x: any) => x.id === id ? { ...x, text: value } : x) }))}</div>
  })}</div>{moves(index, expected.pairs.length, offset => {
    const pairs = reorder(expected.pairs, index, offset)
    change({ ...activity, left: pairs.map(p => activity.left.find((x: any) => x.id === p.leftId)), right: pairs.map(p => activity.right.find((x: any) => x.id === p.rightId)) }, { pairs })
  }, () => change({ ...activity, left: activity.left.filter((x: any) => x.id !== pair.leftId), right: activity.right.filter((x: any) => x.id !== pair.rightId) }, { pairs: expected.pairs.filter((p: any) => p.leftId !== pair.leftId) }), 2)}</div>)}<button type="button" className={control} disabled={expected.pairs.length >= 40} onClick={() => {
    const leftId = fresh(), rightId = fresh()
    change({ left: [...activity.left, { id: leftId, text: '' }], right: [...activity.right, { id: rightId, text: '' }] }, { pairs: [...expected.pairs, { leftId, rightId }] })
  }}>Add pair</button></div>
  if (exercise.type === 'single-choice') return <div className="space-y-3" aria-label="Answer options editor"><p className="text-sm text-slate-600">Edit the options and mark the correct answer.</p>{activity.options.map((option: any, index: number) => <div key={option.id} className={`space-y-3 rounded-2xl border p-4 ${expected.optionId === option.id ? 'border-emerald-400 bg-emerald-50' : 'bg-slate-50'}`}>{text(`Option ${index + 1}`, option.text, value => change({ options: activity.options.map((x: any) => x.id === option.id ? { ...x, text: value } : x) }))}<label className="flex min-h-11 items-center gap-3 text-sm font-bold"><input type="radio" name={`correct-${exercise.id}`} checked={expected.optionId === option.id} onChange={() => change(activity, { optionId: option.id })} />Correct answer</label>{moves(index, activity.options.length, offset => change({ options: reorder(activity.options, index, offset) }), () => change({ options: activity.options.filter((x: any) => x.id !== option.id) }, { optionId: expected.optionId === option.id ? '' : expected.optionId }), 2)}</div>)}<button type="button" className={control} disabled={activity.options.length >= 40} onClick={() => change({ options: [...activity.options, { id: fresh(), text: '' }] })}>Add option</button></div>
  return <div className="space-y-3" aria-label="Blank questions editor"><p className="text-sm text-slate-600">Write a sentence. Use “Insert blank” where the answer belongs.</p>{activity.blanks.map((blank: any, index: number) => <div key={blank.id} className="space-y-3 rounded-2xl border bg-slate-50 p-4">{text(`Question ${index + 1}`, blank.prompt, prompt => change({ blanks: activity.blanks.map((x: any) => x.id === blank.id ? { ...x, prompt } : x) }), blank.id)}<button type="button" className={control} onClick={() => {
    const input = blankInputs.current[blank.id], start = input?.selectionStart ?? blank.prompt.length, end = input?.selectionEnd ?? start
    const selected = blank.prompt.slice(start, end)
    change({ blanks: activity.blanks.map((x: any) => x.id === blank.id ? { ...x, prompt: `${x.prompt.slice(0, start)}___${x.prompt.slice(end)}` } : x) }, { ...expected, values: expected.values.map((v: any) => v.blankId === blank.id && selected.trim() ? { ...v, value: selected } : v) })
  }}>Insert blank in question {index + 1}</button>{text(`Accepted answer ${index + 1}`, expected.values.find((v: any) => v.blankId === blank.id)?.value ?? '', value => change(activity, { ...expected, values: expected.values.map((v: any) => v.blankId === blank.id ? { ...v, value } : v) }))}{moves(index, activity.blanks.length, offset => change({ blanks: reorder(activity.blanks, index, offset) }), () => change({ blanks: activity.blanks.filter((x: any) => x.id !== blank.id) }, { ...expected, values: expected.values.filter((v: any) => v.blankId !== blank.id) }), 1)}</div>)}<button type="button" className={control} disabled={activity.blanks.length >= 40} onClick={() => {
    const id = fresh(); change({ blanks: [...activity.blanks, { id, prompt: '___' }] }, { ...expected, values: [...expected.values, { blankId: id, value: '' }] })
  }}>Add blank</button><label className="flex min-h-11 items-center gap-3"><input type="checkbox" checked={expected.caseSensitive} onChange={e => change(activity, { ...expected, caseSensitive: e.target.checked })} />Match upper and lower case exactly</label></div>
}

export function PersonalMechanicEditor({ exercise, onChange }: Props) {
  const [mode, setMode] = useState('steps'), [step, setStep] = useState(0), [testing, setTesting] = useState(false)
  const testToggle = useRef<HTMLButtonElement>(null), lastTesting = useRef(false)
  useEffect(() => {
    if (lastTesting.current !== testing) testToggle.current?.focus()
    lastTesting.current = testing
  }, [testing])
  const errors = validateExercise(exercise)
  const steps = [exercise.type === 'tap-pair' ? 'Create the pairs' : exercise.type === 'single-choice' ? 'Create the answer options' : 'Create the blanks', 'Hints and feedback', 'Review and test']
  const assistance = <div className="space-y-3">{exercise.authored!.hints.map((hint, index) => <div className="space-y-2" key={index}><label className="block text-sm font-bold">Hint {index + 1}<textarea className={`${control} mt-2 w-full`} value={hint} onChange={e => onChange({ ...exercise, authored: { ...exercise.authored!, hints: exercise.authored!.hints.map((h, i) => i === index ? e.target.value : h) } })} /></label><button type="button" className={control} onClick={() => onChange({ ...exercise, authored: { ...exercise.authored!, hints: exercise.authored!.hints.filter((_, i) => i !== index) } })}>Remove hint {index + 1}</button></div>)}<button type="button" className={control} disabled={exercise.authored!.hints.length >= 10} onClick={() => onChange({ ...exercise, authored: { ...exercise.authored!, hints: [...exercise.authored!.hints, ''] } })}>Add hint</button>{(['solution', 'correctFeedback', 'incorrectFeedback'] as const).map(key => <label key={key} className="block text-sm font-bold">{{ solution: 'Solution explanation', correctFeedback: 'Correct feedback', incorrectFeedback: 'Try again feedback' }[key]}<textarea className={`${control} mt-2 w-full`} value={exercise[key]} onChange={e => onChange({ ...exercise, [key]: e.target.value })} /></label>)}</div>
  if (testing) return <section className="space-y-4 rounded-2xl border border-emerald-300 p-4" aria-label="Test Challenge"><div className="flex flex-wrap items-center justify-between gap-2"><h4 className="font-bold">Test Challenge</h4><button type="button" ref={testToggle} className={control} onClick={() => setTesting(false)}>Return to Edit</button></div><ExerciseRenderer exercise={exercise} /></section>
  return <div className="space-y-4"><div className="flex flex-wrap gap-2" aria-label="Editing mode"><button type="button" className={control} aria-pressed={mode === 'steps'} onClick={() => setMode('steps')}>Step by Step</button><button type="button" className={control} aria-pressed={mode === 'visual'} onClick={() => setMode('visual')}>Edit with Preview</button></div>{mode === 'steps' && <><ol className="flex flex-wrap gap-2 text-sm" aria-label="Challenge progress">{steps.map((name, index) => <li key={name} aria-current={step === index ? 'step' : undefined} className={`rounded-lg px-3 py-2 ${step === index ? 'bg-emerald-100 font-bold' : 'bg-slate-100'}`}>{index + 1}. {name}</li>)}</ol><h4 className="font-bold">Step {step + 1} — {steps[step]}</h4></>}{mode === 'visual' || step === 0 ? <PersonalMechanicSurface exercise={exercise} onChange={onChange} /> : step === 1 ? assistance : <div className="space-y-2 rounded-xl bg-slate-50 p-4"><p className="font-bold">{exercise.title}</p><p>{exercise.instructions}</p><p>Your challenge is {errors.length ? 'incomplete. Check the messages below.' : 'ready to test.'}</p></div>}{mode === 'visual' && <details><summary className="min-h-11 cursor-pointer py-3 font-bold">Hints and feedback</summary>{assistance}</details>}{errors.length > 0 && <ul role="alert" className="list-disc space-y-1 pl-5 text-sm text-red-800">{friendlyIssues(errors).map(error => <li key={error}>{error}</li>)}</ul>}<div className="flex flex-wrap justify-between gap-2">{mode === 'steps' && <><button type="button" className={control} disabled={!step} onClick={() => setStep(step - 1)}>Back</button>{step < 2 && <button type="button" className={control} onClick={() => setStep(step + 1)}>Next</button>}</>}<button type="button" ref={testToggle} className={`${control} bg-emerald-100 font-bold`} disabled={errors.length > 0} onClick={() => setTesting(true)}>Test Challenge</button></div></div>
}
