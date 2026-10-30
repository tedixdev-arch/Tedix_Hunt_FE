import { UniversalLibrary } from './UniversalLibrary'
import { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { gameplayPresentation } from './CheckpointGameplayEditor'
import { supportedGameplay } from './checkpointGameplay'

const focus = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700'
const entries = [
  ['mechanics', 'Mechanics Library', 'Explore supported authoring and preview capabilities.'],
  ['templates', 'My Templates', 'Open your owned Templates and current operations.'],
  ['universal', 'Create Universal Template', 'Reusable stories and challenges, without fixed locations.'],
  ['local', 'Create Local Template', 'Stories and challenges tied to real locations. Start from an approved Universal Template or from scratch.'],
] as const

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
  const close = () => setParams(current => { const next = new URLSearchParams(current); next.delete('studio'); return next })
  return <>
    <nav aria-label="Creator Studio entries" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {entries.map(([key, label, description]) => key === 'universal' ? <Link key={key} to="/create?category=universal" className={`min-h-28 min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-500 ${focus}`}><span className="block font-bold">{label}</span><span className="mt-2 block text-sm text-slate-600">{description}</span></Link> : key === 'local' ? <div key={key} className="min-h-28 min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-600">
        <span className="block font-bold">{label}</span><span className="mt-2 inline-block rounded-full bg-slate-200 px-2 py-1 text-xs font-bold">Coming soon</span><p className="mt-2 text-sm">{description}</p>
      </div> : <button key={key} type="button" aria-haspopup={key === 'templates' ? undefined : 'dialog'} onClick={() => {
        if (key === 'templates') { const heading = document.getElementById('my-templates'); heading?.focus(); heading?.scrollIntoView?.({ block: 'start', behavior: 'smooth' }); return }
        setParams(current => { const next = new URLSearchParams(current); next.set('studio', key); return next })
      }} className={`min-h-28 min-w-0 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-emerald-500 ${focus}`}><span className="block font-bold">{label}</span><span className="mt-2 block text-sm text-slate-600">{description}</span></button>)}
    </nav>
    <button type="button" aria-expanded={view === 'library'} onClick={() => setParams(current => { const next = new URLSearchParams(current); if (view === 'library') next.delete('studio'); else next.set('studio', 'library'); return next })} className={`mt-4 min-h-12 rounded-xl border border-slate-300 bg-white px-4 font-bold ${focus}`}>{view === 'library' ? 'Close Universal Library' : 'Browse Universal Library'}</button>
    {view === 'library' && <UniversalLibrary />}
    {view === 'mechanics'  && <MechanicsLibraryDialog onClose={close} />}
  </>
}
