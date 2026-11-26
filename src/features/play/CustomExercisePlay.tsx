import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { MathText } from '../creator/exercises/MathText'
import type { CustomExercisePlay as Exercise, CustomExerciseResponse } from '../../services/api/gameplay'

/**
 * Participant view of a Creator or Library exercise during a live Hunt. It only builds a response in the shape the
 * server expects; the browser never sees answers, and the server decides correctness. `onChange(null)` means the
 * response is incomplete and cannot be submitted yet.
 */
type Item = { id: string; text: string }
const chip = 'min-h-12 rounded-xl border px-3 py-2 text-left font-semibold transition'
const chipClass = (active: boolean) => `${chip} ${active ? 'border-emerald-300 bg-emerald-400/20 text-white' : 'border-white/20 bg-slate-950/60 text-slate-100'}`
const field = 'mt-2 min-h-12 w-full rounded-xl border border-white/20 bg-slate-950 px-3 text-lg text-white'
const numberOrNull = (value: string) => value.trim() !== '' && Number.isFinite(Number(value)) ? Number(value) : null
const list = (value: unknown): Item[] => Array.isArray(value) ? value.filter(x => x && typeof x === 'object').map((x: any) => ({ id: String(x.id), text: String(x.text ?? x.digits ?? '') })) : []

function Choice({ items, selected, onSelect, label }: { items: Item[]; selected: string; onSelect: (id: string) => void; label: string }) {
  return <div role="radiogroup" aria-label={label} className="grid gap-2">{items.map(item =>
    <button key={item.id} type="button" role="radio" aria-checked={selected === item.id} className={chipClass(selected === item.id)} onClick={() => onSelect(item.id)}><MathText text={item.text} /></button>)}</div>
}
function Multi({ items, selected, onToggle, label }: { items: Item[]; selected: string[]; onToggle: (id: string) => void; label: string }) {
  return <fieldset className="grid gap-2"><legend className="mb-1 text-sm text-slate-300">{label}</legend>{items.map(item =>
    <label key={item.id} className={`${chipClass(selected.includes(item.id))} flex items-center gap-3`}><input type="checkbox" checked={selected.includes(item.id)} onChange={() => onToggle(item.id)} /><MathText text={item.text} /></label>)}</fieldset>
}
/** Tap items to build an ordered answer; tap a placed item to remove it. */
function Ordering({ items, order, onChange, slots }: { items: Item[]; order: string[]; onChange: (order: string[]) => void; slots?: Item[] }) {
  const text = (id: string) => items.find(i => i.id === id)?.text ?? id
  return <div className="space-y-3">
    {slots && <ol className="grid gap-1 text-sm text-slate-300">{slots.map((s, i) => <li key={s.id}>{i + 1}. <MathText text={s.text} /> → <strong className="text-white">{order[i] ? <MathText text={text(order[i])} /> : '___'}</strong></li>)}</ol>}
    <div aria-label="Your order" className="flex min-h-14 flex-wrap gap-2 rounded-xl border border-dashed border-white/30 p-2">
      {order.length === 0 && <span className="self-center text-sm text-slate-400">Tap the items below in order.</span>}
      {order.map((id, i) => <button key={id} type="button" className={chipClass(true)} aria-label={`Remove ${text(id)} from position ${i + 1}`} onClick={() => onChange(order.filter((_, j) => j !== i))}>{i + 1}. <MathText text={text(id)} /></button>)}
    </div>
    <div className="flex flex-wrap gap-2">{items.filter(i => !order.includes(i.id)).map(item => <button key={item.id} type="button" className={chipClass(false)} onClick={() => onChange([...order, item.id])}><MathText text={item.text} /></button>)}</div>
  </div>
}
function Pairing({ left, right, value, onChange, label }: { left: Item[]; right: Item[]; value: Record<string, string>; onChange: (v: Record<string, string>) => void; label: (item: Item) => string }) {
  return <div className="grid gap-3">{left.map(item => <label key={item.id} className="block"><span className="font-semibold"><MathText text={item.text} /></span>
    <select aria-label={label(item)} className={field} value={value[item.id] ?? ''} onChange={e => onChange({ ...value, [item.id]: e.target.value })}>
      <option value="">Choose…</option>{right.map(r => <option key={r.id} value={r.id}>{r.text}</option>)}</select></label>)}</div>
}
const Evidence = ({ title, items }: { title: string; items: Item[] }) => items.length ? <div><p className="text-sm font-bold uppercase tracking-wider text-slate-400">{title}</p>
  <ul className="mt-2 grid gap-1">{items.map(i => <li key={i.id} className="rounded-lg bg-slate-950/60 px-3 py-2"><MathText text={i.text} /></li>)}</ul></div> : null

