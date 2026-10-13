import { useMemo, useRef, useState } from 'react'
import './positionWorkspace.css'
import { isSignalClujProposal, researchReferences, signalLandmarkReferences } from './signalLandmarks'
import { ProposedSignalRoute } from './ProposedSignalRoute'
import { type RouteProposal, candidateReference } from './routeResearch'
import { createFinishPointDraft, isValidFinishPoint, type FinishPointDraft } from './finishPoint'
import { CLUJ_NAPOCA_VIEW } from './mapTiles'
import { TedixMap, type PositionPin } from '../../components/TedixMap'
import type { CheckpointDraft, CreatorGeographyConfiguration } from './checkpointGeography'
import { buildGeographyConfiguration, isGeographyComplete, isValidCheckpoint, MAX_RADIUS_METERS, MIN_RADIUS_METERS, updateCheckpointDraft } from './checkpointGeography'

type PositionState = { name: string; radiusMeters: number; latitude?: number; longitude?: number; confirmed: boolean }
type PositionEdit = { number: number; before: PositionState; after: PositionState }

// Lucide undo-2 geometry; the same path reflected horizontally guarantees a mirrored pair.
function ToolbarIcon({ kind }: { kind: 'undo' | 'redo' | 'fit' | 'pin' | 'check' }) {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {kind === 'undo' || kind === 'redo' ? <g transform={kind === 'redo' ? 'translate(24 0) scale(-1 1)' : undefined}><path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-2" /></g>
      : kind === 'check' ? <path d="m20 6-11 11-5-5" />
      : kind === 'fit' ? <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />
      : <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2" /></>}
  </svg>
}

const safetyLabels: Record<string, string> = {
  'Safe standing area': 'Review standing-area safety',
  'Accessible walking route': 'Review walking accessibility',
  'Road crossings reviewed': 'Review road crossings',
  'No restricted areas': 'Review access restrictions',
  'Day and night suitability checked': 'Review day and night suitability',
  'Emergency access available': 'Review emergency access',
}

const safetyItems = ['Safe standing area', 'Accessible walking route', 'Road crossings reviewed', 'No restricted areas', 'Day and night suitability checked', 'Emergency access available']

interface Props {
  templateName?: string
  finishDraft?: FinishPointDraft
  onFinishChange?: (point: FinishPointDraft) => void
  onArrivalNotesChange?: (number: number, notes: string) => void
  savedConfiguration?: CreatorGeographyConfiguration
  proposal?: RouteProposal
  drafts: CheckpointDraft[]
  verified: Set<number>
  safety: Set<string>
  onDraftsChange: (drafts: CheckpointDraft[]) => void
  onVerifiedChange: (verified: Set<number>) => void
  onSafetyChange: (safety: Set<string>) => void
  onConfigurationChange: (configuration: CreatorGeographyConfiguration) => void
}

export function RouteEditor({ templateName, finishDraft, onFinishChange, onArrivalNotesChange, savedConfiguration, proposal, drafts, verified, safety, onDraftsChange, onVerifiedChange, onSafetyChange, onConfigurationChange }: Props) {
  const signalProposal = isSignalClujProposal(templateName ?? '', proposal) ? proposal : undefined
  const references = useMemo(() => signalProposal ? signalLandmarkReferences(signalProposal) : proposal ? researchReferences(proposal) : [], [signalProposal, proposal])
  const [activeNumber, setActiveNumber] = useState<number | undefined>(drafts[0]?.checkpointNumber)
  const active = drafts.find(point => point.checkpointNumber === activeNumber)
  const [finishConfirmed, setFinishConfirmed] = useState(false)
  const finish = finishDraft ?? createFinishPointDraft()
  const history = useRef<{ undo: PositionEdit[]; redo: PositionEdit[] }>({ undo: [], redo: [] })
  const [, refreshHistory] = useState(0)
  const [historyMessage, setHistoryMessage] = useState('')
  const [fitRequest, setFitRequest] = useState(0)
  function positionState(number: number): PositionState {
    const point = number === 0 ? finish : drafts.find(point => point.checkpointNumber === number)!
    return { name: point.name, radiusMeters: point.radiusMeters, latitude: point.latitude, longitude: point.longitude, confirmed: number === 0 ? finishConfirmed : verified.has(number) }
  }
  function recordPosition(number: number, change: Partial<CheckpointDraft>) {
    const before = positionState(number)
    const after = { ...before, ...change, confirmed: false }
    if (Object.is(before.latitude, after.latitude) && Object.is(before.longitude, after.longitude)) return
    history.current.undo.push({ number, before, after })
    history.current.redo = []
    refreshHistory(value => value + 1)
    setHistoryMessage('')
  }
  function restorePosition(direction: 'undo' | 'redo') {
    const edit = history.current[direction].pop()
    if (!edit) return
    // Capture confirmation made since the move, so redo/undo restores that session state too.
    const current = positionState(edit.number)
    const target = direction === 'undo' ? edit.before : edit.after
    if (direction === 'undo') edit.after = current
    else edit.before = current
    // Names and radii are not position history; never revive confirmation for a changed definition.
    const confirmed = target.confirmed && target.name === current.name && target.radiusMeters === current.radiusMeters
    if (edit.number === 0) {
      onFinishChange?.({ ...finish, latitude: target.latitude, longitude: target.longitude })
      setFinishConfirmed(confirmed)
    } else {
      const next = drafts.map(point => point.checkpointNumber === edit.number ? { ...point, latitude: target.latitude, longitude: target.longitude } : point)
      const nextVerified = new Set(verified)
      confirmed ? nextVerified.add(edit.number) : nextVerified.delete(edit.number)
      onDraftsChange(next); onVerifiedChange(nextVerified)
      onConfigurationChange(buildGeographyConfiguration(drafts.length, next))
    }
    history.current[direction === 'undo' ? 'redo' : 'undo'].push(edit)
    setActiveNumber(edit.number)
    setHistoryMessage(`${direction === 'undo' ? 'Undid' : 'Redid'} position change for ${edit.number === 0 ? 'FinishPoint' : `CP${edit.number}`}.`)
    refreshHistory(value => value + 1)
  }
  const finishSelected = activeNumber === 0
  const positioned = drafts.filter(isValidCheckpoint)
  const validFinish = isValidFinishPoint(finish) ? finish : undefined
  // Camera context never enters checkpoint drafts, confirmation or persistence.
  const savedCheckpoint = savedConfiguration?.checkpointPositions?.find(isValidCheckpoint)
  const savedFinish = isValidFinishPoint(savedConfiguration?.finishPoint) ? savedConfiguration.finishPoint : undefined
  const center = savedCheckpoint ?? savedFinish ?? positioned[0] ?? validFinish
  const isSignalCluj = /signal\s*:?\s*cluj[ -]napoca/i.test(templateName ?? '')
    || proposal?.candidates.some(candidate => /cluj[ -]napoca/i.test(candidate.address))
  const researchCenter = proposal && [...proposal.candidates].sort((a, b) => a.order - b.order)
    .map(candidate => candidateReference(candidate, proposal)).find(point => !!point)
  const researchContext = isSignalCluj ? undefined : researchCenter
  const initialLatitude = center?.latitude ?? researchContext?.latitude ?? CLUJ_NAPOCA_VIEW.center[0]
  const initialLongitude = center?.longitude ?? researchContext?.longitude ?? CLUJ_NAPOCA_VIEW.center[1]
  // Without geographic context, show a regional overview around the existing app default.
  const initialZoom = center || researchContext || isSignalCluj ? CLUJ_NAPOCA_VIEW.zoom : 3
  function select(number: number) { setActiveNumber(number) }
  function changeFinish(change: Partial<FinishPointDraft>) {
    if (!onFinishChange) return
    if ('latitude' in change || 'longitude' in change) {
      recordPosition(0, change)
      const next = { ...finish, ...change }
      if (Object.is(finish.latitude, next.latitude) && Object.is(finish.longitude, next.longitude)) return
    }
    setFinishConfirmed(false)
    onFinishChange?.({ ...finish, ...change })
  }
  function place(number: number, latitude: number, longitude: number) {
    if (number === 0) changeFinish({ latitude, longitude })
    else update(number, { latitude, longitude })
  }
  function placeSelected(latitude: number, longitude: number) {
    if (activeNumber !== undefined) place(activeNumber, latitude, longitude)
  }
  const pins: PositionPin[] = [...drafts.map(point => ({ ...point, status: verified.has(point.checkpointNumber) ? 'confirmed' as const : 'edited' as const })),
    { ...finish, checkpointNumber: 0, status: finishConfirmed ? 'confirmed' as const : 'edited' as const }].flatMap(point => {
    const ref = references.find(ref => ref.checkpointNumber === point.checkpointNumber)
    const authored = typeof point.latitude === 'number' && Math.abs(point.latitude) <= 90 && typeof point.longitude === 'number' && Math.abs(point.longitude) <= 180
    const location = authored ? { latitude: point.latitude!, longitude: point.longitude! } : ref
    return location ? [{ checkpointNumber: point.checkpointNumber, name: point.name || ref?.name || 'FinishPoint', latitude: location.latitude, longitude: location.longitude,
      selected: point.checkpointNumber === activeNumber, status: authored ? point.status : 'reference' as const }] : []
  })
  const selectedPin = pins.find(point => point.checkpointNumber === activeNumber)
  const selectedPoint = finishSelected ? finish : active
  function positionStatus(number: number) {
    const pin = pins.find(point => point.checkpointNumber === number)
    return pin?.status === 'confirmed' ? 'Confirmed' : pin?.status === 'edited' ? 'Locally edited · unconfirmed' : pin?.status === 'reference' ? 'Reference · unconfirmed' : 'Not positioned'
  }
  const selectedCandidate = proposal?.candidates.find(candidate => finishSelected ? candidate.role === 'terminal' : candidate.role === 'normal' && candidate.checkpoint === activeNumber)
  const changeSelected = finishSelected ? changeFinish : (change: Partial<CheckpointDraft>) => update(activeNumber!, change)
  const selectedLabel = activeNumber === undefined ? 'No checkpoint selected' : `${finishSelected ? 'F' : `CP${activeNumber}`} · ${selectedPoint?.name || 'FinishPoint'}`
  function resetControl(number: number) {
    const available = references.some(point => point.checkpointNumber === number)
    return <span className="flex flex-col items-end gap-1"><button type="button" aria-label="Reset checkpoint position" title={available ? 'Restore researched reference; clear position and confirmation' : 'Reset unavailable: no researched reference coordinate'} disabled={!available} className="min-h-11 min-w-11 rounded-lg border border-slate-300 px-3 text-sm font-bold disabled:opacity-40" onClick={() => number === 0 ? changeFinish({ latitude: undefined, longitude: undefined }) : update(number, { latitude: undefined, longitude: undefined })}>Reset position</button>{!available && <span className="text-xs text-slate-500">No researched reference to restore.</span>}</span>
  }
  function context(number: number) {
    const candidate = proposal?.candidates.find(candidate => number === 0 ? candidate.role === 'terminal' : candidate.role === 'normal' && candidate.checkpoint === number)
    if (!candidate) return null
    const ref = references.find(point => point.checkpointNumber === number)
    return <details className="mt-2 text-sm text-slate-600"><summary className="min-h-11 cursor-pointer py-3 text-xs font-bold">Arrival area &amp; research notes</summary><p>{candidate.arrivalArea}</p>{signalProposal && <p className="mt-1 text-xs font-bold text-amber-900">{ref ? 'Researched reference available' : 'Reference location unavailable'}</p>}
      {activeNumber === number && ref?.metadata && <details className="mt-2 text-xs"><summary className="min-h-11 cursor-pointer py-3 font-bold">Reference source &amp; uncertainty</summary><p>{ref.metadata.identifier}</p><p className="mt-1">{ref.metadata.method}</p><p className="mt-1">{ref.metadata.confidence}</p><p className="mt-1">{ref.metadata.uncertainty}</p><ul className="mt-2 space-y-1">{ref.metadata.sourceUrls.map(url => <li key={url}><a className="break-all underline" href={url} target="_blank" rel="noreferrer">{url}</a></li>)}</ul><p className="mt-2">{ref.metadata.attribution}</p></details>}
    </details>
  }
  const field = 'mt-1 min-h-11 w-full min-w-0 rounded-lg border border-slate-300 px-3'
  function fields(point: CheckpointDraft | FinishPointDraft, change: (value: Partial<CheckpointDraft>) => void) {
    return <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <label className="text-xs font-bold sm:col-span-2">Name<input className={field} value={point.name} onChange={event => change({ name: event.target.value })} /></label>
      <details className="sm:col-span-2"><summary className="min-h-11 cursor-pointer py-3 text-sm font-bold">Advanced coordinates</summary><div className="grid gap-3 sm:grid-cols-2">{(['latitude', 'longitude'] as const).map(key => <label key={key} className="text-xs font-bold">{key === 'latitude' ? 'Latitude' : 'Longitude'}<input aria-label={key === 'latitude' ? 'Latitude' : 'Longitude'} className={field} type="number" step="any" min={key === 'latitude' ? -90 : -180} max={key === 'latitude' ? 90 : 180} value={point[key] ?? ''} onChange={event => change({ [key]: event.target.value === '' ? undefined : Number(event.target.value) })} /></label>)}</div></details>
    </div>
  }
  const complete = isGeographyComplete(drafts, verified, safety.size, safetyItems.length)
  function update(number: number, change: Partial<CheckpointDraft>) {
    if ('latitude' in change || 'longitude' in change) {
      const before = positionState(number)
      const after = { ...before, ...change }
      if (Object.is(before.latitude, after.latitude) && Object.is(before.longitude, after.longitude)) return
      recordPosition(number, change)
    }
    const next = updateCheckpointDraft(drafts, verified, number, change)
    onDraftsChange(next.drafts); onVerifiedChange(next.verified)
    onConfigurationChange(buildGeographyConfiguration(drafts.length, next.drafts))
  }
  return <section className="position-editor" aria-label="Checkpoint position editor">
    <div className="position-progress"><p>Select a checkpoint, then tap the map, drag its pin or search to position it.</p><span>{verified.size}/{drafts.length} confirmed</span></div>
    <div className="position-workspace">
      <div className="position-map" data-testid="position-map">
        <div role="toolbar" aria-label="Checkpoint positioning" className="position-toolbar min-w-0">
          <div className="flex gap-1">{(['undo', 'redo'] as const).map(direction => <button key={direction} type="button" aria-label={`${direction === 'undo' ? 'Undo' : 'Redo'} last position change`} title={`${direction === 'undo' ? 'Undo' : 'Redo'} last position change`} disabled={!history.current[direction].length} className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-lg px-2 text-sm font-bold disabled:opacity-40" onClick={() => restorePosition(direction)}><ToolbarIcon kind={direction} /><span>{direction === 'undo' ? 'Undo' : 'Redo'}</span></button>)}</div>
          <div className="position-camera-actions"><button type="button" disabled={!pins.length} className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-bold disabled:opacity-40" onClick={() => setFitRequest(value => value + 1)}><ToolbarIcon kind="fit" />Fit route</button>
          <button type="button" disabled={activeNumber === undefined} className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-bold disabled:opacity-40" onClick={() => setActiveNumber(undefined)}><ToolbarIcon kind="pin" />Deselect</button></div>
          <p role="status" className="sr-only">{historyMessage}</p>
        </div>
        <TedixMap
        initialLatitude={initialLatitude} initialLongitude={initialLongitude} initialZoom={initialZoom}
        fitPositionsRequest={fitRequest} hideFitPositionsControl
        positionPins={pins} initialFitPoints={references}
        locationSearch
        onCheckpointSelect={select} onCheckpointMove={(number, latitude, longitude) => place(number, latitude, longitude)}
        onMapClick={placeSelected} onSearchPosition={activeNumber === undefined ? undefined : placeSelected}
      /></div>
      <nav className="position-checkpoints" aria-label="Checkpoint selection">
        <h4>Checkpoints</h4>
        <ol aria-label="Checkpoint positions">{[...drafts.map(point => ({ ...point, number: point.checkpointNumber })), ...(onFinishChange ? [{ ...finish, number: 0 }] : [])].map(point => {
          const selected = point.number === activeNumber
          const pinStatus = pins.find(pin => pin.checkpointNumber === point.number)?.status
          return <li key={point.number}><button type="button" data-checkpoint={point.number === 0 ? 'F' : point.number} aria-pressed={selected} aria-label={`${point.number === 0 ? 'F' : `CP${point.number}`} · ${point.name || 'FinishPoint'} · ${positionStatus(point.number)}`} title={`${point.name || 'FinishPoint'} · ${positionStatus(point.number)}`} className="position-checkpoint" onClick={() => select(point.number)}>
            <span className="position-number" aria-hidden="true">{point.number === 0 ? 'F' : point.number}</span>
            <strong>{point.number === 0 ? 'F' : point.number} · {point.name || 'FinishPoint'}</strong>
            <span className={`position-state position-state-${pinStatus ?? 'empty'}`} aria-hidden="true">{pinStatus === 'confirmed' ? '✓' : pinStatus === 'edited' ? '●' : '○'}</span>
          </button></li>
        })}</ol>
        <p className="position-legend">○ Reference / unplaced · ● Edited · ✓ Confirmed</p>
      </nav>
      <section className="position-inspector" aria-label="Selected checkpoint inspector">
        {selectedPoint && activeNumber !== undefined ? <>
          <div className="position-inspector-main">
            <div className="min-w-0"><h4 className="break-words font-bold">{selectedLabel}</h4><p className="text-sm text-slate-600" aria-live="polite">{positionStatus(activeNumber)}{selectedPin && <span className="position-coordinates"> · {selectedPin.latitude.toFixed(5)}, {selectedPin.longitude.toFixed(5)}</span>}</p></div>
            <button type="button" disabled={finishSelected ? !onFinishChange || !validFinish : !active || !isValidCheckpoint(active)} className="min-h-11 rounded-lg bg-emerald-500 px-4 text-sm font-bold disabled:bg-slate-300" onClick={() => { if (finishSelected) setFinishConfirmed(true); else if (active) { const next = new Set(verified); next.add(active.checkpointNumber); onVerifiedChange(next) } }}>Confirm position</button>
          </div>
          <div className="mt-3 grid gap-3">
            <label className="text-xs font-bold">Detection radius (metres)<input className={field} type="number" min={MIN_RADIUS_METERS} max={MAX_RADIUS_METERS} value={selectedPoint.radiusMeters} onChange={event => changeSelected({ radiusMeters: Number(event.target.value) })} /></label>
            <label className="text-xs font-bold">Notes<textarea className={`${field} min-h-24 py-2`} value={selectedCandidate?.arrivalArea ?? ''} disabled={!onArrivalNotesChange || !selectedCandidate} onChange={event => onArrivalNotesChange?.(activeNumber, event.target.value)} /><span className="mt-1 block font-normal text-slate-500">{selectedCandidate ? 'Arrival-area research notes; saved with the Template.' : 'No arrival-area research notes for this checkpoint.'}</span></label>
          </div>
          {!(finishSelected ? validFinish : active && isValidCheckpoint(active)) && <p role="status" className="mt-2 text-xs">Enter a name, valid coordinates and an integer radius from 5 to 500 metres. Reference positions cannot be confirmed.</p>}
          <details key={activeNumber} className="position-advanced"><summary className="min-h-11 cursor-pointer py-3 text-sm font-bold">Advanced settings</summary>
            {fields(selectedPoint, changeSelected)}
            {context(activeNumber)}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-slate-600">Reset clears authored coordinates and session confirmation.</p>{resetControl(activeNumber)}</div>
            {finishSelected && <p className="mt-2 text-xs">Terminal FinishPoint · separate from the normal checkpoint count. FinishPoint gameplay remains in Feature 6.</p>}
          </details>
        </> : <p className="py-2 text-sm text-slate-600">Select a checkpoint to position it. Search explores the map while nothing is selected.</p>}
        <p className="text-xs text-slate-500">Changes stay local until you save the Template. Confirmation is a session check, not physical safety verification.</p>
      </section>
    </div>
    <details className="mt-4 rounded-xl border border-slate-200 p-3"><summary className="min-h-11 cursor-pointer py-3 font-bold">Arrival verification &amp; safety reminders</summary>
    <p className="mt-4 text-xs text-slate-600">Position confirmations and safety reminders are temporary session checks, not saved evidence of physical verification.</p>
    <div className="mt-3 grid gap-2 sm:grid-cols-2">{safetyItems.map(item => <label key={item} className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-bold"><input className="h-5 w-5 accent-emerald-500" type="checkbox" checked={safety.has(item)} onChange={() => { const next = new Set(safety); next.has(item) ? next.delete(item) : next.add(item); onSafetyChange(next) }} />{safetyLabels[item]}</label>)}</div>
    {!complete && <p className="mt-4 text-sm font-bold text-amber-800">Place and confirm every normal checkpoint position, then complete the temporary review reminders for this session.</p>}
    </details>
    {proposal && <details className="mt-5 rounded-xl border border-amber-200 p-3"><summary className="min-h-11 cursor-pointer py-3 font-bold">Location research &amp; safety notes</summary><ProposedSignalRoute landmarkReferences={references} proposal={proposal} onInspect={() => {}} onSelectCheckpoint={select} selectedCheckpoint={finishSelected ? 'F' : active?.checkpointNumber} /></details>}
  </section>
}
