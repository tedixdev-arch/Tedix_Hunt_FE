import { useEffect, useRef } from 'react'

const option = 'min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 text-left font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700 disabled:opacity-50'

export function TemplateCreationChooser({ creating, error, onScratch, onSignal, onClose, onCheckTemplates }: {
  creating: boolean
  error: string
  onScratch: () => void
  onSignal: () => void
  onClose: () => void
  onCheckTemplates: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    const panel = dialog.current!
    panel.showModal()
    panel.querySelector<HTMLButtonElement>('button')?.focus()
    return () => { panel.close(); previousFocus?.focus() }
  }, [])

  return <dialog ref={dialog} aria-labelledby="template-creation-title" aria-describedby="template-creation-description" onCancel={event => { event.preventDefault(); onClose() }} onKeyDown={event => {
    if (event.key !== 'Tab') return
    const buttons = [...(dialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])]
    const first = buttons[0], last = buttons.at(-1)
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
  }} className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 shadow-xl backdrop:bg-slate-950/50 sm:p-7">
    <div className="flex items-center justify-between gap-4">
      <h2 id="template-creation-title" className="text-2xl font-bold">Create Template</h2>
      <button type="button" aria-label="Close template creation chooser" onClick={onClose} className="min-h-12 rounded-xl border border-slate-300 px-4 font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700">Close</button>
    </div>
    <p id="template-creation-description" className="mt-2 text-sm text-slate-600">Choose how you'd like to begin.</p>
    <div className="mt-5 space-y-3" aria-busy={creating}>
      <button type="button" disabled={creating} onClick={onScratch} aria-describedby="template-scratch-description" className={option}>Start from scratch</button>
      <p id="template-scratch-description" className="px-1 text-sm text-slate-600">Build a new Hunt Template with your own story, challenges and locations.</p>
      <button type="button" disabled={creating} onClick={onSignal} aria-describedby="template-signal-description" className={`${option} border-emerald-500 bg-emerald-50`}>Start from Signal Cluj</button>
      <p id="template-signal-description" className="px-1 text-sm text-slate-600">Use the existing Signal story, challenges and route research as a starting point.</p>
    </div>
    {creating && <p role="status" className="mt-4 text-sm font-bold text-emerald-800">Creating Signal Cluj draft…</p>}
    {error && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"><p>{error}</p><button type="button" onClick={onCheckTemplates} className="mt-3 min-h-12 rounded-xl border border-red-300 px-4 font-bold">Check My Templates</button></div>}
  </dialog>
}
