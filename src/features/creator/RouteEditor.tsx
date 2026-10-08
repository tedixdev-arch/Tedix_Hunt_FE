import { useState } from 'react'
import { TedixMap } from '../../components/TedixMap'
import type { CheckpointDraft, CreatorGeographyConfiguration } from './checkpointGeography'
import { buildGeographyConfiguration, isGeographyComplete, isValidCheckpoint, MAX_RADIUS_METERS, MIN_RADIUS_METERS, updateCheckpointDraft } from './checkpointGeography'

const safetyItems = ['Safe standing area', 'Accessible walking route', 'Road crossings reviewed', 'No restricted areas', 'Day and night suitability checked', 'Emergency access available']

interface Props {
  drafts: CheckpointDraft[]
  verified: Set<number>
  safety: Set<string>
  onDraftsChange: (drafts: CheckpointDraft[]) => void
  onVerifiedChange: (verified: Set<number>) => void
  onSafetyChange: (safety: Set<string>) => void
  onConfigurationChange: (configuration: CreatorGeographyConfiguration) => void
}

export function RouteEditor({ drafts, verified, safety, onDraftsChange, onVerifiedChange, onSafetyChange, onConfigurationChange }: Props) {
  const [first] = drafts
  const [activeNumber, setActiveNumber] = useState(first?.checkpointNumber ?? 1)
  const active = drafts.find(point => point.checkpointNumber === activeNumber) ?? first
  const complete = isGeographyComplete(drafts, verified, safety.size, safetyItems.length)

  function update(number: number, change: Partial<CheckpointDraft>) {
    const next = updateCheckpointDraft(drafts, verified, number, change)
    onDraftsChange(next.drafts); onVerifiedChange(next.verified)
    onConfigurationChange(buildGeographyConfiguration(drafts.length, next.drafts))
  }

  return <div className="mt-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><h4 className="text-lg font-bold">Create and verify the safe route</h4><p className="mt-1 max-w-2xl text-sm text-slate-500">Select a normal checkpoint, click the map to position it, inspect its radius, then verify it. FinishPoint remains in Feature 6.</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${complete ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>{verified.size} of {drafts.length} verified</span></div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_320px]"><div><div className="h-96"><TedixMap initialLatitude={46.7712} initialLongitude={23.6236} initialZoom={14}
      locationSearch className="overflow-hidden rounded-2xl border border-slate-300"
      checkpoints={drafts.filter(isValidCheckpoint).map(point => ({ ...point, selected: active?.checkpointNumber === point.checkpointNumber, verified: verified.has(point.checkpointNumber) }))}
      onCheckpointSelect={setActiveNumber}
      onMapClick={(latitude, longitude) => active && update(active.checkpointNumber, { latitude, longitude })}
    /></div><p className="mt-2 text-xs font-bold text-slate-500">Search moves the map only. Click the map to place the selected checkpoint: {active ? `${active.checkpointNumber} — ${active.name}` : 'none'}.</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{safetyItems.map(item => <label key={item} className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-bold"><input className="h-5 w-5 accent-emerald-500" type="checkbox" checked={safety.has(item)} onChange={() => { const next = new Set(safety); next.has(item) ? next.delete(item) : next.add(item); onSafetyChange(next) }} />{item}</label>)}</div></div>
      <div className="space-y-2">{drafts.map(point => { const positioned = typeof point.latitude === 'number' && typeof point.longitude === 'number'; const valid = isValidCheckpoint(point); return <article key={point.checkpointNumber} className={`rounded-xl border p-3 ${active?.checkpointNumber === point.checkpointNumber ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}><button data-checkpoint={point.checkpointNumber} onClick={() => setActiveNumber(point.checkpointNumber)} className="w-full text-left focus:outline-none" type="button"><span className="text-xs font-bold uppercase text-slate-500">Checkpoint {point.checkpointNumber}</span></button><label className="mt-2 block text-xs font-bold">Name<input className="mt-1 min-h-10 w-full rounded-lg border border-slate-300 px-3" value={point.name} onChange={event => update(point.checkpointNumber, { name: event.target.value })} /></label><dl className="mt-2 grid grid-cols-2 gap-2 text-xs"><div><dt className="font-bold text-slate-500">Latitude</dt><dd>{point.latitude?.toFixed(6) ?? '—'}</dd></div><div><dt className="font-bold text-slate-500">Longitude</dt><dd>{point.longitude?.toFixed(6) ?? '—'}</dd></div><div><dt className="font-bold text-slate-500">Position state</dt><dd>{positioned ? 'Positioned' : 'Not positioned'}</dd></div><div><dt className="font-bold text-slate-500">Verification</dt><dd>{verified.has(point.checkpointNumber) ? 'Verified' : 'Not verified'}</dd></div></dl><label className="mt-2 block text-xs font-bold">Detection radius (metres)<input className="mt-1 min-h-10 w-full rounded-lg border border-slate-300 px-3" type="number" min={MIN_RADIUS_METERS} max={MAX_RADIUS_METERS} value={point.radiusMeters} onChange={event => update(point.checkpointNumber, { radiusMeters: Number(event.target.value) })} /></label><button className="mt-3 min-h-10 w-full rounded-lg bg-emerald-500 text-xs font-bold disabled:bg-slate-300" disabled={!valid} type="button" onClick={() => { const next = new Set(verified); next.add(point.checkpointNumber); onVerifiedChange(next) }}>Verify point</button></article> })}</div>
    </div>{!complete && <p className="mt-4 text-sm font-bold text-amber-800">Position and verify every normal checkpoint, then complete every safety check.</p>}</div>
}
