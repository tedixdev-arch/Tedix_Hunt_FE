import { useEffect, useRef, useState } from 'react'
import { TedixMap } from '../../components/TedixMap'
import { isValidCheckpoint, type CheckpointDraft } from './checkpointGeography'
import { isValidFinishPoint } from './finishPoint'
import { calculateWalkingRoute, walkingDestinations, walkingDistance, walkingDuration, type WalkingRoute, type RouteDestination } from './walkingRoute'

/** Derived inspection only: no Template writes and no gameplay or safety transitions. */
export function WalkingRouteValidation({ configuration }: { configuration: Record<string, unknown> }) {
  let destinations: RouteDestination[] | undefined
  let geographyError = ''
  try { destinations = walkingDestinations(configuration) }
  catch (error) { geographyError = (error as Error).message }
  // Identity includes invalid geography too; name/radius/gameplay edits need no new directions request.
  const identity = JSON.stringify([configuration.normalCheckpointCount,
    Array.isArray(configuration.checkpointPositions) ? configuration.checkpointPositions.map(point => [point?.checkpointNumber, point?.latitude, point?.longitude]) : null,
    configuration.finishPoint && typeof configuration.finishPoint === 'object' ? [(configuration.finishPoint as Record<string, unknown>).latitude, (configuration.finishPoint as Record<string, unknown>).longitude] : null])
  const [state, setState] = useState<{ identity: string; loading?: boolean; route?: WalkingRoute; error?: string }>()
  const request = useRef<AbortController | null>(null)
  const latestIdentity = useRef(identity)
  latestIdentity.current = identity
  useEffect(() => {
    setState(undefined)
    return () => { request.current?.abort() }
  }, [identity])
  const current = state?.identity === identity ? state : undefined
  const route = current?.route
  const points = Array.isArray(configuration.checkpointPositions) ? (configuration.checkpointPositions as CheckpointDraft[]).filter(point => point && typeof point.name === 'string' && isValidCheckpoint(point)) : []
  const finish = isValidFinishPoint(configuration.finishPoint) ? configuration.finishPoint : undefined

  async function validate() {
    request.current?.abort()
    if (!destinations) return
    const controller = new AbortController()
    request.current = controller
    setState({ identity, loading: true })
    try {
      const result = await calculateWalkingRoute(destinations, import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? '', controller.signal)
      if (!controller.signal.aborted && latestIdentity.current === identity) setState({ identity, route: result })
    } catch (error) {
      if (!controller.signal.aborted && latestIdentity.current === identity) setState({ identity, error: (error as Error).message })
    }
  }

  return <section className="mt-6 rounded-xl border border-slate-200 p-4" aria-label="Walking route validation">
    <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-lg font-bold">Inspect the complete walking route</h3>
      <button type="button" disabled={!!geographyError || current?.loading} onClick={validate} className="min-h-12 rounded-xl bg-slate-950 px-4 font-bold text-white disabled:bg-slate-400">{current?.loading ? 'Calculating walking route…' : 'Validate walking route'}</button></div>
    <p role="status" className={`mt-3 rounded-lg p-3 text-sm font-bold ${route ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'}`}>{route ? 'Walking route validated' : current?.loading ? 'Calculating walking directions…' : current?.error ? 'Walking route validation failed' : 'Walking route not validated. Recalculate after changing checkpoint or FinishPoint coordinates.'}</p>
    {(geographyError || current?.error) && <p role="alert" className="mt-3 text-sm font-bold text-red-700">{geographyError || current?.error}</p>}
    {destinations && <ol aria-label="Ordered walking destinations" className="mt-3 flex flex-wrap gap-2 text-sm font-bold">{destinations.map((point, index) => <li key={point.label}>{index > 0 && <span aria-hidden="true">→ </span>}{point.label}</li>)}</ol>}
    {route && <dl className="mt-3 flex flex-wrap gap-6 text-sm"><div><dt className="font-bold">Total walking distance</dt><dd>{walkingDistance(route.distance)}</dd></div><div><dt className="font-bold">Estimated walking duration</dt><dd>{walkingDuration(route.duration)}</dd></div></dl>}
    <div className="mt-4 h-96"><TedixMap initialLatitude={points[0]?.latitude ?? 46.7712} initialLongitude={points[0]?.longitude ?? 23.6236} initialZoom={14} checkpoints={points} finishPoint={finish} walkingRoute={route?.geometry} className="overflow-hidden rounded-xl" /></div>
    <p className="mt-3 text-xs text-slate-600">Approximate walking estimates, not guaranteed travel times. Mapbox routing does not establish safe access. Keep the manual geographic verification and safety checks in Feature 2. Calculations are temporary and must be repeated after reopening a Template.</p>
  </section>
}
