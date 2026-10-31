import type { Exercise } from './catalog'

/** Read-only content overview; testing uses the shared interactive renderer separately. */
export function PredefinedChallengeContent({ exercise }: { exercise: Exercise }) {
  if (!exercise.authored) return null
  const d: any = exercise.authored.activity
  const cards = (items: any[]) => <div className="grid min-w-0 gap-2 sm:grid-cols-2">{items.map((item, index) => <p key={item.id ?? index} className="min-w-0 whitespace-pre-wrap break-words rounded-xl border border-emerald-200 bg-white p-3 text-sm">{item.text ?? item.prompt ?? item.value ?? item.digits ?? String(item)}</p>)}</div>
  let content
  switch (exercise.type) {
    case 'tap-pair': case 'match-columns': content = <div className="grid min-w-0 gap-3 sm:grid-cols-2"><div>{cards(d.left)}</div><div>{cards(d.right)}</div></div>; break
    case 'single-choice': case 'multiple-choice': content = cards(d.options); break
    case 'true-false': content = cards(['True', 'False']); break
    case 'memory-card': content = <p className="rounded-xl bg-white p-4">{d.card}</p>; break
    case 'number-line': content = <div className="rounded-xl bg-white p-4"><div className="my-4 h-1 bg-emerald-700" /><p className="flex justify-between"><span>{d.min}</span><span>{d.max}</span></p><p className="mt-2 text-sm">Move in steps of {d.step}.</p></div>; break
    case 'drag-drop': content = <div className="space-y-3">{cards(d.items)}<p className="text-sm font-bold">Sort into</p>{cards(d.targets)}</div>; break
    case 'fill-blank': content = cards(d.blanks); break
    case 'sequence': content = cards(d.elements); break
    case 'find-mistake': content = <ol className="list-decimal space-y-2 pl-5 text-sm">{d.steps.map((step: any) => <li key={step.id} className="whitespace-pre-wrap break-words">{step.text}</li>)}</ol>; break
    case 'build-problem': content = <div className="space-y-3">{cards(d.pieces)}<p className="text-sm">Build your answer in {d.slots.length} spaces.</p></div>; break
    case 'number-pattern': content = cards(d.terms.map((term: any) => ({ ...term, text: term.value === undefined ? '___' : String(term.value) }))); break
    case 'shape-pattern': content = cards(d.terms.map((term: any) => ({ ...term, text: d.shapes.find((s: any) => s.id === term.shapeId)?.text ?? '___' }))); break
    case 'rule-discovery': content = <div className="space-y-3">{cards(d.examples.map((example: any) => `${example.input} → ${example.output}`))}{cards(d.rules)}<p className="text-sm">Find the output for {d.predictionInput}.</p></div>; break
  }
  return <div className="min-w-0 space-y-3">{content}<details><summary className="min-h-11 cursor-pointer py-3 text-sm font-bold">Hints and solution</summary><div className="space-y-2 whitespace-pre-wrap break-words text-sm">{exercise.authored.hints.map((hint, i) => <p key={i}>{hint}</p>)}<p>{exercise.solution}</p></div></details></div>
}
