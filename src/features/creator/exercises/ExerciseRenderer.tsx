import { AuthoredExerciseRenderer } from './AuthoredExerciseRenderer'
import { getRecallCountdownState, getNextCountdownTickDelay } from './recallCountdown'
import { useEffect, useState } from 'react'
import { checkAnswer, emptyAttempt, type Exercise } from './catalog'

export const control = 'min-h-11 max-w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-50'
export function ExerciseRenderer({ exercise }: { exercise: Exercise }) {
  return exercise.authored ? <AuthoredExerciseRenderer exercise={exercise} /> : <PrototypeExerciseRenderer exercise={exercise} />
}
function PrototypeExerciseRenderer({ exercise }: { exercise: Exercise }) {
  const [attempt, setAttempt] = useState(emptyAttempt)
  const [feedback, setFeedback] = useState('')
  const [hint, showHint] = useState(false)
  const [solution, showSolution] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [recallReady, setRecallReady] = useState(false)
  const [recallSeconds, setRecallSeconds] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [card, setCard] = useState<{ index: number; side: 'left' | 'right' }>()
  const [mismatch, setMismatch] = useState<{ index: number; side: 'left' | 'right' }>()
  const [dragged, setDragged] = useState<number>()
  const d = exercise.data, type = exercise.type
  const list = (key: string) => d[key] as string[]
  const setValue = (key: number, value: string) => { setAttempt(a => ({ ...a, values: { ...a.values, [key]: value } })); setFeedback('') }
  const setText = (text: string) => { setAttempt(a => ({ ...a, text })); setFeedback('') }
  const toggle = (value: string) => setAttempt(a => ({ ...a, selected: a.selected.includes(value) ? a.selected.filter(v => v !== value) : [...a.selected, value] }))
  const options = (values: string[], value: string, choose: (value: string) => void) => <div className="grid gap-2">{values.map((option, i) => <button type="button" className={`${control} text-left ${value === option ? 'bg-indigo-100 ring-2 ring-indigo-600' : ''}`} aria-pressed={value === option} onClick={() => choose(option)} key={i}>{option}</button>)}</div>
  useEffect(() => {
    if (type !== 'memory-card') return
    const deadline = Date.now() + Number(d.revealDelayMs)
    let timer: number
    const tick = () => {
      const remaining = Math.max(0, deadline - Date.now())
      const state = getRecallCountdownState(remaining)
      setRecallReady(state.stage === 'ready_to_reveal'); setRecallSeconds(state.remainingSeconds)
      if (remaining > 0) timer = window.setTimeout(tick, getNextCountdownTickDelay(remaining))
    }
    tick()
    return () => window.clearTimeout(timer)
  }, [type, d.revealDelayMs, resetKey])
  const reset = () => { setAttempt(emptyAttempt()); setFeedback(''); showHint(false); showSolution(false); setCard(undefined); setMismatch(undefined); setRevealed(false); setDragged(undefined); setResetKey(k => k + 1) }
  const check = () => {
    if (type === 'find-mistake' && attempt.stage === 0) {
      if (attempt.text === String(d.mistake)) { setAttempt(a => ({ ...a, stage: 1 })); setFeedback('Step found. Now explain why it is incorrect.') }
      else setFeedback(exercise.incorrectFeedback)
      return
    }
    setFeedback(checkAnswer(exercise, attempt) ? exercise.correctFeedback : exercise.incorrectFeedback)
  }
  let interaction
  switch (type) {
    case 'tap-pair': {
      const cards = list('left').map((_, index) => ({ index, side: 'left' as const })).concat([])
      const all = [...cards, ...list('right').map((_, index) => ({ index, side: 'right' as const })).reverse()]
      interaction = <div className="grid grid-cols-3 gap-2" aria-label="Tap and pair cards">{all.map((c, i) => {
        const matched = attempt.values[c.index] !== undefined
        const visible = matched || card?.index === c.index && card.side === c.side || mismatch?.index === c.index && mismatch.side === c.side
        return <button type="button" className={`${control} min-h-20 break-words ${matched ? 'bg-emerald-50' : ''}`} key={i} disabled={matched} aria-label={visible ? list(c.side)[c.index] : `Card ${i + 1} face down`} aria-pressed={visible} onClick={() => {
          setMismatch(undefined)
          if (!card) { setCard(c); return }
          if (card.index === c.index && card.side === c.side) return
          if (card.index === c.index && card.side !== c.side) { setValue(c.index, list('right')[c.index]); setFeedback('Pair matched.'); setCard(undefined) }
          else { setFeedback(exercise.incorrectFeedback); setMismatch(c); setCard(undefined) }
        }}>{visible ? list(c.side)[c.index] : '?'}</button>
      })}</div>
      break
    }
    case 'true-false': interaction = options(['true', 'false'], attempt.text, setText); break
    case 'single-choice': case 'shape-pattern': case 'distributed-information': case 'assemble-machine':
      interaction = <>{type === 'shape-pattern' && <p className="rounded-xl bg-slate-50 p-4 text-2xl" aria-label="Shape pattern">{list('terms').join(' ')}</p>}{options(list('options'), attempt.text, setText)}</>; break
    case 'multiple-choice': case 'filter-noise': {
      const values = type === 'filter-noise' ? list('evidence').map(s => s.split(':')[0].trim()) : list('options')
      interaction = <fieldset className="space-y-2"><legend>Select all that apply</legend>{values.map((value, i) => <label className={`${control} flex items-center gap-2`} key={i}><input type="checkbox" checked={attempt.selected.includes(value)} onChange={() => toggle(value)} />{type === 'filter-noise' ? list('evidence')[i] : value}</label>)}</fieldset>; break
    }
    case 'memory-card': interaction = <div className="space-y-3"><label className="block">Recalled answer<input className={`${control} mt-2 w-full`} value={attempt.text} onChange={e => setText(e.target.value)} /></label><button type="button" className={control} disabled={!recallReady} onClick={() => setRevealed(true)}>{recallReady ? 'Reveal recall card' : `Recall before revealing… ${recallSeconds}s`}</button>{revealed && <p aria-label="Recall card answer" className="rounded-xl bg-indigo-50 p-4 text-xl">{String(d.answer)}</p>}</div>; break
    case 'number-line': interaction = <div className="space-y-3"><div className="flex justify-between"><span>{String(d.min)}</span><span>{String(d.max)}</span></div><label className="block">Number line marker<input className="w-full" type="range" min={Number(d.min)} max={Number(d.max)} step={Number(d.step)} value={attempt.text || Number(d.min)} onChange={e => setText(e.target.value)} /></label><output aria-live="polite">{attempt.text || 'Move the marker to choose a value'}</output></div>; break
    case 'match-columns': interaction = <div className="space-y-3" aria-label="Match the columns">{list('left').map((item, i) => <label className="grid grid-cols-2 items-center gap-2" key={i}><span>{item} →</span><select className={control} value={attempt.values[i] ?? ''} onChange={e => setValue(i, e.target.value)}><option value="">Choose match</option>{[...list('right')].reverse().map((v, j) => <option key={j}>{v}</option>)}</select></label>)}</div>; break
    case 'drag-drop': interaction = <div className="space-y-3"><div className="flex flex-wrap gap-2">{list('items').map((item, i) => <span className={control} draggable onDragStart={e => { e.dataTransfer.setData('text/plain', String(i)); setDragged(i) }} key={i}>{item}</span>)}</div><div className="grid grid-cols-2 gap-2">{list('targets').map((target, i) => <div className="min-h-20 rounded-xl border-2 border-dashed border-indigo-300 p-3" key={i} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const raw = e.dataTransfer.getData('text/plain'); const index = raw === '' ? dragged : Number(raw); if (index !== undefined && Number.isInteger(index) && index >= 0 && index < list('items').length) setValue(index, target); setDragged(undefined) }}><strong>{target}</strong><p>{list('items').filter((_, i) => attempt.values[i] === target).join(', ')}</p></div>)}</div>{list('items').map((item, i) => <label className="flex flex-wrap items-center justify-between gap-2" key={i}>{item}<select className={control} aria-label={`Target for ${item}`} value={attempt.values[i] ?? ''} onChange={e => setValue(i, e.target.value)}><option value="">Choose target</option>{list('targets').map(v => <option key={v}>{v}</option>)}</select></label>)}</div>; break
    case 'fill-blank': case 'legacy-fields': interaction = <div className="space-y-3">{type === 'legacy-fields' && <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-3">{String(d.context)}</p>}{list(type === 'fill-blank' ? 'parts' : 'keys').map((prompt, i) => <label className="block" key={i}>{prompt}<input className={`${control} mt-2 w-full`} value={attempt.values[i] ?? ''} onChange={e => setValue(i, e.target.value)} /></label>)}</div>; break
    case 'sequence': case 'build-problem': {
      const available = list(type === 'sequence' ? 'items' : 'pieces')
      interaction = <div className="space-y-3"><div className="flex min-h-16 flex-wrap gap-2 rounded-xl border-2 border-dashed border-indigo-300 p-3" aria-label={type === 'sequence' ? 'Ordered sequence' : 'Construction slots'}>{attempt.order.length ? attempt.order.map((piece, i) => <button type="button" className={control} key={i} aria-label={`Remove ${piece} at position ${i + 1}`} onClick={() => setAttempt(a => ({ ...a, order: a.order.filter((_, j) => j !== i) }))}>{piece}</button>) : 'Choose pieces below in order'}</div><div className="flex flex-wrap gap-2">{available.map((piece, i) => <button type="button" className={control} key={i} disabled={attempt.order.filter(v => v === piece).length >= available.filter(v => v === piece).length} onClick={() => setAttempt(a => ({ ...a, order: [...a.order, piece] }))}>{piece}</button>)}</div></div>; break
    }
    case 'find-mistake': interaction = attempt.stage === 0 ? <fieldset className="space-y-2"><legend>First incorrect step</legend>{list('steps').map((step, i) => <label className={`${control} flex gap-2`} key={i}><input type="radio" name="incorrect-step" checked={attempt.text === String(i + 1)} onChange={() => setText(String(i + 1))} />{i + 1}. {step}</label>)}</fieldset> : <fieldset><legend>Why is it incorrect?</legend>{options(list('explanations'), attempt.explanation, explanation => setAttempt(a => ({ ...a, explanation })))}</fieldset>; break
    case 'number-pattern': interaction = <div><p className="rounded-xl bg-slate-50 p-4 text-xl">{list('terms').join(', ')}</p><label className="block">Missing term<input className={`${control} mt-2 w-full`} value={attempt.text} onChange={e => setText(e.target.value)} /></label></div>; break
    case 'rule-discovery': interaction = <div className="space-y-3"><ul className="rounded-xl bg-slate-50 p-4">{list('examples').map((item, i) => <li key={i}>{item}</li>)}</ul><fieldset><legend>Discover the rule</legend>{options(list('rules'), attempt.rule, rule => setAttempt(a => ({ ...a, rule })))}</fieldset><label className="block">Predicted output<input className={`${control} mt-2 w-full`} value={attempt.text} onChange={e => setText(e.target.value)} /></label></div>; break
    default: interaction = <label className="block">{type === 'shared-final-key' ? 'Combined code' : type === 'scrambled-word' ? 'Reconstructed word' : 'Team answer'}<input className={`${control} mt-2 w-full`} value={attempt.text} onChange={e => setText(e.target.value)} /></label>
  }
  return <section className="space-y-4 break-words" aria-label={`${type} interactive exercise`}>
    <h3 className="text-xl font-bold">{exercise.title}</h3><p className="whitespace-pre-wrap text-sm leading-6">{exercise.instructions}</p>
    {Array.isArray(d.evidence) && <ul className="space-y-2 rounded-xl bg-slate-50 p-3">{list('evidence').map((s, i) => <li key={i}>{s}</li>)}</ul>}
    {d.rule && type === 'hypothesis' && <p>Decoder key: {String(d.rule)}</p>}{d.pattern && <p>Answer pattern: {String(d.pattern)}</p>}
    {interaction}
    <button type="button" className={`${control} w-full bg-indigo-600 font-bold text-white`} onClick={check}>Check answer</button>
    {feedback && <p role="status" className="rounded-xl bg-slate-100 p-3 text-sm font-bold">{feedback}</p>}
    <div className="flex flex-wrap gap-2"><button type="button" className={control} onClick={() => showHint(v => !v)}>Hint</button><button type="button" className={control} onClick={() => showSolution(v => !v)}>Solution</button><button type="button" className={control} onClick={reset}>Reset</button></div>
    {hint && <aside aria-label="Exercise hint" className="rounded-xl bg-amber-50 p-3 text-sm">{exercise.hint}</aside>}
    {solution && <aside aria-label="Exercise solution" className="whitespace-pre-wrap rounded-xl bg-indigo-50 p-3 text-sm">{exercise.solution}</aside>}
  </section>
}
