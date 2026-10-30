import { useEffect, useRef } from 'react'
import { control } from './ExerciseRenderer'

export function SaveWithoutExperimentsDialog({ labels, onCancel, onConfirm }: {
  labels: string[]; onCancel: () => void; onConfirm: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null
    const panel = dialog.current!
    panel.showModal(); panel.querySelector<HTMLButtonElement>('button')?.focus()
    return () => { panel.close(); if (trigger?.isConnected) trigger.focus() }
  }, [])
  return <dialog ref={dialog} role="dialog" aria-modal="true" aria-labelledby="save-supported-title" aria-describedby="save-supported-description" onCancel={event => { event.preventDefault(); onCancel() }} onKeyDown={event => {
    if (event.key === 'Escape') { event.preventDefault(); onCancel() }
    if (event.key !== 'Tab') return
    const buttons = [...(dialog.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])]
    if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons.at(-1)?.focus() }
    else if (!event.shiftKey && document.activeElement === buttons.at(-1)) { event.preventDefault(); buttons[0]?.focus() }
  }} className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 shadow-xl backdrop:bg-slate-950/60">
    <h2 id="save-supported-title" className="text-xl font-bold">Save without experimental exercises?</h2>
    <p id="save-supported-description" className="mt-3 text-sm leading-6">Only existing backend-supported template configuration will be saved. The experiments listed below will be excluded. They will stay in this editing session, but will not survive leaving or reloading the editor. Nothing experimental will be saved or approved.</p>
    <ul className="my-4 list-disc space-y-2 pl-5 text-sm">{labels.map(label => <li key={label}>{label}</li>)}</ul>
    <p className="text-sm">This confirmation does not allow submission to omit an intended custom exercise.</p>
    <div className="mt-5 flex flex-wrap justify-end gap-3"><button type="button" className={control} onClick={onCancel}>Cancel</button><button type="button" className={`${control} bg-indigo-600 font-bold text-white`} onClick={onConfirm}>Save supported settings only</button></div>
  </dialog>
}
