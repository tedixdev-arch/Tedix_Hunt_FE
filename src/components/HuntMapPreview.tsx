import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { LineString } from 'geojson'
import { inspectHuntGeography } from './huntMapGeography'
import { calculateWalkingRoute, walkingDistance, walkingDuration, type WalkingRoute } from '../features/creator/walkingRoute'

import { TedixMap } from './TedixMap'

/** On-demand lifecycle shared by reviews and future snapshot consumers. */
export function HuntMapInspection({ configuration, unavailableReason, sourceLabel = 'Submitted-version' }: {
  configuration?: Record<string, unknown>
  unavailableReason?: string
  sourceLabel?: string
}) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return <div className="mt-4 min-w-0">
    <button type="button" className="min-h-12 rounded-xl border border-slate-300 px-4 font-bold" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen(value => !value)}>{open ? 'Close geography inspection' : 'Inspect Hunt geography'}</button>
    {open && <div id={id}>
      {unavailableReason || !configuration
        ? <p role="alert" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{unavailableReason ?? 'Authoritative geography is unavailable. No locations were substituted.'}</p>
        : <HuntMapPreview configuration={configuration} sourceLabel={sourceLabel} />}
    </div>}
  </div>
}

/** Receives only the caller's authoritative artifact configuration; no API or mutation callbacks. */
export function HuntMapPreview({ configuration, sourceLabel = 'Submitted-version' }: { configuration: Record<string, unknown>; sourceLabel?: string }) {
  const geography = useMemo(() => inspectHuntGeography(configuration, sourceLabel), [configuration, sourceLabel])
  const [route, setRoute] = useState<WalkingRoute>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const request = useRef<AbortController | null>(null)
  useEffect(() => {
    setRoute(undefined); setError(''); setLoading(false)
    return () => { request.current?.abort() }
  }, [geography])
  const { checkpoints, finishPoint, warning } = geography
  const overview = useMemo<LineString | undefined>(() => finishPoint ? { type: 'LineString', coordinates: [...checkpoints, finishPoint].map(point => [point.longitude, point.latitude]) } : undefined, [geography])
  async function estimate() {
    if (!finishPoint || loading) return
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setRoute(undefined); setError(''); setLoading(true)
    try {
      const result = await calculateWalkingRoute([...checkpoints.map(point => ({ ...point, label: `CP${point.checkpointNumber}` })), { ...finishPoint, label: 'FinishPoint' }], import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? '', controller.signal)
      if (!controller.signal.aborted) setRoute(result)
    } catch (cause) {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Walking directions failed.')
    } finally { if (!controller.signal.aborted) setLoading(false) }
  }
  return <section aria-label="Hunt geography preview" className="mt-4 min-w-0 space-y-4 rounded-xl border border-slate-200 p-3 sm:p-4">
    <h4 className="text-lg font-bold">Read-only Hunt geography</h4>
    {warning ? <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{warning}</p> : <>
      <ol aria-label="Ordered Hunt journey" className="flex flex-wrap gap-2 text-sm font-bold">{[...checkpoints.map(point => `CP${point.checkpointNumber}`), 'FinishPoint'].map((label, index) => <li key={label}>{index > 0 && <span aria-hidden="true">→ </span>}{label}</li>)}</ol>
      <p className="text-sm text-slate-600">Markers and circles show saved positions and discovery radii. Dashed connections show straight lines, not walking paths.</p>
      <div className="h-80 min-w-0 overflow-hidden rounded-xl sm:h-96"><TedixMap initialLatitude={checkpoints[0].latitude} initialLongitude={checkpoints[0].longitude} checkpoints={checkpoints} finishPoint={finishPoint} routeOverview={overview} walkingRoute={route?.geometry} /></div>
      <ol aria-label="Geographic stop details" className="space-y-2 text-sm">{[...checkpoints.map(point => ({ ...point, label: `CP${point.checkpointNumber}` })), { ...finishPoint!, label: 'FinishPoint' }].map(point => <li key={point.label} className="min-w-0 break-words rounded-lg bg-slate-50 p-3"><strong>{point.label}: {point.name}</strong><p>Coordinates: {point.latitude}, {point.longitude}</p><p>Discovery radius: {point.radiusMeters} m{point.label === 'FinishPoint' ? ' · Terminal stop' : ''}</p></li>)}</ol>
      <button type="button" disabled={loading} onClick={() => void estimate()} className="min-h-12 rounded-xl bg-slate-950 px-4 font-bold text-white disabled:opacity-50">{loading ? 'Estimating walking route…' : 'Estimate walking route'}</button>
      {loading && <p role="status">Requesting Mapbox walking directions…</p>}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {route && <dl className="flex flex-wrap gap-5 text-sm"><div><dt>Estimated walking distance</dt><dd>{walkingDistance(route.distance)}</dd></div><div><dt>Estimated walking duration</dt><dd>{walkingDuration(route.duration)}</dd></div></dl>}
    </>}
    <p className="text-sm text-slate-600">Mapbox walking estimates are temporary. Human verification of safety and accessibility is required; neither positions, straight lines nor walking estimates establish a safe or accessible route.</p>
  </section>
}
