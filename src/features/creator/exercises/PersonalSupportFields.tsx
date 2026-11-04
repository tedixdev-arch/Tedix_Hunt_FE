import { PencilField } from './ChallengeCanvas'
import { control } from './ExerciseRenderer'
import type { Exercise } from './catalog'

/** Shared contextual support content for both Personal authoring entry points. */
export function PersonalSupportFields({ exercise: e, onChange }: { exercise: Exercise; onChange: (e: Exercise) => void }) {
  const hints = e.authored!.hints
  return <details><summary className="min-h-11 cursor-pointer py-3 text-sm font-bold">Hints, feedback and solution ✎</summary><div className="space-y-3">
    {hints.map((hint, index) => <div key={index}><span className="block text-xs font-bold">Hint {index + 1}</span><PencilField label={`Hint ${index + 1}`} value={hint} onChange={text => onChange({ ...e, authored: { ...e.authored!, hints: hints.map((value, i) => i === index ? text : value) } })}><button type="button" className={control} onClick={() => onChange({ ...e, authored: { ...e.authored!, hints: hints.filter((_, i) => i !== index) } })}>Remove hint</button></PencilField></div>)}
    <button type="button" className={control} disabled={hints.length >= 10} onClick={() => onChange({ ...e, authored: { ...e.authored!, hints: [...hints, ''] } })}>Add hint</button>
    {([['correctFeedback', 'Correct feedback'], ['incorrectFeedback', 'Try again feedback'], ['solution', 'Solution']] as const).map(([key, label]) => <div key={key}><span className="block text-xs font-bold">{label}</span><PencilField label={label} value={e[key]} maxLength={key === 'solution' ? 4000 : 2000} onChange={value => onChange({ ...e, [key]: value })} /></div>)}
  </div></details>
}
