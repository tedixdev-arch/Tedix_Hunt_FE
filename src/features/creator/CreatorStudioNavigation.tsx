import { UniversalLibrary } from './UniversalLibrary'
import { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { gameplayPresentation } from './CheckpointGameplayEditor'
import { supportedGameplay } from './checkpointGameplay'

const focus = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700'
function MechanicsLibrary() {
  return <div className="mt-5 space-y-5 text-sm text-slate-700">
    <section><h3 className="text-lg font-bold text-slate-950">What can I create?</h3>
      <p className="mt-1">Hunts with 1–20 checkpoints and a separate FinishPoint. Personal and Team Challenges are optional at each stop.</p>
      <dl className="mt-3 grid gap-4 sm:grid-cols-2">{([['kind', 'Personal Challenges'], ['teamKind', 'Team Challenges']] as const).map(([field, label]) => <div key={field}><dt className="font-bold text-slate-950">{label}</dt><dd className="mt-1">{supportedGameplay[field].map(value => gameplayPresentation(field, value).name).join(' · ')}</dd></div>)}</dl>
    </section>
    <section><h3 className="text-lg font-bold text-slate-950">What can I configure?</h3>
      <ul className="mt-2 list-disc space-y-2 pl-5">
        <li><strong>Locations:</strong> checkpoint and FinishPoint positions, arrival distance and route details.</li>
        <li><strong>Activities:</strong> choose Personal and Team Challenges, including at FinishPoint.</li>
        <li><strong>Onward navigation:</strong> {supportedGameplay.navigationMode.map(value => gameplayPresentation('navigationMode', value).name).join(' · ')}.</li>
        <li><strong>Hints and scoring:</strong> existing content keeps its saved rules; custom scoring rules are unavailable.</li>
      </ul>
      <p className="mt-3 rounded-xl bg-slate-100 p-3"><strong>Preview only:</strong> inspect locations and activities; manually simulate arrival, challenge completion and progress. Route inspection does not certify safety.</p>
    </section>
    <section><h3 className="text-lg font-bold text-slate-950">What is not available yet?</h3>
      <ul className="mt-2 list-disc space-y-2 pl-5">
        <li><strong>Live play for saved Templates:</strong> GPS arrival checks, answer checking, hints, scores, rewards, progress and FinishPoint completion. Preview records none of these and does not generate directions or clues.</li>
        <li><strong>More mechanics:</strong> live team allocation and recovery, variable-team settings, Shadows and Shields.</li>
      </ul>
      <p className="mt-2">Custom gameplay code is not supported.</p>
    </section>
  </div>
}

function MechanicsLibraryDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const back = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const panel = dialog.current!
    panel.showModal(); back.current?.focus()
    return () => { panel.close(); queueMicrotask(() => { if (previous?.isConnected) previous.focus() }) }
  }, [])
  return <dialog ref={dialog} aria-labelledby="studio-guidance-title" onCancel={event => { event.preventDefault(); onClose() }} onKeyDown={event => {
    // Back is the only interactive control; keep keyboard focus inside the modal.
    if (event.key === 'Tab') { event.preventDefault(); back.current?.focus() }
  }} className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%_-_2rem)] max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 shadow-xl backdrop:bg-slate-950/50 sm:p-7">
    <button ref={back} type="button" onClick={onClose} className={`min-h-12 rounded-xl border border-slate-300 px-4 font-bold ${focus}`}>← Back to Creator Studio</button>
    <h2 id="studio-guidance-title" className="mt-5 text-2xl font-bold">Mechanics Library</h2>
    <MechanicsLibrary />
  </dialog>
}

export function CreatorStudioNavigation() {
  const [params, setParams] = useSearchParams()
  const view = params.get('studio')
  const open = (view: string) => setParams(current => { const next = new URLSearchParams(current); next.set('studio', view); return next })
  const close = () => setParams(current => { const next = new URLSearchParams(current); next.delete('studio'); return next })
  return <>
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <button type="button" aria-haspopup="dialog" onClick={() => open('create')} className={`min-h-12 rounded-xl bg-emerald-500 px-5 font-bold ${focus}`}>+ Create Template</button>
      <button type="button" aria-expanded={view === 'library'} onClick={() => view === 'library' ? close() : open('library')} className={`min-h-12 rounded-xl px-4 font-bold text-slate-700 underline ${focus}`}>{view === 'library' ? 'Close Universal Library' : 'Browse Universal Library'}</button>
    </div>
    {(view === 'create' || view === 'local') && <TemplateTypeDialog local={view === 'local'} onLocal={() => open('local')} onBack={() => open('create')} onLibrary={() => open('library')} onClose={close} />}
    {view === 'library' && <UniversalLibrary />}
    {view === 'mechanics' && <MechanicsLibraryDialog onClose={close} />}
  </>
}

function TemplateTypeDialog({ local, onLocal, onBack, onLibrary, onClose }: { local: boolean; onLocal: () => void; onBack: () => void; onLibrary: () => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const panel = dialog.current!
    panel.showModal()
    return () => { panel.close(); queueMicrotask(() => { if (previous?.isConnected) previous.focus() }) }
  }, [])
  useEffect(() => { dialog.current?.querySelector<HTMLElement>('[data-choice]')?.focus() }, [local])
  const choice = `block min-h-12 w-full rounded-xl border border-slate-300 p-4 text-left hover:border-emerald-600 ${focus}`
  return <dialog ref={dialog} aria-labelledby="template-type-title" onCancel={event => { event.preventDefault(); onClose() }} onKeyDown={event => {
    if (event.key !== 'Tab') return
    const controls = [...(dialog.current?.querySelectorAll<HTMLElement>('a[href],button:not(:disabled)') ?? [])]
    const first = controls[0], last = controls.at(-1)
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
  }} className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 shadow-xl backdrop:bg-slate-950/50 sm:p-7">
    <h2 id="template-type-title" className="text-2xl font-bold">{local ? 'Create a Local Template' : 'Choose a template type'}</h2>
    <div className="mt-5 space-y-3">{local ? <>
      <button data-choice type="button" onClick={onLibrary} className={choice}>Start from an approved Universal</button>
      <Link to="/create?category=local" className={choice}>Start from scratch</Link>
      <button type="button" onClick={onBack} className={`min-h-12 px-3 font-bold ${focus}`}>← Back to template types</button>
    </> : <>
      <Link data-choice to="/create?category=universal" className={choice}><span className="block font-bold">Universal Template</span><span className="mt-1 block text-sm text-slate-600">Create reusable challenges and gameplay without a fixed location.</span></Link>
      <button type="button" onClick={onLocal} className={choice}><span className="block font-bold">Local Template</span><span className="mt-1 block text-sm text-slate-600">Create a location-based Hunt template.</span></button>
    </>}</div>
    <button type="button" onClick={onClose} className={`mt-4 min-h-12 rounded-xl border border-slate-300 px-4 font-bold ${focus}`}>Cancel</button>
  </dialog>
}
