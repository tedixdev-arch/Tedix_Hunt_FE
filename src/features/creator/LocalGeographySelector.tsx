import { useEffect, useRef, useState } from 'react'
import { ApiError } from '../../services/api/client'
import { geographyApi, type Country, type Locality, type LocalitySnapshot } from '../../services/api/geography'

const control = 'mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm disabled:opacity-50'
function failureText(error: unknown) {
  if (error instanceof ApiError && error.status === 401) return 'Your session has expired. Please sign in again.'
  if (error instanceof ApiError && error.status === 403) return 'Your account cannot access the locality registry.'
  if (error instanceof ApiError && error.status === 404) return 'This locality is no longer available in the registry. The saved version is unchanged.'
  return 'The registry could not be loaded. Retry to check its current records. The saved version is unchanged.'
}
function facts(place: LocalitySnapshot) { return `${place.name} · ${place.administrativeContext} · ${place.countryDisplayName} (${place.countryCode}) · ${place.latitude}, ${place.longitude}` }
/** Selection intent is separate from saved metadata; only the server builds snapshots. */
export function LocalGeographySelector({ savedId, snapshot, value, onChange, disabled = false }: {
  savedId?: string | null; snapshot?: LocalitySnapshot | null; value: string | null | undefined
  onChange: (id: string | null | undefined) => void; disabled?: boolean
}) {
  const [countries, setCountries] = useState<Country[]>([]), [country, setCountry] = useState(snapshot?.countryCode ?? '')
  const [query, setQuery] = useState(''), [results, setResults] = useState<Locality[]>([])
  const [selected, setSelected] = useState<Locality | null>(null), [current, setCurrent] = useState<Locality | null>(null)
  const [loading, setLoading] = useState(false), [error, setError] = useState(''), [lookupError, setLookupError] = useState('')
  const [searched, setSearched] = useState(false), [retry, setRetry] = useState(0)
  const sequence = useRef(0)
  useEffect(() => {
    let live = true
    setError(''); setLookupError(''); setCurrent(null)
    geographyApi.countries().then(result => { if (live) setCountries(result.countries) }).catch(error => { if (live) setError(failureText(error)) })
    if (savedId) geographyApi.get(savedId).then(result => { if (live) { if (result.id !== savedId) throw new Error('Wrong registry identity'); setCurrent(result) } }).catch(error => { if (live) setLookupError(failureText(error)) })
    return () => { live = false }
  }, [savedId, retry])
  useEffect(() => { setCountry(snapshot?.countryCode ?? ''); setQuery(''); setSelected(null); setResults([]); setSearched(false); ++sequence.current }, [savedId, snapshot])
  useEffect(() => {
    const request = ++sequence.current
    setResults([]); setLoading(false); setSearched(false)
    if (!country || !query.trim() || disabled) return
    setLoading(true); setError('')
    geographyApi.search(country, query).then(result => {
      if (request !== sequence.current) return
      // Never offer wrong-country or inactive entries, even on a delayed/corrupt projection.
      setResults(result.localities.filter(place => place.countryCode === country && place.active)); setSearched(true)
    }).catch(error => { if (request === sequence.current) setError(failureText(error)) })
      .finally(() => { if (request === sequence.current) setLoading(false) })
    return () => { ++sequence.current }
  }, [country, query, disabled, retry])
  return <section aria-label="Local geography" className="mt-6 min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
    <h2 className="text-xl font-bold">Country &amp; locality</h2>
    <p className="mt-2 text-sm text-slate-600">Choose a registered city, town or village. You can save an incomplete draft. Locality selection does not certify route safety.</p>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <div className="min-w-0 break-words"><h3 className="font-bold">Saved version locality</h3><p className="mt-2 text-sm">{snapshot ? facts(snapshot) : 'No locality saved.'}</p></div>
      {savedId && <div className="min-w-0 break-words"><h3 className="font-bold">Current registry record</h3><p className="mt-2 text-sm">{lookupError || (current ? `${facts(current)} · ${current.active ? 'Active' : 'Inactive — cannot be selected again'}` : 'Loading current record…')}</p><p className="mt-2 text-sm text-slate-500">Registry corrections do not change your saved version.</p></div>}
    </div>
    {!disabled && <>
      {!countries.length && !error && <p className="mt-3 text-sm">No countries are currently available. You can save this draft without a locality.</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Country<select className={control} value={country} onChange={event => { ++sequence.current; setCountry(event.target.value); setQuery(''); setSelected(null); setResults([]); setSearched(false); onChange(null) }}><option value="">Choose country</option>{countries.map(item => <option key={item.code} value={item.code}>{item.displayName}</option>)}</select></label>
      <label className="text-sm font-bold">Search city, town or village<input className={control} disabled={!country} maxLength={100} value={query} onChange={event => setQuery(event.target.value)} /></label></div>
      {loading && <p role="status" className="mt-3">Searching registered localities…</p>}
      {searched && !loading && results.length === 0 && <p role="status" className="mt-3 text-sm">No active registered localities match. Try another name; you can keep this draft incomplete.</p>}
      <ul className="mt-3 space-y-2">{results.map(place => <li key={place.id}><button type="button" aria-pressed={value === place.id} className="min-h-12 w-full break-words rounded-xl border border-slate-300 p-3 text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700" onClick={() => { setSelected(place); onChange(place.id) }}>{facts(place)} <span className="block text-xs text-slate-500">Reference {place.id}</span></button></li>)}</ul>
      <p role="status" className="mt-3 text-sm">{value === undefined ? 'Keep the saved locality and its snapshot on the next save.' : value === null ? 'No locality selected. The next save will clear any saved locality.' : `Selected for next save: ${selected ? facts(selected) : value}. Registry facts will be captured by the server.`}</p>
      <div className="mt-3 flex flex-wrap gap-3"><button type="button" className="min-h-12 rounded-xl border px-3 text-sm font-bold" onClick={() => { setSelected(null); onChange(null) }}>Clear locality</button>{savedId && <button type="button" className="min-h-12 rounded-xl border px-3 text-sm font-bold" onClick={() => { setCountry(snapshot?.countryCode ?? ''); setSelected(null); onChange(undefined) }}>Keep saved locality</button>}{current?.active && <button type="button" className="min-h-12 rounded-xl border px-3 text-sm font-bold" onClick={() => { setCountry(current.countryCode); setSelected(current); onChange(current.id) }}>Use current registry details on next save</button>}</div>
    </>}
    {(error || lookupError) && <div className="mt-3 text-sm"><p role="alert">{error || lookupError}</p><button type="button" className="min-h-12 px-3 font-bold underline" onClick={() => setRetry(value => value + 1)}>Retry registry</button></div>}
  </section>
}