export function CustomExercisePlay({ exercise, onChange }: { exercise: Exercise; onChange: (response: CustomExerciseResponse | null) => void }) {
  const d = exercise.interaction
  const [text, setText] = useState(''), [choice, setChoice] = useState(''), [second, setSecond] = useState('')
  const [selected, setSelected] = useState<string[]>([]), [order, setOrder] = useState<string[]>([]), [map, setMap] = useState<Record<string, string>>({})
  const [numberValue, setNumberValue] = useState<number | null>(null)
  const toggle = (id: string) => setSelected(current => current.includes(id) ? current.filter(v => v !== id) : [...current, id])
  const key = `${exercise.type}:${exercise.title}`
  useEffect(() => { setText(''); setChoice(''); setSecond(''); setSelected([]); setOrder([]); setMap({}); setNumberValue(null) }, [key])

  const left = useMemo(() => list(d.left), [d]), right = useMemo(() => list(d.right), [d])
  const response = useMemo((): CustomExerciseResponse | null => {
    const complete = (ids: Item[]) => ids.length > 0 && ids.every(i => map[i.id])
    switch (exercise.type) {
      case 'tap-pair': case 'match-columns': return complete(left) ? { pairs: left.map(l => ({ leftId: l.id, rightId: map[l.id] })) } : null
      case 'single-choice': case 'distributed-information': return choice ? { optionId: choice } : null
      case 'true-false': return choice ? { value: choice === 'true' } : null
      case 'memory-card': case 'hypothesis': case 'clue-synthesis': return text.trim() ? { value: text } : null
      case 'number-line': return numberValue === null ? null : { value: numberValue }
      case 'number-pattern': { const n = numberOrNull(text); return n === null ? null : { value: n } }
      case 'multiple-choice': return selected.length ? { optionIds: selected } : null
      case 'filter-noise': return selected.length ? { trustedSignalIds: selected } : null
      case 'drag-drop': { const items = list(d.items); return complete(items) ? { assignments: items.map(i => ({ itemId: i.id, targetId: map[i.id] })) } : null }
      case 'fill-blank': { const blanks: Array<{ id: string }> = Array.isArray(d.blanks) ? d.blanks : []; return blanks.length && blanks.every(b => (map[b.id] ?? '').trim()) ? { values: blanks.map(b => ({ blankId: b.id, value: map[b.id] })) } : null }
      case 'sequence': return order.length && order.length === list(d.elements).length ? { order } : null
      case 'build-problem': return order.length && order.length === list(d.slots).length ? { construction: order } : null
      case 'find-mistake': return choice && second ? { stepId: choice, explanationId: second } : null
      case 'shape-pattern': return choice ? { shapeId: choice } : null
      case 'rule-discovery': { const n = numberOrNull(text); return choice && n !== null ? { ruleId: choice, predictedOutput: n } : null }
      case 'scrambled-word': return text.trim() ? { word: text } : null
      case 'assemble-machine': return choice ? { frequencyId: choice } : null
      case 'shared-final-key': { const parts = list(d.contributions); return order.length === parts.length && parts.length ? { order, code: order.map(id => parts.find(p => p.id === id)!.text).join('') } : null }
      default: return null
    }
  }, [exercise.type, d, text, choice, second, selected, order, map, numberValue, left])
  useEffect(() => { onChange(response) }, [response])

  let body: ReactNode
  const textInput = (label: string, numeric = false) => <label className="block font-semibold">{label}<input aria-label={label} className={field} inputMode={numeric ? 'decimal' : 'text'} autoComplete="off" value={text} onChange={e => setText(e.target.value)} /></label>
  switch (exercise.type) {
    case 'tap-pair': case 'match-columns': body = <Pairing left={left} right={right} value={map} onChange={setMap} label={item => `Match for ${item.text}`} />; break
    case 'single-choice': body = <Choice items={list(d.options)} selected={choice} onSelect={setChoice} label="Choose one answer" />; break
    case 'true-false': body = <Choice items={[{ id: 'true', text: 'True' }, { id: 'false', text: 'False' }]} selected={choice} onSelect={setChoice} label="True or false" />; break
    case 'memory-card': body = <>{textInput('What do you recall?')}<p className="text-sm text-slate-400">The card is revealed after you answer correctly.</p></>; break
    case 'number-line': {
      const min = Number(d.min), max = Number(d.max), step = Number(d.step)
      body = <label className="block font-semibold">Place the marker ({min} to {max})
        <input aria-label="Number line" className="mt-3 w-full accent-emerald-400" type="range" min={min} max={max} step={step} value={numberValue ?? min} onChange={e => setNumberValue(Number(e.target.value))} />
        <span className="mt-1 flex justify-between text-sm text-slate-400"><span>{min}</span><output className="text-lg font-bold text-white">{numberValue ?? 'Move the marker'}</output><span>{max}</span></span></label>
      break
    }
    case 'multiple-choice': body = <Multi items={list(d.options)} selected={selected} onToggle={toggle} label="Select all that apply" />; break
    case 'drag-drop': body = <Pairing left={list(d.items)} right={list(d.targets)} value={map} onChange={setMap} label={item => `Target for ${item.text}`} />; break
    case 'fill-blank': body = <div className="grid gap-3">{(Array.isArray(d.blanks) ? d.blanks : []).map((b: { id: string; prompt: string }) =>
      <label key={b.id} className="block font-semibold"><MathText text={b.prompt} /><input aria-label={b.prompt} className={field} autoComplete="off" value={map[b.id] ?? ''} onChange={e => setMap({ ...map, [b.id]: e.target.value })} /></label>)}</div>; break
    case 'sequence': body = <Ordering items={list(d.elements)} order={order} onChange={setOrder} />; break
    case 'build-problem': body = <Ordering items={list(d.pieces)} slots={list(d.slots)} order={order} onChange={next => setOrder(next.slice(0, list(d.slots).length))} />; break
    case 'find-mistake': body = <div className="grid gap-4"><div><p className="mb-2 font-semibold">1. Which step is wrong?</p><Choice items={list(d.steps)} selected={choice} onSelect={setChoice} label="Incorrect step" /></div>
      <div><p className="mb-2 font-semibold">2. Why is it wrong?</p><Choice items={list(d.explanations)} selected={second} onSelect={setSecond} label="Explanation" /></div></div>; break
    case 'number-pattern': body = <><p className="rounded-lg bg-slate-950/60 p-3 font-mono text-xl">{(Array.isArray(d.terms) ? d.terms : []).map((t: { id: string; value?: number }) => t.id === d.missingId ? '___' : String(t.value)).join(', ')}</p>{textInput('Missing term', true)}</>; break
    case 'shape-pattern': {
      const shapes = list(d.shapes)
      body = <><p className="rounded-lg bg-slate-950/60 p-3 text-xl"><MathText text={(Array.isArray(d.terms) ? d.terms : []).map((t: { id: string; shapeId?: string }) => t.id === d.missingId ? '___' : shapes.find(s => s.id === t.shapeId)?.text ?? '?').join('  ')} /></p>
        <Choice items={shapes} selected={choice} onSelect={setChoice} label="Missing shape" /></>
      break
    }
    case 'rule-discovery': body = <><ul className="grid gap-1 font-mono">{(Array.isArray(d.examples) ? d.examples : []).map((x: { input: number; output: number }, i: number) => <li key={i} className="rounded-lg bg-slate-950/60 px-3 py-2">{x.input} → {x.output}</li>)}</ul>
      <p className="font-semibold">Which rule fits?</p><Choice items={list(d.rules)} selected={choice} onSelect={setChoice} label="Rule" />{textInput(`What is the output for ${d.predictionInput}?`, true)}</>; break
    case 'scrambled-word': body = <><Evidence title="Letters collected" items={list(d.contributions)} />{textInput('Unscrambled word')}</>; break
    case 'distributed-information': body = <><Evidence title="Facts" items={list(d.facts)} /><Choice items={list(d.options)} selected={choice} onSelect={setChoice} label="Conclusion" /></>; break
    case 'hypothesis': body = <><Evidence title="Data packets" items={list(d.packets)} /><p className="rounded-lg bg-slate-950/60 p-3 font-mono">Decoder key: {String(d.decoderKey)}</p>{textInput('Decoded answer')}</>; break
    case 'assemble-machine': body = <><Evidence title="Machine parts" items={list(d.contributions)} /><Choice items={(Array.isArray(d.frequencies) ? d.frequencies : []).map((f: any) => ({ id: String(f.id), text: String(f.text) }))} selected={choice} onSelect={setChoice} label="Frequency" /></>; break
    case 'clue-synthesis': body = <><Evidence title="Clues" items={list(d.clues)} /><p className="rounded-lg bg-slate-950/60 p-3 font-mono">Answer pattern: {String(d.answerPattern)}</p>{textInput('Your answer')}</>; break
    case 'filter-noise': body = <Multi items={list(d.signals)} selected={selected} onToggle={toggle} label="Select every trusted signal" />; break
    case 'shared-final-key': body = <><p className="text-slate-300"><MathText text={String(d.orderingInstructions)} /></p><Ordering items={list(d.contributions)} order={order} onChange={setOrder} />
      {order.length > 0 && <p className="font-mono text-2xl tracking-[0.3em]">{order.map(id => list(d.contributions).find(p => p.id === id)?.text).join('')}</p>}</>; break
    default: body = <p role="alert">This exercise type is not supported by this app version. Contact your Organizer.</p>
  }
  return <div className="space-y-4" aria-label={`${exercise.type} exercise`}>
    <h2 className="text-xl font-bold"><MathText text={exercise.title} /></h2>
    <p className="whitespace-pre-wrap text-slate-200"><MathText text={exercise.instructions} /></p>
    {body}
  </div>
}
