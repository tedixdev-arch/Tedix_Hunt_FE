import { useEffect, useMemo, useRef, useState } from 'react'
import { isSignalClujProposal, landmarkSequence, researchReferences, type LandmarkReference } from './signalLandmarks'
import { resolveLandmarkAddress } from './landmarkGeocoding'
import { ProposedSignalRoute } from './ProposedSignalRoute'
import { type RouteProposal, candidateReference } from './routeResearch'
import { createFinishPointDraft, isValidFinishPoint, type FinishPointDraft } from './finishPoint'
import { CLUJ_NAPOCA_VIEW } from './mapTiles'
import { TedixMap } from '../../components/TedixMap'
import type { CheckpointDraft, CreatorGeographyConfiguration } from './checkpointGeography'
import { buildGeographyConfiguration, isGeographyComplete, isValidCheckpoint, MAX_RADIUS_METERS, MIN_RADIUS_METERS, updateCheckpointDraft } from './checkpointGeography'

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

export function RouteEditor({ templateName, finishDraft, onFinishChange, savedConfiguration, proposal, drafts, verified, safety, onDraftsChange, onVerifiedChange, onSafetyChange, onConfigurationChange }: Props) {
  const [reference, setReference] = useState<ReturnType<typeof candidateReference>>()
  const [resolved, setResolved] = useState<LandmarkReference[]>([])
  const [resolutionStatus, setResolutionStatus] = useState<Record<number, string>>({})
  const [resolving, setResolving] = useState(false)
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const signalProposal = isSignalClujProposal(templateName ?? '', proposal) ? proposal : undefined
  const references = useMemo(() => signalProposal ? [...researchReferences(signalProposal), ...resolved] : [], [signalProposal, resolved])
  const proposedSequence = useMemo(() => signalProposal ? landmarkSequence(signalProposal, references) : undefined, [signalProposal, references])
  async function resolveMissing() {
    if (!signalProposal || resolving) return
    setResolving(true)
    // Explicit lookup is session-cached, sequential and never writes Template state.
    for (const candidate of signalProposal.candidates) {
      const number = candidate.role === 'terminal' ? 0 : candidate.checkpoint!
      if (references.some(reference => reference.checkpointNumber === number)) continue
      const result = await resolveLandmarkAddress(candidate, import.meta.env.VITE_MAPBOX_ACCESS_TOKEN)
      if (!mounted.current) return
      if (result.reference) setResolved(current => [...current.filter(point => point.checkpointNumber !== number), result.reference!])
      setResolutionStatus(current => ({ ...current, [number]: result.reason ?? 'Geocoded address reference · landmark identity unverified' }))
      if (result.reason === 'Mapbox rate limit reached') break
    }
    if (mounted.current) setResolving(false)
  }
  const [first] = drafts
  const [activeNumber, setActiveNumber] = useState(first?.checkpointNumber ?? 1)
  const active = drafts.find(point => point.checkpointNumber === activeNumber) ?? first
  const finish = finishDraft ?? createFinishPointDraft()
  const finishSelected = activeNumber === 0
  const positioned = drafts.filter(isValidCheckpoint)
  const validFinish = isValidFinishPoint(finish) ? finish : undefined
  const routeOverview = useMemo(() => {
    const coordinates = [...drafts.filter(isValidCheckpoint), ...(isValidFinishPoint(finish) ? [finish] : [])].map(point => [point.longitude, point.latitude])
    return coordinates.length > 1 ? { type: 'LineString' as const, coordinates } : undefined
  }, [drafts, finishDraft])
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
  function status(point: CheckpointDraft | FinishPointDraft, saved?: CheckpointDraft | FinishPointDraft) {
    if (point.latitude === undefined || point.longitude === undefined) return 'Not positioned'
    return saved && ['name', 'latitude', 'longitude', 'radiusMeters'].every(key => point[key as keyof typeof point] === saved[key as keyof typeof saved]) ? 'Saved position' : 'Positioned · not saved'
  }
  function select(number: number) {
    setActiveNumber(number)
    const target = references.find(point => point.checkpointNumber === number)
    setReference(target ? { latitude: target.latitude, longitude: target.longitude, name: target.name } : undefined)
  }
  function context(number: number) {
    const candidate = proposal?.candidates.find(candidate => number === 0 ? candidate.role === 'terminal' : candidate.role === 'normal' && candidate.checkpoint === number)
    if (!candidate) return null
    const ref = references.find(point => point.checkpointNumber === number)
    return <div className="mt-2 text-sm text-slate-600"><p className={activeNumber === number ? undefined : 'line-clamp-2'}>{candidate.arrivalArea}</p>{signalProposal && <p className="mt-1 text-xs font-bold text-amber-900">{ref ? ref.origin === 'address' ? 'Geocoded address reference · landmark identity unverified' : 'Research landmark reference available' : 'Reference location unavailable'}{resolutionStatus[number] && !ref ? ` · ${resolutionStatus[number]}` : ''}</p>}</div>
  }
  const field = 'mt-1 min-h-11 w-full min-w-0 rounded-lg border border-slate-300 px-3'
  function fields(point: CheckpointDraft | FinishPointDraft, change: (value: Partial<CheckpointDraft>) => void) {
    return <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <label className="text-xs font-bold sm:col-span-2">Name<input className={field} value={point.name} onChange={event => change({ name: event.target.value })} /></label>
      <details className="sm:col-span-2"><summary className="min-h-11 cursor-pointer py-3 text-sm font-bold">Advanced coordinates</summary><div className="grid gap-3 sm:grid-cols-2">{(['latitude', 'longitude'] as const).map(key => <label key={key} className="text-xs font-bold">{key === 'latitude' ? 'Latitude' : 'Longitude'}<input aria-label={key === 'latitude' ? 'Latitude' : 'Longitude'} className={field} type="number" step="any" min={key === 'latitude' ? -90 : -180} max={key === 'latitude' ? 90 : 180} value={point[key] ?? ''} onChange={event => change({ [key]: event.target.value === '' ? undefined : Number(event.target.value) })} /></label>)}</div></details>
      <label className="text-xs font-bold">Detection radius (metres)<input className={field} type="number" min={MIN_RADIUS_METERS} max={MAX_RADIUS_METERS} value={point.radiusMeters} onChange={event => change({ radiusMeters: Number(event.target.value) })} /></label>
    </div>
  }
  const complete = isGeographyComplete(drafts, verified, safety.size, safetyItems.length)
  function update(number: number, change: Partial<CheckpointDraft>) {
    const next = updateCheckpointDraft(drafts, verified, number, change)
    onDraftsChange(next.drafts); onVerifiedChange(next.verified)
    onConfigurationChange(buildGeographyConfiguration(drafts.length, next.drafts))
  }
    return <section className="mt-5 min-w-0" aria-label="Checkpoint position editor">
    <div className="h-[360px] w-full min-w-0 sm:h-[500px]" data-testid="position-map"><TedixMap
      initialLatitude={initialLatitude} initialLongitude={initialLongitude} initialZoom={initialZoom}
      cameraTarget={reference} landmarkReference={signalProposal ? undefined : reference} routeOverview={routeOverview}
      landmarkReferences={signalProposal ? references.map(point => ({ ...point, selected: point.checkpointNumber === activeNumber })) : undefined} proposedSequence={proposedSequence} onLandmarkSelect={select}
      locationSearch className="overflow-hidden rounded-2xl border border-slate-300"
      checkpoints={positioned.map(point => ({ ...point, selected: !finishSelected && active?.checkpointNumber === point.checkpointNumber, verified: verified.has(point.checkpointNumber) }))}
      finishPoint={validFinish} finishPointSelected={finishSelected}
      onFinishPointSelect={onFinishChange ? () => select(0) : undefined}
      onFinishPointMove={onFinishChange ? (latitude, longitude) => { setActiveNumber(0); onFinishChange({ ...finish, latitude, longitude }) } : undefined}
      onCheckpointSelect={select}
      onCheckpointMove={(number, latitude, longitude) => { setActiveNumber(number); update(number, { latitude, longitude }) }}
      onMapClick={(latitude, longitude) => finishSelected ? onFinishChange?.({ ...finish, latitude, longitude }) : active && update(active.checkpointNumber, { latitude, longitude })}
    /></div>
    <p className="mt-2 text-sm text-slate-600">Select a checkpoint below or on the map, then click/tap to place it or drag its marker. Search moves the map only. Changes remain local until you explicitly save the Template. Selected checkpoint: {finishSelected ? 'F' : active?.checkpointNumber ?? 'none'}.</p>
    <p className="mt-2 text-xs text-slate-500">Grey dashed line: Creator-positioned checkpoint order · not verified walking directions.</p>
    {signalProposal && <div className="mt-2 space-y-2 text-xs"><p aria-label="Map legend"><span className="font-bold text-amber-800">Amber: provisional landmark references</span> · <span className="font-bold text-emerald-800">Green: Creator-positioned arrivals</span> · Violet F: Creator-positioned terminal FinishPoint. Offset reference badges remain separate when positions overlap.</p><p>Proposed landmark sequence — not verified walking directions. Amber dashed segments connect adjacent available references only. {references.length < signalProposal.candidates.length ? 'Incomplete sequence: missing references break the line.' : 'Arrival areas remain unverified.'}</p><button type="button" className="min-h-11 rounded-lg border border-amber-300 px-3 font-bold" disabled={resolving || !import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.trim() || references.length === signalProposal.candidates.length} onClick={() => void resolveMissing()}>{resolving ? 'Resolving address references…' : 'Resolve missing address references'}</button><p>Mapbox can resolve exact researched addresses, not verify landmarks or safe arrival areas. Uncertain matches stay unavailable.</p></div>}
    <div className="mt-5 flex flex-wrap justify-between gap-3"><h4 className="text-lg font-bold">Place and inspect checkpoint positions</h4><span>{verified.size} of {drafts.length} positions confirmed</span></div>
    <ol className="mt-3 space-y-3" aria-label="Checkpoint positions">{drafts.map(point => {
      const selected = !finishSelected && active?.checkpointNumber === point.checkpointNumber
      return <li key={point.checkpointNumber}><article className={`min-w-0 rounded-xl border p-3 ${selected ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
        <button data-checkpoint={point.checkpointNumber} aria-expanded={selected} aria-pressed={selected} onClick={() => select(point.checkpointNumber)} className="flex min-h-12 w-full flex-wrap items-center gap-3 text-left" type="button"><strong>{point.checkpointNumber} · {point.name}</strong><span className="text-xs">{status(point, savedConfiguration?.checkpointPositions.find(saved => saved.checkpointNumber === point.checkpointNumber))}</span><span className="ml-auto text-sm font-bold">{point.latitude === undefined ? 'Place on map' : 'Edit position'}</span></button>{context(point.checkpointNumber)}
        {selected && <div>{fields(point, change => update(point.checkpointNumber, change))}<p className="mt-2 text-xs">Session confirmation: {verified.has(point.checkpointNumber) ? 'Position confirmed' : 'Not confirmed'}</p><button className="mt-3 min-h-11 rounded-lg bg-emerald-500 px-4 text-sm font-bold disabled:bg-slate-300" disabled={!isValidCheckpoint(point)} type="button" onClick={() => { const next = new Set(verified); next.add(point.checkpointNumber); onVerifiedChange(next) }}>Confirm position</button></div>}
      </article></li>
    })}
    {onFinishChange && <li><article className={`rounded-xl border p-3 ${finishSelected ? 'border-violet-500 bg-violet-50' : 'border-slate-200'}`}><button type="button" data-checkpoint="F" aria-expanded={finishSelected} aria-pressed={finishSelected} className="flex min-h-12 w-full flex-wrap items-center gap-3 text-left" onClick={() => select(0)}><strong>F · {finish.name || 'FinishPoint'}</strong><span className="text-xs">{status(finish, savedConfiguration?.finishPoint)}</span><span className="ml-auto text-sm font-bold">{finish.latitude === undefined ? 'Place on map' : 'Edit position'}</span></button>{context(0)}{finishSelected && <>{fields(finish, change => onFinishChange({ ...finish, ...change }))}<p className="mt-2 text-xs">Terminal FinishPoint · separate from the normal checkpoint count. FinishPoint gameplay remains in Feature 6.</p>{!validFinish && <p role="status">Enter a name, valid coordinates and an integer radius from 5 to 500 metres.</p>}</>}</article></li>}
    </ol>
    <p className="mt-4 text-xs text-slate-600">Position confirmations and safety reminders are temporary session checks, not saved evidence of physical verification.</p>
    <div className="mt-3 grid gap-2 sm:grid-cols-2">{safetyItems.map(item => <label key={item} className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-bold"><input className="h-5 w-5 accent-emerald-500" type="checkbox" checked={safety.has(item)} onChange={() => { const next = new Set(safety); next.has(item) ? next.delete(item) : next.add(item); onSafetyChange(next) }} />{safetyLabels[item]}</label>)}</div>
    {!complete && <p className="mt-4 text-sm font-bold text-amber-800">Place and confirm every normal checkpoint position, then complete the temporary review reminders for this session.</p>}
    {proposal && <details className="mt-5 rounded-xl border border-amber-200 p-3"><summary className="min-h-11 cursor-pointer py-3 font-bold">Location research &amp; safety notes</summary><ProposedSignalRoute proposal={proposal} onInspect={target => { if (!signalProposal) setReference(target) }} onSelectCheckpoint={select} selectedCheckpoint={finishSelected ? 'F' : active?.checkpointNumber} /></details>}
  </section>
}
