import { useEffect, useState } from 'react'
import { organizerLocalApi, type City, type Country, type Region, type Subregion } from '../../services/api/organizerLocal'
import { levelLabels } from '../location/locationLabels'

async function all<T>(kind: 'countries' | 'regions' | 'subregions' | 'cities', filters: Record<string, string>): Promise<T[]> {
  const items: T[] = []
  let cursor: string | undefined
  // Bounded: catalog pages are 20 items; stop after 50 pages rather than loop on a misbehaving cursor.
  for (let page = 0; page < 50; page++) {
    const result = await organizerLocalApi.page<T>(kind, filters, cursor)
    items.push(...result.items)
    if (!result.nextCursor) break
    cursor = result.nextCursor
  }
  return items
}

/** Country → Region → optional Subregion → City names from the Organizer geography catalog, chained by the chosen
 * names. The Subregion only narrows the City list (the saved Hunt keeps Country, Region and City).
 * Returns null lists while unavailable so callers can keep their existing fallback options. */
export function useCatalogLocationOptions(country: string, region: string, enabled: boolean, subregion = '') {
  const [countries, setCountries] = useState<Country[] | null>(null)
  const [regions, setRegions] = useState<Region[] | null>(null)
  const [subregions, setSubregions] = useState<Subregion[]>([])
  const [cities, setCities] = useState<City[] | null>(null)
  const countryCode = countries?.find(item => item.displayName === country)?.countryCode
  const regionId = regions?.find(item => item.label === region)?.regionId
  const subregionId = subregions.find(item => item.label === subregion)?.subregionId
  useEffect(() => {
    if (!enabled) return
    let live = true
    all<Country>('countries', {}).then(items => { if (live) setCountries(items) }).catch(() => { if (live) setCountries(null) })
    return () => { live = false }
  }, [enabled])
  useEffect(() => {
    setRegions(null)
    if (!enabled || !countryCode) return
    let live = true
    all<Region>('regions', { countryCode }).then(items => { if (live) setRegions(items) }).catch(() => {})
    return () => { live = false }
  }, [enabled, countryCode])
  useEffect(() => {
    setSubregions([])
    // Only a concrete region has official subdivisions; a failure only hides the optional level.
    if (!enabled || !countryCode || !regionId?.includes(':admin1:')) return
    let live = true
    all<Subregion>('subregions', { countryCode, regionId })
      .then(items => { if (live) setSubregions(items.filter(item => item.subregionId?.startsWith(`${regionId}:`) && item.label)) })
      .catch(() => {})
    return () => { live = false }
  }, [enabled, countryCode, regionId])
  useEffect(() => {
    setCities(null)
    if (!enabled || !countryCode || !regionId) return
    let live = true
    all<City>('cities', { countryCode, regionId, ...(subregionId ? { subregionId } : {}) }).then(items => { if (live) setCities(items) }).catch(() => {})
    return () => { live = false }
  }, [enabled, countryCode, regionId, subregionId])
  const sorted = (names: string[]) => [...new Set(names)].sort((a, b) => a.localeCompare(b))
  const labels = levelLabels(countryCode ? regions?.[0]?.levelLabel : '', subregions[0]?.levelLabel)
  return {
    countries: countries?.length ? sorted(countries.map(item => item.displayName)) : null,
    regions: countryCode ? sorted(regions?.map(item => item.label) ?? []) : null,
    // Official subdivisions alphabetically, the "not specified" group last; empty when the region has none.
    subregions: regionId ? [...sorted(subregions.filter(item => item.labelStatus !== 'unspecified').map(item => item.label)), ...subregions.filter(item => item.labelStatus === 'unspecified').map(item => item.label)] : [],
    cities: regionId ? sorted(cities?.map(item => item.name) ?? []) : null,
    regionLabel: labels.region,
    subregionLabel: labels.subregion,
  }
}
