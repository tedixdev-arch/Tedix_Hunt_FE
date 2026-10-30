import { useEffect, useRef } from 'react'
import { type Exercise, typeName, validateExercise } from './catalog'
import { control, ExerciseRenderer } from './ExerciseRenderer'

export function ExercisePreview({ exercise, onClose }: { exercise: Exercise; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null
    const panel = dialog.current!
    panel.showModal(); panel.querySelector<HTMLButtonElement>('button')?.focus()
    return () => { panel.close(); if (trigger?.isConnected) trigger.focus() }
  }, [])
  const errors = validateExercise(exercise)
  return <dialog ref={dialog} role="dialog" aria-modal="true" aria-labelledby="exercise-preview-title" onCancel={event => { event.preventDefault(); onClose() }} onKeyDown={event => {
    if (event.key === 'Escape') { event.preventDefault(); onClose() }
    if (event.key !== 'Tab') return
    const nodes = [...(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]') ?? [])]
    const first = nodes[0], last = nodes.at(-1)
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
  }} className="m-auto max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-[410px] overflow-y-auto overflow-x-hidden rounded-[2rem] border-4 border-slate-800 bg-white p-4 text-slate-950 shadow-xl backdrop:bg-slate-950/60 sm:p-5">
    <header className="mb-5 flex items-center justify-between gap-2 border-b border-slate-200 pb-3"><div><h2 id="exercise-preview-title" className="font-bold">Exercise preview</h2><p className="text-xs text-slate-500">{typeName(exercise.type)} · Simulator</p></div><button type="button" className={control} aria-label="Close exercise preview" onClick={onClose}>Close</button></header>
    <div className="min-h-[480px] min-w-0">{errors.length ? <div role="alert"><p>Fix the configuration before previewing:</p><ul className="list-disc pl-5">{errors.map(error => <li key={error}>{error}</li>)}</ul></div> : <ExerciseRenderer exercise={exercise} />}</div>
  </dialog>
}
