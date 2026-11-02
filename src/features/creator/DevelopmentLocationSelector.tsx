import { useEffect, useRef, useState } from 'react'
import { geographyApi, type LocalitySnapshot } from '../../services/api/geography'
import { developmentLocation as preset } from './developmentLocation'

/** Geographic defaults never supply an ID: only a real, active registry result may bind. */
export function DevelopmentLocationSelector({ savedId, snapshot, value, onChange, onSelect, beforeChange }: {
  savedId?: string | null; snapshot?: LocalitySnapshot | null; value: string | null | undefined
  onChange: (id: string | null | undefined) => void
  onSelect?: (place: LocalitySnapshot | null) => void
  beforeChange?: (id: string | null | undefined) => boolean
}) {
  const callbacks = useRef({ onChange, onSelect, beforeChange })
  callbacks.current = { onChange, onSelect, beforeChange }
  const [retry, setRetry] = useState(0), [error, setError] = useState(false)
  useEffect(() => {
    // Saved references and their server snapshots always win over development defaults.
    if (savedId || value) return
    let live = true
    setError(false)
    geographyApi.search(preset.countryCode, 'Cluj').then(({ localities }) => {
      if (!live) return
      const matches = [...new Map(localities.filter(place => place.active && place.countryCode === preset.countryCode
        && place.name.toLowerCase().replace(/[\s-]/g, '') === 'clujnapoca'
        && Number.isFinite(place.latitude) && Math.abs(place.latitude) <= 90
        && Number.isFinite(place.longitude) && Math.abs(place.longitude) <= 180).map(place => [place.id, place])).values()]
      if (matches.length !== 1) throw new Error('Development locality is missing or ambiguous')
      const place = matches[0], cb = callbacks.current
      if (cb.beforeChange && !cb.beforeChange(place.id)) return
      cb.onChange(place.id); cb.onSelect?.(place)
    }).catch(() => { if (live) setError(true) })
    return () => { live = false }
  }, [savedId, value, retry])
  const control = 'mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal'
  return <section aria-label="Local geography" className="mt-4 grid gap-4 sm:grid-cols-2">
    <label className="text-sm font-bold">Country *<select aria-label="Country *" aria-required className={control} value={snapshot?.countryCode ?? preset.countryCode} onChange={() => {}}><option value={snapshot?.countryCode ?? preset.countryCode}>{snapshot?.countryDisplayName ?? preset.country}</option></select></label>
    <label className="text-sm font-bold">City *<select aria-label="City *" aria-required className={control} value={snapshot?.name ?? preset.city} onChange={() => {}}><option>{snapshot?.name ?? preset.city}</option></select></label>
    {error && <div role="alert" className="text-sm sm:col-span-2">City setup could not be loaded.<button type="button" className="min-h-12 px-3 font-bold underline" onClick={() => setRetry(count => count + 1)}>Retry city setup</button></div>}
  </section>
}
