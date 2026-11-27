import { useEffect, useRef, useState } from 'react'
import {
  UNSPECIFIED_REGION, UNSPECIFIED_SUBREGION, cityKey, geographyApi, loadRegionCities, registrationMessage,
  type Country, type Region, type Subregion, type GeographicCity, type Locality, type LocalitySnapshot,
} from '../../services/api/geography'
import { LocalityProposals } from './LocalityProposals'
import { levelLabels, locationLabels as L } from '../location/locationLabels'

const control = 'mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal disabled:opacity-50'
const failure = 'Geography could not be loaded. Retry to check current records. Your saved locality is unchanged.'

/**
 * Country → Region → (optional) Subregion → City dropdowns for a Local Template. The Subregion dropdown appears only when
 * the region has official subdivisions and defaults to "All of <region>", which lists every city of the region.
 * Any listed city can be chosen: an explicit City choice resolves (links or creates) its Locality and binds its UUID.
 * Only a Locality switched off in the registry is refused. Places missing from the City list can be proposed below
 * (Admin-reviewed Locality proposals).
 */
export function CreatorGeographicSelector({ savedId, snapshot, value, onChange, onSelect, beforeChange, onSearchPendingChange }: {
  savedId?: string | null; snapshot?: LocalitySnapshot | null; value: string | null | undefined
  onChange: (id: string | null | undefined) => void; onSelect: (place: LocalitySnapshot | null, geography?: GeographicCity) => void
  /** True while a chosen city is being checked; Save stays blocked until the choice settles. */
  onSearchPendingChange?: (pending: boolean) => void
  beforeChange: (id: string | null | undefined) => boolean
}) {
  const [loadingCountries, setLoadingCountries] = useState(true)
  const [current, setCurrent] = useState<Locality | null>(null)
  const [countries, setCountries] = useState<Country[]>([]), [country, setCountry] = useState(snapshot?.countryCode ?? '')
  const [regions, setRegions] = useState<Region[]>([]), [region, setRegion] = useState('')
  const [cities, setCities] = useState<GeographicCity[]>([])
  const [regionLabel, setRegionLabel] = useState(''), [subregions, setSubregions] = useState<Subregion[]>([]), [subregionLabel, setSubregionLabel] = useState('')
  /** '' = All of the region. */
  const [subregion, setSubregion] = useState('')
  const [selectedKey, setSelectedKey] = useState(''), [error, setError] = useState(''), [notice, setNotice] = useState('')
  const [loadingRegions, setLoadingRegions] = useState(false), [loadingCities, setLoadingCities] = useState(false), [busy, setBusy] = useState(false)
  const [incomplete, setIncomplete] = useState(false), [citiesLoaded, setCitiesLoaded] = useState(false), [retry, setRetry] = useState(0)
  const intent = useRef(0), edited = useRef(false)
  /** City entry to show as selected once its region's cities load (saved Locality or approved proposal). */
  const restoreTarget = useRef<{ key: string; localityId: string } | null>(null)
  const selected = cities.find(city => cityKey(city) === selectedKey) ?? null
  const regionChoice = regions.find(item => item.admin1Code === region)
  const officialRegions = regions.some(item => item.admin1Code !== UNSPECIFIED_REGION && (item.labelStatus ?? 'resolved') === 'resolved')
  const pending = (state: boolean) => onSearchPendingChange?.(state)
  const labels = levelLabels(country ? regionLabel : '', subregionLabel)

  useEffect(() => { edited.current = false }, [savedId, snapshot])
  useEffect(() => {
    let live = true
    setLoadingCountries(true)
    geographyApi.countries().then(r => { if (live) setCountries(r.countries) }).catch(() => { if (live) setError(failure) }).finally(() => { if (live) setLoadingCountries(false) })
    return () => { live = false }
  }, [retry])
  // Saved draft: the canonical Locality UUID (never a name) locates its country, region and city entry.
  useEffect(() => {
    if (edited.current) return
    let live = true
    const version = ++intent.current
    pending(false)
    restoreTarget.current = null
    setCurrent(null); setCountry(snapshot?.countryCode ?? ''); setRegion(''); setSubregion(''); setSelectedKey('')
    setNotice(savedId ? 'Saved locality region unresolved. The saved locality and snapshot are kept.' : '')
    if (savedId) void (async () => {
      const locality = await geographyApi.get(savedId)
      if (locality.id !== savedId) throw new Error('Wrong locality')
      if (!live || version !== intent.current) return
      setCurrent(locality); setCountry(locality.countryCode)
      if (locality.admin1Code) {
        restoreTarget.current = { key: locality.geographicId ?? `registry:${locality.id}`, localityId: locality.id }
        setRegion(locality.admin1Code)
        // Restore the saved city's subdivision when it has an official one; otherwise the whole region.
        setSubregion(locality.admin1Code !== UNSPECIFIED_REGION && locality.admin2Code && locality.admin2Code !== UNSPECIFIED_SUBREGION ? locality.admin2Code : '')
      }
    })().catch(() => { if (live && version === intent.current) setError(failure) })
    return () => { live = false; ++intent.current }
  }, [savedId, snapshot, retry])
  useEffect(() => {
    let live = true
    setRegions([]); setIncomplete(false); setLoadingRegions(!!country); setRegionLabel('')
    if (!country) return
    void (async () => {
      let after: string | undefined
      const all: Region[] = []
      do {
        const page = await geographyApi.regions(country, after)
        if (!live) return
        all.push(...page.regions.filter(r => r.countryCode === country && r.admin1Code && r.admin1Code !== '00' && r.displayName))
        setIncomplete(v => v || page.metadataStatus === 'incomplete')
        if (page.regionLabel) setRegionLabel(page.regionLabel)
        after = page.nextAfter ?? undefined
      } while (after)
      // Official regions first (alphabetical); the "not specified" group last.
      if (live) setRegions(all.sort((a, b) => Number(a.admin1Code === UNSPECIFIED_REGION) - Number(b.admin1Code === UNSPECIFIED_REGION)
        || a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' })))
    })().catch(() => { if (live) setError(failure) }).finally(() => { if (live) setLoadingRegions(false) })
    return () => { live = false }
  }, [country, retry])
  useEffect(() => {
    let live = true
    setSubregions([]); setSubregionLabel('')
    if (!country || !region || region === UNSPECIFIED_REGION) return
    // Optional level: a failure only hides it, the whole region stays selectable.
    Promise.resolve().then(() => geographyApi.subregions(country, region)).then(list => {
      if (!live) return
      setSubregionLabel(list.subregionLabel)
      setSubregions(list.subregions.filter(item => item.countryCode === country && item.admin1Code === region && item.admin2Code && item.displayName))
    }).catch(() => {})
    return () => { live = false }
  }, [country, region, retry])
  useEffect(() => {
    let live = true
    setCities([]); setCitiesLoaded(false); setLoadingCities(false)
    if (!country || !region) return
    setLoadingCities(true); setError('')
    loadRegionCities(geographyApi, country, region, () => live, subregion || undefined).then(list => {
      if (!live) return
      setCities(list); setCitiesLoaded(true)
      const target = restoreTarget.current
      const restore = target && list.find(city => cityKey(city) === target.key && city.localityId === target.localityId)
      if (restore) { setSelectedKey(cityKey(restore)); setNotice('') }
      restoreTarget.current = null
    }).catch(() => { if (live) setError(failure) }).finally(() => { if (live) setLoadingCities(false) })
    return () => { live = false }
  }, [country, region, subregion, retry])

  /** Country/region change or Clear: drops the binding (guarded) and any pending choice. */
  function reset(apply: () => void) {
    if (!beforeChange(null)) return
    edited.current = true; ++intent.current; restoreTarget.current = null
    setBusy(false); setError(''); setNotice(''); setSelectedKey('')
    pending(false)
    apply(); onChange(null); onSelect(null)
  }
  async function choose(city: GeographicCity) {
    edited.current = true
    const version = ++intent.current
    setBusy(true); setError(''); setSelectedKey(cityKey(city)); pending(true)
    try {
      // A manual Locality is already a registry entry; a GeoNames city must resolve to one.
      const resolved = city.source === 'registry' ? city : await geographyApi.resolveCity(city.geographicId!)
      if (version !== intent.current) return
      if (city.source !== 'registry' && resolved.geographicId !== city.geographicId) throw new Error('Wrong city')
      if (!resolved.localityId || !resolved.registeredActive || resolved.nextAction !== 'bind_locality') {
        if (!beforeChange(null)) { setSelectedKey(''); return }
        onChange(null); onSelect(null)
        setNotice(registrationMessage(resolved) || failure); return
      }
      const locality = await geographyApi.get(resolved.localityId)
      if (version !== intent.current) return
      if (locality.id !== resolved.localityId || locality.countryCode !== country || !locality.active) throw new Error('Unavailable locality')
      if (!beforeChange(locality.id)) { setSelectedKey(''); return }
      setNotice(''); onChange(locality.id); onSelect(locality, { ...city, ...resolved })
    } catch { if (version === intent.current) { setSelectedKey(''); setError(failure) } }
    finally { if (version === intent.current) { setBusy(false); pending(false) } }
  }
  function pick(key: string) {
    if (!key) { reset(() => {}); return }
    const city = cities.find(item => cityKey(item) === key)
    if (city) void choose(city)
  }
  useEffect(() => () => { ++intent.current }, [])

  return <section aria-label="Local geography" className="min-w-0">
    <div className={`mt-4 grid grid-cols-1 gap-4 ${subregions.length ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'}`}>
      <label className="text-sm font-bold">{L.country} *<select aria-label="Country *" disabled={loadingCountries} className={control} value={country} onChange={e => reset(() => { setCountry(e.target.value); setRegion(''); setSubregion('') })}><option value="">{loadingCountries ? 'Loading countries…' : L.chooseCountry}</option>{country && !countries.some(c => c.code === country) && <option value={country}>{snapshot?.countryCode === country ? snapshot.countryDisplayName : country}</option>}{countries.map(c => <option key={c.code} value={c.code}>{c.displayName}</option>)}</select></label>
      <label className="text-sm font-bold">{labels.region} *<select aria-label="Region *" className={control} value={region} disabled={!country || loadingRegions} onChange={e => reset(() => { setRegion(e.target.value); setSubregion('') })}><option value="">{loadingRegions ? 'Loading…' : labels.chooseRegion}</option>{regions.map(r => <option key={r.admin1Code} value={r.admin1Code}>{r.displayName}</option>)}</select></label>
      {subregions.length > 0 && <label className="text-sm font-bold">{labels.subregion}<select aria-label="Subregion" className={control} value={subregion} disabled={loadingCities || busy} onChange={e => reset(() => setSubregion(e.target.value))}><option value="">{labels.allOf(regionChoice?.displayName ?? region)}</option>{subregions.map(item => <option key={item.admin2Code} value={item.admin2Code}>{item.displayName}</option>)}</select></label>}
      <label className="text-sm font-bold">{L.city} *<select aria-label="City *" className={control} value={selectedKey} disabled={!region || loadingRegions || loadingCities || busy} onChange={e => pick(e.target.value)}><option value="">{loadingCities ? 'Loading cities…' : L.chooseCity}</option>{cities.map(city => <option key={cityKey(city)} value={cityKey(city)}>{city.name}</option>)}</select></label>
    </div>
    {country && !loadingRegions && !regions.length && <p role="status" className="mt-3 text-sm">No regions available for this country.</p>}
    {incomplete && <p role="status" className="mt-3 text-sm">Some regions have no official name yet and are shown by code.</p>}
    {citiesLoaded && !loadingCities && !cities.length && <p role="status" className="mt-3 text-sm">{`No cities are listed in this ${subregion ? labels.subregion.toLowerCase() : labels.region.toLowerCase()}.`}</p>}
    {busy && <p role="status">Checking selected city…</p>}
    <p role="status" className={`mt-3 text-sm ${notice && selected && selected.registrationState !== 'registered' ? 'rounded-xl bg-amber-50 p-3 text-amber-950' : ''}`}>{notice || (selected ? `Selected city: ${selected.name}` : `Choose a country, ${labels.region.toLowerCase()} and city.`)}</p>
    <div className="mt-3 flex flex-wrap gap-3 text-sm">
      <button type="button" className="min-h-12 rounded-xl border px-3 font-bold" onClick={() => reset(() => {})}>Clear locality</button>
      {savedId && <button type="button" className="min-h-12 rounded-xl border px-3 font-bold" onClick={() => { if (!beforeChange(undefined)) return; pending(false); edited.current = false; onChange(undefined); onSelect(snapshot ?? null); setRetry(v => v + 1) }}>Keep saved locality</button>}
      {current?.active && <button type="button" className="min-h-12 rounded-xl border px-3 font-bold" onClick={() => { if (!beforeChange(current.id)) return; pending(false); edited.current = true; ++intent.current; onChange(current.id); onSelect(current) }}>Use current registry details on next save</button>}
    </div>
    {!snapshot && <p className="mt-3 text-sm">No locality saved.</p>}
    {value === null && <p role="status" className="mt-3 text-sm">No locality selected. The next save will clear any saved locality.</p>}
    {snapshot && <p className="mt-3 text-sm">Saved locality: {snapshot.name} · {snapshot.administrativeContext}. {value === undefined ? 'The saved locality and snapshot are kept.' : ''}</p>}
    {error && <div className="mt-3 text-sm"><p role="alert">{error}</p><button type="button" className="min-h-12 font-bold underline" onClick={() => { setError(''); setRetry(v => v + 1) }}>Retry geography</button></div>}
    <p className="mt-3 text-xs text-slate-500">Data: <a href="https://www.geonames.org/" className="underline">GeoNames</a> (<a href="https://creativecommons.org/licenses/by/4.0/" className="underline">CC BY 4.0</a>), normalized and filtered.</p>
    <LocalityProposals country={country} countries={countries}
      region={regionChoice && regionChoice.admin1Code !== UNSPECIFIED_REGION && regionChoice.labelStatus !== 'missing_label' ? { admin1Code: regionChoice.admin1Code, displayName: regionChoice.displayName } : null}
      regionRequired={officialRegions} regionLabel={labels.region}
      subregion={subregion && subregion !== UNSPECIFIED_SUBREGION ? { label: labels.subregion, displayName: subregions.find(item => item.admin2Code === subregion)?.displayName ?? subregion } : null}
      onRegistryPlace={place => {
        if (!beforeChange(place.id)) return
        pending(false); edited.current = true; ++intent.current
        // An approved proposal is listed under its region; select it there when the region is known.
        restoreTarget.current = place.admin1Code ? { key: place.geographicId ?? `registry:${place.id}`, localityId: place.id } : null
        const sameList = place.countryCode === country && (place.admin1Code ?? '') === region && !subregion
        setCountry(place.countryCode); setRegion(place.admin1Code ?? ''); setSubregion(''); setSelectedKey('')
        if (sameList) setRetry(v => v + 1)
        setNotice(place.admin1Code ? '' : 'Approved locality selected; its region is not specified.')
        onChange(place.id); onSelect(place)
      }} />
  </section>
}
