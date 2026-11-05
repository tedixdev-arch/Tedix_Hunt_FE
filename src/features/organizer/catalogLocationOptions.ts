import { useEffect, useState } from 'react'
import { organizerLocalApi, type City, type Country, type Region } from '../../services/api/organizerLocal'

async function all<T>(kind: 'countries' | 'regions' | 'cities', filters: Record<string, string>): Promise<T[]> {
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

/** Country, County/Region and City names from the Organizer geography catalog, chained by the chosen names.
 * Returns null lists while unavailable so callers can keep their existing fallback options. */
export function useCatalogLocationOptions(country: string, region: string, enabled: boolean) {
  const [countries, setCountries] = useState<Country[] | null>(null)
  const [regions, setRegions] = useState<Region[] | null>(null)
  const [cities, setCities] = useState<City[] | null>(null)
  const countryCode = countries?.find(item => item.displayName === country)?.countryCode
  const regionId = regions?.find(item => item.label === region)?.regionId
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
    setCities(null)
    if (!enabled || !countryCode || !regionId) return
    let live = true
    all<City>('cities', { countryCode, regionId }).then(items => { if (live) setCities(items) }).catch(() => {})
    return () => { live = false }
  }, [enabled, countryCode, regionId])
  const sorted = (names: string[]) => [...new Set(names)].sort((a, b) => a.localeCompare(b))
  return {
    countries: countries?.length ? sorted(countries.map(item => item.displayName)) : null,
    regions: countryCode ? sorted(regions?.map(item => item.label) ?? []) : null,
    cities: regionId ? sorted(cities?.map(item => item.name) ?? []) : null,
  }
}
