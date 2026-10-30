import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { gameplayPresentation } from './CheckpointGameplayEditor'
import { supportedGameplay, type GameplayField } from './checkpointGameplay'

const focus = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700'
const entries = [
  ['mechanics', 'Mechanics Library', 'Explore supported authoring and preview capabilities.'],
  ['templates', 'My Templates', 'Open your owned Templates and current operations.'],
  ['universal', 'Create Universal Template', 'Reusable experiences · Coming later'],
  ['local', 'Create Local Template', 'Location-based experiences · Coming later'],
] as const

function MechanicsLibrary() {
  return <div className="mt-5 space-y-5 text-sm text-slate-700">
    <p>The Mechanics Library explains the existing authoring framework. Browsing does not create, save or approve a Template.</p>
    <section><h3 className="text-lg font-bold text-slate-950">Authorable / configurable now</h3>
      <p className="mt-2">Configure 1–20 normal checkpoints and a separate FinishPoint with map positions, arrival radii and route information. FinishPoint uses the same activity choices with a terminal role. Personal and Team Challenges are optional.</p>
      <p className="mt-2">The existing editor supports these activity and navigation choices:</p>
      <dl className="mt-3 space-y-3">{([['kind', 'Personal Challenges'], ['teamKind', 'Team Challenges'], ['navigationMode', 'Navigation modes']] as [GameplayField, string][]).map(([field, label]) => <div key={field}><dt className="font-bold text-slate-950">{label}</dt><dd className="mt-1">{supportedGameplay[field].map(value => gameplayPresentation(field, value).name).join(' · ')}</dd></div>)}</dl>
      <p className="mt-3">Navigation choices describe departure from a checkpoint. Creators select supported mechanics; they cannot upload gameplay code or define new executable mechanics.</p>
      <p className="mt-2">Hints and scoring: existing content can carry hints and scoring rules. Gameplay choices preserve saved scoring; this editor does not add custom scoring rules or a new hint engine.</p>
    </section>
    <section><h3 className="text-lg font-bold text-slate-950">Previewable now</h3><p className="mt-2">The Creator journey preview shows saved checkpoint and FinishPoint geography, configured activities and navigation choices. Arrival, activity completion and progression are manually simulated. It does not generate bearings, distances or clues, check answers, or record scores, rewards or Hunt progress. Route inspection is guidance, not safety certification.</p></section>
    <section><h3 className="text-lg font-bold text-slate-950">Planned runtime behavior</h3><p className="mt-2">Authoritative Participant GPS arrival, answer checking, hints, scoring, progression and FinishPoint completion for saved Templates are not available through this preview. Live team allocation and five-minute recovery are future runtime work. Shadows, Shields and variable-team compatibility declarations are not configurable here.</p></section>
    <p>Universal and Local Templates will use the same supported mechanics. Universal content is reusable without fixed geography; Local content adds real locations and requires its own review. Existing legacy Templates are not automatically classified.</p>
  </div>
}

function StudioGuidance({ view, onClose }: { view: 'mechanics' | 'universal' | 'local'; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const back = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const panel = dialog.current!
    panel.showModal(); back.current?.focus()
    return () => { panel.close(); queueMicrotask(() => { if (previous?.isConnected) previous.focus() }) }
  }, [])
  const title = entries.find(([key]) => key === view)![1]
  return <dialog ref={dialog} aria-labelledby="studio-guidance-title" onCancel={event => { event.preventDefault(); onClose() }} onKeyDown={event => {
    // Back is the only interactive control; keep keyboard focus inside the modal.
    if (event.key === 'Tab') { event.preventDefault(); back.current?.focus() }
  }} className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%_-_2rem)] max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 shadow-xl backdrop:bg-slate-950/50 sm:p-7">
    <button ref={back} type="button" onClick={onClose} className={`min-h-12 rounded-xl border border-slate-300 px-4 font-bold ${focus}`}>← Back to Creator Studio</button>
    <h2 id="studio-guidance-title" className="mt-5 text-2xl font-bold">{title}</h2>
    {view === 'mechanics' ? <MechanicsLibrary /> : <div className="mt-4 space-y-4 text-sm text-slate-700">
      <p className="rounded-xl bg-amber-50 p-4 font-bold text-amber-900">Coming in a later implementation slice. This workflow is not available yet.</p>
      {view === 'universal' ? <p>Universal Templates will hold reusable stories and supported challenges without requiring a fixed Country, Locality or route. Classified Universal creation is pending F7-FE-03.</p> : <>
        <p>Local Templates will combine supported mechanics with real locations. Two future paths are planned:</p>
        <ul className="list-disc space-y-3 pl-5"><li><strong>Start from an approved Universal Template.</strong> Create an independent Local draft from an exact approved source version, retaining provenance. Later source edits will not update the Local draft.</li><li><strong>Start from scratch.</strong> Create a Local Template independently; no Universal source is required.</li></ul>
        <p>Approved-source browsing and copying, Local creation and Country/Locality binding will arrive in later slices. Each Local Template requires separate review.</p>
      </>}
      <p>No Template is created by opening this screen. Existing legacy creation is separate from these forthcoming workflows.</p>
    </div>}
  </dialog>
}

export function CreatorStudioNavigation() {
  const [params, setParams] = useSearchParams()
  const view = params.get('studio')
  const close = () => setParams(current => { const next = new URLSearchParams(current); next.delete('studio'); return next })
  return <>
    <nav aria-label="Creator Studio entries" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {entries.map(([key, label, description]) => <button key={key} type="button" aria-haspopup={key === 'templates' ? undefined : 'dialog'} onClick={() => {
        if (key === 'templates') { const heading = document.getElementById('my-templates'); heading?.focus(); heading?.scrollIntoView?.({ block: 'start', behavior: 'smooth' }); return }
        setParams(current => { const next = new URLSearchParams(current); next.set('studio', key); return next })
      }} className={`min-h-28 min-w-0 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-emerald-500 ${focus}`}><span className="block font-bold">{label}</span><span className="mt-2 block text-sm text-slate-600">{description}</span></button>)}
    </nav>
    {(view === 'mechanics' || view === 'universal' || view === 'local') && <StudioGuidance key={view} view={view} onClose={close} />}
  </>
}
