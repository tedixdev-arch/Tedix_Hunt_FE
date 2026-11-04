import { useEffect, useState } from 'react'
import { geographyApi } from '../../../services/api/geography'
import type { LibraryGeography } from '../../../services/api/creatorContent'

export function geographyFallback(g: LibraryGeography): string {
  if (g.scope === 'universal') return 'Universal'
  const country = `Country ${g.countryCode}`
  return `${g.scope === 'city' ? `City ${g.geographicId}, ` : g.scope === 'region' ? `Region ${g.admin1Code}, ` : ''}${country} (catalog details unavailable)`
}
export async function geographicApplicability(g: LibraryGeography): Promise<string> {
  if (g.scope === 'universal') return 'Universal'
  if (g.scope === 'city') {
    try {
      const city = await geographyApi.city(g.geographicId)
      if (city.geographicId !== g.geographicId || city.countryCode !== g.countryCode || !city.name || !city.countryDisplayName) return geographyFallback(g)
      const region = city.regionStatus === 'resolved' && city.regionDisplayName
        ? city.regionDisplayName : `Region ${city.admin1Code || 'unspecified'} (catalog details unavailable)`
      return `${city.name}, ${region}, ${city.countryDisplayName}`
    } catch { return geographyFallback(g) }
  }
  let country = `Country ${g.countryCode} (catalog details unavailable)`
  try { country = (await geographyApi.countries()).countries.find(c => c.code === g.countryCode)?.displayName || country } catch { /* Retain the canonical country code. */ }
  if (g.scope === 'country') return country
  try {
    let after: string | undefined
    const seen = new Set<string>()
    do {
      const page = await geographyApi.regions(g.countryCode, after)
      const region = page.regions.find(r => r.countryCode === g.countryCode && r.admin1Code === g.admin1Code)
      if (region?.displayName) return `${region.displayName}, ${country}`
      after = page.nextAfter ?? undefined
      if (after && seen.has(after)) break
      if (after) seen.add(after)
    } while (after)
  } catch { /* Missing labels never replace or broaden saved applicability. */ }
  return `Region ${g.admin1Code} (catalog details unavailable), ${country}`
}
export function GeographicApplicability({ geography }: { geography: LibraryGeography }) {
  const key = JSON.stringify(geography)
  const [resolved, setResolved] = useState<{ key: string; label: string } | null>(null)
  useEffect(() => {
    let live = true
    void geographicApplicability(geography).then(label => { if (live) setResolved({ key, label }) })
    return () => { live = false }
  }, [key])
  return <span aria-label="Geographic applicability">{resolved?.key === key ? resolved.label : geographyFallback(geography)}</span>
}
