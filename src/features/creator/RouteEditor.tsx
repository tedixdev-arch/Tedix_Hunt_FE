import type { RefObject } from 'react'
import type { LocalitySnapshot } from '../../services/api/geography'
import type { MapCamera } from '../../components/TedixMap'
import { useEffect, useMemo, useRef, useState } from 'react'
import './positionWorkspace.css'
import { isSignalClujProposal, researchReferences, signalLandmarkReferences } from './signalLandmarks'
import { type RouteProposal, candidateReference } from './routeResearch'
import { createFinishPointDraft, isValidFinishPoint, type FinishPointDraft } from './finishPoint'
import { CLUJ_NAPOCA_VIEW } from './mapTiles'
import { TedixMap, type PositionPin } from '../../components/TedixMap'
import type { CheckpointDraft, CreatorGeographyConfiguration } from './checkpointGeography'
import { buildGeographyConfiguration, isGeographyComplete, isValidCheckpoint, MAX_RADIUS_METERS, MIN_RADIUS_METERS, updateCheckpointDraft } from './checkpointGeography'

type PositionState = { name: string; radiusMeters: number; latitude?: number; longitude?: number; confirmed: boolean }
type PositionEdit = { number: number; before: PositionState; after: PositionState }

// Lucide undo-2 geometry; the same path reflected horizontally guarantees a mirrored pair.
function ToolbarIcon({ kind }: { kind: 'undo' | 'redo' | 'pin' | 'check' | 'maximize' }) {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {kind === 'undo' || kind === 'redo' ? <g transform={kind === 'redo' ? 'translate(24 0) scale(-1 1)' : undefined}><path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-2" /></g>
      : kind === 'maximize' ? <path d="M8 3H3v5 M16 3h5v5 M21 16v5h-5 M8 21H3v-5" />
      : kind === 'check' ? <path d="m20 6-11 11-5-5" />
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
  city?: LocalitySnapshot | null
  cameraMemory?: RefObject<MapCamera | null>
  cityCameraRequest?: MapCamera
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

export function RouteEditor({ city, cameraMemory, cityCameraRequest, templateName, finishDraft, onFinishChange, onArrivalNotesChange, savedConfiguration, proposal, drafts, verified, safety, onDraftsChange, onVerifiedChange, onSafetyChange, onConfigurationChange }: Props) {
  const signalProposal = isSignalClujProposal(templateName ?? '', proposal) ? proposal : undefined
  const references = useMemo(() => signalProposal ? signalLandmarkReferences(signalProposal) : proposal ? researchReferences(proposal) : [], [signalProposal, proposal])
  const [activeNumber, setActiveNumber] = useState<number | undefined>(drafts[0]?.checkpointNumber)
  const active = drafts.find(point => point.checkpointNumber === activeNumber)
  const [finishConfirmed, setFinishConfirmed] = useState(false)
  const [mapMode, setMapMode] = useState<'map' | 'satellite'>('map')
  const [focusPosition, setFocusPosition] = useState<{ latitude?: number; longitude?: number }>()
  const [fitPositionsRequest, setFitPositionsRequest] = useState(0)
  const fitRequestSequence = useRef(0)
  const finish = finishDraft ?? createFinishPointDraft()
  const history = useRef<{ undo: PositionEdit[]; redo: PositionEdit[] }>({ undo: [], redo: [] })
  const [, refreshHistory] = useState(0)
  const [historyMessage, setHistoryMessage] = useState('')
  const [editing, setEditing] = useState<{ number: number; point: CheckpointDraft | FinishPointDraft; notes: string }>()
  const [editError, setEditError] = useState('')
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
    setEditing(undefined)
    // History remains usable after confirmation without re-enabling placement.
    setActiveNumber(current => current === undefined ? undefined : edit.number)
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
  const rememberedCamera = useRef(cameraMemory?.current)
  const validCity = city && Number.isFinite(city.latitude) && Math.abs(city.latitude) <= 90 && Number.isFinite(city.longitude) && Math.abs(city.longitude) <= 180 ? city : undefined
  const initialBounds = useRef(rememberedCamera.current ? [] : [...positioned, ...(validFinish ? [validFinish] : [])])
  const initialLatitude = rememberedCamera.current?.latitude ?? center?.latitude ?? validCity?.latitude ?? researchContext?.latitude ?? (isSignalCluj ? CLUJ_NAPOCA_VIEW.center[0] : 0)
  const initialLongitude = rememberedCamera.current?.longitude ?? center?.longitude ?? validCity?.longitude ?? researchContext?.longitude ?? (isSignalCluj ? CLUJ_NAPOCA_VIEW.center[1] : 0)
  // A world view has no implied city; established Signal reference context remains available.
  const initialZoom = rememberedCamera.current?.zoom ?? (validCity ? 12 : center || researchContext || isSignalCluj ? CLUJ_NAPOCA_VIEW.zoom : 2)
  const [recenterCity, setRecenterCity] = useState<MapCamera>()
  const openingCityRequest = useRef(cityCameraRequest)
  useEffect(() => setRecenterCity(undefined), [cityCameraRequest])
  function select(number: number) {
    setEditing(current => current?.number === number ? current : undefined); setEditError(''); setActiveNumber(number)
    // The latest explicit action wins while Mapbox is still loading.
    setFitPositionsRequest(0)
    const point = pins.find(point => point.checkpointNumber === number)
    // Navigate to the displayed authored or reference location without editing it.
    // A fresh request also permits reselecting after panning away.
    setFocusPosition(point ? { latitude: point.latitude, longitude: point.longitude } : undefined)
  }
  function showAllPositions() {
    setFocusPosition(undefined)
    setFitPositionsRequest(++fitRequestSequence.current)
  }
  function changeFinish(change: Partial<FinishPointDraft>) {
    if (!onFinishChange) return
    if ('latitude' in change || 'longitude' in change) {
      recordPosition(0, change)
      const next = { ...finish, ...change }
      if (Object.is(finish.latitude, next.latitude) && Object.is(finish.longitude, next.longitude) && finish.name === next.name && finish.radiusMeters === next.radiusMeters) return
    }
    setFinishConfirmed(false)
    onFinishChange?.({ ...finish, ...change })
  }
  function place(number: number, latitude: number, longitude: number) {
    if (number === 0) changeFinish({ latitude, longitude })
    else update(number, { latitude, longitude })
  }
  function confirmPosition() {
    if (finishSelected) {
      if (!onFinishChange || !isValidFinishPoint(finish)) return
      setFinishConfirmed(true)
    } else {
      if (!active || !isValidCheckpoint(active)) return
      const next = new Set(verified)
      next.add(active.checkpointNumber)
      onVerifiedChange(next)
    }
    setActiveNumber(undefined)
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
    return pin?.status === 'confirmed' ? 'Confirmed' : pin?.status === 'edited' ? 'Locally edited · unconfirmed' : pin?.status === 'reference' ? 'Reference · Not positioned' : 'Not positioned'
  }
  const selectedCandidate = proposal?.candidates.find(candidate => finishSelected ? candidate.role === 'terminal' : candidate.role === 'normal' && candidate.checkpoint === activeNumber)
  const selectedLabel = activeNumber === undefined ? 'No checkpoint selected' : `${finishSelected ? 'F' : `CP${activeNumber}`} · ${selectedPoint?.name || 'FinishPoint'}`
  const field = 'mt-1 min-h-11 w-full min-w-0 rounded-lg border border-slate-300 px-3'
  function approveReset(number: number) {
    const saved = number === 0 ? savedConfiguration?.finishPoint : savedConfiguration?.checkpointPositions.find(point => point.checkpointNumber === number)
    return !saved || window.confirm('Reset this previously saved position? Coordinates and session confirmation will be cleared in your draft.')
  }
  function resetPosition(number: number) {
    if (!approveReset(number)) return
    setEditing(undefined)
    if (number === 0) changeFinish({ latitude: undefined, longitude: undefined })
    else update(number, { latitude: undefined, longitude: undefined })
  }
  function saveEdit() {
    if (!editing) return
    const point = editing.point
    const validDefinition = point.name.trim().length > 0 && point.name.length <= 100 && Number.isInteger(point.radiusMeters) && point.radiusMeters >= MIN_RADIUS_METERS && point.radiusMeters <= MAX_RADIUS_METERS
    const empty = point.latitude === undefined && point.longitude === undefined
    if (!validDefinition || (!empty && !(editing.number === 0 ? isValidFinishPoint(point) : isValidCheckpoint(point as CheckpointDraft)))) {
      setEditError('Use a name of 1–100 characters, valid coordinates and an integer radius of 5–500 meters.'); return
    }
    if (empty && (selectedPoint?.latitude !== undefined || selectedPoint?.longitude !== undefined) && !approveReset(editing.number)) return
    // Apply all four fields together; position history records a coordinate change once.
    const change = { name: point.name, radiusMeters: point.radiusMeters, latitude: point.latitude, longitude: point.longitude }
    if (editing.number === 0) changeFinish(change)
    else update(editing.number, change)
    if (selectedCandidate && onArrivalNotesChange && editing.notes !== selectedCandidate.arrivalArea) onArrivalNotesChange(editing.number, editing.notes)
    setEditing(undefined); setEditError('')
  }
  const complete = isGeographyComplete(drafts, verified, safety.size, safetyItems.length)
  function update(number: number, change: Partial<CheckpointDraft>) {
    if ('latitude' in change || 'longitude' in change) {
      const before = positionState(number)
      const after = { ...before, ...change }
      if (Object.is(before.latitude, after.latitude) && Object.is(before.longitude, after.longitude) && before.name === after.name && before.radiusMeters === after.radiusMeters) return
      recordPosition(number, change)
    }
    const next = updateCheckpointDraft(drafts, verified, number, change)
    onDraftsChange(next.drafts); onVerifiedChange(next.verified)
    onConfigurationChange(buildGeographyConfiguration(drafts.length, next.drafts))
  }
  return <section className="position-editor" aria-label="Checkpoint position editor">
    <div className="position-progress"><p>Search to explore, then select a checkpoint and tap the map or drag its pin to position it.</p><span>{verified.size}/{drafts.length} confirmed</span><button type="button" className="min-h-11 rounded-lg px-2 text-sm font-bold" onClick={() => { if (validCity) { setFocusPosition(undefined); setFitPositionsRequest(0); setRecenterCity({ latitude: validCity.latitude, longitude: validCity.longitude, zoom: 12 }) } else showAllPositions() }}>Recenter map</button></div>
    <div className="position-workspace">
      <div className="position-map" data-testid="position-map">
        <div role="toolbar" aria-label="Checkpoint positioning" className="position-toolbar min-w-0">
          <div className="flex gap-1">{(['undo', 'redo'] as const).map(direction => <button key={direction} type="button" aria-label={`${direction === 'undo' ? 'Undo' : 'Redo'} last position change`} title={`${direction === 'undo' ? 'Undo' : 'Redo'} last position change`} disabled={!history.current[direction].length} className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-lg px-2 text-sm font-bold disabled:opacity-40" onClick={() => restorePosition(direction)}><ToolbarIcon kind={direction} /></button>)}</div>
          <div className="position-camera-actions"><button type="button" aria-label="Show all checkpoints" title="Show all checkpoints" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg" onClick={showAllPositions}><ToolbarIcon kind="maximize" /></button><button type="button" disabled={activeNumber === undefined} className="position-deselect inline-flex min-h-11 items-center gap-1 rounded-lg px-3 text-sm font-bold disabled:opacity-40" onClick={() => setActiveNumber(undefined)}><ToolbarIcon kind="pin" />Deselect</button></div>
          <div className="position-map-mode" role="group" aria-label="Map view">
            {(['map', 'satellite'] as const).map(mode => <button key={mode} type="button" aria-pressed={mapMode === mode} className="min-h-11 rounded-lg px-2 text-sm font-bold" onClick={() => setMapMode(mode)}>{mode === 'map' ? 'Map' : 'Satellite'}</button>)}
          </div>
          <p role="status" className="sr-only">{historyMessage}</p>
        </div>
        <TedixMap
        cityCameraRequest={recenterCity ?? (cityCameraRequest !== openingCityRequest.current ? cityCameraRequest : undefined)} onCameraChange={cameraMemory ? camera => { cameraMemory.current = camera } : undefined}
        initialLatitude={initialLatitude} initialLongitude={initialLongitude} initialZoom={initialZoom}
        mapStyle={mapMode === 'satellite' ? 'mapbox://styles/mapbox/satellite-streets-v12' : 'mapbox://styles/mapbox/streets-v12'}
        hideFitPositionsControl fitPositionsRequest={fitPositionsRequest} focusPosition={focusPosition}
        positionArea={validCity ? { latitude: validCity.latitude, longitude: validCity.longitude, zoom: 12 } : isSignalCluj ? { latitude: CLUJ_NAPOCA_VIEW.center[0], longitude: CLUJ_NAPOCA_VIEW.center[1], zoom: CLUJ_NAPOCA_VIEW.zoom } : undefined}
        positionPins={pins} initialFitPoints={initialBounds.current.length ? initialBounds.current : rememberedCamera.current ? [] : references}
        locationSearch
        onCheckpointSelect={select} onCheckpointMove={(number, latitude, longitude) => place(number, latitude, longitude)}
        onMapClick={placeSelected}
      /></div>
      <nav className="position-checkpoints" aria-label="Checkpoint selection">
        <h4>Checkpoints</h4>
        <ol aria-label="Checkpoint positions">{[...drafts.map(point => ({ ...point, number: point.checkpointNumber })), ...(onFinishChange ? [{ ...finish, number: 0 }] : [])].map(point => {
          const selected = point.number === activeNumber
          const pinStatus = pins.find(pin => pin.checkpointNumber === point.number)?.status
          return <li key={point.number}><button type="button" data-checkpoint={point.number === 0 ? 'F' : point.number} aria-pressed={selected} aria-label={`${point.number === 0 ? 'F' : `CP${point.number}`} · ${point.name || 'FinishPoint'} · ${positionStatus(point.number)}`} title={`${point.name || 'FinishPoint'} · ${positionStatus(point.number)}`} className="position-checkpoint" onClick={() => select(point.number)}>
            <span className="position-number" aria-hidden="true">{point.number === 0 ? 'F' : point.number}</span>
            <strong>{point.number === 0 ? 'FinishPoint' : `CP${point.number}`} · {point.name || 'FinishPoint'}</strong>
            <span className={`position-state position-state-${pinStatus ?? 'empty'}`} aria-hidden="true">{pinStatus === 'confirmed' ? '✓' : pinStatus === 'edited' ? '●' : '○'}</span>
          </button></li>
        })}</ol>
        <p className="position-legend">○ Reference / unplaced · ● Edited · ✓ Confirmed</p>
      </nav>
      <section className="position-inspector" aria-label="Selected checkpoint inspector">
        {selectedPoint && activeNumber !== undefined ? <>
          <div className="position-inspector-main">
            <h4 className="min-w-0 break-words font-bold">{selectedLabel}</h4>
            {!editing && <button type="button" className="min-h-11 rounded-lg border px-3 text-sm font-bold" onClick={() => { setEditing({ number: activeNumber, point: { ...selectedPoint }, notes: selectedCandidate?.arrivalArea ?? '' }); setEditError('') }}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" className="inline-block" fill="none" stroke="currentColor" strokeWidth="2"><path d="m16 3 5 5-13 13H3v-5Z M14 5l5 5" /></svg> Edit</button>}
          </div>
          {editing ? <form noValidate className="mt-3 grid gap-3" onSubmit={event => { event.preventDefault(); saveEdit() }}>
            <label className="text-xs font-bold">Name:<input className={field} maxLength={100} value={editing.point.name} onChange={event => setEditing({ ...editing, point: { ...editing.point, name: event.target.value } })} /></label>
            <label className="text-xs font-bold">Detection radius (meters):<input className={field} type="number" min={MIN_RADIUS_METERS} max={MAX_RADIUS_METERS} value={editing.point.radiusMeters} onChange={event => setEditing({ ...editing, point: { ...editing.point, radiusMeters: Number(event.target.value) } })} /></label>
            <fieldset><legend className="text-xs font-bold">Coordinates:</legend><div className="grid gap-2 sm:grid-cols-2">{(['latitude', 'longitude'] as const).map(key => <label key={key} className="text-xs">{key === 'latitude' ? 'Latitude' : 'Longitude'}<input className={field} aria-label={key === 'latitude' ? 'Latitude' : 'Longitude'} type="number" step="any" min={key === 'latitude' ? -90 : -180} max={key === 'latitude' ? 90 : 180} value={editing.point[key] ?? ''} onChange={event => setEditing({ ...editing, point: { ...editing.point, [key]: event.target.value === '' ? undefined : Number(event.target.value) } })} /></label>)}</div></fieldset>
            <label className="text-xs font-bold">Notes:<textarea className={`${field} min-h-24 py-2`} disabled={!selectedCandidate || !onArrivalNotesChange} value={editing.notes} onChange={event => setEditing({ ...editing, notes: event.target.value })} />{!selectedCandidate && <span className="block font-normal">No editable arrival notes available.</span>}</label>
            {editError && <p role="alert" className="text-xs text-red-700">{editError}</p>}
            <div className="flex flex-wrap gap-2"><button type="submit" className="min-h-11 rounded-lg bg-slate-900 px-3 text-sm font-bold text-white">Save changes</button><button type="button" className="min-h-11 rounded-lg border px-3 text-sm font-bold" onClick={() => { setEditing(undefined); setEditError('') }}>Cancel</button></div>
          </form> : <dl className="position-values">
            <div><dt>Name:</dt><dd>{selectedPoint.name || 'Not named'}</dd></div>
            <div><dt>Detection radius (meters):</dt><dd>{selectedPoint.radiusMeters}</dd></div>
            <div><dt>Coordinates:</dt><dd>{selectedPin ? `${selectedPin.latitude.toFixed(5)}, ${selectedPin.longitude.toFixed(5)}` : 'Not positioned'}</dd></div>
            <div><dt>Notes:</dt><dd>{selectedCandidate?.arrivalArea || 'No arrival notes available.'}</dd></div>
          </dl>}
          <p className="mt-2 text-xs text-slate-600" aria-live="polite">{positionStatus(activeNumber)}</p>
          <div className="mt-3 flex flex-wrap justify-between gap-2">
            <button type="button" disabled={!!editing || (selectedPoint.latitude === undefined && selectedPoint.longitude === undefined)} className="min-h-11 rounded-lg border px-3 text-sm font-bold disabled:opacity-40" onClick={() => resetPosition(activeNumber)}>Reset position</button>
            <button type="button" disabled={!!editing || (finishSelected ? !onFinishChange || !validFinish : !active || !isValidCheckpoint(active))} className="min-h-11 rounded-lg bg-emerald-500 px-3 text-sm font-bold disabled:bg-slate-300" onClick={confirmPosition}>Confirm position</button>
          </div>
          {!(finishSelected ? validFinish : active && isValidCheckpoint(active)) && <p role="status" className="mt-2 text-xs">Place valid authored coordinates, name and radius to confirm.</p>}
        </> : <p className="py-2 text-sm text-slate-600">Select a checkpoint to position it.</p>}
        <p className="text-xs text-slate-500">Changes stay local until you save the Template. Confirmation is a session check, not physical safety verification.</p>
      </section>
    </div>
    <details className="mt-4 rounded-xl border border-slate-200 p-3"><summary className="min-h-11 cursor-pointer py-3 font-bold">Arrival verification &amp; safety reminders</summary>
    <p className="mt-4 text-xs text-slate-600">Position confirmations and safety reminders are temporary session checks, not saved evidence of physical verification.</p>
    <div className="mt-3 grid gap-2 sm:grid-cols-2">{safetyItems.map(item => <label key={item} className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-bold"><input className="h-5 w-5 accent-emerald-500" type="checkbox" checked={safety.has(item)} onChange={() => { const next = new Set(safety); next.has(item) ? next.delete(item) : next.add(item); onSafetyChange(next) }} />{safetyLabels[item]}</label>)}</div>
    {!complete && <p className="mt-4 text-sm font-bold text-amber-800">Place and confirm every normal checkpoint position, then complete the temporary review reminders for this session.</p>}
    </details>
  </section>
}
