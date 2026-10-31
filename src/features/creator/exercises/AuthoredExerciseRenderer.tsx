import { useEffect, useState } from 'react'
import type { Exercise, Attempt } from './catalog'
import { emptyAttempt } from './catalog'
const control = 'min-h-11 min-w-0 max-w-full rounded-lg border border-slate-300 p-2 text-sm'
const same = (a: string[], b: string[]) => a.length === b.length && a.every((v, i) => v === b[i])
export function checkAuthoredAnswer(e: Exercise, attempt: Attempt): boolean {
  const d: any = e.authored!.activity, a: any = e.authored!.expected
  const text = (actual: string, expected: string) => a.caseSensitive ? actual === expected : actual.toLocaleUpperCase() === expected.toLocaleUpperCase()
  switch (e.type) {
    case 'tap-pair': case 'match-columns': return a.pairs.every((p: any) => attempt.values[p.leftId] === p.rightId)
    case 'single-choice': case 'distributed-information': return attempt.text === a.optionId
    case 'multiple-choice': return attempt.selected.length === a.optionIds.length && a.optionIds.every((id: string) => attempt.selected.includes(id))
    case 'true-false': return attempt.text === String(a.value)
    case 'memory-card': case 'hypothesis': case 'clue-synthesis': return text(attempt.text, a.value)
    case 'number-line': return attempt.text.trim() !== '' && Number.isFinite(Number(attempt.text)) && Math.abs(Number(attempt.text) - a.target) <= a.tolerance
    case 'drag-drop': return a.assignments.every((p: any) => attempt.values[p.itemId] === p.targetId)
    case 'fill-blank': return a.values.every((v: any) => text(attempt.values[v.blankId] ?? '', v.value))
    case 'sequence': return same(attempt.order, a.order)
    case 'build-problem': return same(attempt.order, a.construction)
    case 'find-mistake': return attempt.text === a.stepId && attempt.explanation === a.explanationId
    case 'number-pattern': return attempt.text.trim() !== '' && Number(attempt.text) === a.value
    case 'shape-pattern': return attempt.text === a.shapeId
    case 'rule-discovery': return attempt.rule === a.ruleId && attempt.text.trim() !== '' && Number(attempt.text) === a.predictedOutput
    case 'scrambled-word': return text(attempt.text.replace(/\s/gu, ''), a.word.replace(/\s/gu, ''))
    case 'assemble-machine': return attempt.text === a.frequencyId
    case 'filter-noise': return attempt.selected.length === a.trustedSignalIds.length && a.trustedSignalIds.every((id: string) => attempt.selected.includes(id))
    case 'shared-final-key': return attempt.text === a.code && same(attempt.order, a.order) && attempt.order.map(id => d.contributions.find((c: any) => c.id === id)?.digits).join('') === attempt.text
    default: return false
  }
}
export function AuthoredExerciseRenderer({ exercise: e }: { exercise: Exercise }) {
  const [attempt, setAttempt] = useState(emptyAttempt), [feedback, setFeedback] = useState(''), [hints, setHints] = useState(0), [solution, setSolution] = useState(false), [reset, setReset] = useState(0), [ready, setReady] = useState(false), [reveal, setReveal] = useState(false)
  const [pair, setPair] = useState<string>(), [mismatch, setMismatch] = useState<string>(), [dragged, setDragged] = useState<string>()
  const d: any = e.authored!.activity, a: any = e.authored!.expected
  useEffect(() => { if (e.type !== 'memory-card') return; setReady(false); const timer = setTimeout(() => setReady(true), d.revealDelayMs); return () => clearTimeout(timer) }, [e.type, d.revealDelayMs, reset])
  const update = (patch: Partial<Attempt>) => { setAttempt(current => ({ ...current, ...patch })); setFeedback('') }
  const setValue = (key: string, v: string) => update({ values: { ...attempt.values, [key]: v } })
  const choices = (items: any[], selected: string, choose: (id: string) => void) => <div className="grid gap-2">{items.map(item => <button type="button" className={control} aria-pressed={item.id === selected} key={item.id} onClick={() => choose(item.id)}>{item.text ?? item.digits ?? item.prompt} {item.value !== undefined && `(${item.value})`}</button>)}</div>
  const input = (name: string) => <label className="block">{name}<input className={`${control} mt-2 w-full`} value={attempt.text} onChange={event => update({ text: event.target.value })} /></label>
  const select = (name: string, key: string, choices: any[]) => <label className="block" key={key}>{name}<select className={`${control} mt-2 w-full`} value={attempt.values[key] ?? ''} onChange={event => setValue(key, event.target.value)}><option value="">Choose item</option>{choices.map(x => <option key={x.id} value={x.id}>{x.text}</option>)}</select></label>
  const order = (items: any[], slots?: any[]) => <div className="space-y-3">{slots && <p>{slots.map(x => x.text).join(' → ')}</p>}<div aria-label="Ordered selection" className="flex min-h-12 flex-wrap gap-2 rounded-lg border p-2">{attempt.order.map((id, i) => <button type="button" className={control} key={id} aria-label={`Remove selection ${i + 1}`} onClick={() => update({ order: attempt.order.filter((_, j) => j !== i) })}>{items.find(x => x.id === id)?.text ?? items.find(x => x.id === id)?.digits}</button>)}</div>{items.map((x, i) => <button type="button" className={control} key={x.id} disabled={attempt.order.includes(x.id)} onClick={() => update({ order: [...attempt.order, x.id] })}>{i + 1}. {x.text ?? x.digits}</button>)}</div>
  let interaction
  switch (e.type) {
    case 'tap-pair': {
      const cards = [...d.left.map((x: any) => ({ ...x, side: 'left' })), ...[...d.right].reverse().map((x: any) => ({ ...x, side: 'right' }))]
      interaction = <div className="grid grid-cols-2 gap-2" aria-label="Tap and pair cards">{cards.map((x: any, index: number) => {
        const key = `${x.side}:${x.id}`, matched = x.side === 'left' ? !!attempt.values[x.id] : Object.values(attempt.values).includes(x.id)
        const visible = matched || pair === key || mismatch === key
        return <button type="button" className={`${control} min-h-16`} key={key} aria-label={visible ? x.text : `Card ${index + 1} face down`} aria-pressed={visible} disabled={matched} onClick={() => {
          setMismatch(undefined)
          if (!pair) { setPair(key); return }
          if (pair === key) return
          const [side, selected] = pair.split(':')
          const leftId = side === 'left' ? selected : x.id, rightId = side === 'right' ? selected : x.id
          if (side !== x.side && a.pairs.some((p: any) => p.leftId === leftId && p.rightId === rightId)) { setValue(leftId, rightId); setFeedback('Pair matched.') }
          else { setMismatch(key); setFeedback(e.incorrectFeedback) }
          setPair(undefined)
        }}>{visible ? x.text : '?'}</button>
      })}</div>; break
    }
    case 'match-columns': interaction = d.left.map((x: any) => select(x.text, x.id, [...d.right].reverse())); break
    case 'single-choice': case 'distributed-information': interaction = choices(d.options, attempt.text, text => update({ text })); break
    case 'true-false': interaction = choices([{ id: 'true', text: 'True' }, { id: 'false', text: 'False' }], attempt.text, text => update({ text })); break
    case 'multiple-choice': case 'filter-noise': interaction = <fieldset><legend>Select all that apply</legend>{(d.options ?? d.signals).map((x: any) => <label key={x.id} className={`${control} flex gap-2`}><input type="checkbox" checked={attempt.selected.includes(x.id)} onChange={() => update({ selected: attempt.selected.includes(x.id) ? attempt.selected.filter(v => v !== x.id) : [...attempt.selected, x.id] })} />{x.text}</label>)}</fieldset>; break
    case 'memory-card': interaction = <>{input('Recalled answer')}<button type="button" className={control} disabled={!ready} onClick={() => setReveal(true)}>{ready ? 'Reveal recall card' : 'Recall before revealing…'}</button>{reveal && <p aria-label="Recall card answer">{d.card}</p>}</>; break
    case 'number-line': interaction = <label>Number line marker ({d.min} to {d.max})<input className="w-full" type="range" min={d.min} max={d.max} step={d.step} value={attempt.text || d.min} onChange={event => update({ text: event.target.value })} /><output>{attempt.text || 'Choose a value'}</output></label>; break
    case 'drag-drop': interaction = <div className="space-y-2"><div className="flex flex-wrap gap-2">{d.items.map((x: any) => <span key={x.id} className={control} draggable onDragStart={() => setDragged(x.id)}>{x.text}</span>)}</div>{d.targets.map((x: any) => <div key={x.id} className="min-h-16 rounded-lg border-2 border-dashed p-2" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); if (dragged) setValue(dragged, x.id); setDragged(undefined) }}>{x.text}: {d.items.filter((item: any) => attempt.values[item.id] === x.id).map((item: any) => item.text).join(', ')}</div>)}{d.items.map((x: any) => select(`Target for ${x.text}`, x.id, d.targets))}</div>; break
    case 'fill-blank': interaction = d.blanks.map((x: any) => <label className="block" key={x.id}>{x.prompt}<input className={`${control} mt-2 w-full`} value={attempt.values[x.id] ?? ''} onChange={event => setValue(x.id, event.target.value)} /></label>); break
    case 'sequence': interaction = order(d.elements); break
    case 'build-problem': interaction = order(d.pieces, d.slots); break
    case 'find-mistake': interaction = attempt.stage === 0 ? choices(d.steps, attempt.text, text => update({ text })) : choices(d.explanations, attempt.explanation, explanation => update({ explanation })); break
    case 'number-pattern': interaction = <><p>{d.terms.map((t: any) => t.value ?? '___').join(', ')}</p>{input('Missing term')}</>; break
    case 'shape-pattern': interaction = <><p>{d.terms.map((t: any) => d.shapes.find((s: any) => s.id === t.shapeId)?.text ?? '___').join(' ')}</p>{choices(d.shapes, attempt.text, text => update({ text }))}</>; break
    case 'rule-discovery': interaction = <><ul>{d.examples.map((x: any, i: number) => <li key={i}>{x.input} → {x.output}</li>)}</ul>{choices(d.rules, attempt.rule, rule => update({ rule }))}{input(`Predicted output for ${d.predictionInput}`)}</>; break
    case 'assemble-machine': interaction = choices(d.frequencies, attempt.text, text => update({ text })); break
    case 'shared-final-key': interaction = <><p>{d.orderingInstructions}</p>{order(d.contributions)}{input('Combined code')}</>; break
    default: interaction = input('Team answer')
  }
  const evidence = d.contributions ?? d.facts ?? d.packets ?? d.clues ?? d.signals
  return <section className="min-w-0 space-y-4 break-words" aria-label={`${e.type} interactive exercise`}><h3 className="text-xl font-bold">{e.title}</h3><p className="whitespace-pre-wrap">{e.instructions}</p>{evidence && <ul>{evidence.map((x: any) => <li key={x.id}>{x.text ?? x.digits}</li>)}</ul>}{d.decoderKey && <p>Decoder key: {d.decoderKey}</p>}{d.answerPattern && <p>Answer pattern: {d.answerPattern}</p>}{interaction}<button type="button" className={control} onClick={() => { if (e.type === 'find-mistake' && attempt.stage === 0 && attempt.text === a.stepId) { update({ stage: 1 }); setFeedback('Step found. Now explain why it is incorrect.'); return } setFeedback(checkAuthoredAnswer(e, attempt) ? e.correctFeedback : e.incorrectFeedback) }}>Check answer</button>{feedback && <p role="status">{feedback}</p>}<div className="flex flex-wrap gap-2"><button type="button" className={control} disabled={hints >= e.authored!.hints.length} onClick={() => setHints(v => v + 1)}>Hint</button><button type="button" className={control} onClick={() => setSolution(v => !v)}>Solution</button><button type="button" className={control} onClick={() => { setAttempt(emptyAttempt()); setFeedback(''); setHints(0); setSolution(false); setReveal(false); setPair(undefined); setMismatch(undefined); setDragged(undefined); setReset(v => v + 1) }}>Reset</button></div>{e.authored!.hints.slice(0, hints).map((hint, i) => <aside aria-label={`Exercise hint ${i + 1}`} key={i}>{hint}</aside>)}{solution && <aside aria-label="Exercise solution" className="whitespace-pre-wrap">{e.solution}</aside>}</section>
}
