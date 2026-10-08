import { TedixMap } from '../../components/TedixMap'
import { createFinishPointDraft, isValidFinishPoint, type FinishPoint, type FinishPointDraft } from './finishPoint'

interface Props {
  draft?: FinishPointDraft
  onChange: (point: FinishPointDraft) => void
}

export function FinishPointEditor({ draft, onChange }: Props) {
  const point = draft ?? createFinishPointDraft()
  const valid = isValidFinishPoint(point)
  const field = 'mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3'
  return <section className="mt-6 space-y-4" aria-label="FinishPoint placement">
    <h4 className="text-lg font-bold">FinishPoint location</h4>
    <label className="block text-sm font-bold">FinishPoint name<input className={field} maxLength={100} value={point.name} onChange={event => onChange({ ...point, name: event.target.value })} /></label>
    <div className="h-96"><TedixMap initialLatitude={point.latitude ?? 46.7712} initialLongitude={point.longitude ?? 23.6236} initialZoom={14}
      locationSearch finishPoint={isValidFinishPoint({ ...point, name: 'FinishPoint' }) ? point as FinishPoint : undefined} className="overflow-hidden rounded-2xl border border-slate-300"
      onMapClick={(latitude, longitude) => onChange({ ...point, latitude, longitude })} /></div>
    <p className="text-sm text-slate-600">Search moves the map only. Click the map to place or reposition the FinishPoint.</p>
    <label className="block text-sm font-bold">Discovery radius (metres)<input className={field} type="number" min={5} max={500} step={1} value={point.radiusMeters} onChange={event => onChange({ ...point, radiusMeters: Number(event.target.value) })} /></label>
    <dl className="flex gap-6 text-sm"><div><dt className="font-bold">Latitude</dt><dd>{point.latitude?.toFixed(6) ?? '—'}</dd></div><div><dt className="font-bold">Longitude</dt><dd>{point.longitude?.toFixed(6) ?? '—'}</dd></div></dl>
    {!valid && <p role="status" className="text-sm font-bold text-amber-800">Enter a name (1–100 characters), click the map for valid coordinates, and choose an integer radius from 5 to 500 metres.</p>}
  </section>
}
