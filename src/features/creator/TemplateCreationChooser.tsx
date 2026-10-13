import { useEffect, useRef, useState } from 'react'
import { creatorTemplatesApi, isSupportedStarter, type StarterTemplate } from '../../services/api/creatorTemplates'
import { formatStarterDate } from './starterDate'

const option = 'min-h-12 w-full rounded-xl border border-slate-300 px-4 py-3 text-left font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700 disabled:opacity-50'

export function TemplateCreationChooser({ creating, error, onScratch, onStarter, onClose, onCheckTemplates }: {
  creating: boolean
  error: string
  onScratch: () => void
  onStarter: (starter: StarterTemplate) => void
  onClose: () => void
  onCheckTemplates: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [view, setView] = useState<'begin' | 'starters'>('begin')
  const templateOption = useRef<HTMLButtonElement>(null)
  const back = useRef<HTMLButtonElement>(null)
  const [items, setItems] = useState<StarterTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (view !== 'starters') return
    back.current?.focus()
    let active = true
    setLoading(true); setCatalogError(''); setItems([])
    creatorTemplatesApi.listStarters().then(result => {
      if (!Array.isArray(result.items)) throw new Error('Invalid catalog')
      if (active) setItems(result.items)
    }).catch(() => {
      if (active) setCatalogError('Unable to load starter Templates. The catalog may not be available yet.')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [view, attempt])
  const previousView = useRef(view)
  useEffect(() => {
    if (previousView.current === 'starters' && view === 'begin') templateOption.current?.focus()
    previousView.current = view
  }, [view])
  const goBack = () => setView('begin')
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
  }} className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 shadow-xl backdrop:bg-slate-950/50 sm:p-7">
    <div className="flex items-center gap-1">
      {view === 'starters' && <button ref={back} type="button" disabled={creating} aria-label="Back to Create Template choices" onClick={goBack} className="min-h-11 min-w-11 shrink-0 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700 disabled:opacity-50">←</button>}
      <h2 id="template-creation-title" className={view === 'begin' ? 'flex-1 text-2xl font-bold' : 'min-w-0 flex-1 text-lg font-bold'}>{view === 'begin' ? 'Create Template' : 'Choose a starter Template'}</h2>
      <button type="button" aria-label="Close template creation chooser" onClick={onClose} className="min-h-12 rounded-xl border border-slate-300 px-4 font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700">{view === 'begin' ? 'Close' : <span aria-hidden="true">×</span>}</button>
    </div>
    <p id="template-creation-description" className="mt-2 text-sm text-slate-600">{view === 'begin' ? "Choose how you'd like to begin." : 'Select a Template to create your own editable copy.'}</p>
    <div className="mt-5 space-y-3" aria-busy={creating}>
      {view === 'begin' ? <>
        <button type="button" disabled={creating} onClick={onScratch} aria-describedby="template-scratch-description" className={option}>Start from scratch</button>
        <p id="template-scratch-description" className="px-1 text-sm text-slate-600">Build a new Hunt Template with your own story, challenges and locations.</p>
        <button ref={templateOption} type="button" disabled={creating} onClick={() => setView('starters')} aria-describedby="template-starter-description" className={`${option} border-emerald-500 bg-emerald-50`}>Start from Template</button>
        <p id="template-starter-description" className="px-1 text-sm text-slate-600">Choose an existing starter Template to customize.</p>
      </> : <>
        <div className="min-h-36" aria-busy={loading || creating}>
          <div aria-hidden="true" className="grid grid-cols-[minmax(0,1fr)_6.5rem_1rem] gap-2 border-b border-slate-200 py-2 text-xs font-bold uppercase text-slate-500"><span>Template</span><span className="text-right">Created</span><span /></div>
          {loading ? <p role="status" className="py-5 text-sm text-slate-600">Loading starter Templates…</p>
            : catalogError ? <div role="alert" className="py-4 text-sm text-red-900"><p>{catalogError}</p><button type="button" onClick={() => setAttempt(value => value + 1)} className="mt-2 min-h-11 rounded-lg border border-slate-300 px-4 font-bold">Retry</button></div>
            : items.length === 0 ? <p className="py-5 text-sm text-slate-600">No starter Templates available.</p>
            : <ul className="max-h-[50dvh] overflow-y-auto">
              {items.map(starter => <li key={starter.key} className="border-b border-slate-200">
                <button type="button" disabled={creating || !isSupportedStarter(starter)} onClick={() => onStarter(starter)} aria-describedby={`starter-${starter.key}-description`} className="grid min-h-16 w-full grid-cols-[minmax(0,1fr)_6.5rem_1rem] items-center gap-2 rounded-lg py-3 text-left hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700 disabled:opacity-50">
                  <span className="min-w-0 [overflow-wrap:anywhere]"><span className="block font-bold">{starter.displayName}</span><span id={`starter-${starter.key}-description`} className="mt-1 block text-sm text-slate-600">{starter.description}</span>{!isSupportedStarter(starter) && <span className="block text-xs text-slate-600">This starter is not supported yet.</span>}</span>
                  <span className="whitespace-nowrap text-right text-xs text-slate-600">{formatStarterDate(starter.createdAt)}</span><span aria-hidden="true" className="text-slate-500">›</span>
                </button>
              </li>)}
            </ul>}
        </div>
      </>}
    </div>
    {creating && <p role="status" className="mt-4 text-sm font-bold text-emerald-800">Creating Template draft…</p>}
    {error && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"><p>{error}</p><button type="button" onClick={onCheckTemplates} className="mt-3 min-h-12 rounded-xl border border-red-300 px-4 font-bold">Check My Templates</button></div>}
  </dialog>
}
