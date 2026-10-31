import { useId, useRef, useState, type ReactNode } from 'react'
import type { Exercise } from './catalog'
import { control, ExerciseRenderer } from './ExerciseRenderer'
import './personalChallenge.css'

/** Inline, live editing: Escape closes and returns focus without rolling back authored text. */
export function PencilField({ label, value, onChange, maxLength = 2000, children }: { label: string; value: string; onChange: (v: string) => void; maxLength?: number; children?: ReactNode }) {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null), id = useId()
  const close = () => { setOpen(false); trigger.current?.focus() }
  return <div className="challenge-editable">
    <div className="flex min-w-0 items-start gap-2"><span className="min-w-0 flex-1 whitespace-pre-wrap break-words">{value || `Add ${label.toLowerCase()}`}</span><button ref={trigger} type="button" className="challenge-pencil" aria-label={`Edit ${label}`} aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen(!open)}><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m16 3 5 5-12 12-6 1 1-6Z M14 5l5 5" /></svg></button></div>
    {open && <div id={id} className="challenge-inline-editor" role="group" aria-label={`Edit ${label}`} onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); close() } }}><label className="block text-sm font-bold">{label}<textarea autoFocus required maxLength={maxLength} aria-invalid={!value.trim()} className={`${control} mt-2 w-full bg-white`} value={value} onChange={e => onChange(e.target.value)} /></label>{!value.trim() && <p role="alert" className="text-sm text-red-800">Add text here.</p>}{children}<button type="button" className={`${control} mt-2 bg-white font-bold`} onClick={close}>Done</button></div>}
  </div>
}

/** The same engine handles all Play attempts. Remounting resets simulation only. */
export function ChallengeCanvas({ exercise, children, playing = true }: { exercise: Exercise; children?: ReactNode; playing?: boolean }) {
  return <div className="challenge-canvas" aria-label="Mobile challenge canvas"><div className="challenge-canvas-brand" aria-hidden="true"><span>TEDIXHUNT</span><span>✦</span></div>{playing ? <ExerciseRenderer key={exercise.id} exercise={exercise} /> : children}</div>
}
