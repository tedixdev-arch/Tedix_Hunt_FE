import { useEffect, useRef, useState } from 'react'
import { geographyApi, type Country, type Region, type GeographicCity, type Locality, type LocalitySnapshot } from '../../services/api/geography'
import { LocalityProposals } from './LocalityProposals'

const control = 'mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal disabled:opacity-50'
const failure = 'Geography could not be loaded. Retry to check current records. Your saved locality is unchanged.'
const label_ = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\s-]+/g, '').toLowerCase()
export interface GeographicPreset { countryCode: string; region: string; city: string }
export function CreatorGeographicSelector({ savedId, snapshot, value, onChange, onSelect, beforeChange, onSearchPendingChange, preset }: {
  savedId?: string | null; snapshot?: LocalitySnapshot | null; value: string | null | undefined
  onChange: (id: string | null | undefined) => void; onSelect: (place: LocalitySnapshot | null, geography?: GeographicCity) => void
  onSearchPendingChange?: (pending: boolean) => void
  beforeChange: (id: string | null | undefined) => boolean
  /** Fills Country, Region and City for a new draft through the normal selection path; any edit cancels it. */
  preset?: GeographicPreset
}) {
  const [loadingCountries, setLoadingCountries] = useState(true)
  const [current, setCurrent] = useState<Locality | null>(null)
  const [countries, setCountries] = useState<Country[]>([]), [country, setCountry] = useState(snapshot?.countryCode ?? '')
  const [regions, setRegions] = useState<Region[]>([]), [region, setRegion] = useState(''), [label, setLabel] = useState('County/State/Region')
  const [query, setQuery] = useState(''), [cities, setCities] = useState<GeographicCity[]>([]), [next, setNext] = useState<string | null>(null)
  const [selected, setSelected] = useState<GeographicCity | null>(null), [error, setError] = useState(''), [notice, setNotice] = useState('')
  const [loadingRegions, setLoadingRegions] = useState(false), [loadingCities, setLoadingCities] = useState(false), [busy, setBusy] = useState(false)
  const [incomplete, setIncomplete] = useState(false), [searched, setSearched] = useState(false), [retry, setRetry] = useState(0)
  const searchPending = useRef(false)
  const intent = useRef(0), search = useRef(0), edited = useRef(false)
  const presetActive = useRef(!!preset && !savedId && !value)
  useEffect(() => { edited.current = false }, [savedId, snapshot])
  useEffect(() => {
    if (presetActive.current && !country && countries.some(c => c.code === preset!.countryCode)) setCountry(preset!.countryCode)
  }, [countries])
  useEffect(() => {
    // Wait for the finished region list; the loader clears it to [] before each request.
    if (!presetActive.current || region || country !== preset!.countryCode || loadingRegions) return
    const match = regions.find(r => label_(r.displayName) === label_(preset!.region))
    if (match) { setRegion(match.admin1Code); setQuery(preset!.city) } else presetActive.current = false
  }, [regions, loadingRegions])
  useEffect(() => {
    if (!presetActive.current || !searched || selected) return
    presetActive.current = false
    const match = cities.find(c => label_(c.name) === label_(preset!.city))
    if (match) void choose(match)
  }, [cities, searched])
  useEffect(() => {
    let live = true
    setLoadingCountries(true)
    geographyApi.countries().then(r => { if (live) setCountries(r.countries) }).catch(() => { if (live) setError(failure) }).finally(() => { if (live) setLoadingCountries(false) })
    return () => { live = false }
  }, [retry])
  useEffect(() => {
    if (edited.current) return
    let live = true
    const version = ++intent.current
    searchPending.current = false; onSearchPendingChange?.(false)
    setCurrent(null); setCountry(snapshot?.countryCode ?? ''); setRegion(''); setQuery(''); setSelected(null)
    setNotice(savedId ? 'Saved locality region unresolved. The saved locality and snapshot are kept.' : '')
    if (savedId) void (async () => {
      // Search supplies candidates only. The canonical UUID, never the name, proves identity.
      const locality = await geographyApi.get(savedId)
      if (locality.id !== savedId) throw new Error('Wrong locality')
      if (!live || version !== intent.current) return
      setCurrent(locality); setCountry(locality.countryCode)
      let after: string | undefined
      do {
        const page = await geographyApi.cities(locality.countryCode, locality.name, undefined, after)
        if (!live || version !== intent.current) return
        const city = page.cities.find(c => c.localityId === savedId && c.countryCode === locality.countryCode)
        if (city) {
          setCountry(city.countryCode); setSelected(city); setQuery(city.name)
          if (city.regionStatus === 'resolved' && city.admin1Code && city.admin1Code !== '00' && city.regionDisplayName) {
            setRegion(city.admin1Code); setNotice('')
          }
          return
        }
        after = page.nextAfter ?? undefined
      } while (after)
    })().catch(() => { if (live && version === intent.current) setError(failure) })
    return () => { live = false; ++intent.current }
  }, [savedId, snapshot, retry])
  useEffect(() => {
    let live = true
    setRegions([]); setIncomplete(false); setLoadingRegions(!!country)
    if (!country) return
    void (async () => {
      let after: string | undefined
      const all: Region[] = []
      do {
        const page = await geographyApi.regions(country, after)
        if (!live) return
        all.push(...page.regions.filter(r => r.countryCode === country && r.admin1Code && r.admin1Code !== '00' && r.displayName))
        setLabel(country === 'RO' ? 'County' : page.regionLabel); setIncomplete(v => v || page.metadataStatus === 'incomplete')
        after = page.nextAfter ?? undefined
      } while (after)
      if (live) setRegions(all)
    })().catch(() => { if (live) setError(failure) }).finally(() => { if (live) setLoadingRegions(false) })
    return () => { live = false }
  }, [country, retry])
  useEffect(() => {
    const version = ++search.current
    setCities([]); setNext(null); setSearched(false); setLoadingCities(false)
    if (!country || !region || query.trim().length < 2) return
    setLoadingCities(true)
    const timer = setTimeout(() => { void loadCities(version) }, 250)
    return () => { clearTimeout(timer); ++search.current }
    // loadCities captures this exact country/region/query generation.
  }, [country, region, query, retry])
  async function loadCities(version: number, after?: string) {
    setLoadingCities(true); setError('')
    try {
      const page = await geographyApi.cities(country, query, region, after)
      if (version !== search.current) return
      const valid = page.cities.filter(c => c.countryCode === country && c.admin1Code === region && c.regionStatus === 'resolved')
      setCities(old => [...new Map([...(after ? old : []), ...valid].map(c => [c.geographicId, c])).values()]); setNext(page.nextAfter); setSearched(true)
    } catch { if (version === search.current) setError(failure) }
    finally { if (version === search.current) setLoadingCities(false) }
  }
  function reset(apply: () => void) {
    presetActive.current = false
    if (!beforeChange(null)) return
    edited.current = true; ++intent.current; ++search.current; setBusy(false); setError(''); setNotice(''); setSelected(null); setQuery(''); setCities([]); setNext(null)
    searchPending.current = false; onSearchPendingChange?.(false)
    apply(); onChange(null); onSelect(null)
  }
  function editSearch(text: string) {
    presetActive.current = false
    // Search intent is transient: never turn typing into a persisted clear or reuse a prior binding.
    const hasBinding = selected || value || (value === undefined && savedId)
    if (!searchPending.current && hasBinding && !beforeChange(null)) {
      setQuery(selected?.name ?? query)
      return
    }
    edited.current = true; ++intent.current; ++search.current
    searchPending.current = true; onSearchPendingChange?.(true)
    setSelected(null); setNotice(''); setBusy(false); setCities([]); setNext(null); setQuery(text)
  }
  async function choose(city: GeographicCity) {
    edited.current = true
    const version = ++intent.current
    setBusy(true); setError('')
    try {
      const resolved = await geographyApi.resolveCity(city.geographicId)
      if (version !== intent.current) return
      if (resolved.geographicId !== city.geographicId) throw new Error('Wrong city')
      if (!resolved.localityId || !resolved.registeredActive || resolved.nextAction !== 'bind_locality') {
        if (!beforeChange(null)) return
        setSelected(city); setQuery(city.name); searchPending.current = false; onSearchPendingChange?.(false); onChange(null); onSelect(null)
        setNotice('This city requires Admin registration or reconciliation before it can be used. No locality has been registered.'); return
      }
      const locality = await geographyApi.get(resolved.localityId)
      if (version !== intent.current) return
      if (locality.id !== resolved.localityId || locality.countryCode !== country || !locality.active) throw new Error('Unavailable locality')
      if (!beforeChange(locality.id)) return
      setSelected(city); setQuery(city.name); searchPending.current = false; onSearchPendingChange?.(false); setNotice(''); onChange(locality.id); onSelect(locality, { ...city, ...resolved })
    } catch { if (version === intent.current) setError(failure) }
    finally { if (version === intent.current) setBusy(false) }
  }
  useEffect(() => () => { ++intent.current; ++search.current }, [])
  return <section aria-label="Local geography" className="min-w-0">
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <label className="text-sm font-bold">Country *<select aria-label="Country *" disabled={loadingCountries} className={control} value={country} onChange={e => reset(() => { setCountry(e.target.value); setRegion('') })}><option value="">{loadingCountries ? 'Loading countries…' : 'Choose country'}</option>{country && !countries.some(c => c.code === country) && <option value={country}>{snapshot?.countryCode === country ? snapshot.countryDisplayName : country}</option>}{countries.map(c => <option key={c.code} value={c.code}>{c.displayName}</option>)}</select></label>
      <label className="text-sm font-bold">{country === 'RO' ? 'County' : label} *<select aria-label="Region *" className={control} value={region} disabled={!country || loadingRegions} onChange={e => reset(() => setRegion(e.target.value))}><option value="">{loadingRegions ? 'Loading…' : 'Choose region'}</option>{regions.map(r => <option key={r.admin1Code} value={r.admin1Code}>{r.displayName}</option>)}</select></label>
      <label className="text-sm font-bold">City *<input aria-label="City *" className={control} disabled={!region || loadingRegions} maxLength={100} value={query} onChange={e => editSearch(e.target.value)} /></label>
    </div>
    {country && !loadingRegions && !regions.length && <p role="status" className="mt-3 text-sm">No regions available for this country.</p>}
    {incomplete && <p role="status" className="mt-3 text-sm">Region metadata is incomplete. Some cities are unavailable; contact Admin.</p>}
    {loadingCities && <p role="status" className="mt-3 text-sm">Searching cities…</p>}
    {searched && !loadingCities && !cities.length && <p role="status" className="mt-3 text-sm">No cities match in this region.</p>}
    <ul className="mt-3 space-y-2">{cities.map(city => <li key={city.geographicId}><button type="button" disabled={busy} aria-pressed={selected?.geographicId === city.geographicId} className="min-h-12 w-full rounded-xl border border-slate-300 p-3 text-left text-sm" onClick={() => void choose(city)}>{city.name} · {city.regionDisplayName} · {city.countryDisplayName}</button></li>)}</ul>
    {next && <button type="button" disabled={loadingCities} className="min-h-12 text-sm underline" onClick={() => void loadCities(search.current, next)}>More cities</button>}
    {selected && region && !loadingRegions && !regions.some(r => r.admin1Code === region) && <p role="status" className="mt-3 text-sm">The saved city region is unavailable in the region catalog. The saved locality is unchanged.</p>}
    {busy && <p role="status">Checking selected city…</p>}
    <p role="status" className="mt-3 text-sm">{notice || (selected ? `Selected city: ${selected.name}` : 'Choose a country and region, then search for your city.')}</p>
    <div className="mt-3 flex flex-wrap gap-3 text-sm">
      <button type="button" className="min-h-12 rounded-xl border px-3 font-bold" onClick={() => reset(() => {})}>Clear locality</button>
      {savedId && <button type="button" className="min-h-12 rounded-xl border px-3 font-bold" onClick={() => { if (!beforeChange(undefined)) return; searchPending.current = false; onSearchPendingChange?.(false); edited.current = false; onChange(undefined); onSelect(snapshot ?? null); setRetry(v => v + 1) }}>Keep saved locality</button>}
      {current?.active && <button type="button" className="min-h-12 rounded-xl border px-3 font-bold" onClick={() => { if (!beforeChange(current.id)) return; searchPending.current = false; onSearchPendingChange?.(false); setQuery(selected?.name ?? current.name); edited.current = true; ++intent.current; ++search.current; onChange(current.id); onSelect(current) }}>Use current registry details on next save</button>}
    </div>
    {!snapshot && <p className="mt-3 text-sm">No locality saved.</p>}
    {value === null && <p role="status" className="mt-3 text-sm">No locality selected. The next save will clear any saved locality.</p>}
    {snapshot && <p className="mt-3 text-sm">Saved locality: {snapshot.name} · {snapshot.administrativeContext}. {value === undefined ? 'The saved locality and snapshot are kept.' : ''}</p>}
    {error && <div className="mt-3 text-sm"><p role="alert">{error}</p><button type="button" className="min-h-12 font-bold underline" onClick={() => { setError(''); setRetry(v => v + 1) }}>Retry geography</button></div>}
    <p className="mt-3 text-xs text-slate-500">Data: <a href="https://www.geonames.org/" className="underline">GeoNames</a> (<a href="https://creativecommons.org/licenses/by/4.0/" className="underline">CC BY 4.0</a>), normalized and filtered.</p>
    <LocalityProposals country={country} countries={countries} onRegistryPlace={place => { if (!beforeChange(place.id)) return; searchPending.current = false; onSearchPendingChange?.(false); edited.current = true; ++intent.current; ++search.current; setCountry(place.countryCode); setRegion(''); setQuery(''); setSelected(null); setNotice('Approved locality selected; its catalog region is unresolved.'); onChange(place.id); onSelect(place) }} />
  </section>
}
