import { useEffect, useState } from 'react'
import { UNSPECIFIED_REGION, geographyApi, loadRegionCities, type Country, type Region, type Subregion, type GeographicCity } from '../../../services/api/geography'
import { levelLabels, locationLabels as L } from '../../location/locationLabels'
import { control } from '../exercises/ExerciseRenderer'
export interface ContentScope { country: string; region: string; city: string }
export const universalScope: ContentScope = { country: '', region: '', city: '' }
/**
 * Applicability only: Universal by default; a specific Country enables its Region (country-specific label) and City dropdowns.
 * Reads existing catalog endpoints and never registers or binds a locality. The optional Subregion dropdown only narrows
 * the City list; it is not part of the saved scope (content without a city applies to the whole region).
 */
export function ContentGeography({ value, onChange, onCityResolved }: { value: ContentScope; onChange: (v: ContentScope) => void; onCityResolved?: (city: GeographicCity | null) => void }) {
  const [countries, setCountries] = useState<Country[]>([]), [regions, setRegions] = useState<Region[]>([]), [cities, setCities] = useState<GeographicCity[]>([])
  const [selectedCity, setSelectedCity] = useState<GeographicCity | null>(null)
  const [loadingRegions, setLoadingRegions] = useState(false), [loadingCities, setLoadingCities] = useState(false)
  const [error, setError] = useState(''), [retry, setRetry] = useState(0)
  const [regionLabel, setRegionLabel] = useState(''), [subregions, setSubregions] = useState<Subregion[]>([]), [subregionLabel, setSubregionLabel] = useState('')
  /** '' = All of the region. */
  const [subregion, setSubregion] = useState('')
  const labels = levelLabels(value.country ? regionLabel : '', subregionLabel)
  const universal = !value.country
  useEffect(() => {
    let live = true
    setSelectedCity(null); onCityResolved?.(null)
    if (value.city) geographyApi.city(value.city).then(city => {
      if (!live) return
      if (city.geographicId !== value.city || city.countryCode !== value.country) throw new Error('City catalog mismatch')
      setSelectedCity(city); onCityResolved?.(city)
    }).catch(() => { if (live) setError('Saved city details unavailable. The saved location is retained.') })
    return () => { live = false }
  }, [value.city, value.country, retry, onCityResolved])
  useEffect(() => { let live = true; geographyApi.countries().then(r => { if (live) setCountries(r.countries) }).catch(() => { if (live) setError('Geography unavailable. Universal remains available.') }); return () => { live = false } }, [retry])
  useEffect(() => {
    let live = true
    setRegions([]); setError(''); setLoadingRegions(!!value.country); setRegionLabel('')
    if (!value.country) return
    void (async () => {
      let after: string | undefined
      const all: Region[] = []
      do {
        const page = await geographyApi.regions(value.country, after)
        if (live && page.regionLabel) setRegionLabel(page.regionLabel)
        all.push(...page.regions.filter(r => r.countryCode === value.country && r.admin1Code && r.admin1Code !== '00' && r.admin1Code !== UNSPECIFIED_REGION && (r.labelStatus ?? 'resolved') === 'resolved'))
        after = page.nextAfter ?? undefined
      } while (after && live)
      if (live) setRegions(all.sort((a, b) => a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' })))
    })().catch(() => { if (live) setError('Regions unavailable. Retry to load current records.') }).finally(() => { if (live) setLoadingRegions(false) })
    return () => { live = false }
  }, [value.country, retry])
  useEffect(() => {
    let live = true
    setSubregions([]); setSubregionLabel(''); setSubregion('')
    if (!value.country || !value.region) return
    Promise.resolve().then(() => geographyApi.subregions(value.country, value.region)).then(list => {
      if (!live) return
      setSubregionLabel(list.subregionLabel)
      setSubregions(list.subregions.filter(item => item.countryCode === value.country && item.admin1Code === value.region && item.admin2Code && item.displayName))
    }).catch(() => {})
    return () => { live = false }
  }, [value.country, value.region, retry])
  useEffect(() => {
    let live = true
    setCities([]); setLoadingCities(false)
    if (!value.country || !value.region) return
    setLoadingCities(true)
    // Content scope matches catalog (GeoNames) cities, so manual Localities are not offered here.
    loadRegionCities(geographyApi, value.country, value.region, () => live, subregion || undefined)
      .then(list => { if (live) setCities(list.filter(c => c.geographicId && c.admin1Code === value.region)) })
      .catch(() => { if (live) setError('Cities unavailable. Retry to load current records.') })
      .finally(() => { if (live) setLoadingCities(false) })
    return () => { live = false }
  }, [value.country, value.region, subregion, retry])
  const shown = cities.find(c => c.geographicId === value.city) ?? selectedCity
  const select = `${control} mt-2 block w-full`
  const showSubregion = !universal && !!value.region && subregions.length > 0
  return <fieldset className="mb-4 min-w-0"><legend className="text-sm font-medium">Choose Location</legend><div className={`mt-4 grid gap-4 ${showSubregion ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'}`}>
    <label className="block text-sm">{L.country}<select aria-label="Content country" className={select} value={value.country} onChange={e => onChange({ country: e.target.value, region: '', city: '' })}><option value="">{L.universal}</option>{value.country && !countries.some(c => c.code === value.country) && <option value={value.country}>Saved country</option>}{countries.map(c => <option key={c.code} value={c.code}>{c.displayName}</option>)}</select></label>
    {universal
      ? <label className="block text-sm">{L.region}<select aria-label="Content region" className={select} value="" disabled><option value="">{L.universal}</option></select></label>
      : <label className="block text-sm">{labels.region}<select aria-label="Content region" className={select} value={value.region || shown?.admin1Code || ''} disabled={loadingRegions} onChange={e => onChange({ ...value, region: e.target.value, city: '' })}><option value="">{loadingRegions ? 'Loading…' : labels.chooseRegion}</option>{value.region && !loadingRegions && !regions.some(r => r.admin1Code === value.region) && <option value={value.region}>Saved region</option>}{regions.map(r => <option key={r.admin1Code} value={r.admin1Code}>{r.displayName}</option>)}</select></label>}
    {showSubregion && <label className="block text-sm">{labels.subregion}<select aria-label="Content subregion" className={select} value={subregion} disabled={loadingCities} onChange={e => { setSubregion(e.target.value); if (value.city) onChange({ ...value, city: '' }) }}><option value="">{labels.allOf(regions.find(r => r.admin1Code === value.region)?.displayName ?? 'the region')}</option>{subregions.map(item => <option key={item.admin2Code} value={item.admin2Code}>{item.displayName}</option>)}</select></label>}
    {universal
      ? <label className="block text-sm">{L.city}<select aria-label="Content city" className={select} value="" disabled><option value="">{L.universal}</option></select></label>
      : <label className="block text-sm">{L.city}<select aria-label="Content city" className={select} value={value.city} disabled={!value.region || loadingCities} onChange={e => onChange({ ...value, city: e.target.value })}><option value="">{loadingCities ? 'Loading cities…' : L.chooseCity}</option>{value.city && !cities.some(c => c.geographicId === value.city) && <option value={value.city}>{selectedCity?.name ?? 'Saved city'}</option>}{cities.map(c => <option key={c.geographicId!} value={c.geographicId!}>{c.name}</option>)}</select></label>}
  </div>
    {!universal && value.region && !loadingCities && !cities.length && !error && <p role="status" className="mt-2 text-sm">{`No cities are listed in this ${subregion ? labels.subregion.toLowerCase() : labels.region.toLowerCase()}.`}</p>}
    <p className="mt-2 text-xs text-slate-600">{universal ? 'Universal means unrestricted coverage.' : `Leave ${labels.region} or City unchosen to apply this content to the whole country or ${labels.region.toLowerCase()}.${showSubregion ? ` ${labels.subregion} only narrows the City list.` : ''}`} This does not change the Template or Hunt locality.</p>{error && <p role="alert">{error} <button type="button" onClick={() => { setError(''); setRetry(r => r + 1) }}>Retry geography</button></p>}
  </fieldset>
}
