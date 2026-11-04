import { useEffect, useState } from 'react'
import { CreatorGeographicSelector } from './CreatorGeographicSelector'
import { PrototypeLocationSelector } from '../prototype/PrototypeLocationSelector'
import { resolveCreatorClujLocation } from '../prototype/clujLocality'
import type { GeographicCity, LocalitySnapshot } from '../../services/api/geography'

export function HuntSetup({ local, savedId, snapshot, value, onChange, onSelect, beforeChange, onContinue, error, onSearchPendingChange, cityUnavailable, onRetryCity }: {
  local: boolean; savedId?: string | null; snapshot?: LocalitySnapshot | null
  value: string | null | undefined; onChange: (id: string | null | undefined) => void
  onSelect: (place: LocalitySnapshot | null, geography?: GeographicCity) => void
  beforeChange: (id: string | null | undefined) => boolean
  onSearchPendingChange?: (pending: boolean) => void
  onContinue: () => void; error: string; cityUnavailable?: boolean; onRetryCity?: () => void
}) {
  // The Cluj default is display-only. Bind its canonical, Admin-registered locality from the
  // backend so a new Local Template can be saved and submitted. A saved locality is kept as-is.
  const [chooseLocation, setChooseLocation] = useState(false)
  const needsLocality = local && !chooseLocation && !savedId && !value
  const [resolving, setResolving] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!needsLocality) { setResolving(false); setLocationError(''); return }
    let active = true
    setResolving(true); setLocationError('')
    resolveCreatorClujLocation().then(({ locality, geography }) => {
      if (!active || !beforeChange(locality.id)) return
      onChange(locality.id); onSelect(locality, geography)
    }).catch(() => { if (active) setLocationError('Cluj-Napoca could not be loaded from the location catalog. Retry, or ask an Admin to register it.') })
      .finally(() => { if (active) setResolving(false) })
    return () => { active = false }
    // Callbacks are recreated by the parent on every render; the resolution intent is keyed by need and retry only.
  }, [needsLocality, attempt])
  return <section id="local-geography" aria-labelledby="hunt-setup-heading" className="mt-7 min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 id="hunt-setup-heading" className="text-2xl font-bold">Hunt Setup</h2>
    <p className="mt-2 text-sm text-slate-600">{local ? 'Where will your adventure take place?' : 'Create an adventure that can be played anywhere.'}</p>
    {local && !savedId && !value && !chooseLocation && <PrototypeLocationSelector />}
    {local && <button type="button" className="mt-3 min-h-11 font-bold underline" onClick={() => setChooseLocation(true)}>Select registered locality</button>}
    {local && chooseLocation && <CreatorGeographicSelector savedId={savedId} snapshot={snapshot} value={value} onChange={onChange} onSelect={onSelect} beforeChange={beforeChange} onSearchPendingChange={onSearchPendingChange} />}
    {local && !chooseLocation && (snapshot || value) && <p className="mt-3 text-sm">Selected locality: {snapshot ? `${snapshot.name} · ${snapshot.administrativeContext} · ${snapshot.countryCode}` : value}</p>}
    {cityUnavailable && <div className="mt-3 text-sm"><p role="alert">The city location could not be loaded. Your selected city is kept.</p><button type="button" onClick={onRetryCity} className="min-h-11 font-bold underline">Retry city location</button></div>}
    {local && resolving && <p role="status" className="mt-3 text-sm text-slate-600">Checking location…</p>}
    {local && locationError && <div className="mt-3 text-sm"><p role="alert" className="font-bold text-red-800">{locationError}</p><button type="button" className="min-h-11 font-bold underline" onClick={() => setAttempt(v => v + 1)}>Retry location</button></div>}
    {error && <p role="alert" className="mt-3 text-sm font-bold text-red-800">{error}</p>}
    <button type="button" onClick={onContinue} className="mt-5 min-h-12 rounded-xl bg-emerald-500 px-6 font-bold">Continue to Template builder</button>
  </section>
}
