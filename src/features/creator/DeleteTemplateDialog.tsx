import { useEffect, useRef } from 'react'

export function DeleteTemplateDialog({ name, deleting, error, onCancel, onConfirm, restoreFocus }: {
  name: string
  deleting: boolean
  error: string
  onCancel: () => void
  onConfirm: () => void
  restoreFocus: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const restore = useRef(restoreFocus)
  useEffect(() => {
    const panel = dialog.current!
    panel.showModal()
    panel.querySelector<HTMLButtonElement>('button')?.focus()
    return () => { panel.close(); restore.current() }
  }, [])

  return <dialog ref={dialog} aria-labelledby="delete-template-title" aria-describedby="delete-template-description" onCancel={event => { event.preventDefault(); onCancel() }} onKeyDown={event => {
    if (event.key !== 'Tab') return
    const buttons = [...(dialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])]
    const first = buttons[0], last = buttons.at(-1)
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
  }} className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 shadow-xl backdrop:bg-slate-950/50 sm:p-7">
    <h2 id="delete-template-title" className="text-2xl font-bold">Delete Template?</h2>
    <div id="delete-template-description" className="mt-4 space-y-3 break-words text-sm text-slate-600">
      <p>Are you sure you want to permanently delete "{name}"?</p>
      <p>This action cannot be undone.</p>
    </div>
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-900">{error}</p>}
    {deleting && <div className="mt-4 text-sm"><p role="status" className="font-bold">Deleting Template…</p><p className="mt-2 text-slate-600">Cancel closes this dialog; deletion will continue.</p></div>}
    <div className="mt-6 flex flex-wrap justify-end gap-3" aria-busy={deleting}>
      <button type="button" onClick={onCancel} className="min-h-12 rounded-xl border border-slate-300 px-4 font-bold focus-visible:outline focus-visible:outline-2">Cancel</button>
      <button type="button" disabled={deleting} onClick={onConfirm} className="min-h-12 rounded-xl bg-red-700 px-4 font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-700 disabled:opacity-50">{deleting ? 'Deleting…' : 'Delete Template'}</button>
    </div>
  </dialog>
}
