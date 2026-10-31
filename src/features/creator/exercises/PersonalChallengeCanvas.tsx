import { useState } from 'react'
import { ChallengeCanvas, PencilField } from './ChallengeCanvas'
import { PersonalExtendedSurface } from './PersonalExtendedSurface'
import { control } from './ExerciseRenderer'
import { validateExercise, type Exercise } from './catalog'
import { friendlyIssues } from './PersonalMechanicEditor'

type Props = { exercise: Exercise; onChange: (e: Exercise) => void }
/** The original renderer owns attempts. It stays mounted across editing-mode switches. */
export function PersonalChallengeCanvas({ exercise: e, onChange }: Props) {
  const [mode, setMode] = useState('visual'), [step, setStep] = useState(0), [playing, setPlaying] = useState(false)
  const steps = ['Title and instructions', 'Build your challenge', 'Define the correct answer', 'Hints and feedback', 'Play your challenge']
  const issues = validateExercise(e), errors = friendlyIssues(issues)
  const pencil = (key: 'title' | 'instructions' | 'solution' | 'correctFeedback' | 'incorrectFeedback', label: string, limit = 2000) => <PencilField label={label} value={e[key]} maxLength={limit} onChange={value => onChange({ ...e, [key]: value })} />
  const intro = <><div className="text-2xl font-bold">{pencil('title', 'Title', 200)}</div>{pencil('instructions', e.type === 'true-false' ? 'Statement' : 'Instructions', 4000)}</>
  const feedback = <div className="space-y-3">{e.authored!.hints.map((hint, i) => <div key={i} className="challenge-edit-card"><PencilField label={`Hint ${i + 1}`} value={hint} onChange={text => onChange({ ...e, authored: { ...e.authored!, hints: e.authored!.hints.map((x, j) => i === j ? text : x) } })} /><button type="button" className={control} onClick={() => onChange({ ...e, authored: { ...e.authored!, hints: e.authored!.hints.filter((_, j) => i !== j) } })}>Remove hint {i + 1}</button></div>)}<button type="button" className={control} disabled={e.authored!.hints.length >= 10} onClick={() => onChange({ ...e, authored: { ...e.authored!, hints: [...e.authored!.hints, ''] } })}>Add hint</button>{pencil('correctFeedback', 'Correct feedback')}{pencil('incorrectFeedback', 'Try again feedback')}{pencil('solution', 'Solution', 4000)}</div>
  const showPlay = mode === 'visual' ? playing : step === 4
  const stepIssues = issues.filter(issue => step === 0 ? /title|instructions/i.test(issue) : step === 1 ? /interaction|activity|Range|Pattern|Example/i.test(issue) : step === 2 ? /answer|expected|reference|Construction|tick/i.test(issue) : step === 3 ? /hint|feedback|solution/i.test(issue) : true)
  return <div className="min-w-0 space-y-4">
    <div className="challenge-mode" aria-label="Editing mode">{[['visual', 'Edit with Preview'], ['steps', 'Step by Step']].map(([id, label]) => <button type="button" key={id} aria-pressed={mode === id} onClick={() => setMode(id)}>{label}</button>)}</div>
    {mode === 'visual' ? <div className="flex justify-center gap-2" aria-label="Canvas interaction">{['Edit', 'Play'].map(label => <button type="button" key={label} className={control} aria-pressed={playing === (label === 'Play')} disabled={label === 'Play' && !!errors.length} onClick={() => setPlaying(label === 'Play')}>{label}</button>)}</div> : <section aria-label="Guided challenge editor" className="space-y-3 rounded-xl bg-slate-50 p-3"><p>Step {step + 1} of {steps.length}</p><h4 aria-live="polite" className="font-bold">{steps[step]}</h4><div className="flex justify-between gap-2"><button type="button" className={control} disabled={!step} onClick={() => setStep(step - 1)}>Back</button><button type="button" className={control} disabled={step === 4 || stepIssues.length > 0} onClick={() => setStep(step + 1)}>Next</button></div></section>}
    <div hidden={showPlay}>
      <ChallengeCanvas exercise={e} playing={false}><section className="space-y-5" aria-label="Personal visual authoring canvas">
        {(mode === 'visual' || step === 0) && intro}
        {(mode === 'visual' || step === 1 || step === 2) && <PersonalExtendedSurface exercise={e} onChange={onChange} part={mode === 'visual' ? 'all' : step === 1 ? 'content' : 'answer'} />}
        {mode === 'visual' ? <details><summary className="min-h-11 cursor-pointer py-3 font-bold">✎ Hints, feedback and solution</summary>{feedback}</details> : step === 3 && feedback}
      </section></ChallengeCanvas>
    </div>
    <div hidden={!showPlay}><ChallengeCanvas key={JSON.stringify(e.authored)} exercise={e} /></div>
    {errors.length > 0 && <ul role="alert" className="space-y-1 text-sm text-red-800">{errors.map(error => <li key={error}>{error}</li>)}</ul>}
  </div>
}
