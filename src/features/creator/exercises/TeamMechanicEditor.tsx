import { useState } from 'react'
import { Field } from './AuthoredContentEditor'
import { mechanics } from './persistenceSchema'
import { TeamChallengeCanvas } from './TeamChallengeCanvas'
import { control } from './ExerciseRenderer'
import { validateExercise, type Exercise } from './catalog'
import { friendlyIssues } from './PersonalMechanicEditor'

export function TeamMechanicEditor({ exercise, onChange }: { exercise: Exercise; onChange: (e: Exercise) => void }) {
  const [mode, setMode] = useState('visual'), [step, setStep] = useState(0)
  const authored = exercise.authored!, schema = mechanics[authored.mechanic]
  const errors = [...new Set(validateExercise(exercise).flatMap(error => {
    if (/code|digits|answer.order/i.test(error)) return ['Use digits only. Choose each contribution once, then make the final key match that order.']
    if (/facts|contributions|packets|clues|signals/i.test(error)) return ['Complete the team information. Use 2–16 items with text in each one.']
    return friendlyIssues([error])
  }))]
  const steps = ['Set the mission', 'Give the team information', 'Define the shared answer', 'Hints and feedback', 'Try the challenge']
  const text = (key: 'title' | 'instructions' | 'solution' | 'correctFeedback' | 'incorrectFeedback', label: string) => <label className="block text-sm font-bold">{label}<textarea className={`${control} mt-2 w-full bg-white`} maxLength={key === 'title' ? 200 : key === 'instructions' || key === 'solution' ? 4000 : 2000} value={exercise[key]} onChange={event => onChange({ ...exercise, [key]: event.target.value })} /></label>
  return <div className="min-w-0 space-y-5">
    <div className="challenge-mode" aria-label="Editing mode">{[['visual', 'Edit with Preview'], ['steps', 'Step by Step']].map(([id, label]) => <button type="button" key={id} aria-pressed={mode === id} onClick={() => setMode(id)}>{label}</button>)}</div>
    {mode === 'visual' ? <TeamChallengeCanvas exercise={exercise} onChange={onChange} onGuided={() => { setStep(1); setMode('steps') }} /> : <section className="min-w-0 space-y-4 rounded-xl bg-slate-50 p-3" aria-label="Guided Team Challenge editor">
      <p className="text-xs font-bold uppercase text-emerald-800">Step {step + 1} of {steps.length}</p><h4 className="text-lg font-bold" aria-live="polite">{steps[step]}</h4>
      {step === 0 ? <>{text('title', 'Title')}{text('instructions', 'Mission instructions and shared objective')}</> : step === 1 ? <><p>Give players the information they need to combine. Items retain their identity when edited or reordered.</p><Field name="Team information" schema={schema.interaction} value={authored.activity} activity={authored.activity} onChange={activity => onChange({ ...exercise, authored: { ...authored, activity } as Exercise['authored'] })} /></> : step === 2 ? <><p>Define how the team completes this challenge. This answer is only used in the local simulation.</p><Field name="Shared answer" schema={schema.answer} value={authored.expected} activity={authored.activity} onChange={expected => onChange({ ...exercise, authored: { ...authored, expected } as Exercise['authored'] })} /></> : step === 3 ? <><Field name="Hints" schema={{ type: 'array', items: { type: 'string' }, minItems: 0, maxItems: 10 }} value={authored.hints} activity={authored.activity} onChange={hints => onChange({ ...exercise, authored: { ...authored, hints } })} />{text('correctFeedback', 'Correct feedback')}{text('incorrectFeedback', 'Try again feedback')}{text('solution', 'Solution explanation')}</> : <TeamChallengeCanvas exercise={exercise} />}
      <div className="flex justify-between gap-2"><button type="button" className={control} disabled={!step} onClick={() => setStep(step - 1)}>Back</button><button type="button" className={control} disabled={step === steps.length - 1} onClick={() => setStep(step + 1)}>Next</button></div>
    </section>}
    {errors.length > 0 && <ul role="alert" className="space-y-1 text-sm text-red-800">{errors.map(error => <li key={error}>{error}</li>)}</ul>}
  </div>
}
